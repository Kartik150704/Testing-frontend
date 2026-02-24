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

  // Instant blackout for screenshot attempts
  const triggerScreenshotBlackout = useCallback((message: string) => {
    if (!enabled) return;
    
    // Clear any existing timeout
    if (blackoutTimeoutRef.current) {
      clearTimeout(blackoutTimeoutRef.current);
    }
    
    // Immediately blackout
    setIsScreenshotBlackout(true);
    
    if (showWarningOnAttempt) {
      setWarningMessage(message);
    }
    
    // Auto-restore after duration
    blackoutTimeoutRef.current = setTimeout(() => {
      setIsScreenshotBlackout(false);
      setWarningMessage(null);
    }, screenshotBlackoutDuration);
  }, [enabled, showWarningOnAttempt, screenshotBlackoutDuration]);

  // Expose simulateBlur method via ref (for testing)
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

  // Tab visibility change detection (separate from keyboard shortcuts)
  useEffect(() => {
    if (!enabled || !hideOnTabChange) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabHidden(true);
      } else {
        // Small delay before showing content again
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

  useEffect(() => {
    if (!enabled) return;

    // Only trigger on ACTUAL screenshot keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!blockKeyboardShortcuts) return;

      // ============ SCREENSHOT SHORTCUTS - INSTANT BLACKOUT ============
      
      // PrintScreen key (Windows)
      if (blockPrintScreen && e.key === "PrintScreen") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - PrintScreen");
        return;
      }

      // Windows: Win + Shift + S (Snipping Tool)
      if (e.shiftKey && e.metaKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Snipping Tool");
        return;
      }

      // Windows: Win + PrtScn
      if (e.metaKey && e.key === "PrintScreen") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Win+PrintScreen");
        return;
      }

      // Mac: Cmd + Shift + 3 (Full screen screenshot)
      if (e.metaKey && e.shiftKey && e.key === "3") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+3");
        return;
      }

      // Mac: Cmd + Shift + 4 (Selection screenshot)
      if (e.metaKey && e.shiftKey && e.key === "4") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+4");
        return;
      }

      // Mac: Cmd + Shift + 5 (Screenshot/Recording menu)
      if (e.metaKey && e.shiftKey && e.key === "5") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+5");
        return;
      }

      // Mac: Cmd + Shift + 6 (Touch Bar screenshot)
      if (e.metaKey && e.shiftKey && e.key === "6") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+6");
        return;
      }

      // Mac: Ctrl + Cmd + Shift + 3/4 (Screenshot to clipboard)
      if (e.ctrlKey && e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked");
        return;
      }

      // Linux: Alt+Print, Shift+Print
      if ((e.altKey || e.shiftKey) && e.key === "PrintScreen") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked");
        return;
      }

      // ============ PRINT BLOCKED ============
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        triggerScreenshotBlackout("Print blocked");
        return;
      }

      // ============ DEV TOOLS BLOCKED (just warning, no blackout) ============
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

      // Block Ctrl+S / Cmd+S (Save) - just warning
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !e.shiftKey) {
        e.preventDefault();
        showWarning("Saving is disabled");
        return;
      }
    };

    // Block context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      if (blockContextMenu) {
        e.preventDefault();
        showWarning("Right-click is disabled");
      }
    };

    // Block drag events
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Add event listeners
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

  // CSS to prevent selection
  const protectionStyles = enabled ? {
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    msUserSelect: "none" as const,
    WebkitTouchCallout: "none" as const,
  } : {};

  // Determine if content should be hidden
  const shouldHideContent = isScreenshotBlackout || isTabHidden;

  return (
    <div className="relative" style={protectionStyles}>
      {/* Warning Toast */}
      {warningMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-pulse">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium">
            ⚠️ {warningMessage}
          </div>
        </div>
      )}

      {/* Screenshot blackout overlay - completely black */}
      {isScreenshotBlackout && enabled && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">{isTestMode ? "🔒" : "🚫"}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isTestMode ? "Content Protected" : "Screenshot Blocked"}
            </h2>
            <p className="text-gray-400">
              {isTestMode 
                ? "This is a preview - will restore in 3 seconds"
                : "Screen capture is not allowed"}
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

      {/* Tab hidden overlay - shown when user switches tabs */}
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

      {/* Protected content */}
      <div
        className={`transition-all duration-100 ${shouldHideContent && enabled ? "blur-xl scale-95 opacity-0" : ""}`}
      >
        {children}
      </div>
    </div>
  );
});

// Hook for programmatic control
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
