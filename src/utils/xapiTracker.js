// xAPI Tracking Utilities for H5P Learning Analytics
import { v4 as uuidv4 } from 'uuid';
import { 
  initializeXAPI, 
  generateActor, 
  generateActivityIRI, 
  createXAPIVerbs,
  XAPI_CONFIG 
} from '../config/xapiConfig.js';

class XAPITracker {
  constructor() {
    this.lrs = null;
    this.TinCan = null;
    this.XAPI_VERBS = {};
    this.actor = null;
    this.sessionId = uuidv4();
    this.isEnabled = false;
    this.initPromise = null;
    
    this.initialize();
  }

  async initialize() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      try {
        const { lrs, TinCan } = await initializeXAPI();
        
        if (lrs && TinCan) {
          this.lrs = lrs;
          this.TinCan = TinCan;
          this.XAPI_VERBS = createXAPIVerbs(TinCan);
          this.actor = generateActor(TinCan);
          this.isEnabled = true;
          console.log('[xAPI] Successfully initialized');
        } else {
          console.warn('[xAPI] LRS not available, tracking disabled');
          this.isEnabled = false;
        }
      } catch (error) {
        console.error('[xAPI] Initialization failed:', error);
        this.isEnabled = false;
      }
    })();
    
    return this.initPromise;
  }

  // Track when a user starts an H5P activity
  async trackActivityStarted(activityId, activityName, activityType = 'quiz') {
    await this.initialize();
    if (!this.isEnabled || !this.TinCan) return;

    const statement = new this.TinCan.Statement({
      actor: this.actor,
      verb: this.XAPI_VERBS.ATTEMPTED,
      object: new this.TinCan.Activity({
        id: generateActivityIRI(activityId),
        definition: {
          name: { 'en-US': activityName },
          type: `http://adlnet.gov/expapi/activities/${activityType}`,
          description: { 'en-US': `Started ${activityName}` }
        }
      }),
      context: {
        registration: this.sessionId,
        platform: 'H5P-React-App',
        extensions: {
          'http://id.tincanapi.com/extension/session-id': this.sessionId
        }
      },
      timestamp: new Date().toISOString()
    });

    this.sendStatement(statement, 'activity-started');
  }

  // Track when a user completes an H5P activity
  trackActivityCompleted(activityId, activityName, result = {}) {
    if (!this.isEnabled) return;

    const statement = new TinCan.Statement({
      actor: this.actor,
      verb: result.success ? XAPI_VERBS.COMPLETED : XAPI_VERBS.ATTEMPTED,
      object: new TinCan.Activity({
        id: generateActivityIRI(activityId),
        definition: {
          name: { 'en-US': activityName },
          type: 'http://adlnet.gov/expapi/activities/quiz'
        }
      }),
      result: {
        score: result.score ? {
          scaled: result.score.scaled || null,
          raw: result.score.raw || null,
          max: result.score.max || null
        } : undefined,
        success: result.success || false,
        completion: true,
        duration: result.duration || undefined
      },
      context: {
        registration: this.sessionId,
        platform: 'H5P-React-App'
      },
      timestamp: new Date().toISOString()
    });

    this.sendStatement(statement, 'activity-completed');
  }

  // Track individual question responses with detailed answer information
  trackQuestionAnswered(activityId, questionId, questionText, userAnswer, correctAnswer, isCorrect, questionData = {}) {
    if (!this.isEnabled) return;

    // Enhanced question tracking with more detailed information
    const statement = new TinCan.Statement({
      actor: this.actor,
      verb: XAPI_VERBS.ANSWERED,
      object: new TinCan.Activity({
        id: `${generateActivityIRI(activityId)}/questions/${questionId}`,
        definition: {
          name: { 'en-US': `Question: ${questionText}` },
          description: { 'en-US': questionText },
          type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
          interactionType: questionData.type || 'choice',
          correctResponsesPattern: Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer],
          choices: questionData.choices || []
        }
      }),
      result: {
        response: userAnswer,
        success: isCorrect,
        score: isCorrect ? { raw: 1, max: 1, scaled: 1.0 } : { raw: 0, max: 1, scaled: 0.0 },
        extensions: {
          'http://id.tincanapi.com/extension/answer-details': {
            userSelection: userAnswer,
            correctAnswer: correctAnswer,
            questionType: questionData.type,
            allChoices: questionData.choices,
            questionIndex: questionData.index,
            timeSpent: questionData.timeSpent
          }
        }
      },
      context: {
        registration: this.sessionId,
        parent: new TinCan.Activity({
          id: generateActivityIRI(activityId)
        }),
        extensions: {
          'http://id.tincanapi.com/extension/session-id': this.sessionId,
          'http://id.tincanapi.com/extension/question-metadata': questionData
        }
      },
      timestamp: new Date().toISOString()
    });

    this.sendStatement(statement, 'question-answered');
    
    // Also log detailed answer information to console for immediate visibility
    console.log(`[xAPI] Answer Tracked:`, {
      questionText,
      userAnswer,
      correctAnswer,
      isCorrect,
      questionData
    });

    // Dispatch custom event for real-time dashboard updates
    this.dispatchAnswerEvent({
      questionText,
      userAnswer,
      correctAnswer,
      isCorrect,
      questionData
    });
  }

  // Track detailed quiz interactions with answer choices
  trackDetailedQuizAnswer(activityId, questionData) {
    if (!this.isEnabled) return;

    const statement = new TinCan.Statement({
      actor: this.actor,
      verb: XAPI_VERBS.ANSWERED,
      object: new TinCan.Activity({
        id: `${generateActivityIRI(activityId)}/detailed-question/${questionData.id}`,
        definition: {
          name: { 'en-US': questionData.text },
          description: { 'en-US': questionData.text },
          type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
          interactionType: questionData.type
        }
      }),
      result: {
        response: questionData.selectedAnswer,
        success: questionData.isCorrect,
        completion: true,
        extensions: {
          'http://id.tincanapi.com/extension/detailed-answer': {
            questionText: questionData.text,
            selectedAnswerText: questionData.selectedAnswerText,
            selectedAnswerIndex: questionData.selectedAnswerIndex,
            correctAnswerText: questionData.correctAnswerText,
            correctAnswerIndex: questionData.correctAnswerIndex,
            allAnswerOptions: questionData.answerOptions,
            questionType: questionData.type,
            questionCategory: questionData.category,
            personalityTrait: questionData.trait,
            timestamp: new Date().toISOString()
          }
        }
      },
      context: {
        registration: this.sessionId,
        parent: new TinCan.Activity({ id: generateActivityIRI(activityId) })
      }
    });

    this.sendStatement(statement, 'detailed-quiz-answer');
    
    // Enhanced console logging for answer tracking
    console.group(`[xAPI] Detailed Answer Tracked - Question ${questionData.id}`);
    console.log('Question:', questionData.text);
    console.log('User Selected:', questionData.selectedAnswerText);
    console.log('Correct Answer:', questionData.correctAnswerText);
    console.log('Is Correct:', questionData.isCorrect);
    console.log('All Options:', questionData.answerOptions);
    console.log('Full Data:', questionData);
    console.groupEnd();

    // Dispatch detailed answer event for dashboard
    this.dispatchAnswerEvent(questionData);
  }

  // Dispatch custom events for real-time answer tracking
  dispatchAnswerEvent(answerData) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('xapi-answer-tracked', {
        detail: {
          type: 'answer-tracked',
          data: answerData,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    }
  }

  // Track H5P interactions (general purpose)
  trackInteraction(activityId, interactionType, interactionData = {}) {
    if (!this.isEnabled) return;

    const statement = new TinCan.Statement({
      actor: this.actor,
      verb: XAPI_VERBS.INTERACTED,
      object: new TinCan.Activity({
        id: `${generateActivityIRI(activityId)}/interactions/${interactionType}`,
        definition: {
          name: { 'en-US': `${interactionType} interaction` },
          type: 'http://adlnet.gov/expapi/activities/interaction'
        }
      }),
      result: {
        extensions: {
          'http://id.tincanapi.com/extension/interaction-data': interactionData
        }
      },
      context: {
        registration: this.sessionId,
        parent: new TinCan.Activity({
          id: generateActivityIRI(activityId)
        })
      },
      timestamp: new Date().toISOString()
    });

    this.sendStatement(statement, 'interaction');
  }

  // Send statement to LRS
  sendStatement(statement, eventType) {
    if (!this.lrs || !this.isEnabled) {
      console.log(`[xAPI] Would send ${eventType}:`, statement);
      return;
    }

    this.lrs.saveStatement(statement, {
      callback: (err) => {
        if (err) {
          console.error(`[xAPI] Failed to send ${eventType} statement:`, err);
        } else {
          console.log(`[xAPI] Successfully sent ${eventType} statement`);
        }
      }
    });
  }

  // Set user information (call this when user logs in or provides info)
  setUser(userInfo) {
    this.actor = generateActor(userInfo);
    console.log('[xAPI] Actor updated:', this.actor);
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      actor: this.actor,
      isEnabled: this.isEnabled,
      lrsEndpoint: XAPI_CONFIG.endpoint
    };
  }
}

// Create singleton instance
const xapiTracker = new XAPITracker();
export default xapiTracker;