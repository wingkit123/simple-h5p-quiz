import React, { useState, useEffect } from 'react';
import xapiTracker from '../utils/xapiTracker';

const AnswerTrackingDashboard = ({ isVisible, onClose }) => {
  const [answers, setAnswers] = useState([]);
  const [sessionInfo, setSessionInfo] = useState({});

  useEffect(() => {
    // Get initial session info
    setSessionInfo(xapiTracker.getSessionInfo());

    // Create a custom event listener for tracking answers
    const handleAnswerTracked = (event) => {
      if (event.detail && event.detail.type === 'answer-tracked') {
        const answerData = event.detail.data;
        setAnswers(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          ...answerData
        }]);
      }
    };

    // Listen for custom answer tracking events
    window.addEventListener('xapi-answer-tracked', handleAnswerTracked);
    
    return () => {
      window.removeEventListener('xapi-answer-tracked', handleAnswerTracked);
    };
  }, []);

  const clearAnswers = () => {
    setAnswers([]);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      background: '#1a202c',
      border: '1px solid #4a5568',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      color: '#f7fafc'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #4a5568',
        paddingBottom: '8px'
      }}>
        <h3 style={{ margin: 0, color: '#63b3ed' }}>Answer Tracking Dashboard</h3>
        <div>
          <button
            onClick={clearAnswers}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              marginRight: '8px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#4a5568',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ fontSize: '12px', marginBottom: '12px', color: '#a0aec0' }}>
        Session: {sessionInfo.sessionId?.slice(0, 8)}... | 
        Status: {sessionInfo.isEnabled ? '🟢 Active' : '🔴 Inactive'}
      </div>

      <div style={{
        maxHeight: '350px',
        overflowY: 'auto',
        border: '1px solid #2d3748',
        borderRadius: '4px',
        padding: '8px'
      }}>
        {answers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#718096', 
            fontStyle: 'italic',
            padding: '20px'
          }}>
            No answers tracked yet. Start the quiz to see real-time answer tracking!
          </div>
        ) : (
          answers.slice().reverse().map((answer, index) => (
            <div
              key={answer.id}
              style={{
                background: answer.isCorrect ? '#1a365d' : '#742a2a',
                border: `1px solid ${answer.isCorrect ? '#3182ce' : '#e53e3e'}`,
                borderRadius: '4px',
                padding: '8px',
                marginBottom: '8px',
                fontSize: '12px'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{ 
                  fontWeight: 'bold',
                  color: answer.isCorrect ? '#90cdf4' : '#fed7d7'
                }}>
                  Q{index + 1}: {answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </span>
                <span style={{ color: '#a0aec0' }}>{answer.timestamp}</span>
              </div>
              
              <div style={{ marginBottom: '4px' }}>
                <strong>Question:</strong> {answer.questionText?.slice(0, 60)}...
              </div>
              
              <div style={{ marginBottom: '4px' }}>
                <strong>User Selected:</strong> 
                <span style={{ 
                  color: answer.isCorrect ? '#90cdf4' : '#fed7d7',
                  marginLeft: '4px'
                }}>
                  {answer.selectedAnswerText || answer.userAnswer}
                </span>
              </div>
              
              {!answer.isCorrect && answer.correctAnswerText && (
                <div style={{ marginBottom: '4px' }}>
                  <strong>Correct Answer:</strong> 
                  <span style={{ color: '#90cdf4', marginLeft: '4px' }}>
                    {answer.correctAnswerText}
                  </span>
                </div>
              )}
              
              {answer.answerOptions && answer.answerOptions.length > 0 && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    color: '#a0aec0',
                    fontSize: '11px'
                  }}>
                    All Options ({answer.answerOptions.length})
                  </summary>
                  <div style={{ 
                    marginTop: '4px', 
                    paddingLeft: '12px',
                    fontSize: '11px'
                  }}>
                    {answer.answerOptions.map((option, idx) => (
                      <div 
                        key={idx}
                        style={{ 
                          color: option.id === answer.selectedAnswer ? '#90cdf4' : '#cbd5e0',
                          marginBottom: '2px'
                        }}
                      >
                        {option.id === answer.selectedAnswer ? '👉 ' : '   '}
                        {option.description?.['en-US'] || option.text || option.id}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        marginTop: '12px', 
        fontSize: '11px', 
        color: '#718096',
        textAlign: 'center',
        borderTop: '1px solid #2d3748',
        paddingTop: '8px'
      }}>
        Real-time xAPI answer tracking • {answers.length} answers logged
      </div>
    </div>
  );
};

export default AnswerTrackingDashboard;