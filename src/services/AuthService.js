/**
 * Authentication Service
 * Handles user authentication, session management, and permissions
 */

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.listeners = [];
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Check if user is a student
   * @returns {boolean} True if user is a student
   */
  isStudent() {
    return this.user && this.user.role === 'student';
  }

  /**
   * Check if user is an instructor
   * @returns {boolean} True if user is an instructor
   */
  isInstructor() {
    return this.user && this.user.role === 'instructor';
  }

  /**
   * Check if user is an admin
   * @returns {boolean} True if user is an admin
   */
  isAdmin() {
    return this.user && this.user.role === 'admin';
  }

  /**
   * Get user profile information
   * @returns {Object} User profile data
   */
  getUserProfile() {
    return this.user;
  }

  /**
   * Login user and store authentication data
   * @param {string} token - JWT token
   * @param {Object} userData - User data
   */
  login(token, userData) {
    this.token = token;
    this.user = userData;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    this.notifyListeners('login', userData);
  }

  /**
   * Logout user and clear authentication data
   */
  logout() {
    this.token = null;
    this.user = {};
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.notifyListeners('logout');
  }

  /**
   * Check if user can access specific exam preparation
   * @param {string} examType - Type of exam (e.g., 'neet', 'jee')
   * @returns {boolean} Access permission
   */
  canAccessExam(examType) {
    // For demo purposes, allow access to all exam types
    // In production, this would check user subscriptions or permissions
    return true;
  }

  /**
   * Add authentication state change listener
   * @param {Function} listener - Callback function
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * Remove authentication state change listener
   * @param {Function} listener - Callback function to remove
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of authentication state change
   * @param {string} event - Event type ('login' or 'logout')
   * @param {Object} userData - User data (for login event)
   */
  notifyListeners(event, userData = null) {
    this.listeners.forEach(listener => {
      try {
        listener(event, userData);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;