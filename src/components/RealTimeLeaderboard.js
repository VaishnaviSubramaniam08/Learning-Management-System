import React, { useState, useEffect, useRef } from 'react';
import GameResultsManager from '../utils/GameResultsManager';

const RealTimeLeaderboard = ({ user, onBack }) => {
  const [leaderboardData, setLeaderboardData] = useState({
    overall: [],
    versus: [],
    aiBattle: [],
    aiTeacher: [],
    accuracy: [],
    streaks: []
  });
  const [activeCategory, setActiveCategory] = useState('overall');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [rankingChanges, setRankingChanges] = useState(new Map());
  const [newEntries, setNewEntries] = useState(new Set());
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef(null);
  const previousDataRef = useRef(null);

  // Categories for the leaderboard
  const categories = {
    overall: {
      title: '🏆 Overall Champions',
      icon: '👑',
      description: 'Top performers across all game modes',
      color: '#ffd700'
    },
    versus: {
      title: '⚔️ Versus Battle Winners',
      icon: '⚔️',
      description: 'Best student vs student competitors',
      color: '#ff6b6b'
    },
    aiBattle: {
      title: '🤖 AI Battle Champions',
      icon: '🤖',
      description: 'Top human vs AI performers',
      color: '#007bff'
    },
    aiTeacher: {
      title: '👨‍🏫 AI Teacher Stars',
      icon: '📚',
      description: 'Best solo learning achievers',
      color: '#28a745'
    },
    accuracy: {
      title: '🎯 Accuracy Masters',
      icon: '🎯',
      description: 'Highest accuracy across all modes',
      color: '#6366f1'
    },
    streaks: {
      title: '🔥 Streak Legends',
      icon: '🔥',
      description: 'Longest winning streaks',
      color: '#f59e0b'
    }
  };

  // Real-time data fetching
  useEffect(() => {
    const fetchData = () => {
      try {
        const newData = processLeaderboardData();
        
        // Compare with previous data to detect changes
        if (previousDataRef.current) {
          detectRankingChanges(previousDataRef.current, newData);
        }
        
        setLeaderboardData(newData);
        previousDataRef.current = newData;
        setLastUpdate(Date.now());
        setUpdateCount(prev => prev + 1);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up real-time polling
    if (isLive) {
      intervalRef.current = setInterval(fetchData, 2000); // Update every 2 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive]);

  // Listen for storage changes (when new games are completed)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && (
        e.key.includes('Results') || 
        e.key.includes('playerStats')
      )) {
        // Immediate update when new game data is saved
        setTimeout(() => {
          const newData = processLeaderboardData();
          detectRankingChanges(previousDataRef.current || {}, newData);
          setLeaderboardData(newData);
          previousDataRef.current = newData;
          setLastUpdate(Date.now());
          setUpdateCount(prev => prev + 1);
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from game completions
    const handleGameComplete = () => {
      setTimeout(() => {
        const newData = processLeaderboardData();
        detectRankingChanges(previousDataRef.current || {}, newData);
        setLeaderboardData(newData);
        previousDataRef.current = newData;
        setLastUpdate(Date.now());
        setUpdateCount(prev => prev + 1);
      }, 100);
    };

    window.addEventListener('gameCompleted', handleGameComplete);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gameCompleted', handleGameComplete);
    };
  }, []);

  const detectRankingChanges = (oldData, newData) => {
    const changes = new Map();
    const newEntrySet = new Set();

    Object.keys(categories).forEach(category => {
      const oldList = oldData[category] || [];
      const newList = newData[category] || [];

      newList.forEach((player, newIndex) => {
        const oldIndex = oldList.findIndex(p => p.name === player.name);
        
        if (oldIndex === -1) {
          // New player
          newEntrySet.add(`${category}-${player.name}`);
        } else if (oldIndex !== newIndex) {
          // Position changed
          const change = oldIndex > newIndex ? 'up' : 'down';
          changes.set(`${category}-${player.name}`, {
            change,
            from: oldIndex + 1,
            to: newIndex + 1
          });
        }
      });
    });

    setRankingChanges(changes);
    setNewEntries(newEntrySet);

    // Clear animations after 3 seconds
    setTimeout(() => {
      setRankingChanges(new Map());
      setNewEntries(new Set());
    }, 3000);
  };

  const processLeaderboardData = () => {
    const allResults = GameResultsManager.getAllResults();
    const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
    
    // If no data exists, generate some demo data
    if (Object.keys(playerStats).length === 0) {
      generateDemoData();
      return processLeaderboardData(); // Recursive call after demo data
    }

    const players = Object.values(playerStats);
    
    return {
      overall: [...players].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10),
      versus: [...players].filter(p => p.versusGames > 0)
        .sort((a, b) => b.versusWins - a.versusWins).slice(0, 10),
      aiBattle: [...players].filter(p => p.aiBattleGames > 0)
        .sort((a, b) => b.aiBattleWins - a.aiBattleWins).slice(0, 10),
      aiTeacher: [...players].filter(p => p.aiTeacherSessions > 0)
        .sort((a, b) => (b.totalCorrect / Math.max(b.aiTeacherSessions, 1)) - 
                        (a.totalCorrect / Math.max(a.aiTeacherSessions, 1))).slice(0, 10),
      accuracy: [...players].filter(p => p.totalQuestions >= 10)
        .sort((a, b) => b.averageAccuracy - a.averageAccuracy).slice(0, 10),
      streaks: [...players].sort((a, b) => b.bestStreak - a.bestStreak).slice(0, 10)
    };
  };

  const generateDemoData = () => {
    // Generate demo data only if none exists
    const demoPlayers = [
      { name: 'Alex Chen', avatar: '👨‍🎓' },
      { name: 'Sarah Khan', avatar: '👩‍🎓' },
      { name: 'Mike Johnson', avatar: '👨‍🎓' },
      { name: 'Priya Sharma', avatar: '👩‍🎓' },
      { name: 'Emma Davis', avatar: '👩‍🎓' },
      { name: 'Ryan Wilson', avatar: '👨‍🎓' }
    ];

    // Add current user to demo
    if (user) {
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'You';
      demoPlayers.push({ name: userName, avatar: '👨‍🎓' });
    }

    // Generate demo games
    demoPlayers.forEach(player => {
      // Versus games
      for (let i = 0; i < 3; i++) {
        const opponent = demoPlayers[Math.floor(Math.random() * demoPlayers.length)];
        if (opponent.name !== player.name) {
          GameResultsManager.saveVersusResult({
            player1Name: player.name,
            player2Name: opponent.name,
            player1Score: Math.floor(Math.random() * 8) + 2,
            player2Score: Math.floor(Math.random() * 8) + 2,
            totalQuestions: 10,
            duration: Math.random() * 180 + 120,
            roundResults: []
          });
        }
      }

      // AI battles
      for (let i = 0; i < 2; i++) {
        const ais = ['Alex AI', 'Bolt AI', 'Einstein AI'];
        GameResultsManager.saveAIBattleResult({
          playerName: player.name,
          aiOpponent: ais[Math.floor(Math.random() * ais.length)],
          playerScore: Math.floor(Math.random() * 8) + 1,
          aiScore: Math.floor(Math.random() * 8) + 1,
          totalQuestions: 10,
          aiAccuracy: 0.8,
          duration: Math.random() * 200 + 100,
          roundResults: []
        });
      }

      // AI teacher sessions
      GameResultsManager.saveAITeacherResult({
        playerName: player.name,
        score: Math.floor(Math.random() * 8) + 2,
        totalQuestions: 10,
        timeSpent: Math.random() * 300 + 180,
        hintsUsed: Math.floor(Math.random() * 3),
        topicsCompleted: ['learning'],
        sessionData: { mode: 'learning' }
      });
    });
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
  };

  const forceRefresh = () => {
    const newData = processLeaderboardData();
    setLeaderboardData(newData);
    setLastUpdate(Date.now());
    setUpdateCount(prev => prev + 1);
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getScoreDisplay = (player, category) => {
    switch(category) {
      case 'overall':
        return `${player.totalPoints} pts`;
      case 'versus':
        return `${player.versusWins}W / ${player.versusGames}G`;
      case 'aiBattle':
        return `${player.aiBattleWins}W / ${player.aiBattleGames}G`;
      case 'aiTeacher':
        return `${Math.round(player.totalCorrect / Math.max(player.aiTeacherSessions, 1))} avg`;
      case 'accuracy':
        return `${player.averageAccuracy}%`;
      case 'streaks':
        return `${player.bestStreak} streak`;
      default:
        return player.totalPoints;
    }
  };

  const getPlayerAnimation = (player, index, category) => {
    const key = `${category}-${player.name}`;
    const change = rankingChanges.get(key);
    const isNew = newEntries.has(key);
    const isCurrentUser = player.name === `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || player.name === user?.name;

    let animation = '';
    let backgroundColor = '';

    if (isNew) {
      animation = 'newEntry 2s ease-in-out';
      backgroundColor = '#ecfdf5';
    } else if (change) {
      if (change.change === 'up') {
        animation = 'rankUp 2s ease-in-out';
        backgroundColor = '#f0fdf4';
      } else {
        animation = 'rankDown 2s ease-in-out';
        backgroundColor = '#fef2f2';
      }
    }

    return {
      animation,
      backgroundColor: isCurrentUser ? '#dbeafe' : backgroundColor,
      border: isCurrentUser ? '2px solid #3b82f6' : isNew ? '2px solid #10b981' : 
              change?.change === 'up' ? '2px solid #16a34a' : 
              change?.change === 'down' ? '2px solid #dc2626' : '1px solid #e5e7eb'
    };
  };

  const renderLeaderboardList = (players, category) => (
    <div style={styles.leaderboardList}>
      {players.map((player, index) => {
        const animationStyle = getPlayerAnimation(player, index, category);
        return (
          <div 
            key={`${player.name}-${updateCount}`} // Force re-render for animations
            style={{
              ...styles.playerRow,
              ...(index < 3 ? styles.topThree : {}),
              ...animationStyle
            }}
          >
            <div style={styles.rankSection}>
              <div style={styles.rankIcon}>
                {getRankIcon(index + 1)}
              </div>
              {rankingChanges.get(`${category}-${player.name}`) && (
                <div style={styles.rankChange}>
                  {rankingChanges.get(`${category}-${player.name}`).change === 'up' ? '↗️' : '↘️'}
                </div>
              )}
            </div>
            
            <div style={styles.playerInfo}>
              <div style={styles.playerAvatar}>{player.avatar || '👨‍🎓'}</div>
              <div style={styles.playerDetails}>
                <div style={styles.playerName}>
                  {player.name}
                  {newEntries.has(`${category}-${player.name}`) && (
                    <span style={styles.newBadge}>NEW!</span>
                  )}
                </div>
                <div style={styles.playerSubtext}>
                  {category === 'overall' && `${player.totalGames} games • ${player.averageAccuracy}% acc`}
                  {category === 'versus' && `${Math.round((player.versusWins / Math.max(player.versusGames, 1)) * 100)}% win rate`}
                  {category === 'aiBattle' && `vs AI: ${Math.round((player.aiBattleWins / Math.max(player.aiBattleGames, 1)) * 100)}%`}
                  {category === 'aiTeacher' && `${player.aiTeacherSessions} sessions`}
                  {category === 'accuracy' && `${player.totalCorrect}/${player.totalQuestions} correct`}
                  {category === 'streaks' && `${player.totalGames} games played`}
                </div>
              </div>
            </div>
            
            <div style={styles.scoreSection}>
              <div style={styles.score}>
                {getScoreDisplay(player, category)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Gaming Hub
      </button>
      
      {/* Header with Live Status */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>📊 Real-Time Leaderboards</h1>
          <p style={styles.subtitle}>Live rankings updating every 2 seconds</p>
        </div>
        
        <div style={styles.liveControls}>
          <div style={styles.liveStatus}>
            <div style={{
              ...styles.liveIndicator,
              backgroundColor: isLive ? '#10b981' : '#6b7280'
            }}>
              <div style={{
                ...styles.livePulse,
                animation: isLive ? 'pulse 2s infinite' : 'none'
              }} />
            </div>
            <span style={styles.liveText}>
              {isLive ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          
          <button 
            style={{
              ...styles.liveButton,
              backgroundColor: isLive ? '#dc2626' : '#10b981'
            }}
            onClick={toggleLiveUpdates}
          >
            {isLive ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          
          <button style={styles.refreshButton} onClick={forceRefresh}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div style={styles.liveStats}>
        <div style={styles.statItem}>
          <span style={styles.statIcon}>⏱️</span>
          <span style={styles.statValue}>
            {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
          </span>
          <span style={styles.statLabel}>Last Update</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statIcon}>🔄</span>
          <span style={styles.statValue}>{updateCount}</span>
          <span style={styles.statLabel}>Updates</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statIcon}>👥</span>
          <span style={styles.statValue}>
            {Object.keys(JSON.parse(localStorage.getItem('playerStats') || '{}')).length}
          </span>
          <span style={styles.statLabel}>Players</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {Object.entries(categories).map(([key, category]) => (
          <button
            key={key}
            style={{
              ...styles.categoryTab,
              ...(activeCategory === key ? styles.activeTab : {})
            }}
            onClick={() => setActiveCategory(key)}
          >
            <span style={styles.categoryIcon}>{category.icon}</span>
            <span style={styles.categoryLabel}>{category.title.split(' ').slice(-1)[0]}</span>
            <span style={styles.playerCount}>
              ({leaderboardData[key]?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Active Category Display */}
      <div style={styles.categoryHeader}>
        <div style={styles.categoryInfo}>
          <h2 style={styles.categoryTitle}>
            {categories[activeCategory].icon} {categories[activeCategory].title}
          </h2>
          <p style={styles.categoryDescription}>
            {categories[activeCategory].description} • Updates every 2 seconds
          </p>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div style={styles.leaderboardContainer}>
        {leaderboardData[activeCategory] && leaderboardData[activeCategory].length > 0 ? (
          renderLeaderboardList(leaderboardData[activeCategory], activeCategory)
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎮</div>
            <div style={styles.emptyTitle}>No players yet!</div>
            <div style={styles.emptyText}>
              Play games to see real-time rankings here
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes newEntry {
          0% { 
            transform: translateX(-100%); 
            opacity: 0; 
            background-color: #10b981; 
          }
          50% { 
            transform: translateX(0); 
            background-color: #ecfdf5; 
          }
          100% { 
            opacity: 1; 
            background-color: #f8fafc; 
          }
        }
        
        @keyframes rankUp {
          0% { 
            transform: translateY(20px); 
            background-color: #16a34a; 
          }
          50% { 
            background-color: #f0fdf4; 
          }
          100% { 
            transform: translateY(0); 
            background-color: #f8fafc; 
          }
        }
        
        @keyframes rankDown {
          0% { 
            transform: translateY(-20px); 
            background-color: #dc2626; 
          }
          50% { 
            background-color: #fef2f2; 
          }
          100% { 
            transform: translateY(0); 
            background-color: #f8fafc; 
          }
        }
      `}</style>
    </div>
  );
};

// Styles (comprehensive styling object would go here)
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    gap: '20px'
  },
  titleSection: {
    flex: 1
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    marginBottom: '5px'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0
  },
  liveControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  liveStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  liveIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  livePulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'white'
  },
  liveText: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#374151'
  },
  liveButton: {
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  refreshButton: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  liveStats: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    background: 'white',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  statIcon: {
    fontSize: '1.2rem'
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b'
  },
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  categoryTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '25px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  activeTab: {
    background: '#6366f1',
    color: 'white',
    borderColor: '#6366f1'
  },
  categoryIcon: {
    fontSize: '1rem'
  },
  categoryLabel: {
    fontWeight: 'bold'
  },
  playerCount: {
    fontSize: '0.8rem',
    opacity: 0.8
  },
  categoryHeader: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  categoryInfo: {},
  categoryTitle: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    marginBottom: '8px'
  },
  categoryDescription: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0
  },
  leaderboardContainer: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    borderRadius: '12px',
    background: '#f8fafc',
    transition: 'all 0.3s ease'
  },
  topThree: {
    background: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
    color: '#92400e'
  },
  rankSection: {
    minWidth: '80px',
    textAlign: 'center',
    position: 'relative'
  },
  rankIcon: {
    fontSize: '1.3rem',
    fontWeight: 'bold'
  },
  rankChange: {
    fontSize: '0.8rem',
    position: 'absolute',
    right: '0',
    top: '0'
  },
  playerInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  playerAvatar: {
    fontSize: '1.8rem'
  },
  playerDetails: {
    flex: 1
  },
  playerName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  newBadge: {
    background: '#10b981',
    color: 'white',
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '8px',
    fontWeight: 'bold'
  },
  playerSubtext: {
    fontSize: '0.8rem',
    color: '#64748b'
  },
  scoreSection: {
    textAlign: 'right',
    minWidth: '100px'
  },
  score: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  emptyText: {
    fontSize: '1rem'
  },

  // Back Button Styles
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: '#374151',
    border: '2px solid rgba(99, 102, 241, 0.3)',
    fontSize: '1rem',
    fontWeight: 'bold',
    padding: '12px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    zIndex: 1000
  }
};

export default RealTimeLeaderboard;