import api from '../api';

// Helper function to format date for API requests
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
};

const SchedulerService = {
  // Get all events with optional filters
  getAllEvents: async (filters = {}) => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = formatDate(filters.startDate);
      if (filters.endDate) params.endDate = formatDate(filters.endDate);
      if (filters.type) params.type = filters.type;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.userId) params.userId = filters.userId;
      if (filters.upcoming !== undefined) params.upcoming = filters.upcoming.toString();
      if (filters.visibility) params.visibility = filters.visibility;

      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      // Format dates if they exist
      if (eventData.startDate) eventData.startDate = formatDate(eventData.startDate);
      if (eventData.endDate) eventData.endDate = formatDate(eventData.endDate);
      if (eventData.recurringPattern?.endDate) {
        eventData.recurringPattern.endDate = formatDate(eventData.recurringPattern.endDate);
      }

      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  updateEvent: async (eventId, eventData, updateAll = false) => {
    try {
      // Format dates if they exist
      if (eventData.startDate) eventData.startDate = formatDate(eventData.startDate);
      if (eventData.endDate) eventData.endDate = formatDate(eventData.endDate);
      if (eventData.recurringPattern?.endDate) {
        eventData.recurringPattern.endDate = formatDate(eventData.recurringPattern.endDate);
      }

      // Add flag for updating all recurring instances
      eventData.updateAll = updateAll;

      const response = await api.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (eventId, deleteAll = false) => {
    try {
      const params = {};
      if (deleteAll) params.deleteAll = 'true';

      const response = await api.delete(`/events/${eventId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      throw error;
    }
  },

  // Get calendar view (month view)
  getCalendarView: async (year, month, courseId = null) => {
    try {
      const params = {};
      if (courseId) params.courseId = courseId;

      const response = await api.get(`/events/calendar/${year}/${month}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching calendar for ${year}-${month}:`, error);
      throw error;
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (limit = 5, courseId = null) => {
    try {
      const params = {
        upcoming: 'true',
        limit
      };
      if (courseId) params.courseId = courseId;

      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Get events by type
  getEventsByType: async (type) => {
    try {
      const params = { type };
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching events of type ${type}:`, error);
      throw error;
    }
  },

  // Get events for a course
  getCourseEvents: async (courseId) => {
    try {
      const params = { courseId };
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching events for course ${courseId}:`, error);
      throw error;
    }
  },

  // Get events for a user
  getUserEvents: async (userId) => {
    try {
      const params = { userId };
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching events for user ${userId}:`, error);
      throw error;
    }
  }
};

export default SchedulerService;
