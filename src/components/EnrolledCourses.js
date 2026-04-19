import React, { useState, useEffect } from 'react';
import axios from '../api';

const EnrolledCourses = ({ studentId }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});

  useEffect(() => {
    fetchEnrollments();
  }, [studentId]);

  const fetchEnrollments = async () => {
    try {
      console.log('🔍 Frontend Enrollments Debug - Fetching enrollments for student:', studentId);
      
      const response = await axios.get(`/courses/student/${studentId}/enrollments`);
      console.log('✅ Frontend Enrollments Debug - Enrollments received:', response.data.length);
      
      // Filter out any enrollments with missing course data (extra safety)
      const validEnrollments = response.data.filter(enrollment => {
        if (!enrollment.course) {
          console.log('⚠️ Frontend Enrollments Debug - Found enrollment with missing course data:', enrollment._id);
          return false;
        }
        return true;
      });
      
      console.log('✅ Frontend Enrollments Debug - Valid enrollments after filtering:', validEnrollments.length);
      setEnrollments(validEnrollments);
      
      // Initialize module progress
      const progress = {};
      validEnrollments.forEach(enrollment => {
        if (enrollment.course?.modules) {
          enrollment.course.modules.forEach(module => {
            progress[module._id] = false; // Default to not completed
          });
        }
      });
      setModuleProgress(progress);
    } catch (error) {
      console.error('❌ Frontend Enrollments Debug - Error fetching enrollments:', error);
      console.error('❌ Frontend Enrollments Debug - Error response:', error.response?.data);
      
      // Set empty enrollments on error to prevent UI issues
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = async (courseId, moduleId) => {
    console.log('🔍 Frontend Module Complete Debug - Starting module completion...');
    console.log('🔍 Frontend Module Complete Debug - Course ID:', courseId);
    console.log('🔍 Frontend Module Complete Debug - Module ID:', moduleId);
    console.log('🔍 Frontend Module Complete Debug - Student ID:', studentId);
    
    try {
      const progressData = {
        studentId,
        moduleId,
        completed: true
      };
      
      console.log('🔍 Frontend Module Complete Debug - Sending progress data:', progressData);
      
      // Update progress in backend
      const response = await axios.put(`/courses/${courseId}/progress`, progressData);
      console.log('✅ Frontend Module Complete Debug - Progress updated successfully:', response.data);
      
      // Update local state
      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: true
      }));
      console.log('✅ Frontend Module Complete Debug - Local state updated');
      
      // Refresh enrollments to get updated progress
      console.log('🔍 Frontend Module Complete Debug - Refreshing enrollments...');
      await fetchEnrollments();
      
      // Check if all modules are completed and trigger certificate generation
      const enrollment = enrollments.find(e => e.course._id === courseId);
      if (enrollment) {
        const totalModules = enrollment.course.modules.length;
        const completedModules = enrollment.moduleProgress.filter(mp => mp.completed).length;
        
        console.log('🔍 Frontend Module Complete Debug - Progress check:', {
          completed: completedModules,
          total: totalModules,
          isComplete: completedModules === totalModules
        });
        
        if (completedModules === totalModules) {
          console.log('🎉 Frontend Module Complete Debug - All modules completed! Triggering certificate generation...');
          
          try {
            const certificateResponse = await axios.post(`/courses/${courseId}/complete`, {
              studentId: studentId
            });
            
            console.log('✅ Frontend Module Complete Debug - Certificate generated:', certificateResponse.data);
            alert('🎉 Congratulations! You have completed the course and earned a certificate! Check your Certificates page to view and download it.');
          } catch (certError) {
            console.error('❌ Frontend Module Complete Debug - Certificate generation error:', certError);
            if (certError.response?.data?.message?.includes('already completed')) {
              alert('🎉 Course already completed! Your certificate is available in the Certificates page.');
            } else {
              alert('Module completed! Certificate generation will happen automatically.');
            }
          }
        } else {
          alert('Module marked as complete!');
        }
      } else {
        alert('Module marked as complete!');
      }
    } catch (error) {
      console.error('❌ Frontend Module Complete Debug - Error updating module progress:', error);
      console.error('❌ Frontend Module Complete Debug - Error response:', error.response?.data);
      console.error('❌ Frontend Module Complete Debug - Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error updating module progress';
      alert(`Failed to mark module as complete: ${errorMessage}`);
    }
  };

  const calculateCourseProgress = (enrollment) => {
    if (!enrollment.course?.modules || enrollment.course.modules.length === 0) return 0;
    
    // Use enrollment progress if available, otherwise calculate from moduleProgress state
    if (enrollment.progress !== undefined) {
      return enrollment.progress;
    }
    
    const completedModules = enrollment.course.modules.filter(module => 
      moduleProgress[module._id]
    ).length;
    
    return Math.round((completedModules / enrollment.course.modules.length) * 100);
  };

  const getModuleStatus = (module, enrollment) => {
    // Check if module is completed in enrollment data
    const moduleProgressEntry = enrollment.moduleProgress?.find(mp => mp.module === module._id);
    if (moduleProgressEntry?.completed) {
      return { status: 'completed', label: '✅ Completed', color: '#10b981' };
    }
    
    // Fallback to local state
    if (moduleProgress[module._id]) {
      return { status: 'completed', label: '✅ Completed', color: '#10b981' };
    }
    
    // Check if previous modules are completed
    if (enrollment.course?.modules) {
      const moduleIndex = enrollment.course.modules.findIndex(m => m._id === module._id);
      const previousModules = enrollment.course.modules.slice(0, moduleIndex);
      
      // Check if previous modules are completed using enrollment data
      const previousCompleted = previousModules.every(prevModule => {
        const prevProgressEntry = enrollment.moduleProgress?.find(mp => mp.module === prevModule._id);
        return prevProgressEntry?.completed || moduleProgress[prevModule._id];
      });
      
      if (moduleIndex === 0 || previousCompleted) {
        return { status: 'available', label: '🔓 Available', color: '#3b82f6' };
      } else {
        return { status: 'locked', label: '🔒 Locked', color: '#6b7280' };
      }
    }
    
    return { status: 'available', label: '🔓 Available', color: '#3b82f6' };
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#6b7280'
      }}>
        Loading your courses...
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '48px',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Courses Enrolled</h3>
        <p>You haven't enrolled in any courses yet. Browse available courses to get started!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 24px 0', color: '#374151', fontSize: '28px' }}>My Enrolled Courses</h2>
      
      <div style={{ display: 'grid', gap: '24px' }}>
        {enrollments.map(enrollment => {
          // Safety check: Skip enrollments with missing course data
          if (!enrollment.course) {
            console.log('⚠️ Frontend Render Debug - Skipping enrollment with missing course:', enrollment._id);
            return null;
          }
          
          return (
            <div
              key={enrollment._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
            {/* Course Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '24px' }}>
                    {enrollment.course?.title}
                  </h3>
                  <p style={{ color: '#6b7280', margin: '0 0 12px 0' }}>
                    {enrollment.course?.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{
                      background: '#e0e7ff',
                      color: '#3730a3',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {enrollment.course?.level}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      Instructor: {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                    </span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b46c1' }}>
                    {calculateCourseProgress(enrollment)}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Complete</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${calculateCourseProgress(enrollment)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6b46c1 0%, #8b5cf6 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* Modules Section */}
            {enrollment.course?.modules && enrollment.course.modules.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
                  Course Modules ({enrollment.course.modules.length} modules)
                </h4>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {enrollment.course.modules.map((module, index) => {
                    const moduleStatus = getModuleStatus(module, enrollment);
                    const isCompleted = moduleStatus.status === 'completed';
                    const isAvailable = moduleStatus.status === 'available';
                    
                    return (
                      <div
                        key={module._id}
                        style={{
                          background: isCompleted ? '#f0fdf4' : '#f9fafb',
                          border: `2px solid ${isCompleted ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          padding: '16px',
                          opacity: moduleStatus.status === 'locked' ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span style={{
                                background: '#6b46c1',
                                color: 'white',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {index + 1}
                              </span>
                              <h5 style={{ 
                                margin: 0, 
                                color: '#374151', 
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}>
                                {module.title}
                              </h5>
                              <span style={{
                                color: moduleStatus.color,
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                {moduleStatus.label}
                              </span>
                            </div>
                            
                            <p style={{ 
                              margin: '0 0 12px 0', 
                              color: '#6b7280', 
                              fontSize: '14px',
                              lineHeight: '1.5'
                            }}>
                              {module.description}
                            </p>
                            
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              {module.duration > 0 && (
                                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                  ⏱️ {module.duration} minutes
                                </span>
                              )}
                              {module.videoUrl && (
                                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                  🎥 Video included
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                ✅ Completed
                              </span>
                            ) : isAvailable ? (
                              <button
                                onClick={() => setSelectedCourse({ ...enrollment, selectedModule: module })}
                                style={{
                                  background: '#6b46c1',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '14px'
                                }}
                              >
                                Start Module
                              </button>
                            ) : (
                              <span style={{
                                background: '#6b7280',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                🔒 Locked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
        })}
      </div>

      {/* Module Detail Modal */}
      {selectedCourse && selectedCourse.selectedModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#374151', fontSize: '24px' }}>
                {selectedCourse.selectedModule.title}
              </h3>
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
                {selectedCourse.selectedModule.description}
              </p>
              
              {selectedCourse.selectedModule.videoUrl && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Video Content</h4>
                  <video
                    width="100%"
                    controls
                    style={{ borderRadius: '8px' }}
                  >
                    <source src={selectedCourse.selectedModule.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Module Content</h4>
                <div style={{
                  background: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {selectedCourse.selectedModule.content}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  handleModuleComplete(selectedCourse.course._id, selectedCourse.selectedModule._id);
                  setSelectedCourse(null);
                }}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Mark as Complete
              </button>
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses; 