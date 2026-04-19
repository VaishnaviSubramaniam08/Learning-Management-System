import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';

const InstructorFileUpload = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    courseId: '',
    deadline: '',
    accessLevel: 'course'
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedExtensions = ['.pdf', '.docx', '.ppt', '.pptx', '.mp4', '.zip', '.png', '.jpg', '.jpeg'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }
    
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File type not supported. Please use PDF, DOCX, PPT, MP4, ZIP, PNG, or JPG' };
    }
    
    return { valid: true };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (!uploadForm.title.trim()) {
      alert('Please provide a title for the material');
      return;
    }

    if (!uploadForm.courseId) {
      alert('Please select a course');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('tags', uploadForm.tags);
    formData.append('courseId', uploadForm.courseId);
    formData.append('deadline', uploadForm.deadline);
    formData.append('accessLevel', uploadForm.accessLevel);
    formData.append('uploadType', 'course_material');

    try {
      await axios.post('/file-upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      alert('Course material uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setUploadForm({
        title: '',
        description: '',
        tags: '',
        courseId: '',
        deadline: '',
        accessLevel: 'course'
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '28px' }}>
          🎓 Upload Course Material
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
          Upload lectures, assignments, tests, and resources for your students
        </p>
      </div>

      <form onSubmit={handleUpload}>
        {/* File Upload Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            📁 File Upload
          </h3>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed',
              borderColor: dragActive ? '#6b46c1' : '#d1d5db',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              background: dragActive ? '#f3f4f6' : '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '16px'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>
              {dragActive ? 'Drop file here' : 'Choose the file to upload'}
            </h4>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & drop or click to browse'}
            </p>
            <button
              type="button"
              style={{
                padding: '8px 16px',
                background: '#6b46c1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            <strong>Max Size:</strong> 50MB<br/>
            <strong>Accepted:</strong> PDF, DOCX, PPT, MP4, ZIP, PNG, JPG
          </div>

          {selectedFile && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: '#f0f9ff', 
              borderRadius: '6px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#374151' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title/Description Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            📌 Title / Description
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
              Title *
            </label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="e.g., Week 3 - Data Structures Notes"
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
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Give a brief description of the material..."
              rows="3"
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
        </div>

        {/* Tags Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            🏷️ Tags
          </h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
              Add comma-separated tags for easy search
            </label>
            <input
              type="text"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
              placeholder="e.g., lecture, assignment, week3, datastructures"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Example: lecture, assignment, week3, datastructures
            </div>
          </div>
        </div>

        {/* Course/Module Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            📚 Course / Module
          </h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
              Select the course this material belongs to *
            </label>
            <select
              value={uploadForm.courseId}
              onChange={(e) => setUploadForm({ ...uploadForm, courseId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">Select a course...</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title} - {course.level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deadline Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            📅 Deadline (if applicable)
          </h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
              Optional. Set a deadline for assignments or tasks
            </label>
            <input
              type="datetime-local"
              value={uploadForm.deadline}
              onChange={(e) => setUploadForm({ ...uploadForm, deadline: e.target.value })}
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

        {/* Access Level Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            🔐 Access Level
          </h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
              Set visibility of the file
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="accessLevel"
                  value="course"
                  checked={uploadForm.accessLevel === 'course'}
                  onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value })}
                />
                <span style={{ fontSize: '16px' }}>👥 Students of this course only</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="accessLevel"
                  value="public"
                  checked={uploadForm.accessLevel === 'public'}
                  onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value })}
                />
                <span style={{ fontSize: '16px' }}>🌐 Public (All users)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="accessLevel"
                  value="private"
                  checked={uploadForm.accessLevel === 'private'}
                  onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value })}
                />
                <span style={{ fontSize: '16px' }}>🔒 Private (Only instructor)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            style={{
              padding: '16px 32px',
              background: uploading || !selectedFile ? '#d1d5db' : '#6b46c1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              minWidth: '200px'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstructorFileUpload; 