import React, { useState } from 'react';
import axios from '../api';
import SessionSummaryViewer from './SessionSummaryViewer';

const SessionSummaryManager = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [duration, setDuration] = useState('');

  const handleGenerateSummary = async (sessionId) => {
    if (!recordingUrl || !duration) {
      alert('Please provide recording URL and duration');
      return;
    }

    setGenerating(true);
    try {
      await axios.post(`/session-summary/generate/${sessionId}`, {
        recordingUrl,
        duration: parseInt(duration)
      });
      
      alert('Summary generation started! Check back in a few minutes.');
      setRecordingUrl('');
      setDuration('');
    } catch (error) {
      console.error('Error generating summary:', error);
      if (error.response?.status === 404) {
        alert('Session summary service is not available. Please contact administrator.');
      } else {
        alert('Error generating summary: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="summary-manager">
      <h2>📋 Session Summary Manager</h2>
      
      <div className="sessions-list">
        <h3>Recent Sessions</h3>
        {sessions?.map(session => (
          <div key={session._id} className="session-item">
            <div className="session-info">
              <h4>{session.title}</h4>
              <p>{new Date(session.date).toLocaleDateString()}</p>
            </div>
            
            <div className="session-actions">
              <button 
                onClick={() => setSelectedSession(session._id)}
                className="view-summary-btn"
              >
                View Summary
              </button>
              
              <div className="generate-section">
                <input
                  type="url"
                  placeholder="Recording URL"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <button
                  onClick={() => handleGenerateSummary(session._id)}
                  disabled={generating}
                  className="generate-btn"
                >
                  {generating ? 'Generating...' : 'Generate Summary'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSession && (
        <div className="summary-viewer">
          <button 
            onClick={() => setSelectedSession(null)}
            className="close-btn"
          >
            ✕ Close Summary
          </button>
          <SessionSummaryViewer sessionId={selectedSession} />
        </div>
      )}

      <style jsx>{`
        .summary-manager {
          padding: 20px;
        }

        .session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 10px;
          background: white;
        }

        .session-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .generate-section {
          display: flex;
          gap: 5px;
        }

        .generate-section input {
          padding: 5px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 120px;
        }

        .view-summary-btn, .generate-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .view-summary-btn {
          background: #007bff;
          color: white;
        }

        .generate-btn {
          background: #28a745;
          color: white;
        }

        .generate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .summary-viewer {
          margin-top: 30px;
          border-top: 2px solid #eee;
          padding-top: 20px;
        }

        .close-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default SessionSummaryManager;
