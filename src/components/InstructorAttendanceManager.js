import React, { useState, useEffect } from 'react';
import axios from '../api';

const InstructorAttendanceManager = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [courseStats, setCourseStats] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualAttendanceForm, setManualAttendanceForm] = useState({
    studentId: '',
    status: 'present',
    notes: ''
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const [attendanceConfig, setAttendanceConfig] = useState({
    requiredTime: 30,
    partialTime: 15,
    inactivityTimeout: 5,
    enableWarnings: true,
    warningThreshold: 80
  });
  const [showConfigForm, setShowConfigForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseAttendance();
      fetchCourseStudents();
      fetchAttendanceConfig();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/courses/instructor/${user.id}`);
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchCourseAttendance = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/attendance/course/${selectedCourse}`, {
        params: { date: selectedDate }
      });
      setAttendanceData(response.data.summary || []);
      setCourseStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching course attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await axios.get(`/courses/${selectedCourse}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching course students:', error);
    }
  };

  const fetchAttendanceConfig = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await axios.get(`/attendance/config/${selectedCourse}`);
      if (response.data) {
        setAttendanceConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance config:', error);
    }
  };

  const markManualAttendance = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !manualAttendanceForm.studentId) {
      alert('Please select a course and student');
      return;
    }

    try {
      await axios.post('/attendance/manual', {
        studentId: manualAttendanceForm.studentId,
        courseId: selectedCourse,
        date: selectedDate,
        status: manualAttendanceForm.status,
        notes: manualAttendanceForm.notes
      });

      alert('Attendance marked successfully!');
      setShowManualForm(false);
      setManualAttendanceForm({
        studentId: '',
        status: 'present',
        notes: ''
      });
      fetchCourseAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateAttendanceConfig = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }

    try {
      await axios.put(`/attendance/config/${selectedCourse}`, attendanceConfig);
      alert('Configuration updated successfully!');
      setShowConfigForm(false);
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update configuration: ' + (error.response?.data?.message || error.message));
    }
  };

  const exportAttendance = async (format = 'csv') => {
    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }

    try {
      const response = await axios.get(`/attendance/export/${selectedCourse}`, {
        params: { format, date: selectedDate },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${selectedCourse}_${selectedDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting attendance:', error);
      alert('Failed to export attendance data');
    }
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

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
          👨‍🏫 Instructor Attendance Manager
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Monitor student attendance, mark manual attendance, and configure attendance policies
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        {[
          { key: 'overview', label: '📊 Overview', icon: '📊' },
          { key: 'students', label: '👥 Students', icon: '👥' },
          { key: 'manual', label: '✏️ Manual Entry', icon: '✏️' },
          { key: 'config', label: '⚙️ Configuration', icon: '⚙️' }
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
            minWidth: '250px'
          }}
        >
          <option value="">Select Course</option>
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
          onClick={fetchCourseAttendance}
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

        <button
          onClick={() => exportAttendance('csv')}
          disabled={!selectedCourse}
          style={{
            background: selectedCourse ? '#10b981' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            cursor: selectedCourse ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📊 Export CSV
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
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
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Total Students</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {students.length}
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
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Present Today</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {attendanceData.filter(a => a.status === 'present').length}
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
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Partial Today</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {attendanceData.filter(a => a.status === 'partial').length}
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
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Absent Today</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {attendanceData.filter(a => a.status === 'absent').length}
              </p>
            </div>
          </div>

          {/* Course Summary */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>📋 Course Summary</h3>
            
            {!selectedCourse ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
                Please select a course to view attendance summary
              </p>
            ) : loading ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
                Loading attendance data...
              </p>
            ) : (
              <div>
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e' }}>
                    📚 {courses.find(c => c._id === selectedCourse)?.title}
                  </h4>
                  <p style={{ margin: 0, color: '#0369a1' }}>
                    📅 {formatDate(selectedDate)} | 
                    👥 {attendanceData.length} students tracked
                  </p>
                </div>

                <div style={{
                  background: '#f9fafb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Attendance Breakdown</h4>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>✅</span>
                      <span>Present: {attendanceData.filter(a => a.status === 'present').length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>⚠️</span>
                      <span>Partial: {attendanceData.filter(a => a.status === 'partial').length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>❌</span>
                      <span>Absent: {attendanceData.filter(a => a.status === 'absent').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>👥 Student Attendance</h3>
          
          {!selectedCourse ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
              Please select a course to view student attendance
            </p>
          ) : attendanceData.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
              No attendance records found for {formatDate(selectedDate)}
            </p>
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
                        {record.student?.firstName} {record.student?.lastName}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        {record.student?.email}
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
                    {record.manuallyMarked && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8b5cf6' }}>
                        📝 Manual
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>✏️ Manual Attendance Entry</h3>
          
          <form onSubmit={markManualAttendance}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Student *
                </label>
                <select
                  value={manualAttendanceForm.studentId}
                  onChange={(e) => setManualAttendanceForm({...manualAttendanceForm, studentId: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Status *
                </label>
                <select
                  value={manualAttendanceForm.status}
                  onChange={(e) => setManualAttendanceForm({...manualAttendanceForm, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="present">Present</option>
                  <option value="partial">Partial</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                Notes (Optional)
              </label>
              <textarea
                value={manualAttendanceForm.notes}
                onChange={(e) => setManualAttendanceForm({...manualAttendanceForm, notes: e.target.value})}
                placeholder="Add any notes about this attendance entry..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!selectedCourse || !manualAttendanceForm.studentId}
              style={{
                background: (!selectedCourse || !manualAttendanceForm.studentId) ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: (!selectedCourse || !manualAttendanceForm.studentId) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✏️ Mark Attendance
            </button>
          </form>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>⚙️ Attendance Configuration</h3>
          
          <form onSubmit={updateAttendanceConfig}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Required Time (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={attendanceConfig.requiredTime}
                  onChange={(e) => setAttendanceConfig({...attendanceConfig, requiredTime: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Partial Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={attendanceConfig.partialTime}
                  onChange={(e) => setAttendanceConfig({...attendanceConfig, partialTime: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Inactivity Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={attendanceConfig.inactivityTimeout}
                  onChange={(e) => setAttendanceConfig({...attendanceConfig, inactivityTimeout: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Warning Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={attendanceConfig.warningThreshold}
                  onChange={(e) => setAttendanceConfig({...attendanceConfig, warningThreshold: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={attendanceConfig.enableWarnings}
                  onChange={(e) => setAttendanceConfig({...attendanceConfig, enableWarnings: e.target.checked})}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontWeight: 'bold', color: '#374151' }}>Enable Attendance Warnings</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedCourse}
              style={{
                background: !selectedCourse ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: !selectedCourse ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              💾 Save Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InstructorAttendanceManager;
