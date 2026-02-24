"use client";

import { useState, useRef } from "react";
import { PDFControls, PDFUploader, PDFCanvas, usePDFViewer, ScreenProtection } from "./components";
import type { WatermarkMode, ScreenProtectionRef } from "./components";

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
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  const protectionRef = useRef<ScreenProtectionRef>(null);

  const handleTestProtection = () => {
    protectionRef.current?.simulateBlur();
  };

  return (
    <ScreenProtection
      ref={protectionRef}
      enabled={protectionEnabled}
      hideOnTabChange={true}
      blockPrintScreen={true}
      blockContextMenu={true}
      blockKeyboardShortcuts={true}
      blockDevTools={true}
      showWarningOnAttempt={true}
      screenshotBlackoutDuration={5000}
    >
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

          {/* Protection Toggle */}
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{protectionEnabled ? "🛡️" : "🔓"}</span>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Screen Capture Protection
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {protectionEnabled 
                    ? "Active - Screenshot shortcuts will be blocked" 
                    : "Disabled - Content is not protected"}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {protectionEnabled && (
                <button
                  onClick={handleTestProtection}
                  className="px-4 py-2 rounded-lg font-medium transition-all bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-2"
                >
                  <span>👁️</span>
                  Test Protection
                </button>
              )}
              <button
                onClick={() => setProtectionEnabled(!protectionEnabled)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  protectionEnabled
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
                }`}
              >
                {protectionEnabled ? "Disable" : "Enable"}
              </button>
            </div>
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
              Protection Features Active
            </h2>
            <ul className="list-inside list-disc space-y-1 text-amber-700 dark:text-amber-400">
              <li>Content hidden when switching browser tabs</li>
              <li>Win+Shift+S (Snipping Tool) triggers blackout screen</li>
              <li>PrintScreen key blocked</li>
              <li>Print (Ctrl+P) triggers blackout screen</li>
              <li>Right-click context menu disabled</li>
              <li>Developer tools shortcuts blocked</li>
              <li>Save (Ctrl+S) disabled</li>
              <li>Drag and drop disabled</li>
              <li>Text selection disabled</li>
              <li>Canvas rendering prevents text extraction</li>
              <li>Watermarks for content tracing</li>
            </ul>
          </div>

          <div className="mt-4 rounded-lg bg-zinc-200 p-4 dark:bg-zinc-800">
            <h2 className="mb-2 font-semibold text-zinc-700 dark:text-zinc-300">
              ⚠️ Important Note
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              These protections make casual copying harder but cannot prevent determined users. 
              Screenshots at the OS level, external cameras, or browser extensions can still capture content. 
              For truly sensitive content, consider server-side rendering with session-based access controls.
            </p>
          </div>
        </div>
      </div>
    </ScreenProtection>
  );
}
