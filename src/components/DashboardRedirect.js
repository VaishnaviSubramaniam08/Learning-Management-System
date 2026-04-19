import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = ({ user, attendanceMarked }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Determine dashboard route based on user role
      let dashboardRoute = '/student-dashboard';
      
      if (user.role === 'instructor') {
        dashboardRoute = '/instructor-dashboard';
      } else if (user.role === 'admin') {
        dashboardRoute = '/admin-dashboard';
      }

      // Show success message briefly before redirecting
      const timer = setTimeout(() => {
        navigate(dashboardRoute);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          ✅
        </div>
        <h1 style={{ marginBottom: '10px' }}>Welcome Back!</h1>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
          Face recognition successful
        </p>
        {attendanceMarked && (
          <p style={{ 
            background: 'rgba(76, 175, 80, 0.2)', 
            padding: '10px 20px', 
            borderRadius: '25px',
            border: '1px solid rgba(76, 175, 80, 0.5)'
          }}>
            📅 Attendance marked for today
          </p>
        )}
        <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '20px' }}>
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
};

export default DashboardRedirect;
