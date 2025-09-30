import React, { useRef, useCallback, useEffect, useState } from 'react';
import './portrait-fullscreen.css';

/**
 * PortraitFullscreenH5P - A reusable React component for portrait fullscreen H5P content
 * 
 * Provides a user-triggered button that puts H5P content into fullscreen mode
 * with portrait orientation lock and CSS fallbacks.
 * 
 * Usage:
 * ```jsx
 * import PortraitFullscreenH5P from './PortraitFullscreenH5P';
 * import './portrait-fullscreen.css';
 * 
 * function MyH5PPage() {
 *   return (
 *     <PortraitFullscreenH5P targetSelector=".h5p-container">
 *       <div className="h5p-host">
 *         <div className="h5p-container">...H5P content...</div>
 *       </div>
 *     </PortraitFullscreenH5P>
 *   );
 * }
 * ```
 */
export default function PortraitFullscreenH5P({
  children,
  targetSelector = null,
  buttonLabel = "Enter portrait fullscreen",
  className = "",
  onError = null,
  controlsEnabled = true
}) {
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper to log debug info
  const debugLog = useCallback((message, ...args) => {
    console.info(`[PortraitFullscreenH5P] ${message}`, ...args);
  }, []);

  // Helper to handle errors
  const handleError = useCallback((error) => {
    const errorMsg = error instanceof Error ? error.message : String(error);
    debugLog('Error:', errorMsg);
    if (onError) {
      onError(error);
    }
  }, [onError, debugLog]);

  // Find the target element for fullscreen
  const findTargetElement = useCallback(() => {
    if (!wrapperRef.current) return null;

    let target = null;

    if (targetSelector) {
      target = wrapperRef.current.querySelector(targetSelector);
      if (target) {
        debugLog(`Found target using selector "${targetSelector}"`);
        return target;
      }
      debugLog(`Target selector "${targetSelector}" not found, falling back to auto-detection`);
    }

    // Auto-detection fallback: try common H5P selectors
    const fallbackSelectors = ['.h5p-iframe', '.h5p-container', 'iframe'];
    for (const selector of fallbackSelectors) {
      target = wrapperRef.current.querySelector(selector);
      if (target) {
        debugLog(`Auto-detected target using "${selector}"`);
        return target;
      }
    }

    // Final fallback: use the wrapper itself
    debugLog('No H5P target found, using wrapper element');
    return wrapperRef.current;
  }, [targetSelector, debugLog]);

  // Request fullscreen with cross-browser support
  const requestFullscreen = useCallback(async (element) => {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
      debugLog('Fullscreen request successful');
    } catch (error) {
      throw new Error(`Failed to enter fullscreen: ${error.message}`);
    }
  }, [debugLog]);

  // Lock orientation to portrait with fallbacks
  const lockOrientation = useCallback(async () => {
    try {
      // Modern Screen Orientation API
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('portrait');
        debugLog('Portrait orientation locked (Screen Orientation API)');
        return;
      }

      // Legacy screen.lockOrientation (deprecated but still supported)
      const lockFn = screen.lockOrientation || 
                    screen.mozLockOrientation || 
                    screen.msLockOrientation;
      
      if (lockFn) {
        const success = lockFn('portrait');
        if (success) {
          debugLog('Portrait orientation locked (legacy API)');
          return;
        }
      }

      // No orientation lock support
      debugLog('Orientation lock not supported - relying on CSS fallbacks');
    } catch (error) {
      debugLog('Orientation lock failed, continuing with CSS fallbacks:', error.message);
    }
  }, [debugLog]);

  // Unlock orientation
  const unlockOrientation = useCallback(() => {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
        debugLog('Orientation unlocked');
      } else {
        const unlockFn = screen.unlockOrientation || 
                        screen.mozUnlockOrientation || 
                        screen.msUnlockOrientation;
        if (unlockFn) {
          unlockFn();
          debugLog('Orientation unlocked (legacy API)');
        }
      }
    } catch (error) {
      debugLog('Orientation unlock failed:', error.message);
    }
  }, [debugLog]);

  // Apply CSS class for portrait fullscreen
  const applyCSSFallback = useCallback(() => {
    document.documentElement.classList.add('h5p-portrait-fullscreen-active');
    debugLog('Applied CSS fallback class');
  }, [debugLog]);

  // Remove CSS class
  const removeCSSFallback = useCallback(() => {
    document.documentElement.classList.remove('h5p-portrait-fullscreen-active');
    debugLog('Removed CSS fallback class');
  }, [debugLog]);

  // Handle fullscreen change events
  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.msFullscreenElement
    );

    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen) {
      // User exited fullscreen
      debugLog('Fullscreen exited, cleaning up');
      unlockOrientation();
      removeCSSFallback();
    }
  }, [unlockOrientation, removeCSSFallback, debugLog]);

  // Main function to enter portrait fullscreen
  const enterPortraitFullscreen = useCallback(async () => {
    try {
      const target = findTargetElement();
      if (!target) {
        throw new Error('No target element found for fullscreen');
      }

      debugLog('Entering portrait fullscreen...');

      // Apply CSS fallback immediately
      applyCSSFallback();

      // Request fullscreen
      await requestFullscreen(target);

      // Lock orientation (async, non-blocking)
      lockOrientation().catch(error => {
        debugLog('Orientation lock failed but continuing:', error.message);
      });

      setIsFullscreen(true);
      debugLog('Portrait fullscreen activated');

    } catch (error) {
      // Clean up on failure
      removeCSSFallback();
      handleError(error);
    }
  }, [
    findTargetElement, 
    applyCSSFallback, 
    requestFullscreen, 
    lockOrientation, 
    removeCSSFallback, 
    handleError, 
    debugLog
  ]);

  // Set up event listeners for fullscreen changes
  useEffect(() => {
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'];
    
    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
      
      // Cleanup on unmount
      if (isFullscreen) {
        unlockOrientation();
        removeCSSFallback();
      }
    };
  }, [handleFullscreenChange, isFullscreen, unlockOrientation, removeCSSFallback]);

  return (
    <div ref={wrapperRef} className={`portrait-fullscreen-wrapper ${className}`.trim()}>
      {controlsEnabled && (
        <div className="portrait-controls">
          <button
            type="button"
            className="portrait-fullscreen-btn"
            onClick={enterPortraitFullscreen}
            disabled={isFullscreen}
            aria-label={buttonLabel}
            title={isFullscreen ? "Currently in fullscreen" : buttonLabel}
          >
            {isFullscreen ? "📱 Fullscreen Active" : "📱 Portrait Fullscreen"}
          </button>
        </div>
      )}
      {children}
    </div>
  );
}