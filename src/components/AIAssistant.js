import React, { useState, useRef, useEffect } from 'react';
import axios from '../api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m your AI learning assistant. I can help you with your studies, answer questions about your courses, and provide guidance on your learning journey. How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      // Call the AI assistant API
      const response = await axios.post('/ai/chat', {
        message: userMessage
      });

      const botResponse = response.data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process your request. Please try again.';

      // Add bot response to chat
      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again later.';
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'The AI service is taking longer than expected. Please try again with a shorter message.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please try logging out and logging back in.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'The AI service is temporarily unavailable. Please try again in a few minutes.';
      }
      
      setMessages(prev => [...prev, { type: 'bot', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '32px',
          marginRight: '12px'
        }}>
          🤖
        </div>
        <div>
          <h2 style={{
            margin: '0 0 4px 0',
            color: '#374151',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            AI Learning Assistant
          </h2>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Get help with your studies and assignments
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        borderRadius: '12px',
        background: '#f9fafb',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }} ref={chatBoxRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              padding: '12px 16px',
              borderRadius: '18px',
              maxWidth: '80%',
              fontSize: '14px',
              lineHeight: '1.5',
              wordWrap: 'break-word',
              animation: 'fadeIn 0.3s ease-in-out',
              ...(message.type === 'user' ? {
                background: '#6b46c1',
                color: 'white',
                alignSelf: 'flex-end',
                borderBottomRightRadius: '4px'
              } : {
                background: 'white',
                color: '#374151',
                alignSelf: 'flex-start',
                borderBottomLeftRadius: '4px',
                border: '1px solid #e5e7eb'
              })
            }}
          >
            {message.content}
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '18px',
            maxWidth: '80%',
            fontSize: '14px',
            background: 'white',
            color: '#374151',
            alignSelf: 'flex-start',
            borderBottomLeftRadius: '4px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #6b46c1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            AI is thinking... (this may take up to 30 seconds)
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1 }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your courses, assignments, or learning..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '20px',
              fontSize: '14px',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6b46c1';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            padding: '12px 20px',
            background: inputMessage.trim() && !isLoading ? '#6b46c1' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (inputMessage.trim() && !isLoading) {
              e.target.style.background = '#5b35b1';
            }
          }}
          onMouseLeave={(e) => {
            if (inputMessage.trim() && !isLoading) {
              e.target.style.background = '#6b46c1';
            }
          }}
        >
          <span>Send</span>
          <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: '#f3f4f6',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        💡 <strong>Tip:</strong> You can ask me about course content, help with assignments, study tips, or any learning-related questions!
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant; 