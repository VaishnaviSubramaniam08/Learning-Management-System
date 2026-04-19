import React, { useState, useEffect } from 'react';
import axios from '../api';

const AddModuleForm = ({ courseId, onModuleAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    duration: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [courseInfo, setCourseInfo] = useState(null);

  // Fetch course information for validation
  useEffect(() => {
    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);

  const fetchCourseInfo = async () => {
    try {
      const response = await axios.get(`/courses/${courseId}`);
      setCourseInfo(response.data);
    } catch (error) {
      console.error('Error fetching course info:', error);
      setErrors({ course: 'Failed to load course information' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Module title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Module title must be at least 3 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Module description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Module description must be at least 10 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Module content is required';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Module content must be at least 20 characters long';
    }

    // Duration validation
    if (formData.duration && (isNaN(formData.duration) || formData.duration < 0)) {
      newErrors.duration = 'Duration must be a positive number';
    }

    // Video URL validation
    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid video URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const moduleData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        videoUrl: formData.videoUrl.trim() || '',
        duration: formData.duration ? parseInt(formData.duration) : 0,
        courseId: courseId
      };

      const response = await axios.post('/modules/add', moduleData);

      if (response.data.success) {
        setSubmitStatus('success');
        setFormData({
          title: '',
          description: '',
          content: '',
          videoUrl: '',
          duration: ''
        });
        
        // Call the callback to refresh the parent component
        if (onModuleAdded) {
          onModuleAdded(response.data.module);
        }

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating module:', error);
      
      if (error.response) {
        const { data } = error.response;
        
        if (data.errors && Array.isArray(data.errors)) {
          // Handle validation errors from server
          const serverErrors = {};
          data.errors.forEach(error => {
            if (error.includes('title')) serverErrors.title = error;
            else if (error.includes('description')) serverErrors.description = error;
            else if (error.includes('content')) serverErrors.content = error;
            else if (error.includes('duration')) serverErrors.duration = error;
            else if (error.includes('videoUrl')) serverErrors.videoUrl = error;
            else if (error.includes('courseId')) serverErrors.courseId = error;
          });
          setErrors(serverErrors);
        } else {
          setErrors({ general: data.message || 'Failed to create module' });
        }
      } else {
        setErrors({ general: 'Network error. Please check your connection.' });
      }
      
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (!courseInfo) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#6b7280' 
      }}>
        Loading course information...
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: '#374151', 
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Add New Module
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Course: <strong>{courseInfo.title}</strong>
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #a7f3d0'
        }}>
          ✅ Module created successfully!
        </div>
      )}

      {submitStatus === 'error' && errors.general && (
        <div style={{
          background: '#fef2f2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          ❌ {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Module Title */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Module Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter module title"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.title ? '2px solid #dc2626' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s'
              }}
            />
            {errors.title && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                margin: '4px 0 0 0' 
              }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Module Description */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Module Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of what this module covers"
              rows="3"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.description ? '2px solid #dc2626' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
            />
            {errors.description && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                margin: '4px 0 0 0' 
              }}>
                {errors.description}
              </p>
            )}
          </div>

          {/* Module Content */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Module Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Detailed content, instructions, or learning materials for this module"
              rows="6"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.content ? '2px solid #dc2626' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
            />
            {errors.content && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                margin: '4px 0 0 0' 
              }}>
                {errors.content}
              </p>
            )}
          </div>

          {/* Video URL and Duration Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Video URL */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                Video URL (Optional)
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/video.mp4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.videoUrl ? '2px solid #dc2626' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.videoUrl && (
                <p style={{ 
                  color: '#dc2626', 
                  fontSize: '14px', 
                  margin: '4px 0 0 0' 
                }}>
                  {errors.videoUrl}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="30"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.duration ? '2px solid #dc2626' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.duration && (
                <p style={{ 
                  color: '#dc2626', 
                  fontSize: '14px', 
                  margin: '4px 0 0 0' 
                }}>
                  {errors.duration}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginTop: '32px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: isSubmitting ? '#9ca3af' : '#6b46c1',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
          >
            {isSubmitting ? 'Creating Module...' : 'Create Module'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddModuleForm; 