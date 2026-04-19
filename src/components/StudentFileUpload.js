import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import { validateFiles, formatFileSize, getFileIcon, createValidationErrorMessage, getMaxFileSize } from '../utils/fileValidation';

const StudentFileUpload = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    courseId: '',
    assignmentId: '',
    deadline: '',
    accessLevel: 'private'
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEnrollments();
    fetchRecentFiles();
  }, [user]);

  useEffect(() => {
    if (uploadForm.courseId) {
      fetchAssignments(uploadForm.courseId);
    }
  }, [uploadForm.courseId]);

  const fetchEnrollments = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`/courses/student/${user.id}/enrollments`);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      const response = await axios.get(`/assignments/course/${courseId}`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    }
  };

  const fetchRecentFiles = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get('/file-upload/my-files', {
        params: {
          page: 1,
          limit: 5 // Get only recent 5 files
        }
      });
      setRecentFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching recent files:', error);
      setRecentFiles([]);
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
    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedExtensions = ['.pdf', '.docx', '.ppt', '.pptx', '.zip', '.png', '.jpg', '.jpeg'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 25MB limit' };
    }
    
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File type not supported. Please use PDF, DOCX, PPT, ZIP, PNG, or JPG' };
    }
    
    return { valid: true };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to submit');
      return;
    }

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (!uploadForm.title.trim()) {
      alert('Please provide a title for your submission');
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
    formData.append('assignmentId', uploadForm.assignmentId);
    formData.append('deadline', uploadForm.deadline);
    formData.append('accessLevel', uploadForm.accessLevel);
    formData.append('uploadType', 'assignment_submission');

    try {
      await axios.post('/file-upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      alert('Assignment submitted successfully!');

      // Refresh recent files list
      fetchRecentFiles();

      // Reset form
      setSelectedFile(null);
      setUploadForm({
        title: '',
        description: '',
        tags: '',
        courseId: '',
        assignmentId: '',
        deadline: '',
        accessLevel: 'private'
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Submission failed. Please try again.');
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
          📤 Submit Assignment / Project
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
          Submit your assignments, project work, or reports
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
              {dragActive ? 'Drop file here' : 'Select the file to submit'}
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
            <strong>Max Size:</strong> 25MB<br/>
            <strong>Accepted:</strong> PDF, DOCX, PPT, ZIP, PNG, JPG
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
              placeholder="e.g., Assignment 2 - Sorting Algorithms"
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
              placeholder="Describe what you are submitting..."
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
              Add relevant tags (optional)
            </label>
            <input
              type="text"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
              placeholder="e.g., assignment, sorting, week2"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Example: assignment, sorting, week2
            </div>
          </div>
        </div>

        {/* Linked Course/Assignment Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            📚 Linked Course / Assignment
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
              Choose the course you're submitting for *
            </label>
            <select
              value={uploadForm.courseId}
              onChange={(e) => setUploadForm({ ...uploadForm, courseId: e.target.value, assignmentId: '' })}
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
              {enrollments.map(enrollment => (
                <option key={enrollment._id} value={enrollment.course?._id || enrollment._id}>
                  {enrollment.course?.title || 'Course Title'} - {enrollment.course?.level || 'Level'}
                </option>
              ))}
            </select>
          </div>

          {uploadForm.courseId && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
                Choose the assignment (optional)
              </label>
              <select
                value={uploadForm.assignmentId}
                onChange={(e) => setUploadForm({ ...uploadForm, assignmentId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="">Select an assignment (optional)...</option>
                {assignments.map(assignment => (
                  <option key={assignment._id} value={assignment._id}>
                    {assignment.title} - Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Deadline Reminder Section */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            📅 Deadline Reminder (Optional)
          </h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 'bold' }}>
              Enter submission deadline (for personal reminder only)
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
              Set visibility of your submission
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="accessLevel"
                  value="private"
                  checked={uploadForm.accessLevel === 'private'}
                  onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value })}
                />
                <span style={{ fontSize: '16px' }}>🔒 Private (Visible only to instructor)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
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
            {uploading ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      </form>

      {/* Recent Files Section */}
      {recentFiles.length > 0 && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginTop: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, color: '#374151' }}>📄 Recently Uploaded Files</h3>
            <span style={{
              background: '#f3f4f6',
              color: '#374151',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {recentFiles.length} files
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentFiles.map((file, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '20px' }}>
                    {getFileIcon(file.originalName, file.mimeType)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontWeight: 'bold',
                      color: '#374151',
                      fontSize: '16px'
                    }}>
                      {file.originalName}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <span>📅 {new Date(file.uploadedAt).toLocaleDateString()}</span>
                      <span>📏 {formatFileSize(file.fileSize)}</span>
                      <span>📂 {file.course?.title || 'No Course'}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: file.uploadType === 'assignment_submission' ? '#3b82f6' : '#6b7280',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {file.uploadType === 'assignment_submission' ? 'Assignment' :
                   file.uploadType === 'document' ? 'Document' : 'General'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px'
            }}>
              💡 Want to see all your files? Check the <strong>"My Files"</strong> tab for complete file management.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFileUpload; 