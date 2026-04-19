import React, { useState, useEffect } from 'react';
import axios from '../api';

const SessionSummaryViewer = ({ sessionId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSummary();
  }, [sessionId]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`/session-summary/session/${sessionId}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      if (error.response?.status === 404) {
        setSummary({ 
          status: 'not_found',
          message: 'No summary available for this session yet.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp;
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'concept': return '💡';
      case 'example': return '📝';
      case 'qa': return '❓';
      case 'demo': return '🖥️';
      case 'important': return '⭐';
      default: return '📌';
    }
  };

  if (loading) {
    return <div className="loading">Generating summary...</div>;
  }

  if (!summary || summary.status === 'not_found') {
    return (
      <div className="no-summary">
        <h3>📋 No Summary Available</h3>
        <p>This session hasn't been summarized yet. Generate a summary using the recording URL and duration.</p>
      </div>
    );
  }

  return (
    <div className="session-summary">
      <div className="summary-header">
        <h2>📋 Session Summary</h2>
        <div className="session-info">
          <span>{summary.course?.title}</span>
          <span>Duration: {summary.duration} minutes</span>
          <span className={`status ${summary.status}`}>{summary.status}</span>
        </div>
      </div>

      <div className="summary-tabs">
        {['overview', 'keypoints', 'highlights'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="summary-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-card">
              <h3>📖 Session Overview</h3>
              <p>{summary.summary?.overview}</p>
            </div>

            <div className="topics-card">
              <h3>🎯 Main Topics Covered</h3>
              <ul>
                {summary.summary?.mainTopics?.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>

            <div className="action-items-card">
              <h3>✅ Action Items</h3>
              <ul>
                {summary.summary?.actionItems?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {summary.summary?.nextSession && (
              <div className="next-session-card">
                <h3>➡️ Next Session</h3>
                <p>{summary.summary.nextSession}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'keypoints' && (
          <div className="keypoints-section">
            <h3>🔑 Key Points</h3>
            {summary.keyPoints?.map((point, index) => (
              <div key={index} className="keypoint-item">
                <div className="keypoint-header">
                  <span className="timestamp">{formatTime(point.timestamp)}</span>
                  <span 
                    className="importance-badge"
                    style={{ backgroundColor: getImportanceColor(point.importance) }}
                  >
                    {point.importance}
                  </span>
                </div>
                <h4>{point.title}</h4>
                <p>{point.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'highlights' && (
          <div className="highlights-section">
            <h3>⭐ Important Segments</h3>
            {summary.highlights?.map((highlight, index) => (
              <div key={index} className="highlight-item">
                <div className="highlight-header">
                  <span className="time-range">
                    {formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}
                  </span>
                  <span className="category">
                    {getCategoryIcon(highlight.category)} {highlight.category}
                  </span>
                </div>
                <h4>{highlight.title}</h4>
                <p>{highlight.description}</p>
                <button className="jump-to-time">
                  ▶️ Jump to Segment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .session-summary {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .summary-header {
          margin-bottom: 20px;
        }

        .session-info {
          display: flex;
          gap: 15px;
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }

        .status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .status.completed { background: #d4edda; color: #155724; }
        .status.processing { background: #fff3cd; color: #856404; }
        .status.failed { background: #f8d7da; color: #721c24; }

        .summary-tabs {
          display: flex;
          border-bottom: 2px solid #eee;
          margin-bottom: 20px;
        }

        .tab {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }

        .tab.active {
          border-bottom-color: #007bff;
          color: #007bff;
          font-weight: bold;
        }

        .overview-section {
          display: grid;
          gap: 20px;
        }

        .overview-card, .topics-card, .action-items-card, .next-session-card {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .keypoint-item, .highlight-item {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          background: white;
        }

        .keypoint-header, .highlight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .timestamp, .time-range {
          font-family: monospace;
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .importance-badge {
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .category {
          background: #e3f2fd;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .jump-to-time {
          background: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 10px;
        }

        .loading, .error {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default SessionSummaryViewer;
