import axios from '../api';

class ExamPrepService {
  // Get all exam categories
  async getExamCategories() {
    try {
      const response = await axios.get('/api/exam-prep');
      return response.data;
    } catch (error) {
      console.error('Error fetching exam categories:', error);
      throw error;
    }
  }

  // Get exam preparation by category
  async getExamPrepByCategory(category) {
    try {
      const response = await axios.get(`/api/exam-prep/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${category} exam prep:`, error);
      throw error;
    }
  }

  // Get all mock tests
  async getMockTests() {
    try {
      const response = await axios.get('/api/exam-prep/mock-tests');
      return response.data;
    } catch (error) {
      console.error('Error fetching mock tests:', error);
      throw error;
    }
  }

  // Get mock tests by category
  async getMockTestsByCategory(categoryId) {
    try {
      const response = await axios.get(`/api/exam-prep/mock-tests/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mock tests by category:', error);
      throw error;
    }
  }

  // Get mock test by ID
  async getMockTestById(testId) {
    try {
      const response = await axios.get(`/api/exam-prep/mock-tests/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mock test:', error);
      throw error;
    }
  }

  // Get current affairs
  async getCurrentAffairs() {
    try {
      const response = await axios.get('/api/exam-prep/current-affairs');
      return response.data;
    } catch (error) {
      console.error('Error fetching current affairs:', error);
      throw error;
    }
  }

  // Get current affairs by exam category
  async getCurrentAffairsByCategory(categoryId) {
    try {
      const response = await axios.get(`/api/exam-prep/current-affairs/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current affairs by category:', error);
      throw error;
    }
  }

  // Get study materials
  async getStudyMaterials() {
    try {
      const response = await axios.get('/api/exam-prep/study-materials');
      return response.data;
    } catch (error) {
      console.error('Error fetching study materials:', error);
      throw error;
    }
  }

  // Get study materials by exam category
  async getStudyMaterialsByCategory(categoryId) {
    try {
      const response = await axios.get(`/api/exam-prep/study-materials/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching study materials by category:', error);
      throw error;
    }
  }

  // Get study materials by subject
  async getStudyMaterialsBySubject(subject) {
    try {
      const response = await axios.get(`/api/exam-prep/study-materials/subject/${subject}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching study materials by subject:', error);
      throw error;
    }
  }

  // Start a mock test attempt
  async startMockTestAttempt(testId) {
    try {
      const response = await axios.post('/api/exam-prep/attempts/start', { mockTestId: testId });
      return response.data;
    } catch (error) {
      console.error('Error starting mock test attempt:', error);
      throw error;
    }
  }

  // Submit answers for a mock test attempt
  async submitAnswer(attemptId, questionId, selectedAnswer, timeTaken) {
    try {
      const response = await axios.post(`/api/exam-prep/attempts/${attemptId}/submit`, {
        questionId,
        selectedAnswer,
        timeTaken
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  // Complete a mock test attempt
  async completeMockTestAttempt(attemptId) {
    try {
      const response = await axios.post(`/api/exam-prep/attempts/${attemptId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing mock test attempt:', error);
      throw error;
    }
  }

  // Get student's exam attempts
  async getStudentAttempts() {
    try {
      const response = await axios.get('/api/exam-prep/attempts/student');
      return response.data;
    } catch (error) {
      console.error('Error fetching student exam attempts:', error);
      throw error;
    }
  }

  // Get detailed attempt result
  async getAttemptResult(attemptId) {
    try {
      const response = await axios.get(`/api/exam-prep/attempt/${attemptId}/result`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attempt result:', error);
      throw error;
    }
  }
}

const examPrepService = new ExamPrepService();
export default examPrepService;