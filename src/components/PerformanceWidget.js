import React, { useState, useEffect } from 'react';
import axios from '../api';

const PerformanceWidget = ({ userId, onNavigateToPerformance }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPerformanceData();
    }
  }, [userId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch student enrollments
      const enrollmentsResponse = await axios.get(`/courses/student/${userId}/enrollments`);
      const enrollments = enrollmentsResponse.data;
      
      // Process performance data
      const processedData = processPerformanceData(enrollments);
      setPerformanceData(processedData);

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPerformanceData = (enrollments) => {
    const completedCourses = enrollments.filter(enrollment => 
      enrollment.status === 'completed' && enrollment.finalGrade !== undefined
    );

    const inProgressCourses = enrollments.filter(enrollment => 
      enrollment.status === 'in_progress'
    );

    // Calculate overall performance
    const totalGrades = completedCourses.reduce((sum, course) => sum + course.finalGrade, 0);
    const averageGrade = completedCourses.length > 0 ? totalGrades / completedCourses.length : 0;

    return {
      averageGrade,
      completedCourses: completedCourses.length,
      inProgressCourses: inProgressCourses.length,
      totalCourses: enrollments.length,
      performanceLevel: getPerformanceLevel(averageGrade),
      recentCourses: enrollments.slice(0, 3)
    };
  };

  const getPerformanceLevel = (grade) => {
    if (grade >= 90) return 'Excellent';
    if (grade >= 80) return 'Strong';
    if (grade >= 70) return 'Good';
    if (grade >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getPerformanceLevelColor = (level) => {
    const colors = {
      'Excellent': '#10b981',
      'Strong': '#3b82f6',
      'Good': '#8b5cf6',
      'Satisfactory': '#f59e0b',
      'Needs Improvement': '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ color: '#6b7280' }}>📊 Loading...</div>
      </div>
    );
  }

  if (!performanceData) {
    return null;
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, color: '#374151' }}>📊 Academic Performance</h3>
        <button
          onClick={onNavigateToPerformance}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          View Details
        </button>
      </div>

      {/* Overall Performance */}
      <div style={{
        background: `linear-gradient(135deg, ${getPerformanceLevelColor(performanceData.performanceLevel)}22, ${getPerformanceLevelColor(performanceData.performanceLevel)}44)`,
        border: `2px solid ${getPerformanceLevelColor(performanceData.performanceLevel)}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Overall Grade</h4>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
              {performanceData.performanceLevel}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: 'bold', color: getPerformanceLevelColor(performanceData.performanceLevel) }}>
              {performanceData.averageGrade > 0 ? `${performanceData.averageGrade.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>✅</div>
          <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold', color: '#0c4a6e' }}>
            {performanceData.completedCourses}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#0369a1' }}>completed</p>
        </div>

        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📚</div>
          <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold', color: '#14532d' }}>
            {performanceData.inProgressCourses}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>in progress</p>
        </div>

        <div style={{
          background: '#fefce8',
          border: '1px solid #eab308',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📈</div>
          <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold', color: '#713f12' }}>
            {performanceData.totalCourses}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#a16207' }}>total courses</p>
        </div>
      </div>

      {/* Recent Courses */}
      {performanceData.recentCourses.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>📚 Recent Courses</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {performanceData.recentCourses.slice(0, 3).map((enrollment, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                    {enrollment.course?.title || 'Unknown Course'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    Status: {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {enrollment.finalGrade ? (
                    <div style={{
                      background: getPerformanceLevelColor(getPerformanceLevel(enrollment.finalGrade)),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {enrollment.finalGrade}%
                    </div>
                  ) : (
                    <div style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {enrollment.progress || 0}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tip */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
        <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e' }}>Performance Tip</h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
          {performanceData.averageGrade >= 85 
            ? "Excellent work! Keep maintaining this high standard."
            : performanceData.averageGrade >= 75
            ? "Good progress! Focus on challenging topics to improve further."
            : "Consider setting up a study schedule and seeking help when needed."
          }
        </p>
      </div>
    </div>
  );
};

export default PerformanceWidget;
