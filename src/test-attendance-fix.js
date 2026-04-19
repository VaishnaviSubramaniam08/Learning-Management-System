// Test script to verify the attendance tracker fix
import attendanceTracker from './services/attendanceTracker';

const testAttendanceTracker = () => {
  console.log('🧪 Testing AttendanceTracker event listeners...');

  // Test 1: Check if addListener method exists
  if (typeof attendanceTracker.addListener === 'function') {
    console.log('✅ addListener method exists');
  } else {
    console.error('❌ addListener method missing');
    return false;
  }

  // Test 2: Check if removeListener method exists
  if (typeof attendanceTracker.removeListener === 'function') {
    console.log('✅ removeListener method exists');
  } else {
    console.error('❌ removeListener method missing');
    return false;
  }

  // Test 3: Test adding a listener
  let eventReceived = false;
  const testListener = (event, data) => {
    console.log('📡 Event received:', event, data);
    eventReceived = true;
  };

  try {
    attendanceTracker.addListener(testListener);
    console.log('✅ Successfully added listener');
  } catch (error) {
    console.error('❌ Failed to add listener:', error);
    return false;
  }

  // Test 4: Test notifying listeners
  try {
    attendanceTracker.notifyListeners('test_event', { message: 'Test data' });
    if (eventReceived) {
      console.log('✅ Event notification working');
    } else {
      console.error('❌ Event notification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to notify listeners:', error);
    return false;
  }

  // Test 5: Test removing listener
  try {
    attendanceTracker.removeListener(testListener);
    console.log('✅ Successfully removed listener');
  } catch (error) {
    console.error('❌ Failed to remove listener:', error);
    return false;
  }

  // Test 6: Test mock data functionality
  try {
    attendanceTracker.enableMockData(true);
    console.log('✅ Mock data enabled successfully');
  } catch (error) {
    console.error('❌ Failed to enable mock data:', error);
    return false;
  }

  console.log('🎉 All tests passed! AttendanceTracker is working correctly.');
  return true;
};

// Export for use in components
export default testAttendanceTracker;

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Development mode detected - running attendance tracker tests');
  
  // Make available globally for console testing
  window.testAttendanceTracker = testAttendanceTracker;
  
  // Run tests automatically
  setTimeout(() => {
    testAttendanceTracker();
  }, 1000);
}
