interface PDFUploaderProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSample: () => void;
  fileName?: string;
}

export function PDFUploader({ onFileChange, onLoadSample, fileName }: PDFUploaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Upload PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={onLoadSample}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-white transition-colors hover:bg-zinc-600"
        >
          Load Sample PDF
        </button>
      </div>

      {fileName && (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Loaded: <span className="font-medium">{fileName}</span>
        </p>
      )}
    </div>
  );
}
