import React, { useState, useEffect } from 'react';
import axios from '../api';

const InstructorOfficeHours = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-sessions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    maxStudents: 5,
    meetingPlatform: 'zoom',
    meetingLink: '',
    location: '',
    tags: '',
    isRecurring: false,
    recurringPattern: {
      frequency: 'weekly',
      dayOfWeek: 1,
      endDate: ''
    }
  });

  useEffect(() => {
    fetchMySessions();
  }, [user]);

  const fetchMySessions = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`/office-hours/instructor/${user.id}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const sessionData = {
        ...sessionForm,
        tags: sessionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        recurringPattern: sessionForm.isRecurring ? sessionForm.recurringPattern : null
      };

      await axios.post('/office-hours', sessionData);
      alert('Session created successfully!');
      setShowCreateModal(false);
      setSessionForm({
        title: '',
        description: '',
        date: '',
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        maxStudents: 5,
        meetingPlatform: 'zoom',
        meetingLink: '',
        location: '',
        tags: '',
        isRecurring: false,
        recurringPattern: {
          frequency: 'weekly',
          dayOfWeek: 1,
          endDate: ''
        }
      });
      fetchMySessions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create session');
    }
  };

  const handleUpdateSession = async () => {
    try {
      const sessionData = {
        ...sessionForm,
        tags: sessionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        recurringPattern: sessionForm.isRecurring ? sessionForm.recurringPattern : null
      };

      await axios.put(`/office-hours/${selectedSession._id}`, sessionData);
      alert('Session updated successfully!');
      setShowEditModal(false);
      setSelectedSession(null);
      fetchMySessions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await axios.delete(`/office-hours/${sessionId}`);
        alert('Session deleted successfully!');
        fetchMySessions();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete session');
      }
    }
  };

  const handleUpdateAttendance = async (sessionId, studentId, status, notes) => {
    try {
      await axios.put(`/office-hours/${sessionId}/attendance/${studentId}`, { status, notes });
      alert('Attendance updated successfully!');
      fetchMySessions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update attendance');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'booked': return '#3b82f6';
      case 'attended': return '#10b981';
      case 'no-show': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const openEditModal = (session) => {
    setSelectedSession(session);
    setSessionForm({
      title: session.title,
      description: session.description,
      date: new Date(session.date).toISOString().split('T')[0],
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      maxStudents: session.maxStudents,
      meetingPlatform: session.meetingPlatform,
      meetingLink: session.meetingLink || '',
      location: session.location || '',
      tags: session.tags ? session.tags.join(', ') : '',
      isRecurring: session.isRecurring,
      recurringPattern: session.recurringPattern || {
        frequency: 'weekly',
        dayOfWeek: 1,
        endDate: ''
      }
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading office hours...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, color: '#1f2937', fontSize: '24px' }}>
            🗓️ Office Hours Management
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              background: '#6b46c1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            + Create New Session
          </button>
        </div>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Manage your office hours sessions and track student attendance
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('my-sessions')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'my-sessions' ? '#6b46c1' : 'transparent',
            color: activeTab === 'my-sessions' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'my-sessions' ? '2px solid #6b46c1' : 'none',
            fontWeight: activeTab === 'my-sessions' ? 'bold' : 'normal'
          }}
        >
          My Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'upcoming' ? '#6b46c1' : 'transparent',
            color: activeTab === 'upcoming' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'upcoming' ? '2px solid #6b46c1' : 'none',
            fontWeight: activeTab === 'upcoming' ? 'bold' : 'normal'
          }}
        >
          Upcoming Sessions ({sessions.filter(s => new Date(s.date) > new Date()).length})
        </button>
      </div>

      {/* My Sessions */}
      {activeTab === 'my-sessions' && (
        <div>
          {sessions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ margin: '0 0 8px 0' }}>No sessions created yet</h3>
              <p style={{ margin: 0 }}>Create your first office hours session to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {sessions.map(session => (
                <div key={session._id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{session.title}</h3>
                      <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                        {session.description}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        background: getStatusColor(session.status)
                      }}>
                        {session.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <strong style={{ color: '#374151', fontSize: '14px' }}>📅 Date:</strong>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>{formatDate(session.date)}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151', fontSize: '14px' }}>🕒 Time:</strong>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151', fontSize: '14px' }}>👥 Bookings:</strong>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        {session.bookedStudents.length} of {session.maxStudents} slots
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151', fontSize: '14px' }}>🌐 Platform:</strong>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        {session.meetingPlatform === 'in-person' ? session.location : session.meetingPlatform}
                      </div>
                    </div>
                  </div>

                  {session.tags && session.tags.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {session.tags.map(tag => (
                          <span key={tag} style={{
                            padding: '4px 8px',
                            background: '#f3f4f6',
                            color: '#374151',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booked Students */}
                  {session.bookedStudents.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Booked Students:</h4>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {session.bookedStudents.map((booking, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#f9fafb',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#374151' }}>
                                {booking.student.firstName} {booking.student.lastName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                Topic: {booking.topic || 'General discussion'}
                              </div>
                              {booking.notes && (
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  Notes: {booking.notes}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateAttendance(session._id, booking.student._id, e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}
                              >
                                <option value="booked">Booked</option>
                                <option value="attended">Attended</option>
                                <option value="no-show">No Show</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: 'white',
                                background: getBookingStatusColor(booking.status)
                              }}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => openEditModal(session)}
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session._id)}
                      style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Sessions */}
      {activeTab === 'upcoming' && (
        <div>
          {sessions.filter(s => new Date(s.date) > new Date()).length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ margin: '0 0 8px 0' }}>No upcoming sessions</h3>
              <p style={{ margin: 0 }}>Create new sessions to see them here</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {sessions
                .filter(s => new Date(s.date) > new Date())
                .map(session => (
                  <div key={session._id} style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{session.title}</h3>
                        <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                          {session.description}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: getStatusColor(session.status)
                        }}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>📅 Date:</strong>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>{formatDate(session.date)}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>🕒 Time:</strong>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>👥 Bookings:</strong>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {session.bookedStudents.length} of {session.maxStudents} slots
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>🌐 Platform:</strong>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {session.meetingPlatform === 'in-person' ? session.location : session.meetingPlatform}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEditModal(session)}
                        style={{
                          padding: '8px 16px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              Create Office Hours Session
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  placeholder="e.g., Java Programming Help"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                placeholder="Describe what students can expect from this session..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Max Students *
                </label>
                <input
                  type="number"
                  value={sessionForm.maxStudents}
                  onChange={(e) => setSessionForm({ ...sessionForm, maxStudents: parseInt(e.target.value) })}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Meeting Platform *
                </label>
                <select
                  value={sessionForm.meetingPlatform}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingPlatform: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="google-meet">Google Meet</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  {sessionForm.meetingPlatform === 'in-person' ? 'Location' : 'Meeting Link'}
                </label>
                <input
                  type="text"
                  value={sessionForm.meetingPlatform === 'in-person' ? sessionForm.location : sessionForm.meetingLink}
                  onChange={(e) => setSessionForm({ 
                    ...sessionForm, 
                    [sessionForm.meetingPlatform === 'in-person' ? 'location' : 'meetingLink']: e.target.value 
                  })}
                  placeholder={sessionForm.meetingPlatform === 'in-person' ? 'e.g., Room 301, CS Building' : 'https://zoom.us/j/...'}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={sessionForm.tags}
                onChange={(e) => setSessionForm({ ...sessionForm, tags: e.target.value })}
                placeholder="e.g., java, programming, beginner"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSessionForm({
                    title: '',
                    description: '',
                    date: '',
                    startTime: '10:00',
                    endTime: '11:00',
                    duration: 60,
                    maxStudents: 5,
                    meetingPlatform: 'zoom',
                    meetingLink: '',
                    location: '',
                    tags: '',
                    isRecurring: false,
                    recurringPattern: {
                      frequency: 'weekly',
                      dayOfWeek: 1,
                      endDate: ''
                    }
                  });
                }}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!sessionForm.title || !sessionForm.date}
                style={{
                  padding: '8px 16px',
                  background: !sessionForm.title || !sessionForm.date ? '#d1d5db' : '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !sessionForm.title || !sessionForm.date ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && selectedSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              Edit Office Hours Session
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Max Students *
                </label>
                <input
                  type="number"
                  value={sessionForm.maxStudents}
                  onChange={(e) => setSessionForm({ ...sessionForm, maxStudents: parseInt(e.target.value) })}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  Meeting Platform *
                </label>
                <select
                  value={sessionForm.meetingPlatform}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingPlatform: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="google-meet">Google Meet</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                  {sessionForm.meetingPlatform === 'in-person' ? 'Location' : 'Meeting Link'}
                </label>
                <input
                  type="text"
                  value={sessionForm.meetingPlatform === 'in-person' ? sessionForm.location : sessionForm.meetingLink}
                  onChange={(e) => setSessionForm({ 
                    ...sessionForm, 
                    [sessionForm.meetingPlatform === 'in-person' ? 'location' : 'meetingLink']: e.target.value 
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={sessionForm.tags}
                onChange={(e) => setSessionForm({ ...sessionForm, tags: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSession(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSession}
                disabled={!sessionForm.title || !sessionForm.date}
                style={{
                  padding: '8px 16px',
                  background: !sessionForm.title || !sessionForm.date ? '#d1d5db' : '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !sessionForm.title || !sessionForm.date ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Update Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorOfficeHours; 