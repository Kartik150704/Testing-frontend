import { forwardRef } from "react";

interface PDFCanvasProps {
  isVisible: boolean;
  isLoading: boolean;
}

export const PDFCanvas = forwardRef<HTMLCanvasElement, PDFCanvasProps>(
  function PDFCanvas({ isVisible, isLoading }, ref) {
    return (
      <div className="relative overflow-auto rounded-lg bg-zinc-300 p-4 dark:bg-zinc-700">
        {!isVisible && !isLoading && (
          <div className="flex h-96 items-center justify-center text-zinc-500 dark:text-zinc-400">
            Upload a PDF or load the sample to view it here
          </div>
        )}

        {isLoading && !isVisible && (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        <div className="flex justify-center">
          <canvas
            ref={ref}
            className={`shadow-lg ${!isVisible ? "hidden" : ""}`}
            style={{ backgroundColor: "white" }}
          />
        </div>
      </div>
    );
  }
);
