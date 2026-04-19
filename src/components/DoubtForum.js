import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import './DoubtForum.css';

const DoubtForum = ({ user, examCode }) => {
  const [currentView, setCurrentView] = useState('forum'); // forum, chatbot, ask-doubt
  const [doubts, setDoubts] = useState([]);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Forum State
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ask Doubt Form
  const [doubtForm, setDoubtForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    difficulty: 'Medium',
    questionType: 'Concept',
    tags: '',
    isAnonymous: false
  });
  
  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDoubts();
    initializeChatSession();
  }, [examCode]);

  useEffect(() => {
    if (selectedDoubt) {
      fetchAnswers(selectedDoubt._id);
    }
  }, [selectedDoubt]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/career-exam-prep/doubts/${examCode}`, {
        params: {
          subject: selectedSubject !== 'All' ? selectedSubject : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
          sortBy,
          search: searchQuery
        }
      });
      setDoubts(response.data);
    } catch (error) {
      setError('Failed to load doubts');
      console.error('Error fetching doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (doubtId) => {
    try {
      const response = await axios.get(`/api/career-exam-prep/doubt-answers/${doubtId}`);
      setAnswers(response.data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const initializeChatSession = async () => {
    try {
      const response = await axios.post('/api/career-exam-prep/init-chat-session', {
        userId: user.id,
        examCode
      });
      setChatSession(response.data);
      
      // Add welcome message
      setChatMessages([{
        id: 'welcome',
        sender: 'ai',
        content: `Hi ${user.name}! I'm your AI study assistant for ${examCode}. I can help you with concepts, solve problems, and answer your questions. What would you like to learn today?`,
        timestamp: new Date(),
        messageType: 'text'
      }]);
    } catch (error) {
      console.error('Error initializing chat session:', error);
    }
  };

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/career-exam-prep/ask-doubt', {
        ...doubtForm,
        examCode,
        askedBy: user.id,
        tags: doubtForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      
      setDoubts(prev => [response.data, ...prev]);
      setDoubtForm({
        title: '',
        description: '',
        subject: '',
        topic: '',
        difficulty: 'Medium',
        questionType: 'Concept',
        tags: '',
        isAnonymous: false
      });
      setCurrentView('forum');
      alert('Your doubt has been posted successfully!');
    } catch (error) {
      setError('Failed to post doubt');
      console.error('Error posting doubt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || chatLoading) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: currentMessage,
      timestamp: new Date(),
      messageType: 'text'
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setChatLoading(true);
    
    try {
      const response = await axios.post('/api/career-exam-prep/chat-message', {
        sessionId: chatSession.sessionId,
        message: currentMessage,
        examCode,
        userId: user.id
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        messageType: 'text',
        context: response.data.context
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        messageType: 'text'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleVoteDoubt = async (doubtId, voteType) => {
    try {
      await axios.post(`/api/career-exam-prep/vote-doubt/${doubtId}`, {
        userId: user.id,
        voteType
      });
      
      setDoubts(prev => prev.map(doubt => 
        doubt._id === doubtId 
          ? { 
              ...doubt, 
              upvotes: voteType === 'upvote' ? doubt.upvotes + 1 : doubt.upvotes,
              downvotes: voteType === 'downvote' ? doubt.downvotes + 1 : doubt.downvotes
            }
          : doubt
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderForumView = () => (
    <div className="forum-view">
      <div className="forum-header">
        <h1>💬 Doubt Clearing Forum</h1>
        <p>Get help from peers and mentors</p>
        
        <div className="forum-actions">
          <button 
            className="ask-doubt-btn"
            onClick={() => setCurrentView('ask-doubt')}
          >
            ❓ Ask a Doubt
          </button>
          <button 
            className="ai-chat-btn"
            onClick={() => setCurrentView('chatbot')}
          >
            🤖 AI Assistant
          </button>
        </div>
      </div>
      
      <div className="forum-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search doubts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={fetchDoubts}>🔍</button>
        </div>
        
        <div className="filter-controls">
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Mathematics">Mathematics</option>
          </select>
          
          <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      <div className="doubts-list">
        {doubts.map(doubt => (
          <div 
            key={doubt._id} 
            className={`doubt-card ${selectedDoubt?._id === doubt._id ? 'selected' : ''}`}
            onClick={() => setSelectedDoubt(doubt)}
          >
            <div className="doubt-header">
              <h3>{doubt.title}</h3>
              <div className="doubt-meta">
                <span className={`status ${doubt.status.toLowerCase()}`}>
                  {doubt.status}
                </span>
                <span className={`difficulty ${doubt.difficulty?.toLowerCase()}`}>
                  {doubt.difficulty}
                </span>
              </div>
            </div>
            
            <div className="doubt-content">
              <p>{doubt.description.substring(0, 150)}...</p>
              <div className="doubt-tags">
                {doubt.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="doubt-footer">
              <div className="doubt-stats">
                <span>👁️ {doubt.views}</span>
                <span>💬 {doubt.answersCount || 0}</span>
                <span>👍 {doubt.upvotes}</span>
              </div>
              <div className="doubt-info">
                <span>{doubt.subject}</span>
                <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedDoubt && (
        <div className="doubt-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedDoubt.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedDoubt(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="doubt-detail">
                <div className="doubt-question">
                  <p>{selectedDoubt.description}</p>
                  <div className="doubt-meta-detail">
                    <span>Subject: {selectedDoubt.subject}</span>
                    <span>Topic: {selectedDoubt.topic}</span>
                    <span>Difficulty: {selectedDoubt.difficulty}</span>
                    <span>Type: {selectedDoubt.questionType}</span>
                  </div>
                </div>
                
                <div className="doubt-actions">
                  <button 
                    className="vote-btn upvote"
                    onClick={() => handleVoteDoubt(selectedDoubt._id, 'upvote')}
                  >
                    👍 {selectedDoubt.upvotes}
                  </button>
                  <button 
                    className="vote-btn downvote"
                    onClick={() => handleVoteDoubt(selectedDoubt._id, 'downvote')}
                  >
                    👎 {selectedDoubt.downvotes}
                  </button>
                </div>
              </div>
              
              <div className="answers-section">
                <h3>💡 Answers ({answers.length})</h3>
                {answers.map(answer => (
                  <div key={answer._id} className="answer-card">
                    <div className="answer-header">
                      <div className="answerer-info">
                        <span className="answerer-name">{answer.answeredBy?.name || 'Anonymous'}</span>
                        <span className={`answerer-type ${answer.answerType.toLowerCase()}`}>
                          {answer.answerType}
                        </span>
                      </div>
                      <div className="answer-date">
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="answer-content">
                      <p>{answer.content}</p>
                    </div>
                    
                    <div className="answer-actions">
                      <button className="helpful-btn">
                        👍 Helpful ({answer.helpfulCount})
                      </button>
                      {answer.isAccepted && (
                        <span className="accepted-badge">✅ Accepted Answer</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {answers.length === 0 && (
                  <div className="no-answers">
                    <p>No answers yet. Be the first to help!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAskDoubtForm = () => (
    <div className="ask-doubt-form">
      <div className="form-header">
        <h1>❓ Ask a Doubt</h1>
        <p>Get help from our community of learners and mentors</p>
        <button 
          className="back-btn"
          onClick={() => setCurrentView('forum')}
        >
          ← Back to Forum
        </button>
      </div>
      
      <form onSubmit={handleAskDoubt} className="doubt-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={doubtForm.title}
            onChange={(e) => setDoubtForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Brief title for your doubt"
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Subject *</label>
            <select
              value={doubtForm.subject}
              onChange={(e) => setDoubtForm(prev => ({ ...prev, subject: e.target.value }))}
              required
            >
              <option value="">Select Subject</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Topic</label>
            <input
              type="text"
              value={doubtForm.topic}
              onChange={(e) => setDoubtForm(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Specific topic"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Difficulty</label>
            <select
              value={doubtForm.difficulty}
              onChange={(e) => setDoubtForm(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Question Type</label>
            <select
              value={doubtForm.questionType}
              onChange={(e) => setDoubtForm(prev => ({ ...prev, questionType: e.target.value }))}
            >
              <option value="Concept">Concept</option>
              <option value="Problem Solving">Problem Solving</option>
              <option value="Previous Year">Previous Year</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={doubtForm.description}
            onChange={(e) => setDoubtForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your doubt in detail..."
            rows={6}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            value={doubtForm.tags}
            onChange={(e) => setDoubtForm(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="Add tags separated by commas"
          />
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={doubtForm.isAnonymous}
              onChange={(e) => setDoubtForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
            />
            Post anonymously
          </label>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Posting...' : '📤 Post Doubt'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => setCurrentView('forum')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderChatbot = () => (
    <div className="chatbot-view">
      <div className="chat-header">
        <h1>🤖 AI Study Assistant</h1>
        <p>Get instant help with concepts and problems</p>
        <button 
          className="back-btn"
          onClick={() => setCurrentView('forum')}
        >
          ← Back to Forum
        </button>
      </div>
      
      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <p>{message.content}</p>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {chatLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask me anything about your studies..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={chatLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={chatLoading || !currentMessage.trim()}
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && currentView === 'forum') {
    return (
      <div className="doubt-forum">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading forum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doubt-forum">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchDoubts} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="doubt-forum">
      {currentView === 'forum' && renderForumView()}
      {currentView === 'ask-doubt' && renderAskDoubtForm()}
      {currentView === 'chatbot' && renderChatbot()}
    </div>
  );
};

export default DoubtForum;
