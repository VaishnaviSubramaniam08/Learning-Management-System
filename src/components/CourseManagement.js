import React, { useState, useEffect } from 'react';
import axios from '../api';
import AddModuleForm from './AddModuleForm';

const CourseManagement = ({ instructorId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    overview: 'Course overview and introduction',
    learningOutcomes: ['Learn fundamental concepts', 'Apply knowledge in practice'],
    category: '',
    level: 'beginner',
    duration: 0,
    price: 0,
    modules: []
  });
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [instructorId]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/courses?instructor=${instructorId}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseFormSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Frontend Debug - Course form data:', JSON.stringify(courseForm, null, 2));
    console.log('🔍 Frontend Debug - Editing course:', editingCourse);
    
    try {
      if (editingCourse) {
        console.log('🔍 Frontend Debug - Updating existing course...');
        const response = await axios.put(`/courses/${editingCourse._id}`, courseForm);
        console.log('✅ Frontend Debug - Course updated successfully:', response.data);
      } else {
        console.log('🔍 Frontend Debug - Creating new course...');
        const response = await axios.post('/courses', { ...courseForm, instructor: instructorId });
        console.log('✅ Frontend Debug - Course created successfully:', response.data);
      }
      
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseForm({
        title: '',
        description: '',
        overview: 'Course overview and introduction',
        learningOutcomes: ['Learn fundamental concepts', 'Apply knowledge in practice'],
        category: '',
        level: 'beginner',
        duration: 0,
        price: 0,
        modules: []
      });
      fetchCourses();
    } catch (error) {
      console.error('❌ Frontend Debug - Error saving course:', error);
      console.error('❌ Frontend Debug - Error response:', error.response?.data);
      console.error('❌ Frontend Debug - Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving course';
      alert(`Error saving course: ${errorMessage}`);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      overview: course.overview || 'Course overview and introduction',
      learningOutcomes: course.learningOutcomes || ['Learn fundamental concepts', 'Apply knowledge in practice'],
      category: course.category,
      level: course.level || 'beginner',
      duration: course.duration || 0,
      price: course.price || 0,
      modules: course.modules || []
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error deleting course');
      }
    }
  };

  const handleModuleAdded = (newModule) => {
    setShowAddModuleForm(false);
    setSelectedCourseForModule(null);
    fetchCourses();
  };

  const handleAddModule = (course) => {
    setSelectedCourseForModule(course);
    setShowAddModuleForm(true);
  };

  const handleManageModules = (course) => {
    setSelectedCourse(course);
    setShowModuleForm(true);
  };

  const handleManageCertificates = (course) => {
    // This will be handled by the parent InstructorDashboard component
    // We'll emit an event or use a callback to open the certificate manager
    console.log('Certificate management requested for course:', course.title);
    // For now, we'll show an alert with instructions
    alert(`Certificate management for "${course.title}"\n\nThis feature is available in the Certification tab of the instructor dashboard.`);
  };

  const handleDeleteModule = async (courseId, moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await axios.delete(`/courses/${courseId}/modules/${moduleId}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting module:', error);
        alert('Error deleting module');
      }
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#374151', fontSize: '28px' }}>Course Management</h2>
        <button
          onClick={() => setShowCourseForm(true)}
          style={{
            background: '#6b46c1',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          + Create New Course
        </button>
      </div>

      {/* Course List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {courses.map(course => (
          <div
            key={course._id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: '#374151', fontSize: '20px' }}>
                    {course.title} ({course.level})
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      background: course.modules && course.modules.length >= 5 ? '#d4edda' : '#fff3cd',
                      color: course.modules && course.modules.length >= 5 ? '#155724' : '#856404',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {course.modules ? course.modules.length : 0} modules
                    </span>
                    {course.certificateTemplate && (
                      <span style={{
                        background: '#d1ecf1',
                        color: '#0c5460',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        🏆 Certificate Ready
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>{course.description}</p>
                
                {/* Modules List */}
                {course.modules && course.modules.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Modules:</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {course.modules.map((module, index) => (
                        <div
                          key={module._id}
                          style={{
                            background: '#f9fafb',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ color: '#374151' }}>
                              {index + 1}. {module.title}
                            </strong>
                            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                              {module.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteModule(course._id, module._id)}
                            style={{
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                <button
                  onClick={() => handleEditCourse(course)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => handleAddModule(course)}
                  style={{
                    background: '#6b46c1',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Module
                </button>
                <button
                  onClick={() => handleManageCertificates(course)}
                  disabled={!course.modules || course.modules.length < 5}
                  style={{
                    background: course.modules && course.modules.length >= 5 ? '#d4af37' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: course.modules && course.modules.length >= 5 ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                  title={course.modules && course.modules.length >= 5 ? 'Manage certificate templates' : 'Need 5+ modules to create certificates'}
                >
                  🏆 Certificates
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Form Modal */}
      {showCourseForm && (
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#374151' }}>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h3>
            
            <form onSubmit={handleCourseFormSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                    Description
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    required
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                    Overview
                  </label>
                  <textarea
                    value={courseForm.overview}
                    onChange={(e) => setCourseForm({ ...courseForm, overview: e.target.value })}
                    required
                    rows="3"
                    placeholder="Course overview and introduction"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                    Learning Outcomes
                  </label>
                  <textarea
                    value={courseForm.learningOutcomes.join('\n')}
                    onChange={(e) => setCourseForm({ 
                      ...courseForm, 
                      learningOutcomes: e.target.value.split('\n').filter(outcome => outcome.trim() !== '')
                    })}
                    required
                    rows="3"
                    placeholder="Enter each learning outcome on a new line"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>
                    Enter each learning outcome on a separate line
                  </small>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                      Level
                    </label>
                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      required
                      min="1"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                      Price
                    </label>
                    <input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#6b46c1',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseForm(false);
                    setEditingCourse(null);
                    setCourseForm({
                      title: '',
                      description: '',
                      category: '',
                      level: 'beginner',
                      duration: '',
                      price: 0,
                      modules: []
                    });
                  }}
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
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Form Modal */}
      {showAddModuleForm && selectedCourseForModule && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <AddModuleForm
              courseId={selectedCourseForModule._id}
              onModuleAdded={handleModuleAdded}
              onCancel={() => {
                setShowAddModuleForm(false);
                setSelectedCourseForModule(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement; 