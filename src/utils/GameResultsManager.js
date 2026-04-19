// Game Results Manager - Tracks scores across all gamification modes

class GameResultsManager {
  static saveVersusResult(gameData) {
    const result = {
      player1: gameData.player1Name,
      player2: gameData.player2Name,
      player1Score: gameData.player1Score,
      player2Score: gameData.player2Score,
      player1Correct: gameData.player1Score, // Assuming score = correct answers
      player2Correct: gameData.player2Score,
      totalQuestions: gameData.totalQuestions || 10,
      winner: gameData.player1Score > gameData.player2Score ? gameData.player1Name : 
              gameData.player2Score > gameData.player1Score ? gameData.player2Name : 'tie',
      duration: gameData.duration || 0,
      date: Date.now(),
      mode: 'versus',
      roundResults: gameData.roundResults || []
    };

    this.saveResult('versusResults', result);
    this.updatePlayerStats(gameData.player1Name, {
      mode: 'versus',
      score: gameData.player1Score,
      totalQuestions: gameData.totalQuestions || 10,
      won: result.winner === gameData.player1Name
    });
    this.updatePlayerStats(gameData.player2Name, {
      mode: 'versus', 
      score: gameData.player2Score,
      totalQuestions: gameData.totalQuestions || 10,
      won: result.winner === gameData.player2Name
    });

    // Broadcast real-time update
    this.broadcastGameComplete('versus', result);

    return result;
  }

  static saveAIBattleResult(gameData) {
    const result = {
      player: gameData.playerName,
      aiOpponent: gameData.aiOpponent,
      playerScore: gameData.playerScore,
      aiScore: gameData.aiScore,
      playerCorrect: gameData.playerScore,
      totalQuestions: gameData.totalQuestions || 10,
      winner: gameData.playerScore > gameData.aiScore ? gameData.playerName : 
              gameData.aiScore > gameData.playerScore ? gameData.aiOpponent : 'tie',
      aiAccuracy: gameData.aiAccuracy || 0,
      duration: gameData.duration || 0,
      date: Date.now(),
      mode: 'aiBattle',
      roundResults: gameData.roundResults || []
    };

    this.saveResult('aiBattleResults', result);
    this.updatePlayerStats(gameData.playerName, {
      mode: 'aiBattle',
      score: gameData.playerScore,
      totalQuestions: gameData.totalQuestions || 10,
      won: result.winner === gameData.playerName,
      aiOpponent: gameData.aiOpponent
    });

    // Broadcast real-time update
    this.broadcastGameComplete('aiBattle', result);

    return result;
  }

  static saveAITeacherResult(gameData) {
    const result = {
      player: gameData.playerName,
      score: gameData.score,
      totalQuestions: gameData.totalQuestions || 10,
      accuracy: ((gameData.score / (gameData.totalQuestions || 10)) * 100),
      timeSpent: gameData.timeSpent || 0,
      hintsUsed: gameData.hintsUsed || 0,
      topicsCompleted: gameData.topicsCompleted || [],
      date: Date.now(),
      mode: 'aiTeacher',
      sessionData: gameData.sessionData || {}
    };

    this.saveResult('aiTeacherResults', result);
    this.updatePlayerStats(gameData.playerName, {
      mode: 'aiTeacher',
      score: gameData.score,
      totalQuestions: gameData.totalQuestions || 10,
      timeSpent: gameData.timeSpent || 0
    });

    // Broadcast real-time update
    this.broadcastGameComplete('aiTeacher', result);

    return result;
  }

  static saveResult(key, result) {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(result);
    
    // Keep only last 100 results to avoid storage issues
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  }

  static updatePlayerStats(playerName, gameData) {
    const statsKey = 'playerStats';
    const allStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
    
    if (!allStats[playerName]) {
      allStats[playerName] = {
        name: playerName,
        totalGames: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalPoints: 0,
        versusGames: 0,
        versusWins: 0,
        aiBattleGames: 0,
        aiBattleWins: 0,
        aiTeacherSessions: 0,
        bestStreak: 0,
        currentStreak: 0,
        averageAccuracy: 0,
        lastPlayed: Date.now(),
        achievements: []
      };
    }

    const playerStats = allStats[playerName];
    
    // Update general stats
    playerStats.totalGames++;
    playerStats.totalCorrect += gameData.score;
    playerStats.totalQuestions += gameData.totalQuestions;
    playerStats.totalPoints += gameData.score;
    playerStats.lastPlayed = Date.now();
    
    // Update mode-specific stats
    if (gameData.mode === 'versus') {
      playerStats.versusGames++;
      if (gameData.won) {
        playerStats.versusWins++;
        playerStats.totalPoints += 2; // Bonus for winning
        playerStats.currentStreak++;
      } else {
        playerStats.currentStreak = 0;
      }
    } else if (gameData.mode === 'aiBattle') {
      playerStats.aiBattleGames++;
      if (gameData.won) {
        playerStats.aiBattleWins++;
        playerStats.totalPoints += 3; // Higher bonus for beating AI
        playerStats.currentStreak++;
      } else {
        playerStats.currentStreak = 0;
      }
    } else if (gameData.mode === 'aiTeacher') {
      playerStats.aiTeacherSessions++;
      playerStats.totalPoints += Math.floor(gameData.score * 0.5); // Learning bonus
    }

    // Update best streak
    if (playerStats.currentStreak > playerStats.bestStreak) {
      playerStats.bestStreak = playerStats.currentStreak;
    }

    // Calculate accuracy
    playerStats.averageAccuracy = Math.round((playerStats.totalCorrect / playerStats.totalQuestions) * 100);

    // Check for achievements
    this.checkAchievements(playerStats);

    // Save updated stats
    allStats[playerName] = playerStats;
    localStorage.setItem(statsKey, JSON.stringify(allStats));
  }

  static checkAchievements(playerStats) {
    const achievements = [];

    // Score-based achievements
    if (playerStats.totalPoints >= 100 && !playerStats.achievements.includes('century')) {
      achievements.push({
        id: 'century',
        name: 'Century Club',
        description: 'Earned 100 total points',
        icon: '💯',
        date: Date.now()
      });
    }

    if (playerStats.totalPoints >= 500 && !playerStats.achievements.includes('pointMaster')) {
      achievements.push({
        id: 'pointMaster',
        name: 'Point Master',
        description: 'Earned 500 total points',
        icon: '⭐',
        date: Date.now()
      });
    }

    // Accuracy achievements
    if (playerStats.averageAccuracy >= 90 && playerStats.totalQuestions >= 50 && !playerStats.achievements.includes('sharpshooter')) {
      achievements.push({
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: '90%+ accuracy over 50 questions',
        icon: '🎯',
        date: Date.now()
      });
    }

    // Streak achievements
    if (playerStats.bestStreak >= 10 && !playerStats.achievements.includes('streakMaster')) {
      achievements.push({
        id: 'streakMaster',
        name: 'Streak Master',
        description: 'Achieved 10+ question streak',
        icon: '🔥',
        date: Date.now()
      });
    }

    // Versus battle achievements
    if (playerStats.versusWins >= 5 && !playerStats.achievements.includes('competitor')) {
      achievements.push({
        id: 'competitor',
        name: 'Competitor',
        description: 'Won 5 versus battles',
        icon: '⚔️',
        date: Date.now()
      });
    }

    // AI battle achievements
    if (playerStats.aiBattleWins >= 3 && !playerStats.achievements.includes('aiSlayer')) {
      achievements.push({
        id: 'aiSlayer',
        name: 'AI Slayer',
        description: 'Defeated 3 AI opponents',
        icon: '🤖',
        date: Date.now()
      });
    }

    // Learning achievements
    if (playerStats.aiTeacherSessions >= 10 && !playerStats.achievements.includes('scholar')) {
      achievements.push({
        id: 'scholar',
        name: 'Scholar',
        description: 'Completed 10 learning sessions',
        icon: '📚',
        date: Date.now()
      });
    }

    // Add new achievements and broadcast them
    achievements.forEach(achievement => {
      if (!playerStats.achievements.find(a => a.id === achievement.id)) {
        playerStats.achievements.push(achievement);
        // Broadcast achievement unlocked
        this.broadcastAchievement(playerStats.name, achievement);
      }
    });

    return achievements;
  }

  static getPlayerStats(playerName) {
    const allStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
    return allStats[playerName] || null;
  }

  static getAllResults() {
    return {
      versus: JSON.parse(localStorage.getItem('versusResults') || '[]'),
      aiBattle: JSON.parse(localStorage.getItem('aiBattleResults') || '[]'),
      aiTeacher: JSON.parse(localStorage.getItem('aiTeacherResults') || '[]')
    };
  }

  static getLeaderboards() {
    const allStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
    const players = Object.values(allStats);

    return {
      overall: players.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10),
      accuracy: players.filter(p => p.totalQuestions >= 10)
                      .sort((a, b) => b.averageAccuracy - a.averageAccuracy).slice(0, 10),
      versus: players.filter(p => p.versusGames > 0)
                    .sort((a, b) => b.versusWins - a.versusWins).slice(0, 10),
      aiBattle: players.filter(p => p.aiBattleGames > 0)
                      .sort((a, b) => b.aiBattleWins - a.aiBattleWins).slice(0, 10),
      aiTeacher: players.filter(p => p.aiTeacherSessions > 0)
                       .sort((a, b) => (b.totalCorrect / b.aiTeacherSessions) - (a.totalCorrect / a.aiTeacherSessions)).slice(0, 10),
      streaks: players.sort((a, b) => b.bestStreak - a.bestStreak).slice(0, 10)
    };
  }

  static exportStats() {
    return {
      playerStats: JSON.parse(localStorage.getItem('playerStats') || '{}'),
      results: this.getAllResults(),
      exportDate: new Date().toISOString()
    };
  }

  static importStats(data) {
    if (data.playerStats) {
      localStorage.setItem('playerStats', JSON.stringify(data.playerStats));
    }
    if (data.results) {
      if (data.results.versus) {
        localStorage.setItem('versusResults', JSON.stringify(data.results.versus));
      }
      if (data.results.aiBattle) {
        localStorage.setItem('aiBattleResults', JSON.stringify(data.results.aiBattle));
      }
      if (data.results.aiTeacher) {
        localStorage.setItem('aiTeacherResults', JSON.stringify(data.results.aiTeacher));
      }
    }
  }

  static clearAllData() {
    localStorage.removeItem('playerStats');
    localStorage.removeItem('versusResults');
    localStorage.removeItem('aiBattleResults');
    localStorage.removeItem('aiTeacherResults');
  }

  static getPlayerRank(playerName, category = 'overall') {
    const leaderboards = this.getLeaderboards();
    const categoryBoard = leaderboards[category] || [];
    const playerIndex = categoryBoard.findIndex(p => p.name === playerName);
    return playerIndex >= 0 ? playerIndex + 1 : null;
  }

  static getTopPerformers(limit = 5) {
    const allStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
    const players = Object.values(allStats);
    
    return {
      topScorers: players.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit),
      topAccuracy: players.filter(p => p.totalQuestions >= 10)
                         .sort((a, b) => b.averageAccuracy - a.averageAccuracy).slice(0, limit),
      topStreaks: players.sort((a, b) => b.bestStreak - a.bestStreak).slice(0, limit),
      mostActive: players.sort((a, b) => b.totalGames - a.totalGames).slice(0, limit)
    };
  }

  // Real-time broadcasting methods
  static broadcastGameComplete(gameType, result) {
    // Create custom event for real-time updates
    const eventData = {
      type: gameType,
      result: result,
      timestamp: Date.now(),
      playersInvolved: this.getPlayersFromResult(result, gameType)
    };

    // Dispatch browser event
    window.dispatchEvent(new CustomEvent('gameCompleted', { 
      detail: eventData 
    }));

    // Also dispatch leaderboard update event
    window.dispatchEvent(new CustomEvent('leaderboardUpdate', { 
      detail: { reason: 'gameComplete', data: eventData }
    }));

    console.log(`🔥 REAL-TIME: ${gameType} game completed!`, eventData);
  }

  static getPlayersFromResult(result, gameType) {
    switch(gameType) {
      case 'versus':
        return [result.player1, result.player2];
      case 'aiBattle':
        return [result.player];
      case 'aiTeacher':
        return [result.player];
      default:
        return [];
    }
  }

  static broadcastRankingChange(changeData) {
    window.dispatchEvent(new CustomEvent('rankingChanged', { 
      detail: changeData 
    }));
    console.log('📊 REAL-TIME: Rankings updated!', changeData);
  }

  static broadcastAchievement(playerName, achievement) {
    const eventData = {
      player: playerName,
      achievement: achievement,
      timestamp: Date.now()
    };

    window.dispatchEvent(new CustomEvent('achievementUnlocked', { 
      detail: eventData 
    }));
    console.log('🏆 REAL-TIME: Achievement unlocked!', eventData);
  }
}

export default GameResultsManager;