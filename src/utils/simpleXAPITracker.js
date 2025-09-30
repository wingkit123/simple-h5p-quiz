// Simple xAPI Tracker without TinCanJS to avoid build issues
import { v4 as uuidv4 } from 'uuid';

// xAPI Configuration
const XAPI_CONFIG = {
  endpoint: import.meta.env.VITE_XAPI_ENDPOINT || 'console', // 'console' for dev mode
  auth: {
    user: import.meta.env.VITE_XAPI_USER || 'test-user',
    password: import.meta.env.VITE_XAPI_PASSWORD || 'test-password'
  },
  activityBase: import.meta.env.VITE_XAPI_ACTIVITY_BASE || 'https://your-domain.com/activities/',
  actor: {
    name: 'Anonymous User',
    mbox: 'mailto:anonymous@example.com'
  }
};

// xAPI Verbs (constants)
const XAPI_VERBS = {
  EXPERIENCED: 'http://adlnet.gov/expapi/verbs/experienced',
  COMPLETED: 'http://adlnet.gov/expapi/verbs/completed',
  ANSWERED: 'http://adlnet.gov/expapi/verbs/answered',
  PASSED: 'http://adlnet.gov/expapi/verbs/passed',
  FAILED: 'http://adlnet.gov/expapi/verbs/failed',
  ATTEMPTED: 'http://adlnet.gov/expapi/verbs/attempted',
  INTERACTED: 'http://adlnet.gov/expapi/verbs/interacted'
};

// Enhanced xAPI statement creator with H5P support
const createStatement = (actor, verb, object, result = null, context = null, h5pExtensions = null) => {
  const statement = {
    actor: {
      name: actor.name,
      mbox: actor.mbox
    },
    verb: {
      id: verb,
      display: { 'en-US': verb.split('/').pop() }
    },
    object: {
      id: object.id,
      definition: {
        name: { 'en-US': object.name },
        type: object.type || 'http://adlnet.gov/expapi/activities/interaction'
      }
    },
    timestamp: new Date().toISOString()
  };

  if (result) {
    statement.result = result;
  }

  if (context) {
    statement.context = context;
  }

  // Add H5P-specific extensions if provided
  if (h5pExtensions) {
    if (!statement.context) {
      statement.context = {};
    }
    if (!statement.context.extensions) {
      statement.context.extensions = {};
    }
    // Merge H5P-specific extensions
    Object.assign(statement.context.extensions, h5pExtensions);
  }

  return statement;
};

class SimpleXAPITracker {
  constructor() {
    // Initialize localStorage keys
    this.STORAGE_KEYS = {
      SESSION: 'xapi_session_data',
      STATEMENTS: 'xapi_statements',
      ANSWERS: 'xapi_answer_tracking',
      ACTOR: 'xapi_actor_info'
    };

    // Load existing data from localStorage or create new
    this.loadFromLocalStorage();
    // Force a session save to guarantee key presence (even if loaded)
    this.saveSessionToLocalStorage(true);
    // Ensure arrays exist
    if (!Array.isArray(this.statements)) this.statements = [];
    if (!Array.isArray(this.answerTrackingData)) this.answerTrackingData = [];
    
    console.log('[xAPI] Tracker initialized - Session:', this.sessionId.slice(0, 8));
  }

  // Load data from localStorage
  loadFromLocalStorage() {
    try {
      // Load session data or create new
      const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        this.sessionId = parsed.sessionId;
        this.isEnabled = parsed.isEnabled !== false;
      } else {
        this.sessionId = uuidv4();
        this.isEnabled = true;
        this.saveSessionToLocalStorage();
      }

      // Load actor info
      const actorData = localStorage.getItem(this.STORAGE_KEYS.ACTOR);
      this.actor = actorData ? JSON.parse(actorData) : XAPI_CONFIG.actor;

      // Load statements and answers
      const statementsData = localStorage.getItem(this.STORAGE_KEYS.STATEMENTS);
      this.statements = statementsData ? JSON.parse(statementsData) : [];

      const answersData = localStorage.getItem(this.STORAGE_KEYS.ANSWERS);
      this.answerTrackingData = answersData ? JSON.parse(answersData) : [];

    } catch (error) {
      console.warn('[xAPI] LocalStorage error, using defaults:', error.message);
      // Fallback to defaults
      this.sessionId = uuidv4();
      this.actor = XAPI_CONFIG.actor;
      this.isEnabled = true;
      this.statements = [];
      this.answerTrackingData = [];
    }
  }

  // Save session data to localStorage
  saveSessionToLocalStorage(force = false) {
    try {
      const sessionData = {
        sessionId: this.sessionId,
        isEnabled: this.isEnabled,
        lastUpdated: new Date().toISOString()
      };
      // Only write if forcing or session not present / changed
      if (force || !localStorage.getItem(this.STORAGE_KEYS.SESSION)) {
        localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
        console.debug('[xAPI][ls] session saved');
      }
    } catch {
      // Silent fail for localStorage errors
    }
  }

  // Save statements to localStorage
  saveStatementsToLocalStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.STATEMENTS, JSON.stringify(this.statements));
      console.debug('[xAPI][ls] statements saved (count=', this.statements.length, ')');
    } catch {
      // Silent fail for localStorage errors
    }
  }

  // Save answer tracking data to localStorage
  saveAnswersToLocalStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ANSWERS, JSON.stringify(this.answerTrackingData));
      console.debug('[xAPI][ls] answers saved (count=', this.answerTrackingData.length, ')');
    } catch {
      // Silent fail for localStorage errors
    }
  }

  // Save actor info to localStorage
  saveActorToLocalStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ACTOR, JSON.stringify(this.actor));
      console.debug('[xAPI][ls] actor saved');
    } catch {
      // Silent fail for localStorage errors
    }
  }

  // Create H5P-specific context extensions (H5P Standard)
  createH5PContext(contentId, subContentId = null, activityType = 'H5P.PersonalityQuiz') {
    return {
      registration: this.sessionId,
      extensions: {
        'http://h5p.org/x-api/h5p-local-content-id': contentId,
        'http://h5p.org/x-api/h5p-subtype': activityType,
        ...(subContentId && { 'http://h5p.org/x-api/h5p-subcontent-id': subContentId })
      }
    };
  }

  // Track activity started
  trackActivityStarted(activityId, activityName, activityType = 'quiz') {
    if (!this.isEnabled) return;

    const statement = createStatement(
      this.actor,
      XAPI_VERBS.ATTEMPTED,
      {
        id: `${XAPI_CONFIG.activityBase}${activityId}`,
        name: activityName,
        type: `http://adlnet.gov/expapi/activities/${activityType}`
      },
      null,
      {
        registration: this.sessionId,
        platform: 'H5P-React-App',
        extensions: {
          'http://id.tincanapi.com/extension/session-id': this.sessionId
        }
      }
    );

    this.sendStatement(statement, 'activity-started');
    this.saveStatementsToLocalStorage(); // Persist to localStorage
  }

  // Track activity completed
  trackActivityCompleted(activityId, activityName, result = {}) {
    if (!this.isEnabled) return;

    const statement = createStatement(
      this.actor,
      result.success ? XAPI_VERBS.COMPLETED : XAPI_VERBS.ATTEMPTED,
      {
        id: `${XAPI_CONFIG.activityBase}${activityId}`,
        name: activityName,
        type: 'http://adlnet.gov/expapi/activities/quiz'
      },
      {
        score: result.score ? {
          scaled: result.score.scaled || null,
          raw: result.score.raw || null,
          max: result.score.max || null
        } : undefined,
        success: result.success || false,
        completion: true,
        duration: result.duration || undefined
      },
      {
        registration: this.sessionId,
        platform: 'H5P-React-App'
      }
    );

    this.sendStatement(statement, 'activity-completed');
    this.saveStatementsToLocalStorage(); // Persist to localStorage
  }

  // Track question answered with detailed answer tracking
  trackQuestionAnswered(activityId, questionId, questionText, userAnswer, correctAnswer, isCorrect, options = []) {
    if (!this.isEnabled) return;

    // Store detailed answer data for dashboard
    const answerData = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      activityId,
      questionId,
      questionText: questionText.substring(0, 100) + (questionText.length > 100 ? '...' : ''),
      userAnswer,
      correctAnswer,
      isCorrect,
      options: options.length > 0 ? options : [userAnswer, correctAnswer],
      responseTime: Date.now()
    };

    this.answerTrackingData.push(answerData);
    this.saveAnswersToLocalStorage(); // Persist answer data to localStorage

    console.log('[xAPI] Question answered:', questionId, isCorrect ? 'correct' : 'incorrect');

    const statement = createStatement(
      this.actor,
      XAPI_VERBS.ANSWERED,
      {
        id: `${XAPI_CONFIG.activityBase}${activityId}/questions/${questionId}`,
        name: `Question: ${questionText}`,
        type: 'http://adlnet.gov/expapi/activities/cmi.interaction'
      },
      {
        response: userAnswer,
        success: isCorrect,
        score: isCorrect ? { raw: 1, max: 1, scaled: 1.0 } : { raw: 0, max: 1, scaled: 0.0 }
      },
      {
        registration: this.sessionId,
        parent: {
          id: `${XAPI_CONFIG.activityBase}${activityId}`
        }
      }
    );

    this.sendStatement(statement, 'question-answered');
    this.saveStatementsToLocalStorage(); // Persist to localStorage
  }

  // Track general interactions
  trackInteraction(activityId, interactionType, interactionData = {}) {
    if (!this.isEnabled) return;

    const statement = createStatement(
      this.actor,
      XAPI_VERBS.INTERACTED,
      {
        id: `${XAPI_CONFIG.activityBase}${activityId}/interactions/${interactionType}`,
        name: `${interactionType} interaction`,
        type: 'http://adlnet.gov/expapi/activities/interaction'
      },
      {
        extensions: {
          'http://id.tincanapi.com/extension/interaction-data': interactionData
        }
      },
      {
        registration: this.sessionId,
        parent: {
          id: `${XAPI_CONFIG.activityBase}${activityId}`
        }
      }
    );

    this.sendStatement(statement, 'interaction');
    this.saveStatementsToLocalStorage(); // Persist to localStorage
  }

  // Send statement (console log or HTTP)
  sendStatement(statement, eventType) {
    this.statements.push({ statement, eventType, timestamp: Date.now() });
    // Persist immediately to reduce data loss risk
    this.saveStatementsToLocalStorage();

    if (XAPI_CONFIG.endpoint === 'console') {
      console.log(`[xAPI] ${eventType}:`, statement);
      return;
    }

    // Send to actual LRS endpoint
    fetch(XAPI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.3',
        'Authorization': 'Basic ' + btoa(`${XAPI_CONFIG.auth.user}:${XAPI_CONFIG.auth.password}`)
      },
      body: JSON.stringify(statement)
    })
    .then(response => {
      if (response.ok) {
        console.log(`[xAPI] Successfully sent ${eventType} statement`);
      } else {
        console.error(`[xAPI] Failed to send ${eventType} statement:`, response.status);
      }
    })
    .catch(error => {
      console.error(`[xAPI] Network error sending ${eventType} statement:`, error);
    });
  }

  // Set user information
  setUser(userInfo) {
    this.actor = {
      name: userInfo.name || XAPI_CONFIG.actor.name,
      mbox: userInfo.email || XAPI_CONFIG.actor.mbox
    };
    this.saveActorToLocalStorage(); // Persist actor info
    console.log('[xAPI] User info updated:', this.actor.name);
  }

  // Get basic session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      actor: this.actor,
      isEnabled: this.isEnabled,
      statementCount: this.statements.length,
      answerCount: this.answerTrackingData.length
    };
  }

  // Get answer tracking data
  getAnswerTrackingData() {
    return this.answerTrackingData;
  }

  // Clear tracking data including localStorage  
  clearTrackingData() {
    this.statements = [];
    this.answerTrackingData = [];
    
    // Clear localStorage
    try {
      localStorage.removeItem(this.STORAGE_KEYS.STATEMENTS);
      localStorage.removeItem(this.STORAGE_KEYS.ANSWERS);
      console.log('[xAPI] Tracking data cleared');
      console.debug('[xAPI][ls] statements & answers keys removed');
    } catch {
      // Silent fail
    }
  }

  // Get all localStorage data for future database migration
  getAllTrackingData() {
    try {
      return {
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        session: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SESSION) || 'null'),
        actor: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ACTOR) || 'null'),
        statements: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STATEMENTS) || '[]'),
        answers: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ANSWERS) || '[]')
      };
    } catch (error) {
      console.error('[xAPI] Error getting tracking data:', error);
      return null;
    }
  }
}

// Create singleton instance
const xapiTracker = new SimpleXAPITracker();
export default xapiTracker;