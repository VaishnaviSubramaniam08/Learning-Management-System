import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  // Initialize socket connection
  connect(user) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      this.isConnected = true;
      
      if (user) {
        this.joinUserRoom(user.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Join user's personal notification room
  joinUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('join_user_room', userId);
    }
  }

  // Join exam category room for real-time updates
  joinExamRoom(examCategory) {
    if (this.socket && examCategory) {
      this.socket.emit('join_exam_room', examCategory);
    }
  }

  // Study Materials Events
  startDownload(downloadData) {
    if (this.socket) {
      this.socket.emit('start_download', downloadData);
    }
  }

  updateDownloadProgress(progressData) {
    if (this.socket) {
      this.socket.emit('download_progress', progressData);
    }
  }

  completeDownload(completionData) {
    if (this.socket) {
      this.socket.emit('download_complete', completionData);
    }
  }

  viewMaterial(viewData) {
    if (this.socket) {
      this.socket.emit('view_material', viewData);
    }
  }

  // Mock Test Events
  joinTestSession(testSessionData) {
    if (this.socket) {
      this.socket.emit('join_test_session', testSessionData);
    }
  }

  submitAnswer(answerData) {
    if (this.socket) {
      this.socket.emit('submit_answer', answerData);
    }
  }

  updateTestProgress(progressData) {
    if (this.socket) {
      this.socket.emit('test_progress_update', progressData);
    }
  }

  // Live Quiz Events
  joinLiveQuiz(quizData) {
    if (this.socket) {
      this.socket.emit('join_live_quiz', quizData);
    }
  }

  submitQuizAnswer(answerData) {
    if (this.socket) {
      this.socket.emit('quiz_answer_submit', answerData);
    }
  }

  // Study Plan Events
  updateStudyProgress(progressData) {
    if (this.socket) {
      this.socket.emit('study_progress_update', progressData);
    }
  }

  completeStudyTask(taskData) {
    if (this.socket) {
      this.socket.emit('study_task_complete', taskData);
    }
  }

  // Event Listeners Management
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.eventListeners.delete(event);
    }
  }

  // Notification Events
  onNewStudyMaterial(callback) {
    this.on('new_study_material', callback);
  }

  onDownloadStarted(callback) {
    this.on('download_started', callback);
  }

  onDownloadProgress(callback) {
    this.on('download_progress_update', callback);
  }

  onDownloadCompleted(callback) {
    this.on('download_completed', callback);
  }

  onDownloadError(callback) {
    this.on('download_error', callback);
  }

  // Test Events
  onTestStarted(callback) {
    this.on('test_started', callback);
  }

  onTestQuestionUpdate(callback) {
    this.on('test_question_update', callback);
  }

  onTestTimeUpdate(callback) {
    this.on('test_time_update', callback);
  }

  onTestCompleted(callback) {
    this.on('test_completed', callback);
  }

  onLeaderboardUpdate(callback) {
    this.on('leaderboard_update', callback);
  }

  // Live Quiz Events
  onQuizStarted(callback) {
    this.on('quiz_started', callback);
  }

  onQuizQuestionUpdate(callback) {
    this.on('quiz_question_update', callback);
  }

  onQuizAnswerResult(callback) {
    this.on('quiz_answer_result', callback);
  }

  onQuizLeaderboard(callback) {
    this.on('quiz_leaderboard_update', callback);
  }

  onQuizCompleted(callback) {
    this.on('quiz_completed', callback);
  }

  // Study Plan Events
  onStudyPlanUpdate(callback) {
    this.on('study_plan_update', callback);
  }

  onStudyReminder(callback) {
    this.on('study_reminder', callback);
  }

  onProgressMilestone(callback) {
    this.on('progress_milestone', callback);
  }

  // Analytics Events
  onAnalyticsUpdate(callback) {
    this.on('analytics_update', callback);
  }

  onPerformanceInsight(callback) {
    this.on('performance_insight', callback);
  }

  // General Notification Events
  onNotification(callback) {
    this.on('notification', callback);
  }

  onSystemAnnouncement(callback) {
    this.on('system_announcement', callback);
  }

  // Utility Methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getSocket() {
    return this.socket;
  }

  // Emit custom events
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Cleanup method
  cleanup() {
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach(callback => {
        this.off(event, callback);
      });
    });
    this.eventListeners.clear();
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
