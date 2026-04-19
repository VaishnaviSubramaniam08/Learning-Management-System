import React, { useState, useEffect } from 'react';
import axios from '../api';
import './StudyPlanGenerator.css';

const StudyPlanGenerator = ({ user, examCode }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [formData, setFormData] = useState({
    examDate: '',
    dailyHours: 4,
    weeklySchedule: {
      Monday: { hours: 4, isActive: true },
      Tuesday: { hours: 4, isActive: true },
      Wednesday: { hours: 4, isActive: true },
      Thursday: { hours: 4, isActive: true },
      Friday: { hours: 4, isActive: true },
      Saturday: { hours: 6, isActive: true },
      Sunday: { hours: 2, isActive: true }
    },
    selectedSubjects: [],
    priorityTopics: [],
    studyPreferences: {
      focusOnWeakAreas: true,
      includeRevision: true,
      revisionFrequency: 7,
      adjustBasedOnPerformance: true
    }
  });
  
  // Generated Plan Data
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [existingPlans, setExistingPlans] = useState([]);
  const [examConfig, setExamConfig] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  
  // Real-time Progress
  const [currentPlan, setCurrentPlan] = useState(null);
  const [todaysPlan, setTodaysPlan] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [examCode]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [examResponse, progressResponse, plansResponse] = await Promise.all([
        axios.get(`/api/career-exam-prep/exam-config/${examCode}`),
        axios.get(`/api/career-exam-prep/user-progress/${examCode}/${user.id}`),
        axios.get(`/api/career-exam-prep/study-plans/${user.id}`)
      ]);
      
      setExamConfig(examResponse.data);
      setUserProgress(progressResponse.data);
      setExistingPlans(plansResponse.data);
      
      // Set default subjects from exam config
      setFormData(prev => ({
        ...prev,
        selectedSubjects: examResponse.data.subjects.map(s => s.name)
      }));
    } catch (error) {
      setError('Failed to load exam data');
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWeeklyScheduleChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          [field]: value
        }
      }
    }));
  };

  const calculateTotalWeeklyHours = () => {
    return Object.values(formData.weeklySchedule)
      .filter(day => day.isActive)
      .reduce((total, day) => total + day.hours, 0);
  };

  const calculateDaysUntilExam = () => {
    if (!formData.examDate) return 0;
    const today = new Date();
    const examDate = new Date(formData.examDate);
    const diffTime = examDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const generateStudyPlan = async () => {
    try {
      setLoading(true);
      setError('');
      
      const planData = {
        ...formData,
        userId: user.id,
        examCode,
        daysUntilExam: calculateDaysUntilExam(),
        totalWeeklyHours: calculateTotalWeeklyHours(),
        userProgress: userProgress
      };
      
      const response = await axios.post('/api/career-exam-prep/generate-study-plan', planData);
      setGeneratedPlan(response.data);
      setStep(4);
    } catch (error) {
      setError('Failed to generate study plan. Please try again.');
      console.error('Error generating study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    try {
      setLoading(true);
      await axios.post('/api/career-exam-prep/save-study-plan', {
        ...generatedPlan,
        userId: user.id,
        examCode
      });
      
      alert('Study plan saved successfully!');
      fetchInitialData();
      setStep(1);
      setGeneratedPlan(null);
    } catch (error) {
      setError('Failed to save study plan');
      console.error('Error saving plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(stepNum => (
        <div 
          key={stepNum} 
          className={`step ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}
        >
          <div className="step-number">{stepNum}</div>
          <div className="step-label">
            {stepNum === 1 && 'Basic Info'}
            {stepNum === 2 && 'Schedule'}
            {stepNum === 3 && 'Preferences'}
            {stepNum === 4 && 'Generated Plan'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h2>📅 Basic Information</h2>
      <p>Let's start with your exam details and study goals</p>
      
      <div className="form-group">
        <label>Target Exam Date</label>
        <input
          type="date"
          value={formData.examDate}
          onChange={(e) => handleInputChange('examDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
        {formData.examDate && (
          <div className="exam-countdown">
            📅 {calculateDaysUntilExam()} days until exam
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label>Daily Study Hours (Average)</label>
        <div className="hours-selector">
          <input
            type="range"
            min="1"
            max="12"
            value={formData.dailyHours}
            onChange={(e) => handleInputChange('dailyHours', parseInt(e.target.value))}
          />
          <span className="hours-display">{formData.dailyHours} hours/day</span>
        </div>
      </div>
      
      <div className="form-group">
        <label>Select Subjects to Focus On</label>
        <div className="subjects-grid">
          {examConfig?.subjects.map(subject => (
            <div key={subject.name} className="subject-card">
              <input
                type="checkbox"
                id={subject.name}
                checked={formData.selectedSubjects.includes(subject.name)}
                onChange={(e) => {
                  const subjects = e.target.checked
                    ? [...formData.selectedSubjects, subject.name]
                    : formData.selectedSubjects.filter(s => s !== subject.name);
                  handleInputChange('selectedSubjects', subjects);
                }}
              />
              <label htmlFor={subject.name}>
                <div className="subject-name">{subject.name}</div>
                <div className="subject-weightage">{subject.weightage}% weightage</div>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="step-actions">
        <button 
          className="btn-next"
          onClick={() => setStep(2)}
          disabled={!formData.examDate || formData.selectedSubjects.length === 0}
        >
          Next: Set Schedule →
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>📋 Weekly Schedule</h2>
      <p>Customize your weekly study schedule</p>
      
      <div className="weekly-schedule">
        {Object.entries(formData.weeklySchedule).map(([day, schedule]) => (
          <div key={day} className="day-schedule">
            <div className="day-header">
              <input
                type="checkbox"
                checked={schedule.isActive}
                onChange={(e) => handleWeeklyScheduleChange(day, 'isActive', e.target.checked)}
              />
              <label>{day}</label>
            </div>
            {schedule.isActive && (
              <div className="hours-input">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={schedule.hours}
                  onChange={(e) => handleWeeklyScheduleChange(day, 'hours', parseInt(e.target.value))}
                />
                <span>hours</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="schedule-summary">
        <div className="summary-item">
          <span>Total Weekly Hours:</span>
          <span className="highlight">{calculateTotalWeeklyHours()} hours</span>
        </div>
        <div className="summary-item">
          <span>Average Daily Hours:</span>
          <span className="highlight">{(calculateTotalWeeklyHours() / 7).toFixed(1)} hours</span>
        </div>
      </div>
      
      <div className="step-actions">
        <button className="btn-back" onClick={() => setStep(1)}>
          ← Back
        </button>
        <button className="btn-next" onClick={() => setStep(3)}>
          Next: Preferences →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2>⚙️ Study Preferences</h2>
      <p>Customize how your study plan should be optimized</p>
      
      <div className="preferences-grid">
        <div className="preference-card">
          <div className="preference-header">
            <input
              type="checkbox"
              checked={formData.studyPreferences.focusOnWeakAreas}
              onChange={(e) => handleInputChange('studyPreferences', {
                ...formData.studyPreferences,
                focusOnWeakAreas: e.target.checked
              })}
            />
            <label>🎯 Focus on Weak Areas</label>
          </div>
          <p>Allocate more time to topics where you need improvement</p>
        </div>
        
        <div className="preference-card">
          <div className="preference-header">
            <input
              type="checkbox"
              checked={formData.studyPreferences.includeRevision}
              onChange={(e) => handleInputChange('studyPreferences', {
                ...formData.studyPreferences,
                includeRevision: e.target.checked
              })}
            />
            <label>🔄 Include Regular Revision</label>
          </div>
          <p>Schedule periodic revision sessions for better retention</p>
          {formData.studyPreferences.includeRevision && (
            <div className="revision-frequency">
              <label>Revision every:</label>
              <select
                value={formData.studyPreferences.revisionFrequency}
                onChange={(e) => handleInputChange('studyPreferences', {
                  ...formData.studyPreferences,
                  revisionFrequency: parseInt(e.target.value)
                })}
              >
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="preference-card">
          <div className="preference-header">
            <input
              type="checkbox"
              checked={formData.studyPreferences.adjustBasedOnPerformance}
              onChange={(e) => handleInputChange('studyPreferences', {
                ...formData.studyPreferences,
                adjustBasedOnPerformance: e.target.checked
              })}
            />
            <label>📊 Adaptive Planning</label>
          </div>
          <p>Automatically adjust plan based on your test performance</p>
        </div>
      </div>
      
      {userProgress && (
        <div className="weak-areas-section">
          <h3>🎯 Identified Weak Areas</h3>
          <p>Based on your previous performance, we'll focus extra time on:</p>
          <div className="weak-topics">
            {userProgress.subjectWiseProgress
              ?.filter(subject => subject.completionPercentage < 70)
              .map(subject => (
                <span key={subject.subject} className="weak-topic">
                  {subject.subject} ({subject.completionPercentage}%)
                </span>
              ))
            }
          </div>
        </div>
      )}
      
      <div className="step-actions">
        <button className="btn-back" onClick={() => setStep(2)}>
          ← Back
        </button>
        <button 
          className="btn-generate" 
          onClick={generateStudyPlan}
          disabled={loading}
        >
          {loading ? 'Generating...' : '🚀 Generate Study Plan'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h2>📋 Your Personalized Study Plan</h2>
      <p>AI-generated study plan based on your preferences and goals</p>
      
      {generatedPlan && (
        <div className="generated-plan">
          <div className="plan-overview">
            <div className="overview-stats">
              <div className="stat-card">
                <span className="stat-value">{generatedPlan.totalDays}</span>
                <span className="stat-label">Study Days</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{generatedPlan.totalHours}</span>
                <span className="stat-label">Total Hours</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{generatedPlan.subjects?.length}</span>
                <span className="stat-label">Subjects</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{generatedPlan.weeklyGoals?.length}</span>
                <span className="stat-label">Weekly Goals</span>
              </div>
            </div>
          </div>
          
          <div className="plan-timeline">
            <h3>📅 Weekly Breakdown</h3>
            {generatedPlan.weeklyGoals?.map((week, index) => (
              <div key={index} className="week-card">
                <div className="week-header">
                  <h4>Week {week.week}</h4>
                  <span className="week-dates">
                    {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="week-goals">
                  {week.goals.map((goal, goalIndex) => (
                    <div key={goalIndex} className="goal-item">
                      ✓ {goal}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="plan-subjects">
            <h3>📚 Subject-wise Distribution</h3>
            <div className="subjects-breakdown">
              {generatedPlan.syllabus?.map(subject => (
                <div key={subject.subject} className="subject-breakdown">
                  <div className="subject-header">
                    <h4>{subject.subject}</h4>
                    <span className="topic-count">{subject.topics.length} topics</span>
                  </div>
                  <div className="topics-list">
                    {subject.topics.slice(0, 5).map((topic, index) => (
                      <div key={index} className="topic-item">
                        <span className="topic-name">{topic.name}</span>
                        <span className="topic-hours">{topic.estimatedHours}h</span>
                        <span className={`priority ${topic.priority.toLowerCase()}`}>
                          {topic.priority}
                        </span>
                      </div>
                    ))}
                    {subject.topics.length > 5 && (
                      <div className="more-topics">
                        +{subject.topics.length - 5} more topics
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="step-actions">
        <button className="btn-back" onClick={() => setStep(3)}>
          ← Modify Preferences
        </button>
        <button className="btn-save" onClick={savePlan} disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Plan'}
        </button>
        <button className="btn-regenerate" onClick={generateStudyPlan} disabled={loading}>
          🔄 Regenerate
        </button>
      </div>
    </div>
  );

  const renderExistingPlans = () => (
    <div className="existing-plans">
      <h2>📋 Your Study Plans</h2>
      {existingPlans.length > 0 ? (
        <div className="plans-grid">
          {existingPlans.map(plan => (
            <div key={plan._id} className="plan-card">
              <div className="plan-header">
                <h3>{plan.planName || `${plan.examCode} Study Plan`}</h3>
                <span className={`plan-status ${plan.isActive ? 'active' : 'inactive'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="plan-details">
                <div className="plan-meta">
                  <span>📅 Target: {new Date(plan.targetExamDate).toLocaleDateString()}</span>
                  <span>⏱️ {plan.dailyStudyHours}h/day</span>
                  <span>📊 {plan.overallProgress}% complete</span>
                </div>
                <div className="plan-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${plan.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="plan-actions">
                <button className="btn-view">View Details</button>
                <button className="btn-edit">Edit Plan</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-plans">
          <p>You haven't created any study plans yet.</p>
          <button className="btn-create" onClick={() => setStep(1)}>
            Create Your First Plan
          </button>
        </div>
      )}
    </div>
  );

  if (loading && step === 1) {
    return (
      <div className="study-plan-generator">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading exam configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="study-plan-generator">
      <div className="generator-header">
        <h1>🎯 AI Study Plan Generator</h1>
        <p>Create a personalized study plan tailored to your goals and schedule</p>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}
      
      {step > 1 && renderStepIndicator()}
      
      <div className="generator-content">
        {step === 1 && existingPlans.length > 0 && (
          <div>
            {renderExistingPlans()}
            <div className="create-new-section">
              <button className="btn-create-new" onClick={() => setStep(1)}>
                ➕ Create New Study Plan
              </button>
            </div>
          </div>
        )}
        {(step === 1 && existingPlans.length === 0) && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default StudyPlanGenerator;
