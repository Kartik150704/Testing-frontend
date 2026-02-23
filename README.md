This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## PDF.js Canvas Viewer

This project includes a PDF viewer implementation using [PDF.js](https://mozilla.github.io/pdf.js/) that renders PDFs to a canvas element, preventing text selection and copying.

### How It Works

The PDF viewer renders PDF documents as pixels on an HTML canvas rather than as selectable DOM text elements. This approach:

- **Prevents text selection**: Users cannot select or copy text from the rendered PDF
- **Protects document content**: Makes it harder to extract text programmatically
- **Supports watermarking**: Overlays selectable watermarks that get copied instead of PDF content

### Architecture

The implementation is located in `app/pdf-test/` and consists of:

| Component | Description |
|-----------|-------------|
| `usePDFViewer.ts` | Custom React hook that manages PDF loading, rendering, and navigation state |
| `PDFCanvas.tsx` | Canvas component with watermark overlay support |
| `PDFControls.tsx` | Navigation and zoom controls |
| `PDFUploader.tsx` | File upload interface |
| `page.tsx` | Main page component |

### Key Implementation Details

1. **Dynamic Import**: PDF.js is loaded dynamically on the client side to avoid SSR issues with browser-only APIs like `DOMMatrix`

2. **Web Worker**: PDF parsing runs in a separate web worker thread for better performance:
   ```typescript
   pdfjs.GlobalWorkerOptions.workerSrc = new URL(
     "pdfjs-dist/build/pdf.worker.min.mjs",
     import.meta.url
   ).toString();
   ```

3. **High-DPI Rendering**: The canvas scales based on `devicePixelRatio` for crisp rendering on retina displays

4. **Render Task Management**: Previous render tasks are cancelled before starting new ones to prevent race conditions

5. **Watermark Modes**: Three watermark styles are available:
   - `small`: Repeating diagonal watermarks across the page
   - `center`: Single large centered watermark
   - `triple`: Three watermarks positioned vertically

### Usage

Navigate to `/pdf-test` to use the PDF viewer. You can:
- Upload a local PDF file
- Load a sample PDF from Mozilla's PDF.js demo
- Navigate between pages
- Zoom in/out (0.5x to 3x scale)
- Switch between watermark styles

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
