"use client";

import { useEffect, useState, useCallback, ReactNode, useImperativeHandle, forwardRef, useRef } from "react";

interface ScreenProtectionProps {
  children: ReactNode;
  enabled?: boolean;
  blurOnHidden?: boolean;
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
  blurOnHidden = true,
  blockPrintScreen = true,
  blockContextMenu = true,
  blockKeyboardShortcuts = true,
  blockDevTools = true,
  showWarningOnAttempt = true,
  screenshotBlackoutDuration = 3000,
}, ref) {
  const [isHidden, setIsHidden] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isScreenshotBlackout, setIsScreenshotBlackout] = useState(false);
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
    setIsHidden(true);
    
    if (showWarningOnAttempt) {
      setWarningMessage(message);
    }
    
    // Auto-restore after duration
    blackoutTimeoutRef.current = setTimeout(() => {
      setIsScreenshotBlackout(false);
      setIsHidden(false);
      setWarningMessage(null);
    }, screenshotBlackoutDuration);
  }, [enabled, showWarningOnAttempt, screenshotBlackoutDuration]);

  // Expose simulateBlur method via ref
  useImperativeHandle(ref, () => ({
    simulateBlur: () => {
      if (!enabled) return;
      setIsTestMode(true);
      setIsHidden(true);
      setTimeout(() => {
        setIsHidden(false);
        setIsTestMode(false);
      }, 3000);
    },
  }), [enabled]);

  const showWarning = useCallback((message: string) => {
    if (!showWarningOnAttempt) return;
    setWarningMessage(message);
    setTimeout(() => setWarningMessage(null), 2000);
  }, [showWarningOnAttempt]);

  useEffect(() => {
    if (!enabled) return;

    // Track if we triggered blackout from blur (to know when to restore)
    let blurTriggeredBlackout = false;

    // 1. Visibility Change Detection - blur content when tab is not visible
    const handleVisibilityChange = () => {
      console.log("👁️ Visibility changed:", { hidden: document.hidden });
      if (blurOnHidden) {
        if (document.hidden) {
          // Immediately blackout when tab becomes hidden
          setIsScreenshotBlackout(true);
          setIsHidden(true);
          blurTriggeredBlackout = true;
          showWarning("Content hidden - screenshot protection active");
        }
      }
    };

    // 2. Window blur detection (switching apps, screenshot tools opening)
    // This is our MAIN defense against Cmd+Shift+4 - when the screenshot
    // selection tool opens, the browser loses focus
    const handleWindowBlur = () => {
      console.log("🔴 Window BLUR detected");
      if (blurOnHidden) {
        // Immediately blackout - this catches screenshot tools
        setIsScreenshotBlackout(true);
        setIsHidden(true);
        blurTriggeredBlackout = true;
        showWarning("Content hidden - screenshot protection active");
      }
    };

    const handleWindowFocus = () => {
      console.log("🟢 Window FOCUS detected");
      if (blurOnHidden && blurTriggeredBlackout) {
        // Delay restoration slightly to ensure screenshot is of black screen
        setTimeout(() => {
          setIsScreenshotBlackout(false);
          setIsHidden(false);
          blurTriggeredBlackout = false;
          setWarningMessage(null);
        }, 500);
      }
    };

    // 3. Block keyboard shortcuts for screenshots and dev tools
    // Using keydown for instant detection
    const handleKeyDown = (e: KeyboardEvent) => {
      // DEBUG: Log all key presses to console
      console.log("🎹 Key pressed:", {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        metaKey: e.metaKey,   // Cmd on Mac, Win on Windows
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,     // Option on Mac
        repeat: e.repeat,
      });

      if (!blockKeyboardShortcuts) return;

      // ============ SCREENSHOT SHORTCUTS - INSTANT BLACKOUT ============
      
      // PrintScreen key (Windows)
      if (blockPrintScreen && e.key === "PrintScreen") {
        console.log("🚫 Detected: PrintScreen");
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - PrintScreen");
        return;
      }

      // Windows: Win + Shift + S (Snipping Tool)
      if (e.shiftKey && e.metaKey && e.key.toLowerCase() === "s") {
        console.log("🚫 Detected: Win+Shift+S (Snipping Tool)");
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Snipping Tool");
        return;
      }

      // Windows: Win + PrtScn
      if (e.metaKey && e.key === "PrintScreen") {
        console.log("🚫 Detected: Win+PrintScreen");
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Win+PrintScreen");
        return;
      }

      // Mac: Cmd + Shift + 3 (Full screen screenshot)
      if (e.metaKey && e.shiftKey && e.key === "3") {
        console.log("🚫 Detected: Cmd+Shift+3");
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+3");
        return;
      }

      // Mac: Cmd + Shift + 4 (Selection screenshot)
      if (e.metaKey && e.shiftKey && e.key === "4") {
        console.log("🚫 Detected: Cmd+Shift+4");
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+4");
        return;
      }

      // Mac: Cmd + Shift + 5 (Screenshot/Recording menu)
      if (e.metaKey && e.shiftKey && e.key === "5") {
        console.log("🚫 Detected: Cmd+Shift+5");
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+5");
        return;
      }

      // Mac: Cmd + Shift + 6 (Touch Bar screenshot)
      if (e.metaKey && e.shiftKey && e.key === "6") {
        console.log("🚫 Detected: Cmd+Shift+6");
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Cmd+Shift+6");
        return;
      }

      // Mac: Ctrl + Cmd + Shift + 3 (Screenshot to clipboard)
      if (e.ctrlKey && e.metaKey && e.shiftKey && e.key === "3") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Ctrl+Cmd+Shift+3");
        return;
      }

      // Mac: Ctrl + Cmd + Shift + 4 (Selection to clipboard)
      if (e.ctrlKey && e.metaKey && e.shiftKey && e.key === "4") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Ctrl+Cmd+Shift+4");
        return;
      }

      // Linux: Various screenshot shortcuts
      // Gnome: Print, Alt+Print, Shift+Print
      if (e.altKey && e.key === "PrintScreen") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Alt+PrintScreen");
        return;
      }

      if (e.shiftKey && e.key === "PrintScreen") {
        e.preventDefault();
        triggerScreenshotBlackout("Screenshot blocked - Shift+PrintScreen");
        return;
      }

      // ============ OTHER BLOCKED SHORTCUTS ============

      // Block Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        triggerScreenshotBlackout("Print blocked - Ctrl/Cmd+P");
        return;
      }

      // Block Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !e.shiftKey) {
        e.preventDefault();
        showWarning("Saving is disabled");
        return;
      }

      // Block Dev Tools shortcuts
      if (blockDevTools) {
        // F12
        if (e.key === "F12") {
          e.preventDefault();
          showWarning("Developer tools are disabled");
          return;
        }

        // Ctrl+Shift+I / Cmd+Option+I (Dev Tools)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "i") {
          e.preventDefault();
          showWarning("Developer tools are disabled");
          return;
        }

        // Ctrl+Shift+J / Cmd+Option+J (Console)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "j") {
          e.preventDefault();
          showWarning("Developer tools are disabled");
          return;
        }

        // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
          e.preventDefault();
          showWarning("Inspect element is disabled");
          return;
        }

        // Ctrl+U / Cmd+U (View Source)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
          e.preventDefault();
          showWarning("View source is disabled");
          return;
        }
      }
    };

    // 4. Block context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      if (blockContextMenu) {
        e.preventDefault();
        showWarning("Right-click is disabled");
      }
    };

    // 5. Detect dev tools opening via resize (not foolproof but adds friction)
    let devToolsOpen = false;
    const detectDevTools = () => {
      if (!blockDevTools || isScreenshotBlackout) return;
      
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          setIsHidden(true);
          showWarning("Content hidden - developer tools detected");
        }
      } else {
        if (devToolsOpen) {
          devToolsOpen = false;
          setIsHidden(false);
        }
      }
    };

    // 6. Block drag events (prevents dragging images)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      showWarning("Dragging is disabled");
    };

    // Add event listeners - use capture phase for faster response
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    // Also listen on document for blur (backup)
    document.addEventListener("blur", handleWindowBlur, { capture: true });
    document.addEventListener("focus", handleWindowFocus, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    
    const resizeInterval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("blur", handleWindowBlur, { capture: true });
      document.removeEventListener("focus", handleWindowFocus, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      clearInterval(resizeInterval);
      if (blackoutTimeoutRef.current) {
        clearTimeout(blackoutTimeoutRef.current);
      }
    };
  }, [enabled, blurOnHidden, blockPrintScreen, blockContextMenu, blockKeyboardShortcuts, blockDevTools, showWarning, triggerScreenshotBlackout]);

  // CSS to prevent selection and other interactions
  const protectionStyles = enabled ? {
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    msUserSelect: "none" as const,
    WebkitTouchCallout: "none" as const,
  } : {};

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
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-white mb-2">Screenshot Blocked</h2>
            <p className="text-gray-400">
              Screen capture is not allowed
            </p>
          </div>
        </div>
      )}

      {/* Blur overlay when hidden (focus lost, not screenshot) */}
      {isHidden && enabled && !isScreenshotBlackout && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">Content Protected</h2>
            <p className="text-gray-300">
              {isTestMode 
                ? "This is a preview - content will restore in 3 seconds"
                : "Return focus to this window to view the content"}
            </p>
            {isTestMode && (
              <button
                onClick={() => {
                  setIsHidden(false);
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

      {/* Protected content with blur when hidden */}
      <div
        className={`transition-all duration-100 ${(isHidden || isScreenshotBlackout) && enabled ? "blur-xl scale-95 opacity-0" : ""}`}
      >
        {children}
      </div>
    </div>
  );
});

export type { ScreenProtectionRef };

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
