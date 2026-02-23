"use client";

import { PDFControls, PDFUploader, PDFCanvas, usePDFViewer } from "./components";

export default function PDFTestPage() {
  const {
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
  } = usePDFViewer();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            PDF.js Canvas Renderer
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            This demo renders PDFs to a canvas element, preventing text selection.
            The PDF content is drawn as pixels, not selectable text.
          </p>
        </div>

        <PDFUploader
          onFileChange={handleFileChange}
          onLoadSample={loadSamplePDF}
          fileName={pdfFile?.name}
        />

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {pdfDoc && (
          <PDFControls
            currentPage={currentPage}
            totalPages={totalPages}
            scale={scale}
            isLoading={isLoading}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />
        )}

        <PDFCanvas
          ref={canvasRef}
          isVisible={!!pdfDoc}
          isLoading={isLoading}
        />

        <div className="mt-8 rounded-lg bg-amber-100 p-4 dark:bg-amber-900/30">
          <h2 className="mb-2 font-semibold text-amber-800 dark:text-amber-300">
            Why Canvas Rendering?
          </h2>
          <ul className="list-inside list-disc space-y-1 text-amber-700 dark:text-amber-400">
            <li>Text cannot be selected or copied from the rendered PDF</li>
            <li>Prevents easy extraction of PDF content</li>
            <li>Useful for protecting sensitive documents</li>
            <li>The PDF is rendered as pixels, not as DOM text elements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
