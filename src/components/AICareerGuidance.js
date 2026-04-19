import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import socketService from '../services/socketService';

const AICareerGuidance = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [personalityAssessment, setPersonalityAssessment] = useState(null);
  const [skillAssessment, setSkillAssessment] = useState(null);
  const [careerRecommendations, setCareerRecommendations] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [mentorChat, setMentorChat] = useState({
    messages: [],
    sessionId: `session_${Date.now()}`,
    isTyping: false
  });
  const [loading, setLoading] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [assessmentProgress, setAssessmentProgress] = useState(0);
  const [userInput, setUserInput] = useState('');

  // Aptitude Test State
  const [aptitudeTest, setAptitudeTest] = useState({
    isStarted: false,
    currentQuestion: 0,
    answers: [],
    score: 0,
    isCompleted: false,
    userAnswer: '',
    showResult: false,
    timeLeft: 60
  });
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadUserData();
      socketService.connect(user);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [mentorChat.messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Try to load existing career recommendations
      try {
        const response = await axios.get('/ai-career-guidance/career-recommendations');
        setCareerRecommendations(response.data);
      } catch (error) {
        console.log('No existing career recommendations found');
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPersonalityAssessment = async (type = 'big_five') => {
    try {
      setLoading(true);
      console.log('🎯 Frontend - Starting personality assessment:', type);

      // First try the test endpoint to verify connection
      try {
        const testResponse = await axios.get('/ai-career-guidance/test');
        console.log('🎯 Frontend - Test endpoint response:', testResponse.data);
      } catch (testError) {
        console.error('🎯 Frontend - Test endpoint failed:', testError);
      }

      // Test authentication
      try {
        const authTestResponse = await axios.get('/ai-career-guidance/test-auth');
        console.log('🎯 Frontend - Auth test response:', authTestResponse.data);
      } catch (authError) {
        console.error('🎯 Frontend - Auth test failed:', authError.response?.data);
        console.log('🎯 Frontend - Current user from localStorage:', localStorage.getItem('user'));
        console.log('🎯 Frontend - Current token from localStorage:', localStorage.getItem('token'));
      }

      // Try the test personality assessment endpoint (this is working!)
      const response = await axios.get(`/ai-career-guidance/personality-assessment-test/${type}`);
      console.log('🎯 Frontend - Assessment response:', response.data);

      setCurrentAssessment({
        type: 'personality',
        data: response.data,
        responses: [],
        currentQuestion: 0
      });
      setActiveTab('assessment');
    } catch (error) {
      console.error('🎯 Frontend - Error starting personality assessment:', error);
      console.error('🎯 Frontend - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      alert(`Failed to start assessment: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startSkillAssessment = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/ai-career-guidance/skill-assessment/template');
      setCurrentAssessment({
        type: 'skill',
        data: response.data,
        technicalSkills: [],
        softSkills: []
      });
      setActiveTab('assessment');
    } catch (error) {
      console.error('Error starting skill assessment:', error);
      alert('Failed to start skill assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentResponse = (questionId, response) => {
    if (currentAssessment.type === 'personality') {
      const updatedResponses = [...currentAssessment.responses];
      const existingIndex = updatedResponses.findIndex(r => r.questionId === questionId);
      
      if (existingIndex >= 0) {
        updatedResponses[existingIndex] = { questionId, response };
      } else {
        updatedResponses.push({ questionId, response });
      }
      
      setCurrentAssessment(prev => ({
        ...prev,
        responses: updatedResponses
      }));
      
      setAssessmentProgress((updatedResponses.length / currentAssessment.data.questions.length) * 100);
    }
  };

  const handleSkillRating = (skill, rating, category) => {
    const skillData = {
      skill,
      score: rating * 10, // Convert 1-10 to 10-100
      level: rating <= 3 ? 'beginner' : rating <= 6 ? 'intermediate' : rating <= 8 ? 'advanced' : 'expert'
    };

    setCurrentAssessment(prev => ({
      ...prev,
      [category]: prev[category].some(s => s.skill === skill)
        ? prev[category].map(s => s.skill === skill ? skillData : s)
        : [...prev[category], skillData]
    }));
  };

  const submitPersonalityAssessment = async () => {
    try {
      setLoading(true);
      
      const assessmentData = {
        assessmentType: currentAssessment.data.assessmentType,
        responses: currentAssessment.responses.map(r => ({
          ...r,
          category: currentAssessment.data.questions.find(q => q.id === r.questionId)?.category
        })),
        timeTaken: 300 // Mock time taken
      };
      
      const response = await axios.post('/ai-career-guidance/personality-assessment', assessmentData);
      
      setPersonalityAssessment(response.data.assessment);
      setCareerRecommendations(response.data.careerRecommendations);
      setCurrentAssessment(null);
      setActiveTab('results');
      
      alert('Personality assessment completed! Check your results.');
      
    } catch (error) {
      console.error('Error submitting personality assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitSkillAssessment = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/ai-career-guidance/skill-assessment', {
        technicalSkills: currentAssessment.technicalSkills,
        softSkills: currentAssessment.softSkills
      });
      
      setSkillAssessment(response.data.skillAssessment);
      setCurrentAssessment(null);
      setActiveTab('results');
      
      alert('Skill assessment completed! Check your results.');
      
    } catch (error) {
      console.error('Error submitting skill assessment:', error);
      alert('Failed to submit skill assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const findJobMatches = async () => {
    try {
      setLoading(true);
      
      const matchingData = {
        preferences: {
          industries: ['Technology', 'Healthcare', 'Education'],
          workEnvironment: 'remote'
        },
        location: 'Remote',
        salaryRange: { min: 50000, max: 100000 },
        jobType: 'full_time'
      };
      
      const response = await axios.post('/ai-career-guidance/job-matching', matchingData);
      setJobMatches(response.data.matches);
      setActiveTab('jobs');
      
    } catch (error) {
      console.error('Error finding job matches:', error);
      alert('Failed to find job matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMentorMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: userInput,
      timestamp: new Date()
    };
    
    setMentorChat(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));
    
    setUserInput('');
    
    try {
      const response = await axios.post('/ai-career-guidance/mentor-chat', {
        message: userInput,
        sessionId: mentorChat.sessionId,
        context: {
          topic: 'career_guidance',
          sessionType: 'general_guidance'
        }
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai_mentor',
        message: response.data.response,
        timestamp: new Date(),
        suggestions: response.data.suggestions || [],
        actionItems: response.data.actionItems || []
      };
      
      setMentorChat(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isTyping: false
      }));
      
    } catch (error) {
      console.error('Error sending mentor message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai_mentor',
        message: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setMentorChat(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMentorMessage();
    }
  };

  // Aptitude Test Questions
  const aptitudeQuestions = [
    {
      id: 1,
      category: 'Percentage',
      question: 'If 25% of a number is 75, what is 40% of the same number?',
      options: ['120', '150', '100', '180'],
      correct: 0,
      explanation: 'If 25% = 75, then 100% = 300. So 40% of 300 = 120'
    },
    {
      id: 2,
      category: 'Average',
      question: 'The average of 5 numbers is 20. If one number is removed, the average becomes 15. What was the removed number?',
      options: ['35', '40', '45', '50'],
      correct: 0,
      explanation: 'Sum of 5 numbers = 5×20 = 100. Sum of 4 numbers = 4×15 = 60. Removed number = 100-60 = 40'
    },
    {
      id: 3,
      category: 'Profit & Loss',
      question: 'A shopkeeper sells an item for ₹450 and makes a profit of 25%. What was the cost price?',
      options: ['₹360', '₹375', '₹400', '₹350'],
      correct: 0,
      explanation: 'SP = CP + 25% of CP = 1.25 × CP. So CP = 450/1.25 = ₹360'
    },
    {
      id: 4,
      category: 'Direction',
      question: 'A person walks 3km North, then 4km East. What is the shortest distance from the starting point?',
      options: ['5km', '6km', '7km', '8km'],
      correct: 0,
      explanation: 'Using Pythagoras theorem: √(3² + 4²) = √(9 + 16) = √25 = 5km'
    },
    {
      id: 5,
      category: 'Time & Work',
      question: 'A can complete a work in 12 days, B in 15 days. Working together, in how many days can they complete the work?',
      options: ['6.67 days', '7.5 days', '8 days', '9 days'],
      correct: 0,
      explanation: 'A\'s rate = 1/12, B\'s rate = 1/15. Combined rate = 1/12 + 1/15 = 9/60 = 3/20. Time = 20/3 = 6.67 days'
    },
    {
      id: 6,
      category: 'Ratio & Proportion',
      question: 'If A:B = 3:4 and B:C = 2:5, what is A:C?',
      options: ['3:10', '6:20', '3:5', '6:10'],
      correct: 0,
      explanation: 'A:B = 3:4, B:C = 2:5. To find A:C, make B equal: A:B:C = 6:8:20. So A:C = 6:20 = 3:10'
    },
    {
      id: 7,
      category: 'Simple Interest',
      question: 'What is the simple interest on ₹1000 for 2 years at 5% per annum?',
      options: ['₹100', '₹150', '₹200', '₹250'],
      correct: 0,
      explanation: 'SI = (P × R × T)/100 = (1000 × 5 × 2)/100 = ₹100'
    },
    {
      id: 8,
      category: 'Speed & Distance',
      question: 'A train travels 240km in 4 hours. What is its speed in m/s?',
      options: ['16.67 m/s', '20 m/s', '25 m/s', '30 m/s'],
      correct: 0,
      explanation: 'Speed = 240km/4h = 60 km/h = 60 × 1000/3600 = 16.67 m/s'
    },
    {
      id: 9,
      category: 'Age Problems',
      question: 'Father is 3 times as old as his son. After 15 years, he will be twice as old. What is the son\'s current age?',
      options: ['15 years', '20 years', '25 years', '30 years'],
      correct: 0,
      explanation: 'Let son\'s age = x. Father = 3x. After 15 years: 3x+15 = 2(x+15). Solving: x = 15'
    },
    {
      id: 10,
      category: 'Number Series',
      question: 'Find the next number in series: 2, 6, 12, 20, 30, ?',
      options: ['42', '40', '38', '44'],
      correct: 0,
      explanation: 'Differences: 4, 6, 8, 10, 12. Next difference is 12, so 30 + 12 = 42'
    },
    {
      id: 11,
      category: 'Geometry',
      question: 'What is the area of a circle with radius 7cm? (π = 22/7)',
      options: ['154 cm²', '144 cm²', '164 cm²', '174 cm²'],
      correct: 0,
      explanation: 'Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²'
    },
    {
      id: 12,
      category: 'Algebra',
      question: 'If 2x + 3y = 12 and x - y = 1, what is the value of x?',
      options: ['3', '4', '5', '6'],
      correct: 0,
      explanation: 'From x - y = 1, x = y + 1. Substituting: 2(y+1) + 3y = 12. 5y = 10, y = 2, x = 3'
    },
    {
      id: 13,
      category: 'Probability',
      question: 'What is the probability of getting a sum of 7 when rolling two dice?',
      options: ['1/6', '1/4', '1/3', '1/2'],
      correct: 0,
      explanation: 'Favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Total = 36. P = 6/36 = 1/6'
    },
    {
      id: 14,
      category: 'Logical Reasoning',
      question: 'If all roses are flowers and some flowers are red, which conclusion is correct?',
      options: ['Some roses are red', 'All roses are red', 'No roses are red', 'Cannot be determined'],
      correct: 3,
      explanation: 'We cannot determine if roses are red from the given information'
    },
    {
      id: 15,
      category: 'Data Interpretation',
      question: 'In a class of 40 students, 60% passed in Math and 70% in Science. If 50% passed in both, how many failed in both?',
      options: ['8', '10', '12', '6'],
      correct: 0,
      explanation: 'Passed in at least one = 60% + 70% - 50% = 80%. Failed in both = 20% of 40 = 8'
    },
    {
      id: 16,
      category: 'Coding-Decoding',
      question: 'If COMPUTER is coded as RFUVQNPC, how is SCIENCE coded?',
      options: ['PDJFODF', 'FDJFODF', 'EDJFODF', 'GDJFODF'],
      correct: 2,
      explanation: 'Each letter is shifted by +3 positions. S→V, C→F, I→L, E→H, N→Q, C→F, E→H = VFLHQFH'
    },
    {
      id: 17,
      category: 'Blood Relations',
      question: 'A is B\'s sister. C is B\'s mother. D is C\'s father. E is D\'s mother. How is A related to D?',
      options: ['Granddaughter', 'Daughter', 'Niece', 'Sister'],
      correct: 0,
      explanation: 'A is B\'s sister, C is B\'s mother, so A is C\'s daughter. D is C\'s father, so A is D\'s granddaughter'
    },
    {
      id: 18,
      category: 'Calendar',
      question: 'If January 1, 2020 was a Wednesday, what day was January 1, 2021?',
      options: ['Friday', 'Thursday', 'Saturday', 'Sunday'],
      correct: 0,
      explanation: '2020 was a leap year (366 days). 366 ÷ 7 = 52 remainder 2. So 2 days ahead: Friday'
    },
    {
      id: 19,
      category: 'Clock',
      question: 'At what time between 3 and 4 o\'clock are the hands of a clock together?',
      options: ['3:16:22', '3:15:30', '3:18:18', '3:20:00'],
      correct: 0,
      explanation: 'Hands meet at (60h/11) minutes past h. For h=3: 180/11 = 16.36 minutes = 16:22'
    },
    {
      id: 20,
      category: 'Mixture & Alligation',
      question: 'In what ratio should tea at ₹60/kg be mixed with tea at ₹65/kg to get a mixture worth ₹63/kg?',
      options: ['2:3', '3:2', '1:2', '2:1'],
      correct: 0,
      explanation: 'Using alligation: (65-63):(63-60) = 2:3'
    }
  ];

  // Aptitude Test Functions
  const startAptitudeTest = () => {
    setAptitudeTest({
      isStarted: true,
      currentQuestion: 0,
      answers: [],
      score: 0,
      isCompleted: false,
      userAnswer: '',
      showResult: false,
      timeLeft: 60
    });
  };

  const submitAptitudeAnswer = () => {
    const currentQ = aptitudeQuestions[aptitudeTest.currentQuestion];
    const isCorrect = parseInt(aptitudeTest.userAnswer) === currentQ.correct;

    const newAnswers = [...aptitudeTest.answers, {
      questionId: currentQ.id,
      userAnswer: aptitudeTest.userAnswer,
      correctAnswer: currentQ.correct,
      isCorrect: isCorrect,
      category: currentQ.category
    }];

    setAptitudeTest(prev => ({
      ...prev,
      answers: newAnswers,
      score: isCorrect ? prev.score + 1 : prev.score,
      showResult: true
    }));
  };

  const nextAptitudeQuestion = () => {
    if (aptitudeTest.currentQuestion < aptitudeQuestions.length - 1) {
      setAptitudeTest(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        userAnswer: '',
        showResult: false
      }));
    } else {
      setAptitudeTest(prev => ({
        ...prev,
        isCompleted: true
      }));
    }
  };

  const renderAptitudeTest = () => {
    if (!aptitudeTest.isStarted) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>🧮 Interactive Aptitude Test</h2>
          <p>Test your aptitude skills with 20 comprehensive questions covering various topics</p>
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            margin: '20px 0',
            textAlign: 'left'
          }}>
            <h3>📋 Test Topics:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '15px' }}>
              {['Percentage', 'Average', 'Profit & Loss', 'Direction', 'Time & Work', 'Ratio & Proportion', 'Simple Interest', 'Speed & Distance', 'Age Problems', 'Number Series', 'Geometry', 'Algebra', 'Probability', 'Logical Reasoning', 'Data Interpretation', 'Coding-Decoding', 'Blood Relations', 'Calendar', 'Clock', 'Mixture & Alligation'].map(topic => (
                <div key={topic} style={{
                  background: '#e3f2fd',
                  padding: '8px',
                  borderRadius: '5px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {topic}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '15px' }}>
                <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '8px' }}>
                  <strong>📊 Total Questions</strong><br/>20 Questions
                </div>
                <div style={{ background: '#d1ecf1', padding: '10px', borderRadius: '8px' }}>
                  <strong>⏰ Time Limit</strong><br/>No Time Limit
                </div>
                <div style={{ background: '#d4edda', padding: '10px', borderRadius: '8px' }}>
                  <strong>📈 Instant Results</strong><br/>With Explanations
                </div>
                <div style={{ background: '#f8d7da', padding: '10px', borderRadius: '8px' }}>
                  <strong>📊 Visual Charts</strong><br/>Performance Analysis
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={startAptitudeTest}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,123,255,0.3)'
            }}
          >
            🚀 Start Interactive Aptitude Test
          </button>
        </div>
      );
    }

    if (aptitudeTest.isCompleted) {
      const categoryStats = aptitudeTest.answers.reduce((acc, answer) => {
        if (!acc[answer.category]) {
          acc[answer.category] = { correct: 0, total: 0 };
        }
        acc[answer.category].total++;
        if (answer.isCorrect) {
          acc[answer.category].correct++;
        }
        return acc;
      }, {});

      return (
        <div style={{ padding: '20px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🎉 Test Completed!</h2>

          {/* Main Score Display */}
          <div style={{
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '15px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>📊 Your Final Score</h3>

            {/* Large Pie Chart for Final Score */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
                  <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background circle */}
                    <circle
                      cx="75"
                      cy="75"
                      r="65"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="15"
                    />
                    {/* Score arc */}
                    <circle
                      cx="75"
                      cy="75"
                      r="65"
                      fill="none"
                      stroke={aptitudeTest.score >= 15 ? '#4caf50' : aptitudeTest.score >= 10 ? '#ff9800' : '#f44336'}
                      strokeWidth="15"
                      strokeDasharray={`${(aptitudeTest.score/20) * 408} 408`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {aptitudeTest.score}/20
                    </div>
                    <div style={{ fontSize: '16px', color: '#666' }}>
                      {Math.round((aptitudeTest.score/20)*100)}%
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                  {aptitudeTest.score >= 15 ? '🌟 Excellent!' :
                   aptitudeTest.score >= 10 ? '👍 Good Job!' :
                   '📚 Keep Practicing!'}
                </div>
              </div>

              {/* Bar Chart for Category Performance */}
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ marginBottom: '15px' }}>📈 Performance Breakdown</h4>
                <div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '120px' }}>
                  {/* Correct answers bar */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: `${Math.max(aptitudeTest.score * 5, 10)}px`,
                      background: '#28a745',
                      borderRadius: '5px 5px 0 0',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'end',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      paddingBottom: '5px'
                    }}>
                      {aptitudeTest.score}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Correct</div>
                  </div>

                  {/* Incorrect answers bar */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: `${Math.max((20 - aptitudeTest.score) * 5, 10)}px`,
                      background: '#dc3545',
                      borderRadius: '5px 5px 0 0',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'end',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      paddingBottom: '5px'
                    }}>
                      {20 - aptitudeTest.score}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Incorrect</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category-wise Performance with Mini Charts */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #ddd'
          }}>
            <h4 style={{ textAlign: 'center', marginBottom: '20px' }}>📊 Category-wise Performance</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{category}</h5>

                  {/* Mini pie chart for category */}
                  <div style={{ position: 'relative', width: '50px', height: '50px', margin: '0 auto 10px auto' }}>
                    <svg width="50" height="50" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="6"
                      />
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke={stats.correct === stats.total ? '#4caf50' : stats.correct > 0 ? '#ff9800' : '#f44336'}
                        strokeWidth="6"
                        strokeDasharray={`${(stats.correct/stats.total) * 125.6} 125.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {stats.correct}/{stats.total}
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {Math.round((stats.correct/stats.total)*100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setAptitudeTest({ isStarted: false, currentQuestion: 0, answers: [], score: 0, isCompleted: false, userAnswer: '', showResult: false, timeLeft: 60 })}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🔄 Take Test Again
            </button>
          </div>
        </div>
      );
    }

    const currentQ = aptitudeQuestions[aptitudeTest.currentQuestion];

    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2>🧮 Aptitude Test</h2>
          <div style={{
            background: '#e3f2fd',
            padding: '10px 15px',
            borderRadius: '8px'
          }}>
            Question {aptitudeTest.currentQuestion + 1} of {aptitudeQuestions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e0e0e0',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: `${((aptitudeTest.currentQuestion + 1) / aptitudeQuestions.length) * 100}%`,
            height: '100%',
            background: '#007bff',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        {/* Question */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#007bff',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            display: 'inline-block',
            fontSize: '12px',
            marginBottom: '15px'
          }}>
            {currentQ.category}
          </div>
          <h3 style={{ marginBottom: '20px' }}>{currentQ.question}</h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                onClick={() => setAptitudeTest(prev => ({ ...prev, userAnswer: index.toString() }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  background: aptitudeTest.userAnswer === index.toString() ? '#e3f2fd' : 'white',
                  border: '2px solid',
                  borderColor: aptitudeTest.userAnswer === index.toString() ? '#007bff' : '#ddd',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '16px',
                  fontWeight: aptitudeTest.userAnswer === index.toString() ? 'bold' : 'normal'
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: aptitudeTest.userAnswer === index.toString() ? '#007bff' : '#f0f0f0',
                  color: aptitudeTest.userAnswer === index.toString() ? 'white' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginRight: '15px',
                  fontSize: '14px'
                }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result Display with Charts */}
        {aptitudeTest.showResult && (() => {
          const lastAnswer = aptitudeTest.answers[aptitudeTest.answers.length - 1];
          const isCorrect = lastAnswer?.isCorrect;

          // Calculate current progress for charts
          const totalAnswered = aptitudeTest.answers.length;
          const correctAnswers = aptitudeTest.answers.filter(a => a.isCorrect).length;
          const incorrectAnswers = totalAnswered - correctAnswers;
          const correctPercentage = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

          return (
            <div style={{
              background: isCorrect ? '#d4edda' : '#f8d7da',
              border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}`,
              color: isCorrect ? '#155724' : '#721c24',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                  {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                </div>
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Correct Answer:</strong> {String.fromCharCode(65 + currentQ.correct)}. {currentQ.options[currentQ.correct]}
                </div>
              </div>

              {/* Visual Charts */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>

                {/* Pie Chart for Current Progress */}
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Overall Progress</h4>
                  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                      {/* Background circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="8"
                      />
                      {/* Correct answers arc */}
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#28a745"
                        strokeWidth="8"
                        strokeDasharray={`${(correctPercentage * 2.2)} 220`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {Math.round(correctPercentage)}%
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    {correctAnswers}/{totalAnswered} Correct
                  </div>
                </div>

                {/* Bar Chart for Correct vs Incorrect */}
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Score Breakdown</h4>
                  <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '60px' }}>
                    {/* Correct bar */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '25px',
                        height: `${Math.max(correctAnswers * 8, 5)}px`,
                        background: '#28a745',
                        borderRadius: '3px 3px 0 0',
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        paddingBottom: '2px'
                      }}>
                        {correctAnswers > 0 ? correctAnswers : ''}
                      </div>
                      <div style={{ fontSize: '10px' }}>✓</div>
                    </div>
                    {/* Incorrect bar */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '25px',
                        height: `${Math.max(incorrectAnswers * 8, 5)}px`,
                        background: '#dc3545',
                        borderRadius: '3px 3px 0 0',
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        paddingBottom: '2px'
                      }}>
                        {incorrectAnswers > 0 ? incorrectAnswers : ''}
                      </div>
                      <div style={{ fontSize: '10px' }}>✗</div>
                    </div>
                  </div>
                </div>

                {/* Current Question Result Indicator */}
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>This Question</h4>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isCorrect ? '#28a745' : '#dc3545',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    margin: '0 auto'
                  }}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    {isCorrect ? 'Correct' : 'Wrong'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '14px', fontStyle: 'italic', textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <strong>Explanation:</strong> {currentQ.explanation}
              </div>
            </div>
          );
        })()}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {!aptitudeTest.showResult ? (
            <button
              onClick={submitAptitudeAnswer}
              disabled={!aptitudeTest.userAnswer}
              style={{
                background: aptitudeTest.userAnswer ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: aptitudeTest.userAnswer ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✓ Submit Answer
            </button>
          ) : (
            <button
              onClick={nextAptitudeQuestion}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {aptitudeTest.currentQuestion < aptitudeQuestions.length - 1 ? '➡️ Next Question' : '🏁 Finish Test'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div style={{ padding: '20px' }}>
      <h2>🎯 AI-Powered Career Guidance</h2>
      <p>Discover your ideal career path with our comprehensive AI-driven assessment and guidance system.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3>🧠 Personality Assessment</h3>
          <p>Discover your personality traits and how they align with different career paths.</p>
          <button
            onClick={() => startPersonalityAssessment('big_five')}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            {personalityAssessment ? 'Retake Assessment' : 'Start Assessment'}
          </button>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3>🛠️ Skill Assessment</h3>
          <p>Evaluate your technical and soft skills to identify strengths and areas for growth.</p>
          <button
            onClick={startSkillAssessment}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            {skillAssessment ? 'Update Skills' : 'Assess Skills'}
          </button>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3>💼 Job Matching</h3>
          <p>Find job opportunities that match your skills, personality, and career goals.</p>
          <button
            onClick={findJobMatches}
            disabled={loading || (!personalityAssessment && !skillAssessment)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: loading || (!personalityAssessment && !skillAssessment) ? 'not-allowed' : 'pointer',
              marginTop: '15px',
              opacity: loading || (!personalityAssessment && !skillAssessment) ? 0.6 : 1
            }}
          >
            Find Job Matches
          </button>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3>🤖 AI Career Mentor</h3>
          <p>Chat with our AI mentor for personalized career advice and guidance.</p>
          <button
            onClick={() => setActiveTab('mentor')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Chat with Mentor
          </button>
        </div>
      </div>
      
      {careerRecommendations && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '30px',
          border: '1px solid #dee2e6'
        }}>
          <h3>🎯 Your Career Recommendations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' }}>
            {careerRecommendations.recommendations?.slice(0, 3).map((rec, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{rec.careerTitle}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>{rec.description}</p>
                <div style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
                  {rec.matchPercentage}% Match
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveTab('results')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            View All Recommendations
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e0e0e0',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: '🏠 Overview', icon: '🏠' },
          { id: 'assessment', label: '📝 Assessment', icon: '📝' },
          { id: 'aptitude', label: '🧮 Aptitude Test', icon: '🧮' },
          { id: 'results', label: '📊 Results', icon: '📊' },
          { id: 'jobs', label: '💼 Job Matches', icon: '💼' },
          { id: 'mentor', label: '🤖 AI Mentor', icon: '🤖' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#007bff' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              border: 'none',
              padding: '12px 20px',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
              whiteSpace: 'nowrap',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}

      {activeTab === 'assessment' && currentAssessment && (
        <div style={{ padding: '20px' }}>
          {currentAssessment.type === 'personality' ? (
            <div>
              <h2>🧠 Personality Assessment</h2>
              <p>{currentAssessment.data.instructions}</p>

              <div style={{
                background: '#e3f2fd',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                Progress: {Math.round(assessmentProgress)}% Complete
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}>
                  <div style={{
                    width: `${assessmentProgress}%`,
                    height: '100%',
                    background: '#2196f3',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              {currentAssessment.data.questions.map((question, index) => (
                <div key={question.id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4>Question {index + 1}</h4>
                  <p>{question.question}</p>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(value => (
                      <label key={value} style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: currentAssessment.responses.find(r => r.questionId === question.id)?.response === value ? '#007bff' : 'white',
                        color: currentAssessment.responses.find(r => r.questionId === question.id)?.response === value ? 'white' : 'black'
                      }}>
                        <input
                          type="radio"
                          name={question.id}
                          value={value}
                          onChange={() => handleAssessmentResponse(question.id, value)}
                          style={{ display: 'none' }}
                        />
                        {value === 1 ? 'Strongly Disagree' :
                         value === 2 ? 'Disagree' :
                         value === 3 ? 'Slightly Disagree' :
                         value === 4 ? 'Neutral' :
                         value === 5 ? 'Slightly Agree' :
                         value === 6 ? 'Agree' : 'Strongly Agree'}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={submitPersonalityAssessment}
                disabled={currentAssessment.responses.length < currentAssessment.data.questions.length}
                style={{
                  background: currentAssessment.responses.length < currentAssessment.data.questions.length ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: currentAssessment.responses.length < currentAssessment.data.questions.length ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Submit Assessment
              </button>
            </div>
          ) : (
            <div>
              <h2>🛠️ Skill Assessment</h2>
              <p>{currentAssessment.data.instructions}</p>

              <div style={{ marginBottom: '30px' }}>
                <h3>Technical Skills</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {currentAssessment.data.skillCategories.technical.map((skill, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{skill}</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                            <button
                              key={rating}
                              onClick={() => handleSkillRating(skill, rating, 'technicalSkills')}
                              style={{
                                width: '30px',
                                height: '30px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                background: currentAssessment.technicalSkills.find(s => s.skill === skill)?.score >= rating * 10 ? '#007bff' : 'white',
                                color: currentAssessment.technicalSkills.find(s => s.skill === skill)?.score >= rating * 10 ? 'white' : 'black',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3>Soft Skills</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {currentAssessment.data.skillCategories.soft.map((skill, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{skill}</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                            <button
                              key={rating}
                              onClick={() => handleSkillRating(skill, rating, 'softSkills')}
                              style={{
                                width: '30px',
                                height: '30px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                background: currentAssessment.softSkills.find(s => s.skill === skill)?.score >= rating * 10 ? '#007bff' : 'white',
                                color: currentAssessment.softSkills.find(s => s.skill === skill)?.score >= rating * 10 ? 'white' : 'black',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={submitSkillAssessment}
                disabled={currentAssessment.technicalSkills.length === 0 && currentAssessment.softSkills.length === 0}
                style={{
                  background: (currentAssessment.technicalSkills.length === 0 && currentAssessment.softSkills.length === 0) ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: (currentAssessment.technicalSkills.length === 0 && currentAssessment.softSkills.length === 0) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Submit Skill Assessment
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'aptitude' && renderAptitudeTest()}

      {activeTab === 'results' && (
        <div style={{ padding: '20px' }}>
          <h2>📊 Your Assessment Results</h2>

          {personalityAssessment && (
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <h3>🧠 Personality Profile</h3>
              <p><strong>Personality Type:</strong> {personalityAssessment.personalityType}</p>

              <div style={{ marginBottom: '15px' }}>
                <strong>Dominant Traits:</strong>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {personalityAssessment.dominantTraits?.map((trait, index) => (
                    <span key={index} style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}>
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong>Personality Scores:</strong>
                <div style={{ marginTop: '10px' }}>
                  {Object.entries(personalityAssessment.scores || {}).map(([trait, score]) => (
                    <div key={trait} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{trait.replace('_', ' ')}</span>
                        <span>{score}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e0e0e0',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          width: `${score}%`,
                          height: '100%',
                          background: score > 70 ? '#4caf50' : score > 40 ? '#ff9800' : '#f44336',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillAssessment && (
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <h3>🛠️ Skill Profile</h3>

              <div>
                <strong>Overall Skill Profile:</strong>
                <div style={{ marginTop: '10px' }}>
                  {Object.entries(skillAssessment.overallProfile || {}).map(([category, score]) => (
                    <div key={category} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{category.replace('_', ' ')}</span>
                        <span>{score}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e0e0e0',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          width: `${score}%`,
                          height: '100%',
                          background: score > 70 ? '#4caf50' : score > 40 ? '#ff9800' : '#f44336',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {skillAssessment.skillGaps && skillAssessment.skillGaps.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <strong>Skill Development Opportunities:</strong>
                  <div style={{ marginTop: '10px' }}>
                    {skillAssessment.skillGaps.map((gap, index) => (
                      <div key={index} style={{
                        background: '#fff3e0',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        border: '1px solid #ffcc02'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{gap.skill}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Priority: <span style={{
                            color: gap.priority === 'high' ? '#f44336' : gap.priority === 'medium' ? '#ff9800' : '#4caf50',
                            fontWeight: 'bold'
                          }}>{gap.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {careerRecommendations && (
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h3>🎯 Career Recommendations</h3>
              <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                {careerRecommendations.recommendations?.map((rec, index) => (
                  <div key={index} style={{
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>{rec.careerTitle}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#666' }}>{rec.description}</p>

                        <div style={{ display: 'flex', gap: '15px', fontSize: '14px', marginBottom: '10px' }}>
                          <span>💰 ${rec.averageSalary?.min?.toLocaleString()} - ${rec.averageSalary?.max?.toLocaleString()}</span>
                          <span>📈 {rec.growthOutlook?.replace('_', ' ')}</span>
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                          <strong>Required Skills:</strong>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                            {rec.requiredSkills?.map((skill, skillIndex) => (
                              <span key={skillIndex} style={{
                                background: '#e3f2fd',
                                color: '#1976d2',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '12px'
                              }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        background: '#4caf50',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginLeft: '15px'
                      }}>
                        {rec.matchPercentage}% Match
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div style={{ padding: '20px' }}>
          <h2>💼 Job Matches</h2>

          {jobMatches.length === 0 ? (
            <div style={{
              background: '#f8f9fa',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            }}>
              <p>No job matches found yet.</p>
              <p>Complete your personality and skill assessments to get personalized job recommendations.</p>
              <button
                onClick={findJobMatches}
                disabled={!personalityAssessment && !skillAssessment}
                style={{
                  background: (!personalityAssessment && !skillAssessment) ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: (!personalityAssessment && !skillAssessment) ? 'not-allowed' : 'pointer',
                  marginTop: '15px'
                }}
              >
                Find Job Matches
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {jobMatches.map((job, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{job.jobTitle}</h3>
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontWeight: 'bold' }}>{job.company}</p>
                      <p style={{ margin: '0 0 15px 0', color: '#666' }}>{job.location} • {job.jobType.replace('_', ' ')}</p>

                      <p style={{ margin: '0 0 15px 0', lineHeight: '1.5' }}>{job.description}</p>

                      <div style={{ marginBottom: '15px' }}>
                        <strong>Requirements:</strong>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                          {job.requirements?.map((req, reqIndex) => (
                            <span key={reqIndex} style={{
                              background: '#e3f2fd',
                              color: '#1976d2',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '12px'
                            }}>
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <strong>Benefits:</strong>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                          {job.benefits?.map((benefit, benefitIndex) => (
                            <span key={benefitIndex} style={{
                              background: '#e8f5e8',
                              color: '#388e3c',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '12px'
                            }}>
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                        <span>💰 ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}</span>
                        <span>🎯 Skill Match: {job.skillMatch}%</span>
                        <span>📍 Location Match: {job.locationMatch}%</span>
                      </div>

                      {job.applicationTips && job.applicationTips.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                          <strong>Application Tips:</strong>
                          <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                            {job.applicationTips.map((tip, tipIndex) => (
                              <li key={tipIndex} style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div style={{ marginLeft: '20px', textAlign: 'center' }}>
                      <div style={{
                        background: job.overallMatch >= 80 ? '#4caf50' : job.overallMatch >= 60 ? '#ff9800' : '#f44336',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                      }}>
                        {job.overallMatch}%
                      </div>

                      <button style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '8px',
                        width: '100%'
                      }}>
                        Apply Now
                      </button>

                      <button style={{
                        background: 'transparent',
                        color: '#007bff',
                        border: '1px solid #007bff',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        width: '100%'
                      }}>
                        Save Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mentor' && (
        <div style={{ padding: '20px' }}>
          <h2>🤖 AI Career Mentor</h2>
          <p>Get personalized career advice and guidance from our AI mentor.</p>

          <div style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            height: '500px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Chat Messages */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              borderBottom: '1px solid #e0e0e0'
            }}>
              {mentorChat.messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  marginTop: '50px'
                }}>
                  <p>👋 Hello! I'm your AI Career Mentor.</p>
                  <p>Ask me anything about career planning, skill development, or job searching!</p>

                  <div style={{ marginTop: '20px' }}>
                    <p><strong>Try asking:</strong></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                      {[
                        "What career path is best for me?",
                        "How can I improve my skills?",
                        "What should I include in my resume?",
                        "How do I prepare for interviews?"
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setUserInput(suggestion)}
                          style={{
                            background: '#f8f9fa',
                            border: '1px solid #e0e0e0',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            maxWidth: '300px'
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {mentorChat.messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '15px'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        background: message.sender === 'user' ? '#007bff' : '#f1f3f4',
                        color: message.sender === 'user' ? 'white' : 'black'
                      }}>
                        <div>{message.message}</div>

                        {message.suggestions && message.suggestions.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.8 }}>
                              Suggestions:
                            </div>
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => setUserInput(suggestion)}
                                style={{
                                  background: 'rgba(255,255,255,0.2)',
                                  border: '1px solid rgba(255,255,255,0.3)',
                                  color: 'inherit',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  marginRight: '5px',
                                  marginBottom: '5px'
                                }}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {message.actionItems && message.actionItems.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.8 }}>
                              Action Items:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              {message.actionItems.map((item, index) => (
                                <li key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div style={{
                          fontSize: '11px',
                          opacity: 0.7,
                          marginTop: '5px'
                        }}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {mentorChat.isTyping && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      marginBottom: '15px'
                    }}>
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '18px',
                        background: '#f1f3f4',
                        color: 'black'
                      }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span>AI Mentor is typing</span>
                          <div style={{
                            display: 'flex',
                            gap: '2px'
                          }}>
                            {[1, 2, 3].map(i => (
                              <div
                                key={i}
                                style={{
                                  width: '4px',
                                  height: '4px',
                                  borderRadius: '50%',
                                  background: '#666',
                                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your career..."
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '100px',
                    outline: 'none'
                  }}
                  rows="1"
                />
                <button
                  onClick={sendMentorMessage}
                  disabled={!userInput.trim() || mentorChat.isTyping}
                  style={{
                    background: (!userInput.trim() || mentorChat.isTyping) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: (!userInput.trim() || mentorChat.isTyping) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
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
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Processing your request...</p>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        textarea {
          font-family: inherit;
        }

        .chat-message {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .skill-rating-button:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }

        .job-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }

        .assessment-option:hover {
          background: #f0f0f0;
          transition: background 0.2s ease;
        }

        .mentor-suggestion:hover {
          background: rgba(255,255,255,0.4);
          transition: background 0.2s ease;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .career-grid {
            grid-template-columns: 1fr;
          }

          .assessment-options {
            flex-direction: column;
          }

          .skill-ratings {
            flex-wrap: wrap;
          }

          .job-card-content {
            flex-direction: column;
          }

          .chat-container {
            height: 400px;
          }
        }

        /* Accessibility improvements */
        button:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        .assessment-progress {
          transition: width 0.5s ease;
        }

        .personality-score-bar {
          transition: width 0.8s ease;
        }

        .skill-score-bar {
          transition: width 0.8s ease;
        }
      `}</style>
    </div>
  );
};

export default AICareerGuidance;
