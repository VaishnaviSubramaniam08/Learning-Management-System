import React, { useState, useEffect } from 'react';
import axios from '../api';

const StudentPerformance = ({ userId }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchPerformanceData();
    }
  }, [userId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      console.log('📊 Performance Debug - Fetching data for user:', userId);

      // Fetch user enrollments with course details
      const enrollmentsResponse = await axios.get(`/courses/student/${userId}/enrollments`);
      const enrollmentsData = enrollmentsResponse.data;
      
      console.log('✅ Performance Debug - Enrollments fetched:', enrollmentsData.length);
      setEnrollments(enrollmentsData);

      // Process performance data
      const processedData = processPerformanceData(enrollmentsData);
      setPerformanceData(processedData);

    } catch (error) {
      console.error('❌ Performance Debug - Error fetching data:', error);
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

    const upcomingCourses = [
      { title: 'Advanced Machine Learning', status: 'coming_soon', estimatedStart: '2025-09-01' },
      { title: 'Cloud Computing Fundamentals', status: 'coming_soon', estimatedStart: '2025-10-15' },
      { title: 'Cybersecurity Essentials', status: 'coming_soon', estimatedStart: '2025-11-01' }
    ];

    // Calculate overall performance
    const totalGrades = completedCourses.reduce((sum, course) => sum + course.finalGrade, 0);
    const averageGrade = completedCourses.length > 0 ? totalGrades / completedCourses.length : 0;

    // Add performance analysis for each course
    const analyzedCourses = enrollments.map(enrollment => ({
      ...enrollment,
      performanceLevel: getPerformanceLevel(enrollment.finalGrade || enrollment.progress),
      feedback: generatePersonalizedFeedback(enrollment),
      displayGrade: enrollment.finalGrade || (enrollment.progress ? `${enrollment.progress}% (In Progress)` : 'Not Started')
    }));

    return {
      overallGrade: averageGrade,
      overallLevel: getPerformanceLevel(averageGrade),
      completedCourses: completedCourses.length,
      inProgressCourses: inProgressCourses.length,
      totalCourses: enrollments.length + upcomingCourses.length,
      courses: [...analyzedCourses, ...upcomingCourses],
      chartData: prepareChartData([...analyzedCourses, ...upcomingCourses])
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

  const generatePersonalizedFeedback = (enrollment) => {
    const grade = enrollment.finalGrade || enrollment.progress || 0;
    const courseName = enrollment.course?.title || enrollment.title;

    if (enrollment.status === 'coming_soon') {
      return `Get ready for ${courseName}! This course will build on your current knowledge and skills.`;
    }

    if (grade >= 90) {
      return `Outstanding work in ${courseName}! You've mastered the concepts exceptionally well. Consider mentoring other students.`;
    } else if (grade >= 80) {
      return `Strong performance in ${courseName}! You have a solid understanding. Focus on advanced topics to reach excellence.`;
    } else if (grade >= 70) {
      return `Good progress in ${courseName}! Review key concepts and practice more to strengthen your understanding.`;
    } else if (grade >= 60) {
      return `You're making progress in ${courseName}. Dedicate more time to studying and seek help when needed.`;
    } else {
      return `${courseName} needs more attention. Consider additional study sessions, tutoring, or office hours with instructors.`;
    }
  };

  const prepareChartData = (courses) => {
    return courses.map(course => ({
      name: course.course?.title || course.title || 'Unknown Course',
      grade: course.finalGrade || (course.status === 'coming_soon' ? 0 : course.progress || 0),
      status: course.status || (course.finalGrade ? 'completed' : 'in_progress'),
      isComingSoon: course.status === 'coming_soon'
    }));
  };

  const getMotivationalMessage = (performanceData) => {
    if (!performanceData) return '';

    const { overallLevel, overallGrade, completedCourses } = performanceData;

    if (overallLevel === 'Excellent') {
      return `🌟 Exceptional work! With an average of ${overallGrade.toFixed(1)}%, you're truly excelling. Keep up this outstanding performance and consider taking on leadership roles or advanced challenges.`;
    } else if (overallLevel === 'Strong') {
      return `💪 Great job! Your ${overallGrade.toFixed(1)}% average shows strong academic performance. Push yourself a bit more to reach excellence in your upcoming courses.`;
    } else if (overallLevel === 'Good') {
      return `📈 You're on the right track with a ${overallGrade.toFixed(1)}% average. Focus on consistent study habits and don't hesitate to ask for help when needed.`;
    } else if (overallLevel === 'Satisfactory') {
      return `🎯 You're making progress! With more focused effort and regular study sessions, you can significantly improve your ${overallGrade.toFixed(1)}% average.`;
    } else {
      return `🚀 Every expert was once a beginner! Your current performance shows room for growth. Consider creating a study schedule, joining study groups, and utilizing all available resources.`;
    }
  };

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
        📊 Loading your performance data...
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280'
      }}>
        ❌ Unable to load performance data
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
          📊 Academic Performance Summary
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Comprehensive analysis of your academic progress and achievements
        </p>
      </div>

      {/* Overall Performance Card */}
      <div style={{
        background: `linear-gradient(135deg, ${getPerformanceLevelColor(performanceData.overallLevel)}22, ${getPerformanceLevelColor(performanceData.overallLevel)}44)`,
        border: `2px solid ${getPerformanceLevelColor(performanceData.overallLevel)}`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '24px' }}>
          🎯 Overall Performance Evaluation
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: getPerformanceLevelColor(performanceData.overallLevel),
              marginBottom: '8px'
            }}>
              {performanceData.overallGrade.toFixed(1)}%
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Average Grade</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getPerformanceLevelColor(performanceData.overallLevel),
              marginBottom: '8px'
            }}>
              {performanceData.overallLevel}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Performance Level</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              {performanceData.completedCourses}/{performanceData.totalCourses}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Courses Completed</div>
          </div>
        </div>
      </div>

      {/* Course Performance Chart */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px' }}>
          📈 Grade Visualization
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'end',
          gap: '12px',
          height: '300px',
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '8px',
          overflowX: 'auto'
        }}>
          {performanceData.chartData.map((course, index) => {
            const height = course.isComingSoon ? 40 : Math.max((course.grade / 100) * 250, 20);
            const color = course.isComingSoon ? '#d1d5db' : getPerformanceLevelColor(getPerformanceLevel(course.grade));
            
            return (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '120px'
              }}>
                <div style={{
                  background: color,
                  width: '60px',
                  height: `${height}px`,
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '4px'
                }}>
                  {course.isComingSoon ? 'Soon' : `${course.grade.toFixed(0)}%`}
                </div>
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#374151',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  lineHeight: '1.2'
                }}>
                  {course.name.length > 15 ? course.name.substring(0, 15) + '...' : course.name}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          X-axis: Courses | Y-axis: Grade Percentage
        </div>
      </div>

      {/* Detailed Course Analysis */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px' }}>
          📚 Course-wise Performance Analysis
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {performanceData.courses.map((course, index) => (
            <div key={index} style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {course.course?.title || course.title}
                    {course.status === 'coming_soon' && (
                      <span style={{
                        marginLeft: '8px',
                        background: '#f3f4f6',
                        color: '#6b7280',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'normal'
                      }}>
                        Coming Soon
                      </span>
                    )}
                  </h4>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    {course.feedback}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: course.status === 'coming_soon' ? '#6b7280' : getPerformanceLevelColor(course.performanceLevel),
                    marginBottom: '4px'
                  }}>
                    {course.status === 'coming_soon' ? 'TBD' : course.displayGrade}
                  </div>
                  <div style={{
                    background: course.status === 'coming_soon' ? '#f3f4f6' : getPerformanceLevelColor(course.performanceLevel),
                    color: course.status === 'coming_soon' ? '#6b7280' : 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {course.status === 'coming_soon' ? 'Upcoming' : course.performanceLevel}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>
          💪 Your Learning Journey
        </h3>
        <p style={{
          margin: 0,
          fontSize: '16px',
          lineHeight: '1.6',
          opacity: 0.95
        }}>
          {getMotivationalMessage(performanceData)}
        </p>
      </div>
    </div>
  );
};

export default StudentPerformance;
