import React, { useState, useEffect } from 'react';
import axios from '../api';

const ZoomMeetingScheduler = () => {
  const [courses, setCourses] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    courseId: '',
    scheduledDate: '',
    startTime: '',
    duration: 60,
    description: '',
    settings: {
      hostVideo: true,
      participantVideo: true,
      joinBeforeHost: false,
      muteUponEntry: true,
      watermark: false,
      autoRecording: 'none'
    }
  });

  useEffect(() => {
    fetchCourses();
    fetchMeetings();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('/zoom/instructor');
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/zoom', formData);
      
      // Reset form
      setFormData({
        topic: '',
        courseId: '',
        scheduledDate: '',
        startTime: '',
        duration: 60,
        description: '',
        settings: {
          hostVideo: true,
          participantVideo: true,
          joinBeforeHost: false,
          muteUponEntry: true,
          watermark: false,
          autoRecording: 'none'
        }
      });
      
      // Refresh meetings list
      fetchMeetings();
      alert('Zoom meeting scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert(error.response?.data?.message || 'Error scheduling meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      await axios.delete(`/zoom/${meetingId}`);
      fetchMeetings();
      alert('Meeting deleted successfully!');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert(error.response?.data?.message || 'Error deleting meeting');
    }
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      const response = await axios.post(`/zoom/${meetingId}/start`);
      alert('Meeting started! You can now join using the start URL.');
      fetchMeetings();
    } catch (error) {
      console.error('Error starting meeting:', error);
      alert(error.response?.data?.message || 'Error starting meeting');
    }
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      await axios.post(`/zoom/${meetingId}/end`);
      alert('Meeting ended successfully!');
      fetchMeetings();
    } catch (error) {
      console.error('Error ending meeting:', error);
      alert(error.response?.data?.message || 'Error ending meeting');
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateObj.toLocaleString();
  };

  const getStatusBadge = (meeting) => {
    const now = new Date();
    const startDateTime = new Date(meeting.scheduledDate);
    const [hours, minutes] = meeting.startTime.split(':');
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + meeting.duration * 60000);

    if (meeting.status === 'live') {
      return <span style={{ background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Live Now</span>;
    } else if (meeting.status === 'completed') {
      return <span style={{ background: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Completed</span>;
    } else if (now < startDateTime) {
      return <span style={{ background: '#059669', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Upcoming</span>;
    } else if (now >= startDateTime && now <= endDateTime) {
      return <span style={{ background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Live Now</span>;
    } else {
      return <span style={{ background: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Past</span>;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '28px' }}>
          📹 Schedule Zoom Meeting
        </h2>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>
          Create and manage Zoom meetings for your courses. Students will be able to join these meetings from their dashboard.
        </p>
      </div>

      {/* Schedule Meeting Form */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '32px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Create New Meeting</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Meeting Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Enter meeting topic"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Course *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Duration (minutes) *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Optional meeting description"
            />
          </div>

          {/* Meeting Settings */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>Meeting Settings</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="settings.hostVideo"
                  checked={formData.settings.hostVideo}
                  onChange={handleInputChange}
                />
                <span style={{ fontSize: '14px' }}>Host video on</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="settings.participantVideo"
                  checked={formData.settings.participantVideo}
                  onChange={handleInputChange}
                />
                <span style={{ fontSize: '14px' }}>Participant video on</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="settings.joinBeforeHost"
                  checked={formData.settings.joinBeforeHost}
                  onChange={handleInputChange}
                />
                <span style={{ fontSize: '14px' }}>Join before host</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="settings.muteUponEntry"
                  checked={formData.settings.muteUponEntry}
                  onChange={handleInputChange}
                />
                <span style={{ fontSize: '14px' }}>Mute upon entry</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#6b46c1',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </form>
      </div>

      {/* Meetings List */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Your Meetings</h3>
        
        {meetings.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            No meetings scheduled yet. Create your first meeting above.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Topic</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Course</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date & Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Duration</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map(meeting => (
                  <tr key={meeting._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: '#374151' }}>
                      {meeting.topic}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {meeting.course?.title || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {formatDateTime(meeting.scheduledDate, meeting.startTime)}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {meeting.duration} min
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(meeting)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {meeting.status === 'scheduled' && (
                          <button
                            onClick={() => handleStartMeeting(meeting._id)}
                            style={{
                              background: '#059669',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Start
                          </button>
                        )}
                        
                        {meeting.status === 'live' && (
                          <button
                            onClick={() => handleEndMeeting(meeting._id)}
                            style={{
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            End
                          </button>
                        )}
                        
                        {meeting.zoomStartUrl && (
                          <a
                            href={meeting.zoomStartUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              textDecoration: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            Join
                          </a>
                        )}
                        
                        <button
                          onClick={() => handleDeleteMeeting(meeting._id)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomMeetingScheduler; 