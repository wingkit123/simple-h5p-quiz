import React, { useEffect, useRef, useCallback } from "react";
import { ensureH5PGlobals } from "../utils/h5pLoader";
import useXapiTracker from "../hooks/useXapiTracker";
import PortraitFullscreenH5P from "./PortraitFullscreenH5P";

// Helper function for logging
const logDebug = (debug, ...messages) => {
  if (debug) console.log(...messages);
};

// Extract activity ID from h5p path
const getActivityId = (h5pPath) => {
  return h5pPath.split('/').pop() || 'unknown-activity';
};

// Setup H5P event listeners for custom events not covered by useXapiTracker
const setupH5PEventListeners = (h5pInstance, activityId, debug) => {
  logDebug(debug, '[H5P Events] Setting up custom event listeners for activity:', activityId);
  
  // Note: Main xAPI events are now handled by useXapiTracker hook automatically
  // Only handle custom personality quiz events here as they don't emit standard xAPI

  // Personality Quiz library does NOT emit built-in xAPI; bridge custom events
  try {
    if (h5pInstance && h5pInstance.on) {
      h5pInstance.on('personality-quiz-answer', (data) => {
        logDebug(debug, '[H5P Events] Personality quiz answer:', data);
      });
      h5pInstance.on('personality-quiz-completed', () => {
        logDebug(debug, '[H5P Events] Personality quiz completed');
      });
      logDebug(debug, '[H5P Events] Personality quiz custom event bridge active');
    }
  } catch (e) {
    console.error('[H5P Events] Failed setting up personality quiz bridges', e);
  }
};

export default function H5PPlayer({
  h5pPath = "/h5p/my-interactive",
  playerBase = "/assets/h5p-player",
  embedType = "iframe",
  retryCount = 40,
  retryInterval = 200,
  debug = false,
}) {
  const containerRef = useRef(null);
  const pathRef = useRef(h5pPath);
  const wrapperRef = useRef(null);
  
  // Initialize xAPI tracking hook - this handles all the main xAPI events now
  const { isListening } = useXapiTracker();
  
  if (debug && isListening) {
    logDebug(debug, '[xAPI] Tracker is listening for events');
  }

  // Dynamic viewport height fix for mobile browser UI chrome
  const applyDynamicVh = useCallback(() => {
    const viewportH = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const vh = viewportH * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, []);

  const setExplicitHeights = useCallback((wrapper) => {
    if (!wrapper) return;
    const viewportH = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const viewportW = (window.visualViewport ? window.visualViewport.width : window.innerWidth);
    
    wrapper.style.width = viewportW + 'px';
    wrapper.style.height = viewportH + 'px';
    
    const iframe = wrapper.querySelector('iframe');
    if (iframe) {
      iframe.style.width = viewportW + 'px';
      iframe.style.height = viewportH + 'px';
    }
  }, []);

  // Toggle fullscreen class on wrapper
  const handleFsChange = useCallback(() => {
    const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
  if (fsElement && wrapper.contains(fsElement)) {
      wrapper.classList.add('is-fullscreen');
      document.body.style.overflow = 'hidden';
      const root = document.getElementById('root');
      if (root) root.classList.add('root-fullscreen-adjust');
      applyDynamicVh();
      setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
      setExplicitHeights(wrapper);
      setTimeout(() => setExplicitHeights(wrapper), 250);
      setTimeout(() => setExplicitHeights(wrapper), 800);
    } else {
      wrapper.classList.remove('is-fullscreen');
      document.documentElement.style.removeProperty('--vh');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
      wrapper.style.removeProperty('width');
      wrapper.style.removeProperty('height');
      const iframe = wrapper.querySelector('iframe');
      if (iframe) {
        iframe.style.removeProperty('width');
        iframe.style.removeProperty('height');
      }
      document.body.style.overflow = '';
      const root = document.getElementById('root');
      if (root) root.classList.remove('root-fullscreen-adjust');
    }
  }, [applyDynamicVh, setExplicitHeights]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentPath = h5pPath;
      pathRef.current = currentPath;
      logDebug(debug, "[H5PPlayer] Mounting content from", currentPath);

      try {
        const probe = await fetch(`${currentPath}/h5p.json?cb=${Date.now()}`);
        if (!probe.ok) {
          console.error(`[H5PPlayer] h5p.json not found (status ${probe.status}) at ${currentPath}/h5p.json`);
          return;
        }
      } catch (e) {
        console.error("[H5PPlayer] Failed to fetch h5p.json:", e);
        return;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      try {
        let frameBundle;
        let frameCss;
        try {
          const globals = await ensureH5PGlobals({ playerBase, retryCount, retryInterval });
          frameBundle = globals.frameBundle;
          frameCss = globals.frameCss;
        } catch (e) {
          console.error('[H5PPlayer] Failed ensuring globals', e);
          return;
        }

        const Constructor = window.H5PStandalone?.H5P;
        if (!Constructor) {
          console.error('[H5PPlayer] H5P constructor missing');
          return;
        }

        const options = { h5pJsonPath: currentPath, frameJs: frameBundle, frameCss, embedType };
        logDebug(debug, "[H5PPlayer] Initializing with options", options);

        try {
          const h5pInstance = new Constructor(containerRef.current, options);
          logDebug(debug, "[H5PPlayer] Initialized content for", currentPath);
          
          const activityId = getActivityId(currentPath);
          const activityName = activityId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          logDebug(debug, '[H5P Events] Activity started:', activityId, activityName);
          
          setupH5PEventListeners(h5pInstance, activityId, debug);
        } catch {
          const activityId = getActivityId(currentPath);
          const activityName = activityId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          logDebug(debug, '[H5P Events] Activity started (delayed):', activityId, activityName);
        }

        setTimeout(() => {
          if (!cancelled && containerRef.current && containerRef.current.innerHTML.trim() === "") {
            logDebug(debug, "[H5PPlayer] Container still empty after initialization. Check console/network for errors.");
          }
        }, 300);
      } catch (err) {
        if (!cancelled) console.error("[H5PPlayer] unexpected error:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [h5pPath, playerBase, embedType, retryCount, retryInterval, debug]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('msfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('msfullscreenchange', handleFsChange);
    };
  }, [handleFsChange]);

  return (
    <div ref={wrapperRef} className="h5p-wrapper" key={h5pPath} style={{ position: 'relative' }}>
            <PortraitFullscreenH5P
        targetSelector=".h5p-container"
        controlsEnabled={true}
      >
        <div ref={containerRef} className="h5p-container" />
      </PortraitFullscreenH5P>
    </div>
  );
}
