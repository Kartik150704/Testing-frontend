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
        packages: { 
          "[+]": ["ams", "noerrors", "noundefined", "textmacros", "mathtools", "physics"]
        },
        tags: "ams",
        // Enable all math environments
        environments: {
          equation: ["equation", null],
          "equation*": ["equation*", null],
          align: ["align", null],
          "align*": ["align*", null],
          alignat: ["alignat", null],
          "alignat*": ["alignat*", null],
          gather: ["gather", null],
          "gather*": ["gather*", null],
          multline: ["multline", null],
          "multline*": ["multline*", null],
          split: ["split", null],
          array: ["array", null],
          matrix: ["matrix", null],
          pmatrix: ["pmatrix", null],
          bmatrix: ["bmatrix", null],
          Bmatrix: ["Bmatrix", null],
          vmatrix: ["vmatrix", null],
          Vmatrix: ["Vmatrix", null],
          cases: ["cases", null],
          eqnarray: ["eqnarray", null],
          "eqnarray*": ["eqnarray*", null],
        },
        macros: {
          // Common math macros
          RR: "\\mathbb{R}",
          NN: "\\mathbb{N}",
          ZZ: "\\mathbb{Z}",
          QQ: "\\mathbb{Q}",
          CC: "\\mathbb{C}",
        },
      },
      options: {
        skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
        ignoreHtmlClass: "tex2jax_ignore",
        processHtmlClass: "tex2jax_process",
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
  // Check if input contains math environments that need preservation
  const hasEnvironments = /\\begin\{(equation|align|gather|eqnarray|multline|split|array|matrix|pmatrix|bmatrix|cases|alignat)\*?\}/.test(input);
  
  if (hasEnvironments) {
    // For content with environments, preserve structure and only handle line breaks outside environments
    // Replace \\ that are NOT inside math environments with <br/>
    // Keep newlines for proper environment formatting
    return input.replace(/\n\n+/g, "<br/><br/>");
  }
  
  // For simple math without environments, handle line breaks normally
  return input
    .replace(/\\\\/g, "<br/>")
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
