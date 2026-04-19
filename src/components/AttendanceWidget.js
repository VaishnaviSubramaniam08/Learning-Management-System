import React, { useState, useEffect } from 'react';
import axios from '../api';
import attendanceTracker from '../services/attendanceTracker';

const AttendanceWidget = ({ userId, onNavigateToAttendance }) => {
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    partialDays: 0,
    absentDays: 0,
    attendancePercentage: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAttendanceData();
      checkActiveSession();
    }
  }, [userId]);

  useEffect(() => {
    // Listen to attendance tracker events
    const handleTrackerEvent = (event, data) => {
      if (event === 'sessionStarted') {
        setActiveSession(data);
        setSessionTimer(0);
      } else if (event === 'sessionEnded') {
        setActiveSession(null);
        setSessionTimer(0);
        fetchAttendanceData(); // Refresh data
      }
    };

    attendanceTracker.addListener(handleTrackerEvent);

    return () => {
      attendanceTracker.removeListener(handleTrackerEvent);
    };
  }, []);

  useEffect(() => {
    // Update session timer
    let interval;
    if (activeSession) {
      interval = setInterval(() => {
        const duration = attendanceTracker.getSessionDuration();
        setSessionTimer(Math.floor(duration / 60000)); // Convert to minutes
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get attendance summary
      console.log('🔍 AttendanceWidget Debug - Fetching attendance for user:', userId);
      const response = await axios.get('/attendance/summary', {
        params: { studentId: userId }
      });

      console.log('✅ AttendanceWidget Debug - Response:', response.data);

      // Use the correct response structure
      const summary = response.data.summary || [];
      const stats = response.data.stats || {};

      console.log('✅ AttendanceWidget Debug - Summary records:', summary.length);
      console.log('✅ AttendanceWidget Debug - Stats:', stats);

      setAttendanceStats({
        totalDays: stats.totalDays || 0,
        presentDays: stats.presentDays || 0,
        partialDays: stats.partialDays || 0,
        absentDays: stats.absentDays || 0,
        attendancePercentage: stats.attendancePercentage || 0
      });

      // Get recent 5 records from summary
      setRecentAttendance(summary.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ color: '#6b7280' }}>🕒 Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, color: '#374151' }}>🕒 Attendance</h3>
        <button
          onClick={onNavigateToAttendance}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          View Details
        </button>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #16a34a',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#16a34a',
              animation: 'pulse 2s infinite'
            }}></div>
            <div>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#14532d', fontSize: '12px' }}>
                🟢 Active Session
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: '#166534' }}>
                {formatTime(sessionTimer)} | {activeSession.courseName || 'Course'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: attendanceStats.attendancePercentage >= 75 ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${attendanceStats.attendancePercentage >= 75 ? '#22c55e' : '#ef4444'}`,
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
          <p style={{ 
            margin: '0 0 2px 0', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: attendanceStats.attendancePercentage >= 75 ? '#14532d' : '#7f1d1d'
          }}>
            {attendanceStats.attendancePercentage}%
          </p>
          <p style={{ 
            margin: 0, 
            fontSize: '11px', 
            color: attendanceStats.attendancePercentage >= 75 ? '#166534' : '#991b1b'
          }}>
            Overall
          </p>
        </div>

        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📅</div>
          <p style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold', color: '#0c4a6e' }}>
            {attendanceStats.totalDays}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#0369a1' }}>total days</p>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '6px',
          padding: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>✅</div>
          <p style={{ margin: '0 0 1px 0', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>
            {attendanceStats.presentDays}
          </p>
          <p style={{ margin: 0, fontSize: '10px', color: '#166534' }}>present</p>
        </div>

        <div style={{
          background: '#fefce8',
          border: '1px solid #eab308',
          borderRadius: '6px',
          padding: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>⚠️</div>
          <p style={{ margin: '0 0 1px 0', fontSize: '14px', fontWeight: 'bold', color: '#713f12' }}>
            {attendanceStats.partialDays}
          </p>
          <p style={{ margin: 0, fontSize: '10px', color: '#a16207' }}>partial</p>
        </div>

        <div style={{
          background: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          padding: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>❌</div>
          <p style={{ margin: '0 0 1px 0', fontSize: '14px', fontWeight: 'bold', color: '#7f1d1d' }}>
            {attendanceStats.absentDays}
          </p>
          <p style={{ margin: 0, fontSize: '10px', color: '#991b1b' }}>absent</p>
        </div>
      </div>

      {/* Recent Attendance */}
      {recentAttendance.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>📄 Recent Records</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentAttendance.slice(0, 3).map((record, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>
                    {getStatusIcon(record.status)}
                  </span>
                  <div>
                    <p style={{ 
                      margin: '0 0 2px 0', 
                      fontWeight: 'bold', 
                      color: '#374151', 
                      fontSize: '12px'
                    }}>
                      {formatDate(record.date)}
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>
                      {record.course?.title || 'Course'}
                    </p>
                  </div>
                </div>
                <div style={{
                  background: getStatusColor(record.status),
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>
                  {record.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {recentAttendance.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🕒</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#374151' }}>No attendance yet</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>
            Start attending classes to see your records
          </p>
          <button
            onClick={onNavigateToAttendance}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            📊 View Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceWidget;
