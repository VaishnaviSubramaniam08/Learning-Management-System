import React, { useState, useEffect } from 'react';
import RealTimeLeaderboard from './RealTimeLeaderboard';
import GameResultsManager from '../utils/GameResultsManager';

const RealTimeLeaderboardDemo = ({ onBack }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState(null);
  const [gameCount, setGameCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Mock user for testing
  const mockUser = {
    firstName: 'John',
    lastName: 'Student',
    id: 'demo-user-123'
  };

  // Demo players pool
  const demoPlayers = [
    { name: 'Alex Chen', avatar: '👨‍🎓' },
    { name: 'Sarah Khan', avatar: '👩‍🎓' },
    { name: 'Mike Johnson', avatar: '👨‍🎓' },
    { name: 'Priya Sharma', avatar: '👩‍🎓' },
    { name: 'Emma Davis', avatar: '👩‍🎓' },
    { name: 'Ryan Wilson', avatar: '👨‍🎓' },
    { name: 'Lisa Brown', avatar: '👩‍🎓' },
    { name: 'Tom Wilson', avatar: '👨‍🎓' },
    { name: 'John Student', avatar: '👨‍🎓' } // Include current user
  ];

  // Listen for real-time events
  useEffect(() => {
    const handleGameComplete = (event) => {
      const gameData = event.detail;
      addNotification(`🎮 ${gameData.type.toUpperCase()} game completed!`, 'success');
    };

    const handleAchievement = (event) => {
      const { player, achievement } = event.detail;
      addNotification(`🏆 ${player} unlocked: ${achievement.name}!`, 'achievement');
    };

    const handleRankingChange = (event) => {
      const changeData = event.detail;
      addNotification(`📊 Rankings updated!`, 'info');
    };

    // Add event listeners
    window.addEventListener('gameCompleted', handleGameComplete);
    window.addEventListener('achievementUnlocked', handleAchievement);
    window.addEventListener('rankingChanged', handleRankingChange);

    return () => {
      window.removeEventListener('gameCompleted', handleGameComplete);
      window.removeEventListener('achievementUnlocked', handleAchievement);
      window.removeEventListener('rankingChanged', handleRankingChange);
    };
  }, []);

  const addNotification = (message, type) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification].slice(-5)); // Keep only last 5

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 4000);
  };

  const simulateRandomGame = () => {
    const gameTypes = ['versus', 'aiBattle', 'aiTeacher'];
    const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];

    const player1 = demoPlayers[Math.floor(Math.random() * demoPlayers.length)];
    
    try {
      switch(gameType) {
        case 'versus':
          const player2 = demoPlayers.filter(p => p.name !== player1.name)[Math.floor(Math.random() * (demoPlayers.length - 1))];
          GameResultsManager.saveVersusResult({
            player1Name: player1.name,
            player2Name: player2.name,
            player1Score: Math.floor(Math.random() * 8) + 2,
            player2Score: Math.floor(Math.random() * 8) + 2,
            totalQuestions: 10,
            duration: Math.random() * 180 + 120,
            roundResults: []
          });
          break;

        case 'aiBattle':
          const ais = ['Alex AI', 'Bolt AI', 'Einstein AI'];
          GameResultsManager.saveAIBattleResult({
            playerName: player1.name,
            aiOpponent: ais[Math.floor(Math.random() * ais.length)],
            playerScore: Math.floor(Math.random() * 8) + 1,
            aiScore: Math.floor(Math.random() * 8) + 1,
            totalQuestions: 10,
            aiAccuracy: 0.8,
            duration: Math.random() * 200 + 100,
            roundResults: []
          });
          break;

        case 'aiTeacher':
          const modes = ['friendly', 'competitive', 'learning'];
          GameResultsManager.saveAITeacherResult({
            playerName: player1.name,
            score: Math.floor(Math.random() * 8) + 2,
            totalQuestions: 10,
            timeSpent: Math.random() * 300 + 180,
            hintsUsed: Math.floor(Math.random() * 3),
            topicsCompleted: [modes[Math.floor(Math.random() * modes.length)]],
            sessionData: { mode: modes[Math.floor(Math.random() * modes.length)] }
          });
          break;
      }

      setGameCount(prev => prev + 1);
    } catch (error) {
      console.error('Error simulating game:', error);
    }
  };

  const startAutoSimulation = () => {
    setIsSimulating(true);
    const interval = setInterval(() => {
      simulateRandomGame();
    }, 3000); // New game every 3 seconds
    setSimulationInterval(interval);
  };

  const stopAutoSimulation = () => {
    setIsSimulating(false);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  };

  const clearAllData = () => {
    GameResultsManager.clearAllData();
    setGameCount(0);
    addNotification('🗑️ All data cleared!', 'warning');
  };

  const generateBulkData = () => {
    for (let i = 0; i < 10; i++) {
      simulateRandomGame();
    }
    addNotification('🎲 Generated 10 random games!', 'success');
  };

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Gaming Hub
      </button>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚡ Real-Time Leaderboard Demo</h1>
        <p style={styles.subtitle}>
          Watch leaderboards update in real-time as games are completed! 
          Rankings change instantly with smooth animations.
        </p>
      </div>

      {/* Live Notifications */}
      <div style={styles.notificationsContainer}>
        {notifications.map(notification => (
          <div 
            key={notification.id}
            style={{
              ...styles.notification,
              ...styles[`notification_${notification.type}`]
            }}
          >
            {notification.message}
            <div style={styles.notificationTime}>
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div style={styles.controlPanel}>
        <h3 style={styles.controlTitle}>🎮 Live Game Simulation</h3>
        <div style={styles.controlGrid}>
          <button 
            style={styles.simulateButton} 
            onClick={simulateRandomGame}
            disabled={isSimulating}
          >
            🎯 Simulate Random Game
          </button>
          
          <button 
            style={{
              ...styles.autoButton,
              backgroundColor: isSimulating ? '#dc2626' : '#10b981'
            }}
            onClick={isSimulating ? stopAutoSimulation : startAutoSimulation}
          >
            {isSimulating ? '⏸️ Stop Auto-Simulation' : '▶️ Start Auto-Simulation'}
          </button>
          
          <button 
            style={styles.bulkButton} 
            onClick={generateBulkData}
            disabled={isSimulating}
          >
            🎲 Generate 10 Games
          </button>
          
          <button 
            style={styles.clearButton} 
            onClick={clearAllData}
            disabled={isSimulating}
          >
            🗑️ Clear All Data
          </button>
        </div>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{gameCount}</span>
            <span style={styles.statLabel}>Games Simulated</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>
              {isSimulating ? 'RUNNING' : 'STOPPED'}
            </span>
            <span style={styles.statLabel}>Auto-Simulation</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>2s</span>
            <span style={styles.statLabel}>Update Interval</span>
          </div>
        </div>
      </div>

      {/* Real-Time Features Info */}
      <div style={styles.featuresInfo}>
        <h3 style={styles.featuresTitle}>🚀 Real-Time Features</h3>
        <div style={styles.featuresList}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>⚡</span>
            <div>
              <div style={styles.featureName}>Live Updates</div>
              <div style={styles.featureDesc}>Rankings update every 2 seconds automatically</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🎬</span>
            <div>
              <div style={styles.featureName}>Smooth Animations</div>
              <div style={styles.featureDesc}>Players slide up/down when rankings change</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🆕</span>
            <div>
              <div style={styles.featureName}>New Player Highlights</div>
              <div style={styles.featureDesc}>Fresh entries appear with green glow effect</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🏆</span>
            <div>
              <div style={styles.featureName}>Achievement Notifications</div>
              <div style={styles.featureDesc}>Live alerts when players unlock achievements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Leaderboard */}
      <div style={styles.leaderboardSection}>
        <RealTimeLeaderboard user={mockUser} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.5
  },
  notificationsContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '300px'
  },
  notification: {
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.3s ease-out',
    position: 'relative'
  },
  notification_success: {
    background: 'linear-gradient(135deg, #10b981, #34d399)'
  },
  notification_info: {
    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)'
  },
  notification_achievement: {
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
  },
  notification_warning: {
    background: 'linear-gradient(135deg, #ef4444, #f87171)'
  },
  notificationTime: {
    fontSize: '0.7rem',
    opacity: 0.8,
    marginTop: '4px'
  },
  controlPanel: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  controlTitle: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '20px'
  },
  controlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  simulateButton: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  autoButton: {
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  bulkButton: {
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  clearButton: {
    background: 'linear-gradient(135deg, #dc3545, #e55563)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  statItem: {
    textAlign: 'center'
  },
  statValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b'
  },
  featuresInfo: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  featuresTitle: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '20px'
  },
  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  featureIcon: {
    fontSize: '1.5rem'
  },
  featureName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '4px'
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: '#64748b'
  },
  leaderboardSection: {
    marginTop: '20px'
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

export default RealTimeLeaderboardDemo;