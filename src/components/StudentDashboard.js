import React, { useState, useEffect } from 'react';
import EnrolledCourses from './EnrolledCourses';
import StudentAssessmentTab from './StudentAssessmentTab';
import InteractiveGameification from './InteractiveGameification';
import GamificationHub from './GamificationHub';
import CertificatesPage from './CertificatesPage';
import AttendanceManager from './AttendanceManager';
import StudentPerformance from './StudentPerformance';
import Scheduler from './Scheduler';
import LiveSession from './LiveSession';
import Certification from './Certification';
import StudentContests from './StudentContests';
import AssignmentManager from './AssignmentManager';
import OfficeHours from './OfficeHours';
import StudentFileUpload from './StudentFileUpload';
import MyFiles from './MyFiles';
import AIAssistant from './AIAssistant';
import ExamPrep from './ExamPrep';
import CareerPrep from './CareerPrep';

import AICareerGuidance from './AICareerGuidance';
import StudyMaterialsHub from './StudyMaterialsHub';
import LanguageLearning from './LanguageLearning';
import FaceAttendanceSystem from './FaceAttendanceSystem';
import BookMaterials from './BookMaterials';
import AttendanceDiagnostic from "./AttendanceDiagnostic";
import CourseManagement from "./CourseManagement";
import InstructorDashboard from "./InstructorDashboard";

const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ percent: 0, present: 0, absent: 0 });
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [showCourseCreation, setShowCourseCreation] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState('student');
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);

  // Dashboard options
  const dashboardOptions = [
    { 
      id: 'student', 
      name: 'Student Dashboard', 
      icon: '🎓', 
      description: 'Access student features and learning tools' 
    },
    { 
      id: 'instructor', 
      name: 'Instructor Dashboard', 
      icon: '👨‍🏫', 
      description: 'Manage courses and track student progress' 
    },
    { 
      id: 'admin', 
      name: 'Admin Dashboard', 
      icon: '⚙️', 
      description: 'System administration and management' 
    }
  ];

  const TABS = [
    { key: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { key: 'courses', label: 'My Courses', icon: '📚' },
    { key: 'enroll', label: '+ Enroll in Courses', icon: '➕' },
    { key: 'assessment', label: 'Assessment', icon: '📝' },
    { key: 'gamification', label: 'Gaming Arena', icon: '⚔️' },
    { key: 'certificates', label: 'Certificates', icon: '🏆' },
    { key: 'attendance', label: 'Attendance', icon: '🕒' },
    { key: 'attendanceDiagnostic', label: 'Attendance Diagnostic', icon: '📊' },
    { key: 'performance', label: 'Performance', icon: '📈' },
    { key: 'contests', label: 'Contests', icon: '🏆' },
    { key: 'assignments', label: 'Assignments', icon: '📋' },
    { key: 'scheduler', label: 'Scheduler', icon: '📅' },
    { key: 'live', label: 'Live Session', icon: '🎥' },
    { key: 'certification', label: 'Certification', icon: '🎓' },
    { key: 'officeHours', label: 'Office Hours', icon: '🏢' },
    { key: 'fileUpload', label: 'File Upload', icon: '📤' },
    { key: 'myFiles', label: 'My Files', icon: '📁' },
    { key: 'examPrep', label: 'Exam Preparation', icon: '📘' },
    { key: 'careerPrep', label: 'Career Preparation', icon: '💼' },

    { key: 'aiCareerGuidance', label: 'AI Career Guidance', icon: '🤖' },
    { key: 'studyMaterials', label: 'Study Materials', icon: '📚' },
    { key: 'languageLearning', label: 'Language Learning', icon: '🌍' },
    { key: 'faceAttendance', label: 'Face Attendance', icon: '📷' },
    { key: 'bookMaterials', label: 'Book Materials', icon: '📚' },
    { key: 'aiAssistant', label: 'AI Assistant', icon: '🤖', isSpecial: true },
  ];

  // Dummy data for components that need it
  const dummyEvents = [
    { id: 1, title: 'Math Class', start: new Date(), end: new Date() }
  ];
  
  const dummySession = {
    id: 1,
    title: 'Live Math Session',
    instructor: 'Dr. Smith',
    isLive: true
  };
  
  const dummyCertificate = {
    id: 1,
    courseName: 'React Development',
    studentName: user?.name || 'Student',
    completionDate: new Date(),
    grade: 'A+'
  };

  // Fetch functions
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      if (!user?.id) return;
      const response = await fetch(`/api/enrollments/student/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      if (!user?.id) return;
      const response = await fetch(`/api/attendance/stats/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceStats(data);
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      setAttendanceStats({ percent: 85, present: 17, absent: 3 });
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      if (!user?.id) return;
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id, courseId })
      });
      
      if (response.ok) {
        alert('Successfully enrolled in course!');
        fetchEnrollments();
        fetchCourses();
      } else {
        alert('Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
      fetchEnrollments();
      fetchAttendanceStats();
    }
  }, [user]);

  // Show loading state if user is not available
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🎓</div>
          <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Loading Dashboard...</h2>
          <p style={{ color: '#6b7280' }}>Please wait while we prepare your learning environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Dashboard Dropdown */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', marginRight: '12px' }}>
              {dashboardOptions.find(d => d.id === currentDashboard)?.icon}
            </span>
            
            {/* Dashboard Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDashboardDropdown(!showDashboardDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {dashboardOptions.find(d => d.id === currentDashboard)?.name}
                <span style={{ fontSize: '16px', color: '#6b7280' }}>
                  {showDashboardDropdown ? '▲' : '▼'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showDashboardDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  minWidth: '320px',
                  zIndex: 1000,
                  marginTop: '8px'
                }}>
                  <div style={{ padding: '12px 0' }}>
                    {dashboardOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setCurrentDashboard(option.id);
                          setShowDashboardDropdown(false);
                          setActiveTab('overview');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          border: 'none',
                          background: currentDashboard === option.id ? '#f0f9ff' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          if (currentDashboard !== option.id) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentDashboard !== option.id) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>{option.icon}</span>
                        <div>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#1f2937',
                            fontSize: '16px',
                            marginBottom: '2px'
                          }}>
                            {option.name}
                          </div>
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '13px',
                            lineHeight: '1.3'
                          }}>
                            {option.description}
                          </div>
                        </div>
                        {currentDashboard === option.id && (
                          <span style={{ 
                            marginLeft: 'auto', 
                            color: '#3b82f6',
                            fontSize: '16px'
                          }}>
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="user-info">
            <span className="user-welcome">Welcome, {user?.firstName} {user?.lastName}</span>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content Based on Selection */}
      {currentDashboard === 'instructor' ? (
        <InstructorDashboard />
      ) : currentDashboard === 'admin' ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>Admin Dashboard</h2>
          <p style={{ color: '#6b7280' }}>Admin dashboard functionality coming soon...</p>
        </div>
      ) : (
        /* Student Dashboard - Sidebar Layout */
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
          {/* Left Sidebar */}
          <div style={{
            width: '320px',
            backgroundColor: 'white',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            padding: '20px'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '20px',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '10px'
            }}>
              Student Features
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTab === tab.key ? '#e0e7ff' : 'transparent',
                    color: activeTab === tab.key ? '#3730a3' : '#4b5563',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.key ? '600' : '500',
                    borderLeft: activeTab === tab.key ? '4px solid #3730a3' : '4px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.key) {
                      e.target.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.key) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#f8fafc'
          }}>
            {activeTab === 'overview' && (
              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Enrolled Courses</h3>
                    <div className="stat-number">{enrollments.length}</div>
                    <p className="stat-description">Currently enrolled</p>
                  </div>
                  <div className="stat-card">
                    <h3>Completed Courses</h3>
                    <div className="stat-number">
                      {enrollments.filter(e => e.status === 'completed').length}
                    </div>
                    <p className="stat-description">Successfully finished</p>
                  </div>
                  <div className="stat-card">
                    <h3>Average Progress</h3>
                    <div className="stat-number">
                      {enrollments.length > 0
                        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
                        : 0}%
                    </div>
                    <p className="stat-description">Across all courses</p>
                  </div>
                  <div className="stat-card">
                    <h3>Attendance Rate</h3>
                    <div className="stat-number">{attendanceStats.percent}%</div>
                    <p className="stat-description">Class attendance</p>
                  </div>
                </div>

                <div className="widget-container">
                  <h3 className="section-title">
                    <span>📚</span>
                    My Recent Courses
                  </h3>
                  {enrollments.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📚</div>
                      <div className="empty-state-title">No courses enrolled yet</div>
                      <div className="empty-state-description">
                        Browse available courses and start your learning journey!
                      </div>
                    </div>
                  ) : (
                    <div className="courses-grid">
                      {enrollments.slice(0, 3).map(enrollment => (
                        <div key={enrollment._id} className="course-card">
                          <div className="course-header">
                            <div>
                              <h4 className="course-title">{enrollment.course?.title || 'Course Title'}</h4>
                              <p className="course-instructor">
                                By {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                              </p>
                            </div>
                            <span className={`status-badge ${enrollment.status || 'active'}`}>
                              {enrollment.status || 'Active'}
                            </span>
                          </div>
                          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                            {enrollment.course?.description || 'Course description'}
                          </p>
                          <div className="course-progress">
                            <div className="progress-label">
                              <span>Progress: {enrollment.progress || 0}%</span>
                              <span>Level: {enrollment.course?.level || 'Beginner'}</span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="course-actions">
                            <button
                              className="action-button action-button-primary"
                              onClick={() => setActiveTab('courses')}
                            >
                              Continue Learning
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="widget-container">
                  <h3 className="section-title">
                    <span>🎯</span>
                    Quick Actions
                  </h3>
                  <div className="courses-grid">
                    <div className="course-card">
                      <h4 className="course-title">Browse Courses</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Discover new courses and expand your knowledge
                      </p>
                      <button
                        className="action-button action-button-primary"
                        onClick={() => setActiveTab('enroll')}
                      >
                        Browse Courses
                      </button>
                    </div>
                    <div className="course-card">
                      <h4 className="course-title">Take Assessment</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Test your knowledge with quizzes and assessments
                      </p>
                      <button
                        className="action-button action-button-secondary"
                        onClick={() => setActiveTab('assessment')}
                      >
                        Start Assessment
                      </button>
                    </div>
                    <div className="course-card">
                      <h4 className="course-title">Practice Games</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Engage with gamified learning and earn badges
                      </p>
                      <button
                        className="action-button action-button-secondary"
                        onClick={() => setActiveTab('gamification')}
                      >
                        Play Games
                      </button>
                    </div>
                    <div className="course-card">
                      <h4 className="course-title">View Performance</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Track your learning progress and achievements
                      </p>
                      <button
                        className="action-button action-button-secondary"
                        onClick={() => setActiveTab('performance')}
                      >
                        View Progress
                      </button>
                    </div>
                    <div className="course-card">
                      <h4 className="course-title">Join Live Class</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Attend live sessions and interact with instructors
                      </p>
                      <button
                        className="action-button action-button-secondary"
                        onClick={() => setActiveTab('live')}
                      >
                        Join Session
                      </button>
                    </div>
                    <div className="course-card">
                      <h4 className="course-title">Get AI Help</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Ask questions and get personalized learning assistance
                      </p>
                      <button
                        className="action-button action-button-secondary"
                        onClick={() => setActiveTab('aiAssistant')}
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <EnrolledCourses studentId={user?.id} />
            )}

            {activeTab === 'enroll' && (
              <div>
                <h2 className="section-title">➕ Create New Course</h2>
                <CourseManagement instructorId={user?.id} />
              </div>
            )}

            {activeTab === 'assessment' && (
              <div>
                <h2 className="section-title">📝 Assessments</h2>
                <StudentAssessmentTab studentId={user?.id} />
              </div>
            )}

            {activeTab === 'gamification' && (
              <div>
                <GamificationHub user={user} />
              </div>
            )}

            {activeTab === 'certificates' && (
              <CertificatesPage />
            )}

            {activeTab === 'attendance' && (
              <AttendanceManager user={user} />
            )}

            {activeTab === 'attendanceDiagnostic' && (
              <AttendanceDiagnostic />
            )}

            {activeTab === 'bookMaterials' && (
              <BookMaterials />
            )}

            {activeTab === 'examPrep' && (
              <div>
                <h2 className="section-title">📘 Exam Preparation</h2>
                <ExamPrep user={user} />
              </div>
            )}

            {activeTab === 'careerPrep' && (
              <CareerPrep user={user} />
            )}



            {activeTab === 'aiCareerGuidance' && (
              <AICareerGuidance user={user} />
            )}

            {activeTab === 'studyMaterials' && (
              <StudyMaterialsHub user={user} />
            )}

            {activeTab === 'languageLearning' && (
              <LanguageLearning user={user} />
            )}

            {activeTab === 'faceAttendance' && (
              <FaceAttendanceSystem user={user} />
            )}

            {activeTab === 'scheduler' && (
              <Scheduler events={dummyEvents} onEventClick={e => alert(e.title)} />
            )}

            {activeTab === 'live' && (
              <LiveSession session={dummySession} onJoin={() => alert('Joining live!')} chatMessages={[]} onSendMessage={msg => alert(msg)} />
            )}

            {activeTab === 'performance' && (
              <StudentPerformance userId={user?.id} />
            )}

            {activeTab === 'certification' && (
              <Certification certificate={dummyCertificate} />
            )}

            {activeTab === 'contests' && (
              <StudentContests studentId={user?.id} />
            )}

            {activeTab === 'assignments' && (
              <AssignmentManager user={user} />
            )}

            {activeTab === 'officeHours' && (
              <OfficeHours user={user} />
            )}

            {activeTab === 'fileUpload' && (
              <StudentFileUpload user={user} />
            )}

            {activeTab === 'myFiles' && (
              <MyFiles user={user} />
            )}

            {activeTab === 'aiAssistant' && (
              <AIAssistant />
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
