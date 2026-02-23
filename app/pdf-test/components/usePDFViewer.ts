"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type PDFJSLib = typeof import("pdfjs-dist");
type PDFDocumentProxy = Awaited<ReturnType<PDFJSLib["getDocument"]>["promise"]>;
type RenderTask = ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]>;

export function usePDFViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<PDFJSLib | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    const loadPdfJs = async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      setPdfjsLib(pdfjs);
    };
    loadPdfJs();
  }, []);

  const renderPage = useCallback(
    async (pageNum: number, pdf: PDFDocumentProxy) => {
      if (!canvasRef.current) return;

      setIsLoading(true);

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          canvas: canvas,
          transform: transform,
          viewport: viewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
      } catch (err) {
        if (err instanceof Error && err.name !== "RenderingCancelledException") {
          console.error("Error rendering page:", err);
          setError("Failed to render page");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [scale]
  );

  const loadPDF = useCallback(
    async (source: string | ArrayBuffer) => {
      if (!pdfjsLib) return;

      setIsLoading(true);
      setError(null);

      try {
        const loadingTask = pdfjsLib.getDocument(source);
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);

        await renderPage(1, pdf);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF. Please try another file.");
      } finally {
        setIsLoading(false);
      }
    },
    [renderPage, pdfjsLib]
  );

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage, pdfDoc);
    }
  }, [currentPage, scale, pdfDoc, renderPage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pdfjsLib) return;

    if (file.type !== "application/pdf") {
      setError("Please select a valid PDF file");
      return;
    }

    setPdfFile(file);
    const arrayBuffer = await file.arrayBuffer();
    loadPDF(arrayBuffer);
  };

  const loadSamplePDF = () => {
    loadPDF("https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf");
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  return {
    canvasRef,
    pdfDoc,
    currentPage,
    totalPages,
    scale,
    isLoading,
    error,
    pdfFile,
    handleFileChange,
    loadSamplePDF,
    goToPrevPage,
    goToNextPage,
    zoomIn,
    zoomOut,
  };
}
