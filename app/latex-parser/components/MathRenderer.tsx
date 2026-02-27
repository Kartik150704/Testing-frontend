"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: (HTMLElement | null)[]) => Promise<void>;
      typesetClear?: (elements?: (HTMLElement | null)[]) => void;
      typeset?: (elements?: HTMLElement[]) => void;
      startup?: {
        promise?: Promise<void>;
        typeset?: boolean;
      };
      tex?: object;
      options?: object;
    };
  }
}

interface MathRendererProps {
  latex: string;
  className?: string;
  block?: boolean;
}

let mathJaxLoading = false;
const callbacks: (() => void)[] = [];

function loadMathJax(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (window.MathJax?.typesetPromise) {
      resolve();
      return;
    }

    callbacks.push(resolve);

    if (mathJaxLoading) {
      return;
    }

    mathJaxLoading = true;

    window.MathJax = {
      tex: {
        inlineMath: [
          ["$", "$"],
          ["\\(", "\\)"],
        ],
        displayMath: [
          ["$$", "$$"],
          ["\\[", "\\]"],
        ],
        processEscapes: true,
        processEnvironments: true,
        packages: { "[+]": ["textmacros"] },
        tags: "ams",
      },
      options: {
        skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
      },
      startup: {
        typeset: false,
      },
    } as typeof window.MathJax;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml-full.js";
    script.async = true;
    script.onload = () => {
      const checkReady = () => {
        if (window.MathJax?.typesetPromise) {
          const cbs = [...callbacks];
          callbacks.length = 0;
          cbs.forEach((cb) => cb());
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    };
    script.onerror = () => {
      console.error("Failed to load MathJax");
      mathJaxLoading = false;
      const cbs = [...callbacks];
      callbacks.length = 0;
      cbs.forEach((cb) => cb());
    };
    document.head.appendChild(script);
  });
}

function processLatex(input: string): string {
  return input
    .replace(/\\\\/g, "<br/>")
    .replace(/\\n/g, "<br/>")
    .replace(/\n/g, "<br/>");
}

export default function MathRenderer({
  latex,
  className = "",
  block = false,
}: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const renderMath = useCallback(async (container: HTMLDivElement, content: string) => {
    container.innerHTML = processLatex(content);

    await loadMathJax();

    if (window.MathJax?.typesetClear) {
      window.MathJax.typesetClear([container]);
    }
    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([container]);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !latex) {
      setIsReady(true);
      return;
    }

    let mounted = true;
    setIsReady(false);

    renderMath(container, latex)
      .catch((err) => console.error("MathJax rendering error:", err))
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [latex, renderMath]);

  if (!latex) {
    return null;
  }

  // Render an empty div — React must NOT manage children here.
  // The useEffect populates innerHTML and MathJax typesets it.
  // If React had children (e.g. {latex}), every re-render would
  // overwrite MathJax's output with raw text.
  return (
    <div
      ref={containerRef}
      className={`math-renderer ${block ? "block-math" : "inline-math"} ${className}`}
      style={{
        opacity: isReady ? 1 : 0.7,
        transition: "opacity 0.2s ease-in-out",
      }}
      suppressHydrationWarning
    />
  );
}
