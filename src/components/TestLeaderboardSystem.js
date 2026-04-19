import React, { useState } from 'react';
import ComprehensiveLeaderboard from './ComprehensiveLeaderboard';
import GameResultsManager from '../utils/GameResultsManager';

const TestLeaderboardSystem = () => {
  const [message, setMessage] = useState('');

  // Mock user for testing
  const mockUser = {
    firstName: 'John',
    lastName: 'Student',
    id: 'test-user-123'
  };

  // Test functions to simulate game completions
  const simulateVersusGame = () => {
    const gameData = {
      player1Name: 'John Student',
      player2Name: 'Sarah Khan',
      player1Score: Math.floor(Math.random() * 8) + 2, // 2-9 correct
      player2Score: Math.floor(Math.random() * 8) + 2,
      totalQuestions: 10,
      duration: Math.floor(Math.random() * 180) + 120, // 2-5 minutes
      roundResults: []
    };

    GameResultsManager.saveVersusResult(gameData);
    setMessage(`✅ Versus game saved! ${gameData.player1Name}: ${gameData.player1Score}, ${gameData.player2Name}: ${gameData.player2Score}`);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  const simulateAIBattle = () => {
    const aiOpponents = ['Alex AI', 'Bolt AI', 'Einstein AI'];
    const gameData = {
      playerName: 'John Student',
      aiOpponent: aiOpponents[Math.floor(Math.random() * aiOpponents.length)],
      playerScore: Math.floor(Math.random() * 8) + 1,
      aiScore: Math.floor(Math.random() * 8) + 1,
      totalQuestions: 10,
      aiAccuracy: 0.8,
      duration: Math.floor(Math.random() * 200) + 100,
      roundResults: []
    };

    GameResultsManager.saveAIBattleResult(gameData);
    setMessage(`🤖 AI Battle saved! You: ${gameData.playerScore} vs ${gameData.aiOpponent}: ${gameData.aiScore}`);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const simulateAITeacher = () => {
    const modes = ['friendly', 'competitive', 'learning'];
    const gameData = {
      playerName: 'John Student',
      score: Math.floor(Math.random() * 8) + 2,
      totalQuestions: 10,
      timeSpent: Math.floor(Math.random() * 300) + 180,
      hintsUsed: Math.floor(Math.random() * 3),
      topicsCompleted: [modes[Math.floor(Math.random() * modes.length)]],
      sessionData: {
        mode: modes[Math.floor(Math.random() * modes.length)],
        conversationLength: Math.floor(Math.random() * 20) + 10,
        bestStreak: Math.floor(Math.random() * 8) + 1
      }
    };

    GameResultsManager.saveAITeacherResult(gameData);
    setMessage(`📚 AI Teacher session saved! Score: ${gameData.score}/${gameData.totalQuestions} in ${gameData.sessionData.mode} mode`);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const generateDemoData = () => {
    // Generate multiple games to populate leaderboard
    for (let i = 0; i < 5; i++) {
      simulateVersusGame();
      simulateAIBattle();
      simulateAITeacher();
    }
    setMessage('🎮 Generated demo data! Check the leaderboards below.');
    setTimeout(() => setMessage(''), 4000);
  };

  const clearAllData = () => {
    GameResultsManager.clearAllData();
    setMessage('🗑️ All leaderboard data cleared!');
    setTimeout(() => setMessage(''), 3000);
  };

  const showCurrentStats = () => {
    const stats = GameResultsManager.getPlayerStats('John Student');
    if (stats) {
      setMessage(`📊 Your Stats: ${stats.totalPoints} pts, ${stats.averageAccuracy}% accuracy, ${stats.totalGames} games`);
    } else {
      setMessage('📊 No stats found. Play some games first!');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🧪 Leaderboard System Test</h1>
        <p style={styles.subtitle}>Test and demonstrate the comprehensive leaderboard functionality</p>
      </div>

      {/* Message Display */}
      {message && (
        <div style={styles.messageBox}>
          {message}
        </div>
      )}

      {/* Test Controls */}
      <div style={styles.testControls}>
        <h3 style={styles.controlsTitle}>🎮 Simulate Game Completions</h3>
        <div style={styles.buttonGrid}>
          <button style={styles.testButton} onClick={simulateVersusGame}>
            ⚔️ Simulate Versus Battle
          </button>
          <button style={styles.testButton} onClick={simulateAIBattle}>
            🤖 Simulate AI Battle
          </button>
          <button style={styles.testButton} onClick={simulateAITeacher}>
            📚 Simulate AI Teacher Session
          </button>
          <button style={styles.demoButton} onClick={generateDemoData}>
            🎲 Generate Demo Data (5 of each)
          </button>
          <button style={styles.statsButton} onClick={showCurrentStats}>
            📊 Show My Stats
          </button>
          <button style={styles.clearButton} onClick={clearAllData}>
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div style={styles.explanation}>
        <h3 style={styles.explanationTitle}>🔧 How It Works</h3>
        <div style={styles.explanationGrid}>
          <div style={styles.explanationCard}>
            <div style={styles.explanationIcon}>⚔️</div>
            <h4>Versus Battle</h4>
            <p>Student vs Student competitions save both players' scores and determine winners for leaderboard ranking.</p>
          </div>
          <div style={styles.explanationCard}>
            <div style={styles.explanationIcon}>🤖</div>
            <h4>AI Battle</h4>
            <p>Human vs AI battles track your performance against different AI personalities and difficulty levels.</p>
          </div>
          <div style={styles.explanationCard}>
            <div style={styles.explanationIcon}>📚</div>
            <h4>AI Teacher</h4>
            <p>Solo learning sessions with AI teacher track accuracy, time spent, and learning progress.</p>
          </div>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div style={styles.leaderboardSection}>
        <h2 style={styles.leaderboardTitle}>🏆 Live Leaderboard System</h2>
        <p style={styles.leaderboardDesc}>
          Results update automatically as you simulate games above. 
          All categories are based on correct answers and performance metrics.
        </p>
        <ComprehensiveLeaderboard user={mockUser} />
      </div>

      {/* Stats Summary */}
      <div style={styles.statsPreview}>
        <h3 style={styles.statsTitle}>📈 Current Data Summary</h3>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚔️</div>
            <div style={styles.statValue}>
              {JSON.parse(localStorage.getItem('versusResults') || '[]').length}
            </div>
            <div style={styles.statLabel}>Versus Games</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🤖</div>
            <div style={styles.statValue}>
              {JSON.parse(localStorage.getItem('aiBattleResults') || '[]').length}
            </div>
            <div style={styles.statLabel}>AI Battles</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📚</div>
            <div style={styles.statValue}>
              {JSON.parse(localStorage.getItem('aiTeacherResults') || '[]').length}
            </div>
            <div style={styles.statLabel}>Teacher Sessions</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statValue}>
              {Object.keys(JSON.parse(localStorage.getItem('playerStats') || '{}')).length}
            </div>
            <div style={styles.statLabel}>Total Players</div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    margin: 0
  },
  messageBox: {
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
  },
  testControls: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  controlsTitle: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '20px'
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  testButton: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  },
  demoButton: {
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  },
  statsButton: {
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
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
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
  },
  explanation: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  explanationTitle: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '20px'
  },
  explanationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  explanationCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  },
  explanationIcon: {
    fontSize: '2rem',
    marginBottom: '10px'
  },
  leaderboardSection: {
    marginBottom: '30px'
  },
  leaderboardTitle: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '2rem'
  },
  leaderboardDesc: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '1.1rem'
  },
  statsPreview: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  statsTitle: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  },
  statCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '10px'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b'
  }
};

export default TestLeaderboardSystem;