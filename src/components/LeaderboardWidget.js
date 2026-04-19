import React, { useState, useEffect } from 'react';
import axios from '../api';

const LeaderboardWidget = ({ userId, type = 'points', limit = 5 }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [type, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/gamification/leaderboard/${type}?limit=${limit + 10}`);
      setLeaderboard(response.data);
      
      // Find user's rank
      const userIndex = response.data.findIndex(entry => 
        entry.user?._id === userId || entry._id === userId
      );
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'points': return 'Points';
      case 'level': return 'Level';
      case 'streak': return 'Streak';
      default: return 'Score';
    }
  };

  const getValueDisplay = (entry) => {
    switch (type) {
      case 'points':
        return entry.totalPoints?.toLocaleString() || '0';
      case 'level':
        return `Level ${entry.level || 1}`;
      case 'streak':
        return `${entry.currentStreak || 0} days`;
      default:
        return '0';
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ color: '#6b7280' }}>Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, color: '#374151', fontSize: '18px' }}>
          👑 Top {getTypeLabel()}
        </h3>
        {userRank && (
          <div style={{
            background: '#f3f4f6',
            color: '#374151',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Your Rank: #{userRank}
          </div>
        )}
      </div>

      {/* Leaderboard List */}
      {leaderboard.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {leaderboard.slice(0, limit).map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.user?._id === userId || entry._id === userId;
            
            return (
              <div
                key={entry._id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: isCurrentUser ? '#eff6ff' : '#f9fafb',
                  border: isCurrentUser ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Rank */}
                <div style={{
                  background: getRankColor(rank),
                  color: rank <= 3 ? 'white' : 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {rank <= 3 ? getRankIcon(rank) : rank}
                </div>

                {/* User Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#374151',
                    fontSize: '14px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {entry.user?.firstName || 'Unknown'} {entry.user?.lastName || 'User'}
                    {isCurrentUser && (
                      <span style={{ color: '#3b82f6', marginLeft: '4px' }}>(You)</span>
                    )}
                  </div>
                  {entry.title && (
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {entry.title}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div style={{
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#374151',
                    fontSize: '16px'
                  }}>
                    {getValueDisplay(entry)}
                  </div>
                  {type === 'points' && entry.level && (
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      Level {entry.level}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
          <div style={{ fontSize: '14px' }}>No leaderboard data yet!</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Be the first to earn points!
          </div>
        </div>
      )}

      {/* View More Button */}
      {leaderboard.length > limit && (
        <div style={{
          textAlign: 'center',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button style={{
            background: 'transparent',
            color: '#6366f1',
            border: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            View Full Leaderboard →
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {userRank && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <span style={{ color: '#0369a1', fontWeight: 'bold' }}>
              Your Position
            </span>
            <span style={{ color: '#0c4a6e', fontWeight: 'bold' }}>
              #{userRank} of {leaderboard.length}+
            </span>
          </div>
          {userRank <= 10 && (
            <div style={{
              fontSize: '12px',
              color: '#0369a1',
              marginTop: '4px',
              textAlign: 'center'
            }}>
              🎉 You're in the top 10!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardWidget;
