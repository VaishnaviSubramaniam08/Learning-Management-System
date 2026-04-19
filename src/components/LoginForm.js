import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { setAuthToken } from "../api";
import AutoFaceAttendance from "./AutoFaceAttendance";
import AutoFaceLogin from "./AutoFaceLogin";

const LoginForm = ({ email, setEmail, password, setPassword, role, setRole }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaceAttendance, setShowFaceAttendance] = useState(false);
  const [showAutoFaceLogin, setShowAutoFaceLogin] = useState(false);
  const [loginUser, setLoginUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const navigate = useNavigate();

  const handleFaceAttendanceComplete = (result) => {
    setShowFaceAttendance(false);

    if (result.success || result.skipped) {
      // Navigate to dashboard regardless of face recognition result
      navigate("/student-dashboard");
      setEmail("");
      setPassword("");
      setRole("");
    }

    // Show notification if needed
    if (result.success) {
      console.log('Face recognition attendance marked successfully');
    } else if (result.skipped) {
      console.log('Face recognition attendance skipped');
    }
  };

  const handleAutoFaceLoginSuccess = (user) => {
    setShowAutoFaceLogin(false);

    // Clear form fields
    setEmail("");
    setPassword("");
    setRole("");

    // Navigate to dashboard immediately
    console.log('✅ Automatic face login successful for user:', user?.email);
    navigate("/student-dashboard");
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <form className="form" style={{ flex: 1, maxWidth: 350 }} onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
          const response = await axios.post("/auth/login", { email, password, role });

          // Store user and token using the new token management
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setAuthToken(response.data.token);

          // Store token in state for passing to components
          setUserToken(response.data.token);

          console.log('✅ Login successful, token set:', !!response.data.token);
          console.log('✅ Token value (first 20 chars):', response.data.token ? response.data.token.substring(0, 20) + '...' : 'null');
          console.log('✅ Token stored using setAuthToken function');

          // For students, check if they have face registration for automatic login
          if (role === "student") {
            setLoginUser(response.data.user);

            // Check if user has registered face data
            try {
              console.log('Checking face registration status...');
              const faceStatusResponse = await axios.get("/face-recognition/status");
              console.log('Face status response:', faceStatusResponse.data);

              if (faceStatusResponse.data.isRegistered) {
                // User has face data - trigger automatic face login
                console.log('✅ User has face data - starting automatic face login');
                setShowAutoFaceLogin(true);
              } else {
                // User doesn't have face data - show manual face attendance option
                console.log('❌ User has no face data - showing face registration');
                setShowFaceAttendance(true);
              }
            } catch (faceError) {
              console.error('Face status check failed:', faceError);
              // Fallback to manual face attendance
              setShowFaceAttendance(true);
            }
            setLoading(false);
          } else if (role === "instructor") {
            navigate("/instructor-dashboard");
            setEmail("");
            setPassword("");
            setRole("");
          } else if (role === "admin") {
            navigate("/admin-dashboard");
            setEmail("");
            setPassword("");
            setRole("");
          }
        } catch (err) {
          const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }}>
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <input 
          type="email" 
          placeholder="Enter your email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Enter your password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <select 
          required 
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select your role</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <div className="switch-form">
          Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Sign up here</a>
        </div>
      </form>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <img 
          src="https://alterainstitute.com/blog/content/images/2024/12/data-src-image-11293e72-5d3a-47f1-ad99-d1c394682d22.jpeg" 
          alt="School themed" 
          style={{ maxWidth: 550, width: '100%', height: 'auto', borderRadius: 20, boxShadow: '0 10px 30px rgba(102, 126, 234, 0.15)' }}
        />
      </div>

      {/* Automatic Face Login Modal */}
      {showAutoFaceLogin && loginUser && userToken && (
        <AutoFaceLogin
          onLoginSuccess={handleAutoFaceLoginSuccess}
          userToken={userToken}
        />
      )}

      {/* Face Recognition Attendance Modal (for users without face registration) */}
      {showFaceAttendance && loginUser && (
        <AutoFaceAttendance
          user={loginUser}
          onComplete={handleFaceAttendanceComplete}
        />
      )}
    </div>
  );
};

export default LoginForm;
