interface PDFControlsProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  isLoading: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function PDFControls({
  currentPage,
  totalPages,
  scale,
  isLoading,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
}: PDFControlsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow dark:bg-zinc-800">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1 || isLoading}
          className="rounded-lg bg-zinc-200 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          Previous
        </button>
        <span className="text-zinc-700 dark:text-zinc-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="rounded-lg bg-zinc-200 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.5 || isLoading}
          className="rounded-lg bg-zinc-200 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          -
        </button>
        <span className="min-w-[60px] text-center text-zinc-700 dark:text-zinc-300">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          disabled={scale >= 3 || isLoading}
          className="rounded-lg bg-zinc-200 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          +
        </button>
      </div>

      {isLoading && (
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Rendering...
        </span>
      )}
    </div>
  );
}
