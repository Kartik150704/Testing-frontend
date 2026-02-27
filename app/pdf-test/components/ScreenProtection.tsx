"use client";

import { useEffect, useState, useCallback, ReactNode, useImperativeHandle, forwardRef, useRef } from "react";

interface ScreenProtectionProps {
  children: ReactNode;
  enabled?: boolean;
  hideOnTabChange?: boolean;
  blockPrintScreen?: boolean;
  blockContextMenu?: boolean;
  blockKeyboardShortcuts?: boolean;
  blockDevTools?: boolean;
  showWarningOnAttempt?: boolean;
  screenshotBlackoutDuration?: number;
}

export interface ScreenProtectionRef {
  simulateBlur: () => void;
}

export const ScreenProtection = forwardRef<ScreenProtectionRef, ScreenProtectionProps>(function ScreenProtection({
  children,
  enabled = true,
  hideOnTabChange = true,
  blockPrintScreen = true,
  blockContextMenu = true,
  blockKeyboardShortcuts = true,
  blockDevTools = true,
  showWarningOnAttempt = true,
  screenshotBlackoutDuration = 5000,
}, ref) {
  const [isTestMode, setIsTestMode] = useState(false);
  const [isScreenshotBlackout, setIsScreenshotBlackout] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const blackoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerScreenshotBlackout = useCallback((message: string) => {
    if (!enabled) return;
    
    if (blackoutTimeoutRef.current) {
      clearTimeout(blackoutTimeoutRef.current);
    }
    
    setIsScreenshotBlackout(true);
    
    if (showWarningOnAttempt) {
      setWarningMessage(message);
    }
    
    blackoutTimeoutRef.current = setTimeout(() => {
      setIsScreenshotBlackout(false);
      setWarningMessage(null);
    }, screenshotBlackoutDuration);
  }, [enabled, showWarningOnAttempt, screenshotBlackoutDuration]);

  useImperativeHandle(ref, () => ({
    simulateBlur: () => {
      if (!enabled) return;
      setIsTestMode(true);
      setIsScreenshotBlackout(true);
      setTimeout(() => {
        setIsScreenshotBlackout(false);
        setIsTestMode(false);
      }, 3000);
    },
  }), [enabled]);

  const showWarning = useCallback((message: string) => {
    if (!showWarningOnAttempt) return;
    setWarningMessage(message);
    setTimeout(() => setWarningMessage(null), 2000);
  }, [showWarningOnAttempt]);

  // Tab visibility change detection
  useEffect(() => {
    if (!enabled || !hideOnTabChange) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabHidden(true);
      } else {
        setTimeout(() => {
          setIsTabHidden(false);
        }, 300);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, hideOnTabChange]);

  // Print protection via beforeprint/afterprint events
  // Catches all print attempts including File > Print menu, not just Ctrl+P
  useEffect(() => {
    if (!enabled) return;

    const handleBeforePrint = () => {
      setIsScreenshotBlackout(true);
    };

    const handleAfterPrint = () => {
      setTimeout(() => {
        setIsScreenshotBlackout(false);
      }, 1000);
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [enabled]);

  // Inject @media print CSS to blank the page during printing
  useEffect(() => {
    if (!enabled) return;

    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        body::after {
          content: "Printing is not allowed";
          visibility: visible !important;
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          background: #fff;
          z-index: 99999;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!blockKeyboardShortcuts) return;

      // PrintScreen key — best-effort, works in some browsers
      if (blockPrintScreen && e.key === "PrintScreen") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - PrintScreen");
        return;
      }

      // Print (Ctrl+P / Cmd+P) — browser-level shortcut, reliably interceptable
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        triggerScreenshotBlackout("Print blocked");
        return;
      }

      // Dev tools shortcuts
      if (blockDevTools) {
        if (e.key === "F12") {
          e.preventDefault();
          showWarning("Developer tools are disabled");
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          showWarning("Developer tools are disabled");
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
          e.preventDefault();
          showWarning("View source is disabled");
          return;
        }
      }

      // Save (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !e.shiftKey) {
        e.preventDefault();
        showWarning("Saving is disabled");
        return;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (blockContextMenu) {
        e.preventDefault();
        showWarning("Right-click is disabled");
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      if (blackoutTimeoutRef.current) {
        clearTimeout(blackoutTimeoutRef.current);
      }
    };
  }, [enabled, blockPrintScreen, blockContextMenu, blockKeyboardShortcuts, blockDevTools, showWarning, triggerScreenshotBlackout]);

  const protectionStyles = enabled ? {
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    msUserSelect: "none" as const,
    WebkitTouchCallout: "none" as const,
  } : {};

  const shouldHideContent = isScreenshotBlackout || isTabHidden;

  return (
    <div className="relative" style={protectionStyles}>
      {warningMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-pulse">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium">
            ⚠️ {warningMessage}
          </div>
        </div>
      )}

      {isScreenshotBlackout && enabled && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">{isTestMode ? "🔒" : "🚫"}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isTestMode ? "Content Protected" : "Action Blocked"}
            </h2>
            <p className="text-gray-400">
              {isTestMode 
                ? "This is a preview - will restore in 3 seconds"
                : "This action is not allowed"}
            </p>
            {isTestMode && (
              <button
                onClick={() => {
                  setIsScreenshotBlackout(false);
                  setIsTestMode(false);
                }}
                className="mt-4 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close Preview
              </button>
            )}
          </div>
        </div>
      )}

      {isTabHidden && enabled && !isScreenshotBlackout && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">Content Protected</h2>
            <p className="text-gray-400">
              Return to this tab to view the content
            </p>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-100 ${shouldHideContent && enabled ? "blur-xl scale-95 opacity-0" : ""}`}
      >
        {children}
      </div>
    </div>
  );
});

export function useScreenProtection() {
  const [isProtected, setIsProtected] = useState(true);

  const enableProtection = useCallback(() => setIsProtected(true), []);
  const disableProtection = useCallback(() => setIsProtected(false), []);
  const toggleProtection = useCallback(() => setIsProtected(prev => !prev), []);

  return {
    isProtected,
    enableProtection,
    disableProtection,
    toggleProtection,
  };
}
