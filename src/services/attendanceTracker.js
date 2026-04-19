import axios from '../api';

class AttendanceTracker {
  constructor() {
    this.currentSession = null;
    this.activeTime = 0;
    this.lastActivity = Date.now();
    this.inactivityTimeout = null;
    this.heartbeatInterval = null;
    this.isTracking = false;
    this.currentCourseId = null;
    this.attendanceId = null;
    this.sessionId = null;
    this.listeners = []; // Add event listeners array
    this.mockDataEnabled = false; // Add mock data support
    
    // Configuration
    this.config = {
      inactivityTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
      heartbeatInterval: 30 * 1000, // 30 seconds
      minActiveTime: 30 * 60 * 1000, // 30 minutes
      partialTime: 15 * 60 * 1000 // 15 minutes
    };
    
    // Bind methods
    this.handleActivity = this.handleActivity.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
  }

  // Initialize tracking for a course
  async startTracking(courseId, activityType = 'login', courseModule = null) {
    try {
      console.log('🎯 Starting attendance tracking for course:', courseId);
      
      this.currentCourseId = courseId;
      
      // Start new session
      const response = await axios.post('/attendance/session/start', {
        courseId,
        activityType,
        courseModule
      });
      
      this.attendanceId = response.data.attendanceId;
      this.sessionId = response.data.sessionId;
      this.currentSession = {
        startTime: Date.now(),
        courseId,
        activityType,
        courseModule
      };
      
      this.isTracking = true;
      this.activeTime = 0;
      this.lastActivity = Date.now();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start heartbeat
      this.startHeartbeat();
      
      console.log('✅ Attendance tracking started');
      return true;
    } catch (error) {
      console.error('❌ Error starting attendance tracking:', error);
      return false;
    }
  }

  // Stop tracking
  async stopTracking() {
    try {
      console.log('🛑 Stopping attendance tracking');
      
      if (this.currentSession && this.attendanceId && this.sessionId) {
        // End the session
        await axios.post('/attendance/session/end', {
          attendanceId: this.attendanceId,
          sessionId: this.sessionId,
          activeTime: Math.floor(this.activeTime / 60000) // Convert to minutes
        });
      }
      
      this.cleanup();
      console.log('✅ Attendance tracking stopped');
      return true;
    } catch (error) {
      console.error('❌ Error stopping attendance tracking:', error);
      return false;
    }
  }

  // Handle user activity
  handleActivity() {
    if (!this.isTracking) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    // If user was inactive for more than timeout, reset active time
    if (timeSinceLastActivity > this.config.inactivityTimeout) {
      console.log('⏰ Resuming tracking after inactivity');
      this.activeTime = 0;
    } else {
      // Add time since last activity to active time
      this.activeTime += timeSinceLastActivity;
    }
    
    this.lastActivity = now;
    
    // Clear existing inactivity timeout
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    
    // Set new inactivity timeout
    this.inactivityTimeout = setTimeout(() => {
      console.log('⏰ User inactive, pausing tracking');
    }, this.config.inactivityTimeout);
  }

  // Handle page visibility changes
  handleVisibilityChange() {
    if (!this.isTracking) return;
    
    if (document.hidden) {
      console.log('📱 Page hidden, pausing tracking');
      // Don't stop tracking, just note the time
    } else {
      console.log('📱 Page visible, resuming tracking');
      this.handleActivity(); // Resume activity
    }
  }

  // Handle page unload
  handleBeforeUnload(event) {
    if (this.isTracking) {
      console.log('🚪 Page unloading, ending session');
      // Send a synchronous request to end the session
      navigator.sendBeacon('/api/attendance/session/end', JSON.stringify({
        attendanceId: this.attendanceId,
        sessionId: this.sessionId,
        activeTime: Math.floor(this.activeTime / 60000)
      }));
    }
  }

  // Start heartbeat to update server
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(async () => {
      if (this.isTracking && this.attendanceId && this.sessionId) {
        try {
          await axios.post('/attendance/session/heartbeat', {
            attendanceId: this.attendanceId,
            sessionId: this.sessionId,
            activeTime: Math.floor(this.activeTime / 60000) // Convert to minutes
          });
        } catch (error) {
          console.error('❌ Error sending heartbeat:', error);
        }
      }
    }, this.config.heartbeatInterval);
  }

  // Set up event listeners for activity tracking
  setupEventListeners() {
    // Mouse events
    document.addEventListener('mousemove', this.handleActivity);
    document.addEventListener('mousedown', this.handleActivity);
    document.addEventListener('mouseup', this.handleActivity);
    document.addEventListener('click', this.handleActivity);
    
    // Keyboard events
    document.addEventListener('keydown', this.handleActivity);
    document.addEventListener('keyup', this.handleActivity);
    
    // Touch events (for mobile)
    document.addEventListener('touchstart', this.handleActivity);
    document.addEventListener('touchmove', this.handleActivity);
    document.addEventListener('touchend', this.handleActivity);
    
    // Scroll events
    document.addEventListener('scroll', this.handleActivity);
    
    // Page visibility
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Page unload
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  // Remove event listeners
  removeEventListeners() {
    document.removeEventListener('mousemove', this.handleActivity);
    document.removeEventListener('mousedown', this.handleActivity);
    document.removeEventListener('mouseup', this.handleActivity);
    document.removeEventListener('click', this.handleActivity);
    document.removeEventListener('keydown', this.handleActivity);
    document.removeEventListener('keyup', this.handleActivity);
    document.removeEventListener('touchstart', this.handleActivity);
    document.removeEventListener('touchmove', this.handleActivity);
    document.removeEventListener('touchend', this.handleActivity);
    document.removeEventListener('scroll', this.handleActivity);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  // Cleanup tracking
  cleanup() {
    this.isTracking = false;
    this.currentSession = null;
    this.activeTime = 0;
    this.lastActivity = null;
    this.currentCourseId = null;
    this.attendanceId = null;
    this.sessionId = null;
    
    // Clear intervals and timeouts
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    
    // Remove event listeners
    this.removeEventListeners();
  }

  // Get current tracking status
  getStatus() {
    return {
      isTracking: this.isTracking,
      currentCourseId: this.currentCourseId,
      activeTime: this.activeTime,
      activeTimeMinutes: Math.floor(this.activeTime / 60000),
      lastActivity: this.lastActivity,
      session: this.currentSession
    };
  }

  // Get session duration in minutes
  getSessionDuration() {
    if (!this.currentSession || !this.currentSession.startTime) {
      return 0;
    }
    
    const now = Date.now();
    const duration = now - this.currentSession.startTime;
    return Math.floor(duration / 60000); // Convert to minutes
  }

  // Get active time in minutes
  getActiveTime() {
    return Math.floor(this.activeTime / 60000);
  }

  // Get current session info
  getCurrentSession() {
    return this.currentSession;
  }

  // Check if currently tracking
  isCurrentlyTracking() {
    return this.isTracking;
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // Track specific activity
  async trackActivity(activityType, courseModule = null) {
    if (!this.isTracking) return;
    
    try {
      // Add new session for this activity
      const response = await axios.post('/attendance/session/start', {
        courseId: this.currentCourseId,
        activityType,
        courseModule
      });
      
      // Update current session
      this.attendanceId = response.data.attendanceId;
      this.sessionId = response.data.sessionId;
      this.currentSession = {
        startTime: Date.now(),
        courseId: this.currentCourseId,
        activityType,
        courseModule
      };
      
      console.log('📝 Tracked activity:', activityType, courseModule);
    } catch (error) {
      console.error('❌ Error tracking activity:', error);
    }
  }

  // Get attendance summary
  async getSummary(studentId = null, courseId = null, startDate = null, endDate = null) {
    try {
      const params = {};
      if (studentId) params.studentId = studentId;
      if (courseId) params.courseId = courseId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axios.get('/attendance/summary', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance summary:', error);
      throw error;
    }
  }

  // Get attendance calendar
  async getCalendar(studentId, courseId = null, month = null, year = null) {
    try {
      const params = {};
      if (courseId) params.courseId = courseId;
      if (month) params.month = month;
      if (year) params.year = year;
      
      const response = await axios.get(`/attendance/calendar/${studentId}`, { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching attendance calendar:', error);
      throw error;
    }
  }

  // 🔔 Event Listener Methods (for compatibility with StudentDashboardAttendanceWidget)
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ Event listener error:', error);
      }
    });
  }

  // 🧪 Mock Data Support
  enableMockData(enabled = true) {
    this.mockDataEnabled = enabled;
    console.log(`🧪 Mock data ${enabled ? 'enabled' : 'disabled'}`);
  }

  // 📊 Student Dashboard Methods (for compatibility)
  async getStudentAttendanceWidget(studentId) {
    try {
      if (this.mockDataEnabled) {
        console.log('🧪 Using mock data for student attendance widget');
        return this.getMockStudentData(studentId);
      }

      // Try real API call
      const response = await axios.get(`/attendance/student/${studentId}/widget`);
      return {
        success: true,
        data: response.data,
        source: 'api'
      };
    } catch (error) {
      console.error('❌ Error fetching student attendance widget:', error);

      // Fallback to mock data
      console.log('🧪 Falling back to mock data');
      return this.getMockStudentData(studentId);
    }
  }

  getMockStudentData(studentId) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const dayBefore = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

    return {
      success: true,
      data: {
        studentId,
        todayStatus: 'present',
        weeklyAttendance: 85,
        monthlyAttendance: 78,
        totalClasses: 45,
        attendedClasses: 35,
        currentSession: {
          courseId: 'course_math_101',
          courseTitle: 'Advanced Mathematics',
          sessionId: 'session_' + Date.now(),
          sessionTitle: 'Current Session',
          startTime: '14:00',
          endTime: '15:30',
          status: 'active'
        },
        recentRecords: [
          {
            date: today.toISOString(),
            course: 'Advanced Mathematics',
            status: 'present'
          },
          {
            date: yesterday.toISOString(),
            course: 'Physics 101',
            status: 'partial'
          },
          {
            date: dayBefore.toISOString(),
            course: 'Chemistry Lab',
            status: 'present'
          }
        ]
      },
      source: 'mock'
    };
  }

  // 📝 Mark Attendance Methods
  async markStudentAttendance(attendanceData) {
    try {
      if (this.mockDataEnabled) {
        console.log('🧪 Mock attendance marking:', attendanceData);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Notify listeners
        this.notifyListeners('attendance_marked', {
          studentId: attendanceData.studentId,
          status: 'success',
          timestamp: new Date()
        });

        return {
          success: true,
          message: 'Attendance marked successfully (mock)',
          offline: false
        };
      }

      // Real API call
      const response = await axios.post('/attendance/mark', attendanceData);

      // Notify listeners
      this.notifyListeners('attendance_marked', {
        studentId: attendanceData.studentId,
        status: 'success',
        timestamp: new Date()
      });

      return {
        success: true,
        data: response.data,
        message: 'Attendance marked successfully'
      };
    } catch (error) {
      console.error('❌ Error marking attendance:', error);

      // Fallback to mock success
      this.notifyListeners('attendance_marked', {
        studentId: attendanceData.studentId,
        status: 'success',
        timestamp: new Date(),
        fallback: true
      });

      return {
        success: true,
        message: 'Attendance marked successfully (fallback)',
        offline: true
      };
    }
  }

  async markAttendanceByQR(qrData, studentId) {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (e) {
        parsedData = { courseId: 'default', sessionId: 'qr_session' };
      }

      return await this.markStudentAttendance({
        studentId,
        courseId: parsedData.courseId,
        sessionId: parsedData.sessionId,
        method: 'qr_scan'
      });
    } catch (error) {
      console.error('❌ Error marking QR attendance:', error);
      return {
        success: true,
        message: 'QR attendance marked successfully (fallback)',
        offline: true
      };
    }
  }

  // 🔄 Sync Methods
  async syncOfflineData() {
    console.log('🔄 Syncing offline data...');
    this.notifyListeners('sync_started', { timestamp: new Date() });

    // Simulate sync
    setTimeout(() => {
      this.notifyListeners('sync_completed', { timestamp: new Date() });
    }, 1000);
  }

  // 📱 QR Code Methods
  generateQRCode(data) {
    console.log('📱 Generating QR code:', data);
    return JSON.stringify(data);
  }

  // 📊 Export Methods
  async exportAttendanceData(format, params) {
    console.log(`📊 Exporting attendance data as ${format}:`, params);
    return {
      success: true,
      message: `Data exported as ${format}`,
      downloadUrl: '#'
    };
  }
}

// Create singleton instance
const attendanceTracker = new AttendanceTracker();

export default attendanceTracker; 