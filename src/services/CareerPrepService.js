import axios from '../api';

class CareerPrepService {
  // Get dashboard data (counts of various career prep resources)
  async getDashboardData() {
    try {
      const response = await axios.get('/api/career-prep/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching career prep dashboard data:', error);
      throw error;
    }
  }

  // ===== Aptitude Tests =====

  // Get all aptitude tests
  async getAptitudeTests() {
    try {
      const response = await axios.get('/api/career-prep/aptitude-tests');
      return response.data;
    } catch (error) {
      console.error('Error fetching aptitude tests:', error);
      throw error;
    }
  }

  // Get aptitude tests by category
  async getAptitudeTestsByCategory(category) {
    try {
      const response = await axios.get(`/api/career-prep/aptitude-tests/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${category} aptitude tests:`, error);
      throw error;
    }
  }

  // Get aptitude test by ID
  async getAptitudeTestById(testId) {
    try {
      const response = await axios.get(`/api/career-prep/aptitude-tests/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching aptitude test:', error);
      throw error;
    }
  }

  // ===== Resume Templates =====

  // Get all resume templates
  async getResumeTemplates() {
    try {
      const response = await axios.get('/api/career-prep/resume-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching resume templates:', error);
      throw error;
    }
  }

  // Get resume templates by category
  async getResumeTemplatesByCategory(category) {
    try {
      const response = await axios.get(`/api/career-prep/resume-templates/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${category} resume templates:`, error);
      throw error;
    }
  }

  // Get resume template by ID
  async getResumeTemplateById(templateId) {
    try {
      const response = await axios.get(`/api/career-prep/resume-templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resume template:', error);
      throw error;
    }
  }

  // ===== Interview Preparation =====

  // Get all interview preparations
  async getInterviewPreparations() {
    try {
      const response = await axios.get('/api/career-prep/interview-prep');
      return response.data;
    } catch (error) {
      console.error('Error fetching interview preparations:', error);
      throw error;
    }
  }

  // Get interview preparations by type
  async getInterviewPrepsByType(type) {
    try {
      const response = await axios.get(`/api/career-prep/interview-prep/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} interview preparations:`, error);
      throw error;
    }
  }

  // Get interview preparation by ID
  async getInterviewPrepById(prepId) {
    try {
      const response = await axios.get(`/api/career-prep/interview-prep/${prepId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview preparation:', error);
      throw error;
    }
  }

  // ===== Company Preparation =====

  // Get all company preparations
  async getCompanyPreparations() {
    try {
      const response = await axios.get('/api/career-prep/company-prep');
      return response.data;
    } catch (error) {
      console.error('Error fetching company preparations:', error);
      throw error;
    }
  }

  // Get company preparations by industry
  async getCompanyPrepsByIndustry(industry) {
    try {
      const response = await axios.get(`/api/career-prep/company-prep/industry/${industry}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${industry} company preparations:`, error);
      throw error;
    }
  }

  // Get company preparation by ID
  async getCompanyPrepById(companyId) {
    try {
      const response = await axios.get(`/api/career-prep/company-prep/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company preparation:', error);
      throw error;
    }
  }

  // Add a review to a company preparation
  async addCompanyReview(companyId, review) {
    try {
      const response = await axios.post(`/api/career-prep/company-prep/${companyId}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error('Error adding company review:', error);
      throw error;
    }
  }

  // ===== Job Listings =====

  // Get all job listings (with optional filters)
  async getJobListings(filters = {}) {
    try {
      const response = await axios.get('/api/career-prep/job-listings', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      throw error;
    }
  }

  // Get job listing by ID
  async getJobListingById(jobId) {
    try {
      const response = await axios.get(`/api/career-prep/job-listings/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job listing:', error);
      throw error;
    }
  }

  // ===== Aptitude Test Attempts =====

  // Start an aptitude test attempt
  async startAptitudeTestAttempt(testId) {
    try {
      const response = await axios.post('/api/career-prep/aptitude-attempts/start', { testId });
      return response.data;
    } catch (error) {
      console.error('Error starting aptitude test attempt:', error);
      throw error;
    }
  }

  // Submit answers for an aptitude test attempt
  async submitAptitudeAnswer(attemptId, questionId, selectedAnswer, timeTaken) {
    try {
      const response = await axios.post(`/api/career-prep/aptitude-attempts/${attemptId}/submit`, {
        questionId,
        selectedAnswer,
        timeTaken
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting aptitude answer:', error);
      throw error;
    }
  }

  // Complete an aptitude test attempt
  async completeAptitudeTestAttempt(attemptId) {
    try {
      const response = await axios.post(`/api/career-prep/aptitude-attempts/${attemptId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing aptitude test attempt:', error);
      throw error;
    }
  }

  // Get student's aptitude test attempts
  async getStudentAptitudeAttempts() {
    try {
      const response = await axios.get('/api/career-prep/aptitude-attempts/student');
      return response.data;
    } catch (error) {
      console.error('Error fetching student aptitude attempts:', error);
      throw error;
    }
  }

  // Get detailed aptitude attempt result
  async getAptitudeAttemptResult(attemptId) {
    try {
      const response = await axios.get(`/api/career-prep/aptitude-attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching aptitude attempt result:', error);
      throw error;
    }
  }
}

const careerPrepService = new CareerPrepService();
export default careerPrepService;