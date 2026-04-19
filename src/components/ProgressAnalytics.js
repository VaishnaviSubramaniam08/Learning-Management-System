import React, { useState, useEffect } from 'react';
import axios from '../api';
import './ProgressAnalytics.css';

const ProgressAnalytics = ({ user, examCode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [selectedSubject, setSelectedSubject] = useState('All');
  
  // Analytics Data
  const [progressData, setProgressData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [studyHeatmap, setStudyHeatmap] = useState([]);
  const [subjectAnalysis, setSubjectAnalysis] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [examCode, timeRange, selectedSubject]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [
        progressResponse,
        metricsResponse,
        heatmapResponse,
        trendsResponse,
        achievementsResponse
      ] = await Promise.all([
        axios.get(`/api/career-exam-prep/progress-analytics/${examCode}/${user.id}?range=${timeRange}`),
        axios.get(`/api/career-exam-prep/performance-metrics/${examCode}/${user.id}?range=${timeRange}`),
        axios.get(`/api/career-exam-prep/study-heatmap/${examCode}/${user.id}?range=${timeRange}`),
        axios.get(`/api/career-exam-prep/weekly-trends/${examCode}/${user.id}?range=${timeRange}`),
        axios.get(`/api/career-exam-prep/achievements/${examCode}/${user.id}`)
      ]);
      
      setProgressData(progressResponse.data);
      setPerformanceMetrics(metricsResponse.data);
      setStudyHeatmap(heatmapResponse.data);
      setSubjectAnalysis(progressResponse.data.subjectWiseProgress || []);
      setWeeklyTrends(trendsResponse.data);
      setAchievements(achievementsResponse.data);
      setRecommendations(progressResponse.data.recommendations || []);
      
    } catch (error) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressChart = () => {
    if (!progressData) return null;
    
    const maxProgress = Math.max(...subjectAnalysis.map(s => s.completionPercentage));
    
    return (
      <div className="progress-chart">
        <h3>📊 Subject-wise Progress</h3>
        <div className="chart-container">
          {subjectAnalysis.map((subject, index) => (
            <div key={subject.subject} className="progress-bar-item">
              <div className="progress-label">
                <span className="subject-name">{subject.subject}</span>
                <span className="progress-value">{subject.completionPercentage}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${subject.completionPercentage}%`,
                    backgroundColor: getSubjectColor(index)
                  }}
                ></div>
              </div>
              <div className="progress-stats">
                <span>⏱️ {Math.round(subject.timeSpent / 60)}h</span>
                <span>📝 {subject.averageScore}% avg</span>
                <span>📚 {subject.topicsCompleted}/{subject.totalTopics}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics) return null;
    
    return (
      <div className="performance-metrics">
        <h3>🎯 Performance Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <div className="metric-value">{performanceMetrics.accuracy}%</div>
              <div className="metric-label">Accuracy</div>
              <div className={`metric-trend ${performanceMetrics.accuracyTrend > 0 ? 'positive' : 'negative'}`}>
                {performanceMetrics.accuracyTrend > 0 ? '↗️' : '↘️'} 
                {Math.abs(performanceMetrics.accuracyTrend)}%
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-value">{performanceMetrics.speed}</div>
              <div className="metric-label">Questions/min</div>
              <div className={`metric-trend ${performanceMetrics.speedTrend > 0 ? 'positive' : 'negative'}`}>
                {performanceMetrics.speedTrend > 0 ? '↗️' : '↘️'} 
                {Math.abs(performanceMetrics.speedTrend)}%
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <div className="metric-value">{performanceMetrics.consistency}%</div>
              <div className="metric-label">Consistency</div>
              <div className={`metric-trend ${performanceMetrics.consistencyTrend > 0 ? 'positive' : 'negative'}`}>
                {performanceMetrics.consistencyTrend > 0 ? '↗️' : '↘️'} 
                {Math.abs(performanceMetrics.consistencyTrend)}%
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">🚀</div>
            <div className="metric-content">
              <div className="metric-value">{performanceMetrics.improvement}%</div>
              <div className="metric-label">Improvement</div>
              <div className="metric-trend positive">
                📅 This {timeRange}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudyHeatmap = () => {
    if (!studyHeatmap.length) return null;
    
    return (
      <div className="study-heatmap">
        <h3>🔥 Study Activity Heatmap</h3>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            {studyHeatmap.map((day, index) => (
              <div 
                key={index}
                className="heatmap-cell"
                style={{ 
                  backgroundColor: getHeatmapColor(day.intensity),
                  opacity: day.intensity / 100
                }}
                title={`${day.date}: ${day.studyTime} minutes`}
              >
                <span className="day-number">{new Date(day.date).getDate()}</span>
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-scale">
              {[0, 25, 50, 75, 100].map(intensity => (
                <div 
                  key={intensity}
                  className="legend-cell"
                  style={{ backgroundColor: getHeatmapColor(intensity) }}
                ></div>
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyTrends = () => {
    if (!weeklyTrends.length) return null;
    
    return (
      <div className="weekly-trends">
        <h3>📈 Weekly Trends</h3>
        <div className="trends-chart">
          {weeklyTrends.map((week, index) => (
            <div key={index} className="trend-week">
              <div className="week-label">Week {week.week}</div>
              <div className="trend-bars">
                <div className="trend-bar">
                  <div className="bar-label">Study Time</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill study-time"
                      style={{ height: `${(week.studyTime / 50) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{week.studyTime}h</div>
                </div>
                <div className="trend-bar">
                  <div className="bar-label">Tests</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill tests"
                      style={{ height: `${(week.testsAttempted / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{week.testsAttempted}</div>
                </div>
                <div className="trend-bar">
                  <div className="bar-label">Score</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill score"
                      style={{ height: `${week.averageScore}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{week.averageScore}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStrengthsWeaknesses = () => {
    if (!progressData) return null;
    
    const strengths = subjectAnalysis
      .filter(s => s.completionPercentage >= 70)
      .sort((a, b) => b.completionPercentage - a.completionPercentage)
      .slice(0, 3);
      
    const weaknesses = subjectAnalysis
      .filter(s => s.completionPercentage < 70)
      .sort((a, b) => a.completionPercentage - b.completionPercentage)
      .slice(0, 3);
    
    return (
      <div className="strengths-weaknesses">
        <div className="strengths-section">
          <h3>💪 Strengths</h3>
          <div className="strength-weakness-list">
            {strengths.map((subject, index) => (
              <div key={subject.subject} className="strength-item">
                <div className="item-icon">🟢</div>
                <div className="item-content">
                  <div className="item-name">{subject.subject}</div>
                  <div className="item-score">{subject.completionPercentage}% complete</div>
                </div>
              </div>
            ))}
            {strengths.length === 0 && (
              <div className="empty-state">
                <p>Keep studying to build your strengths! 💪</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="weaknesses-section">
          <h3>🎯 Focus Areas</h3>
          <div className="strength-weakness-list">
            {weaknesses.map((subject, index) => (
              <div key={subject.subject} className="weakness-item">
                <div className="item-icon">🔴</div>
                <div className="item-content">
                  <div className="item-name">{subject.subject}</div>
                  <div className="item-score">{subject.completionPercentage}% complete</div>
                </div>
              </div>
            ))}
            {weaknesses.length === 0 && (
              <div className="empty-state">
                <p>Great! No major weak areas identified! 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    if (!achievements.length) return null;
    
    return (
      <div className="achievements-section">
        <h3>🏆 Recent Achievements</h3>
        <div className="achievements-grid">
          {achievements.slice(0, 6).map((achievement, index) => (
            <div key={index} className="achievement-card">
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-content">
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-description">{achievement.description}</div>
                <div className="achievement-date">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations.length) return null;
    
    return (
      <div className="recommendations-section">
        <h3>🤖 AI Recommendations</h3>
        <div className="recommendations-list">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <div className="recommendation-icon">💡</div>
              <div className="recommendation-content">
                <div className="recommendation-text">{rec.text}</div>
                <div className="recommendation-priority">{rec.priority} Priority</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getSubjectColor = (index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[index % colors.length];
  };

  const getHeatmapColor = (intensity) => {
    const colors = {
      0: '#ebedf0',
      25: '#c6e48b',
      50: '#7bc96f',
      75: '#239a3b',
      100: '#196127'
    };
    return colors[Math.floor(intensity / 25) * 25] || colors[0];
  };

  if (loading) {
    return (
      <div className="progress-analytics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-analytics">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchAnalyticsData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>📊 Progress & Analytics</h1>
          <p>Track your learning journey and performance insights</p>
        </div>
        
        <div className="header-controls">
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="subject-filter">
            <label>Subject:</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="All">All Subjects</option>
              {subjectAnalysis.map(subject => (
                <option key={subject.subject} value={subject.subject}>
                  {subject.subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="analytics-content">
        {/* Performance Metrics */}
        {renderPerformanceMetrics()}
        
        {/* Progress Chart */}
        {renderProgressChart()}
        
        {/* Study Heatmap */}
        {renderStudyHeatmap()}
        
        {/* Weekly Trends */}
        {renderWeeklyTrends()}
        
        {/* Strengths & Weaknesses */}
        {renderStrengthsWeaknesses()}
        
        {/* Achievements */}
        {renderAchievements()}
        
        {/* AI Recommendations */}
        {renderRecommendations()}
      </div>
    </div>
  );
};

export default ProgressAnalytics;
