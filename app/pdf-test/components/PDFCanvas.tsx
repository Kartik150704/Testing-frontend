import { forwardRef } from "react";

export type WatermarkMode = "small" | "center" | "triple";

interface PDFCanvasProps {
  isVisible: boolean;
  isLoading: boolean;
  watermarkText?: string;
  watermarkMode?: WatermarkMode;
}

function SmallWatermarks({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8 p-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="whitespace-nowrap text-2xl font-bold text-gray-400/30 select-all"
          style={{
            transform: `rotate(-45deg)`,
            userSelect: "all",
            WebkitUserSelect: "all",
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}

function CenterWatermark({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        className="whitespace-nowrap text-6xl font-bold text-gray-400/40 select-all"
        style={{
          transform: `rotate(-45deg)`,
          userSelect: "all",
          WebkitUserSelect: "all",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function TripleWatermarks({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between py-16">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="whitespace-nowrap text-4xl font-bold text-gray-400/35 select-all"
          style={{
            transform: `rotate(-45deg)`,
            userSelect: "all",
            WebkitUserSelect: "all",
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}

export const PDFCanvas = forwardRef<HTMLCanvasElement, PDFCanvasProps>(
  function PDFCanvas({ 
    isVisible, 
    isLoading, 
    watermarkText = "VK Publications",
    watermarkMode = "small"
  }, ref) {
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
          <div className={`relative ${!isVisible ? "hidden" : ""}`}>
            <div
              className="pointer-events-none absolute inset-0 z-10 flex select-all items-center justify-center overflow-hidden"
              aria-hidden="true"
            >
              {watermarkMode === "small" && <SmallWatermarks text={watermarkText} />}
              {watermarkMode === "center" && <CenterWatermark text={watermarkText} />}
              {watermarkMode === "triple" && <TripleWatermarks text={watermarkText} />}
            </div>
            <canvas
              ref={ref}
              className="relative z-0 shadow-lg"
              style={{ backgroundColor: "white" }}
            />
          </div>
        </div>
      </div>
    );
  }
);
