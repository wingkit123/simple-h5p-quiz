import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useXapiTracker - React hook for capturing H5P xAPI statements and tracking progress
 * 
 * Features:
 * - Listens for xAPI events from H5P activities
 * - Stores all statements in localStorage
 * - Tracks progress with completion percentages
 * - Calculates summary statistics
 * - Handles cleanup and error recovery
 * 
 * @returns {Object} { getRecords, clearRecords, getProgress, getProgressSummary, isListening }
 */
export default function useXapiTracker() {
  const [isListening, setIsListening] = useState(false);
  const cleanupRef = useRef(null);
  const h5pListenerRef = useRef(null);
  const initTimeoutRef = useRef(null);

  // Storage keys
  const XAPI_RECORDS_KEY = 'xapiRecords';
  const PROGRESS_KEY = 'h5p-progress';
  const PROGRESS_SUMMARY_KEY = 'h5p-progress-summary';

  // Helper to safely parse JSON from localStorage
  const safeParseJSON = useCallback((key, fallback = []) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      console.warn(`[useXapiTracker] Failed to parse localStorage key "${key}":`, error);
      return fallback;
    }
  }, []);

  // Helper to safely store JSON to localStorage
  const safeStoreJSON = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`[useXapiTracker] Failed to store localStorage key "${key}":`, error);
      return false;
    }
  }, []);

  // Extract activity slug from contentId or object.id
  const extractActivitySlug = useCallback((statement) => {
    try {
      // Try contentId first (common in H5P xAPI context)
      const contentId = statement.context?.extensions?.contentId || 
                       statement.context?.extensions?.['http://id.tincanapi.com/extension/content-id'];
      
      if (contentId) {
        // Extract slug from path like "/h5p/entrepreneur-legacy-quick-awareness"
        const match = contentId.match(/\/([^/]+)$/);
        if (match) return match[1];
      }

      // Fallback to object.id
      const objectId = statement.object?.id;
      if (objectId) {
        // Try to extract from URL-like object IDs
        const urlMatch = objectId.match(/\/([^/]+)(?:\/[^/]*)?$/);
        if (urlMatch) return urlMatch[1];
        
        // Try simple slug extraction
        const simpleMatch = objectId.match(/([a-z0-9-]+)$/i);
        if (simpleMatch) return simpleMatch[1];
      }

      return 'unknown-activity';
    } catch (error) {
      console.warn('[useXapiTracker] Error extracting activity slug:', error);
      return 'unknown-activity';
    }
  }, []);

  // Calculate completion percentage from xAPI result
  const calculateCompletionPercentage = useCallback((result) => {
    if (!result || !result.score) return 0;
    
    const { raw = 0, max = 1 } = result.score;
    if (max === 0) return 0;
    
    return Math.round((raw / max) * 100);
  }, []);

  // Update summary statistics
  const updateProgressSummary = useCallback((progressData) => {
    try {
      const activities = Object.values(progressData);
      const totalActivities = activities.length;
      const completedActivities = activities.filter(a => a.isCompleted).length;
      const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
      
      // Calculate average score percentage from completed activities
      const completedWithScores = activities.filter(a => a.isCompleted && a.completionPercentage > 0);
      const averageScorePercent = completedWithScores.length > 0 
        ? Math.round(completedWithScores.reduce((sum, a) => sum + a.completionPercentage, 0) / completedWithScores.length)
        : 0;

      const summary = {
        totalActivities,
        completedActivities,
        completionRate,
        averageScorePercent,
        lastUpdated: new Date().toISOString()
      };

      safeStoreJSON(PROGRESS_SUMMARY_KEY, summary);
      console.log(`[useXapiTracker] Progress Summary - ${completedActivities}/${totalActivities} activities completed (${completionRate}%), Average score: ${averageScorePercent}%`);

    } catch (error) {
      console.error('[useXapiTracker] Error updating progress summary:', error);
    }
  }, [safeStoreJSON, PROGRESS_SUMMARY_KEY]);

  // Update progress tracking
  const updateProgress = useCallback((statement) => {
    try {
      const slug = extractActivitySlug(statement);
      const verb = statement.verb?.id;
      const result = statement.result;
      
      // Only track answered and completed verbs
      if (!verb || (!verb.endsWith('/answered') && !verb.endsWith('/completed'))) {
        return;
      }

      const currentProgress = safeParseJSON(PROGRESS_KEY, {});
      
      // Initialize activity progress if not exists
      if (!currentProgress[slug]) {
        currentProgress[slug] = {
          slug,
          questionsAnswered: 0,
          questionsCompleted: 0,
          lastScore: 0,
          lastSuccess: false,
          completionPercentage: 0,
          isCompleted: false,
          lastActivity: new Date().toISOString()
        };
      }

      const activityProgress = currentProgress[slug];

      // Update based on verb type
      if (verb.endsWith('/answered')) {
        activityProgress.questionsAnswered++;
        if (result) {
          activityProgress.lastScore = result.score?.raw || 0;
          activityProgress.lastSuccess = result.success || false;
          activityProgress.completionPercentage = calculateCompletionPercentage(result);
        }
        console.log(`[useXapiTracker] ${slug} - Question answered. Score: ${activityProgress.lastScore}, Success: ${activityProgress.lastSuccess}, Completion: ${activityProgress.completionPercentage}%`);
      }

      if (verb.endsWith('/completed')) {
        activityProgress.questionsCompleted++;
        activityProgress.isCompleted = true;
        if (result) {
          activityProgress.lastScore = result.score?.raw || 0;
          activityProgress.lastSuccess = result.success || false;
          activityProgress.completionPercentage = calculateCompletionPercentage(result);
        }
        console.log(`[useXapiTracker] ${slug} - Activity completed! Final score: ${activityProgress.lastScore}, Success: ${activityProgress.lastSuccess}, Completion: ${activityProgress.completionPercentage}%`);
      }

      activityProgress.lastActivity = new Date().toISOString();

      // Store updated progress
      safeStoreJSON(PROGRESS_KEY, currentProgress);

      // Update summary statistics
      updateProgressSummary(currentProgress);

    } catch (error) {
      console.error('[useXapiTracker] Error updating progress:', error);
    }
  }, [extractActivitySlug, calculateCompletionPercentage, safeParseJSON, safeStoreJSON, PROGRESS_KEY, updateProgressSummary]);

  // Handle xAPI events from document
  const handleDocumentXapiEvent = useCallback((event) => {
    try {
      const statement = event.detail?.statement || event.data?.statement;
      if (!statement) return;

      console.log('[useXapiTracker] Document xAPI event received:', statement.verb?.id);

      // Store the raw xAPI statement
      const currentRecords = safeParseJSON(XAPI_RECORDS_KEY, []);
      const newRecord = {
        timestamp: new Date().toISOString(),
        statement,
        source: 'document'
      };
      
      currentRecords.push(newRecord);
      safeStoreJSON(XAPI_RECORDS_KEY, currentRecords);

      // Update progress tracking
      updateProgress(statement);

    } catch (error) {
      console.error('[useXapiTracker] Error handling document xAPI event:', error);
    }
  }, [safeParseJSON, safeStoreJSON, XAPI_RECORDS_KEY, updateProgress]);

  // Handle xAPI events from H5P.externalDispatcher
  const handleH5PXapiEvent = useCallback((event) => {
    try {
      const statement = event.data?.statement;
      if (!statement) return;

      console.log('[useXapiTracker] H5P.externalDispatcher xAPI event received:', statement.verb?.id);

      // Store the raw xAPI statement
      const currentRecords = safeParseJSON(XAPI_RECORDS_KEY, []);
      const newRecord = {
        timestamp: new Date().toISOString(),
        statement,
        source: 'H5P.externalDispatcher'
      };
      
      currentRecords.push(newRecord);
      safeStoreJSON(XAPI_RECORDS_KEY, currentRecords);

      // Update progress tracking
      updateProgress(statement);

    } catch (error) {
      console.error('[useXapiTracker] Error handling H5P xAPI event:', error);
    }
  }, [safeParseJSON, safeStoreJSON, XAPI_RECORDS_KEY, updateProgress]);

  // Initialize H5P listener after delay
  const initializeH5PListener = useCallback(() => {
    if (h5pListenerRef.current) return; // Already initialized

    const tryAttachH5PListener = () => {
      try {
        if (window.H5P && window.H5P.externalDispatcher) {
          console.log('[useXapiTracker] Attaching H5P.externalDispatcher listener');
          window.H5P.externalDispatcher.on('xAPI', handleH5PXapiEvent);
          h5pListenerRef.current = handleH5PXapiEvent;
          return true;
        }
        return false;
      } catch (error) {
        console.warn('[useXapiTracker] Failed to attach H5P listener:', error);
        return false;
      }
    };

    // Try immediately first
    if (tryAttachH5PListener()) return;

    // Wait 2s for H5P to load, then try again
    initTimeoutRef.current = setTimeout(() => {
      if (tryAttachH5PListener()) {
        console.log('[useXapiTracker] H5P listener attached after delay');
      } else {
        console.warn('[useXapiTracker] H5P.externalDispatcher not available after 2s delay');
      }
    }, 2000);
  }, [handleH5PXapiEvent]);

  // Public API methods
  const getRecords = useCallback(() => {
    return safeParseJSON(XAPI_RECORDS_KEY, []);
  }, [safeParseJSON, XAPI_RECORDS_KEY]);

  const clearRecords = useCallback(() => {
    try {
      localStorage.removeItem(XAPI_RECORDS_KEY);
      console.log('[useXapiTracker] xAPI records cleared');
      return true;
    } catch (error) {
      console.error('[useXapiTracker] Failed to clear records:', error);
      return false;
    }
  }, [XAPI_RECORDS_KEY]);

  const getProgress = useCallback(() => {
    return safeParseJSON(PROGRESS_KEY, {});
  }, [safeParseJSON, PROGRESS_KEY]);

  const getProgressSummary = useCallback(() => {
    return safeParseJSON(PROGRESS_SUMMARY_KEY, {
      totalActivities: 0,
      completedActivities: 0,
      completionRate: 0,
      averageScorePercent: 0,
      lastUpdated: null
    });
  }, [safeParseJSON, PROGRESS_SUMMARY_KEY]);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(PROGRESS_SUMMARY_KEY);
      console.log('[useXapiTracker] Progress data cleared');
      return true;
    } catch (error) {
      console.error('[useXapiTracker] Failed to clear progress:', error);
      return false;
    }
  }, [PROGRESS_KEY, PROGRESS_SUMMARY_KEY]);

  // Setup effect
  useEffect(() => {
    console.log('[useXapiTracker] Initializing xAPI tracking...');
    
    // Add document event listener for xAPI events
    document.addEventListener('xAPI', handleDocumentXapiEvent);
    
    // Initialize H5P listener
    initializeH5PListener();
    
    setIsListening(true);

    // Store cleanup function
    cleanupRef.current = () => {
      console.log('[useXapiTracker] Cleaning up listeners...');
      
      // Remove document listener
      document.removeEventListener('xAPI', handleDocumentXapiEvent);
      
      // Remove H5P listener
      if (h5pListenerRef.current && window.H5P && window.H5P.externalDispatcher) {
        try {
          window.H5P.externalDispatcher.off('xAPI', h5pListenerRef.current);
        } catch (error) {
          console.warn('[useXapiTracker] Error removing H5P listener:', error);
        }
      }
      
      // Clear timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      h5pListenerRef.current = null;
      setIsListening(false);
    };

    // Cleanup on unmount
    return cleanupRef.current;
  }, [handleDocumentXapiEvent, initializeH5PListener]);

  return {
    // Core xAPI methods
    getRecords,
    clearRecords,
    
    // Progress tracking methods
    getProgress,
    getProgressSummary,
    clearProgress,
    
    // Status
    isListening
  };
}
