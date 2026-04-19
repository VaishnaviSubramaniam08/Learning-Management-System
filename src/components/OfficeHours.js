import React, { useState, useEffect } from 'react';
import axios from '../api';

const OfficeHours = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    topic: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    instructor: '',
    date: '',
    tags: ''
  });

  useEffect(() => {
    fetchSessions();
    fetchMyBookings();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/office-hours', {
        params: { upcoming: true }
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`/office-hours/student/${user.id}/history`);
      setMyBookings(response.data);
    } catch (error) {
      console.error('Error fetching my bookings:', error);
    }
  };

  const handleBookSession = async (sessionId) => {
    try {
      await axios.post(`/office-hours/${sessionId}/book`, bookingForm);
      alert('Successfully booked session!');
      setShowBookingModal(false);
      setBookingForm({ topic: '', notes: '' });
      fetchSessions();
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book session');
    }
  };

  const handleCancelBooking = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.delete(`/office-hours/${sessionId}/book`);
        alert('Booking cancelled successfully!');
        fetchSessions();
        fetchMyBookings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const isBooked = (session) => {
    return session.bookedStudents.some(booking => 
      booking.student._id === user?.id || booking.student === user?.id
    );
  };

  const getMyBooking = (session) => {
    return session.bookedStudents.find(booking => 
      booking.student._id === user?.id || booking.student === user?.id
    );
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

  const filteredSessions = sessions.filter(session => {
    if (filters.instructor && !session.instructor.firstName.toLowerCase().includes(filters.instructor.toLowerCase())) {
      return false;
    }
    if (filters.date) {
      const sessionDate = new Date(session.date).toDateString();
      const filterDate = new Date(filters.date).toDateString();
      if (sessionDate !== filterDate) return false;
    }
    if (filters.tags && session.tags && !session.tags.some(tag => tag.toLowerCase().includes(filters.tags.toLowerCase()))) {
      return false;
    }
    return true;
  });

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
        <h2 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '24px' }}>
          🗓️ Office Hours
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Book one-on-one sessions with instructors for personalized help and support
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by instructor..."
            value={filters.instructor}
            onChange={(e) => setFilters({ ...filters, instructor: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <input
            type="text"
            placeholder="Filter by tags..."
            value={filters.tags}
            onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'available' ? '#6b46c1' : 'transparent',
            color: activeTab === 'available' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'available' ? '2px solid #6b46c1' : 'none',
            fontWeight: activeTab === 'available' ? 'bold' : 'normal'
          }}
        >
          Available Sessions ({filteredSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'my-bookings' ? '#6b46c1' : 'transparent',
            color: activeTab === 'my-bookings' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'my-bookings' ? '2px solid #6b46c1' : 'none',
            fontWeight: activeTab === 'my-bookings' ? 'bold' : 'normal'
          }}
        >
          My Bookings ({myBookings.length})
        </button>
      </div>

      {/* Available Sessions */}
      {activeTab === 'available' && (
        <div>
          {filteredSessions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ margin: '0 0 8px 0' }}>No sessions available</h3>
              <p style={{ margin: 0 }}>Check back later for new office hours sessions</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredSessions.map(session => (
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
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                        👨‍🏫 {session.instructor.firstName} {session.instructor.lastName}
                      </p>
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
                      <strong style={{ color: '#374151', fontSize: '14px' }}>👥 Available:</strong>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        {session.maxStudents - session.bookedStudents.length} of {session.maxStudents} slots
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

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {isBooked(session) ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#10b981', fontSize: '14px' }}>✓ Booked</span>
                        <button
                          onClick={() => handleCancelBooking(session._id)}
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
                          Cancel
                        </button>
                      </div>
                    ) : session.maxStudents > session.bookedStudents.length ? (
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowBookingModal(true);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#6b46c1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Book Session
                      </button>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '14px' }}>Full</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bookings */}
      {activeTab === 'my-bookings' && (
        <div>
          {myBookings.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px 0' }}>No bookings yet</h3>
              <p style={{ margin: 0 }}>Book your first office hours session to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {myBookings.map(session => {
                const myBooking = getMyBooking(session);
                return (
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
                        <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                          👨‍🏫 {session.instructor.firstName} {session.instructor.lastName}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: getBookingStatusColor(myBooking?.status || 'booked')
                        }}>
                          {myBooking?.status || 'booked'}
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
                        <strong style={{ color: '#374151', fontSize: '14px' }}>🌐 Platform:</strong>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {session.meetingPlatform === 'in-person' ? session.location : session.meetingPlatform}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>📝 Topic:</strong>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {myBooking?.topic || 'General discussion'}
                        </div>
                      </div>
                    </div>

                    {myBooking?.notes && (
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>📋 Notes:</strong>
                        <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                          {myBooking.notes}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 16px',
                            background: '#10b981',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          Join Meeting
                        </a>
                      )}
                      {myBooking?.status === 'booked' && new Date(session.date) > new Date() && (
                        <button
                          onClick={() => handleCancelBooking(session._id)}
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
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSession && (
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
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              Book Office Hours Session
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Session:</strong> {selectedSession.title}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Instructor:</strong> {selectedSession.instructor.firstName} {selectedSession.instructor.lastName}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Date:</strong> {formatDate(selectedSession.date)}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Time:</strong> {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                What would you like to discuss? *
              </label>
              <input
                type="text"
                value={bookingForm.topic}
                onChange={(e) => setBookingForm({ ...bookingForm, topic: e.target.value })}
                placeholder="e.g., Java programming help, Assignment questions..."
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Additional Notes (Optional)
              </label>
              <textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="Any specific questions or topics you'd like to cover..."
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

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedSession(null);
                  setBookingForm({ topic: '', notes: '' });
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
                onClick={() => handleBookSession(selectedSession._id)}
                disabled={!bookingForm.topic.trim()}
                style={{
                  padding: '8px 16px',
                  background: !bookingForm.topic.trim() ? '#d1d5db' : '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !bookingForm.topic.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeHours; 