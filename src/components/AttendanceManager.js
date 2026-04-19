import React, { useState, useEffect } from 'react';
import axios from '../api';

const AttendanceManager = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    partialDays: 0,
    absentDays: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [error, setError] = useState('');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
      fetchAttendanceData();
      fetchAttendanceStats();
      checkActiveSession();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceData();
    }
  }, [selectedCourse, selectedDate]);

  // Fetch attendance data when switching to calendar tab or changing calendar month
  useEffect(() => {
    if (activeTab === 'calendar' && user?.id) {
      fetchAttendanceData(true);
    }
  }, [activeTab, currentCalendarDate]);

  // Timer for active session
  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        sendHeartbeat();
      }, 60000); // Send heartbeat every minute
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchCourses = async () => {
    try {
      console.log('🔍 AttendanceManager Debug - Fetching enrollments for student:', user.id);
      const response = await axios.get(`/courses/student/${user.id}/enrollments`);
      console.log('✅ AttendanceManager Debug - Enrollments fetched:', response.data.length);

      // Extract courses from enrollments
      const coursesFromEnrollments = response.data.map(enrollment => enrollment.course).filter(course => course);
      console.log('✅ AttendanceManager Debug - Courses extracted:', coursesFromEnrollments.length);

      setCourses(coursesFromEnrollments);
    } catch (error) {
      console.error('❌ AttendanceManager Error - Error fetching courses:', error);
      console.error('❌ AttendanceManager Error - Error details:', error.response?.data);
    }
  };

  const fetchAttendanceData = async (forCalendar = false) => {
    try {
      setLoading(true);
      setError('');

      let params = {
        studentId: user.id,
        ...(selectedCourse && { courseId: selectedCourse })
      };

      // For calendar view, fetch entire month data
      if (forCalendar || activeTab === 'calendar') {
        const startOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
        // Get the last day of the month correctly
        const endOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
        // Add one day to include the last day of the month in the range
        const endOfMonthInclusive = new Date(endOfMonth);
        endOfMonthInclusive.setDate(endOfMonth.getDate() + 1);

        params.startDate = startOfMonth.toISOString().split('T')[0];
        params.endDate = endOfMonthInclusive.toISOString().split('T')[0];
        console.log('🔍 AttendanceManager Debug - Fetching calendar data for month:', params.startDate, 'to', params.endDate);
        console.log('🔍 AttendanceManager Debug - Current calendar date:', currentCalendarDate);
        console.log('🔍 AttendanceManager Debug - Start of month:', startOfMonth);
        console.log('🔍 AttendanceManager Debug - End of month (last day):', endOfMonth);
        console.log('🔍 AttendanceManager Debug - End of month (inclusive):', endOfMonthInclusive);
      } else if (selectedDate) {
        // For other views, use selected date filter
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }

      console.log('🔍 AttendanceManager Debug - Fetching attendance with params:', params);
      const response = await axios.get('/attendance/summary', { params });
      console.log('✅ AttendanceManager Debug - Full response:', response.data);

      // Handle the response structure properly
      if (response.data && response.data.summary) {
        console.log('✅ AttendanceManager Debug - Found summary with', response.data.summary.length, 'records');
        setAttendanceData(response.data.summary);
      } else if (Array.isArray(response.data)) {
        // Fallback if response is directly an array
        console.log('✅ AttendanceManager Debug - Response is array with', response.data.length, 'records');
        setAttendanceData(response.data);
      } else {
        console.log('⚠️ AttendanceManager Debug - Unexpected response structure');
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('❌ AttendanceManager Error - Error fetching attendance data:', error);
      console.error('❌ AttendanceManager Error - Error details:', error.response?.data);
      setError('Failed to load attendance data. Please try again.');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      console.log('🔍 AttendanceManager Debug - Starting fetchAttendanceStats');
      console.log('🔍 AttendanceManager Debug - User object:', user);

      const params = {
        studentId: user.id,
        ...(selectedCourse && { courseId: selectedCourse })
      };

      console.log('🔍 AttendanceManager Debug - Fetching attendance stats with params:', params);
      console.log('🔍 AttendanceManager Debug - Making request to /attendance/summary');

      const response = await axios.get('/attendance/summary', { params });
      console.log('✅ AttendanceManager Debug - Stats response received:', response.data);

      // Use the stats from the backend response
      const stats = response.data.stats || {};
      console.log('✅ AttendanceManager Debug - Extracted stats:', stats);

      const newStats = {
        totalDays: stats.totalDays || 0,
        presentDays: stats.presentDays || 0,
        partialDays: stats.partialDays || 0,
        absentDays: stats.absentDays || 0,
        attendancePercentage: stats.attendancePercentage || 0
      };

      console.log('✅ AttendanceManager Debug - Setting new stats:', newStats);
      setAttendanceStats(newStats);
    } catch (error) {
      console.error('❌ AttendanceManager Error - Error fetching attendance stats:', error);
      console.error('❌ AttendanceManager Error - Error details:', error.response?.data);
      // Set default stats on error
      setAttendanceStats({
        totalDays: 0,
        presentDays: 0,
        partialDays: 0,
        absentDays: 0,
        attendancePercentage: 0
      });
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await axios.get('/attendance/active-session');
      if (response.data.session) {
        setActiveSession(response.data.session);
        const startTime = new Date(response.data.session.startTime);
        const now = new Date();
        setSessionTimer(Math.floor((now - startTime) / 60000)); // minutes
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const startAttendanceSession = async (courseId) => {
    try {
      const response = await axios.post('/attendance/session/start', {
        courseId,
        activityType: 'course_view'
      });
      
      setActiveSession({
        id: response.data.sessionId,
        attendanceId: response.data.attendanceId,
        courseId,
        startTime: new Date()
      });
      setSessionTimer(0);
      
      alert('Attendance session started successfully!');
      fetchAttendanceData();
    } catch (error) {
      console.error('Error starting attendance session:', error);
      alert('Failed to start attendance session: ' + (error.response?.data?.message || error.message));
    }
  };

  const endAttendanceSession = async () => {
    if (!activeSession) return;
    
    try {
      await axios.post('/attendance/session/end', {
        attendanceId: activeSession.attendanceId,
        sessionId: activeSession.id,
        activeTime: sessionTimer
      });
      
      setActiveSession(null);
      setSessionTimer(0);
      
      alert('Attendance session ended successfully!');
      fetchAttendanceData();
      fetchAttendanceStats();
    } catch (error) {
      console.error('Error ending attendance session:', error);
      alert('Failed to end attendance session: ' + (error.response?.data?.message || error.message));
    }
  };

  const sendHeartbeat = async () => {
    if (!activeSession) {
      console.log('🔍 Heartbeat Debug - No active session');
      return;
    }
    
    if (!activeSession.attendanceId || !activeSession.id) {
      console.log('🔍 Heartbeat Debug - Missing session data:', {
        attendanceId: activeSession.attendanceId,
        sessionId: activeSession.id,
        activeTime: sessionTimer
      });
      return;
    }
    
    try {
      console.log('🔍 Heartbeat Debug - Sending heartbeat with:', {
        attendanceId: activeSession.attendanceId,
        sessionId: activeSession.id,
        activeTime: sessionTimer
      });
      
      await axios.post('/attendance/session/heartbeat', {
        attendanceId: activeSession.attendanceId,
        sessionId: activeSession.id,
        activeTime: sessionTimer
      });
      
      console.log('✅ Heartbeat Debug - Heartbeat sent successfully');
    } catch (error) {
      console.error('❌ Heartbeat Debug - Error sending heartbeat:', error);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };





  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'absent': return '#ef4444';
      case 'late': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return '✅';
      case 'partial': return '⚠️';
      case 'absent': return '❌';
      case 'late': return '⏰';
      default: return '❓';
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceData.find(record =>
      new Date(record.date).toISOString().split('T')[0] === dateStr
    );
  };

  const navigateCalendar = (direction) => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          📊 Attendance Manager
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Track your attendance, manage sessions, and view detailed reports
        </p>
      </div>

      {/* Debug Info */}
      <div style={{
        background: '#f0f9ff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#1e40af'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
          📊 Real-Time Attendance Status
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>User:</strong> {user?.name || user?.email || 'Not available'}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Enrolled Courses:</strong> {courses.length}
        </div>
        {courses.length > 0 && (
          <div style={{ marginBottom: '4px' }}>
            <strong>Courses:</strong> {courses.map(c => c.title).join(', ')}
          </div>
        )}
        <div style={{ marginBottom: '4px' }}>
          <strong>Total Attendance Records:</strong> {attendanceData.length}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Current Session:</strong> {activeSession ? '🟢 Active' : '🔴 Inactive'}
        </div>
        {attendanceData.length > 0 && (
          <div>
            <strong>Latest Activity:</strong> {new Date(attendanceData[0]?.date).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #16a34a',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#16a34a',
              animation: 'pulse 2s infinite'
            }}></div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#14532d' }}>
                🟢 Active Session Running
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
                Duration: {formatTime(sessionTimer)} | Course: {courses.find(c => c._id === activeSession.courseId)?.title || 'Unknown'}
              </p>
            </div>
          </div>
          <button
            onClick={endAttendanceSession}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            End Session
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        {[
          { key: 'overview', label: '📊 Overview', icon: '📊' },
          { key: 'sessions', label: '🎯 Sessions', icon: '🎯' },
          { key: 'calendar', label: '📅 Calendar', icon: '📅' },
          { key: 'reports', label: '📈 Reports', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? '#3b82f6' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px 8px 0 0',
              marginRight: '4px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            minWidth: '200px'
          }}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />

        <button
          onClick={fetchAttendanceData}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#dc2626'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px',
          color: '#0369a1'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⏳</div>
          <div>Loading attendance data...</div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && !loading && (
        <div>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Overall Attendance</h3>
              <p style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: attendanceStats.attendancePercentage >= 75 ? '#10b981' : '#ef4444'
              }}>
                {attendanceStats.attendancePercentage}%
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Present Days</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {attendanceStats.presentDays}
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Partial Days</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {attendanceStats.partialDays}
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Absent Days</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {attendanceStats.absentDays}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>🎯 Quick Actions</h3>
            
            {!activeSession ? (
              <div>
                <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                  Start an attendance session for a course to begin tracking your participation.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {courses.map(course => (
                    <button
                      key={course._id}
                      onClick={() => startAttendanceSession(course._id)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      📚 Start {course.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#0c4a6e' }}>
                  ✅ Session Active
                </p>
                <p style={{ margin: 0, color: '#0369a1' }}>
                  Your attendance is being tracked. Keep this tab open and stay active to maintain your session.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>📋 Attendance Records</h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading attendance data...
              </div>
            ) : attendanceData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Attendance Records Found</h4>
                <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
                  {selectedCourse || selectedDate
                    ? 'No attendance records found for the selected criteria. Try adjusting your filters.'
                    : 'You haven\'t marked any attendance yet. Use face recognition login to automatically mark attendance.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedCourse('');
                      setSelectedDate('');
                      fetchAttendanceData();
                    }}
                    style={{
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    🔄 Show All Records
                  </button>
                  <button
                    onClick={fetchAttendanceData}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    🔄 Refresh Data
                  </button>

                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {attendanceData.map((record, index) => (
                  <div key={index} style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '24px' }}>
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#374151' }}>
                          {formatDate(record.date)}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                          {record.course?.title || 'Unknown Course'}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: getStatusColor(record.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {record.status}
                      </span>
                      {record.totalActiveTime > 0 && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          Active: {formatTime(record.totalActiveTime)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Calendar Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => navigateCalendar(-1)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ← Previous
            </button>
            <h3 style={{ margin: 0, color: '#374151', fontSize: '20px' }}>
              📅 {currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateCalendar(1)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Next →
            </button>
          </div>

          {/* No Data Message */}
          {attendanceData.length === 0 && (
            <div style={{
              background: '#f9fafb',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Attendance Data Yet</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Start attending classes to see your attendance history in the calendar view.
              </p>
            </div>
          )}

          {/* Calendar Grid */}
          {attendanceData.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              background: '#e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{
                background: '#f3f4f6',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#374151',
                fontSize: '14px'
              }}>
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: getFirstDayOfMonth(currentCalendarDate) }, (_, i) => (
              <div key={`empty-${i}`} style={{
                background: 'white',
                minHeight: '80px',
                padding: '8px'
              }} />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: getDaysInMonth(currentCalendarDate) }, (_, i) => {
              const day = i + 1;
              const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
              const attendance = getAttendanceForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div key={day} style={{
                  background: 'white',
                  minHeight: '80px',
                  padding: '8px',
                  border: isToday ? '2px solid #3b82f6' : 'none',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: isToday ? 'bold' : 'normal',
                    color: isToday ? '#3b82f6' : '#374151',
                    marginBottom: '4px'
                  }}>
                    {day}
                  </div>

                  {attendance && (
                    <div style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: getStatusColor(attendance.status),
                      color: 'white',
                      textAlign: 'center',
                      marginBottom: '2px'
                    }}>
                      {getStatusIcon(attendance.status)} {attendance.status}
                    </div>
                  )}

                  {attendance && attendance.courses && attendance.courses.length > 0 && (
                    <div style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      textAlign: 'center'
                    }}>
                      {attendance.courses.length} course{attendance.courses.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}

          {/* Legend */}
          {attendanceData.length > 0 && (
          <div style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {[
              { status: 'present', label: 'Present' },
              { status: 'partial', label: 'Partial' },
              { status: 'absent', label: 'Absent' },
              { status: 'late', label: 'Late' }
            ].map(item => (
              <div key={item.status} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: getStatusColor(item.status)
                }} />
                <span>{getStatusIcon(item.status)} {item.label}</span>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>📈 Detailed Reports</h3>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Detailed reports and analytics will be implemented in the next update.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
