import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";

const OTPVerifyForm = ({ email }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await axios.post("/auth/verify", { email, otp });
      
      setSuccess("Email verified successfully!");
      
      // Store user data and token
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        // Navigate to appropriate dashboard based on role
        setTimeout(() => {
          if (response.data.user.role === "student") {
            navigate("/student-dashboard");
          } else if (response.data.user.role === "instructor") {
            navigate("/instructor-dashboard");
          } else if (response.data.user.role === "admin") {
            navigate("/admin-dashboard");
          }
        }, 1500);
      } else {
        // Fallback to login page if no token
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setResendLoading(true);
    
    try {
      const response = await axios.post("/auth/resend-otp", { email });
      setSuccess(response.data.message);
      
      // If OTP is provided (for testing), show it
      if (response.data.otp) {
        setSuccess(`${response.data.message} (Test OTP: ${response.data.otp})`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleVerify}>
      <h2>Verify Your Email</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="info-message">
        We've sent a verification code to <strong>{email}</strong>
      </div>
      
      <input 
        type="text" 
        placeholder="Enter 6-digit OTP" 
        required 
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
        pattern="[0-9]{6}"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify Email"}
      </button>
      
      <div className="resend-section">
        <p>Didn't receive the code?</p>
        <button 
          type="button" 
          onClick={handleResendOTP} 
          disabled={resendLoading}
          className="resend-btn"
        >
          {resendLoading ? "Sending..." : "Resend OTP"}
        </button>
      </div>
      
      <div className="switch-form">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Back to Login</a>
      </div>
    </form>
  );
};

export default OTPVerifyForm;
