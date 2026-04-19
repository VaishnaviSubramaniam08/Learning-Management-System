import React, { useState, useEffect } from 'react';
import axios from '../api';
import './LanguageLearning.css';

const LanguageLearning = ({ user }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languages = [
    { 
      id: 'spanish', 
      name: 'Spanish', 
      flag: '🇪🇸', 
      level: 'A1-A2 Level', 
      color: '#e74c3c', 
      proficiency: 'Basic Proficiency',
      gradient: 'linear-gradient(135deg, #ff9a8b, #e74c3c)',
      icon: '¡Hola!',
      description: 'Learn the beautiful Spanish language',
      speakers: '500M+ speakers worldwide'
    },
    { 
      id: 'french', 
      name: 'French', 
      flag: '🇫🇷', 
      level: 'A1-A2 Level', 
      color: '#3498db', 
      proficiency: 'Basic Proficiency',
      gradient: 'linear-gradient(135deg, #74b9ff, #3498db)',
      icon: 'Bonjour!',
      description: 'Master the language of romance',
      speakers: '280M+ speakers worldwide'
    },
    { 
      id: 'german', 
      name: 'German', 
      flag: '🇩🇪', 
      level: 'B1-B2 Level', 
      color: '#f39c12', 
      proficiency: 'Intermediate',
      gradient: 'linear-gradient(135deg, #fdcb6e, #f39c12)',
      icon: 'Guten Tag!',
      description: 'Learn the language of innovation',
      speakers: '100M+ speakers worldwide'
    },
    { 
      id: 'portuguese', 
      name: 'Portuguese', 
      flag: '🇵🇹', 
      level: 'A1-A2 Level', 
      color: '#27ae60', 
      proficiency: 'Basic Proficiency',
      gradient: 'linear-gradient(135deg, #00b894, #27ae60)',
      icon: 'Olá!',
      description: 'Discover Brazilian & European Portuguese',
      speakers: '260M+ speakers worldwide'
    },

    { 
      id: 'japanese', 
      name: 'Japanese', 
      flag: '🇯🇵', 
      level: 'B2-C1 Level', 
      color: '#9b59b6', 
      proficiency: 'Advanced',
      gradient: 'linear-gradient(135deg, #a29bfe, #9b59b6)',
      icon: 'こんにちは',
      description: 'Master Japanese language & culture',
      speakers: '125M+ speakers worldwide'
    }
  ];

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem(`languageProgress_${user?.id}`);
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, [user]);

  const selectLanguage = async (language) => {
    setSelectedLanguage(language);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/language-learning/lessons/${language.id}`);
      setLessons(response.data);
      
      // Start with first lesson if no progress
      const progress = userProgress[language.id] || { completedLessons: [], currentLesson: 0 };
      const nextLessonIndex = progress.currentLesson || 0;
      
      if (response.data[nextLessonIndex]) {
        setCurrentLesson(response.data[nextLessonIndex]);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Failed to load lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuiz(null);
    setQuizAnswers({});
    setScore(0);
    setShowResult(false);
  };

  const startQuiz = () => {
    if (currentLesson && currentLesson.quiz) {
      setCurrentQuiz(currentLesson.quiz);
      setQuizAnswers({});
      setScore(0);
      setShowResult(false);
    }
  };

  const handleQuizAnswer = (questionIndex, selectedAnswer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedAnswer
    }));
  };

  const submitQuiz = async () => {
    if (!currentQuiz) return;

    setLoading(true);
    let correctAnswers = 0;

    currentQuiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    setScore(finalScore);

    try {
      // Submit quiz results to backend
      await axios.post('/language-learning/submit-quiz', {
        languageId: selectedLanguage.id,
        lessonId: currentLesson.id,
        score: finalScore,
        answers: quizAnswers,
        userId: user?.id
      });

      // Update progress
      const newProgress = { ...userProgress };
      if (!newProgress[selectedLanguage.id]) {
        newProgress[selectedLanguage.id] = { completedLessons: [], currentLesson: 0 };
      }

      if (finalScore >= 70) { // Pass threshold
        const lessonIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (!newProgress[selectedLanguage.id].completedLessons.includes(currentLesson.id)) {
          newProgress[selectedLanguage.id].completedLessons.push(currentLesson.id);
          newProgress[selectedLanguage.id].currentLesson = Math.min(lessonIndex + 1, lessons.length - 1);
        }
      }

      setUserProgress(newProgress);
      localStorage.setItem(`languageProgress_${user?.id}`, JSON.stringify(newProgress));
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  const nextLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < lessons.length) {
      setCurrentLesson(lessons[nextIndex]);
      setCurrentQuiz(null);
      setQuizAnswers({});
      setScore(0);
      setShowResult(false);
    }
  };

  const goBackToLanguages = () => {
    setSelectedLanguage(null);
    setCurrentLesson(null);
    setCurrentQuiz(null);
    setLessons([]);
  };

  const goBackToLessons = () => {
    setCurrentLesson(null);
    setCurrentQuiz(null);
    setQuizAnswers({});
    setScore(0);
    setShowResult(false);
  };

  const getCEFRLevel = (score) => {
    if (score >= 95) return { level: 'C2', title: 'Mastery', color: '#27ae60' };
    if (score >= 85) return { level: 'C1', title: 'Advanced', color: '#2980b9' };
    if (score >= 75) return { level: 'B2', title: 'Upper-Intermediate', color: '#3498db' };
    if (score >= 65) return { level: 'B1', title: 'Intermediate', color: '#f39c12' };
    if (score >= 55) return { level: 'A2', title: 'Elementary', color: '#e67e22' };
    return { level: 'A1', title: 'Beginner', color: '#e74c3c' };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#3498db' }}>📚</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Loading Content</h3>
          <p style={{ color: '#7f8c8d' }}>Preparing your language learning materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Content Unavailable</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>{error}</p>
          <button 
            onClick={() => setError(null)} 
            style={{ 
              padding: '12px 24px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
      {/* Professional Header */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e1e8ed',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '10px' }}>
          Professional Language Learning
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px', margin: '0' }}>
          Develop your language skills with structured learning and professional assessments
        </p>
      </div>

      {/* Enhanced Language Selection Grid */}
      {!selectedLanguage && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#2c3e50', 
              fontSize: '32px', 
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              Choose Your Language Journey
            </h2>
            <p style={{ 
              color: '#7f8c8d', 
              fontSize: '18px', 
              maxWidth: '600px', 
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Select from our professionally curated language programs. Each course includes structured lessons,
              interactive assessments, and CEFR-aligned proficiency evaluation.
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
            gap: '30px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {languages.map((language, index) => {
              const progress = userProgress[language.id] || { completedLessons: [] };
              const completionCount = progress.completedLessons.length;
              
              return (
                <div
                  key={language.id}
                  onClick={() => selectLanguage(language)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #e1e8ed',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    position: 'relative',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = language.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#e1e8ed';
                  }}
                >
                  {/* Gradient Header with Visual Elements */}
                  <div style={{
                    background: language.gradient,
                    height: '120px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {/* Decorative Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      opacity: 0.6
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      bottom: '-15px',
                      left: '-15px',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      opacity: 0.4
                    }}></div>
                    
                    {/* Flag and Greeting */}
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div style={{ 
                        fontSize: '48px', 
                        marginBottom: '8px',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}>
                        {language.flag}
                      </div>
                      <div style={{ 
                        color: 'white', 
                        fontSize: '18px', 
                        fontWeight: '600',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        fontFamily: language.id === 'japanese' ? 'serif' : language.id === 'hindi' ? 'sans-serif' : 'inherit'
                      }}>
                        {language.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div style={{ 
                    padding: '24px', 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      {/* Title and Level */}
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '24px', 
                          color: '#2c3e50', 
                          fontWeight: '700',
                          lineHeight: '1.2'
                        }}>
                          {language.name}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ 
                            background: language.color + '15',
                            color: language.color, 
                            padding: '6px 12px', 
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {language.level}
                          </span>
                          <span style={{
                            background: '#f8f9fa',
                            color: '#6c757d',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}>
                            {language.proficiency}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{ 
                        color: '#6c757d', 
                        fontSize: '15px', 
                        margin: '0 0 16px 0',
                        lineHeight: '1.5',
                        fontWeight: '400'
                      }}>
                        {language.description}
                      </p>

                      {/* Statistics */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '20px',
                        paddingTop: '12px',
                        borderTop: '1px solid #f1f3f4'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🌍</span>
                          <span style={{ color: '#7f8c8d', fontSize: '13px', fontWeight: '500' }}>
                            {language.speakers}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>📚</span>
                          <span style={{ color: '#7f8c8d', fontSize: '13px', fontWeight: '500' }}>
                            {completionCount} completed
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: language.color + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        🎯
                      </div>
                      
                      <button style={{
                        background: language.gradient,
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                      }}
                      >
                        Start Learning →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Information Section */}
          <div style={{
            marginTop: '60px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid #f1f3f4'
          }}>
            <h3 style={{ color: '#2c3e50', fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              Professional Language Assessment
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '30px',
              marginTop: '30px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#e8f5e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🎯
                </div>
                <h4 style={{ color: '#2c3e50', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  CEFR Aligned
                </h4>
                <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
                  All courses follow international CEFR standards (A1-C2) for accurate proficiency assessment
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#e8f4fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  📊
                </div>
                <h4 style={{ color: '#2c3e50', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Progress Tracking
                </h4>
                <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
                  Monitor your learning journey with detailed progress reports and skill assessments
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#fff3e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🏆
                </div>
                <h4 style={{ color: '#2c3e50', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Certification Ready
                </h4>
                <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
                  Prepare for official language certifications with our comprehensive training modules
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson List */}
      {selectedLanguage && !currentLesson && (
        <div>
          <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={goBackToLanguages} 
              style={{
                padding: '8px 16px',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '20px'
              }}
            >
              ← Back to Languages
            </button>
            <h2 style={{ color: '#2c3e50', margin: '0' }}>
              {selectedLanguage.flag} {selectedLanguage.name} Lessons
            </h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '20px'
          }}>
            {lessons.map((lesson, index) => {
              const progress = userProgress[selectedLanguage.id] || { completedLessons: [], currentLesson: 0 };
              const isCompleted = progress.completedLessons.includes(lesson.id);
              const isLocked = index > progress.currentLesson;
              
              return (
                <div
                  key={lesson.id}
                  onClick={() => !isLocked && startLesson(lesson)}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.6 : 1,
                    border: isCompleted ? '2px solid #27ae60' : '1px solid #e1e8ed',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{
                      background: isCompleted ? '#27ae60' : isLocked ? '#95a5a6' : '#3498db',
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginRight: '15px'
                    }}>
                      {isCompleted ? '✓' : isLocked ? '🔒' : index + 1}
                    </div>
                    <h3 style={{ margin: '0', color: '#2c3e50' }}>{lesson.title}</h3>
                  </div>
                  
                  <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '15px' }}>
                    {lesson.description}
                  </p>
                  
                  {!isLocked && (
                    <div style={{ 
                      color: '#3498db', 
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {isCompleted ? 'Review Lesson' : 'Start Lesson'} →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Content */}
      {currentLesson && !currentQuiz && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={goBackToLessons} 
              style={{
                padding: '8px 16px',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '20px'
              }}
            >
              ← Back to Lessons
            </button>
            <h2 style={{ color: '#2c3e50', margin: '0' }}>{currentLesson.title}</h2>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '30px',
            marginBottom: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e1e8ed'
          }}>
            <p style={{ color: '#7f8c8d', fontSize: '16px', marginBottom: '25px' }}>
              {currentLesson.description}
            </p>

            {/* Vocabulary Section */}
            {currentLesson.vocabulary && currentLesson.vocabulary.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ 
                  color: '#2c3e50', 
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: '600'
                }}>
                  📚 Vocabulary
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px' 
                }}>
                  {currentLesson.vocabulary.map((item, index) => (
                    <div key={index} style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'transform 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <strong style={{ 
                          color: '#2c3e50',
                          fontSize: '18px',
                          fontWeight: '700'
                        }}>
                          {item.word}
                        </strong>
                        
                        <div style={{
                          width: '40px',
                          height: '2px',
                          background: 'linear-gradient(90deg, #3498db, #2ecc71)',
                          borderRadius: '1px',
                          margin: '4px 0'
                        }}></div>
                        
                        <span style={{ 
                          color: '#6c757d',
                          fontSize: '16px',
                          fontWeight: '500'
                        }}>
                          {item.translation}
                        </span>
                        
                        {item.pronunciation && (
                          <span style={{ 
                            color: '#95a5a6', 
                            fontSize: '13px',
                            fontStyle: 'italic',
                            marginTop: '4px'
                          }}>
                            [{item.pronunciation}]
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phrases Section */}
            {currentLesson.phrases && currentLesson.phrases.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ 
                  color: '#2c3e50', 
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: '600'
                }}>
                  💬 Common Phrases
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '16px' 
                }}>
                  {currentLesson.phrases.map((item, index) => (
                    <div key={index} style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'transform 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <strong style={{ 
                          color: '#2c3e50',
                          fontSize: '17px',
                          fontWeight: '700',
                          lineHeight: '1.3'
                        }}>
                          {item.phrase}
                        </strong>
                        
                        <div style={{
                          width: '40px',
                          height: '2px',
                          background: 'linear-gradient(90deg, #e74c3c, #f39c12)',
                          borderRadius: '1px',
                          margin: '4px 0'
                        }}></div>
                        
                        <span style={{ 
                          color: '#6c757d',
                          fontSize: '16px',
                          fontWeight: '500',
                          lineHeight: '1.3'
                        }}>
                          {item.translation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Assessment Button Section */}
            <div style={{ 
              textAlign: 'center',
              marginTop: '50px',
              paddingTop: '30px',
              borderTop: '2px solid #f1f3f4'
            }}>
              <div style={{
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '3px',
                  borderRadius: '50px'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '50px',
                    padding: '15px 25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🎯</span>
                    <span style={{ 
                      color: '#2c3e50',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      Ready for Assessment?
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={startQuiz}
                style={{
                  padding: '18px 40px',
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(39, 174, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.3)';
                }}
              >
                <span style={{ marginRight: '8px' }}>📋</span>
                Take Assessment
              </button>
              
              <p style={{
                color: '#7f8c8d',
                fontSize: '14px',
                marginTop: '15px',
                fontStyle: 'italic'
              }}>
                Test your knowledge with our CEFR-aligned assessment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quiz/Assessment */}
      {currentQuiz && !showResult && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid #e1e8ed'
          }}>
            {/* Assessment Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px',
              paddingBottom: '20px',
              borderBottom: '2px solid #f1f3f4'
            }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '3px',
                borderRadius: '50px',
                marginBottom: '15px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '50px',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>📝</span>
                  <span style={{ 
                    color: '#2c3e50',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    CEFR Assessment
                  </span>
                </div>
              </div>
              <h2 style={{ 
                color: '#2c3e50', 
                margin: '0',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                {currentLesson.title} Assessment
              </h2>
              <p style={{
                color: '#7f8c8d',
                fontSize: '14px',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Answer all questions to receive your proficiency evaluation
              </p>
            </div>

            {/* Questions */}
            {currentQuiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} style={{
                marginBottom: '35px',
                padding: '30px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
              }}>
                {/* Question Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '25px',
                  gap: '15px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3498db, #2ecc71)',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {questionIndex + 1}
                  </div>
                  <h4 style={{ 
                    color: '#2c3e50', 
                    margin: '0',
                    fontSize: '18px',
                    fontWeight: '600',
                    lineHeight: '1.4',
                    flexGrow: 1
                  }}>
                    {question.question}
                  </h4>
                </div>
                
                {/* Options Grid */}
                <div style={{ 
                  display: 'grid', 
                  gap: '12px',
                  marginLeft: '47px' // Align with question text
                }}>
                  {question.options.map((option, optionIndex) => {
                    const isSelected = quizAnswers[questionIndex] === optionIndex;
                    const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                    
                    return (
                      <label key={optionIndex} style={{
                        padding: '16px 20px',
                        border: `2px solid ${isSelected ? '#3498db' : '#e9ecef'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        background: isSelected ? '#e8f4fd' : 'white',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 4px 12px rgba(52, 152, 219, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.borderColor = '#bdc3c7';
                          e.target.style.background = '#f8f9fa';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.background = 'white';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                      >
                        {/* Option Letter Circle */}
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? '#3498db' : '#ecf0f1',
                          color: isSelected ? 'white' : '#7f8c8d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          marginRight: '16px',
                          flexShrink: 0,
                          transition: 'all 0.2s ease'
                        }}>
                          {optionLetter}
                        </div>
                        
                        {/* Hidden Radio Input */}
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={optionIndex}
                          checked={isSelected}
                          onChange={() => handleQuizAnswer(questionIndex, optionIndex)}
                          style={{ display: 'none' }}
                        />
                        
                        {/* Option Text */}
                        <span style={{ 
                          color: '#2c3e50',
                          fontSize: '16px',
                          fontWeight: '500',
                          lineHeight: '1.4',
                          flexGrow: 1
                        }}>
                          {option}
                        </span>
                        
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div style={{
                            marginLeft: '12px',
                            color: '#3498db',
                            fontSize: '18px'
                          }}>
                            ✓
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Submit Button Section */}
            <div style={{ 
              textAlign: 'center',
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '2px solid #f1f3f4'
            }}>
              <div style={{
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: Object.keys(quizAnswers).length === currentQuiz.questions.length ? '#e8f5e8' : '#f8f9fa',
                  borderRadius: '25px',
                  border: `1px solid ${Object.keys(quizAnswers).length === currentQuiz.questions.length ? '#27ae60' : '#e9ecef'}`
                }}>
                  <span style={{
                    color: Object.keys(quizAnswers).length === currentQuiz.questions.length ? '#27ae60' : '#95a5a6',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {Object.keys(quizAnswers).length} of {currentQuiz.questions.length} questions answered
                  </span>
                </div>
              </div>

              <button
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length !== currentQuiz.questions.length}
                style={{
                  padding: '18px 40px',
                  background: Object.keys(quizAnswers).length === currentQuiz.questions.length 
                    ? 'linear-gradient(135deg, #27ae60, #2ecc71)' 
                    : '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: Object.keys(quizAnswers).length === currentQuiz.questions.length ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: Object.keys(quizAnswers).length === currentQuiz.questions.length 
                    ? '0 4px 15px rgba(39, 174, 96, 0.3)' 
                    : 'none',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: Object.keys(quizAnswers).length === currentQuiz.questions.length ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                  if (Object.keys(quizAnswers).length === currentQuiz.questions.length) {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(39, 174, 96, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (Object.keys(quizAnswers).length === currentQuiz.questions.length) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.3)';
                  }
                }}
              >
                <span style={{ marginRight: '8px' }}>📊</span>
                Submit Assessment
              </button>
              
              <p style={{
                color: '#7f8c8d',
                fontSize: '13px',
                marginTop: '15px',
                fontStyle: 'italic'
              }}>
                Your results will be evaluated according to CEFR standards
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Results */}
      {showResult && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e1e8ed'
          }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '30px' }}>Assessment Results</h2>
            
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: getCEFRLevel(score).color,
                marginBottom: '10px'
              }}>
                {score}%
              </div>
              
              <div style={{
                background: getCEFRLevel(score).color,
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                CEFR Level: {getCEFRLevel(score).level} - {getCEFRLevel(score).title}
              </div>
            </div>

            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
              {score >= 70 ? 
                'Congratulations! You have successfully completed this lesson.' : 
                'Please review the material and try again to achieve a passing score of 70%.'}
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={goBackToLessons}
                style={{
                  padding: '12px 24px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Back to Lessons
              </button>
              
              {score >= 70 && lessons.findIndex(l => l.id === currentLesson.id) < lessons.length - 1 && (
                <button
                  onClick={nextLesson}
                  style={{
                    padding: '12px 24px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Next Lesson
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageLearning;