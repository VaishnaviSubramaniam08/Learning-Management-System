import React, { useState, useEffect } from 'react';
import axios from '../api';
import './NotesRepository.css';

const NotesRepository = ({ user, examCode }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedContentType, setSelectedContentType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  
  // UI State
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // AI Recommendations
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [userWeakTopics, setUserWeakTopics] = useState([]);

  useEffect(() => {
    fetchNotesData();
    fetchUserProgress();
  }, [examCode]);

  useEffect(() => {
    applyFilters();
  }, [notes, selectedSubject, selectedTopic, selectedDifficulty, selectedContentType, searchQuery, sortBy]);

  const fetchNotesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/career-exam-prep/notes/${examCode}`);
      setNotes(response.data.notes);
      setSubjects(response.data.subjects);
      setTopics(response.data.topics);

      // Fetch AI recommendations
      const aiResponse = await axios.get(`/api/career-exam-prep/ai-recommendations/${examCode}/${user.id}`);
      setAiRecommendations(aiResponse.data);
    } catch (error) {
      setError('Failed to load notes. Please try again.');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`/api/career-exam-prep/user-progress/${examCode}/${user.id}`);
      setUserWeakTopics(response.data.weakTopics || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...notes];

    // Apply filters
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }
    if (selectedTopic !== 'All') {
      filtered = filtered.filter(note => note.topic === selectedTopic);
    }
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(note => note.difficulty === selectedDifficulty);
    }
    if (selectedContentType !== 'All') {
      filtered = filtered.filter(note => note.contentType === selectedContentType);
    }
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  };

  const handleDownload = async (noteId) => {
    try {
      const response = await axios.post(`/api/career-exam-prep/download-note/${noteId}`, {
        userId: user.id
      });
      
      // Track download
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note._id === noteId 
            ? { ...note, downloadCount: note.downloadCount + 1 }
            : note
        )
      );

      // Trigger download
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading note:', error);
      alert('Failed to download. Please try again.');
    }
  };

  const handlePreview = (note) => {
    setSelectedNote(note);
    setShowPreview(true);
    
    // Track view
    axios.post(`/api/career-exam-prep/view-note/${note._id}`, {
      userId: user.id
    }).catch(console.error);
  };

  const handleRating = async (noteId, rating) => {
    try {
      await axios.post(`/api/career-exam-prep/rate-note/${noteId}`, {
        userId: user.id,
        rating
      });
      
      // Update local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note._id === noteId 
            ? { ...note, rating: (note.rating + rating) / 2 } // Simplified rating update
            : note
        )
      );
    } catch (error) {
      console.error('Error rating note:', error);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'PPT': return '📊';
      case 'Video': return '🎥';
      case 'Text': return '📝';
      case 'Interactive': return '🎮';
      default: return '📋';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderStarRating = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={star <= rating ? 'star filled' : 'star'}
          >
            ⭐
          </span>
        ))}
        <span className="rating-value">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const renderNoteCard = (note) => (
    <div key={note._id} className="note-card">
      <div className="note-header">
        <div className="note-type">
          <span className="content-icon">{getContentTypeIcon(note.contentType)}</span>
          <span className="content-type">{note.contentType}</span>
        </div>
        <div 
          className="difficulty-badge" 
          style={{ backgroundColor: getDifficultyColor(note.difficulty) }}
        >
          {note.difficulty}
        </div>
      </div>
      
      <div className="note-content">
        <h3 className="note-title">{note.title}</h3>
        <p className="note-description">{note.description}</p>
        
        <div className="note-meta">
          <span className="subject">{note.subject}</span>
          <span className="topic">{note.topic}</span>
          {note.estimatedTime && (
            <span className="duration">⏱️ {note.estimatedTime} min</span>
          )}
        </div>
        
        <div className="note-tags">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
          {note.tags.length > 3 && <span className="tag-more">+{note.tags.length - 3}</span>}
        </div>
      </div>
      
      <div className="note-footer">
        <div className="note-stats">
          {renderStarRating(note.rating)}
          <span className="downloads">📥 {note.downloadCount}</span>
          <span className="views">👁️ {note.viewCount}</span>
        </div>
        
        <div className="note-actions">
          <button 
            className="btn-preview" 
            onClick={() => handlePreview(note)}
          >
            👁️ Preview
          </button>
          <button 
            className="btn-download" 
            onClick={() => handleDownload(note._id)}
          >
            📥 Download
          </button>
        </div>
      </div>
      
      {/* AI Recommendation Badge */}
      {aiRecommendations.includes(note._id) && (
        <div className="ai-recommendation-badge">
          🤖 AI Recommended
        </div>
      )}
      
      {/* Weak Topic Badge */}
      {userWeakTopics.includes(note.topic) && (
        <div className="weak-topic-badge">
          🎯 Focus Area
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="notes-repository">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notes repository...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notes-repository">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchNotesData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-repository">
      {/* Header */}
      <div className="repository-header">
        <div className="header-content">
          <h1>📚 Notes Repository</h1>
          <p>Comprehensive study materials for {examCode}</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{notes.length}</span>
            <span className="stat-label">Total Notes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{subjects.length}</span>
            <span className="stat-label">Subjects</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{aiRecommendations.length}</span>
            <span className="stat-label">AI Recommendations</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      {aiRecommendations.length > 0 && (
        <div className="ai-recommendations-section">
          <h2>🤖 AI Recommendations for You</h2>
          <p>Based on your weak topics and study patterns</p>
          <div className="recommendations-grid">
            {notes
              .filter(note => aiRecommendations.includes(note._id))
              .slice(0, 3)
              .map(renderNoteCard)
            }
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search notes, topics, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
        
        <div className="filters-controls">
          <button 
            className="filters-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔧 Filters {showFilters ? '▲' : '▼'}
          </button>
          
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Subject:</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="All">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Topic:</label>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                <option value="All">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Difficulty:</label>
              <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Content Type:</label>
              <select value={selectedContentType} onChange={(e) => setSelectedContentType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="PDF">PDF</option>
                <option value="PPT">PowerPoint</option>
                <option value="Video">Video</option>
                <option value="Text">Text</option>
                <option value="Interactive">Interactive</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="rating">Rating</option>
                <option value="downloads">Downloads</option>
                <option value="recent">Most Recent</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {filteredNotes.length} of {notes.length} notes</p>
      </div>

      {/* Notes Grid/List */}
      <div className={`notes-container ${viewMode}`}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map(renderNoteCard)
        ) : (
          <div className="no-results">
            <p>No notes found matching your criteria.</p>
            <button onClick={() => {
              setSelectedSubject('All');
              setSelectedTopic('All');
              setSelectedDifficulty('All');
              setSelectedContentType('All');
              setSearchQuery('');
            }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedNote && (
        <div className="preview-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedNote.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {selectedNote.contentType === 'Video' ? (
                <div className="video-preview">
                  <iframe 
                    src={selectedNote.content.videoUrl} 
                    title={selectedNote.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : selectedNote.contentType === 'Text' ? (
                <div className="text-preview">
                  <p>{selectedNote.content.textContent}</p>
                </div>
              ) : (
                <div className="file-preview">
                  <p>Preview not available for {selectedNote.contentType} files.</p>
                  <button 
                    className="download-btn"
                    onClick={() => handleDownload(selectedNote._id)}
                  >
                    Download to View
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <div className="rating-section">
                <span>Rate this content:</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className="star-btn"
                    onClick={() => handleRating(selectedNote._id, star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesRepository;
