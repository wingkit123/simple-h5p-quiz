# xAPI Answer Tracking - Detailed User Response Monitoring

## Yes, you CAN track exactly which answers users click!

Your H5P personality quiz now includes comprehensive answer tracking that captures:

## 🎯 What Gets Tracked

### 1. **Individual Answer Clicks**

```javascript
// Every time a user selects an answer, xAPI captures:
{
  questionText: "What's your favorite color?",
  selectedAnswer: "blue",
  selectedAnswerText: "Blue - the color of calm oceans",
  selectedAnswerIndex: 2,
  correctAnswer: "any", // for personality quizzes
  isCorrect: true,
  answerOptions: [
    { id: "red", text: "Red - bold and energetic" },
    { id: "green", text: "Green - nature and growth" },
    { id: "blue", text: "Blue - calm and peaceful" }
  ]
}
```

### 2. **Question Metadata**

- Question type (multiple choice, true/false, etc.)
- All available answer options
- Question index/position
- Time spent on question
- Personality trait being measured

### 3. **User Interaction Details**

- Exact timestamp of each click
- Session tracking across entire quiz
- Response patterns and sequences

## 📊 Real-Time Answer Dashboard

### Features

- **Live Answer Monitoring**: See answers as users click them
- **Correct/Incorrect Visual Indicators**: Green for correct, red for incorrect
- **Complete Answer Options**: View all choices available to user
- **Session Information**: Track session ID and status
- **Expandable Details**: Click to see all answer options for each question

### How to Use

1. Click the **📊 Answers** button in the navigation
2. Start taking the personality quiz
3. Watch answers appear in real-time as you click them
4. Each answer shows:
   - Question text
   - What you selected
   - Whether it was correct (for quiz types)
   - All available options
   - Timestamp of selection

## 🔍 Detailed xAPI Statements

### Answer Selection Statement

```json
{
  "actor": {
    "name": "Anonymous User",
    "mbox": "mailto:anonymous@example.com"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/answered",
    "display": { "en-US": "answered" }
  },
  "object": {
    "id": "https://your-domain.com/activities/personality-quiz/questions/q1",
    "definition": {
      "name": { "en-US": "Question: What motivates you most?" },
      "type": "http://adlnet.gov/expapi/activities/cmi.interaction",
      "interactionType": "choice",
      "choices": [
        {
          "id": "achievement",
          "description": { "en-US": "Achieving goals and success" }
        },
        {
          "id": "relationships",
          "description": { "en-US": "Building meaningful relationships" }
        }
      ]
    }
  },
  "result": {
    "response": "achievement",
    "success": true,
    "extensions": {
      "http://id.tincanapi.com/extension/answer-details": {
        "userSelection": "achievement",
        "questionType": "choice",
        "allChoices": [...],
        "questionIndex": 1,
        "timeSpent": "PT15S"
      }
    }
  }
}
```

### Enhanced Tracking Statement

```json
{
  "result": {
    "extensions": {
      "http://id.tincanapi.com/extension/detailed-answer": {
        "questionText": "What's your ideal weekend?",
        "selectedAnswerText": "Hiking in nature",
        "selectedAnswerIndex": 2,
        "correctAnswerText": "N/A - personality trait",
        "allAnswerOptions": [
          { "id": "social", "text": "Party with friends" },
          { "id": "quiet", "text": "Reading at home" },
          { "id": "nature", "text": "Hiking in nature" },
          { "id": "creative", "text": "Art or music projects" }
        ],
        "personalityTrait": "extroversion",
        "questionCategory": "lifestyle"
      }
    }
  }
}
```

## 💻 Console Logging

Every answer is also logged to the browser console with detailed information:

```javascript
[xAPI] Detailed Answer Tracked - Question q3
├─ Question: How do you handle stress?
├─ User Selected: Take deep breaths and meditate
├─ Correct Answer: N/A (personality assessment)
├─ Is Correct: true
├─ All Options: [4 options shown]
└─ Full Data: {complete question object}
```

## 🛠 Programmatic Access

### Get Answer Data

```javascript
// Listen for answer events
window.addEventListener("xapi-answer-tracked", (event) => {
  const answerData = event.detail.data;
  console.log("User selected:", answerData.selectedAnswerText);
  console.log("Question was:", answerData.questionText);
  console.log("All options:", answerData.answerOptions);
});
```

### Custom Tracking

```javascript
import xapiTracker from './utils/xapiTracker';

// Track custom answer data
xapiTracker.trackDetailedQuizAnswer('personality-quiz', {
  id: 'custom-q1',
  text: 'Custom question?',
  selectedAnswer: 'option-a',
  selectedAnswerText: 'Option A text',
  isCorrect: true,
  answerOptions: [...]
});
```

## 📈 Analytics Use Cases

### Learning Analytics

- **Response Pattern Analysis**: See how users approach different question types
- **Time Analysis**: Track how long users spend on each question
- **Choice Distribution**: Understand which answers are selected most often

### Personality Assessment Analytics

- **Trait Mapping**: Track which personality traits are being measured
- **Response Consistency**: Analyze patterns in user responses
- **Category Performance**: See performance across different question categories

### User Experience Analytics

- **Interaction Flows**: Understand how users navigate through questions
- **Difficulty Analysis**: Identify questions that take longer to answer
- **Engagement Metrics**: Track completion rates and interaction depth

## 🎮 Try It Now!

1. **Open the application** at `http://localhost:5173`
2. **Click "📊 Answers"** in the navigation to open the dashboard
3. **Start the personality quiz** and watch answers appear in real-time
4. **Check browser console** for detailed logging
5. **Complete the quiz** to see full answer tracking in action

The enhanced xAPI tracking now gives you complete visibility into user answer selections with rich metadata and real-time monitoring capabilities!
