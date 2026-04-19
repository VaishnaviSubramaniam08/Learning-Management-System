// File validation utilities for client-side validation

/**
 * Get maximum file size based on upload type and user role
 * @param {string} uploadType - Type of upload (assignment_submission, document, etc.)
 * @param {string} userRole - User role (student, instructor, admin)
 * @returns {number} Maximum file size in bytes
 */
export const getMaxFileSize = (uploadType = 'general', userRole = 'student') => {
  const sizeLimits = {
    student: {
      assignment_submission: 50 * 1024 * 1024, // 50MB
      document: 25 * 1024 * 1024, // 25MB
      general: 10 * 1024 * 1024 // 10MB
    },
    instructor: {
      course_material: 100 * 1024 * 1024, // 100MB
      assignment: 50 * 1024 * 1024, // 50MB
      document: 50 * 1024 * 1024, // 50MB
      general: 25 * 1024 * 1024 // 25MB
    },
    admin: {
      general: 200 * 1024 * 1024 // 200MB
    }
  };
  
  const userLimits = sizeLimits[userRole] || sizeLimits.student;
  return userLimits[uploadType] || userLimits.general || 10 * 1024 * 1024; // Default 10MB
};

/**
 * Check if file type is allowed
 * @param {File} file - File object
 * @returns {boolean} Whether file type is allowed
 */
export const isAllowedFileType = (file) => {
  const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    
    // Archives
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    
    // Video
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo'
  ];
  
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    '.zip', '.rar', '.7z',
    '.mp3', '.wav', '.ogg', '.m4a',
    '.mp4', '.avi', '.mov'
  ];
  
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  
  return allowedMimeTypes.includes(file.type) && allowedExtensions.includes(extension);
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {string} uploadType - Type of upload
 * @param {string} userRole - User role
 * @returns {object} Validation result
 */
export const validateFileSize = (file, uploadType = 'general', userRole = 'student') => {
  const maxSize = getMaxFileSize(uploadType, userRole);
  const isValid = file.size <= maxSize;
  
  return {
    isValid,
    maxSize,
    currentSize: file.size,
    maxSizeMB: (maxSize / (1024 * 1024)).toFixed(1),
    currentSizeMB: (file.size / (1024 * 1024)).toFixed(2),
    message: isValid 
      ? 'File size is valid' 
      : `File too large. Maximum size allowed: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`
  };
};

/**
 * Validate multiple files
 * @param {FileList|Array} files - Files to validate
 * @param {string} uploadType - Type of upload
 * @param {string} userRole - User role
 * @param {number} maxFiles - Maximum number of files allowed
 * @returns {object} Validation result
 */
export const validateFiles = (files, uploadType = 'general', userRole = 'student', maxFiles = 10) => {
  const fileArray = Array.from(files);
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
    validFiles: [],
    invalidFiles: [],
    totalSize: 0,
    totalSizeMB: 0
  };
  
  // Check file count
  if (fileArray.length > maxFiles) {
    results.isValid = false;
    results.errors.push(`Too many files. Maximum ${maxFiles} files allowed.`);
    return results;
  }
  
  // Validate each file
  fileArray.forEach((file, index) => {
    const fileResult = {
      file,
      index,
      name: file.name,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      isValid: true,
      errors: []
    };
    
    // Check file type
    if (!isAllowedFileType(file)) {
      fileResult.isValid = false;
      fileResult.errors.push('File type not allowed');
      results.isValid = false;
    }
    
    // Check file size
    const sizeValidation = validateFileSize(file, uploadType, userRole);
    if (!sizeValidation.isValid) {
      fileResult.isValid = false;
      fileResult.errors.push(sizeValidation.message);
      results.isValid = false;
    }
    
    // Check if file is empty
    if (file.size === 0) {
      fileResult.isValid = false;
      fileResult.errors.push('File is empty');
      results.isValid = false;
    }
    
    // Add to appropriate array
    if (fileResult.isValid) {
      results.validFiles.push(fileResult);
    } else {
      results.invalidFiles.push(fileResult);
    }
    
    results.totalSize += file.size;
  });
  
  results.totalSizeMB = (results.totalSize / (1024 * 1024)).toFixed(2);
  
  // Check total size limit (optional)
  const totalMaxSize = getMaxFileSize(uploadType, userRole) * fileArray.length;
  if (results.totalSize > totalMaxSize) {
    results.isValid = false;
    results.errors.push(`Total file size too large. Maximum total size: ${(totalMaxSize / (1024 * 1024)).toFixed(1)}MB`);
  }
  
  return results;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon based on file type
 * @param {string} fileName - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Icon emoji or class
 */
export const getFileIcon = (fileName, mimeType = '') => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  // Document types
  if (['pdf'].includes(extension)) return '📄';
  if (['doc', 'docx'].includes(extension)) return '📝';
  if (['xls', 'xlsx'].includes(extension)) return '📊';
  if (['ppt', 'pptx'].includes(extension)) return '📋';
  if (['txt', 'csv'].includes(extension)) return '📃';
  
  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return '🖼️';
  
  // Archive types
  if (['zip', 'rar', '7z'].includes(extension)) return '🗜️';
  
  // Audio types
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return '🎵';
  
  // Video types
  if (['mp4', 'avi', 'mov'].includes(extension)) return '🎬';
  
  // Default
  return '📎';
};

/**
 * Create a file validation error message
 * @param {object} validationResult - Result from validateFiles
 * @returns {string} Error message
 */
export const createValidationErrorMessage = (validationResult) => {
  if (validationResult.isValid) return '';
  
  let message = 'File validation failed:\n';
  
  // Add general errors
  validationResult.errors.forEach(error => {
    message += `• ${error}\n`;
  });
  
  // Add file-specific errors
  validationResult.invalidFiles.forEach(fileResult => {
    message += `• ${fileResult.name}: ${fileResult.errors.join(', ')}\n`;
  });
  
  return message.trim();
};

// Export default object with all functions
export default {
  getMaxFileSize,
  isAllowedFileType,
  validateFileSize,
  validateFiles,
  formatFileSize,
  getFileIcon,
  createValidationErrorMessage
};
