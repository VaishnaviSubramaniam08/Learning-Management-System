import React, { useState, useEffect } from 'react';
import SchedulerService from '../services/SchedulerService';

export default function Scheduler() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'calendar', 'day'
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'Other',
    startDate: new Date(),
    endDate: null,
    allDay: false,
    location: '',
    url: '',
    color: '#3788d8',
    visibility: 'private'
  });

  // Event types with colors
  const eventTypes = [
    { value: 'Live Class', color: '#4CAF50' },
    { value: 'Deadline', color: '#F44336' },
    { value: 'Office Hour', color: '#2196F3' },
    { value: 'Assignment', color: '#FF9800' },
    { value: 'Exam', color: '#9C27B0' },
    { value: 'Meeting', color: '#607D8B' },
    { value: 'Other', color: '#9E9E9E' }
  ];

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await SchedulerService.getAllEvents({ upcoming: true });
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Get color for event type
  const getEventColor = (type) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.color : '#3788d8';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle date input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value ? new Date(value) : null
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Set color based on event type if not specified
      if (!newEvent.color) {
        newEvent.color = getEventColor(newEvent.type);
      }
      
      if (selectedEvent) {
        // Update existing event
        await SchedulerService.updateEvent(selectedEvent._id, newEvent);
      } else {
        // Create new event
        await SchedulerService.createEvent(newEvent);
      }
      
      // Refresh events list
      await fetchEvents();
      
      // Reset form and close modal
      setNewEvent({
        title: '',
        description: '',
        type: 'Other',
        startDate: new Date(),
        endDate: null,
        allDay: false,
        location: '',
        url: '',
        color: '#3788d8',
        visibility: 'private'
      });
      setSelectedEvent(null);
      setShowEventModal(false);
      
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setLoading(true);
      await SchedulerService.deleteEvent(eventId);
      await fetchEvents();
      setSelectedEvent(null);
      setShowEventModal(false);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit event
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      type: event.type,
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : null,
      allDay: event.allDay || false,
      location: event.location || '',
      url: event.url || '',
      color: event.color || getEventColor(event.type),
      visibility: event.visibility || 'private'
    });
    setShowEventModal(true);
  };

  // Render event form modal
  const renderEventModal = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 24,
          width: '90%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <h3 style={{ marginTop: 0 }}>{selectedEvent ? 'Edit Event' : 'Add New Event'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Title *</label>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #ddd'
                }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #ddd',
                  minHeight: 80
                }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Event Type *</label>
              <select
                name="type"
                value={newEvent.type}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #ddd'
                }}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.value}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={newEvent.startDate ? (newEvent.startDate instanceof Date ? newEvent.startDate.toISOString().split('T')[0] : newEvent.startDate.split('T')[0]) : ''}
                  onChange={handleDateChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid #ddd'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={newEvent.endDate ? newEvent.endDate.toISOString().split('T')[0] : ''}
                  onChange={handleDateChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="allDay"
                  checked={newEvent.allDay}
                  onChange={handleInputChange}
                  style={{ marginRight: 8 }}
                />
                All Day Event
              </label>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Location</label>
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #ddd'
                }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>URL</label>
              <input
                type="url"
                name="url"
                value={newEvent.url}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #ddd'
                }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Visibility</label>
              <select
                name="visibility"
                value={newEvent.visibility}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #ddd'
                }}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="course">Course</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <div>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                    setNewEvent({
                      title: '',
                      description: '',
                      type: 'Other',
                      startDate: new Date(),
                      endDate: null,
                      allDay: false,
                      location: '',
                      url: '',
                      color: '#3788d8',
                      visibility: 'private'
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    if (events.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p>No upcoming events. Click "Add Event" to create one.</p>
        </div>
      );
    }

    return (
      <div>
        {events.map((event) => (
          <div 
            key={event._id} 
            onClick={() => handleEditEvent(event)}
            style={{
              padding: 16,
              marginBottom: 12,
              borderRadius: 8,
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              borderLeft: `4px solid ${event.color || getEventColor(event.type)}`,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{event.title}</h3>
                {event.description && (
                  <p style={{ margin: '0 0 8px 0', color: '#666' }}>{event.description}</p>
                )}
              </div>
              <span style={{
                backgroundColor: event.color || getEventColor(event.type),
                color: 'white',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {event.type}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: 14, marginTop: 8 }}>
              <span style={{ marginRight: 16 }}>
                📅 {formatDate(event.startDate)}
                {event.endDate && ` - ${formatDate(event.endDate)}`}
              </span>
              {!event.allDay && (
                <span>
                  🕒 {formatTime(event.startDate)}
                </span>
              )}
            </div>
            {event.location && (
              <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
                📍 {event.location}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render calendar view (placeholder for now)
  const renderCalendarView = () => {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <p>Calendar view will be implemented in the next update.</p>
        <p>Please use the list view for now.</p>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Scheduler</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setView('list')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'list' ? '#4CAF50' : '#f0f0f0',
              color: view === 'list' ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'calendar' ? '#4CAF50' : '#f0f0f0',
              color: view === 'calendar' ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Calendar
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Add Event
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, backgroundColor: '#ffebee', color: '#c62828', borderRadius: 4, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading && !showEventModal ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p>Loading events...</p>
        </div>
      ) : (
        <div>
          {view === 'list' ? renderListView() : renderCalendarView()}
        </div>
      )}

      {showEventModal && renderEventModal()}
    </div>
  );
}
