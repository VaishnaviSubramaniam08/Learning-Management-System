import React, { useState, useEffect } from 'react';
import axios from '../api';

const LiveSession = () => {
  const [meetings, setMeetings] = useState([]);
  const [liveMeetings, setLiveMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchMeetings();
    // Refresh meetings every 30 seconds to check for live status
    const interval = setInterval(fetchMeetings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const [upcomingRes, liveRes] = await Promise.all([
        axios.get('/zoom/upcoming'),
        axios.get('/zoom/live')
      ]);
      
      setMeetings(upcomingRes.data);
      setLiveMeetings(liveRes.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      const response = await axios.post(`/zoom/${meetingId}/join`);
      // Open Zoom meeting in new tab
      window.open(response.data.joinUrl, '_blank');
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert(error.response?.data?.message || 'Error joining meeting');
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateObj.toLocaleString();
  };

  const getTimeUntilMeeting = (date, time) => {
    const now = new Date();
    const meetingTime = new Date(date);
    const [timeHours, timeMinutes] = time.split(':');
    meetingTime.setHours(parseInt(timeHours), parseInt(timeMinutes), 0, 0);
    
    const diff = meetingTime - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'Starting now';
  };

  const getStatusBadge = (meeting) => {
    const now = new Date();
    const startDateTime = new Date(meeting.scheduledDate);
    const [hours, minutes] = meeting.startTime.split(':');
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + meeting.duration * 60000);

    if (meeting.status === 'live' || (now >= startDateTime && now <= endDateTime)) {
      return <span style={{ background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>🔴 Live Now</span>;
    } else if (now < startDateTime) {
      return <span style={{ background: '#059669', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>⏰ Upcoming</span>;
    } else {
      return <span style={{ background: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>✅ Completed</span>;
    }
  };

  const renderMeetingCard = (meeting) => {
    const isLive = meeting.status === 'live' || getStatusBadge(meeting).props.children.includes('Live Now');
    
    return (
      <div
        key={meeting._id}
        style={{
          background: isLive ? '#fef2f2' : 'white',
          border: isLive ? '2px solid #dc2626' : '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: isLive ? '0 4px 12px rgba(220, 38, 38, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{ 
            margin: 0, 
            color: '#374151', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {meeting.topic}
          </h3>
          {getStatusBadge(meeting)}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
            <strong>Course:</strong> {meeting.course?.title || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
            <strong>Instructor:</strong> {meeting.instructor?.firstName} {meeting.instructor?.lastName}
          </p>
          <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
            <strong>Date & Time:</strong> {formatDateTime(meeting.scheduledDate, meeting.startTime)}
          </p>
          <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
            <strong>Duration:</strong> {meeting.duration} minutes
          </p>
          {meeting.description && (
            <p style={{ margin: '8px 0 0 0', color: '#374151', fontSize: '14px', fontStyle: 'italic' }}>
              {meeting.description}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>
            {isLive ? (
              <span style={{ color: '#dc2626', fontWeight: '500' }}>🔴 Meeting is live now!</span>
            ) : (
              <span>Starts in: {getTimeUntilMeeting(meeting.scheduledDate, meeting.startTime)}</span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {isLive ? (
              <button
                onClick={() => handleJoinMeeting(meeting._id)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔴 Join Live
              </button>
            ) : (
              <button
                onClick={() => handleJoinMeeting(meeting._id)}
                style={{
                  background: '#6b46c1',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Join Meeting
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Loading meetings...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '28px' }}>
          📹 Live Classes
        </h2>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>
          Join live Zoom meetings with your instructors. Live meetings are highlighted in red.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            background: activeTab === 'upcoming' ? '#6b46c1' : 'transparent',
            color: activeTab === 'upcoming' ? 'white' : '#6b7280',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'upcoming' ? '600' : '400'
          }}
        >
          Upcoming ({meetings.length})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          style={{
            background: activeTab === 'live' ? '#dc2626' : 'transparent',
            color: activeTab === 'live' ? 'white' : '#6b7280',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'live' ? '600' : '400'
          }}
        >
          Live Now ({liveMeetings.length})
        </button>
      </div>

      {/* Meetings List */}
      <div>
        {activeTab === 'upcoming' && (
          <div>
            {meetings.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No upcoming meetings</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Check back later for scheduled live classes.
                </p>
              </div>
            ) : (
              <div>
                {meetings.map(renderMeetingCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'live' && (
          <div>
            {liveMeetings.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No live meetings</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  There are no live meetings at the moment.
                </p>
              </div>
            ) : (
              <div>
                {liveMeetings.map(renderMeetingCard)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{ 
        marginTop: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#374151' }}>Upcoming</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6b46c1' }}>
            {meetings.length}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔴</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#374151' }}>Live Now</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {liveMeetings.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveSession; 