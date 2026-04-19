import React, { useState, useEffect } from 'react';
import FaceAttendanceSystem from './FaceAttendanceSystem';
import FaceRegistration from './FaceRegistration';
import axios from '../api';

const AutoFaceAttendance = ({ user, onComplete }) => {
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      checkFaceRegistrationStatus();
      fetchEnrolledCourses();
    }
  }, [user]);

  const checkFaceRegistrationStatus = async () => {
    try {
      console.log('Checking face registration status...');
      const response = await axios.get('/api/face-recognition/status');
      console.log('Face registration status response:', response.data);

      setIsRegistered(response.data.isRegistered);

      if (response.data.isRegistered) {
        // User has face data, create session and proceed with attendance
        await createAttendanceSession();
      } else {
        // User needs to register face first
        setShowRegistration(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking face registration:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });

      // If it's a 401 error, the user might not be properly authenticated
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 404) {
        // If the endpoint doesn't exist, assume user is not registered
        console.log('Face recognition endpoint not found, assuming user needs registration');
        setIsRegistered(false);
        setShowRegistration(true);
        setLoading(false);
        return;
      } else {
        setError(`Failed to check face registration status: ${err.response?.data?.message || err.message}`);
      }
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      console.log('🔍 AutoFaceAttendance Debug - Fetching enrollments for student:', user.id);
      const response = await axios.get(`/courses/student/${user.id}/enrollments`);
      console.log('✅ AutoFaceAttendance Debug - Enrollments fetched:', response.data.length);

      // Extract courses from enrollments
      const coursesFromEnrollments = response.data.map(enrollment => enrollment.course).filter(course => course);
      console.log('✅ AutoFaceAttendance Debug - Courses extracted:', coursesFromEnrollments.length);

      setEnrolledCourses(coursesFromEnrollments);

      // Auto-select first course if available
      if (coursesFromEnrollments.length > 0) {
        setCurrentCourse(coursesFromEnrollments[0]);
      }
    } catch (error) {
      console.error('❌ AutoFaceAttendance Error - Error fetching courses:', error);
      console.error('❌ AutoFaceAttendance Error - Error details:', error.response?.data);
    }
  };

  const createAttendanceSession = async () => {
    try {
      if (!currentCourse) {
        setError('No course available for attendance.');
        setLoading(false);
        return;
      }

      // Create attendance session with face recognition method
      const response = await axios.post('/attendance/session/start', {
        courseId: currentCourse._id,
        activityType: 'face_recognition_login',
        courseModule: 'Face Recognition Login',
        verificationMethod: 'face_recognition'
      });

      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
        setShowFaceRecognition(true);
      } else {
        setError('Failed to create attendance session.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error creating attendance session:', error);
      setError('Failed to create attendance session.');
      setLoading(false);
    }
  };

  const handleRegistrationComplete = async () => {
    setShowRegistration(false);
    setIsRegistered(true);
    await createAttendanceSession();
  };

  const handleAttendanceMarked = (attendanceData) => {
    setAttendanceMarked(true);
    setShowFaceRecognition(false);
    
    // Show success message
    setTimeout(() => {
      if (onComplete) {
        onComplete({
          success: true,
          attendanceData,
          message: 'Attendance marked successfully via face recognition!'
        });
      }
    }, 2000);
  };

  const handleClose = () => {
    setShowFaceRecognition(false);
    setShowRegistration(false);
    
    if (onComplete) {
      onComplete({
        success: false,
        message: 'Face recognition attendance cancelled.'
      });
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete({
        success: false,
        skipped: true,
        message: 'Face recognition attendance skipped.'
      });
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3>Initializing Face Recognition</h3>
          <p>Checking your face registration status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h3>❌ Error</h3>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={checkFaceRegistrationStatus} style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Retry
            </button>
            <button onClick={handleSkip} style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (attendanceMarked) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h3>✅ Success!</h3>
          <p>Your attendance has been marked successfully using face recognition.</p>
          <div style={{
            background: '#e8f5e8',
            padding: '15px',
            borderRadius: '5px',
            margin: '15px 0',
            border: '1px solid #4caf50'
          }}>
            <strong>Welcome back, {user?.firstName}!</strong><br/>
            Attendance verified and recorded.
          </div>
        </div>
      </div>
    );
  }

  if (!isRegistered && !showRegistration) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h3>🔐 Face Recognition Setup Required</h3>
          <p>To use automatic attendance marking, you need to register your face first.</p>
          <div style={{
            background: '#fff3cd',
            padding: '15px',
            borderRadius: '5px',
            margin: '15px 0',
            border: '1px solid #ffc107'
          }}>
            <strong>Privacy Notice:</strong><br/>
            Your facial data will be encrypted and stored securely. You can delete it anytime from your profile settings.
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => setShowRegistration(true)} style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Register Face
            </button>
            <button onClick={handleSkip} style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showRegistration && (
        <FaceRegistration
          onClose={handleClose}
          onRegistered={handleRegistrationComplete}
        />
      )}
      
      {showFaceRecognition && currentCourse && sessionId && (
        <FaceAttendanceSystem
          user={user}
          onAttendanceMarked={handleAttendanceMarked}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default AutoFaceAttendance;
