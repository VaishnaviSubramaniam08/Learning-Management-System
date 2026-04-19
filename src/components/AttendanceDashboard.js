import React, { useState, useEffect } from "react";
import axios from "../api";

export default function AttendanceDashboard({ studentId }) {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    attended: 0,
    absent: 0,
    late: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [location, setLocation] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Fetch attendance data on mount
  useEffect(() => {
    fetchAttendanceData();
  }, [studentId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions for the student
      const sessionsRes = await axios.get(`/sessions/student/${studentId}`);
      setSessions(sessionsRes.data);
      
      // Fetch attendance summary
      const summaryRes = await axios.get(`/attendance/summary?studentId=${studentId}`);
      setStats({
        totalSessions: sessionsRes.data.length,
        attended: summaryRes.data.stats?.presentDays || 0,
        absent: summaryRes.data.stats?.absentDays || 0,
        late: summaryRes.data.stats?.partialDays || 0,
        attendancePercentage: summaryRes.data.stats?.attendancePercentage || 0
      });
      
      // Format attendance history from sessions
      const formattedHistory = sessionsRes.data.map(session => {
        const attendee = session.attendees?.find(a => a.student === studentId);
        return {
          id: session._id,
          date: session.date,
          sessionTitle: session.title,
          courseTitle: session.course?.title,
          status: attendee?.checkInTime ? 'present' : 'absent',
          checkInTime: attendee?.checkInTime,
          method: attendee?.method,
          location: attendee?.location
        };
      });
      setAttendanceHistory(formattedHistory);
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current location for geofencing
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check location permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Handle QR code scanning
  const handleQRScan = async () => {
    if (!qrCode.trim()) {
      alert('Please enter a QR code');
      return;
    }

    setScanning(true);
    try {
      const response = await axios.post('/attendance/qr-checkin', {
        qrCode: qrCode.trim(),
        studentId: studentId,
        latitude: location?.latitude,
        longitude: location?.longitude
      });
      
      alert('Attendance marked successfully!');
      setQrCode("");
      fetchAttendanceData(); // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert(error.response?.data || 'Failed to mark attendance');
    } finally {
      setScanning(false);
    }
  };

  // Handle geofencing attendance
  const handleGeofencingAttendance = async (sessionId) => {
    if (!location) {
      getCurrentLocation();
      return;
    }

    try {
      const response = await axios.post('/attendance/geo-checkin', {
        sessionId,
        studentId,
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      alert('Attendance marked successfully!');
      fetchAttendanceData(); // Refresh data
    } catch (error) {
      console.error('Error marking geofencing attendance:', error);
      alert(error.response?.data || 'Failed to mark attendance');
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return { background: '#d1fae5', color: '#065f46' };
      case 'absent': return { background: '#fee2e2', color: '#dc2626' };
      case 'late': return { background: '#fef3c7', color: '#d97706' };
      case 'excused': return { background: '#e0e7ff', color: '#3730a3' };
      default: return { background: '#f3f4f6', color: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', color: '#374151' }}>🕒 Attendance Dashboard</h2>

      {/* Attendance Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px', 
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
          padding: '24px',
            borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>Attendance Rate</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#6b46c1' }}>
            {stats.attendancePercentage}%
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
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>Sessions Attended</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {stats.attended}
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
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>Sessions Missed</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
            {stats.absent}
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
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>Late Arrivals</h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.late}
            </p>
          </div>
          </div>
          
      {/* Attendance Methods */}
          <div style={{
            background: 'white',
        padding: '24px', 
            borderRadius: '12px',
        marginBottom: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>Mark Attendance</h3>
        
        {/* QR Code Attendance */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', color: '#374151' }}>📱 QR Code Attendance</h4>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Enter QR Code"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                minWidth: '200px'
              }}
            />
            <button
              onClick={handleQRScan}
              disabled={scanning}
              style={{
                background: scanning ? '#9ca3af' : '#6b46c1',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: scanning ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {scanning ? 'Marking...' : 'Mark Attendance'}
            </button>
          </div>
        </div>

        {/* Geofencing Attendance */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', color: '#374151' }}>📍 Geofencing Attendance</h4>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={getCurrentLocation}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Get Location
            </button>
            {location && (
              <span style={{ color: '#059669', fontSize: '14px' }}>
                Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            )}
            </div>
            </div>

        {/* Available Sessions for Attendance */}
        {sessions.length > 0 && (
            <div>
            <h4 style={{ marginBottom: '12px', color: '#374151' }}>Available Sessions</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sessions
                .filter(session => {
                  // Show only sessions that are currently active or upcoming today
                  const now = new Date();
                  const sessionDate = new Date(session.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  sessionDate.setHours(0, 0, 0, 0);
                  
                  return sessionDate.getTime() === today.getTime();
                })
                .map(session => {
                  const now = new Date();
                  const sessionDate = new Date(session.date);
                  const sessionStart = new Date(sessionDate.getTime() + new Date(`2000-01-01 ${session.startTime}`).getTime());
                  const sessionEnd = new Date(sessionDate.getTime() + new Date(`2000-01-01 ${session.endTime}`).getTime());
                  const isActive = now >= sessionStart && now <= sessionEnd;
                  const isUpcoming = now < sessionStart;
                  
                                    return (
                    <button
                      key={session._id}
                      onClick={() => handleGeofencingAttendance(session._id)}
                      disabled={!isActive}
                      style={{
                        background: isActive ? '#10b981' : isUpcoming ? '#f59e0b' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: isActive ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {session.title} - {session.startTime}
                      {isActive && ' (Active)'}
                      {isUpcoming && ' (Upcoming)'}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
        </div>

      {/* Attendance History */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>Attendance History</h3>
        
        {attendanceHistory.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Course</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Session</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Check-in Time</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {record.courseTitle || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {record.sessionTitle || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {record.method}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        ...getStatusColor(record.status),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            <h4>No Attendance Records</h4>
            <p>Your attendance records will appear here once you start attending sessions.</p>
          </div>
        )}
      </div>

      {/* Monthly Attendance Chart */}
      {attendanceHistory.length > 0 && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          marginTop: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>Monthly Attendance Overview</h3>
          <MonthlyAttendanceChart attendanceHistory={attendanceHistory} />
        </div>
      )}
    </div>
  );
}

// Monthly Attendance Chart Component
function MonthlyAttendanceChart({ attendanceHistory }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Group attendance by month
  const monthlyData = attendanceHistory.reduce((acc, record) => {
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      };
    }
    
    acc[monthKey][record.status]++;
    acc[monthKey].total++;
    
    return acc;
  }, {});

  const currentMonthKey = `${selectedYear}-${selectedMonth}`;
  const monthData = monthlyData[currentMonthKey] || { present: 0, absent: 0, late: 0, total: 0 };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
            padding: '8px 12px',
                borderRadius: '4px',
            border: '1px solid #d1d5db'
              }}
            >
          {months.map((month, idx) => (
            <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
        
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
            padding: '8px 12px',
                borderRadius: '4px',
            border: '1px solid #d1d5db'
              }}
            >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
            </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {monthData.present}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Present</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {monthData.late}
            </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Late</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {monthData.absent}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Absent</div>
        </div>
      </div>

      {monthData.total > 0 && (
        <div style={{
          marginTop: '16px', 
          padding: '12px', 
          background: '#f3f4f6', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
            {Math.round((monthData.present / monthData.total) * 100)}% Attendance Rate
                  </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            {monthData.total} total sessions
          </div>
        </div>
      )}
    </div>
  );
}
