import React, { useState, useRef, useEffect } from 'react';
import axios from '../api';

const Chatbot = ({ user, courses, enrollments }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI learning assistant. How can I help you with your studies today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the real AI chatbot API
      const response = await axios.post('/chatbot/chat', {
        message: inputMessage,
        user: user,
        courses: courses,
        enrollments: enrollments
      });

      const botResponse = response.data.success 
        ? response.data.message 
        : 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          content: botResponse,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Chatbot API Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I\'m experiencing some technical difficulties right now. Please try again in a moment.',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  };

  const quickReplies = [
    "Show my courses",
    "What's my progress?",
    "Help with assignments",
    "Learning tips"
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    handleSendMessage({ preventDefault: () => {} });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#28a7a1',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(40, 167, 161, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className="chatbot-window"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 15px 25px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            className="chatbot-header"
            style={{
              padding: '20px',
              background: 'linear-gradient(to right, #4dc0b5, #28a7a1)',
              color: 'white',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '24px' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>AI Learning Assistant</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Online • Ready to help</div>
            </div>
          </div>

          {/* Messages */}
          <div
            className="chatbot-messages"
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              backgroundColor: '#f7f7f7',
              scrollBehavior: 'smooth'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.5s ease-in-out'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: message.type === 'user' ? '25px 25px 0 25px' : '25px 25px 25px 0',
                    backgroundColor: message.type === 'user' ? '#28a7a1' : '#e9ecef',
                    color: message.type === 'user' ? 'white' : '#333',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    boxShadow: message.type === 'user' 
                      ? '0 5px 15px rgba(40, 167, 161, 0.2)' 
                      : '0 5px 15px rgba(233, 236, 239, 0.5)',
                    transform: 'scale(1.02)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '25px 25px 25px 0',
                    backgroundColor: '#e9ecef',
                    color: '#666',
                    fontSize: '16px',
                    animation: 'fadeIn 0.5s ease-in-out'
                  }}
                >
                  🤖 AI is thinking...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div
              className="quick-replies"
              style={{
                padding: '0 20px 15px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                backgroundColor: '#f7f7f7'
              }}
            >
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #28a7a1',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: '#28a7a1',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#28a7a1';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.color = '#28a7a1';
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '20px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '10px',
              backgroundColor: 'white'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: '2px solid #ddd',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#28a7a1';
                e.target.style.boxShadow = '0 0 8px rgba(40, 167, 161, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: inputMessage.trim() && !isTyping ? '#28a7a1' : '#ccc',
                color: 'white',
                border: 'none',
                fontSize: '20px',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: inputMessage.trim() && !isTyping 
                  ? '0 4px 8px rgba(40, 167, 161, 0.2)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (inputMessage.trim() && !isTyping) {
                  e.target.style.backgroundColor = '#1f8a84';
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 12px rgba(40, 167, 161, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (inputMessage.trim() && !isTyping) {
                  e.target.style.backgroundColor = '#28a7a1';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 161, 0.2)';
                }
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot; 