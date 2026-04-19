import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

const ChatbotPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello! I'm your AI learning assistant. I'm here to help you succeed in your educational journey! 

🎯 I can help you with:
• Course information and enrollment guidance
• Progress tracking and motivation
• Assignment and deadline reminders
• Learning tips and study strategies
• Certificate and achievement information
• General educational support

What would you like to know about today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        fetchUserData(userData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        axios.get('/courses'),
        axios.get(`/courses/student/${userId}/enrollments`)
      ]);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

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
    "Learning tips",
    "Certificate status",
    "Study schedule",
    "Motivation boost"
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    handleSendMessage({ preventDefault: () => {} });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/login");
  };

  const handleBackToDashboard = () => {
    navigate("/student-dashboard");
  };

  const learningResources = [
    {
      title: "Study Techniques",
      description: "Effective methods for better learning",
      icon: "📚",
      tips: [
        "Use the Pomodoro Technique (25 min work, 5 min break)",
        "Create mind maps for complex topics",
        "Practice active recall instead of passive reading",
        "Teach concepts to others to reinforce learning"
      ]
    },
    {
      title: "Time Management",
      description: "Organize your study schedule efficiently",
      icon: "⏰",
      tips: [
        "Use a digital calendar to track deadlines",
        "Prioritize tasks using the Eisenhower Matrix",
        "Set specific, achievable goals for each study session",
        "Avoid multitasking - focus on one task at a time"
      ]
    },
    {
      title: "Motivation & Focus",
      description: "Stay motivated and maintain concentration",
      icon: "🎯",
      tips: [
        "Create a dedicated study space free from distractions",
        "Reward yourself for completing milestones",
        "Connect learning to your personal goals",
        "Practice mindfulness and meditation for focus"
      ]
    },
    {
      title: "Memory Techniques",
      description: "Improve retention and recall",
      icon: "🧠",
      tips: [
        "Use spaced repetition for long-term retention",
        "Create acronyms and mnemonics",
        "Associate new information with existing knowledge",
        "Review material within 24 hours of learning"
      ]
    }
  ];

  const getProgressStats = () => {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'enrolled').length;
    const averageProgress = enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0;

    return { totalCourses, completedCourses, inProgressCourses, averageProgress };
  };

  const stats = getProgressStats();

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={handleBackToDashboard}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 15px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ color: 'white', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white', fontSize: '16px' }}>
            Welcome, {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        padding: '20px',
        gap: '20px',
        overflow: 'hidden'
      }}>
        {/* Left Sidebar - Stats and Resources */}
        <div style={{
          width: '300px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '25px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflow: 'hidden'
        }}>
          {/* Progress Stats */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            padding: '20px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>📊 Your Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Courses:</span>
                <span style={{ fontWeight: 'bold' }}>{stats.totalCourses}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed:</span>
                <span style={{ fontWeight: 'bold' }}>{stats.completedCourses}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>In Progress:</span>
                <span style={{ fontWeight: 'bold' }}>{stats.inProgressCourses}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Avg Progress:</span>
                <span style={{ fontWeight: 'bold' }}>{stats.averageProgress}%</span>
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px' }}>📚 Learning Resources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {learningResources.map((resource, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                                     onMouseEnter={(e) => {
                     e.target.style.background = '#e9ecef';
                     e.target.style.borderColor = '#667eea';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = '#f8f9fa';
                     e.target.style.borderColor = 'transparent';
                   }}
                  onClick={() => {
                    const tipsText = `${resource.title}\n\n${resource.tips.map(tip => `• ${tip}`).join('\n')}`;
                    setMessages(prev => [...prev, {
                      id: Date.now(),
                      type: 'bot',
                      content: tipsText,
                      timestamp: new Date()
                    }]);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{resource.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>{resource.title}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{resource.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                                     style={{
                     background: 'white',
                     border: '2px solid #667eea',
                     borderRadius: '8px',
                     padding: '10px 15px',
                     fontSize: '14px',
                     cursor: 'pointer',
                     color: '#667eea',
                     fontWeight: '500',
                     transition: 'all 0.3s ease',
                     textAlign: 'left'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = '#667eea';
                     e.target.style.color = 'white';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'white';
                     e.target.style.color = '#667eea';
                   }}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Container */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '25px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '32px' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '24px' }}>AI Learning Assistant</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Online • Ready to help with your studies</div>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '25px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: '#f8f9fa'
          }}>
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
                    maxWidth: '70%',
                    padding: '16px 20px',
                    borderRadius: message.type === 'user' ? '25px 25px 0 25px' : '25px 25px 25px 0',
                    backgroundColor: message.type === 'user' ? '#667eea' : '#e9ecef',
                    color: message.type === 'user' ? 'white' : '#333',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    wordWrap: 'break-word',
                    boxShadow: message.type === 'user' 
                      ? '0 8px 20px rgba(102, 126, 234, 0.2)' 
                      : '0 8px 20px rgba(233, 236, 239, 0.5)',
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
                    padding: '16px 20px',
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

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '25px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '15px',
              backgroundColor: 'white',
              flexShrink: 0
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '16px 24px',
                border: '2px solid #e0e0e0',
                borderRadius: '30px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: inputMessage.trim() && !isTyping ? '#667eea' : '#ccc',
                color: 'white',
                border: 'none',
                fontSize: '24px',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: inputMessage.trim() && !isTyping 
                  ? '0 6px 15px rgba(102, 126, 234, 0.3)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (inputMessage.trim() && !isTyping) {
                  e.target.style.backgroundColor = '#5a67d8';
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (inputMessage.trim() && !isTyping) {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 6px 15px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              ➤
            </button>
          </form>
        </div>
      </div>

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
    </div>
  );
};

export default ChatbotPage;
