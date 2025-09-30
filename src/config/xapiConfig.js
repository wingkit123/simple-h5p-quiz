// xAPI Configuration for H5P Learning Analytics
// Using dynamic import to avoid build issues with TinCanJS in browser

// xAPI Configuration - Update these values for your LRS (Learning Record Store)
export const XAPI_CONFIG = {
  // Default to a demo/test LRS endpoint - replace with your actual LRS
  endpoint: import.meta.env.VITE_XAPI_ENDPOINT || 'https://cloud.scorm.com/tc/public/statements',
  
  // Authentication - replace with your actual credentials
  auth: {
    user: import.meta.env.VITE_XAPI_USER || 'test-user',
    password: import.meta.env.VITE_XAPI_PASSWORD || 'test-password'
  },
  
  // Activity IRI base - should be unique to your application
  activityBase: import.meta.env.VITE_XAPI_ACTIVITY_BASE || 'https://your-domain.com/activities/',
  
  // Actor configuration
  actor: {
    name: 'Anonymous User',
    mbox: 'mailto:anonymous@example.com'
  }
};

// Initialize TinCan LRS connection with error handling
export const initializeXAPI = async () => {
  try {
    // Dynamic import to avoid build issues
    const TinCan = await import('tincanjs');
    const TinCanLib = TinCan.default || TinCan;
    
    const lrs = new TinCanLib.LRS({
      endpoint: XAPI_CONFIG.endpoint,
      username: XAPI_CONFIG.auth.user,
      password: XAPI_CONFIG.auth.password,
      allowFail: true // Allow graceful failure
    });
    
    console.log('[xAPI] LRS connection initialized:', XAPI_CONFIG.endpoint);
    return { lrs, TinCan: TinCanLib };
  } catch (error) {
    console.error('[xAPI] Failed to initialize LRS connection:', error);
    return { lrs: null, TinCan: null };
  }
};

// Generate unique actor based on session or user data
export const generateActor = (TinCan, userInfo = {}) => {
  if (!TinCan) return null;
  
  const defaultActor = {
    name: userInfo.name || XAPI_CONFIG.actor.name,
    mbox: userInfo.email || XAPI_CONFIG.actor.mbox
  };
  
  return new TinCan.Agent(defaultActor);
};

// Generate activity IRI
export const generateActivityIRI = (activityId) => {
  return `${XAPI_CONFIG.activityBase}${activityId}`;
};

// Common verbs used in H5P interactions - created dynamically
export const createXAPIVerbs = (TinCan) => {
  if (!TinCan) return {};
  
  return {
    EXPERIENCED: new TinCan.Verb({
      id: 'http://adlnet.gov/expapi/verbs/experienced',
      display: { 'en-US': 'experienced' }
    }),
    
    COMPLETED: new TinCan.Verb({
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' }
    }),
    
    ANSWERED: new TinCan.Verb({
      id: 'http://adlnet.gov/expapi/verbs/answered',
      display: { 'en-US': 'answered' }
    }),
    
    PASSED: new TinCan.Verb({
      id: 'http://adlnet.gov/expapi/verbs/passed',
      display: { 'en-US': 'passed' }
    }),
    
    FAILED: new TinCan.Verb({
      id: 'http://adlnet.gov/expapi/verbs/failed',
      display: { 'en-US': 'failed' }
    }),
    
    ATTEMPTED: new TinCan.Verb({
      id: 'http://adlnet.gov/expapi/verbs/attempted',
      display: { 'en-US': 'attempted' }
    }),
    
    INTERACTED: new TinCan.Verb({
      id: 'http://adlnet.gov/expapi/verbs/interacted',
      display: { 'en-US': 'interacted' }
    })
  };
};