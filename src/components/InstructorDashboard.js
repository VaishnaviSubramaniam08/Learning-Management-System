import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";
import "./InstructorDashboard.css";
import Scheduler from "./Scheduler";
import LiveSession from "./LiveSession";
import PerformanceTracking from "./PerformanceTracking";
import Certification from "./Certification";
import Contests from "./Contests";
import { InstructorAssignmentManager } from "./AssignmentManager";
import OfficeHours from "./OfficeHours";
import InstructorOfficeHours from "./InstructorOfficeHours";
import FileUploader from "./FileUploader";
import InstructorFileManager from "./InstructorFileManager";

import { Bar } from "react-chartjs-2";
import api from "../api";
import InstructorAssessmentTab from "./InstructorAssessmentTab";
import CourseManagement from "./CourseManagement";
import CertificateTemplateManager from "./CertificateTemplateManager";
import ZoomMeetingScheduler from "./ZoomMeetingScheduler";
import InstructorAttendanceManager from "./InstructorAttendanceManager";
import LanguageLearning from "./LanguageLearning";
import InstructorQuestionUpload from "./InstructorQuestionUpload";
import InstructorStudyMaterialUpload from "./InstructorStudyMaterialUpload";

const TABS = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'courses', label: 'Courses', icon: '📚' },
  { key: 'scheduler', label: 'Scheduler', icon: '📆' },
  { key: 'live', label: 'Live Class', icon: '📹' },
  { key: 'zoomMeetings', label: 'Zoom Meetings', icon: '💻' },
  { key: 'performance', label: 'Performance', icon: '📈' },
  { key: 'assessment', label: 'Assessment', icon: '📝' },
  { key: 'attendance', label: 'Attendance', icon: '🕒' },
  { key: 'certification', label: 'Certification', icon: '📄' },
  { key: 'contests', label: 'Contests', icon: '🏆' },
  { key: 'assignments', label: 'Assignments', icon: '📋' },
  { key: 'officeHours', label: 'Office Hours', icon: '🗓️' },
  { key: 'fileUpload', label: 'File Manager', icon: '📁' },
  { key: 'questionUpload', label: 'Question Papers', icon: '📄' },
  { key: 'studyMaterials', label: 'Study Materials', icon: '📚' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
  { key: 'languageLearning', label: 'Language Learning', icon: '🌍' },
];

const defaultCourseForm = {
  title: '',
  description: '',
  overview: 'Course overview and introduction',
  learningOutcomes: ['Learn fundamental concepts', 'Apply knowledge in practice'],
  category: '',
  modules: [],
  level: 'beginner',
  duration: 0,
  price: 0
};

const AttendanceGraph = ({ studentId }) => {
  const [data, setData] = useState([]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    let isMounted = true;
    const fetchData = () => {
      axios.get(`/attendance/student/${studentId}`)
        .then(res => { if (isMounted) setData(res.data); })
        .catch(() => { if (isMounted) setData([]); });
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds
    return () => { isMounted = false; clearInterval(interval); };
  }, [studentId]);

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: "Minutes Present",
        data: data.map(d => d.minutes),
        backgroundColor: "#764ba2"
      }
    ]
  };

  return (
    <div>
      <h3>Attendance Tracking (Real-Time)</h3>
      <Bar data={chartData} />
    </div>
  );
};

function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\\?v=|\\&v=)([^#\\&\\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const ModulePlayer = ({ module, onComplete }) => {
  const [playing, setPlaying] = useState(false);

  // Check if the videoUrl is a YouTube link
  const isYouTube = module.videoUrl && (module.videoUrl.includes('youtube.com') || module.videoUrl.includes('youtu.be'));
  const youTubeId = isYouTube ? extractYouTubeId(module.videoUrl) : null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>{module.title}</h3>
      <p>{module.description}</p>
      {!playing ? (
        <button onClick={() => setPlaying(true)}>Start Module</button>
      ) : (
        <>
          {isYouTube && youTubeId ? (
            <iframe
              width="640"
              height="360"
              src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Module Video"
              onEnded={onComplete}
            />
          ) : (
            <video
              width="640"
              controls
              autoPlay
              onEnded={onComplete}
            >
              <source src={module.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </>
      )}
    </div>
  );
};

// Add InstructorAssessmentTab component

function GradeForm({ submissionId }) {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitting(true);
    api.post(`/submission/${submissionId}/grade`, { grade, feedback })
      .then(() => window.location.reload())
      .catch(() => setSubmitting(false));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 4 }}>
      <input type="number" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Grade" required style={{ width: 60 }} />
      <input type="text" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback" />
      <button type="submit" disabled={submitting}>Submit</button>
    </form>
  );
}

function AssessmentSummary({ instructorId }) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Fetch count of pending submissions for this instructor
    api.get(`/submission/instructor/${instructorId}?status=Submitted`)
      .then(res => setPendingCount(res.data.length))
      .catch(() => setPendingCount(0));
  }, [instructorId]);

  return (
    <div style={{ margin: '12px 0', color: pendingCount > 0 ? 'red' : 'green' }}>
      {pendingCount > 0
        ? `You have ${pendingCount} submissions to grade!`
        : 'All assessments are graded.'}
    </div>
  );
}

// Helper: XP Bar
function XPBar({ xp, maxXP }) {
  const percent = Math.min(100, Math.round((xp / maxXP) * 100));
  return (
    <div style={{ background: "#eee", borderRadius: 8, height: 12, margin: "8px 0" }}>
      <div style={{
        width: `${percent}%`,
        background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
        height: "100%",
        borderRadius: 8,
        transition: "width 0.5s"
      }} />
    </div>
  );
}

function BadgeGallery({ badges }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
      {badges.map((b, i) => (
        <span key={i} title={b.name} style={{ fontSize: 28 }}>{b.icon}</span>
      ))}
    </div>
  );
}

// Helper: Certificate Preview
function CertificatePreview({ studentName, courseTitle, instructorName }) {
  return (
    <div style={{
      border: "2px solid #4dc0b5", borderRadius: 12, padding: 24, background: "#f9f9f9", marginTop: 16, textAlign: "center"
    }}>
      <h2 style={{ color: "#28a7a1" }}>Certificate of Completion</h2>
      <p>This certifies that</p>
      <h3>{studentName}</h3>
      <p>has successfully completed the course</p>
      <h4>{courseTitle}</h4>
      <p>Instructor: <b>{instructorName}</b></p>
      <img src="/signature.png" alt="Signature" style={{ height: 40, marginTop: 8 }} />
      <p>Date: {new Date().toLocaleDateString()}</p>
    </div>
  );
}

// Main Course Card Example
function CourseCard({ enrollment, studentName }) {
  const modules = enrollment.course.modules || [];
  const moduleProgress = enrollment.moduleProgress || [];
  const badges = enrollment.badges || [];
  const xp = enrollment.xp || 0;
  const maxXP = modules.length * 100; // Example: 100 XP per module
  const allModulesCompleted = modules.length > 0 && moduleProgress.every(mp => mp.completed);

  return (
    <div className="course-card" style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 32 }}>
      <h3>{enrollment.course.title}</h3>
      <XPBar xp={xp} maxXP={maxXP} />
      <BadgeGallery badges={badges} />
      <div>
        {modules.map((module, idx) => {
          const mp = moduleProgress[idx] || {};
          const locked = idx > 0 && !(moduleProgress[idx - 1]?.completed);
          return (
            <div key={module._id || idx} style={{
              marginBottom: 16,
              opacity: locked ? 0.5 : 1,
              pointerEvents: locked ? "none" : "auto",
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              background: locked ? "#f8f8f8" : "#fff"
            }}>
              <h4>
                {locked ? "🔒" : "🔓"} {module.title}
              </h4>
              <p>{module.description}</p>
              {mp.completed ? (
                <span style={{ color: "green", fontWeight: "bold" }}>Completed</span>
              ) : (
                <button disabled={locked}>Start Module</button>
              )}
            </div>
          );
        })}
      </div>
      {allModulesCompleted && (
        <CertificatePreview
          studentName={studentName}
          courseTitle={enrollment.course.title}
          instructorName={enrollment.course.instructorName || "Instructor"}
        />
      )}
    </div>
  );
}

// Example: Student Progress Table
function StudentProgressTable({ students, modules }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
      <thead>
        <tr>
          <th style={{ padding: 8 }}>Student</th>
          {modules.map((mod, idx) => (
            <th key={mod._id || idx} style={{ padding: 8 }}>{mod.title}</th>
          ))}
          <th style={{ padding: 8 }}>Quiz Scores</th>
        </tr>
      </thead>
      <tbody>
        {students.map(student => (
          <tr key={student.id}>
            <td style={{ padding: 8 }}>{student.name}</td>
            {modules.map((mod, idx) => {
              const mp = (student.moduleProgress || [])[idx] || {};
              return (
                <td key={mod._id || idx} style={{ padding: 8, textAlign: "center" }}>
                  {mp.completed ? "✅" : "❌"}
                </td>
              );
            })}
            <td style={{ padding: 8 }}>
              {(student.quizScores || []).join(", ")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Professional Language Assessment Component
const LanguageLearningGrid = ({ user, onLanguageSelect }) => {
  const languages = [
    { id: 'spanish', name: 'Spanish', flag: '🇪🇸', level: 'A1-A2 Level', color: '#2c3e50', proficiency: 'Basic Proficiency' },
    { id: 'french', name: 'French', flag: '🇫🇷', level: 'A1-A2 Level', color: '#34495e', proficiency: 'Basic Proficiency' },
    { id: 'german', name: 'German', flag: '🇩🇪', level: 'B1-B2 Level', color: '#2c3e50', proficiency: 'Intermediate' },
    { id: 'portuguese', name: 'Portuguese', flag: '🇵🇹', level: 'A1-A2 Level', color: '#34495e', proficiency: 'Basic Proficiency' },
    { id: 'hindi', name: 'हिंदी (Hindi)', flag: '🇮🇳', level: 'A1-A2 Level', color: '#2c3e50', proficiency: 'Basic Proficiency' },
    { id: 'japanese', name: 'Japanese', flag: '🇯🇵', level: 'B2-C1 Level', color: '#34495e', proficiency: 'Advanced' }
  ];

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#2c3e50', fontSize: '28px', marginBottom: '10px' }}>
          Professional Language Assessment
        </h2>
        <p style={{ color: '#7f8c8d', fontSize: '16px', lineHeight: '1.5' }}>
          Evaluate your language proficiency with standardized assessments. Select a language to begin your evaluation.
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px'
      }}>
        {languages.map(language => (
          <div
            key={language.id}
            onClick={() => onLanguageSelect(language)}
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '25px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e1e8ed',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.borderColor = '#3498db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#e1e8ed';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '32px', marginRight: '12px' }}>{language.flag}</span>
                <h3 style={{ margin: '0', fontSize: '20px', color: '#2c3e50', fontWeight: '600' }}>
                  {language.name}
                </h3>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <span style={{ 
                  background: '#ecf0f1', 
                  color: '#2c3e50', 
                  padding: '6px 12px', 
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {language.level}
                </span>
              </div>
              
              <p style={{ 
                color: '#7f8c8d', 
                fontSize: '14px', 
                margin: '0 0 15px 0',
                lineHeight: '1.4'
              }}>
                {language.proficiency} • Comprehensive vocabulary and grammar assessment
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingTop: '15px',
              borderTop: '1px solid #ecf0f1'
            }}>
              <span style={{ color: '#7f8c8d', fontSize: '13px' }}>
                📋 Assessment Available
              </span>
              <span style={{ 
                color: '#3498db', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Begin Test →
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        textAlign: 'center',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <p style={{ color: '#6c757d', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
          <strong>Assessment Information:</strong> Each test contains vocabulary, grammar, and comprehension questions. 
          Results will show your proficiency level according to international standards (CEFR).
        </p>
      </div>
    </div>
  );
};

// Professional Assessment Component
const LanguageQuiz = ({ language, onQuizComplete, onBack }) => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Fetch quiz questions for the selected language
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/language-learning/lessons/${language.id}`);
        if (response.data && response.data.length > 0) {
          // Get quiz from first lesson
          setCurrentQuiz(response.data[0].quiz);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
    
    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [language]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    if (!currentQuiz) return;
    
    let correctAnswers = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    onQuizComplete(score, correctAnswers, currentQuiz.questions.length, timeElapsed);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#3498db' }}>📋</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Loading Assessment</h3>
          <p style={{ color: '#7f8c8d' }}>Preparing your language proficiency test...</p>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Assessment Unavailable</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>
            The {language.name} assessment is currently not available.
          </p>
          <button 
            onClick={onBack} 
            style={{ 
              padding: '12px 24px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '25px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e1e8ed'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={onBack} 
            style={{ 
              padding: '8px 16px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Assessments
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#2c3e50', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '28px', marginRight: '10px' }}>{language.flag}</span>
              {language.name} Proficiency Assessment
            </h2>
            <p style={{ color: '#7f8c8d', margin: '5px 0 0 0', fontSize: '14px' }}>
              {language.level} • Professional Language Evaluation
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              background: '#ecf0f1',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              Time: {formatTime(timeElapsed)}
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
              Progress: {Object.keys(quizAnswers).length}/{currentQuiz.questions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ marginBottom: '30px' }}>
        {currentQuiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} style={{ 
            marginBottom: '25px', 
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e1e8ed',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ 
              background: '#f8f9fa',
              padding: '20px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ 
                  background: '#3498db',
                  color: 'white',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginRight: '12px'
                }}>
                  {questionIndex + 1}
                </span>
                <h4 style={{ margin: '0', color: '#2c3e50', fontSize: '16px', lineHeight: '1.4' }}>
                  {question.question}
                </h4>
              </div>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} style={{
                    padding: '15px',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: quizAnswers[questionIndex] === optionIndex ? '#e8f4fd' : 'white',
                    borderColor: quizAnswers[questionIndex] === optionIndex ? '#3498db' : '#e9ecef',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (quizAnswers[questionIndex] !== optionIndex) {
                      e.currentTarget.style.borderColor = '#bdc3c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (quizAnswers[questionIndex] !== optionIndex) {
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }
                  }}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={optionIndex}
                      checked={quizAnswers[questionIndex] === optionIndex}
                      onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                      style={{ marginRight: '12px', transform: 'scale(1.1)' }}
                    />
                    <span style={{ fontSize: '15px', color: '#2c3e50' }}>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div style={{ 
        background: 'white',
        padding: '25px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #e1e8ed',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#7f8c8d', margin: '0', fontSize: '14px' }}>
            Complete all questions to submit your assessment and receive your proficiency evaluation.
          </p>
        </div>
        
        <button
          onClick={submitQuiz}
          disabled={Object.keys(quizAnswers).length !== currentQuiz.questions.length}
          style={{
            padding: '15px 40px',
            fontSize: '16px',
            background: Object.keys(quizAnswers).length === currentQuiz.questions.length 
              ? '#27ae60' : '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: Object.keys(quizAnswers).length === currentQuiz.questions.length 
              ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (Object.keys(quizAnswers).length === currentQuiz.questions.length) {
              e.target.style.background = '#229954';
            }
          }}
          onMouseLeave={(e) => {
            if (Object.keys(quizAnswers).length === currentQuiz.questions.length) {
              e.target.style.background = '#27ae60';
            }
          }}
        >
          {Object.keys(quizAnswers).length === currentQuiz.questions.length 
            ? 'Submit Assessment' : `Complete ${currentQuiz.questions.length - Object.keys(quizAnswers).length} more questions`}
        </button>
      </div>
    </div>
  );
};

// Professional Assessment Results Component
const QuizResult = ({ language, score, correctAnswers, totalQuestions, timeElapsed, onBack }) => {
  const getCEFRLevel = (score) => {
    if (score >= 95) return { level: 'C2', title: 'Mastery', color: '#27ae60', description: 'Near-native proficiency' };
    if (score >= 85) return { level: 'C1', title: 'Advanced', color: '#2980b9', description: 'Advanced proficiency' };
    if (score >= 75) return { level: 'B2', title: 'Upper-Intermediate', color: '#3498db', description: 'Upper-intermediate proficiency' };
    if (score >= 65) return { level: 'B1', title: 'Intermediate', color: '#f39c12', description: 'Intermediate proficiency' };
    if (score >= 55) return { level: 'A2', title: 'Elementary', color: '#e67e22', description: 'Elementary proficiency' };
    return { level: 'A1', title: 'Beginner', color: '#e74c3c', description: 'Beginner proficiency' };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProfessionalRecommendation = (score) => {
    if (score >= 85) return "Excellent proficiency. You demonstrate advanced language skills suitable for professional environments.";
    if (score >= 75) return "Good proficiency level. Continue practicing to reach advanced professional competency.";
    if (score >= 65) return "Moderate proficiency. Consider focused study on areas of improvement for professional use.";
    if (score >= 55) return "Basic proficiency demonstrated. Continued learning recommended for professional applications.";
    return "Foundational level achieved. Regular practice and structured learning will improve your proficiency.";
  };

  const cefrInfo = getCEFRLevel(score);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '25px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e1e8ed',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2c3e50', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '32px', marginRight: '12px' }}>{language.flag}</span>
          {language.name} Assessment Results
        </h2>
        <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '0' }}>
          Professional Language Proficiency Evaluation • Completed in {formatTime(timeElapsed || 0)}
        </p>
      </div>

      {/* Score Overview */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '25px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e1e8ed'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', textAlign: 'center' }}>
          <div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: cefrInfo.color,
              marginBottom: '8px'
            }}>
              {score}%
            </div>
            <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Overall Score</div>
          </div>
          
          <div>
            <div style={{
              background: cefrInfo.color,
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              display: 'inline-block'
            }}>
              {cefrInfo.level}
            </div>
            <div style={{ color: '#7f8c8d', fontSize: '14px' }}>CEFR Level</div>
          </div>
          
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              {correctAnswers}/{totalQuestions}
            </div>
            <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Correct Answers</div>
          </div>
        </div>
      </div>

      {/* Proficiency Details */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '25px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e1e8ed'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px' }}>
          Proficiency Assessment
        </h3>
        
        <div style={{
          background: '#f8f9fa',
          borderLeft: `4px solid ${cefrInfo.color}`,
          padding: '20px',
          borderRadius: '0 8px 8px 0',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{
              background: cefrInfo.color,
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              marginRight: '12px'
            }}>
              {cefrInfo.level}
            </span>
            <h4 style={{ margin: '0', color: '#2c3e50' }}>{cefrInfo.title}</h4>
          </div>
          <p style={{ margin: '0', color: '#7f8c8d', fontSize: '14px', lineHeight: '1.5' }}>
            {cefrInfo.description}
          </p>
        </div>
        
        <div style={{
          padding: '20px',
          background: '#fafbfc',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>Professional Recommendation</h4>
          <p style={{ color: '#6c757d', margin: '0', lineHeight: '1.6' }}>
            {getProfessionalRecommendation(score)}
          </p>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '25px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e1e8ed'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px' }}>
          Performance Metrics
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px', marginRight: '10px' }}>⏱️</span>
              <span style={{ fontWeight: '600', color: '#2c3e50' }}>Time Efficiency</span>
            </div>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
              Completed in {formatTime(timeElapsed || 0)}
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px', marginRight: '10px' }}>📊</span>
              <span style={{ fontWeight: '600', color: '#2c3e50' }}>Accuracy Rate</span>
            </div>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
              {Math.round((correctAnswers / totalQuestions) * 100)}% correct responses
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '15px 30px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            marginRight: '15px'
          }}
        >
          Back to Assessments
        </button>
        
        <button
          style={{
            padding: '15px 30px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
          onClick={() => window.print()}
        >
          📄 Print Certificate
        </button>
      </div>
    </div>
  );
};



const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  // State for modules
  const [showModuleManager, setShowModuleManager] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', content: 'Module content goes here', videoUrl: '' });
  const [showCertificateManager, setShowCertificateManager] = useState(false);
  const [selectedCourseForCertificate, setSelectedCourseForCertificate] = useState(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    courseId: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    modes: [],
    location: { latitude: '', longitude: '', geofenceRadius: 100 },
    expiry: '',
    customMessage: ''
  });
  const [sessionStatus, setSessionStatus] = useState('');
  const [sessions, setSessions] = useState([]);
  // Language Learning States
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizResultData, setQuizResultData] = useState(null);
  const [languageProgress, setLanguageProgress] = useState({});

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        fetchCourses(userData.id);
      } catch (error) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Removed automatic heartbeat - attendance tracking should be handled by AttendanceManager component

  // Fetch sessions for instructor
  useEffect(() => {
    if (user?.id) {
      axios.get(`/sessions/instructor/${user.id}`)
        .then(res => setSessions(res.data))
        .catch(() => setSessions([]));
    }
  }, [user]);

  const fetchCourses = async (instructorId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/courses?instructor=${instructorId}`);
      setCourses(res.data);
    } catch (err) {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm(defaultCourseForm);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      overview: course.overview || 'Course overview and introduction',
      learningOutcomes: course.learningOutcomes || ['Learn fundamental concepts', 'Apply knowledge in practice'],
      category: course.category,
      level: course.level || 'beginner',
      duration: course.duration || 0,
      price: course.price || 0,
      modules: course.modules || [],
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`/courses/${courseId}`);
      fetchCourses(user.id);
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  // Language Learning Handlers
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowQuizResult(false);
    setQuizResultData(null);
  };

  const handleQuizComplete = (score, correctAnswers, totalQuestions, timeElapsed) => {
    setQuizScore(score);
    setQuizResultData({
      score,
      correctAnswers,
      totalQuestions,
      timeElapsed
    });
    setShowQuizResult(true);
    
    // Store progress in localStorage for professional record keeping
    const progress = JSON.parse(localStorage.getItem(`languageProgress_${user?.id}`)) || {};
    if (!progress[selectedLanguage.id]) {
      progress[selectedLanguage.id] = [];
    }
    progress[selectedLanguage.id].push({
      score,
      correctAnswers,
      totalQuestions,
      timeElapsed,
      date: new Date().toISOString(),
      language: selectedLanguage.name
    });
    localStorage.setItem(`languageProgress_${user?.id}`, JSON.stringify(progress));
    setLanguageProgress(progress);
  };

  const handleBackToLanguages = () => {
    setSelectedLanguage(null);
    setShowQuizResult(false);
    setQuizResultData(null);
  };

  const handleCourseFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await axios.put(`/courses/${editingCourse._id}`, courseForm);
      } else {
        await api.post('/courses', { ...courseForm, instructor: user.id });
      }
      setShowCourseForm(false);
      fetchCourses(user.id);
    } catch (err) {
      alert('Failed to save course');
    }
  };

  // Open module manager
  const handleManageModules = (course) => {
    setSelectedCourse(course);
    setModules(course.modules || []);
    setShowModuleManager(true);
    setEditingModule(null);
    setModuleForm({ title: '', description: '', content: 'Module content goes here', videoUrl: '' });
  };

  // Open certificate manager
  const handleManageCertificates = (course) => {
    setSelectedCourseForCertificate(course);
    setShowCertificateManager(true);
  };

  // Edit a module
  const handleEditModule = (mod, idx) => {
    setEditingModule(idx);
    setModuleForm({
      title: mod.title,
      description: mod.description,
      content: mod.content || '',
      videoUrl: mod.videoUrl || '', // preserve videoUrl if present
      _id: mod._id // preserve _id if present
    });
  };

  // Delete a module
  const handleDeleteModule = (idx) => {
    setModules(modules.filter((_, i) => i !== idx));
  };

  // Add or save a module
  const handleModuleFormSubmit = (e) => {
    e.preventDefault();
    // Ensure content is not empty
    const safeModuleForm = {
      ...moduleForm,
      content: moduleForm.content && moduleForm.content.trim() !== '' ? moduleForm.content : 'Module content goes here'
    };
    if (editingModule !== null) {
      setModules(modules.map((m, i) => i === editingModule ? { ...m, ...safeModuleForm } : m));
    } else {
      const { _id, ...rest } = safeModuleForm;
      setModules([...modules, rest]);
    }
    setEditingModule(null);
    setModuleForm({ title: '', description: '', content: 'Module content goes here', videoUrl: '' });
  };

  // Save all modules to backend
  const handleSaveModules = async () => {
    if (!selectedCourse) return;
    try {
      const payload = {
        title: selectedCourse.title,
        description: selectedCourse.description,
        category: selectedCourse.category,
        level: selectedCourse.level || 'beginner',
        duration: Number(selectedCourse.duration) || 0,
        price: Number(selectedCourse.price) || 0,
        modules: modules.map((mod, idx) => {
          return {
            ...(mod._id ? { _id: mod._id } : {}),
            title: mod.title,
            description: mod.description,
            order: idx + 1,
            content: mod.content || '', // required
            videoUrl: mod.videoUrl || '', // optional
            duration: Number(mod.duration) || 0,
            course: selectedCourse._id // required for new modules
          };
        })
      };
      await axios.put(`/courses/${selectedCourse._id}`, payload);
      setShowModuleManager(false);
      fetchCourses(user.id);
    } catch (err) {
      alert('Failed to save modules');
    }
  };

  const handleSessionFormChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'modes') {
      setSessionForm(f => ({ ...f, modes: checked ? [...f.modes, value] : f.modes.filter(m => m !== value) }));
    } else if (name.startsWith('location.')) {
      const locField = name.split('.')[1];
      setSessionForm(f => ({ ...f, location: { ...f.location, [locField]: value } }));
    } else {
      setSessionForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSessionFormSubmit = async (e) => {
    e.preventDefault();
    setSessionStatus('');
    try {
      const payload = {
        ...sessionForm,
        location: sessionForm.modes.includes('geofencing') ? {
          latitude: parseFloat(sessionForm.location.latitude),
          longitude: parseFloat(sessionForm.location.longitude),
          geofenceRadius: parseInt(sessionForm.location.geofenceRadius)
        } : undefined,
        expiry: sessionForm.expiry ? new Date(sessionForm.expiry) : undefined
      };
      await axios.post('/sessions', payload);
      setSessionStatus('✅ Session created!');
      setShowSessionForm(false);
      setSessionForm({
        courseId: '', title: '', date: '', startTime: '', endTime: '', modes: [], location: { latitude: '', longitude: '', geofenceRadius: 100 }, expiry: '', customMessage: ''
      });
      // Refresh sessions
      if (user?.id) {
        const res = await axios.get(`/sessions/instructor/${user.id}`);
        setSessions(res.data);
      }
    } catch (err) {
      setSessionStatus('❌ Failed to create session');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="instructor-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  // Dummy data for feature components
  const dummyEvents = [
    { title: "Live Session", start: new Date(), end: new Date(), type: "live" },
    { title: "Assignment Due", start: new Date(), end: new Date(), type: "deadline" },
  ];
  const dummySession = { topic: "Math Live", startTime: new Date() };
  const dummyProgress = [{ id: 1, title: "Math 101", progress: 80 }];
  const dummyBadges = ["Starter", "Pro"];
  const dummyLeaderboard = [{ userId: 1, name: "Alice", points: 100 }, { userId: 2, name: "Bob", points: 90 }];
  const dummyQuestions = [{ id: 1, text: "2+2?", type: "mcq", options: ["3", "4"] }];
  const dummyCertificate = { studentName: "John Doe", courseName: "Math 101", qrCodeUrl: "", downloadUrl: "#", instructorSignatureUrl: "" };

  const dummyOfficeHours = [{ id: 1, time: "Mon 10am", instructor: "Prof. Smith" }];
  const dummyAnalytics = { completionRate: 85 };

  return (
    <div className="instructor-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', marginRight: '12px' }}>👨‍🏫</span>
            <h1 className="dashboard-title">
              Instructor Dashboard
            </h1>
          </div>
          <div className="user-info">
            <span className="user-welcome">Welcome, {user?.firstName} {user?.lastName}</span>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Layout */}
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* Left Sidebar - All Features */}
        <div style={{
          width: '320px',
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          overflowY: 'auto',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '10px'
          }}>
            Instructor Features
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === tab.key ? '#e0e7ff' : 'transparent',
                  color: activeTab === tab.key ? '#3730a3' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.key ? '600' : '500',
                  borderLeft: activeTab === tab.key ? '4px solid #3730a3' : '4px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          backgroundColor: '#f8fafc'
        }}>
          {/* Main Content */}
        {activeTab === 'overview' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Courses</h3>
                <div className="stat-number">{courses.length}</div>
                <p className="stat-description">Courses created</p>
              </div>
              <div className="stat-card">
                <h3>Active Courses</h3>
                <div className="stat-number">
                  {courses.filter(c => c.status === 'active').length}
                </div>
                <p className="stat-description">Currently running</p>
              </div>
              <div className="stat-card">
                <h3>Total Students</h3>
                <div className="stat-number">
                  {courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)}
                </div>
                <p className="stat-description">Enrolled students</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <div className="stat-number">85%</div>
                <p className="stat-description">Average completion</p>
              </div>
            </div>

            <div className="widget-container">
              <h3 className="section-title">
                <span>📚</span>
                Recent Courses
              </h3>
              {courses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📚</div>
                  <div className="empty-state-title">No courses yet</div>
                  <div className="empty-state-description">
                    Create your first course to get started with teaching!
                  </div>
                </div>
              ) : (
                <div className="courses-grid">
                  {courses.slice(0, 3).map(course => (
                    <div key={course._id} className="course-card">
                      <div className="course-header">
                        <div>
                          <h4 className="course-title">{course.title}</h4>
                          <p className="course-instructor">By {user?.firstName} {user?.lastName}</p>
                        </div>
                        <span className={`status-badge ${course.status || 'active'}`}>
                          {course.status || 'Active'}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                        {course.description}
                      </p>
                      <div className="course-progress">
                        <div className="progress-label">
                          <span>Modules: {course.modules?.length || 0}</span>
                          <span>Students: {course.enrolledStudents || 0}</span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <button 
                          className="action-button action-button-primary"
                          onClick={() => setActiveTab('courses')}
                        >
                          Manage Course
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="widget-container">
              <h3 className="section-title">
                <span>🎯</span>
                Quick Actions
              </h3>
              <div className="courses-grid">
                <div className="course-card">
                  <h4 className="course-title">Create New Course</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Start building a new course with modules and content
                  </p>
                  <button 
                    className="action-button action-button-primary"
                    onClick={() => setActiveTab('courses')}
                  >
                    Create Course
                  </button>
                </div>
                <div className="course-card">
                  <h4 className="course-title">Schedule Live Session</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Set up a live class or meeting with your students
                  </p>
                  <button 
                    className="action-button action-button-secondary"
                    onClick={() => setActiveTab('scheduler')}
                  >
                    Schedule Session
                  </button>
                </div>
                <div className="course-card">
                  <h4 className="course-title">View Analytics</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Check student performance and course analytics
                  </p>
                  <button 
                    className="action-button action-button-secondary"
                    onClick={() => setActiveTab('analytics')}
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'courses' && (
          <div>
            <CourseManagement instructorId={user.id} />
          </div>
        )}
        {activeTab === 'scheduler' && <Scheduler events={dummyEvents} onEventClick={e => alert(e.title)} />}
        {activeTab === 'live' && <LiveSession session={dummySession} onJoin={() => alert('Joining live!')} chatMessages={[]} onSendMessage={msg => alert(msg)} />}
        {activeTab === 'zoomMeetings' && <ZoomMeetingScheduler />}
        {activeTab === 'performance' && <PerformanceTracking progressData={dummyProgress} weeklyReports={[]} />}
        {activeTab === 'assessment' && <InstructorAssessmentTab instructorId={user.id} />}
        {activeTab === 'certification' && (
          <div>
            <h2>🏆 Certificate Management</h2>
            <p>Manage certificate templates for your courses. Create professional certificates that students will receive upon course completion.</p>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Your Courses</h3>
              {courses.length === 0 ? (
                <p>No courses found. Create a course first to manage certificates.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {courses.map(course => (
                    <div key={course._id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      background: 'white'
                    }}>
                      <h4>{course.title}</h4>
                      <p style={{ color: '#666', marginBottom: '10px' }}>{course.description}</p>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                          background: course.modules && course.modules.length >= 5 ? '#d4edda' : '#fff3cd',
                          color: course.modules && course.modules.length >= 5 ? '#155724' : '#856404',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {course.modules ? course.modules.length : 0} modules
                        </span>
                        <button
                          onClick={() => handleManageCertificates(course)}
                          disabled={!course.modules || course.modules.length < 5}
                          style={{
                            padding: '8px 16px',
                            background: course.modules && course.modules.length >= 5 ? '#007bff' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: course.modules && course.modules.length >= 5 ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {course.modules && course.modules.length >= 5 ? 'Manage Certificates' : 'Need 5+ Modules'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'attendance' && <InstructorAttendanceManager user={user} />}
        {activeTab === 'contests' && <Contests instructorId={user.id} isInstructor={true} />}
        {activeTab === 'assignments' && <InstructorAssignmentManager user={user} />}
        {activeTab === 'officeHours' && <InstructorOfficeHours user={user} />}
        {activeTab === 'fileUpload' && <InstructorFileManager user={user} />}
        {activeTab === 'questionUpload' && <InstructorQuestionUpload user={user} />}
        {activeTab === 'studyMaterials' && <InstructorStudyMaterialUpload user={user} />}
        {activeTab === 'analytics' && <AdminAnalyticsDashboard analytics={{ totalUsers: 150, activeUsers: 75, completionRate: 65, averageScore: 78 }} />}
        {activeTab === 'languageLearning' && (
          <LanguageLearning user={user} />
        )}
        {showModuleManager && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Manage Modules for {selectedCourse?.title}</h3>
                <button className="close-btn" onClick={() => setShowModuleManager(false)}>&times;</button>
              </div>
              <div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {modules.map((mod, idx) => (
                    <li key={idx} style={{ marginBottom: 8, padding: 8, background: '#f3e6ff', borderRadius: 6 }}>
                      <strong>{mod.title}</strong>
                      <div style={{ fontSize: 13, color: '#666' }}>{mod.description}</div>
                      <button className="btn-secondary" style={{ marginRight: 8 }} onClick={() => handleEditModule(mod, idx)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDeleteModule(idx)}>Delete</button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleModuleFormSubmit} style={{ marginTop: 16 }}>
                  <input
                    type="text"
                    placeholder="Module Title"
                    required
                    value={moduleForm.title}
                    onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Module Description"
                    required
                    value={moduleForm.description}
                    onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Module Content"
                    required
                    value={moduleForm.content}
                    onChange={e => setModuleForm({ ...moduleForm, content: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Video URL"
                    value={moduleForm.videoUrl}
                    onChange={e => setModuleForm({ ...moduleForm, videoUrl: e.target.value })}
                  />
                  <button type="submit" className="btn-primary" style={{ marginLeft: 8 }}>
                    {editingModule !== null ? 'Save Module' : 'Add Module'}
                  </button>
                </form>
                <div className="modal-actions" style={{ marginTop: 16 }}>
                  <button className="btn-primary" onClick={handleSaveModules}>Save All Modules</button>
                  <button className="btn-secondary" onClick={() => setShowModuleManager(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
          {showCertificateManager && (
            <div className="modal-overlay">
              <div className="modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
                <div className="modal-header">
                  <h3>Certificate Template Manager - {selectedCourseForCertificate?.title}</h3>
                  <button className="close-btn" onClick={() => setShowCertificateManager(false)}>&times;</button>
                </div>
                <div>
                  <CertificateTemplateManager
                    courseId={selectedCourseForCertificate?._id}
                    onTemplateUpdated={(template) => {
                      console.log('Certificate template updated:', template);
                      setShowCertificateManager(false);
                      // Optionally refresh courses to show updated template
                      fetchCourses(user.id);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;