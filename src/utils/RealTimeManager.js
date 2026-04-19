// Real-Time Manager - Handles live updates for leaderboards and notifications

class RealTimeManager {
  static listeners = new Map();
  static gameEventQueue = [];
  static isProcessing = false;

  // Subscribe to real-time updates
  static subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  // Broadcast events to all subscribers
  static broadcast(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} callback:`, error);
        }
      });
    }

    // Also dispatch browser event for cross-component communication
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  }

  // Notify when a game is completed
  static notifyGameComplete(gameData) {
    // Add to event queue
    this.gameEventQueue.push({
      type: 'gameComplete',
      data: gameData,
      timestamp: Date.now()
    });

    // Process the queue
    this.processEventQueue();

    // Broadcast immediately
    this.broadcast('gameCompleted', gameData);
    this.broadcast('leaderboardUpdate', { reason: 'gameComplete', data: gameData });
    
    console.log('🔥 REAL-TIME: Game completed!', gameData);
  }

  // Notify when rankings change
  static notifyRankingChange(changeData) {
    this.broadcast('rankingChanged', changeData);
    console.log('📊 REAL-TIME: Rankings updated!', changeData);
  }

  // Notify when new player joins
  static notifyNewPlayer(playerData) {
    this.broadcast('newPlayer', playerData);
    this.broadcast('leaderboardUpdate', { reason: 'newPlayer', data: playerData });
    console.log('👋 REAL-TIME: New player joined!', playerData);
  }

  // Notify achievement unlocked
  static notifyAchievement(achievementData) {
    this.broadcast('achievementUnlocked', achievementData);
    console.log('🏆 REAL-TIME: Achievement unlocked!', achievementData);
  }

  // Process event queue for batching updates
  static async processEventQueue() {
    if (this.isProcessing || this.gameEventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process events in batches
      const events = [...this.gameEventQueue];
      this.gameEventQueue = [];

      // Group events by type for efficient processing
      const eventsByType = events.reduce((acc, event) => {
        if (!acc[event.type]) acc[event.type] = [];
        acc[event.type].push(event);
        return acc;
      }, {});

      // Process each event type
      Object.entries(eventsByType).forEach(([type, typeEvents]) => {
        this.broadcast(`batch_${type}`, typeEvents);
      });

      // Delay to prevent too frequent updates
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error('Error processing event queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Get current leaderboard state
  static getCurrentLeaderboardState() {
    return {
      timestamp: Date.now(),
      playerCount: Object.keys(JSON.parse(localStorage.getItem('playerStats') || '{}')).length,
      gameCount: {
        versus: JSON.parse(localStorage.getItem('versusResults') || '[]').length,
        aiBattle: JSON.parse(localStorage.getItem('aiBattleResults') || '[]').length,
        aiTeacher: JSON.parse(localStorage.getItem('aiTeacherResults') || '[]').length
      }
    };
  }

  // Create live notification
  static createLiveNotification(title, message, type = 'info', duration = 3000) {
    const notification = {
      id: Date.now(),
      title,
      message,
      type, // 'success', 'info', 'warning', 'error'
      timestamp: Date.now(),
      duration
    };

    this.broadcast('liveNotification', notification);
    return notification;
  }

  // Start real-time monitoring
  static startMonitoring() {
    // Monitor localStorage changes
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const oldValue = localStorage.getItem(key);
      originalSetItem.apply(localStorage, arguments);
      
      // Check if it's game-related data
      if (key.includes('Results') || key.includes('playerStats')) {
        RealTimeManager.broadcast('storageChanged', { key, value, oldValue });
      }
    };

    // Monitor visibility changes to resume/pause updates
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.broadcast('windowHidden', { timestamp: Date.now() });
      } else {
        this.broadcast('windowVisible', { timestamp: Date.now() });
        // Force refresh when window becomes visible
        this.broadcast('forceRefresh', { reason: 'windowVisible' });
      }
    });

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.broadcast('connectionRestored', { timestamp: Date.now() });
    });

    window.addEventListener('offline', () => {
      this.broadcast('connectionLost', { timestamp: Date.now() });
    });

    console.log('🟢 Real-time monitoring started!');
  }

  // Stop monitoring
  static stopMonitoring() {
    this.listeners.clear();
    console.log('🔴 Real-time monitoring stopped!');
  }

  // Get active listeners count
  static getActiveListenersCount() {
    let total = 0;
    this.listeners.forEach(callbacks => {
      total += callbacks.size;
    });
    return total;
  }

  // Performance metrics
  static getMetrics() {
    return {
      activeListeners: this.getActiveListenersCount(),
      queueLength: this.gameEventQueue.length,
      isProcessing: this.isProcessing,
      eventTypes: Array.from(this.listeners.keys())
    };
  }

  // Debug information
  static debug() {
    console.log('🔧 RealTimeManager Debug Info:', {
      metrics: this.getMetrics(),
      currentState: this.getCurrentLeaderboardState(),
      recentEvents: this.gameEventQueue.slice(-10)
    });
  }
}

// Auto-start monitoring when module loads
RealTimeManager.startMonitoring();

export default RealTimeManager;