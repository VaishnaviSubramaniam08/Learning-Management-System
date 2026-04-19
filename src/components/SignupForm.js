import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";

const SignupForm = ({ email, setEmail, password, setPassword, role, setRole }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await axios.post("/auth/signup", { 
        email, 
        password, 
        role, 
        firstName, 
        lastName 
      });
      
      setSuccess(response.data.message);
      
      // If OTP is provided (for testing), show it
      if (response.data.otp) {
        setSuccess(`${response.data.message} (Test OTP: ${response.data.otp})`);
      }
      
      // Navigate to verification page after a short delay
      setTimeout(() => {
        navigate("/verify");
      }, 2000);
      
    } catch (err) {
      const errorData = err.response?.data;
      
      if (errorData?.userExists) {
        setError("User already exists. Please login instead.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(errorData?.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <form className="form" style={{ flex: 1, maxWidth: 350 }} onSubmit={handleSignup}>
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <input 
          type="text" 
          placeholder="First Name" 
          required 
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Last Name" 
          required 
          value={lastName}
          onChange={(e) => setLastName(e.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Enter your email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Create a password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
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
          {loading ? "Creating Account..." : "Create Account"}
        </button>
        <div className="switch-form">
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Login here</a>
        </div>
      </form>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <img 
          src="https://img.freepik.com/free-photo/diverse-kids-reading-books_53876-146406.jpg?semt=ais_hybrid&w=740" 
          alt="Diverse kids reading books" 
          style={{ maxWidth: 500, width: '100%', height: 'auto', borderRadius: 20, boxShadow: '0 10px 30px rgba(102, 126, 234, 0.15)' }}
        />
      </div>
    </div>
  );
};

export default SignupForm;
