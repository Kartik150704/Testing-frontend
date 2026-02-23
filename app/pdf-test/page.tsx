"use client";

import { useState } from "react";
import { PDFControls, PDFUploader, PDFCanvas, usePDFViewer } from "./components";
import type { WatermarkMode } from "./components";

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

  const [watermarkMode, setWatermarkMode] = useState<WatermarkMode>("small");

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
          <>
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

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow dark:bg-zinc-800">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Watermark Style:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setWatermarkMode("small")}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    watermarkMode === "small"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                  }`}
                >
                  Small (Repeating)
                </button>
                <button
                  onClick={() => setWatermarkMode("center")}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    watermarkMode === "center"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                  }`}
                >
                  Big (Center)
                </button>
                <button
                  onClick={() => setWatermarkMode("triple")}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    watermarkMode === "triple"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                  }`}
                >
                  Triple (3 Lines)
                </button>
              </div>
            </div>
          </>
        )}

        <PDFCanvas
          ref={canvasRef}
          isVisible={!!pdfDoc}
          isLoading={isLoading}
          watermarkText="VK Publications"
          watermarkMode={watermarkMode}
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
            <li>Watermark overlay gets selected when attempting to copy content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
