# xAPI Integration for H5P Quiz

This application now includes xAPI (Experience API/Tin Can API) integration for comprehensive learning analytics tracking.

## Features

- ✅ **Activity Tracking**: Tracks when users start and complete H5P activities
- ✅ **Question Analytics**: Records individual question responses and correctness
- ✅ **Interaction Logging**: Captures detailed H5P interactions
- ✅ **Session Management**: Maintains unique session identifiers
- ✅ **LRS Integration**: Sends statements to Learning Record Store
- ✅ **Debug Mode**: Console logging for development and testing

## Quick Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your LRS credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_XAPI_ENDPOINT=https://your-lrs-endpoint.com/statements
VITE_XAPI_USER=your-username
VITE_XAPI_PASSWORD=your-password
VITE_XAPI_ACTIVITY_BASE=https://your-domain.com/activities/
```

### 2. Development Mode (No LRS Required)

For development, xAPI will work without a real LRS. All statements are logged to the browser console for inspection.

### 3. Production LRS Options

Popular LRS options:

- **SCORM Cloud**: https://cloud.scorm.com
- **Veracity Learning**: https://www.veracitylearning.com
- **Learning Locker**: https://learninglocker.net
- **xAPI Launch**: https://www.saltbox.com

## xAPI Statements Generated

### Activity Started

```json
{
  "actor": { "name": "User Name", "mbox": "mailto:user@example.com" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/attempted" },
  "object": {
    "id": "https://your-domain.com/activities/personality-quiz",
    "definition": { "name": { "en-US": "Personality Quiz" } }
  }
}
```

### Question Answered

```json
{
  "actor": { "name": "User Name", "mbox": "mailto:user@example.com" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/answered" },
  "object": {
    "id": "https://your-domain.com/activities/personality-quiz/questions/q1"
  },
  "result": {
    "response": "user-answer",
    "success": true,
    "score": { "raw": 1, "max": 1, "scaled": 1.0 }
  }
}
```

### Activity Completed

```json
{
  "actor": { "name": "User Name", "mbox": "mailto:user@example.com" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/completed" },
  "object": {
    "id": "https://your-domain.com/activities/personality-quiz"
  },
  "result": {
    "completion": true,
    "success": true,
    "score": { "raw": 8, "max": 10, "scaled": 0.8 }
  }
}
```

## User Interface

- **xAPI Status Indicator**: Green "xAPI: ON" button shows tracking is active
- **Session Information Panel**: Click the status button to view session details
- **Console Logging**: All xAPI statements are logged to browser console

## Customization

### Setting User Information

```javascript
import xapiTracker from "./utils/xapiTracker";

// Update user info (e.g., after login)
xapiTracker.setUser({
  name: "John Doe",
  email: "john.doe@example.com",
});
```

### Custom Tracking

```javascript
// Track custom interactions
xapiTracker.trackInteraction("activity-id", "custom-interaction", {
  customData: "value",
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your LRS allows requests from your domain
2. **Authentication Failures**: Verify username/password in environment variables
3. **Statement Validation**: Check browser console for validation errors

### Debug Mode

Enable debug logging in `h5pActivities.js`:

```javascript
{
  slug: 'personality-quiz',
  title: 'Personality Quiz',
  debug: true  // Enables detailed console logging
}
```

## Privacy & Compliance

- All user data is anonymized by default
- Session IDs are randomly generated UUIDs
- No PII is collected unless explicitly configured
- Complies with xAPI specification v1.0.3

## Technical Details

- **Library**: TinCanJS for xAPI statement handling
- **Storage**: Statements sent to configured LRS endpoint
- **Session Management**: UUID-based session tracking
- **Event Integration**: Hooks into H5P's internal event system
- **Error Handling**: Graceful degradation if LRS unavailable

## Support

For xAPI-specific issues:

1. Check browser console for error messages
2. Verify LRS endpoint accessibility
3. Test with a known working LRS (e.g., SCORM Cloud trial)
4. Review xAPI specification: https://adlnet.gov/expapi/
