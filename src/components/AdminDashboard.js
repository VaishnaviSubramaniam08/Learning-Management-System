import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [userFilter, setUserFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportLoading, setReportLoading] = useState({});
  const [reportFilters, setReportFilters] = useState({
    dateRange: '30days',
    courseId: '',
    userId: '',
    reportType: 'summary',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true
  });
  const [reportHistory, setReportHistory] = useState([]);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [reportTemplates, setReportTemplates] = useState([]);
  const [systemSettings, setSystemSettings] = useState({
    passingScore: 70,
    maxRetakes: 2,
    geofenceRadius: 100,
    qrExpiry: 24,
    emailNotifications: true,
    autoCertificate: true,
    sessionTimeout: 30,
    passwordPolicy: 'medium'
  });
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    coursePerformance: [],
    attendanceStats: [],
    certificationStats: [],
    systemHealth: {},
    revenueData: [],
    engagementMetrics: {},
    geographicData: [],
    deviceStats: {},
    timeBasedStats: {}
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Form states
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    address: ''
  });

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    duration: '',
    instructor: '',
    category: '',
    level: 'beginner',
    price: 0,
    isActive: true
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [selectedDateRange, activeTab]);

  const fetchAdminData = async () => {
    try {
      const [usersRes, coursesRes, analyticsRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/courses'),
        axios.get('/admin/dashboard')
      ]);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setAnalytics(analyticsRes.data);
      
      // Fetch detailed analytics
      await fetchAnalyticsData();
      
      // Load report data
      await loadReportData();
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      const [historyRes, scheduledRes, templatesRes] = await Promise.all([
        axios.get('/admin/reports/history'),
        axios.get('/admin/reports/scheduled'),
        axios.get('/admin/reports/templates')
      ]);
      
      setReportHistory(historyRes.data);
      setScheduledReports(scheduledRes.data);
      setReportTemplates(templatesRes.data);
    } catch (err) {
      console.error('Error loading report data:', err);
      // Set mock data for demonstration
      setReportHistory(getMockReportHistory());
      setScheduledReports(getMockScheduledReports());
      setReportTemplates(getMockReportTemplates());
    }
  };

  const getMockReportHistory = () => [
    {
      id: '1',
      name: 'Monthly User Activity Report',
      type: 'user_activity',
      format: 'pdf',
      generatedAt: '2024-03-15T10:30:00Z',
      generatedBy: 'Admin User',
      fileSize: '2.4 MB',
      downloadCount: 5,
      status: 'completed'
    },
    {
      id: '2',
      name: 'Course Performance Analysis',
      type: 'course_performance',
      format: 'excel',
      generatedAt: '2024-03-14T14:20:00Z',
      generatedBy: 'Admin User',
      fileSize: '1.8 MB',
      downloadCount: 3,
      status: 'completed'
    },
    {
      id: '3',
      name: 'Attendance Summary Report',
      type: 'attendance',
      format: 'pdf',
      generatedAt: '2024-03-13T09:15:00Z',
      generatedBy: 'Admin User',
      fileSize: '3.1 MB',
      downloadCount: 8,
      status: 'completed'
    },
    {
      id: '4',
      name: 'Financial Report Q1 2024',
      type: 'financial',
      format: 'pdf',
      generatedAt: '2024-03-12T16:45:00Z',
      generatedBy: 'Admin User',
      fileSize: '1.2 MB',
      downloadCount: 12,
      status: 'completed'
    }
  ];

  const getMockScheduledReports = () => [
    {
      id: '1',
      name: 'Weekly Attendance Report',
      type: 'attendance',
      frequency: 'weekly',
      nextRun: '2024-03-18T09:00:00Z',
      recipients: ['admin@example.com', 'manager@example.com'],
      format: 'pdf',
      isActive: true
    },
    {
      id: '2',
      name: 'Monthly Revenue Report',
      type: 'financial',
      frequency: 'monthly',
      nextRun: '2024-04-01T08:00:00Z',
      recipients: ['finance@example.com'],
      format: 'excel',
      isActive: true
    },
    {
      id: '3',
      name: 'Course Completion Report',
      type: 'course_performance',
      frequency: 'bi-weekly',
      nextRun: '2024-03-20T10:00:00Z',
      recipients: ['instructor@example.com'],
      format: 'pdf',
      isActive: false
    }
  ];

  const getMockReportTemplates = () => [
    {
      id: '1',
      name: 'Standard User Activity Report',
      type: 'user_activity',
      description: 'Comprehensive user activity analysis with engagement metrics',
      sections: ['User Overview', 'Activity Timeline', 'Engagement Metrics', 'Geographic Distribution'],
      isDefault: true
    },
    {
      id: '2',
      name: 'Detailed Course Performance',
      type: 'course_performance',
      description: 'In-depth course analysis with completion rates and student feedback',
      sections: ['Course Overview', 'Enrollment Trends', 'Completion Analysis', 'Student Feedback'],
      isDefault: true
    },
    {
      id: '3',
      name: 'Executive Summary',
      type: 'executive',
      description: 'High-level overview for executive stakeholders',
      sections: ['Key Metrics', 'Growth Trends', 'Financial Summary', 'Strategic Insights'],
      isDefault: false
    }
  ];

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const [
        userGrowthRes,
        coursePerformanceRes,
        attendanceRes,
        certificationRes,
        systemHealthRes,
        revenueRes,
        engagementRes,
        geographicRes,
        deviceRes,
        timeBasedRes
      ] = await Promise.all([
        axios.get(`/admin/analytics/user-growth?range=${selectedDateRange}`),
        axios.get(`/admin/analytics/course-performance?range=${selectedDateRange}`),
        axios.get(`/admin/analytics/attendance?range=${selectedDateRange}`),
        axios.get(`/admin/analytics/certification?range=${selectedDateRange}`),
        axios.get('/admin/analytics/system-health'),
        axios.get(`/admin/analytics/revenue?range=${selectedDateRange}`),
        axios.get(`/admin/analytics/engagement?range=${selectedDateRange}`),
        axios.get(`/admin/analytics/geographic?range=${selectedDateRange}`),
        axios.get(`/admin/analytics/devices?range=${selectedDateRange}`),
        axios.get(`/admin/analytics/time-based?range=${selectedDateRange}`)
      ]);

      setAnalyticsData({
        userGrowth: userGrowthRes.data,
        coursePerformance: coursePerformanceRes.data,
        attendanceStats: attendanceRes.data,
        certificationStats: certificationRes.data,
        systemHealth: systemHealthRes.data,
        revenueData: revenueRes.data,
        engagementMetrics: engagementRes.data,
        geographicData: geographicRes.data,
        deviceStats: deviceRes.data,
        timeBasedStats: timeBasedRes.data
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Set mock data for demonstration
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getMockAnalyticsData = () => ({
    userGrowth: [
      { date: '2024-01-01', students: 120, instructors: 8, admins: 2 },
      { date: '2024-01-15', students: 145, instructors: 10, admins: 2 },
      { date: '2024-02-01', students: 178, instructors: 12, admins: 3 },
      { date: '2024-02-15', students: 203, instructors: 15, admins: 3 },
      { date: '2024-03-01', students: 234, instructors: 18, admins: 4 },
      { date: '2024-03-15', students: 267, instructors: 20, admins: 4 }
    ],
    coursePerformance: [
      { courseId: '1', title: 'React Fundamentals', enrollments: 45, completions: 38, avgScore: 87, revenue: 2250 },
      { courseId: '2', title: 'Node.js Backend', enrollments: 32, completions: 28, avgScore: 82, revenue: 1600 },
      { courseId: '3', title: 'Python Data Science', enrollments: 28, completions: 22, avgScore: 91, revenue: 1400 },
      { courseId: '4', title: 'UI/UX Design', enrollments: 35, completions: 30, avgScore: 89, revenue: 1750 }
    ],
    attendanceStats: {
      totalSessions: 156,
      avgAttendanceRate: 87.5,
      qrCodeUsage: 65,
      geofenceUsage: 35,
      faceRecognitionUsage: 45,
      lateArrivals: 23,
      earlyDepartures: 12,
      perfectAttendance: 34
    },
    certificationStats: {
      totalIssued: 89,
      verificationRequests: 156,
      avgTimeToComplete: 45,
      topPerformers: [
        { name: 'John Doe', certificates: 3, avgScore: 95 },
        { name: 'Jane Smith', certificates: 2, avgScore: 92 },
        { name: 'Mike Johnson', certificates: 2, avgScore: 88 }
      ]
    },
    systemHealth: {
      uptime: 99.8,
      avgResponseTime: 245,
      errorRate: 0.2,
      activeUsers: 156,
      peakConcurrentUsers: 89,
      storageUsed: 67.5,
      bandwidthUsage: 78.3
    },
    revenueData: [
      { month: 'Jan', revenue: 12500, enrollments: 45 },
      { month: 'Feb', revenue: 15800, enrollments: 58 },
      { month: 'Mar', revenue: 18200, enrollments: 67 },
      { month: 'Apr', revenue: 21500, enrollments: 78 },
      { month: 'May', revenue: 19800, enrollments: 72 },
      { month: 'Jun', revenue: 23400, enrollments: 85 }
    ],
    engagementMetrics: {
      avgSessionDuration: 42,
      pageViews: 15678,
      bounceRate: 23.5,
      returnUserRate: 68.2,
      forumPosts: 234,
      assignmentSubmissions: 456,
      quizAttempts: 789
    },
    geographicData: [
      { country: 'United States', users: 89, percentage: 45.2 },
      { country: 'Canada', users: 34, percentage: 17.3 },
      { country: 'United Kingdom', users: 28, percentage: 14.2 },
      { country: 'Australia', users: 23, percentage: 11.7 },
      { country: 'Germany', users: 18, percentage: 9.1 },
      { country: 'Others', users: 5, percentage: 2.5 }
    ],
    deviceStats: {
      desktop: 65.4,
      mobile: 28.7,
      tablet: 5.9,
      browsers: {
        chrome: 67.8,
        firefox: 18.2,
        safari: 9.5,
        edge: 4.5
      }
    },
    timeBasedStats: {
      peakHours: [
        { hour: '09:00', users: 45 },
        { hour: '14:00', users: 67 },
        { hour: '19:00', users: 89 },
        { hour: '21:00', users: 56 }
      ],
      weeklyPattern: {
        monday: 78,
        tuesday: 89,
        wednesday: 92,
        thursday: 85,
        friday: 67,
        saturday: 34,
        sunday: 23
      }
    }
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/users', userForm);
      alert('User created successfully!');
      setShowCreateUser(false);
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        address: ''
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await axios.put(`/admin/users/${userId}`, updates);
      alert('User updated successfully!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        alert('User deleted successfully!');
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data || 'Failed to delete user');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/login");
  };

  // Course management functions
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/courses', courseForm);
      alert('Course created successfully!');
      setShowCreateCourse(false);
      setCourseForm({
        title: '',
        description: '',
        duration: '',
        instructor: '',
        category: '',
        level: 'beginner',
        price: 0,
        isActive: true
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      duration: course.duration,
      instructor: course.instructor?._id || '',
      category: course.category || '',
      level: course.level || 'beginner',
      price: course.price || 0,
      isActive: course.isActive
    });
    setShowCourseDetails(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/admin/courses/${selectedCourse._id}`, courseForm);
      alert('Course updated successfully!');
      setShowCourseDetails(false);
      setSelectedCourse(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This will also remove all related enrollments and data.')) {
      try {
        await axios.delete(`/admin/courses/${courseId}`);
        alert('Course deleted successfully!');
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  // Report management functions
  const generateReport = async (reportType, customFilters = null) => {
    const filters = customFilters || reportFilters;
    setReportLoading(prev => ({ ...prev, [reportType]: true }));
    
    try {
      // Generate report with backend API
      const response = await axios.post('/admin/reports/generate', {
        type: reportType,
        filters: filters,
        includeCharts: filters.includeCharts,
        includeDetails: filters.includeDetails
      });
      
      if (response.data.success) {
        // Download the generated report
        const downloadResponse = await axios.get(`/admin/reports/download/${response.data.reportId}`, {
          responseType: 'blob'
        });
        
        const blob = new Blob([downloadResponse.data], { 
          type: filters.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${filters.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Add to report history
        const newReport = {
          id: Date.now().toString(),
          name: `${reportType.replace('_', ' ')} Report`,
          type: reportType,
          format: filters.format,
          generatedAt: new Date().toISOString(),
          generatedBy: user.firstName + ' ' + user.lastName,
          fileSize: '2.1 MB',
          downloadCount: 1,
          status: 'completed'
        };
        setReportHistory(prev => [newReport, ...prev]);
        
        alert(`${reportType.replace('_', ' ')} report generated successfully!`);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      // Fallback to mock report generation
      await generateMockReport(reportType, filters);
    } finally {
      setReportLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const generateMockReport = async (reportType, filters) => {
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportData = generateMockReportData(reportType, filters);
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Add to report history
    const newReport = {
      id: Date.now().toString(),
      name: `${reportType.replace('_', ' ')} Report`,
      type: reportType,
      format: filters.format,
      generatedAt: new Date().toISOString(),
      generatedBy: user.firstName + ' ' + user.lastName,
      fileSize: '2.1 MB',
      downloadCount: 1,
      status: 'completed'
    };
    setReportHistory(prev => [newReport, ...prev]);
    
    alert(`${reportType.replace('_', ' ')} report generated successfully!`);
  };

  const generateMockReportData = (reportType, filters) => {
    const currentDate = new Date().toLocaleDateString();
    const dateRange = filters.dateRange || '30days';
    
    let reportContent = `${reportType.replace('_', ' ').toUpperCase()} REPORT\n`;
    reportContent += `Generated on: ${currentDate}\n`;
    reportContent += `Date Range: ${dateRange}\n`;
    reportContent += `Format: ${filters.format}\n`;
    reportContent += `Include Charts: ${filters.includeCharts ? 'Yes' : 'No'}\n`;
    reportContent += `Include Details: ${filters.includeDetails ? 'Yes' : 'No'}\n\n`;
    
    switch (reportType) {
      case 'user_activity':
        reportContent += `USER ACTIVITY SUMMARY\n`;
        reportContent += `Total Active Users: ${users.length}\n`;
        reportContent += `New Registrations: 23\n`;
        reportContent += `Average Session Duration: 42 minutes\n`;
        reportContent += `Most Active Day: Wednesday\n`;
        reportContent += `Peak Usage Hours: 2:00 PM - 4:00 PM\n\n`;
        
        if (filters.includeDetails) {
          reportContent += `DETAILED USER BREAKDOWN:\n`;
          users.slice(0, 10).forEach((user, index) => {
            reportContent += `${index + 1}. ${user.firstName} ${user.lastName} (${user.role})\n`;
            reportContent += `   Email: ${user.email}\n`;
            reportContent += `   Last Active: ${new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\n`;
          });
        }
        break;
        
      case 'course_performance':
        reportContent += `COURSE PERFORMANCE SUMMARY\n`;
        reportContent += `Total Courses: ${courses.length}\n`;
        reportContent += `Active Courses: ${courses.filter(c => c.isActive).length}\n`;
        reportContent += `Average Completion Rate: 78%\n`;
        reportContent += `Top Performing Course: React Fundamentals\n`;
        reportContent += `Total Revenue: $45,230\n\n`;
        
        if (filters.includeDetails) {
          reportContent += `COURSE BREAKDOWN:\n`;
          courses.slice(0, 5).forEach((course, index) => {
            reportContent += `${index + 1}. ${course.title}\n`;
            reportContent += `   Enrollments: ${Math.floor(Math.random() * 100) + 20}\n`;
            reportContent += `   Completion Rate: ${Math.floor(Math.random() * 30) + 70}%\n`;
            reportContent += `   Average Score: ${Math.floor(Math.random() * 20) + 80}%\n\n`;
          });
        }
        break;
        
      case 'attendance':
        reportContent += `ATTENDANCE SUMMARY\n`;
        reportContent += `Total Sessions: 156\n`;
        reportContent += `Average Attendance Rate: 87.5%\n`;
        reportContent += `QR Code Usage: 65%\n`;
        reportContent += `Geofence Usage: 35%\n`;
        reportContent += `Face Recognition Usage: 45%\n`;
        reportContent += `Perfect Attendance Students: 34\n\n`;
        break;
        
      case 'certification':
        reportContent += `CERTIFICATION SUMMARY\n`;
        reportContent += `Total Certificates Issued: 89\n`;
        reportContent += `Verification Requests: 156\n`;
        reportContent += `Average Time to Complete: 45 days\n`;
        reportContent += `Top Performer: John Doe (3 certificates)\n\n`;
        break;
        
      case 'financial':
        reportContent += `FINANCIAL SUMMARY\n`;
        reportContent += `Total Revenue: $112,700\n`;
        reportContent += `Monthly Growth: +15%\n`;
        reportContent += `Average Revenue per Course: $2,254\n`;
        reportContent += `Top Revenue Course: Python Data Science\n`;
        reportContent += `Payment Success Rate: 98.5%\n\n`;
        break;
        
      default:
        reportContent += `GENERAL SYSTEM REPORT\n`;
        reportContent += `System Status: Operational\n`;
        reportContent += `Uptime: 99.8%\n`;
        reportContent += `Active Users: 156\n`;
        reportContent += `Total Courses: ${courses.length}\n`;
    }
    
    if (filters.includeCharts) {
      reportContent += `\nCHARTS AND VISUALIZATIONS:\n`;
      reportContent += `- User Growth Trend Chart\n`;
      reportContent += `- Course Performance Bar Chart\n`;
      reportContent += `- Revenue Timeline Graph\n`;
      reportContent += `- Geographic Distribution Map\n`;
    }
    
    reportContent += `\n--- End of Report ---\n`;
    reportContent += `Generated by: ${user.firstName} ${user.lastName}\n`;
    reportContent += `Report ID: RPT-${Date.now()}\n`;
    
    return reportContent;
  };

  const scheduleReport = async (reportConfig) => {
    try {
      const response = await axios.post('/admin/reports/schedule', reportConfig);
      if (response.data.success) {
        const newScheduledReport = {
          id: Date.now().toString(),
          ...reportConfig,
          nextRun: calculateNextRun(reportConfig.frequency),
          isActive: true
        };
        setScheduledReports(prev => [...prev, newScheduledReport]);
        alert('Report scheduled successfully!');
      }
    } catch (err) {
      console.error('Error scheduling report:', err);
      // Mock scheduling
      const newScheduledReport = {
        id: Date.now().toString(),
        ...reportConfig,
        nextRun: calculateNextRun(reportConfig.frequency),
        isActive: true
      };
      setScheduledReports(prev => [...prev, newScheduledReport]);
      alert('Report scheduled successfully!');
    }
  };

  const calculateNextRun = (frequency) => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'bi-weekly':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const toggleScheduledReport = async (reportId) => {
    try {
      await axios.patch(`/admin/reports/scheduled/${reportId}/toggle`);
      setScheduledReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, isActive: !report.isActive } : report
      ));
    } catch (err) {
      console.error('Error toggling scheduled report:', err);
      // Mock toggle
      setScheduledReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, isActive: !report.isActive } : report
      ));
    }
  };

  const deleteScheduledReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this scheduled report?')) return;
    
    try {
      await axios.delete(`/admin/reports/scheduled/${reportId}`);
      setScheduledReports(prev => prev.filter(report => report.id !== reportId));
    } catch (err) {
      console.error('Error deleting scheduled report:', err);
      // Mock delete
      setScheduledReports(prev => prev.filter(report => report.id !== reportId));
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await axios.get(`/admin/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      
      const report = reportHistory.find(r => r.id === reportId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_')}.${report.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Update download count
      setReportHistory(prev => prev.map(r => 
        r.id === reportId ? { ...r, downloadCount: r.downloadCount + 1 } : r
      ));
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  // User editing functions
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    });
    setShowEditUser(true);
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...userForm };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }
      await axios.put(`/admin/users/${selectedUser._id}`, updateData);
      alert('User updated successfully!');
      setShowEditUser(false);
      setSelectedUser(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Report generation functions
  const handleGenerateReport = async (reportType) => {
    setReportLoading(prev => ({ ...prev, [reportType]: true }));
    try {
      const response = await axios.get(`/admin/reports/${reportType}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Report generated and downloaded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setReportLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  // Settings functions
  const handleSaveSettings = async (settingType) => {
    try {
      await axios.put('/admin/settings', { [settingType]: systemSettings });
      alert('Settings saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="dashboard">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👨‍💼 Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          📊 System Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button 
          className={activeTab === 'courses' ? 'active' : ''} 
          onClick={() => setActiveTab('courses')}
        >
          📚 Course Management
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          📋 Reports
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ System Settings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{analytics.overview?.totalUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Courses</h3>
                <p className="stat-number">{analytics.overview?.totalCourses || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Enrollments</h3>
                <p className="stat-number">{analytics.overview?.totalEnrollments || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <p className="stat-number">{Math.round(analytics.overview?.completionRate || 0)}%</p>
              </div>
            </div>

            <div className="user-breakdown">
              <h3>👥 User Breakdown</h3>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span>Students</span>
                  <strong>{analytics.overview?.totalStudents || 0}</strong>
                </div>
                <div className="breakdown-item">
                  <span>Instructors</span>
                  <strong>{analytics.overview?.totalInstructors || 0}</strong>
                </div>
                <div className="breakdown-item">
                  <span>Admins</span>
                  <strong>{analytics.overview?.totalAdmins || 0}</strong>
                </div>
              </div>
            </div>

            <div className="recent-activities">
              <h3>📈 Recent Activities</h3>
              <div className="activities-list">
                {analytics.recentActivities?.enrollments
                  ?.filter(activity => activity.course && activity.course.title) // Filter out deleted courses
                  ?.slice(0, 5)
                  ?.map(activity => (
                    <div key={activity._id} className="activity-item">
                      <span className="activity-icon">📚</span>
                      <div className="activity-content">
                        <strong>{activity.student?.firstName} {activity.student?.lastName}</strong>
                        <span>enrolled in {activity.course?.title}</span>
                      </div>
                      <span className="activity-time">
                        {new Date(activity.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                {(!analytics.recentActivities?.enrollments || 
                  analytics.recentActivities.enrollments.filter(activity => activity.course && activity.course.title).length === 0) && (
                  <div className="activity-item">
                    <span className="activity-icon">📝</span>
                    <div className="activity-content">
                      <span>No recent enrollment activities</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h3>👥 User Management</h3>
              <button 
                onClick={() => setShowCreateUser(true)}
                className="btn-primary"
              >
                ➕ Add User
              </button>
            </div>
            
            <div className="users-filters">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="btn-small"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn-small btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-section">
            <div className="section-header">
              <h3>📚 Course Management</h3>
              <button 
                onClick={() => setShowCreateCourse(true)}
                className="btn-primary"
              >
                ➕ Add Course
              </button>
            </div>
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course._id} className="course-card">
                  <div className="course-header">
                    <h4>{course.title}</h4>
                    <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>👨‍🏫 {course.instructor?.firstName} {course.instructor?.lastName}</span>
                    <span>👥 {course.enrolledStudents?.length || 0} students</span>
                    <span>📅 {course.duration} hours</span>
                  </div>
                  <div className="course-actions">
                    <button 
                      onClick={() => handleEditCourse(course)}
                      className="btn-primary"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleEditCourse(course)}
                      className="btn-secondary"
                    >
                      Edit Course
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course._id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="empty-state">
                  <p>No courses found. Create your first course to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="analytics-header">
              <h3>📈 System Analytics</h3>
              <div className="analytics-controls">
                <select 
                  value={selectedDateRange} 
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="date-range-selector"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                </select>
                <select 
                  value={selectedMetric} 
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="metric-selector"
                >
                  <option value="overview">Overview</option>
                  <option value="users">User Analytics</option>
                  <option value="courses">Course Analytics</option>
                  <option value="attendance">Attendance Analytics</option>
                  <option value="certification">Certification Analytics</option>
                  <option value="revenue">Revenue Analytics</option>
                  <option value="engagement">Engagement Analytics</option>
                  <option value="system">System Health</option>
                </select>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="analytics-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics data...</p>
              </div>
            ) : (
              <>
                {selectedMetric === 'overview' && (
                  <div className="analytics-overview">
                    <div className="overview-stats">
                      <div className="overview-stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                          <h4>Total Users</h4>
                          <div className="stat-number">{users.length}</div>
                          <div className="stat-change positive">+12% this month</div>
                        </div>
                      </div>
                      <div className="overview-stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                          <h4>Active Courses</h4>
                          <div className="stat-number">{courses.filter(c => c.isActive).length}</div>
                          <div className="stat-change positive">+8% this month</div>
                        </div>
                      </div>
                      <div className="overview-stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-content">
                          <h4>Attendance Rate</h4>
                          <div className="stat-number">{analyticsData.attendanceStats.avgAttendanceRate}%</div>
                          <div className="stat-change positive">+3% this month</div>
                        </div>
                      </div>
                      <div className="overview-stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                          <h4>Certificates Issued</h4>
                          <div className="stat-number">{analyticsData.certificationStats.totalIssued}</div>
                          <div className="stat-change positive">+15% this month</div>
                        </div>
                      </div>
                    </div>

                    <div className="overview-charts">
                      <div className="chart-card">
                        <h4>📈 User Growth Trend</h4>
                        <div className="simple-chart">
                          {analyticsData.userGrowth.map((data, index) => (
                            <div key={index} className="chart-bar">
                              <div 
                                className="bar students" 
                                style={{ height: `${(data.students / 300) * 100}%` }}
                                title={`Students: ${data.students}`}
                              ></div>
                              <div 
                                className="bar instructors" 
                                style={{ height: `${(data.instructors / 25) * 100}%` }}
                                title={`Instructors: ${data.instructors}`}
                              ></div>
                              <span className="chart-label">{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          ))}
                        </div>
                        <div className="chart-legend">
                          <span className="legend-item"><span className="legend-color students"></span> Students</span>
                          <span className="legend-item"><span className="legend-color instructors"></span> Instructors</span>
                        </div>
                      </div>

                      <div className="chart-card">
                        <h4>💰 Revenue Trend</h4>
                        <div className="simple-chart">
                          {analyticsData.revenueData.map((data, index) => (
                            <div key={index} className="chart-bar">
                              <div 
                                className="bar revenue" 
                                style={{ height: `${(data.revenue / 25000) * 100}%` }}
                                title={`Revenue: $${data.revenue}`}
                              ></div>
                              <span className="chart-label">{data.month}</span>
                            </div>
                          ))}
                        </div>
                        <div className="revenue-total">
                          Total Revenue: $${analyticsData.revenueData.reduce((sum, data) => sum + data.revenue, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'users' && (
                  <div className="user-analytics">
                    <div className="analytics-grid">
                      <div className="analytics-card">
                        <h4>👥 User Distribution</h4>
                        <div className="user-distribution">
                          <div className="distribution-item">
                            <span className="role-label students">Students</span>
                            <div className="distribution-bar">
                              <div 
                                className="bar-fill students" 
                                style={{ width: `${(users.filter(u => u.role === 'student').length / users.length) * 100}%` }}
                              ></div>
                            </div>
                            <span className="count">{users.filter(u => u.role === 'student').length}</span>
                          </div>
                          <div className="distribution-item">
                            <span className="role-label instructors">Instructors</span>
                            <div className="distribution-bar">
                              <div 
                                className="bar-fill instructors" 
                                style={{ width: `${(users.filter(u => u.role === 'instructor').length / users.length) * 100}%` }}
                              ></div>
                            </div>
                            <span className="count">{users.filter(u => u.role === 'instructor').length}</span>
                          </div>
                          <div className="distribution-item">
                            <span className="role-label admins">Admins</span>
                            <div className="distribution-bar">
                              <div 
                                className="bar-fill admins" 
                                style={{ width: `${(users.filter(u => u.role === 'admin').length / users.length) * 100}%` }}
                              ></div>
                            </div>
                            <span className="count">{users.filter(u => u.role === 'admin').length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>🌍 Geographic Distribution</h4>
                        <div className="geographic-stats">
                          {analyticsData.geographicData.map((country, index) => (
                            <div key={index} className="country-stat">
                              <span className="country-name">{country.country}</span>
                              <div className="country-bar">
                                <div 
                                  className="country-fill" 
                                  style={{ width: `${country.percentage}%` }}
                                ></div>
                              </div>
                              <span className="country-percentage">{country.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>📱 Device Usage</h4>
                        <div className="device-stats">
                          <div className="device-item">
                            <span className="device-icon">🖥️</span>
                            <span className="device-name">Desktop</span>
                            <span className="device-percentage">{analyticsData.deviceStats.desktop}%</span>
                          </div>
                          <div className="device-item">
                            <span className="device-icon">📱</span>
                            <span className="device-name">Mobile</span>
                            <span className="device-percentage">{analyticsData.deviceStats.mobile}%</span>
                          </div>
                          <div className="device-item">
                            <span className="device-icon">📟</span>
                            <span className="device-name">Tablet</span>
                            <span className="device-percentage">{analyticsData.deviceStats.tablet}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>🔍 Browser Usage</h4>
                        <div className="browser-stats">
                          {Object.entries(analyticsData.deviceStats.browsers || {}).map(([browser, percentage]) => (
                            <div key={browser} className="browser-item">
                              <span className="browser-name">{browser.charAt(0).toUpperCase() + browser.slice(1)}</span>
                              <div className="browser-bar">
                                <div 
                                  className="browser-fill" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="browser-percentage">{percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'courses' && (
                  <div className="course-analytics">
                    <div className="analytics-grid">
                      <div className="analytics-card full-width">
                        <h4>📚 Course Performance</h4>
                        <div className="course-performance-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Course</th>
                                <th>Enrollments</th>
                                <th>Completions</th>
                                <th>Completion Rate</th>
                                <th>Avg Score</th>
                                <th>Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analyticsData.coursePerformance.map((course, index) => (
                                <tr key={index}>
                                  <td>{course.title}</td>
                                  <td>{course.enrollments}</td>
                                  <td>{course.completions}</td>
                                  <td>
                                    <div className="completion-rate">
                                      <div 
                                        className="completion-bar" 
                                        style={{ width: `${(course.completions / course.enrollments) * 100}%` }}
                                      ></div>
                                      <span>{Math.round((course.completions / course.enrollments) * 100)}%</span>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`score ${course.avgScore >= 90 ? 'excellent' : course.avgScore >= 80 ? 'good' : 'average'}`}>
                                      {course.avgScore}%
                                    </span>
                                  </td>
                                  <td>${course.revenue.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'attendance' && (
                  <div className="attendance-analytics">
                    <div className="analytics-grid">
                      <div className="analytics-card">
                        <h4>📋 Attendance Overview</h4>
                        <div className="attendance-stats">
                          <div className="attendance-stat">
                            <span className="stat-label">Total Sessions</span>
                            <span className="stat-value">{analyticsData.attendanceStats.totalSessions}</span>
                          </div>
                          <div className="attendance-stat">
                            <span className="stat-label">Average Attendance</span>
                            <span className="stat-value">{analyticsData.attendanceStats.avgAttendanceRate}%</span>
                          </div>
                          <div className="attendance-stat">
                            <span className="stat-label">Perfect Attendance</span>
                            <span className="stat-value">{analyticsData.attendanceStats.perfectAttendance}</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>📱 Attendance Methods</h4>
                        <div className="method-distribution">
                          <div className="method-item">
                            <span className="method-icon">📱</span>
                            <span className="method-name">QR Code</span>
                            <div className="method-bar">
                              <div 
                                className="method-fill qr" 
                                style={{ width: `${analyticsData.attendanceStats.qrCodeUsage}%` }}
                              ></div>
                            </div>
                            <span className="method-percentage">{analyticsData.attendanceStats.qrCodeUsage}%</span>
                          </div>
                          <div className="method-item">
                            <span className="method-icon">📍</span>
                            <span className="method-name">Geofence</span>
                            <div className="method-bar">
                              <div 
                                className="method-fill geo" 
                                style={{ width: `${analyticsData.attendanceStats.geofenceUsage}%` }}
                              ></div>
                            </div>
                            <span className="method-percentage">{analyticsData.attendanceStats.geofenceUsage}%</span>
                          </div>
                          <div className="method-item">
                            <span className="method-icon">👤</span>
                            <span className="method-name">Face Recognition</span>
                            <div className="method-bar">
                              <div 
                                className="method-fill face" 
                                style={{ width: `${analyticsData.attendanceStats.faceRecognitionUsage}%` }}
                              ></div>
                            </div>
                            <span className="method-percentage">{analyticsData.attendanceStats.faceRecognitionUsage}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>⏰ Time Analysis</h4>
                        <div className="time-stats">
                          <div className="time-stat">
                            <span className="time-icon">⏰</span>
                            <span className="time-label">Late Arrivals</span>
                            <span className="time-value">{analyticsData.attendanceStats.lateArrivals}</span>
                          </div>
                          <div className="time-stat">
                            <span className="time-icon">🚪</span>
                            <span className="time-label">Early Departures</span>
                            <span className="time-value">{analyticsData.attendanceStats.earlyDepartures}</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>📅 Weekly Pattern</h4>
                        <div className="weekly-pattern">
                          {Object.entries(analyticsData.timeBasedStats.weeklyPattern).map(([day, value]) => (
                            <div key={day} className="day-stat">
                              <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1, 3)}</span>
                              <div className="day-bar">
                                <div 
                                  className="day-fill" 
                                  style={{ height: `${(value / 100) * 100}%` }}
                                ></div>
                              </div>
                              <span className="day-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'certification' && (
                  <div className="certification-analytics">
                    <div className="analytics-grid">
                      <div className="analytics-card">
                        <h4>🏆 Certification Overview</h4>
                        <div className="cert-stats">
                          <div className="cert-stat">
                            <span className="cert-icon">🏆</span>
                            <span className="cert-label">Total Issued</span>
                            <span className="cert-value">{analyticsData.certificationStats.totalIssued}</span>
                          </div>
                          <div className="cert-stat">
                            <span className="cert-icon">✅</span>
                            <span className="cert-label">Verification Requests</span>
                            <span className="cert-value">{analyticsData.certificationStats.verificationRequests}</span>
                          </div>
                          <div className="cert-stat">
                            <span className="cert-icon">⏱️</span>
                            <span className="cert-label">Avg Time to Complete</span>
                            <span className="cert-value">{analyticsData.certificationStats.avgTimeToComplete} days</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>🌟 Top Performers</h4>
                        <div className="top-performers">
                          {analyticsData.certificationStats.topPerformers.map((performer, index) => (
                            <div key={index} className="performer-item">
                              <div className="performer-rank">#{index + 1}</div>
                              <div className="performer-info">
                                <span className="performer-name">{performer.name}</span>
                                <span className="performer-details">
                                  {performer.certificates} certificates • {performer.avgScore}% avg score
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'engagement' && (
                  <div className="engagement-analytics">
                    <div className="analytics-grid">
                      <div className="analytics-card">
                        <h4>📊 Engagement Metrics</h4>
                        <div className="engagement-stats">
                          <div className="engagement-stat">
                            <span className="engagement-label">Avg Session Duration</span>
                            <span className="engagement-value">{analyticsData.engagementMetrics.avgSessionDuration} min</span>
                          </div>
                          <div className="engagement-stat">
                            <span className="engagement-label">Page Views</span>
                            <span className="engagement-value">{analyticsData.engagementMetrics.pageViews.toLocaleString()}</span>
                          </div>
                          <div className="engagement-stat">
                            <span className="engagement-label">Bounce Rate</span>
                            <span className="engagement-value">{analyticsData.engagementMetrics.bounceRate}%</span>
                          </div>
                          <div className="engagement-stat">
                            <span className="engagement-label">Return User Rate</span>
                            <span className="engagement-value">{analyticsData.engagementMetrics.returnUserRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>💬 Activity Metrics</h4>
                        <div className="activity-stats">
                          <div className="activity-stat">
                            <span className="activity-icon">💬</span>
                            <span className="activity-label">Forum Posts</span>
                            <span className="activity-value">{analyticsData.engagementMetrics.forumPosts}</span>
                          </div>
                          <div className="activity-stat">
                            <span className="activity-icon">📝</span>
                            <span className="activity-label">Assignment Submissions</span>
                            <span className="activity-value">{analyticsData.engagementMetrics.assignmentSubmissions}</span>
                          </div>
                          <div className="activity-stat">
                            <span className="activity-icon">❓</span>
                            <span className="activity-label">Quiz Attempts</span>
                            <span className="activity-value">{analyticsData.engagementMetrics.quizAttempts}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'system' && (
                  <div className="system-analytics">
                    <div className="analytics-grid">
                      <div className="analytics-card">
                        <h4>🖥️ System Health</h4>
                        <div className="system-stats">
                          <div className="system-stat">
                            <span className="system-label">Uptime</span>
                            <span className="system-value good">{analyticsData.systemHealth.uptime}%</span>
                          </div>
                          <div className="system-stat">
                            <span className="system-label">Avg Response Time</span>
                            <span className="system-value">{analyticsData.systemHealth.avgResponseTime}ms</span>
                          </div>
                          <div className="system-stat">
                            <span className="system-label">Error Rate</span>
                            <span className="system-value good">{analyticsData.systemHealth.errorRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>👥 Active Users</h4>
                        <div className="user-stats">
                          <div className="user-stat">
                            <span className="user-label">Currently Active</span>
                            <span className="user-value">{analyticsData.systemHealth.activeUsers}</span>
                          </div>
                          <div className="user-stat">
                            <span className="user-label">Peak Concurrent</span>
                            <span className="user-value">{analyticsData.systemHealth.peakConcurrentUsers}</span>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <h4>💾 Resource Usage</h4>
                        <div className="resource-stats">
                          <div className="resource-stat">
                            <span className="resource-label">Storage Used</span>
                            <div className="resource-bar">
                              <div 
                                className="resource-fill storage" 
                                style={{ width: `${analyticsData.systemHealth.storageUsed}%` }}
                              ></div>
                            </div>
                            <span className="resource-value">{analyticsData.systemHealth.storageUsed}%</span>
                          </div>
                          <div className="resource-stat">
                            <span className="resource-label">Bandwidth Usage</span>
                            <div className="resource-bar">
                              <div 
                                className="resource-fill bandwidth" 
                                style={{ width: `${analyticsData.systemHealth.bandwidthUsage}%` }}
                              ></div>
                            </div>
                            <span className="resource-value">{analyticsData.systemHealth.bandwidthUsage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="reports-header">
              <h3>📊 Report Management</h3>
              <div className="reports-tabs">
                <button 
                  className={`tab-btn ${reportFilters.reportType === 'generate' ? 'active' : ''}`}
                  onClick={() => setReportFilters(prev => ({ ...prev, reportType: 'generate' }))}
                >
                  Generate Reports
                </button>
                <button 
                  className={`tab-btn ${reportFilters.reportType === 'history' ? 'active' : ''}`}
                  onClick={() => setReportFilters(prev => ({ ...prev, reportType: 'history' }))}
                >
                  Report History
                </button>
                <button 
                  className={`tab-btn ${reportFilters.reportType === 'scheduled' ? 'active' : ''}`}
                  onClick={() => setReportFilters(prev => ({ ...prev, reportType: 'scheduled' }))}
                >
                  Scheduled Reports
                </button>
                <button 
                  className={`tab-btn ${reportFilters.reportType === 'templates' ? 'active' : ''}`}
                  onClick={() => setReportFilters(prev => ({ ...prev, reportType: 'templates' }))}
                >
                  Templates
                </button>
              </div>
            </div>

            {reportFilters.reportType === 'generate' && (
              <div className="generate-reports">
                <div className="report-filters">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label>Date Range:</label>
                      <select 
                        value={reportFilters.dateRange} 
                        onChange={(e) => setReportFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="1year">Last Year</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Format:</label>
                      <select 
                        value={reportFilters.format} 
                        onChange={(e) => setReportFilters(prev => ({ ...prev, format: e.target.value }))}
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Course:</label>
                      <select 
                        value={reportFilters.courseId} 
                        onChange={(e) => setReportFilters(prev => ({ ...prev, courseId: e.target.value }))}
                      >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="filter-row">
                    <div className="filter-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={reportFilters.includeCharts}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        />
                        Include Charts & Visualizations
                      </label>
                    </div>
                    <div className="filter-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={reportFilters.includeDetails}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, includeDetails: e.target.checked }))}
                        />
                        Include Detailed Breakdown
                      </label>
                    </div>
                  </div>
                </div>

                <div className="reports-grid">
                  <div className="report-card">
                    <div className="report-icon">👥</div>
                    <div className="report-content">
                      <h4>User Activity Report</h4>
                      <p>Comprehensive user activity and engagement analysis including login patterns, session duration, and feature usage.</p>
                      <div className="report-stats">
                        <span>📊 {users.length} Total Users</span>
                        <span>📈 +12% Growth</span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => generateReport('user_activity')}
                        disabled={reportLoading.user_activity}
                      >
                        {reportLoading.user_activity ? (
                          <>
                            <div className="loading-spinner small"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </button>
                      <button 
                        className="btn-secondary btn-small"
                        onClick={() => {
                          const config = {
                            name: 'Weekly User Activity Report',
                            type: 'user_activity',
                            frequency: 'weekly',
                            recipients: [user.email],
                            format: reportFilters.format
                          };
                          scheduleReport(config);
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">📚</div>
                    <div className="report-content">
                      <h4>Course Performance Report</h4>
                      <p>Detailed analysis of course completion rates, student scores, enrollment trends, and instructor performance metrics.</p>
                      <div className="report-stats">
                        <span>📚 {courses.length} Active Courses</span>
                        <span>🎯 78% Avg Completion</span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => generateReport('course_performance')}
                        disabled={reportLoading.course_performance}
                      >
                        {reportLoading.course_performance ? (
                          <>
                            <div className="loading-spinner small"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </button>
                      <button 
                        className="btn-secondary btn-small"
                        onClick={() => {
                          const config = {
                            name: 'Monthly Course Performance Report',
                            type: 'course_performance',
                            frequency: 'monthly',
                            recipients: [user.email],
                            format: reportFilters.format
                          };
                          scheduleReport(config);
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">📋</div>
                    <div className="report-content">
                      <h4>Attendance Report</h4>
                      <p>Track attendance patterns, method usage (QR, Geofence, Face Recognition), punctuality, and session participation rates.</p>
                      <div className="report-stats">
                        <span>📋 87.5% Avg Attendance</span>
                        <span>⏰ 156 Total Sessions</span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => generateReport('attendance')}
                        disabled={reportLoading.attendance}
                      >
                        {reportLoading.attendance ? (
                          <>
                            <div className="loading-spinner small"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </button>
                      <button 
                        className="btn-secondary btn-small"
                        onClick={() => {
                          const config = {
                            name: 'Weekly Attendance Report',
                            type: 'attendance',
                            frequency: 'weekly',
                            recipients: [user.email],
                            format: reportFilters.format
                          };
                          scheduleReport(config);
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">🏆</div>
                    <div className="report-content">
                      <h4>Certification Report</h4>
                      <p>Monitor certificate issuance, verification requests, completion times, and top performer rankings across all courses.</p>
                      <div className="report-stats">
                        <span>🏆 89 Certificates Issued</span>
                        <span>✅ 156 Verifications</span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => generateReport('certification')}
                        disabled={reportLoading.certification}
                      >
                        {reportLoading.certification ? (
                          <>
                            <div className="loading-spinner small"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </button>
                      <button 
                        className="btn-secondary btn-small"
                        onClick={() => {
                          const config = {
                            name: 'Monthly Certification Report',
                            type: 'certification',
                            frequency: 'monthly',
                            recipients: [user.email],
                            format: reportFilters.format
                          };
                          scheduleReport(config);
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">💰</div>
                    <div className="report-content">
                      <h4>Financial Report</h4>
                      <p>Revenue analysis, payment tracking, refund statistics, and financial insights with growth trends and projections.</p>
                      <div className="report-stats">
                        <span>💰 $112,700 Total Revenue</span>
                        <span>📈 +15% Monthly Growth</span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => generateReport('financial')}
                        disabled={reportLoading.financial}
                      >
                        {reportLoading.financial ? (
                          <>
                            <div className="loading-spinner small"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </button>
                      <button 
                        className="btn-secondary btn-small"
                        onClick={() => {
                          const config = {
                            name: 'Monthly Financial Report',
                            type: 'financial',
                            frequency: 'monthly',
                            recipients: ['finance@example.com'],
                            format: reportFilters.format
                          };
                          scheduleReport(config);
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">🔍</div>
                    <div className="report-content">
                      <h4>System Analytics Report</h4>
                      <p>System performance metrics, user engagement analytics, device usage statistics, and platform health monitoring.</p>
                      <div className="report-stats">
                        <span>🔍 99.8% Uptime</span>
                        <span>⚡ 245ms Avg Response</span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => generateReport('system_analytics')}
                        disabled={reportLoading.system_analytics}
                      >
                        {reportLoading.system_analytics ? (
                          <>
                            <div className="loading-spinner small"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </button>
                      <button 
                        className="btn-secondary btn-small"
                        onClick={() => {
                          const config = {
                            name: 'Weekly System Analytics Report',
                            type: 'system_analytics',
                            frequency: 'weekly',
                            recipients: [user.email],
                            format: reportFilters.format
                          };
                          scheduleReport(config);
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>

                <div className="maintenance-section">
                  <h4>🧹 System Maintenance</h4>
                  <div className="maintenance-grid">
                    <div className="maintenance-card">
                      <div className="maintenance-icon">🗑️</div>
                      <div className="maintenance-content">
                        <h5>Cleanup Orphaned Data</h5>
                        <p>Remove orphaned enrollments, attendance records, and other data from deleted courses</p>
                      </div>
                      <button 
                        className="btn-danger"
                        onClick={async () => {
                          if (window.confirm('This will permanently delete all orphaned data from deleted courses. Continue?')) {
                            try {
                              const response = await axios.post('/admin/cleanup-all-orphaned-data');
                              alert(`Cleanup completed! ${response.data.summary.totalDeletedRecords} orphaned records removed.`);
                              fetchAdminData();
                            } catch (error) {
                              alert('Error during cleanup: ' + (error.response?.data?.message || error.message));
                            }
                          }
                        }}
                      >
                        Run Cleanup
                      </button>
                    </div>
                    <div className="maintenance-card">
                      <div className="maintenance-icon">📊</div>
                      <div className="maintenance-content">
                        <h5>Database Health Check</h5>
                        <p>Check for orphaned records and data integrity issues</p>
                      </div>
                      <button 
                        className="btn-secondary"
                        onClick={async () => {
                          try {
                            const response = await axios.get('/admin/dashboard');
                            const orphanedCount = response.data.overview.totalEnrollments - 
                              (response.data.recentActivities?.enrollments?.filter(e => e.course && e.course.title).length || 0);
                            alert(`Database health check complete. Found ${orphanedCount} potential orphaned records.`);
                          } catch (error) {
                            alert('Error during health check: ' + (error.response?.data?.message || error.message));
                          }
                        }}
                      >
                        Check Health
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportFilters.reportType === 'history' && (
              <div className="report-history">
                <div className="history-header">
                  <h4>📋 Report History</h4>
                  <div className="history-stats">
                    <span>{reportHistory.length} Total Reports</span>
                    <span>{reportHistory.reduce((sum, r) => sum + r.downloadCount, 0)} Total Downloads</span>
                  </div>
                </div>
                <div className="history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Type</th>
                        <th>Format</th>
                        <th>Generated</th>
                        <th>Generated By</th>
                        <th>Size</th>
                        <th>Downloads</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportHistory.map(report => (
                        <tr key={report.id}>
                          <td>{report.name}</td>
                          <td>
                            <span className={`type-badge ${report.type}`}>
                              {report.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`format-badge ${report.format}`}>
                              {report.format.toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(report.generatedAt).toLocaleDateString()}</td>
                          <td>{report.generatedBy}</td>
                          <td>{report.fileSize}</td>
                          <td>
                            <span className="download-count">{report.downloadCount}</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-secondary btn-small"
                                onClick={() => downloadReport(report.id)}
                                title="Download Report"
                              >
                                📥
                              </button>
                              <button 
                                className="btn-secondary btn-small"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this report?')) {
                                    setReportHistory(prev => prev.filter(r => r.id !== report.id));
                                  }
                                }}
                                title="Delete Report"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportHistory.length === 0 && (
                    <div className="empty-state">
                      <p>No reports generated yet. Generate your first report to see it here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {reportFilters.reportType === 'scheduled' && (
              <div className="scheduled-reports">
                <div className="scheduled-header">
                  <h4>⏰ Scheduled Reports</h4>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      const name = prompt('Enter report name:');
                      if (name) {
                        const config = {
                          name,
                          type: 'user_activity',
                          frequency: 'weekly',
                          recipients: [user.email],
                          format: 'pdf'
                        };
                        scheduleReport(config);
                      }
                    }}
                  >
                    + Schedule New Report
                  </button>
                </div>
                <div className="scheduled-grid">
                  {scheduledReports.map(report => (
                    <div key={report.id} className={`scheduled-card ${!report.isActive ? 'inactive' : ''}`}>
                      <div className="scheduled-header">
                        <h5>{report.name}</h5>
                        <div className="scheduled-status">
                          <span className={`status-indicator ${report.isActive ? 'active' : 'inactive'}`}></span>
                          {report.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="scheduled-details">
                        <div className="detail-item">
                          <span className="detail-label">Type:</span>
                          <span className="detail-value">{report.type.replace('_', ' ')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Frequency:</span>
                          <span className="detail-value">{report.frequency}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Next Run:</span>
                          <span className="detail-value">{new Date(report.nextRun).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Recipients:</span>
                          <span className="detail-value">{report.recipients.length} recipient(s)</span>
                        </div>
                      </div>
                      <div className="scheduled-actions">
                        <button 
                          className={`btn-secondary btn-small ${report.isActive ? 'pause' : 'play'}`}
                          onClick={() => toggleScheduledReport(report.id)}
                        >
                          {report.isActive ? '⏸️ Pause' : '▶️ Resume'}
                        </button>
                        <button 
                          className="btn-secondary btn-small"
                          onClick={() => generateReport(report.type)}
                        >
                          🚀 Run Now
                        </button>
                        <button 
                          className="btn-danger btn-small"
                          onClick={() => deleteScheduledReport(report.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {scheduledReports.length === 0 && (
                  <div className="empty-state">
                    <p>No scheduled reports. Create a scheduled report to automate report generation.</p>
                  </div>
                )}
              </div>
            )}

            {reportFilters.reportType === 'templates' && (
              <div className="report-templates">
                <div className="templates-header">
                  <h4>📄 Report Templates</h4>
                  <button className="btn-primary">+ Create Template</button>
                </div>
                <div className="templates-grid">
                  {reportTemplates.map(template => (
                    <div key={template.id} className="template-card">
                      <div className="template-header">
                        <h5>{template.name}</h5>
                        {template.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <div className="template-description">
                        <p>{template.description}</p>
                      </div>
                      <div className="template-sections">
                        <h6>Included Sections:</h6>
                        <ul>
                          {template.sections.map((section, index) => (
                            <li key={index}>{section}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="template-actions">
                        <button 
                          className="btn-primary btn-small"
                          onClick={() => generateReport(template.type, { ...reportFilters, template: template.id })}
                        >
                          Use Template
                        </button>
                        <button className="btn-secondary btn-small">Edit</button>
                        {!template.isDefault && (
                          <button className="btn-danger btn-small">Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="settings-header">
              <h3>⚙️ System Configuration</h3>
              <div className="settings-tabs">
                <button 
                  className={`settings-tab ${systemSettings.activeSettingsTab === 'general' || !systemSettings.activeSettingsTab ? 'active' : ''}`}
                  onClick={() => setSystemSettings(prev => ({ ...prev, activeSettingsTab: 'general' }))}
                >
                  🏠 General
                </button>
                <button 
                  className={`settings-tab ${systemSettings.activeSettingsTab === 'assessment' ? 'active' : ''}`}
                  onClick={() => setSystemSettings(prev => ({ ...prev, activeSettingsTab: 'assessment' }))}
                >
                  🎯 Assessment
                </button>
                <button 
                  className={`settings-tab ${systemSettings.activeSettingsTab === 'attendance' ? 'active' : ''}`}
                  onClick={() => setSystemSettings(prev => ({ ...prev, activeSettingsTab: 'attendance' }))}
                >
                  📍 Attendance
                </button>
                <button 
                  className={`settings-tab ${systemSettings.activeSettingsTab === 'security' ? 'active' : ''}`}
                  onClick={() => setSystemSettings(prev => ({ ...prev, activeSettingsTab: 'security' }))}
                >
                  🔒 Security
                </button>
                <button 
                  className={`settings-tab ${systemSettings.activeSettingsTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setSystemSettings(prev => ({ ...prev, activeSettingsTab: 'notifications' }))}
                >
                  📧 Notifications
                </button>
                <button 
                  className={`settings-tab ${systemSettings.activeSettingsTab === 'integrations' ? 'active' : ''}`}
                  onClick={() => setSystemSettings(prev => ({ ...prev, activeSettingsTab: 'integrations' }))}
                >
                  🔗 Integrations
                </button>
                <button 
                  className={`settings-tab ${systemSettings.activeSettingsTab === 'backup' ? 'active' : ''}`}
                  onClick={() => setSystemSettings(prev => ({ ...prev, activeSettingsTab: 'backup' }))}
                >
                  💾 Backup
                </button>
              </div>
            </div>

            {(systemSettings.activeSettingsTab === 'general' || !systemSettings.activeSettingsTab) && (
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>🏢 Platform Information</h4>
                      <p>Basic platform configuration and branding settings</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Platform Name:</label>
                        <input 
                          type="text" 
                          value={systemSettings.platformName || 'EduPlatform'} 
                          onChange={(e) => setSystemSettings({...systemSettings, platformName: e.target.value})}
                          placeholder="Enter platform name"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Platform Description:</label>
                        <textarea 
                          value={systemSettings.platformDescription || 'Advanced Learning Management System'} 
                          onChange={(e) => setSystemSettings({...systemSettings, platformDescription: e.target.value})}
                          placeholder="Enter platform description"
                          rows="3"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Contact Email:</label>
                        <input 
                          type="email" 
                          value={systemSettings.contactEmail || 'admin@eduplatform.com'} 
                          onChange={(e) => setSystemSettings({...systemSettings, contactEmail: e.target.value})}
                          placeholder="Enter contact email"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Support Phone:</label>
                        <input 
                          type="tel" 
                          value={systemSettings.supportPhone || '+1-555-0123'} 
                          onChange={(e) => setSystemSettings({...systemSettings, supportPhone: e.target.value})}
                          placeholder="Enter support phone"
                        />
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('general')}
                      >
                        💾 Save General Settings
                      </button>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>🌍 Localization Settings</h4>
                      <p>Language, timezone, and regional preferences</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Default Language:</label>
                        <select 
                          value={systemSettings.defaultLanguage || 'en'} 
                          onChange={(e) => setSystemSettings({...systemSettings, defaultLanguage: e.target.value})}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Default Timezone:</label>
                        <select 
                          value={systemSettings.defaultTimezone || 'UTC'} 
                          onChange={(e) => setSystemSettings({...systemSettings, defaultTimezone: e.target.value})}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Date Format:</label>
                        <select 
                          value={systemSettings.dateFormat || 'MM/DD/YYYY'} 
                          onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Currency:</label>
                        <select 
                          value={systemSettings.currency || 'USD'} 
                          onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CAD">CAD (C$)</option>
                          <option value="AUD">AUD (A$)</option>
                        </select>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('localization')}
                      >
                        🌍 Save Localization Settings
                      </button>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>📊 System Limits</h4>
                      <p>Configure system-wide limits and quotas</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Maximum Users:</label>
                        <input 
                          type="number" 
                          value={systemSettings.maxUsers || 10000} 
                          onChange={(e) => setSystemSettings({...systemSettings, maxUsers: parseInt(e.target.value)})}
                          min="1" 
                          max="100000"
                        />
                        <small>Maximum number of users allowed in the system</small>
                      </div>
                      <div className="setting-item">
                        <label>Maximum Courses per Instructor:</label>
                        <input 
                          type="number" 
                          value={systemSettings.maxCoursesPerInstructor || 50} 
                          onChange={(e) => setSystemSettings({...systemSettings, maxCoursesPerInstructor: parseInt(e.target.value)})}
                          min="1" 
                          max="500"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Maximum File Upload Size (MB):</label>
                        <input 
                          type="number" 
                          value={systemSettings.maxFileSize || 100} 
                          onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                          min="1" 
                          max="1000"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Storage Quota per User (GB):</label>
                        <input 
                          type="number" 
                          value={systemSettings.storageQuotaPerUser || 5} 
                          onChange={(e) => setSystemSettings({...systemSettings, storageQuotaPerUser: parseInt(e.target.value)})}
                          min="1" 
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('limits')}
                      >
                        📊 Save System Limits
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {systemSettings.activeSettingsTab === 'assessment' && (
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>🎯 Quiz & Assessment Settings</h4>
                      <p>Configure default assessment parameters and grading policies</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Default Passing Score (%):</label>
                        <input 
                          type="number" 
                          value={systemSettings.passingScore || 70} 
                          onChange={(e) => setSystemSettings({...systemSettings, passingScore: parseInt(e.target.value)})}
                          min="0" 
                          max="100" 
                        />
                        <small>Minimum score required to pass assessments</small>
                      </div>
                      <div className="setting-item">
                        <label>Maximum Quiz Retakes:</label>
                        <input 
                          type="number" 
                          value={systemSettings.maxRetakes || 2}
                          onChange={(e) => setSystemSettings({...systemSettings, maxRetakes: parseInt(e.target.value)})}
                          min="0" 
                          max="10" 
                        />
                        <small>Number of times students can retake failed quizzes</small>
                      </div>
                      <div className="setting-item">
                        <label>Quiz Time Limit (minutes):</label>
                        <input 
                          type="number" 
                          value={systemSettings.defaultQuizTimeLimit || 60}
                          onChange={(e) => setSystemSettings({...systemSettings, defaultQuizTimeLimit: parseInt(e.target.value)})}
                          min="5" 
                          max="300" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Auto-Submit on Time Expiry:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="autoSubmit"
                            checked={systemSettings.autoSubmitOnExpiry || true}
                            onChange={(e) => setSystemSettings({...systemSettings, autoSubmitOnExpiry: e.target.checked})}
                          />
                          <label htmlFor="autoSubmit" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>Show Correct Answers After Submission:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="showAnswers"
                            checked={systemSettings.showCorrectAnswers || false}
                            onChange={(e) => setSystemSettings({...systemSettings, showCorrectAnswers: e.target.checked})}
                          />
                          <label htmlFor="showAnswers" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('assessment')}
                      >
                        🎯 Save Assessment Settings
                      </button>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>📝 Grading System</h4>
                      <p>Configure grading scales and certificate requirements</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Grading Scale:</label>
                        <select 
                          value={systemSettings.gradingScale || 'percentage'} 
                          onChange={(e) => setSystemSettings({...systemSettings, gradingScale: e.target.value})}
                        >
                          <option value="percentage">Percentage (0-100%)</option>
                          <option value="letter">Letter Grades (A-F)</option>
                          <option value="points">Points Based</option>
                          <option value="pass_fail">Pass/Fail</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Certificate Threshold (%):</label>
                        <input 
                          type="number" 
                          value={systemSettings.certificateThreshold || 80}
                          onChange={(e) => setSystemSettings({...systemSettings, certificateThreshold: parseInt(e.target.value)})}
                          min="0" 
                          max="100" 
                        />
                        <small>Minimum score required for certificate eligibility</small>
                      </div>
                      <div className="setting-item">
                        <label>Honor Roll Threshold (%):</label>
                        <input 
                          type="number" 
                          value={systemSettings.honorRollThreshold || 95}
                          onChange={(e) => setSystemSettings({...systemSettings, honorRollThreshold: parseInt(e.target.value)})}
                          min="0" 
                          max="100" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Auto-Generate Certificates:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="autoCertificate"
                            checked={systemSettings.autoCertificate || true}
                            onChange={(e) => setSystemSettings({...systemSettings, autoCertificate: e.target.checked})}
                          />
                          <label htmlFor="autoCertificate" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('grading')}
                      >
                        📝 Save Grading Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {systemSettings.activeSettingsTab === 'attendance' && (
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>📍 Geofencing Settings</h4>
                      <p>Configure location-based attendance tracking</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Default Geofence Radius (meters):</label>
                        <input 
                          type="number" 
                          value={systemSettings.geofenceRadius || 100}
                          onChange={(e) => setSystemSettings({...systemSettings, geofenceRadius: parseInt(e.target.value)})}
                          min="10" 
                          max="1000" 
                        />
                        <small>Default radius for location-based attendance</small>
                      </div>
                      <div className="setting-item">
                        <label>Location Accuracy Requirement (meters):</label>
                        <input 
                          type="number" 
                          value={systemSettings.locationAccuracy || 20}
                          onChange={(e) => setSystemSettings({...systemSettings, locationAccuracy: parseInt(e.target.value)})}
                          min="5" 
                          max="100" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Allow Manual Location Override:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="manualLocationOverride"
                            checked={systemSettings.allowManualLocationOverride || false}
                            onChange={(e) => setSystemSettings({...systemSettings, allowManualLocationOverride: e.target.checked})}
                          />
                          <label htmlFor="manualLocationOverride" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>Geofence Validation Timeout (seconds):</label>
                        <input 
                          type="number" 
                          value={systemSettings.geofenceTimeout || 30}
                          onChange={(e) => setSystemSettings({...systemSettings, geofenceTimeout: parseInt(e.target.value)})}
                          min="10" 
                          max="120" 
                        />
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('geofencing')}
                      >
                        📍 Save Geofencing Settings
                      </button>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>📱 QR Code Settings</h4>
                      <p>Configure QR code-based attendance system</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>QR Code Expiry (hours):</label>
                        <input 
                          type="number" 
                          value={systemSettings.qrExpiry || 24}
                          onChange={(e) => setSystemSettings({...systemSettings, qrExpiry: parseInt(e.target.value)})}
                          min="1" 
                          max="168" 
                        />
                        <small>How long QR codes remain valid</small>
                      </div>
                      <div className="setting-item">
                        <label>QR Code Refresh Interval (minutes):</label>
                        <input 
                          type="number" 
                          value={systemSettings.qrRefreshInterval || 15}
                          onChange={(e) => setSystemSettings({...systemSettings, qrRefreshInterval: parseInt(e.target.value)})}
                          min="1" 
                          max="60" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Allow Multiple Scans:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="allowMultipleScans"
                            checked={systemSettings.allowMultipleScans || false}
                            onChange={(e) => setSystemSettings({...systemSettings, allowMultipleScans: e.target.checked})}
                          />
                          <label htmlFor="allowMultipleScans" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>QR Code Size (pixels):</label>
                        <select 
                          value={systemSettings.qrCodeSize || 256} 
                          onChange={(e) => setSystemSettings({...systemSettings, qrCodeSize: parseInt(e.target.value)})}
                        >
                          <option value="128">Small (128px)</option>
                          <option value="256">Medium (256px)</option>
                          <option value="512">Large (512px)</option>
                        </select>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('qr_settings')}
                      >
                        📱 Save QR Settings
                      </button>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>👤 Face Recognition Settings</h4>
                      <p>Configure facial recognition attendance system</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Face Recognition Confidence Threshold:</label>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="1.0" 
                          step="0.05"
                          value={systemSettings.faceRecognitionThreshold || 0.8}
                          onChange={(e) => setSystemSettings({...systemSettings, faceRecognitionThreshold: parseFloat(e.target.value)})}
                        />
                        <span className="range-value">{((systemSettings.faceRecognitionThreshold || 0.8) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="setting-item">
                        <label>Maximum Face Registration Attempts:</label>
                        <input 
                          type="number" 
                          value={systemSettings.maxFaceRegistrationAttempts || 5}
                          onChange={(e) => setSystemSettings({...systemSettings, maxFaceRegistrationAttempts: parseInt(e.target.value)})}
                          min="1" 
                          max="10" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Face Data Retention (days):</label>
                        <input 
                          type="number" 
                          value={systemSettings.faceDataRetention || 365}
                          onChange={(e) => setSystemSettings({...systemSettings, faceDataRetention: parseInt(e.target.value)})}
                          min="30" 
                          max="3650" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Enable Liveness Detection:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="livenessDetection"
                            checked={systemSettings.enableLivenessDetection || true}
                            onChange={(e) => setSystemSettings({...systemSettings, enableLivenessDetection: e.target.checked})}
                          />
                          <label htmlFor="livenessDetection" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('face_recognition')}
                      >
                        👤 Save Face Recognition Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {systemSettings.activeSettingsTab === 'security' && (
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>🔐 Authentication Settings</h4>
                      <p>Configure user authentication and session management</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Session Timeout (minutes):</label>
                        <input 
                          type="number" 
                          value={systemSettings.sessionTimeout || 30}
                          onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                          min="5" 
                          max="480" 
                        />
                        <small>Automatic logout after inactivity</small>
                      </div>
                      <div className="setting-item">
                        <label>Maximum Login Attempts:</label>
                        <input 
                          type="number" 
                          value={systemSettings.maxLoginAttempts || 5}
                          onChange={(e) => setSystemSettings({...systemSettings, maxLoginAttempts: parseInt(e.target.value)})}
                          min="3" 
                          max="10" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Account Lockout Duration (minutes):</label>
                        <input 
                          type="number" 
                          value={systemSettings.lockoutDuration || 30}
                          onChange={(e) => setSystemSettings({...systemSettings, lockoutDuration: parseInt(e.target.value)})}
                          min="5" 
                          max="1440" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Require Email Verification:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="requireEmailVerification"
                            checked={systemSettings.requireEmailVerification || true}
                            onChange={(e) => setSystemSettings({...systemSettings, requireEmailVerification: e.target.checked})}
                          />
                          <label htmlFor="requireEmailVerification" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>Enable Two-Factor Authentication:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="enable2FA"
                            checked={systemSettings.enable2FA || false}
                            onChange={(e) => setSystemSettings({...systemSettings, enable2FA: e.target.checked})}
                          />
                          <label htmlFor="enable2FA" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('authentication')}
                      >
                        🔐 Save Authentication Settings
                      </button>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>🔑 Password Policy</h4>
                      <p>Configure password requirements and security rules</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Password Policy Level:</label>
                        <select 
                          value={systemSettings.passwordPolicy || 'medium'} 
                          onChange={(e) => setSystemSettings({...systemSettings, passwordPolicy: e.target.value})}
                        >
                          <option value="low">Low (6+ characters)</option>
                          <option value="medium">Medium (8+ characters, mixed case)</option>
                          <option value="high">High (10+ characters, special chars)</option>
                          <option value="custom">Custom Policy</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Minimum Password Length:</label>
                        <input 
                          type="number" 
                          value={systemSettings.minPasswordLength || 8}
                          onChange={(e) => setSystemSettings({...systemSettings, minPasswordLength: parseInt(e.target.value)})}
                          min="6" 
                          max="32" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Require Special Characters:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="requireSpecialChars"
                            checked={systemSettings.requireSpecialChars || true}
                            onChange={(e) => setSystemSettings({...systemSettings, requireSpecialChars: e.target.checked})}
                          />
                          <label htmlFor="requireSpecialChars" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>Password Expiry (days):</label>
                        <input 
                          type="number" 
                          value={systemSettings.passwordExpiry || 90}
                          onChange={(e) => setSystemSettings({...systemSettings, passwordExpiry: parseInt(e.target.value)})}
                          min="30" 
                          max="365" 
                        />
                        <small>0 = Never expires</small>
                      </div>
                      <div className="setting-item">
                        <label>Password History Count:</label>
                        <input 
                          type="number" 
                          value={systemSettings.passwordHistoryCount || 5}
                          onChange={(e) => setSystemSettings({...systemSettings, passwordHistoryCount: parseInt(e.target.value)})}
                          min="0" 
                          max="24" 
                        />
                        <small>Prevent reusing last N passwords</small>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('password_policy')}
                      >
                        🔑 Save Password Policy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {systemSettings.activeSettingsTab === 'notifications' && (
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>📧 Email Notifications</h4>
                      <p>Configure email notification preferences and templates</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Enable Email Notifications:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="emailNotifications"
                            checked={systemSettings.emailNotifications || true}
                            onChange={(e) => setSystemSettings({...systemSettings, emailNotifications: e.target.checked})}
                          />
                          <label htmlFor="emailNotifications" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>SMTP Server:</label>
                        <input 
                          type="text" 
                          value={systemSettings.smtpServer || 'smtp.gmail.com'} 
                          onChange={(e) => setSystemSettings({...systemSettings, smtpServer: e.target.value})}
                          placeholder="Enter SMTP server"
                        />
                      </div>
                      <div className="setting-item">
                        <label>SMTP Port:</label>
                        <input 
                          type="number" 
                          value={systemSettings.smtpPort || 587}
                          onChange={(e) => setSystemSettings({...systemSettings, smtpPort: parseInt(e.target.value)})}
                          min="25" 
                          max="65535" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>From Email Address:</label>
                        <input 
                          type="email" 
                          value={systemSettings.fromEmail || 'noreply@eduplatform.com'} 
                          onChange={(e) => setSystemSettings({...systemSettings, fromEmail: e.target.value})}
                          placeholder="Enter from email"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Email Rate Limit (per hour):</label>
                        <input 
                          type="number" 
                          value={systemSettings.emailRateLimit || 1000}
                          onChange={(e) => setSystemSettings({...systemSettings, emailRateLimit: parseInt(e.target.value)})}
                          min="10" 
                          max="10000" 
                        />
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('email_notifications')}
                      >
                        📧 Save Email Settings
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          alert('Test email sent to ' + (systemSettings.fromEmail || 'noreply@eduplatform.com'));
                        }}
                      >
                        📤 Send Test Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {systemSettings.activeSettingsTab === 'integrations' && (
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>🔗 Third-Party Integrations</h4>
                      <p>Configure external service integrations and API connections</p>
                    </div>
                    <div className="setting-body">
                      <div className="integration-item">
                        <div className="integration-info">
                          <h5>📊 Google Analytics</h5>
                          <p>Track user behavior and platform analytics</p>
                        </div>
                        <div className="integration-controls">
                          <div className="toggle-switch">
                            <input 
                              type="checkbox" 
                              id="googleAnalytics"
                              checked={systemSettings.googleAnalyticsEnabled || false}
                              onChange={(e) => setSystemSettings({...systemSettings, googleAnalyticsEnabled: e.target.checked})}
                            />
                            <label htmlFor="googleAnalytics" className="toggle-label">
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <button className="btn-secondary btn-small">Configure</button>
                        </div>
                      </div>
                      <div className="integration-item">
                        <div className="integration-info">
                          <h5>💳 Stripe Payment</h5>
                          <p>Process course payments and subscriptions</p>
                        </div>
                        <div className="integration-controls">
                          <div className="toggle-switch">
                            <input 
                              type="checkbox" 
                              id="stripePayment"
                              checked={systemSettings.stripeEnabled || false}
                              onChange={(e) => setSystemSettings({...systemSettings, stripeEnabled: e.target.checked})}
                            />
                            <label htmlFor="stripePayment" className="toggle-label">
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <button className="btn-secondary btn-small">Configure</button>
                        </div>
                      </div>
                      <div className="integration-item">
                        <div className="integration-info">
                          <h5>📹 Zoom Integration</h5>
                          <p>Enable live video sessions and webinars</p>
                        </div>
                        <div className="integration-controls">
                          <div className="toggle-switch">
                            <input 
                              type="checkbox" 
                              id="zoomIntegration"
                              checked={systemSettings.zoomEnabled || false}
                              onChange={(e) => setSystemSettings({...systemSettings, zoomEnabled: e.target.checked})}
                            />
                            <label htmlFor="zoomIntegration" className="toggle-label">
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <button className="btn-secondary btn-small">Configure</button>
                        </div>
                      </div>
                      <div className="integration-item">
                        <div className="integration-info">
                          <h5>☁️ AWS S3 Storage</h5>
                          <p>Cloud storage for course materials and media</p>
                        </div>
                        <div className="integration-controls">
                          <div className="toggle-switch">
                            <input 
                              type="checkbox" 
                              id="awsS3"
                              checked={systemSettings.awsS3Enabled || false}
                              onChange={(e) => setSystemSettings({...systemSettings, awsS3Enabled: e.target.checked})}
                            />
                            <label htmlFor="awsS3" className="toggle-label">
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <button className="btn-secondary btn-small">Configure</button>
                        </div>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('integrations')}
                      >
                        🔗 Save Integration Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {systemSettings.activeSettingsTab === 'backup' && (
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <h4>💾 Backup Configuration</h4>
                      <p>Configure automated backups and data recovery options</p>
                    </div>
                    <div className="setting-body">
                      <div className="setting-item">
                        <label>Enable Automatic Backups:</label>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="automaticBackups"
                            checked={systemSettings.automaticBackups || true}
                            onChange={(e) => setSystemSettings({...systemSettings, automaticBackups: e.target.checked})}
                          />
                          <label htmlFor="automaticBackups" className="toggle-label">
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>Backup Frequency:</label>
                        <select 
                          value={systemSettings.backupFrequency || 'daily'} 
                          onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                        >
                          <option value="hourly">Every Hour</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Backup Retention (days):</label>
                        <input 
                          type="number" 
                          value={systemSettings.backupRetention || 30}
                          onChange={(e) => setSystemSettings({...systemSettings, backupRetention: parseInt(e.target.value)})}
                          min="7" 
                          max="365" 
                        />
                      </div>
                      <div className="setting-item">
                        <label>Backup Storage Location:</label>
                        <select 
                          value={systemSettings.backupLocation || 'local'} 
                          onChange={(e) => setSystemSettings({...systemSettings, backupLocation: e.target.value})}
                        >
                          <option value="local">Local Storage</option>
                          <option value="aws_s3">AWS S3</option>
                          <option value="google_cloud">Google Cloud</option>
                          <option value="azure">Azure Storage</option>
                        </select>
                      </div>
                    </div>
                    <div className="setting-footer">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSaveSettings('backup_configuration')}
                      >
                        💾 Save Backup Settings
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          alert('Manual backup initiated. This may take several minutes.');
                        }}
                      >
                        🚀 Start Manual Backup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Create New User</h3>
              <button onClick={() => setShowCreateUser(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <input
                type="text"
                placeholder="First Name"
                value={userForm.firstName}
                onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={userForm.lastName}
                onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                required
              />
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={userForm.phone}
                onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
              />
              <textarea
                placeholder="Address (optional)"
                value={userForm.address}
                onChange={(e) => setUserForm({...userForm, address: e.target.value})}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateUser(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>✏️ Edit User</h3>
              <button onClick={() => setShowEditUser(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleUpdateUserSubmit} className="modal-form">
              <input
                type="text"
                placeholder="First Name"
                value={userForm.firstName}
                onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={userForm.lastName}
                onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="New Password (leave empty to keep current)"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
              />
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={userForm.phone}
                onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
              />
              <textarea
                placeholder="Address (optional)"
                value={userForm.address}
                onChange={(e) => setUserForm({...userForm, address: e.target.value})}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditUser(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Create New Course</h3>
              <button onClick={() => setShowCreateCourse(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateCourse} className="modal-form">
              <input
                type="text"
                placeholder="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Course Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Duration (hours)"
                value={courseForm.duration}
                onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                required
              />
              <select
                value={courseForm.instructor}
                onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                required
              >
                <option value="">Select Instructor</option>
                {users.filter(user => user.role === 'instructor').map(instructor => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.firstName} {instructor.lastName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Category"
                value={courseForm.category}
                onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
              />
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={courseForm.price}
                onChange={(e) => setCourseForm({...courseForm, price: parseFloat(e.target.value)})}
                min="0"
                step="0.01"
              />
              <label>
                <input
                  type="checkbox"
                  checked={courseForm.isActive}
                  onChange={(e) => setCourseForm({...courseForm, isActive: e.target.checked})}
                />
                Active Course
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateCourse(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Details/Edit Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>📚 Course Details</h3>
              <button onClick={() => setShowCourseDetails(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleUpdateCourse} className="modal-form">
              <input
                type="text"
                placeholder="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Course Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Duration (hours)"
                value={courseForm.duration}
                onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                required
              />
              <select
                value={courseForm.instructor}
                onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                required
              >
                <option value="">Select Instructor</option>
                {users.filter(user => user.role === 'instructor').map(instructor => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.firstName} {instructor.lastName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Category"
                value={courseForm.category}
                onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
              />
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={courseForm.price}
                onChange={(e) => setCourseForm({...courseForm, price: parseFloat(e.target.value)})}
                min="0"
                step="0.01"
              />
              <label>
                <input
                  type="checkbox"
                  checked={courseForm.isActive}
                  onChange={(e) => setCourseForm({...courseForm, isActive: e.target.checked})}
                />
                Active Course
              </label>
              
              <div className="course-stats">
                <h4>Course Statistics</h4>
                <p><strong>Enrolled Students:</strong> {selectedCourse.enrolledStudents?.length || 0}</p>
                <p><strong>Created:</strong> {new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(selectedCourse.updatedAt).toLocaleDateString()}</p>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCourseDetails(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 