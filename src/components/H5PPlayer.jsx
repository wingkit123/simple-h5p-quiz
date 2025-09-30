import React, { useEffect, useRef } from "react";
import { ensureH5PGlobals } from "../utils/h5pLoader";
import xapiTracker from "../utils/simpleXAPITracker";

// Helper function for logging
const logDebug = (debug, ...messages) => {
  if (debug) console.log(...messages);
};

// Extract activity ID from h5p path
const getActivityId = (h5pPath) => {
  return h5pPath.split('/').pop() || 'unknown-activity';
};

// Attempt to attach listeners, with optional retry if dispatcher not yet present
const setupH5PEventListeners = (h5pInstance, activityId, debug, attempt = 0) => {
  const MAX_ATTEMPTS = 15;
  if (!window.H5P || !window.H5P.externalDispatcher) {
    if (attempt === 0) {
      logDebug(debug, '[xAPI] H5P externalDispatcher not yet available, will retry...');
    }
    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => setupH5PEventListeners(h5pInstance, activityId, debug, attempt + 1), 200);
    } else {
      logDebug(debug, '[xAPI] Gave up waiting for externalDispatcher after', MAX_ATTEMPTS, 'attempts');
    }
    return;
  }

  // Prevent multiple registrations
  if (window.__H5P_XAPI_LISTENERS_ATTACHED__) {
    logDebug(debug, '[xAPI] Listeners already attached – skipping');
    return;
  }
  window.__H5P_XAPI_LISTENERS_ATTACHED__ = true;

  logDebug(debug, '[xAPI] Attaching H5P externalDispatcher listeners');

  window.H5P.externalDispatcher.on('xAPI', (event) => {
    logDebug(debug, '[xAPI] H5P Event:', event.data);
    
    const statement = event.data.statement;
    if (!statement) return;

    try {
      // Track different types of H5P interactions with enhanced detail
      const verb = statement.verb?.id;
      const objectId = statement.object?.id;
      const result = statement.result;
      const objectDef = statement.object?.definition;
      
      // Use H5P event helper methods when available (H5P Standard Practice)
      const score = event.getScore ? event.getScore() : (result?.score?.raw || 0);
      const maxScore = event.getMaxScore ? event.getMaxScore() : (result?.score?.max || 1);
      const success = event.getScore && event.getMaxScore ? 
        event.getScore() === event.getMaxScore() && maxScore > 0 : 
        result?.success;
      
      if (verb === 'http://adlnet.gov/expapi/verbs/answered') {
        // Enhanced question answered tracking
        const questionData = {
          id: objectId,
          type: objectDef?.interactionType || 'choice',
          choices: objectDef?.choices || [],
          correctResponsesPattern: objectDef?.correctResponsesPattern || [],
          index: statement.context?.extensions?.['http://id.tincanapi.com/extension/question-index'],
          timeSpent: result?.duration
        };

        // Extract more detailed answer information using H5P enhanced scoring
        const userAnswer = result?.response || '';
        const isCorrect = success; // Use H5P enhanced success calculation
        const questionText = objectDef?.description?.['en-US'] || objectDef?.name?.['en-US'] || 'Question';
        const correctAnswer = questionData.correctResponsesPattern[0] || 'unknown';

        xapiTracker.trackQuestionAnswered(
          activityId,
          objectId || 'unknown-question',
          questionText,
          userAnswer,
          correctAnswer,
          isCorrect,
          {
            ...questionData,
            enhancedScore: score,
            enhancedMaxScore: maxScore
          }
        );

        // Additional detailed tracking for personality quiz specific data
        if (statement.context?.extensions) {
          const extensions = statement.context.extensions;
          const detailedQuestionData = {
            id: objectId,
            text: questionText,
            selectedAnswer: userAnswer,
            selectedAnswerText: getAnswerText(userAnswer, questionData.choices),
            selectedAnswerIndex: userAnswer,
            correctAnswerText: getAnswerText(correctAnswer, questionData.choices),
            correctAnswerIndex: correctAnswer,
            answerOptions: questionData.choices,
            type: questionData.type,
            isCorrect: isCorrect,
            category: extensions['http://id.tincanapi.com/extension/category'],
            trait: extensions['http://id.tincanapi.com/extension/trait']
          };

          xapiTracker.trackDetailedQuizAnswer(activityId, detailedQuestionData);
        }

      } else if (verb === 'http://adlnet.gov/expapi/verbs/completed') {
        // Activity completed with H5P enhanced scoring
        xapiTracker.trackActivityCompleted(activityId, activityId, {
          success: success, // Use enhanced success calculation
          score: {
            raw: score, // Use H5P enhanced score
            max: maxScore, // Use H5P enhanced max score
            scaled: maxScore > 0 ? score / maxScore : 0
          },
          duration: result?.duration
        });
        
      } else if (verb === 'http://adlnet.gov/expapi/verbs/progressed') {
        // H5P progression events (page changes, etc.) - H5P Standard
        xapiTracker.trackInteraction(activityId, 'progression', {
          verb: verb,
          object: objectId,
          timestamp: statement.timestamp,
          context: statement.context
        });
        
      } else if (verb === 'http://adlnet.gov/expapi/verbs/attempted') {
        // Activity attempted - H5P Standard
        logDebug(debug, '[xAPI] Activity attempted:', activityId);
      } else if (verb === 'http://adlnet.gov/expapi/verbs/interacted') {
        // General interaction with enhanced context
        xapiTracker.trackInteraction(activityId, 'h5p-interaction', {
          verb: verb,
          object: objectId,
          objectDefinition: objectDef,
          result: result,
          timestamp: statement.timestamp,
          context: statement.context
        });
      }
    } catch (error) {
      console.error('[xAPI] Error processing H5P event:', error);
    }
  });

  // Helper function to get answer text from choices
  const getAnswerText = (answerId, choices) => {
    if (!choices || !Array.isArray(choices)) return answerId;
    const choice = choices.find(c => c.id === answerId);
    return choice ? choice.description?.['en-US'] || choice.text || answerId : answerId;
  };

  logDebug(debug, '[xAPI] Event listeners set up for activity:', activityId);

  // Personality Quiz library does NOT emit built-in xAPI; bridge custom events
  try {
    if (h5pInstance && h5pInstance.on) {
      h5pInstance.on('personality-quiz-answer', (data) => {
        try {
          const detail = data?.data || data; // library sometimes passes array
          const answerSummary = Array.isArray(detail) ? detail.map(d => d.personality || d).join(',') : JSON.stringify(detail);
          xapiTracker.trackInteraction(activityId, 'personality-quiz-answer', { raw: detail, summary: answerSummary });
          logDebug(debug, '[xAPI] Bridged personality answer -> interaction');
        } catch (e) {
          console.error('[xAPI] Error bridging personality answer event', e);
        }
      });
      h5pInstance.on('personality-quiz-completed', () => {
        xapiTracker.trackActivityCompleted(activityId, activityId, { success: true });
        logDebug(debug, '[xAPI] Bridged personality completion -> completed');
      });
      logDebug(debug, '[xAPI] Personality quiz custom event bridge active');
    }
  } catch (e) {
    console.error('[xAPI] Failed setting up personality quiz bridges', e);
  }
};

export default function H5PPlayer({
  h5pPath = "/h5p/my-interactive",
  playerBase = "/assets/h5p-player",
  // iframe is the default in h5p-standalone; allow override for content that may render better in div mode
  embedType = "iframe",
  retryCount = 40,
  retryInterval = 200,
  debug = false,
}) {
  const containerRef = useRef(null);
  const pathRef = useRef(h5pPath);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentPath = h5pPath;
      pathRef.current = currentPath;
      logDebug(debug, "[H5PPlayer] Mounting content from", currentPath);

      // Quick existence check for h5p.json to surface 404 early
      try {
        const probe = await fetch(`${currentPath}/h5p.json?cb=${Date.now()}`);
        if (!probe.ok) {
          console.error(
            `[H5PPlayer] h5p.json not found (status ${probe.status}) at ${currentPath}/h5p.json`
          );
          return;
        }
      } catch (e) {
        console.error("[H5PPlayer] Failed to fetch h5p.json:", e);
        return;
      }

      // Clear previous DOM
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

        // Always pass embedType to override inconsistent h5p.json values.
        // Koha content lists 'div' in h5p.json but library requires 'iframe'.
        const options = { h5pJsonPath: currentPath, frameJs: frameBundle, frameCss, embedType };
        logDebug(debug, "[H5PPlayer] Initializing with options", options);

        try {
          const h5pInstance = new Constructor(containerRef.current, options);
          logDebug(debug, "[H5PPlayer] Initialized content for", currentPath);
          
          // Track activity start with xAPI
          const activityId = getActivityId(currentPath);
          const activityName = activityId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          xapiTracker.trackActivityStarted(activityId, activityName);
          
          // Set up H5P event listeners for xAPI tracking
          setupH5PEventListeners(h5pInstance, activityId, debug);
          
        } catch (err) {
          if (window.H5P && typeof window.H5P.init === 'function') {
            window.H5P.init(containerRef.current);
            logDebug(debug, '[H5PPlayer] Fallback window.H5P.init used for', currentPath);
            
            // Track with fallback method
            const activityId = getActivityId(currentPath);
            const activityName = activityId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            xapiTracker.trackActivityStarted(activityId, activityName);
          } else {
            console.error('[H5PPlayer] init error:', err);
          }
        }

        // Post render sanity check
        setTimeout(() => {
          if (
            !cancelled &&
            containerRef.current &&
            containerRef.current.innerHTML.trim() === ""
          ) {
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

  return (
    <div className="h5p-wrapper" key={h5pPath}>
      <div ref={containerRef} className="h5p-container" />
    </div>
  );
}
