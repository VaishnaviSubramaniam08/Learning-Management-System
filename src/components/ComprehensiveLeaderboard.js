import React, { useState, useEffect } from 'react';

const ComprehensiveLeaderboard = ({ user }) => {
  const [leaderboardData, setLeaderboardData] = useState({
    overall: [],
    versus: [],
    aiBattle: [],
    aiTeacher: [],
    accuracy: [],
    streaks: []
  });
  const [activeCategory, setActiveCategory] = useState('overall');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month'
  const [userStats, setUserStats] = useState(null);

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

  // Initialize leaderboard data
  useEffect(() => {
    loadLeaderboardData();
    loadUserStats();
  }, [user, timeFilter]);

  const loadLeaderboardData = () => {
    // Get all stored game results
    const allResults = {
      versus: JSON.parse(localStorage.getItem('versusResults') || '[]'),
      aiBattle: JSON.parse(localStorage.getItem('aiBattleResults') || '[]'),
      aiTeacher: JSON.parse(localStorage.getItem('aiTeacherResults') || '[]')
    };

    // Add some demo data if empty
    if (allResults.versus.length === 0 && allResults.aiBattle.length === 0 && allResults.aiTeacher.length === 0) {
      generateDemoData(allResults);
    }

    // Process and calculate leaderboards
    const processedData = processLeaderboardData(allResults);
    setLeaderboardData(processedData);
  };

  const generateDemoData = (allResults) => {
    // Demo players
    const demoPlayers = [
      { name: 'Alex Chen', avatar: '👨‍🎓', level: 15 },
      { name: 'Sarah Khan', avatar: '👩‍🎓', level: 12 },
      { name: 'Mike Johnson', avatar: '👨‍🎓', level: 18 },
      { name: 'Priya Sharma', avatar: '👩‍🎓', level: 14 },
      { name: 'John Williams', avatar: '👨‍🎓', level: 16 },
      { name: 'Emma Davis', avatar: '👩‍🎓', level: 13 },
      { name: 'Ryan Wilson', avatar: '👨‍🎓', level: 17 },
      { name: 'Lisa Brown', avatar: '👩‍🎓', level: 11 }
    ];

    // Generate demo versus battle results
    for (let i = 0; i < 20; i++) {
      const player1 = demoPlayers[Math.floor(Math.random() * demoPlayers.length)];
      const player2 = demoPlayers[Math.floor(Math.random() * demoPlayers.length)];
      if (player1.name !== player2.name) {
        const p1Score = Math.floor(Math.random() * 8) + 2;
        const p2Score = Math.floor(Math.random() * 8) + 2;
        allResults.versus.push({
          player1: player1.name,
          player2: player2.name,
          player1Score: p1Score,
          player2Score: p2Score,
          totalQuestions: 10,
          winner: p1Score > p2Score ? player1.name : p2Score > p1Score ? player2.name : 'tie',
          date: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          mode: 'versus'
        });
      }
    }

    // Generate demo AI battle results
    const aiOpponents = ['Alex AI', 'Bolt AI', 'Einstein AI'];
    for (let i = 0; i < 15; i++) {
      const player = demoPlayers[Math.floor(Math.random() * demoPlayers.length)];
      const ai = aiOpponents[Math.floor(Math.random() * aiOpponents.length)];
      const playerScore = Math.floor(Math.random() * 8) + 1;
      const aiScore = Math.floor(Math.random() * 8) + 1;
      allResults.aiBattle.push({
        player: player.name,
        aiOpponent: ai,
        playerScore: playerScore,
        aiScore: aiScore,
        totalQuestions: 10,
        winner: playerScore > aiScore ? player.name : aiScore > playerScore ? ai : 'tie',
        date: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        mode: 'aiBattle'
      });
    }

    // Generate demo AI teacher results
    for (let i = 0; i < 12; i++) {
      const player = demoPlayers[Math.floor(Math.random() * demoPlayers.length)];
      const score = Math.floor(Math.random() * 8) + 2;
      allResults.aiTeacher.push({
        player: player.name,
        score: score,
        totalQuestions: 10,
        accuracy: (score / 10) * 100,
        timeSpent: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
        date: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        mode: 'aiTeacher'
      });
    }

    // Save demo data
    localStorage.setItem('versusResults', JSON.stringify(allResults.versus));
    localStorage.setItem('aiBattleResults', JSON.stringify(allResults.aiBattle));
    localStorage.setItem('aiTeacherResults', JSON.stringify(allResults.aiTeacher));
  };

  const processLeaderboardData = (allResults) => {
    const playerStats = {};

    // Process versus battle results
    allResults.versus.forEach(result => {
      [result.player1, result.player2].forEach((playerName, index) => {
        if (!playerStats[playerName]) {
          playerStats[playerName] = {
            name: playerName,
            avatar: '👨‍🎓',
            totalGames: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            versusWins: 0,
            versusGames: 0,
            aiBattleWins: 0,
            aiBattleGames: 0,
            aiTeacherSessions: 0,
            bestStreak: 0,
            averageAccuracy: 0,
            totalPoints: 0
          };
        }

        const playerScore = index === 0 ? result.player1Score : result.player2Score;
        const isWinner = result.winner === playerName;

        playerStats[playerName].totalGames++;
        playerStats[playerName].versusGames++;
        playerStats[playerName].totalCorrect += playerScore;
        playerStats[playerName].totalQuestions += result.totalQuestions;
        playerStats[playerName].totalPoints += playerScore;
        
        if (isWinner) {
          playerStats[playerName].versusWins++;
          playerStats[playerName].totalPoints += 2; // Bonus for winning
        }
      });
    });

    // Process AI battle results
    allResults.aiBattle.forEach(result => {
      if (!playerStats[result.player]) {
        playerStats[result.player] = {
          name: result.player,
          avatar: '👨‍🎓',
          totalGames: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          versusWins: 0,
          versusGames: 0,
          aiBattleWins: 0,
          aiBattleGames: 0,
          aiTeacherSessions: 0,
          bestStreak: 0,
          averageAccuracy: 0,
          totalPoints: 0
        };
      }

      const isWinner = result.winner === result.player;

      playerStats[result.player].totalGames++;
      playerStats[result.player].aiBattleGames++;
      playerStats[result.player].totalCorrect += result.playerScore;
      playerStats[result.player].totalQuestions += result.totalQuestions;
      playerStats[result.player].totalPoints += result.playerScore;

      if (isWinner) {
        playerStats[result.player].aiBattleWins++;
        playerStats[result.player].totalPoints += 3; // Higher bonus for beating AI
      }
    });

    // Process AI teacher results
    allResults.aiTeacher.forEach(result => {
      if (!playerStats[result.player]) {
        playerStats[result.player] = {
          name: result.player,
          avatar: '👨‍🎓',
          totalGames: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          versusWins: 0,
          versusGames: 0,
          aiBattleWins: 0,
          aiBattleGames: 0,
          aiTeacherSessions: 0,
          bestStreak: 0,
          averageAccuracy: 0,
          totalPoints: 0
        };
      }

      playerStats[result.player].totalGames++;
      playerStats[result.player].aiTeacherSessions++;
      playerStats[result.player].totalCorrect += result.score;
      playerStats[result.player].totalQuestions += result.totalQuestions;
      playerStats[result.player].totalPoints += result.score;
    });

    // Calculate accuracy and streaks
    Object.values(playerStats).forEach(player => {
      player.averageAccuracy = player.totalQuestions > 0 
        ? Math.round((player.totalCorrect / player.totalQuestions) * 100) 
        : 0;
      player.bestStreak = Math.floor(Math.random() * 15) + 5; // Mock streak data
    });

    // Create different leaderboard rankings
    const players = Object.values(playerStats);
    
    return {
      overall: [...players].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10),
      versus: [...players].filter(p => p.versusGames > 0)
        .sort((a, b) => b.versusWins - a.versusWins).slice(0, 10),
      aiBattle: [...players].filter(p => p.aiBattleGames > 0)
        .sort((a, b) => b.aiBattleWins - a.aiBattleWins).slice(0, 10),
      aiTeacher: [...players].filter(p => p.aiTeacherSessions > 0)
        .sort((a, b) => (b.totalCorrect / Math.max(b.aiTeacherSessions, 1)) - (a.totalCorrect / Math.max(a.aiTeacherSessions, 1))).slice(0, 10),
      accuracy: [...players].filter(p => p.totalQuestions >= 10)
        .sort((a, b) => b.averageAccuracy - a.averageAccuracy).slice(0, 10),
      streaks: [...players].sort((a, b) => b.bestStreak - a.bestStreak).slice(0, 10)
    };
  };

  const loadUserStats = () => {
    if (!user) return;
    
    // Get user's personal stats
    const userName = user.firstName + ' ' + user.lastName || user.name || 'You';
    const allData = {
      versus: JSON.parse(localStorage.getItem('versusResults') || '[]'),
      aiBattle: JSON.parse(localStorage.getItem('aiBattleResults') || '[]'),
      aiTeacher: JSON.parse(localStorage.getItem('aiTeacherResults') || '[]')
    };

    // Calculate user's stats
    let userPersonalStats = {
      name: userName,
      totalGames: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      versusWins: 0,
      aiBattleWins: 0,
      aiTeacherSessions: 0,
      overallRank: 0,
      totalPoints: 0
    };

    // This would be calculated from actual user data
    setUserStats(userPersonalStats);
  };

  const saveGameResult = (gameData) => {
    const { mode, ...result } = gameData;
    const key = `${mode}Results`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      ...result,
      date: Date.now(),
      mode
    });
    localStorage.setItem(key, JSON.stringify(existing));
    
    // Refresh leaderboard
    loadLeaderboardData();
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

  const renderLeaderboardList = (players, category) => (
    <div style={styles.leaderboardList}>
      {players.map((player, index) => (
        <div 
          key={player.name} 
          style={{
            ...styles.playerRow,
            ...(index < 3 ? styles.topThree : {}),
            ...(player.name === (user?.firstName + ' ' + user?.lastName) ? styles.currentUser : {})
          }}
        >
          <div style={styles.rankSection}>
            <div style={styles.rankIcon}>
              {getRankIcon(index + 1)}
            </div>
          </div>
          
          <div style={styles.playerInfo}>
            <div style={styles.playerAvatar}>{player.avatar}</div>
            <div style={styles.playerDetails}>
              <div style={styles.playerName}>{player.name}</div>
              <div style={styles.playerSubtext}>
                {category === 'overall' && `${player.totalGames} games played`}
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
      ))}
    </div>
  );

  const renderUserStats = () => {
    if (!userStats) return null;
    
    return (
      <div style={styles.userStatsCard}>
        <h3 style={styles.userStatsTitle}>📊 Your Performance</h3>
        <div style={styles.userStatsGrid}>
          <div style={styles.userStatItem}>
            <div style={styles.userStatValue}>0</div>
            <div style={styles.userStatLabel}>Total Games</div>
          </div>
          <div style={styles.userStatItem}>
            <div style={styles.userStatValue}>0%</div>
            <div style={styles.userStatLabel}>Accuracy</div>
          </div>
          <div style={styles.userStatItem}>
            <div style={styles.userStatValue}>0</div>
            <div style={styles.userStatLabel}>Total Points</div>
          </div>
          <div style={styles.userStatItem}>
            <div style={styles.userStatValue}>-</div>
            <div style={styles.userStatLabel}>Overall Rank</div>
          </div>
        </div>
        <div style={styles.playMorePrompt}>
          🎮 Play more games to appear on leaderboards!
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Gaming Leaderboards</h1>
        <p style={styles.subtitle}>Top performers across all learning game modes</p>
      </div>

      {/* User Stats */}
      {renderUserStats()}

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
            {categories[activeCategory].description}
          </p>
        </div>
        
        <div style={styles.filters}>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            style={styles.timeFilter}
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={styles.leaderboardContainer}>
        {leaderboardData[activeCategory] && leaderboardData[activeCategory].length > 0 ? (
          renderLeaderboardList(leaderboardData[activeCategory], activeCategory)
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎮</div>
            <div style={styles.emptyTitle}>No data yet!</div>
            <div style={styles.emptyText}>
              Play some games to see leaderboards here
            </div>
          </div>
        )}
      </div>

      {/* Game Mode Links */}
      <div style={styles.gameLinks}>
        <h3 style={styles.gameLinksTitle}>🎮 Play Games to Earn Rankings</h3>
        <div style={styles.gameLinkButtons}>
          <button style={styles.gameLinkButton}>
            ⚔️ Versus Battle
          </button>
          <button style={styles.gameLinkButton}>
            🤖 AI Battle
          </button>
          <button style={styles.gameLinkButton}>
            👨‍🏫 AI Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

// Comprehensive Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },

  // Header
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

  // User Stats
  userStatsCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  userStatsTitle: {
    color: '#1e293b',
    marginBottom: '20px',
    textAlign: 'center'
  },
  userStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  userStatItem: {
    textAlign: 'center'
  },
  userStatValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: '5px'
  },
  userStatLabel: {
    fontSize: '0.9rem',
    color: '#64748b'
  },
  playMorePrompt: {
    textAlign: 'center',
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '15px',
    borderRadius: '12px',
    fontWeight: 'bold'
  },

  // Category Tabs
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  categoryTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '50px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    fontSize: '0.9rem'
  },
  activeTab: {
    background: '#6366f1',
    color: 'white',
    borderColor: '#6366f1'
  },
  categoryIcon: {
    fontSize: '1.2rem'
  },
  categoryLabel: {
    fontWeight: 'bold'
  },

  // Category Header
  categoryHeader: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  categoryInfo: {
    flex: 1
  },
  categoryTitle: {
    fontSize: '1.8rem',
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
  filters: {
    display: 'flex',
    gap: '10px'
  },
  timeFilter: {
    padding: '8px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer'
  },

  // Leaderboard
  leaderboardContainer: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
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
  currentUser: {
    background: 'linear-gradient(135deg, #dbeafe, #3b82f6)',
    color: '#1e40af',
    border: '2px solid #3b82f6'
  },
  rankSection: {
    minWidth: '60px',
    textAlign: 'center'
  },
  rankIcon: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  playerInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  playerAvatar: {
    fontSize: '2rem'
  },
  playerDetails: {
    flex: 1
  },
  playerName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '2px'
  },
  playerSubtext: {
    fontSize: '0.9rem',
    color: '#64748b'
  },
  scoreSection: {
    textAlign: 'right',
    minWidth: '100px'
  },
  score: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },

  // Empty State
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

  // Game Links
  gameLinks: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  gameLinksTitle: {
    color: '#1e293b',
    marginBottom: '20px'
  },
  gameLinkButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  gameLinkButton: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
  }
};

export default ComprehensiveLeaderboard;