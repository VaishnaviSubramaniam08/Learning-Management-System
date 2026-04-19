import React, { useState, useEffect } from 'react';
import axios from '../api';
import authService from '../services/AuthService';
import careerPrepService from '../services/CareerPrepService';

const CareerPrep = ({ user }) => {
  const [activeSection, setActiveSection] = useState('aptitude');
  const [loading, setLoading] = useState(true);
  const [aptitudeTests, setAptitudeTests] = useState([]);
  const [companyPreps, setCompanyPreps] = useState([]);
  const [resumeTemplates, setResumeTemplates] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [interviewPreps, setInterviewPreps] = useState([]);

  const careerSections = [
    {
      key: 'aptitude',
      title: 'Aptitude & Reasoning',
      subtitle: 'Practice Tests',
      icon: '🧠',
      color: '#ef4444'
    },
    {
      key: 'resume',
      title: 'Resume Building',
      subtitle: 'Templates & Tools',
      icon: '📄',
      color: '#3b82f6'
    },
    {
      key: 'interview',
      title: 'Interview Prep',
      subtitle: 'Mock Interviews & GD',
      icon: '🗣️',
      color: '#10b981'
    },
    {
      key: 'company',
      title: 'Company Specific',
      subtitle: 'Placement Preparation',
      icon: '🏢',
      color: '#8b5cf6'
    },
    {
      key: 'jobs',
      title: 'Jobs & Internships',
      subtitle: 'Opportunities',
      icon: '💼',
      color: '#f59e0b'
    }
  ];

  useEffect(() => {
    // Verify user authentication and permissions
    if (!authService.isAuthenticated()) {
      alert('❌ Please log in to access career preparation');
      window.location.href = '/login';
      return;
    }

    if (!authService.isStudent()) {
      alert('❌ Only students can access career preparation');
      return;
    }

    fetchCareerData();
  }, [activeSection]);

  // Real-time authentication monitoring
  useEffect(() => {
    const handleAuthChange = (event, userData) => {
      if (event === 'logout') {
        alert('🔐 Session expired. Please log in again.');
        window.location.href = '/login';
      }
    };

    authService.addListener(handleAuthChange);

    return () => {
      authService.removeListener(handleAuthChange);
    };
  }, []);

  const fetchCareerData = async () => {
    try {
      setLoading(true);

      // Verify authentication before fetching data
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      // Add user context to API calls
      const userProfile = authService.getUserProfile();
      console.log(`💼 Loading ${activeSection} data for student:`, userProfile.name);

      try {
        // Fetch data from service
        if (activeSection === 'aptitude') {
          const aptitudeData = await careerPrepService.getAptitudeTests();
          setAptitudeTests(aptitudeData);
        } 
        else if (activeSection === 'resume') {
          const resumeData = await careerPrepService.getResumeTemplates();
          setResumeTemplates(resumeData);
        } 
        else if (activeSection === 'interview') {
          const interviewData = await careerPrepService.getInterviewPreparations();
          setInterviewPreps(interviewData);
        } 
        else if (activeSection === 'company') {
          const companyData = await careerPrepService.getCompanyPreparations();
          setCompanyPreps(companyData);
        } 
        else if (activeSection === 'jobs') {
          const jobsData = await careerPrepService.getJobListings();
          setJobListings(jobsData);
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        console.log('Falling back to mock data');
        
        // Mock data for development (fallback)
        if (activeSection === 'aptitude') {
          const aptitudeData = [
            {
              id: 1,
              title: 'Quantitative Aptitude Test',
              description: 'Practice numerical ability, arithmetic reasoning, and data interpretation',
              questions: 50,
              duration: '60 minutes',
              difficulty: 'Medium',
              attempted: true,
              score: 42,
              maxScore: 50
            },
            {
              id: 2,
              title: 'Logical Reasoning Test',
              description: 'Practice logical puzzles, syllogisms, and analytical reasoning',
              questions: 30,
              duration: '45 minutes',
              difficulty: 'Hard',
              attempted: false,
              score: null,
              maxScore: 30
            },
            {
              id: 3,
              title: 'Verbal Ability Test',
              description: 'Practice vocabulary, grammar, reading comprehension, and verbal reasoning',
              questions: 40,
              duration: '50 minutes',
              difficulty: 'Medium',
              attempted: true,
              score: 35,
              maxScore: 40
            }
          ];
          setAptitudeTests(aptitudeData);
        } 
        
        else if (activeSection === 'resume') {
          const resumeData = [
            {
              id: 1,
              title: 'Modern Professional',
              description: 'Clean, professional template with modern styling',
              thumbnail: 'https://via.placeholder.com/150?text=Resume+1',
              sections: ['Education', 'Experience', 'Skills', 'Projects', 'Certifications'],
              popular: true
            },
            {
              id: 2,
              title: 'Technical Specialist',
              description: 'Focused on technical skills and projects',
              thumbnail: 'https://via.placeholder.com/150?text=Resume+2',
              sections: ['Skills', 'Projects', 'Experience', 'Education', 'Certifications'],
              popular: false
            },
            {
              id: 3,
              title: 'Creative Portfolio',
              description: 'Visual design with portfolio highlights',
              thumbnail: 'https://via.placeholder.com/150?text=Resume+3',
              sections: ['Portfolio', 'Skills', 'Experience', 'Education', 'References'],
              popular: false
            },
            {
              id: 4,
              title: 'ATS-Optimized',
              description: 'Designed to pass Applicant Tracking Systems',
              thumbnail: 'https://via.placeholder.com/150?text=Resume+4',
              sections: ['Experience', 'Skills', 'Education', 'Certifications', 'Projects'],
              popular: true
            }
          ];
          setResumeTemplates(resumeData);
        } 
        
        else if (activeSection === 'interview') {
          const interviewData = [
            {
              id: 1,
              title: 'Technical Interview Practice',
              type: 'Mock Interview',
              description: 'Practice common technical interview questions with AI feedback',
              duration: '30 minutes',
              difficulty: 'Medium',
              categories: ['Data Structures', 'Algorithms', 'System Design']
            },
            {
              id: 2,
              title: 'HR Interview Preparation',
              type: 'Mock Interview',
              description: 'Practice behavioral and situational questions',
              duration: '20 minutes',
              difficulty: 'Easy',
              categories: ['Self Introduction', 'Strengths/Weaknesses', 'Situational Questions']
            },
            {
              id: 3,
              title: 'Group Discussion Practice',
              type: 'Group Activity',
              description: 'Join a simulated group discussion on current topics',
              duration: '45 minutes',
              difficulty: 'Medium',
              categories: ['Current Affairs', 'Technical Topics', 'Business Cases']
            },
            {
              id: 4,
              title: 'Presentation Skills',
              type: 'Presentation',
              description: 'Practice technical presentations with feedback',
              duration: '15 minutes',
              difficulty: 'Hard',
              categories: ['Delivery', 'Content Organization', 'Visual Aids']
            }
          ];
          setInterviewPreps(interviewData);
        } 
        
        else if (activeSection === 'company') {
          const companyData = [
            {
              id: 1,
              name: 'TCS',
              logo: 'https://via.placeholder.com/50?text=TCS',
              description: 'Preparation material for TCS National Qualifier Test (NQT) and interviews',
              tests: ['Aptitude', 'Programming', 'English'],
              resources: ['Previous Papers', 'Interview Questions', 'Coding Challenges']
            },
            {
              id: 2,
              name: 'Infosys',
              logo: 'https://via.placeholder.com/50?text=Infosys',
              description: 'Preparation material for Infosys certification and interviews',
              tests: ['InfyTQ', 'Reasoning', 'Technical'],
              resources: ['Practice Tests', 'Interview Experiences', 'Coding Problems']
            },
            {
              id: 3,
              name: 'Wipro',
              logo: 'https://via.placeholder.com/50?text=Wipro',
              description: 'Preparation material for Wipro NLTH and interviews',
              tests: ['Aptitude', 'Logical', 'Coding'],
              resources: ['Sample Questions', 'Interview Tips', 'Technical MCQs']
            },
            {
              id: 4,
              name: 'Cognizant',
              logo: 'https://via.placeholder.com/50?text=Cognizant',
              description: 'Preparation material for Cognizant GenC and interviews',
              tests: ['Quantitative', 'Logical', 'Coding', 'English'],
              resources: ['Previous Year Papers', 'Interview Questions', 'Coding Challenges']
            }
          ];
          setCompanyPreps(companyData);
        } 
        
        else if (activeSection === 'jobs') {
          const jobsData = [
            {
              id: 1,
              title: 'Software Development Intern',
              company: 'TechCorp Solutions',
              location: 'Chennai',
              type: 'Internship',
              duration: '3 months',
              stipend: '₹15,000/month',
              skills: ['Java', 'Spring Boot', 'MySQL'],
              postedDate: '2024-07-25',
              deadline: '2024-08-10'
            },
            {
              id: 2,
              title: 'Frontend Developer',
              company: 'WebVista Technologies',
              location: 'Bangalore',
              type: 'Full-time',
              salary: '₹5-8 LPA',
              skills: ['React', 'JavaScript', 'CSS'],
              postedDate: '2024-07-27',
              deadline: '2024-08-15'
            },
            {
              id: 3,
              title: 'Data Science Intern',
              company: 'Analytics Insights',
              location: 'Remote',
              type: 'Internship',
              duration: '6 months',
              stipend: '₹20,000/month',
              skills: ['Python', 'Machine Learning', 'SQL'],
              postedDate: '2024-07-28',
              deadline: '2024-08-12'
            },
            {
              id: 4,
              title: 'Full Stack Developer',
              company: 'Innovate Systems',
              location: 'Hyderabad',
              type: 'Full-time',
              salary: '₹8-12 LPA',
              skills: ['Node.js', 'React', 'MongoDB'],
              postedDate: '2024-07-26',
              deadline: '2024-08-20'
            }
          ];
          setJobListings(jobsData);
        }
      }
    } catch (error) {
      console.error('Error fetching career data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAptitudeTest = async (testId) => {
    try {
      const attempt = await careerPrepService.startAptitudeTest(testId);
      alert(`Starting Aptitude Test ${testId}. This would redirect to the test interface.`);
      // In a real implementation, redirect to the test interface
      // window.location.href = `/aptitude-test/${testId}/attempt/${attempt.id}`;
    } catch (error) {
      console.error('Error starting aptitude test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  const handleUseResumeTemplate = async (templateId) => {
    try {
      const template = await careerPrepService.getResumeTemplateById(templateId);
      alert(`Using Resume Template ${templateId}. This would open the resume builder.`);
      // In a real implementation, redirect to the resume builder
      // window.location.href = `/resume-builder/${templateId}`;
    } catch (error) {
      console.error('Error loading resume template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

  const startInterviewPrep = async (prepId) => {
    try {
      const interviewData = await careerPrepService.getInterviewPreparation(prepId);
      alert(`Starting Interview Preparation ${prepId}. This would open the interview simulator.`);
      // In a real implementation, redirect to the interview simulator
      // window.location.href = `/interview-simulator/${prepId}`;
    } catch (error) {
      console.error('Error starting interview preparation:', error);
      alert('Failed to start interview preparation. Please try again.');
    }
  };

  const viewCompanyPrep = async (companyId) => {
    try {
      const companyData = await careerPrepService.getCompanyPreparation(companyId);
      alert(`Viewing preparation material for company ID ${companyId}.`);
      // In a real implementation, redirect to the company preparation page
      // window.location.href = `/company-prep/${companyId}`;
    } catch (error) {
      console.error('Error loading company preparation:', error);
      alert('Failed to load company preparation. Please try again.');
    }
  };

  const applyForJob = async (jobId) => {
    try {
      const jobData = await careerPrepService.getJobListing(jobId);
      alert(`Applying for job ID ${jobId}. This would open the application form.`);
      // In a real implementation, redirect to the job application form
      // window.location.href = `/job-application/${jobId}`;
    } catch (error) {
      console.error('Error loading job application:', error);
      alert('Failed to load job application. Please try again.');
    }
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const currentSection = careerSections.find(section => section.key === activeSection);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        💼 Loading career preparation data...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          💼 Career Preparation & Placement Support
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Comprehensive tools and resources to help you prepare for your dream career
        </p>
      </div>

      {/* Career Section Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px'
      }}>
        {careerSections.map(section => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            style={{
              background: activeSection === section.key ? section.color : 'white',
              color: activeSection === section.key ? 'white' : section.color,
              border: `2px solid ${section.color}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{section.icon}</div>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>{section.title}</div>
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.8,
              color: activeSection === section.key ? 'rgba(255,255,255,0.8)' : section.color
            }}>
              {section.subtitle}
            </div>
          </button>
        ))}
      </div>

      {/* Aptitude & Reasoning Tests */}
      {activeSection === 'aptitude' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `2px solid ${currentSection?.color}`
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: currentSection?.color,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>{currentSection?.icon}</span>
            Aptitude & Logical Reasoning Practice
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {aptitudeTests.map(test => (
              <div key={test.id} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>{test.title}</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
                    {test.description}
                  </p>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280' }}>
                    <span>⏱️ {test.duration}</span>
                    <span>❓ {test.questions} questions</span>
                    <span>🔄 Difficulty: {test.difficulty}</span>
                    {test.attempted && (
                      <span style={{ color: getScoreColor(test.score, test.maxScore) }}>
                        📊 Score: {test.score}/{test.maxScore}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <button
                    onClick={() => startAptitudeTest(test.id)}
                    style={{
                      background: currentSection?.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {test.attempted ? '🔄 Retake Test' : '🚀 Start Test'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Building */}
      {activeSection === 'resume' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `2px solid ${currentSection?.color}`
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: currentSection?.color,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>{currentSection?.icon}</span>
            Resume Building Tools & Templates
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {resumeTemplates.map(template => (
              <div key={template.id} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {template.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '-30px',
                    background: '#ef4444',
                    color: 'white',
                    padding: '4px 30px',
                    transform: 'rotate(45deg)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    POPULAR
                  </div>
                )}
                
                <img 
                  src={template.thumbnail} 
                  alt={template.title}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}
                />
                
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>{template.title}</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280', flex: 1 }}>
                  {template.description}
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '14px', color: '#374151' }}>Sections:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {template.sections.map((section, idx) => (
                      <span key={idx} style={{
                        background: '#e5e7eb',
                        color: '#374151',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleUseResumeTemplate(template.id)}
                  style={{
                    background: currentSection?.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Preparation */}
      {activeSection === 'interview' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `2px solid ${currentSection?.color}`
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: currentSection?.color,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>{currentSection?.icon}</span>
            Interview & Group Discussion Practice
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {interviewPreps.map(prep => (
              <div key={prep.id} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>{prep.title}</h4>
                    <span style={{
                      background: prep.type === 'Mock Interview' ? '#3b82f6' : 
                                prep.type === 'Group Activity' ? '#10b981' : '#8b5cf6',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      {prep.type}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => startInterviewPrep(prep.id)}
                    style={{
                      background: currentSection?.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    Start Practice
                  </button>
                </div>
                
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
                  {prep.description}
                </p>
                
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  <span>⏱️ {prep.duration}</span>
                  <span>🔄 Difficulty: {prep.difficulty}</span>
                </div>
                
                <div>
                  <strong style={{ fontSize: '14px', color: '#374151' }}>Categories:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {prep.categories.map((category, idx) => (
                      <span key={idx} style={{
                        background: '#e5e7eb',
                        color: '#374151',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Specific Preparation */}
      {activeSection === 'company' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `2px solid ${currentSection?.color}`
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: currentSection?.color,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>{currentSection?.icon}</span>
            Company-Specific Placement Preparation
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {companyPreps.map(company => (
              <div key={company.id} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'contain',
                      marginRight: '16px'
                    }}
                  />
                  <h4 style={{ margin: 0, color: '#374151', fontSize: '18px' }}>{company.name}</h4>
                </div>
                
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                  {company.description}
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '14px', color: '#374151' }}>Test Components:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {company.tests.map((test, idx) => (
                      <span key={idx} style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '14px', color: '#374151' }}>Resources:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {company.resources.map((resource, idx) => (
                      <span key={idx} style={{
                        background: '#f0fdf4',
                        color: '#166534',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => viewCompanyPrep(company.id)}
                  style={{
                    background: currentSection?.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  View Preparation Material
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs & Internships */}
      {activeSection === 'jobs' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `2px solid ${currentSection?.color}`
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: currentSection?.color,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>{currentSection?.icon}</span>
            Internship & Job Listings
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {jobListings.map(job => (
              <div key={job.id} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: '0 12px 0 0', color: '#374151' }}>{job.title}</h4>
                    <span style={{
                      background: job.type === 'Internship' ? '#10b981' : '#3b82f6',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {job.type}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    <strong>{job.company}</strong> • {job.location}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    {job.type === 'Internship' ? (
                      <>
                        <span>⏱️ Duration: {job.duration}</span>
                        <span>💰 Stipend: {job.stipend}</span>
                      </>
                    ) : (
                      <span>💰 Salary: {job.salary}</span>
                    )}
                    <span>📅 Posted: {job.postedDate}</span>
                    <span>⏰ Deadline: {job.deadline}</span>
                  </div>
                  
                  <div>
                    <strong style={{ fontSize: '14px', color: '#374151' }}>Required Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {job.skills.map((skill, idx) => (
                        <span key={idx} style={{
                          background: '#e5e7eb',
                          color: '#374151',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    onClick={() => applyForJob(job.id)}
                    style={{
                      background: currentSection?.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPrep;