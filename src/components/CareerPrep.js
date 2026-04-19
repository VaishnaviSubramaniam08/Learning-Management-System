import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import io from 'socket.io-client';
import './CareerPrep.css';

const CareerPrep = ({ user }) => {
  const [aptitudeTests, setAptitudeTests] = useState([]);
  const [resumeTemplates, setResumeTemplates] = useState([]);
  const [interviewPreps, setInterviewPreps] = useState([]);
  const [companyPreps, setCompanyPreps] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userProgress, setUserProgress] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Job Portal specific state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [visibleJobsCount, setVisibleJobsCount] = useState(6);
  const [applicationForm, setApplicationForm] = useState({
    email: '',
    resume: null,
    coverLetter: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const saved = localStorage.getItem('appliedJobs');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Real-time state
  const [realTimeStats, setRealTimeStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  // Session tracking
  const [currentTest, setCurrentTest] = useState(null);
  const [testProgress, setTestProgress] = useState({
    currentQuestion: 0,
    answeredQuestions: 0,
    timeSpent: 0,
    score: 0
  });
  const [sessionTimer, setSessionTimer] = useState(0);

  // Interactive Aptitude Test State
  const [interactiveAptitude, setInteractiveAptitude] = useState({
    isActive: false,
    currentQuestion: 0,
    answers: [],
    score: 0,
    isCompleted: false,
    userAnswer: '',
    showResult: false,
    timeLeft: 60
  });

  // Resume Generator State
  const [resumeGenerator, setResumeGenerator] = useState({
    isActive: false,
    currentStep: 'form',
    generatedResume: null,
    atsScore: null,
    isGenerating: false,
    formData: {
      // Personal Information
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedIn: '',
      portfolio: '',

      // Professional Summary
      objective: '',

      // Experience
      experience: [
        {
          company: '',
          position: '',
          duration: '',
          description: ''
        }
      ],

      // Education
      education: [
        {
          institution: '',
          degree: '',
          year: '',
          gpa: ''
        }
      ],

      // Skills
      technicalSkills: '',
      softSkills: '',

      // Projects
      projects: [
        {
          title: '',
          description: '',
          technologies: '',
          link: ''
        }
      ],

      // Additional Sections for Freshers
      certifications: '',
      achievements: '',
      languages: '',
      interests: '',

      // Area of Interest
      areaOfInterest: '',
      careerObjective: '',

      // Academic Projects (for freshers)
      academicProjects: [
        {
          title: '',
          description: '',
          technologies: '',
          duration: '',
          teamSize: '',
          role: '',
          outcomes: ''
        }
      ],

      // Internships
      internships: [
        {
          company: '',
          position: '',
          duration: '',
          description: '',
          technologies: ''
        }
      ],

      // Training & Workshops
      trainings: [
        {
          title: '',
          organization: '',
          duration: '',
          description: ''
        }
      ],

      // Extracurricular Activities
      extracurricular: '',

      // Personal Projects
      personalProjects: [
        {
          title: '',
          description: '',
          technologies: '',
          githubLink: '',
          liveLink: '',
          features: ''
        }
      ],

      // Technical Proficiency
      programmingLanguages: '',
      frameworks: '',
      databases: '',
      tools: '',
      operatingSystems: ''
    }
  });

  // Refs
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    initializeCareerPrep();
    return () => cleanup();
  }, [user]);

  const initializeCareerPrep = async () => {
    try {
      // Initialize socket connection
      initializeSocket();

      // Load initial data
      await fetchCareerData();

      // Start real-time features
      startRealTimeUpdates();

    } catch (error) {
      console.error('Error initializing Career Prep:', error);
      setError('Failed to initialize Career Preparation. Please refresh the page.');
    }
  };

  const initializeSocket = () => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to Career Prep real-time service');
      setIsOnline(true);

      // Join user room
      if (user?.id) {
        socketRef.current.emit('join_user_room', user.id);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from Career Prep service');
      setIsOnline(false);
    });

    // Real-time event handlers
    socketRef.current.on('dashboard_update', (data) => {
      console.log('📊 Dashboard update received:', data);
      setUserProgress(data.progress);
      setNotifications(data.notifications);
    });

    socketRef.current.on('realtime_stats', (stats) => {
      console.log('📈 Real-time stats update:', stats);
      setRealTimeStats(stats);
    });

    socketRef.current.on('session_started', (data) => {
      console.log('🚀 Session started:', data);
      setActiveSession(data);
      startSessionTimer();
    });

    socketRef.current.on('progress_update', (data) => {
      console.log('📊 Progress update:', data);
      setTestProgress(data.progress);
    });

    socketRef.current.on('session_completed', (data) => {
      console.log('✅ Session completed:', data);
      setActiveSession(null);
      stopSessionTimer();

      if (data.achievements && data.achievements.length > 0) {
        setAchievements(prev => [...prev, ...data.achievements]);
        showAchievementNotification(data.achievements);
      }
    });

    socketRef.current.on('new_achievement', (achievement) => {
      console.log('🏆 New achievement:', achievement);
      setAchievements(prev => [...prev, achievement]);
      showAchievementNotification([achievement]);
    });

    socketRef.current.on('leaderboard_update', (data) => {
      console.log('🏆 Leaderboard update:', data);
      setLeaderboard(data.entries);
    });

    socketRef.current.on('stats_update', (stats) => {
      setRealTimeStats(stats);
    });
  };

  const startRealTimeUpdates = () => {
    // Request initial real-time stats
    if (socketRef.current) {
      socketRef.current.emit('get_realtime_stats');
    }
  };

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    stopSessionTimer();
    stopProgressTracking();
  };

  const fetchCareerData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('💼 Loading career preparation data...');
      console.log('🔗 API Base URL:', axios.defaults.baseURL);
      console.log('🔑 Auth Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      // Test a simple endpoint first
      console.log('🧪 Testing API connection...');
      try {
        const testResponse = await axios.get('/career-prep/aptitude-tests');
        console.log('✅ API connection successful:', testResponse.data);
      } catch (testError) {
        console.error('❌ API connection failed:', testError);
        console.error('❌ Error details:', {
          message: testError.message,
          response: testError.response?.data,
          status: testError.response?.status,
          url: testError.config?.url
        });
      }

      // Fetch all data in parallel for better performance
      console.log('📡 Making parallel API calls...');
      const [
        aptitudeResponse,
        resumeResponse,
        interviewResponse,
        companyResponse,
        jobResponse
      ] = await Promise.all([
        axios.get('/career-prep/aptitude-tests'),
        axios.get('/career-prep/resume-templates'),
        axios.get('/career-prep/interview-prep'),
        axios.get('/career-prep/company-prep'),
        axios.get('/career-prep/job-listings')
      ]);

      setAptitudeTests(aptitudeResponse.data);
      setResumeTemplates(resumeResponse.data);
      setInterviewPreps(interviewResponse.data);
      setCompanyPreps(companyResponse.data);
      setJobListings(jobResponse.data);

      // Fetch user progress and enhanced data
      try {
        const [progressResponse, notificationsResponse, analyticsResponse] = await Promise.all([
          axios.get('/career-prep/progress').catch(() => ({ data: {} })),
          axios.get('/career-prep-enhanced/notifications/687343454bfc0bf8944ecde7').catch(() => ({ data: { notifications: [] } })),
          axios.get('/career-prep-enhanced/analytics/realtime').catch(() => ({ data: { data: {} } }))
        ]);

        setUserProgress(progressResponse.data || {
          testsCompleted: 0,
          resumesDownloaded: 0,
          interviewsScheduled: 0,
          applicationsSubmitted: 0
        });

        setNotifications(notificationsResponse.data.notifications || []);
        setRealTimeStats(analyticsResponse.data.data || {});

      } catch (progressError) {
        console.log('No progress data found for user, using defaults');
        setUserProgress({
          testsCompleted: 0,
          resumesDownloaded: 0,
          interviewsScheduled: 0,
          applicationsSubmitted: 0
        });
      }

      console.log('✅ Loaded career preparation data:', {
        aptitudeTests: aptitudeResponse.data.length,
        resumeTemplates: resumeResponse.data.length,
        interviewPreps: interviewResponse.data.length,
        companyPreps: companyResponse.data.length,
        jobListings: jobResponse.data.length
      });

    } catch (error) {
      console.error('❌ Error fetching career data:', error);
      setError('Failed to load career preparation data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const startAptitudeTest = async (test) => {
    setSelectedItem(test);
    setShowModal(true);
  };

  const confirmStartTest = async () => {
    if (!selectedItem) return;

    try {
      console.log('🧠 Starting aptitude test:', selectedItem._id);

      // Start session via enhanced API
      const sessionResponse = await axios.post('/career-prep-enhanced/session/start', {
        type: 'aptitude-test',
        resourceId: selectedItem._id,
        userId: user?.id || '687343454bfc0bf8944ecde7'
      });

      const { sessionId } = sessionResponse.data;

      // Set current test
      setCurrentTest(selectedItem);

      // Initialize progress
      setTestProgress({
        currentQuestion: 0,
        answeredQuestions: 0,
        timeSpent: 0,
        score: 0
      });

      // Notify socket service
      if (socketRef.current) {
        socketRef.current.emit('career_prep_start_session', {
          sessionId,
          userId: user?.id || '687343454bfc0bf8944ecde7'
        });
      }

      // Start progress tracking
      startProgressTracking(sessionId);

      setShowModal(false);
      setSelectedItem(null);

      console.log('✅ Test session started successfully');

    } catch (error) {
      console.error('❌ Error starting test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  const startProgressTracking = (sessionId) => {
    progressIntervalRef.current = setInterval(() => {
      // Update progress every 5 seconds
      const updatedProgress = {
        ...testProgress,
        timeSpent: sessionTimer
      };

      // Send progress update
      if (socketRef.current) {
        socketRef.current.emit('career_prep_update_progress', {
          sessionId,
          progress: updatedProgress
        });
      }

      // Update real-time data
      const realTimeData = {
        lastActivity: new Date(),
        keystrokes: Math.floor(Math.random() * 10), // Simulated
        mouseClicks: Math.floor(Math.random() * 5), // Simulated
        tabSwitches: 0
      };

      // Send to API
      axios.post(`/career-prep-enhanced/session/${sessionId}/progress`, {
        ...updatedProgress,
        realTimeData
      }).catch(console.error);

    }, 5000);
  };

  const completeTest = async (finalScore) => {
    try {
      if (!activeSession) return;

      console.log('🏁 Completing test with score:', finalScore);

      const finalData = {
        progress: {
          ...testProgress,
          score: finalScore
        },
        metadata: {
          completedAt: new Date(),
          totalTime: sessionTimer
        }
      };

      // Complete session via API
      await axios.post(`/career-prep-enhanced/session/${activeSession.sessionId}/complete`, {
        finalScore,
        completionData: finalData
      });

      // Notify socket service
      if (socketRef.current) {
        socketRef.current.emit('career_prep_complete_session', {
          sessionId: activeSession.sessionId,
          finalData
        });
      }

      // Clean up
      setCurrentTest(null);
      stopProgressTracking();

      console.log('✅ Test completed successfully');

    } catch (error) {
      console.error('❌ Error completing test:', error);
    }
  };

  const startSessionTimer = () => {
    setSessionTimer(0);
    timerRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const showAchievementNotification = (achievements) => {
    // Show achievement popup/toast
    achievements.forEach(achievement => {
      console.log(`🏆 Achievement unlocked: ${achievement.title}`);
      // You could integrate with a toast library here
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadTemplate = async (template) => {
    try {
      await axios.post('/career-prep/track-download', {
        templateId: template._id,
        type: 'resume-template'
      });

      alert(`Downloading ${template.title}. This would trigger a download.`);
      fetchCareerData();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Interactive Aptitude Test Questions
  const interactiveAptitudeQuestions = [
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
      correct: 1,
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

  // Interactive Aptitude Test Functions
  const startInteractiveAptitudeTest = () => {
    setInteractiveAptitude({
      isActive: true,
      currentQuestion: 0,
      answers: [],
      score: 0,
      isCompleted: false,
      userAnswer: '',
      showResult: false,
      timeLeft: 60
    });
  };

  const submitInteractiveAnswer = () => {
    const currentQ = interactiveAptitudeQuestions[interactiveAptitude.currentQuestion];
    const isCorrect = parseInt(interactiveAptitude.userAnswer) === currentQ.correct;

    const newAnswers = [...interactiveAptitude.answers, {
      questionId: currentQ.id,
      userAnswer: interactiveAptitude.userAnswer,
      correctAnswer: currentQ.correct,
      isCorrect: isCorrect,
      category: currentQ.category
    }];

    setInteractiveAptitude(prev => ({
      ...prev,
      answers: newAnswers,
      score: isCorrect ? prev.score + 1 : prev.score,
      showResult: true
    }));
  };

  const nextInteractiveQuestion = () => {
    if (interactiveAptitude.currentQuestion < interactiveAptitudeQuestions.length - 1) {
      setInteractiveAptitude(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        userAnswer: '',
        showResult: false
      }));
    } else {
      setInteractiveAptitude(prev => ({
        ...prev,
        isCompleted: true
      }));
    }
  };

  // Resume Generator Functions
  const startResumeGenerator = () => {
    setResumeGenerator(prev => ({
      ...prev,
      isActive: true,
      currentStep: 'form'
    }));
  };

  const updateResumeFormData = (field, value, index = null, subField = null) => {
    setResumeGenerator(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: index !== null && Array.isArray(prev.formData[field])
          ? prev.formData[field].map((item, i) =>
              i === index
                ? (subField ? { ...item, [subField]: value } : value)
                : item
            )
          : value
      }
    }));
  };

  const addArrayItem = (field, template) => {
    setResumeGenerator(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: [...prev.formData[field], template]
      }
    }));
  };

  const removeArrayItem = (field, index) => {
    setResumeGenerator(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: prev.formData[field].filter((_, i) => i !== index)
      }
    }));
  };

  const generateResume = async () => {
    setResumeGenerator(prev => ({ ...prev, isGenerating: true }));

    // Simulate resume generation
    setTimeout(() => {
      const resumeHTML = createResumeHTML(resumeGenerator.formData);
      setResumeGenerator(prev => ({
        ...prev,
        generatedResume: resumeHTML,
        currentStep: 'preview',
        isGenerating: false
      }));
    }, 2000);
  };

  const createResumeHTML = (data) => {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 32px; color: #007bff;">${data.fullName}</h1>
          <div style="margin-top: 10px; font-size: 14px; color: #666;">
            📧 ${data.email} | 📱 ${data.phone} | 📍 ${data.address}
            ${data.linkedIn ? `| 💼 ${data.linkedIn}` : ''}
            ${data.portfolio ? `| 🌐 ${data.portfolio}` : ''}
          </div>
        </div>

        <!-- Objective -->
        ${data.objective ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🎯 OBJECTIVE</h2>
          <p style="margin: 10px 0;">${data.objective}</p>
        </div>
        ` : ''}

        <!-- Career Objective (for freshers) -->
        ${data.careerObjective ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🚀 CAREER OBJECTIVE</h2>
          <p style="margin: 10px 0;">${data.careerObjective}</p>
        </div>
        ` : ''}

        <!-- Area of Interest -->
        ${data.areaOfInterest ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🎯 AREA OF INTEREST</h2>
          <p style="margin: 10px 0;">${data.areaOfInterest}</p>
        </div>
        ` : ''}

        <!-- Experience -->
        ${data.experience.some(exp => exp.company) ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">💼 EXPERIENCE</h2>
          ${data.experience.map(exp => exp.company ? `
            <div style="margin: 15px 0;">
              <h3 style="margin: 5px 0; color: #333;">${exp.position}</h3>
              <div style="font-weight: bold; color: #007bff;">${exp.company} | ${exp.duration}</div>
              <p style="margin: 8px 0;">${exp.description}</p>
            </div>
          ` : '').join('')}
        </div>
        ` : ''}

        <!-- Internships -->
        ${data.internships.some(intern => intern.company) ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🎓 INTERNSHIPS</h2>
          ${data.internships.map(intern => intern.company ? `
            <div style="margin: 15px 0;">
              <h3 style="margin: 5px 0; color: #333;">${intern.position}</h3>
              <div style="font-weight: bold; color: #007bff;">${intern.company} | ${intern.duration}</div>
              <p style="margin: 8px 0;">${intern.description}</p>
              ${intern.technologies ? `<div style="color: #666; font-size: 14px;"><strong>Technologies:</strong> ${intern.technologies}</div>` : ''}
            </div>
          ` : '').join('')}
        </div>
        ` : ''}

        <!-- Education -->
        ${data.education.some(edu => edu.institution) ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🎓 EDUCATION</h2>
          ${data.education.map(edu => edu.institution ? `
            <div style="margin: 15px 0;">
              <h3 style="margin: 5px 0; color: #333;">${edu.degree}</h3>
              <div style="font-weight: bold; color: #007bff;">${edu.institution} | ${edu.year}</div>
              ${edu.gpa ? `<div style="color: #666;">GPA: ${edu.gpa}</div>` : ''}
            </div>
          ` : '').join('')}
        </div>
        ` : ''}

        <!-- Technical Proficiency -->
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🛠️ TECHNICAL PROFICIENCY</h2>
          ${data.programmingLanguages ? `
            <div style="margin: 10px 0;">
              <strong>Programming Languages:</strong> ${data.programmingLanguages}
            </div>
          ` : ''}
          ${data.frameworks ? `
            <div style="margin: 10px 0;">
              <strong>Frameworks & Libraries:</strong> ${data.frameworks}
            </div>
          ` : ''}
          ${data.databases ? `
            <div style="margin: 10px 0;">
              <strong>Databases:</strong> ${data.databases}
            </div>
          ` : ''}
          ${data.tools ? `
            <div style="margin: 10px 0;">
              <strong>Tools & Technologies:</strong> ${data.tools}
            </div>
          ` : ''}
          ${data.operatingSystems ? `
            <div style="margin: 10px 0;">
              <strong>Operating Systems:</strong> ${data.operatingSystems}
            </div>
          ` : ''}
          ${data.technicalSkills ? `
            <div style="margin: 10px 0;">
              <strong>Other Technical Skills:</strong> ${data.technicalSkills}
            </div>
          ` : ''}
          ${data.softSkills ? `
            <div style="margin: 10px 0;">
              <strong>Soft Skills:</strong> ${data.softSkills}
            </div>
          ` : ''}
        </div>

        <!-- Academic Projects -->
        ${data.academicProjects.some(proj => proj.title) ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">📚 ACADEMIC PROJECTS</h2>
          ${data.academicProjects.map(proj => proj.title ? `
            <div style="margin: 15px 0;">
              <h3 style="margin: 5px 0; color: #333;">${proj.title}</h3>
              ${proj.duration ? `<div style="color: #007bff; font-weight: bold;">Duration: ${proj.duration}</div>` : ''}
              ${proj.teamSize ? `<div style="color: #666; font-size: 14px;">Team Size: ${proj.teamSize} | Role: ${proj.role || 'Team Member'}</div>` : ''}
              <p style="margin: 8px 0;">${proj.description}</p>
              ${proj.technologies ? `<div style="color: #666; font-size: 14px;"><strong>Technologies Used:</strong> ${proj.technologies}</div>` : ''}
              ${proj.outcomes ? `<div style="color: #666; font-size: 14px;"><strong>Outcomes:</strong> ${proj.outcomes}</div>` : ''}
            </div>
          ` : '').join('')}
        </div>
        ` : ''}

        <!-- Personal Projects -->
        ${data.personalProjects.some(proj => proj.title) ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">💻 PERSONAL PROJECTS</h2>
          ${data.personalProjects.map(proj => proj.title ? `
            <div style="margin: 15px 0;">
              <h3 style="margin: 5px 0; color: #333;">${proj.title}</h3>
              <p style="margin: 8px 0;">${proj.description}</p>
              ${proj.technologies ? `<div style="color: #666; font-size: 14px;"><strong>Technologies:</strong> ${proj.technologies}</div>` : ''}
              ${proj.features ? `<div style="color: #666; font-size: 14px;"><strong>Key Features:</strong> ${proj.features}</div>` : ''}
              ${proj.githubLink ? `<div style="color: #007bff; font-size: 14px;"><strong>GitHub:</strong> ${proj.githubLink}</div>` : ''}
              ${proj.liveLink ? `<div style="color: #007bff; font-size: 14px;"><strong>Live Demo:</strong> ${proj.liveLink}</div>` : ''}
            </div>
          ` : '').join('')}
        </div>
        ` : ''}

        <!-- Projects -->
        ${data.projects.some(proj => proj.title) ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🚀 PROJECTS</h2>
          ${data.projects.map(proj => proj.title ? `
            <div style="margin: 15px 0;">
              <h3 style="margin: 5px 0; color: #333;">${proj.title}</h3>
              <p style="margin: 8px 0;">${proj.description}</p>
              ${proj.technologies ? `<div style="color: #666; font-size: 14px;"><strong>Technologies:</strong> ${proj.technologies}</div>` : ''}
              ${proj.link ? `<div style="color: #007bff; font-size: 14px;"><strong>Link:</strong> ${proj.link}</div>` : ''}
            </div>
          ` : '').join('')}
        </div>
        ` : ''}

        <!-- Training & Workshops -->
        ${data.trainings.some(training => training.title) ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">📖 TRAINING & WORKSHOPS</h2>
          ${data.trainings.map(training => training.title ? `
            <div style="margin: 15px 0;">
              <h3 style="margin: 5px 0; color: #333;">${training.title}</h3>
              <div style="font-weight: bold; color: #007bff;">${training.organization} | ${training.duration}</div>
              <p style="margin: 8px 0;">${training.description}</p>
            </div>
          ` : '').join('')}
        </div>
        ` : ''}

        <!-- Additional Sections -->
        ${data.certifications ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🏆 CERTIFICATIONS</h2>
          <p style="margin: 10px 0;">${data.certifications}</p>
        </div>
        ` : ''}

        ${data.achievements ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🌟 ACHIEVEMENTS</h2>
          <p style="margin: 10px 0;">${data.achievements}</p>
        </div>
        ` : ''}

        ${data.extracurricular ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🎭 EXTRACURRICULAR ACTIVITIES</h2>
          <p style="margin: 10px 0;">${data.extracurricular}</p>
        </div>
        ` : ''}

        ${data.languages ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🌍 LANGUAGES</h2>
          <p style="margin: 10px 0;">${data.languages}</p>
        </div>
        ` : ''}

        ${data.interests ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🎨 INTERESTS</h2>
          <p style="margin: 10px 0;">${data.interests}</p>
        </div>
        ` : ''}
      </div>
    `;
  };

  const calculateATSScore = () => {
    const data = resumeGenerator.formData;
    let score = 0;
    let maxScore = 100;

    // Contact Information (20 points)
    if (data.fullName) score += 5;
    if (data.email) score += 5;
    if (data.phone) score += 5;
    if (data.address) score += 5;

    // Professional Summary (15 points)
    if (data.objective && data.objective.length > 50) score += 15;
    else if (data.objective) score += 8;

    // Experience (25 points)
    const validExperience = data.experience.filter(exp => exp.company && exp.position);
    if (validExperience.length >= 2) score += 25;
    else if (validExperience.length === 1) score += 15;

    // Education (15 points)
    const validEducation = data.education.filter(edu => edu.institution && edu.degree);
    if (validEducation.length >= 1) score += 15;

    // Skills (15 points)
    if (data.technicalSkills && data.softSkills) score += 15;
    else if (data.technicalSkills || data.softSkills) score += 8;

    // Projects (10 points)
    const validProjects = data.projects.filter(proj => proj.title && proj.description);
    if (validProjects.length >= 2) score += 10;
    else if (validProjects.length === 1) score += 5;

    const percentage = Math.round((score / maxScore) * 100);

    setResumeGenerator(prev => ({
      ...prev,
      atsScore: {
        score: percentage,
        breakdown: {
          contactInfo: data.fullName && data.email && data.phone && data.address ? 20 : 10,
          summary: data.objective && data.objective.length > 50 ? 15 : 8,
          experience: validExperience.length >= 2 ? 25 : validExperience.length === 1 ? 15 : 0,
          education: validEducation.length >= 1 ? 15 : 0,
          skills: data.technicalSkills && data.softSkills ? 15 : 8,
          projects: validProjects.length >= 2 ? 10 : validProjects.length === 1 ? 5 : 0
        },
        recommendations: [
          ...(percentage < 60 ? ['Add more detailed work experience'] : []),
          ...(percentage < 70 ? ['Include technical and soft skills'] : []),
          ...(percentage < 80 ? ['Add relevant projects with descriptions'] : []),
          ...(percentage < 90 ? ['Include certifications and achievements'] : [])
        ]
      },
      currentStep: 'ats'
    }));
  };

  const downloadResume = () => {
    const element = document.createElement('a');
    const file = new Blob([resumeGenerator.generatedResume], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeGenerator.formData.fullName || 'Resume'}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const startMockInterview = async (prep) => {
    try {
      const sessionResponse = await axios.post('/career-prep/start-interview', {
        prepId: prep._id
      });

      alert(`Starting mock interview: ${prep.title}. Session ID: ${sessionResponse.data.sessionId}`);
      fetchCareerData();
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  const viewCompanyInfo = (company) => {
    setSelectedItem(company);
    setShowModal(true);
  };

  const applyToJob = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    setApplicationForm({
      email: user?.email || '',
      resume: null,
      coverLetter: ''
    });
  };

  const submitJobApplication = async () => {
    try {
      if (!applicationForm.email || !applicationForm.resume) {
        showToastMessage('Please fill in all required fields', 'error');
        return;
      }

      setIsSubmitting(true);
      showToastMessage('Submitting your application...', 'info');

      const formData = new FormData();
      formData.append('jobId', selectedJob._id);
      formData.append('email', applicationForm.email);
      formData.append('resume', applicationForm.resume);
      formData.append('coverLetter', applicationForm.coverLetter);

      console.log('Submitting application for job:', selectedJob._id);
      console.log('Form data:', {
        jobId: selectedJob._id,
        email: applicationForm.email,
        resumeFile: applicationForm.resume?.name,
        coverLetter: applicationForm.coverLetter
      });

      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      const response = await axios.post('/career-prep/apply-job', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Application response:', response.data);

      showToastMessage(`✅ Application submitted successfully for ${selectedJob.title}!`, 'success');

      // Add job to applied jobs set
      setAppliedJobs(prev => {
        const newAppliedJobs = new Set([...prev, selectedJob._id]);
        localStorage.setItem('appliedJobs', JSON.stringify([...newAppliedJobs]));
        return newAppliedJobs;
      });

      // Close modal and reset form
      setShowApplicationModal(false);
      setSelectedJob(null);
      setApplicationForm({
        email: user?.email || '',
        resume: null,
        coverLetter: ''
      });

      // Refresh data to show updated application count
      fetchCareerData();
    } catch (error) {
      console.error('Error applying to job:', error);
      const errorMessage = error.response?.data?.message || 'Application failed. Please try again.';
      showToastMessage(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    const duration = type === 'info' ? 2000 : 3000;
    setTimeout(() => setShowToast(false), duration);
  };

  const loadMoreJobs = () => {
    setVisibleJobsCount(prev => prev + 6);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToastMessage('File size should be less than 5MB', 'error');
        return;
      }
      setApplicationForm(prev => ({ ...prev, resume: file }));
    }
  };

  // Job Portal Section Component
  const JobPortalSection = ({ jobListings, onApplyToJob, appliedJobs }) => {
    const visibleJobs = jobListings.slice(0, visibleJobsCount);
    const hasMoreJobs = visibleJobsCount < jobListings.length;

    return (
      <div className="job-portal-section">
        {jobListings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h3 className="empty-state-title">No Job Listings Available</h3>
            <p className="empty-state-description">No job listings available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="job-cards-grid">
              {visibleJobs.map((job, index) => (
                <div
                  key={job._id}
                  className={`job-card ${job.urgent ? 'urgent-job' : ''}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animation: 'fadeInUp 0.6s ease forwards'
                  }}
                >
                  <div className="job-card-header">
                    <div className="job-company-info">
                      <div className="company-logo">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="job-title">{job.title}</h3>
                        <p className="job-company">{job.company}</p>
                      </div>
                    </div>
                    <div className="job-tags">
                      {job.remote && <span className="job-tag remote">Remote</span>}
                      {job.hybrid && <span className="job-tag hybrid">Hybrid</span>}
                      {job.urgent && <span className="job-tag urgent">Urgent</span>}
                    </div>
                  </div>

                  <div className="job-card-body">
                    <div className="salary-range">
                      <span className="salary-label">Salary Range</span>
                      <span className="salary-amount">
                        ₹{job.salary?.min?.toLocaleString()} - ₹{job.salary?.max?.toLocaleString()}
                      </span>
                    </div>

                    <div className="job-details">
                      <div className="job-detail">
                        <span className="detail-icon">📍</span>
                        <span>{job.location}</span>
                      </div>
                      <div className="job-detail">
                        <span className="detail-icon">💼</span>
                        <span>{job.jobType}</span>
                      </div>
                      <div className="job-detail">
                        <span className="detail-icon">📅</span>
                        <span>Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="job-skills">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="skill-tag more">+{job.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="job-card-footer">
                    {appliedJobs.has(job._id) ? (
                      <button
                        className="apply-now-btn applied"
                        disabled
                      >
                        <span className="btn-icon">✅</span>
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => onApplyToJob(job)}
                        className="apply-now-btn"
                      >
                        <span className="btn-icon">🚀</span>
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMoreJobs && (
              <div className="load-more-section">
                <button onClick={loadMoreJobs} className="load-more-btn">
                  <span className="btn-icon">👁️</span>
                  View More Jobs ({jobListings.length - visibleJobsCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="career-prep-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading career preparation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="career-prep-container">
      {/* Header with Real-time Status */}
      <div className="career-prep-header">
        <div className="career-prep-header-content">
          <div className="header-main">
            <h1 className="career-prep-title">🚀 Career Preparation</h1>
            <p className="career-prep-subtitle">Real-time progress tracking and comprehensive preparation tools</p>
          </div>

          <div className="header-status">
            <div className="connection-status">
              <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></span>
              <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {activeSession && (
              <div className="session-info">
                <span className="session-timer">⏱️ {formatTime(sessionTimer)}</span>
                <span className="session-type">Active Session</span>
              </div>
            )}

            {notifications.length > 0 && (
              <div className="notifications-badge">
                <span className="notification-count">{notifications.filter(n => !n.read).length}</span>
                <span className="notification-icon">🔔</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Stats Bar */}
        {realTimeStats && Object.keys(realTimeStats).length > 0 && (
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{realTimeStats.activeSessions || 0}</span>
              <span className="stat-label">Active Sessions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{realTimeStats.onlineUsers || 0}</span>
              <span className="stat-label">Online Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{realTimeStats.todayCompletions || 0}</span>
              <span className="stat-label">Today's Completions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{realTimeStats.averageScore || 0}%</span>
              <span className="stat-label">Average Score</span>
            </div>
          </div>
        )}
      </div>

      <div className="career-content">
        {/* Error Message */}
        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="career-tabs">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'aptitude-tests', label: 'Aptitude Tests', icon: '🧠' },
            { key: 'resume-templates', label: 'Resume Templates', icon: '📄' },
            { key: 'interview-prep', label: 'Interview Prep', icon: '🗣️' },
            { key: 'company-prep', label: 'Company Prep', icon: '🏢' },
            { key: 'job-listings', label: 'Job Listings', icon: '💼' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`career-tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-card">
                <span className="overview-card-icon">🧠</span>
                <h3 className="overview-card-title">Aptitude Tests</h3>
                <div className="overview-card-value" style={{ color: '#3b82f6' }}>{aptitudeTests.length}</div>
                <p className="overview-card-subtitle">Available tests</p>
              </div>
              <div className="overview-card">
                <span className="overview-card-icon">📄</span>
                <h3 className="overview-card-title">Resume Templates</h3>
                <div className="overview-card-value" style={{ color: '#10b981' }}>{resumeTemplates.length}</div>
                <p className="overview-card-subtitle">Professional templates</p>
              </div>
              <div className="overview-card">
                <span className="overview-card-icon">🗣️</span>
                <h3 className="overview-card-title">Interview Prep</h3>
                <div className="overview-card-value" style={{ color: '#8b5cf6' }}>{interviewPreps.length}</div>
                <p className="overview-card-subtitle">Mock interviews</p>
              </div>
              <div className="overview-card">
                <span className="overview-card-icon">🏢</span>
                <h3 className="overview-card-title">Company Prep</h3>
                <div className="overview-card-value" style={{ color: '#f59e0b' }}>{companyPreps.length}</div>
                <p className="overview-card-subtitle">Company guides</p>
              </div>
              <div className="overview-card">
                <span className="overview-card-icon">💼</span>
                <h3 className="overview-card-title">Job Listings</h3>
                <div className="overview-card-value" style={{ color: '#ef4444' }}>{jobListings.length}</div>
                <p className="overview-card-subtitle">Open positions</p>
              </div>
              <div className="overview-card">
                <span className="overview-card-icon">📈</span>
                <h3 className="overview-card-title">Progress</h3>
                <div className="overview-card-value" style={{ color: '#06b6d4' }}>{userProgress.testsCompleted || 0}</div>
                <p className="overview-card-subtitle">Tests completed</p>
              </div>
            </div>

            {/* Enhanced Progress Section */}
            {userProgress && Object.keys(userProgress).length > 0 && (
            <div className="progress-section">
              <h2 className="section-title">📊 Your Progress</h2>
              <div className="progress-grid">
                {userProgress.aptitudeTests && (
                  <div className="progress-card">
                    <h3>🧠 Aptitude Tests</h3>
                    <div className="progress-stats">
                      <div className="stat">
                        <span className="stat-number">{userProgress.aptitudeTests.completedTests || 0}</span>
                        <span className="stat-label">Completed</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{Math.round(userProgress.aptitudeTests.averageScore || 0)}%</span>
                        <span className="stat-label">Average Score</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{userProgress.aptitudeTests.bestScore || 0}%</span>
                        <span className="stat-label">Best Score</span>
                      </div>
                    </div>
                  </div>
                )}

                {userProgress.streaks && (
                  <div className="progress-card streak-card">
                    <h3>🔥 Learning Streak</h3>
                    <div className="streak-display">
                      <span className="streak-number">{userProgress.streaks.currentStreak || 0}</span>
                      <span className="streak-label">Days</span>
                    </div>
                    <p className="streak-best">Best: {userProgress.streaks.longestStreak || 0} days</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements Section */}
          {achievements.length > 0 && (
            <div className="achievements-section">
              <h2 className="section-title">🏆 Recent Achievements</h2>
              <div className="achievements-grid">
                {achievements.slice(-5).map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h4 className="achievement-title">{achievement.title}</h4>
                    <p className="achievement-description">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Test Session */}
          {currentTest && (
            <div className="current-session">
              <h2 className="section-title">📝 Current Test Session</h2>
              <div className="session-card">
                <h3>{currentTest.title}</h3>
                <div className="session-progress">
                  <div className="progress-item">
                    <span>Progress:</span>
                    <span>{testProgress.answeredQuestions} / {currentTest.questions?.length || 0} questions</span>
                  </div>
                  <div className="progress-item">
                    <span>Time:</span>
                    <span>{formatTime(sessionTimer)} / {currentTest.timeLimit || 60} minutes</span>
                  </div>
                  <div className="progress-item">
                    <span>Score:</span>
                    <span>{testProgress.score}%</span>
                  </div>
                </div>
                <button
                  onClick={() => completeTest(Math.floor(Math.random() * 100))}
                  className="complete-test-btn"
                >
                  Complete Test (Demo)
                </button>
              </div>
            </div>
          )}
          </div>
        )}

        {activeTab === 'aptitude-tests' && (
          <div>
            {!interactiveAptitude.isActive ? (
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
                  onClick={startInteractiveAptitudeTest}
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
            ) : interactiveAptitude.isCompleted ? (
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
                            stroke={interactiveAptitude.score >= 15 ? '#4caf50' : interactiveAptitude.score >= 10 ? '#ff9800' : '#f44336'}
                            strokeWidth="15"
                            strokeDasharray={`${(interactiveAptitude.score/20) * 408} 408`}
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
                            {interactiveAptitude.score}/20
                          </div>
                          <div style={{ fontSize: '16px', color: '#666' }}>
                            {Math.round((interactiveAptitude.score/20)*100)}%
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                        {interactiveAptitude.score >= 15 ? '🌟 Excellent!' :
                         interactiveAptitude.score >= 10 ? '👍 Good Job!' :
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
                            height: `${Math.max(interactiveAptitude.score * 5, 10)}px`,
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
                            {interactiveAptitude.score}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Correct</div>
                        </div>

                        {/* Incorrect answers bar */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '40px',
                            height: `${Math.max((20 - interactiveAptitude.score) * 5, 10)}px`,
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
                            {20 - interactiveAptitude.score}
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
                    {Object.entries(interactiveAptitude.answers.reduce((acc, answer) => {
                      if (!acc[answer.category]) {
                        acc[answer.category] = { correct: 0, total: 0 };
                      }
                      acc[answer.category].total++;
                      if (answer.isCorrect) {
                        acc[answer.category].correct++;
                      }
                      return acc;
                    }, {})).map(([category, stats]) => (
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
                    onClick={() => setInteractiveAptitude({ isActive: false, currentQuestion: 0, answers: [], score: 0, isCompleted: false, userAnswer: '', showResult: false, timeLeft: 60 })}
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
            ) : (
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
                    Question {interactiveAptitude.currentQuestion + 1} of {interactiveAptitudeQuestions.length}
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
                    width: `${((interactiveAptitude.currentQuestion + 1) / interactiveAptitudeQuestions.length) * 100}%`,
                    height: '100%',
                    background: '#007bff',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>

                {/* Question */}
                {(() => {
                  const currentQ = interactiveAptitudeQuestions[interactiveAptitude.currentQuestion];
                  return (
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
                            onClick={() => setInteractiveAptitude(prev => ({ ...prev, userAnswer: index.toString() }))}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '15px 20px',
                              background: interactiveAptitude.userAnswer === index.toString() ? '#e3f2fd' : 'white',
                              border: '2px solid',
                              borderColor: interactiveAptitude.userAnswer === index.toString() ? '#007bff' : '#ddd',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontSize: '16px',
                              fontWeight: interactiveAptitude.userAnswer === index.toString() ? 'bold' : 'normal'
                            }}
                          >
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: interactiveAptitude.userAnswer === index.toString() ? '#007bff' : '#f0f0f0',
                              color: interactiveAptitude.userAnswer === index.toString() ? 'white' : '#666',
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
                  );
                })()}

                {/* Result Display with Charts */}
                {interactiveAptitude.showResult && (() => {
                  const currentQ = interactiveAptitudeQuestions[interactiveAptitude.currentQuestion];
                  const lastAnswer = interactiveAptitude.answers[interactiveAptitude.answers.length - 1];
                  const isCorrect = lastAnswer?.isCorrect;

                  // Calculate current progress for charts
                  const totalAnswered = interactiveAptitude.answers.length;
                  const correctAnswers = interactiveAptitude.answers.filter(a => a.isCorrect).length;
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
                  {!interactiveAptitude.showResult ? (
                    <button
                      onClick={submitInteractiveAnswer}
                      disabled={!interactiveAptitude.userAnswer}
                      style={{
                        background: interactiveAptitude.userAnswer ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: interactiveAptitude.userAnswer ? 'pointer' : 'not-allowed',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✓ Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={nextInteractiveQuestion}
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
                      {interactiveAptitude.currentQuestion < interactiveAptitudeQuestions.length - 1 ? '➡️ Next Question' : '🏁 Finish Test'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resume-templates' && (
          <div>
            {!resumeGenerator.isActive ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>📄 AI Resume Generator</h2>
                <p>Create a professional resume with ATS scoring in minutes</p>
                <div style={{
                  background: '#f8f9fa',
                  padding: '30px',
                  borderRadius: '15px',
                  margin: '20px 0',
                  textAlign: 'left'
                }}>
                  <h3>✨ Features:</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
                      <h4>🎯 Smart Form</h4>
                      <p>Fill in your details with guided sections for all resume components</p>
                    </div>
                    <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px' }}>
                      <h4>📊 ATS Scoring</h4>
                      <p>Get instant ATS compatibility score with improvement suggestions</p>
                    </div>
                    <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
                      <h4>📱 Professional Design</h4>
                      <p>Clean, modern template optimized for both ATS and human readers</p>
                    </div>
                    <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
                      <h4>💾 Instant Download</h4>
                      <p>Download your resume as HTML/PDF ready for job applications</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <h4>📋 Resume Sections Included:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '15px' }}>
                      {['Contact Info', 'Career Objective', 'Area of Interest', 'Experience', 'Internships', 'Education', 'Technical Skills', 'Academic Projects', 'Personal Projects', 'Training & Workshops', 'Certifications', 'Achievements', 'Extracurricular', 'Languages', 'Interests'].map(section => (
                        <span key={section} style={{
                          background: '#007bff',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={startResumeGenerator}
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
                  🚀 Create My Resume
                </button>
              </div>
            ) : resumeGenerator.currentStep === 'form' ? (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>📝 Resume Builder</h2>
                  <button
                    onClick={() => setResumeGenerator(prev => ({ ...prev, isActive: false }))}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}>
                  {/* Personal Information */}
                  <h3>👤 Personal Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={resumeGenerator.formData.fullName}
                      onChange={(e) => updateResumeFormData('fullName', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={resumeGenerator.formData.email}
                      onChange={(e) => updateResumeFormData('email', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={resumeGenerator.formData.phone}
                      onChange={(e) => updateResumeFormData('phone', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Address *"
                      value={resumeGenerator.formData.address}
                      onChange={(e) => updateResumeFormData('address', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="LinkedIn Profile"
                      value={resumeGenerator.formData.linkedIn}
                      onChange={(e) => updateResumeFormData('linkedIn', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Portfolio Website"
                      value={resumeGenerator.formData.portfolio}
                      onChange={(e) => updateResumeFormData('portfolio', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  </div>

                  {/* Professional Summary */}
                  <h3>🎯 Professional Summary/Objective</h3>
                  <textarea
                    placeholder="Write a compelling professional summary or career objective (2-3 sentences)"
                    value={resumeGenerator.formData.objective}
                    onChange={(e) => updateResumeFormData('objective', e.target.value)}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      marginBottom: '20px',
                      resize: 'vertical'
                    }}
                  />

                  {/* Career Objective (for freshers) */}
                  <h3>🚀 Career Objective (For Freshers)</h3>
                  <textarea
                    placeholder="Describe your career goals and aspirations as a fresher"
                    value={resumeGenerator.formData.careerObjective}
                    onChange={(e) => updateResumeFormData('careerObjective', e.target.value)}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      marginBottom: '20px',
                      resize: 'vertical'
                    }}
                  />

                  {/* Area of Interest */}
                  <h3>🎯 Area of Interest</h3>
                  <textarea
                    placeholder="Mention your areas of interest (e.g., Web Development, Machine Learning, Data Science, Mobile App Development, etc.)"
                    value={resumeGenerator.formData.areaOfInterest}
                    onChange={(e) => updateResumeFormData('areaOfInterest', e.target.value)}
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      marginBottom: '20px',
                      resize: 'vertical'
                    }}
                  />

                  {/* Experience */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>💼 Work Experience</h3>
                    <button
                      onClick={() => addArrayItem('experience', { company: '', position: '', duration: '', description: '' })}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      + Add Experience
                    </button>
                  </div>
                  {resumeGenerator.formData.experience.map((exp, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      border: '1px solid #ddd'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4>Experience {index + 1}</h4>
                        {resumeGenerator.formData.experience.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('experience', index)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={exp.company}
                          onChange={(e) => updateResumeFormData('experience', e.target.value, index, 'company')}
                          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={exp.position}
                          onChange={(e) => updateResumeFormData('experience', e.target.value, index, 'position')}
                          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Duration (e.g., Jan 2020 - Present)"
                        value={exp.duration}
                        onChange={(e) => updateResumeFormData('experience', e.target.value, index, 'duration')}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          marginBottom: '10px'
                        }}
                      />
                      <textarea
                        placeholder="Job description and achievements"
                        value={exp.description}
                        onChange={(e) => updateResumeFormData('experience', e.target.value, index, 'description')}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  ))}

                  {/* Internships Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                    <h3>🎓 Internships</h3>
                    <button
                      onClick={() => addArrayItem('internships', { company: '', position: '', duration: '', description: '', technologies: '' })}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      + Add Internship
                    </button>
                  </div>
                  {resumeGenerator.formData.internships.map((intern, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      border: '1px solid #ddd'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4>Internship {index + 1}</h4>
                        {resumeGenerator.formData.internships.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('internships', index)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={intern.company}
                          onChange={(e) => updateResumeFormData('internships', e.target.value, index, 'company')}
                          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        <input
                          type="text"
                          placeholder="Position/Role"
                          value={intern.position}
                          onChange={(e) => updateResumeFormData('internships', e.target.value, index, 'position')}
                          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Duration (e.g., Summer 2023)"
                        value={intern.duration}
                        onChange={(e) => updateResumeFormData('internships', e.target.value, index, 'duration')}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          marginBottom: '10px'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Technologies Used"
                        value={intern.technologies}
                        onChange={(e) => updateResumeFormData('internships', e.target.value, index, 'technologies')}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          marginBottom: '10px'
                        }}
                      />
                      <textarea
                        placeholder="Internship description and learning outcomes"
                        value={intern.description}
                        onChange={(e) => updateResumeFormData('internships', e.target.value, index, 'description')}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  ))}

                  {/* Technical Proficiency Section */}
                  <h3 style={{ marginTop: '30px' }}>🛠️ Technical Proficiency</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <input
                      type="text"
                      placeholder="Programming Languages (e.g., Java, Python, JavaScript)"
                      value={resumeGenerator.formData.programmingLanguages}
                      onChange={(e) => updateResumeFormData('programmingLanguages', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Frameworks & Libraries (e.g., React, Spring Boot, Django)"
                      value={resumeGenerator.formData.frameworks}
                      onChange={(e) => updateResumeFormData('frameworks', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Databases (e.g., MySQL, MongoDB, PostgreSQL)"
                      value={resumeGenerator.formData.databases}
                      onChange={(e) => updateResumeFormData('databases', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Tools & Technologies (e.g., Git, Docker, AWS)"
                      value={resumeGenerator.formData.tools}
                      onChange={(e) => updateResumeFormData('tools', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Operating Systems (e.g., Windows, Linux, macOS)"
                      value={resumeGenerator.formData.operatingSystems}
                      onChange={(e) => updateResumeFormData('operatingSystems', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Other Technical Skills"
                      value={resumeGenerator.formData.technicalSkills}
                      onChange={(e) => updateResumeFormData('technicalSkills', e.target.value)}
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Soft Skills (e.g., Communication, Leadership, Problem Solving)"
                    value={resumeGenerator.formData.softSkills}
                    onChange={(e) => updateResumeFormData('softSkills', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      marginBottom: '20px'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={generateResume}
                    disabled={resumeGenerator.isGenerating || !resumeGenerator.formData.fullName || !resumeGenerator.formData.email}
                    style={{
                      background: resumeGenerator.isGenerating ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '15px 30px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: resumeGenerator.isGenerating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resumeGenerator.isGenerating ? '⏳ Generating...' : '🎨 Generate Resume'}
                  </button>
                </div>
              </div>
            ) : resumeGenerator.currentStep === 'preview' ? (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>👀 Resume Preview</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setResumeGenerator(prev => ({ ...prev, currentStep: 'form' }))}
                      style={{
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      ← Edit
                    </button>
                    <button
                      onClick={calculateATSScore}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      📊 Check ATS Score
                    </button>
                    <button
                      onClick={downloadResume}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      📥 Download
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: resumeGenerator.generatedResume }} />
                </div>
              </div>
            ) : resumeGenerator.currentStep === 'ats' ? (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>📊 ATS Score Analysis</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setResumeGenerator(prev => ({ ...prev, currentStep: 'preview' }))}
                      style={{
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to Preview
                    </button>
                    <button
                      onClick={downloadResume}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      📥 Download Resume
                    </button>
                  </div>
                </div>

                {/* ATS Score Display */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '30px',
                  borderRadius: '15px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <h3>🎯 Your ATS Compatibility Score</h3>

                  {/* Large Score Circle */}
                  <div style={{ position: 'relative', width: '150px', height: '150px', margin: '20px auto' }}>
                    <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="75"
                        cy="75"
                        r="65"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="15"
                      />
                      <circle
                        cx="75"
                        cy="75"
                        r="65"
                        fill="none"
                        stroke={resumeGenerator.atsScore.score >= 80 ? '#4caf50' : resumeGenerator.atsScore.score >= 60 ? '#ff9800' : '#f44336'}
                        strokeWidth="15"
                        strokeDasharray={`${(resumeGenerator.atsScore.score/100) * 408} 408`}
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
                      <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        {resumeGenerator.atsScore.score}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        ATS Score
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    {resumeGenerator.atsScore.score >= 80 ? '🌟 Excellent! ATS-Friendly' :
                     resumeGenerator.atsScore.score >= 60 ? '👍 Good, Room for Improvement' :
                     '📚 Needs Improvement'}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  border: '1px solid #ddd'
                }}>
                  <h4>📈 Score Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    {Object.entries(resumeGenerator.atsScore.breakdown).map(([category, score]) => (
                      <div key={category} style={{
                        background: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <h5 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </h5>
                        <div style={{
                          width: '100%',
                          height: '10px',
                          background: '#e0e0e0',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          marginBottom: '5px'
                        }}>
                          <div style={{
                            width: `${(score/25)*100}%`,
                            height: '100%',
                            background: score >= 20 ? '#4caf50' : score >= 10 ? '#ff9800' : '#f44336'
                          }}></div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          {score}/25 points
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {resumeGenerator.atsScore.recommendations.length > 0 && (
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    padding: '20px',
                    borderRadius: '10px'
                  }}>
                    <h4>💡 Recommendations for Improvement</h4>
                    <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                      {resumeGenerator.atsScore.recommendations.map((rec, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'interview-prep' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🗣️ Complete Interview Preparation Guide</h2>

            {/* Interview Preparation Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>

              {/* Professional Appearance & Grooming */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#007bff', marginBottom: '20px' }}>👔 Professional Appearance & Grooming</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🧑‍💼 For Men:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Attire:</strong> Well-fitted suit (navy/charcoal), crisp shirt, conservative tie</li>
                    <li><strong>Grooming:</strong> Clean-shaven or well-trimmed beard, neat haircut</li>
                    <li><strong>Accessories:</strong> Minimal jewelry, professional watch, polished shoes</li>
                    <li><strong>Hygiene:</strong> Fresh breath, light cologne, clean nails</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>👩‍💼 For Women:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Attire:</strong> Professional suit/blazer, modest neckline, knee-length skirt/pants</li>
                    <li><strong>Grooming:</strong> Professional hairstyle, subtle makeup, manicured nails</li>
                    <li><strong>Accessories:</strong> Minimal jewelry, professional bag, closed-toe shoes</li>
                    <li><strong>Colors:</strong> Navy, black, gray, or other conservative colors</li>
                  </ul>
                </div>

                <div style={{
                  background: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>💡 Pro Tips:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Dress one level above the company's dress code</li>
                    <li>Ensure clothes are wrinkle-free and properly fitted</li>
                    <li>Carry a portfolio/folder for documents</li>
                    <li>Arrive 10-15 minutes early</li>
                  </ul>
                </div>
              </div>

              {/* Body Language & Communication */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#28a745', marginBottom: '20px' }}>🤝 Body Language & Communication</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>📢 Verbal Communication:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Tone:</strong> Confident, enthusiastic, and professional</li>
                    <li><strong>Pace:</strong> Speak clearly and at moderate speed</li>
                    <li><strong>Volume:</strong> Audible but not too loud</li>
                    <li><strong>Language:</strong> Avoid slang, use professional vocabulary</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🎭 Non-Verbal Communication:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Eye Contact:</strong> Maintain 70-80% eye contact</li>
                    <li><strong>Handshake:</strong> Firm, confident, 2-3 seconds</li>
                    <li><strong>Posture:</strong> Sit straight, lean slightly forward</li>
                    <li><strong>Gestures:</strong> Natural hand movements, avoid fidgeting</li>
                  </ul>
                </div>

                <div style={{
                  background: '#d4edda',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>✅ Do's:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Smile genuinely and show enthusiasm</li>
                    <li>Listen actively and ask thoughtful questions</li>
                    <li>Use the interviewer's name during conversation</li>
                    <li>Show confidence without being arrogant</li>
                  </ul>
                </div>
              </div>

              {/* Interview Questions & Answers */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>❓ Common Interview Questions</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🎯 Behavioral Questions:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                    <li>"Tell me about yourself"</li>
                    <li>"Why do you want to work here?"</li>
                    <li>"What are your strengths and weaknesses?"</li>
                    <li>"Describe a challenging situation you faced"</li>
                    <li>"Where do you see yourself in 5 years?"</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>💻 Technical Questions:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                    <li>Programming concepts and problem-solving</li>
                    <li>System design and architecture</li>
                    <li>Database and data structure questions</li>
                    <li>Project-specific technical details</li>
                    <li>Industry trends and technologies</li>
                  </ul>
                </div>

                <div style={{
                  background: '#fff3cd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>📝 STAR Method:</h5>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    <strong>S</strong>ituation → <strong>T</strong>ask → <strong>A</strong>ction → <strong>R</strong>esult<br/>
                    Use this framework for behavioral questions
                  </p>
                </div>
              </div>

              {/* Pre-Interview Preparation */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#6f42c1', marginBottom: '20px' }}>📋 Pre-Interview Checklist</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🔍 Research & Preparation:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Company Research:</strong> Mission, values, recent news, competitors</li>
                    <li><strong>Role Understanding:</strong> Job description, requirements, responsibilities</li>
                    <li><strong>Interviewer Research:</strong> LinkedIn profiles, background</li>
                    <li><strong>Portfolio Preparation:</strong> Projects, achievements, certificates</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>📄 Documents to Carry:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Multiple copies of resume</li>
                    <li>Portfolio with project details</li>
                    <li>Certificates and transcripts</li>
                    <li>Reference letters</li>
                    <li>Notepad and pen</li>
                  </ul>
                </div>

                <div style={{
                  background: '#e2e3e5',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>⏰ Day Before Interview:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Confirm interview time and location</li>
                    <li>Plan your route and transportation</li>
                    <li>Prepare clothes and documents</li>
                    <li>Get adequate sleep (7-8 hours)</li>
                  </ul>
                </div>
              </div>

              {/* Post-Interview Etiquette */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#fd7e14', marginBottom: '20px' }}>📧 Post-Interview Follow-up</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>✉️ Thank You Email:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Timing:</strong> Send within 24 hours</li>
                    <li><strong>Content:</strong> Thank for time, reiterate interest</li>
                    <li><strong>Personalization:</strong> Reference specific conversation points</li>
                    <li><strong>Professional:</strong> Proper grammar and formatting</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>📞 Follow-up Strategy:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Wait for promised timeline before following up</li>
                    <li>Send polite follow-up after 1-2 weeks</li>
                    <li>Maintain professional tone throughout</li>
                    <li>Express continued interest in the role</li>
                  </ul>
                </div>

                <div style={{
                  background: '#d1ecf1',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>📝 Sample Thank You Note:</h5>
                  <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic' }}>
                    "Dear [Interviewer Name], Thank you for taking the time to discuss the [Position] role with me today.
                    I enjoyed learning about [specific topic discussed] and am excited about the opportunity to contribute to [Company Name].
                    I look forward to hearing about the next steps. Best regards, [Your Name]"
                  </p>
                </div>
              </div>

              {/* Virtual Interview Tips */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#20c997', marginBottom: '20px' }}>💻 Virtual Interview Excellence</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🎥 Technical Setup:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Camera:</strong> Eye-level, stable, good quality</li>
                    <li><strong>Lighting:</strong> Natural light facing you, avoid backlighting</li>
                    <li><strong>Audio:</strong> Test microphone, use headphones if needed</li>
                    <li><strong>Internet:</strong> Stable connection, backup plan ready</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🏠 Environment Setup:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Background:</strong> Clean, professional, or virtual background</li>
                    <li><strong>Noise:</strong> Quiet space, inform family/roommates</li>
                    <li><strong>Distractions:</strong> Close unnecessary apps, silence phone</li>
                    <li><strong>Backup:</strong> Have phone ready as backup device</li>
                  </ul>
                </div>

                <div style={{
                  background: '#f0f9ff',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>🎯 Virtual Interview Best Practices:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Test technology 30 minutes before interview</li>
                    <li>Look at camera, not screen, when speaking</li>
                    <li>Keep water nearby and take small sips if needed</li>
                    <li>Have resume and notes easily accessible</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Reference Cards */}
            <div style={{
              background: '#343a40',
              color: 'white',
              padding: '25px',
              borderRadius: '15px',
              marginTop: '30px',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '20px' }}>🎯 Quick Reference: Interview Success Formula</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#ffc107' }}>Before Interview</h4>
                  <p style={{ fontSize: '14px' }}>Research + Prepare + Practice + Professional Attire</p>
                </div>
                <div>
                  <h4 style={{ color: '#28a745' }}>During Interview</h4>
                  <p style={{ fontSize: '14px' }}>Confidence + Eye Contact + Active Listening + STAR Method</p>
                </div>
                <div>
                  <h4 style={{ color: '#17a2b8' }}>After Interview</h4>
                  <p style={{ fontSize: '14px' }}>Thank You Email + Follow-up + Patience + Professionalism</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company-prep' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🏢 Dream Company Preparation Guide</h2>

            {/* Company Research Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>

              {/* Company Research Fundamentals */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#007bff', marginBottom: '20px' }}>🔍 Company Research Essentials</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🏢 Basic Company Information:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Company History:</strong> Founding year, founders, major milestones</li>
                    <li><strong>Mission & Vision:</strong> Core values, company purpose</li>
                    <li><strong>Business Model:</strong> How they make money, key products/services</li>
                    <li><strong>Company Size:</strong> Number of employees, global presence</li>
                    <li><strong>Financial Health:</strong> Revenue, growth, recent funding</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>📊 Market Position:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Industry Standing:</strong> Market leader, challenger, or niche player</li>
                    <li><strong>Competitors:</strong> Main competitors and competitive advantages</li>
                    <li><strong>Market Trends:</strong> Industry growth, challenges, opportunities</li>
                    <li><strong>Recent News:</strong> Latest developments, partnerships, acquisitions</li>
                  </ul>
                </div>

                <div style={{
                  background: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>🌐 Research Sources:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Company website (About Us, Careers, News)</li>
                    <li>LinkedIn company page and employee profiles</li>
                    <li>Glassdoor reviews and salary information</li>
                    <li>Recent news articles and press releases</li>
                  </ul>
                </div>
              </div>

              {/* Company Culture & Values */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#28a745', marginBottom: '20px' }}>🎭 Company Culture & Values</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🌟 Cultural Elements to Research:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Work Environment:</strong> Office culture, remote work policies</li>
                    <li><strong>Team Dynamics:</strong> Collaboration style, hierarchy structure</li>
                    <li><strong>Growth Opportunities:</strong> Career development, training programs</li>
                    <li><strong>Work-Life Balance:</strong> Flexible hours, benefits, wellness programs</li>
                    <li><strong>Diversity & Inclusion:</strong> Company initiatives and commitments</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>💬 Employee Insights:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Glassdoor Reviews:</strong> Current/former employee experiences</li>
                    <li><strong>LinkedIn Posts:</strong> Employee achievements and company updates</li>
                    <li><strong>Company Blog:</strong> Employee spotlights and culture stories</li>
                    <li><strong>Social Media:</strong> Company social media presence and engagement</li>
                  </ul>
                </div>

                <div style={{
                  background: '#d4edda',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>🎯 Culture Fit Questions to Prepare:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>"What attracted you to this company's culture?"</li>
                    <li>"How do you embody the company values?"</li>
                    <li>"What excites you about working here?"</li>
                    <li>"How do you see yourself contributing to the team?"</li>
                  </ul>
                </div>
              </div>

              {/* Role-Specific Preparation */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>💼 Role-Specific Research</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>📋 Job Analysis:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Job Description:</strong> Key responsibilities and requirements</li>
                    <li><strong>Required Skills:</strong> Technical and soft skills needed</li>
                    <li><strong>Experience Level:</strong> Years of experience, education requirements</li>
                    <li><strong>Team Structure:</strong> Who you'll work with, reporting structure</li>
                    <li><strong>Growth Path:</strong> Career progression opportunities</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🎯 Skills Alignment:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Technical Match:</strong> How your skills align with requirements</li>
                    <li><strong>Experience Relevance:</strong> Similar projects or roles</li>
                    <li><strong>Learning Gaps:</strong> Skills you need to develop</li>
                    <li><strong>Value Proposition:</strong> Unique value you bring to the role</li>
                  </ul>
                </div>

                <div style={{
                  background: '#fff3cd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>📝 Preparation Strategy:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Map your experience to job requirements</li>
                    <li>Prepare specific examples using STAR method</li>
                    <li>Research similar roles in the company</li>
                    <li>Understand the team's current projects</li>
                  </ul>
                </div>
              </div>

              {/* Interview Process Research */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#6f42c1', marginBottom: '20px' }}>🗣️ Interview Process Intelligence</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>📊 Interview Structure:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Number of Rounds:</strong> Screening, technical, behavioral, final</li>
                    <li><strong>Interview Format:</strong> Phone, video, in-person, panel</li>
                    <li><strong>Duration:</strong> Time allocated for each round</li>
                    <li><strong>Interviewers:</strong> HR, hiring manager, team members, executives</li>
                    <li><strong>Assessment Methods:</strong> Coding tests, case studies, presentations</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🎯 Common Question Types:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Technical Questions:</strong> Role-specific technical challenges</li>
                    <li><strong>Behavioral Questions:</strong> Past experience and problem-solving</li>
                    <li><strong>Culture Fit:</strong> Alignment with company values</li>
                    <li><strong>Situational Questions:</strong> Hypothetical scenarios</li>
                  </ul>
                </div>

                <div style={{
                  background: '#f0f9ff',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>🔍 Research Sources:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Glassdoor interview experiences</li>
                    <li>LeetCode company-specific questions</li>
                    <li>LinkedIn posts from recent hires</li>
                    <li>Company career page interview tips</li>
                  </ul>
                </div>
              </div>

              {/* Networking & Connections */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#fd7e14', marginBottom: '20px' }}>🤝 Networking & Insider Insights</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🌐 Building Connections:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>LinkedIn Networking:</strong> Connect with current employees</li>
                    <li><strong>Alumni Network:</strong> Reach out to school alumni at the company</li>
                    <li><strong>Industry Events:</strong> Attend company-sponsored events</li>
                    <li><strong>Informational Interviews:</strong> Request brief conversations</li>
                    <li><strong>Social Media:</strong> Engage with company content professionally</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>💬 Conversation Starters:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>"What do you enjoy most about working at [Company]?"</li>
                    <li>"How has your role evolved since joining?"</li>
                    <li>"What advice would you give to someone joining your team?"</li>
                    <li>"What are the biggest challenges facing the company?"</li>
                  </ul>
                </div>

                <div style={{
                  background: '#e2e3e5',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>📧 Networking Best Practices:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Personalize connection requests</li>
                    <li>Be respectful of people's time</li>
                    <li>Offer value in return when possible</li>
                    <li>Follow up with thank you messages</li>
                  </ul>
                </div>
              </div>

              {/* Salary & Compensation Research */}
              <div style={{
                background: '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#20c997', marginBottom: '20px' }}>💰 Compensation & Benefits Research</h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>💵 Salary Research:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Market Rate:</strong> Industry standard for similar roles</li>
                    <li><strong>Company Range:</strong> Specific salary ranges at the company</li>
                    <li><strong>Location Factor:</strong> Cost of living adjustments</li>
                    <li><strong>Experience Level:</strong> Compensation based on years of experience</li>
                    <li><strong>Total Compensation:</strong> Base salary + bonuses + equity</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px' }}>🎁 Benefits Package:</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>Health Insurance:</strong> Medical, dental, vision coverage</li>
                    <li><strong>Retirement Plans:</strong> 401(k) matching, pension plans</li>
                    <li><strong>Time Off:</strong> Vacation days, sick leave, personal time</li>
                    <li><strong>Professional Development:</strong> Training budget, conference attendance</li>
                    <li><strong>Perks:</strong> Gym membership, free meals, flexible hours</li>
                  </ul>
                </div>

                <div style={{
                  background: '#d1ecf1',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>📊 Research Tools:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Glassdoor salary reports</li>
                    <li>PayScale and Salary.com</li>
                    <li>LinkedIn salary insights</li>
                    <li>Levels.fyi (for tech companies)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Company Research Checklist */}
            <div style={{
              background: '#343a40',
              color: 'white',
              padding: '25px',
              borderRadius: '15px',
              marginTop: '30px'
            }}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>✅ Complete Company Research Checklist</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#ffc107', marginBottom: '15px' }}>📋 Basic Research</h4>
                  <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <li>✓ Company history and mission</li>
                    <li>✓ Products and services</li>
                    <li>✓ Recent news and updates</li>
                    <li>✓ Financial performance</li>
                    <li>✓ Market position</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#28a745', marginBottom: '15px' }}>🎭 Culture & People</h4>
                  <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <li>✓ Company values and culture</li>
                    <li>✓ Employee reviews</li>
                    <li>✓ Leadership team</li>
                    <li>✓ Diversity initiatives</li>
                    <li>✓ Work environment</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#17a2b8', marginBottom: '15px' }}>💼 Role & Interview</h4>
                  <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <li>✓ Job requirements analysis</li>
                    <li>✓ Interview process research</li>
                    <li>✓ Common interview questions</li>
                    <li>✓ Technical requirements</li>
                    <li>✓ Team structure</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>🤝 Networking & Prep</h4>
                  <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <li>✓ LinkedIn connections</li>
                    <li>✓ Informational interviews</li>
                    <li>✓ Salary research</li>
                    <li>✓ Questions to ask</li>
                    <li>✓ Follow-up strategy</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dream Company Action Plan */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '15px',
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '20px' }}>🎯 Your Dream Company Action Plan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
                  <h4>Week 1-2</h4>
                  <p style={{ fontSize: '14px' }}>Deep company research + Role analysis + Network building</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
                  <h4>Week 3-4</h4>
                  <p style={{ fontSize: '14px' }}>Interview prep + Mock interviews + Technical practice</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
                  <h4>Application</h4>
                  <p style={{ fontSize: '14px' }}>Tailored resume + Cover letter + Application submission</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
                  <h4>Follow-up</h4>
                  <p style={{ fontSize: '14px' }}>Thank you notes + Status updates + Continued networking</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'job-listings' && (
          <JobPortalSection
            jobListings={jobListings}
            onApplyToJob={applyToJob}
            appliedJobs={appliedJobs}
          />
        )}

        {/* Modal for additional information */}
        {showModal && selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">
                {selectedItem.title || selectedItem.companyName}
              </h3>
              <p className="modal-description">
                {selectedItem.description}
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => setShowModal(false)}
                  className="action-button action-button-secondary"
                >
                  Close
                </button>
                {selectedItem.title && (
                  <button
                    onClick={confirmStartTest}
                    className="action-button action-button-primary"
                  >
                    Start Test
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Job Application Modal */}
        {showApplicationModal && selectedJob && (
          <div className="modal-overlay">
            <div className="modal-content application-modal">
              <div className="modal-header">
                <h3 className="modal-title">Apply for {selectedJob.title}</h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="job-summary">
                  <div className="company-info">
                    <div className="company-logo">{selectedJob.company.charAt(0)}</div>
                    <div>
                      <h4>{selectedJob.title}</h4>
                      <p>{selectedJob.company} • {selectedJob.location}</p>
                    </div>
                  </div>
                  <div className="salary-info">
                    ₹{selectedJob.salary?.min?.toLocaleString()} - ₹{selectedJob.salary?.max?.toLocaleString()}
                  </div>
                </div>

                <form className="application-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="resume">Resume *</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="resume" className="file-upload-label">
                        <span className="upload-icon">📄</span>
                        {applicationForm.resume ? applicationForm.resume.name : 'Choose Resume File'}
                        <span className="upload-hint">PDF, DOC, DOCX (Max 5MB)</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                    <textarea
                      id="coverLetter"
                      value={applicationForm.coverLetter}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Write a brief cover letter..."
                      rows="4"
                    />
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="action-button action-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={submitJobApplication}
                  className="action-button action-button-success"
                  disabled={!applicationForm.email || !applicationForm.resume || isSubmitting}
                >
                  <span className="btn-icon">{isSubmitting ? '⏳' : '🚀'}</span>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className={`toast-notification ${toastType}`}>
            <div className="toast-content">
              <span className="toast-icon">
                {toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="toast-message">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPrep;
