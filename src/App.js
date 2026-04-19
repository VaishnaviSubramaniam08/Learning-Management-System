import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useState } from "react";
import SignupForm from "./components/SignupForm";
import OTPVerifyForm from "./components/OTPVerifyForm";
import LoginForm from "./components/LoginForm";
import StudentDashboard from "./components/StudentDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ChatbotPage from "./components/ChatbotPage";
import AICareerGuidance from "./components/AICareerGuidance";
import StudyMaterialsHub from "./components/StudyMaterialsHub";
import CareerPrep from "./components/CareerPrep";
import ProtectedRoute from "./components/ProtectedRoute";
import APIDebugTest from "./components/APIDebugTest";
import "./styles.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // Simulate user role from localStorage (for nav link visibility)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Router>
      <div className="container">
        {/* Navigation Bar */}
        {(user && user.role) && (
          <nav style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
            {/* Attendance Dashboard link removed */}
            {/* Add other nav links as needed */}
          </nav>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route 
            path="/login" 
            element={
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                role={role}
                setRole={setRole}
              />
            } 
          />
          <Route 
            path="/signup" 
            element={
              <SignupForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                role={role}
                setRole={setRole}
              />
            } 
          />
          <Route path="/verify" element={<OTPVerifyForm email={email} />} />
          {/* Protected Dashboard Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard
                  user={JSON.parse(localStorage.getItem('user') || '{}')}
                  onLogout={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/instructor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          {/* Chatbot Page Route */}
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />
          {/* AI Career Guidance Route */}
          <Route
            path="/ai-career-guidance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AICareerGuidance user={JSON.parse(localStorage.getItem('user') || '{}')} />
              </ProtectedRoute>
            }
          />
          {/* Real-Time Study Materials Route */}
          <Route
            path="/study-materials"
            element={
              <ProtectedRoute allowedRoles={['student', 'instructor']}>
                <StudyMaterialsHub user={JSON.parse(localStorage.getItem('user') || '{}')} />
              </ProtectedRoute>
            }
          />
          {/* Career Preparation Route */}
          <Route
            path="/career-prep"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CareerPrep user={JSON.parse(localStorage.getItem('user') || '{}')} />
              </ProtectedRoute>
            }
          />
          {/* API Debug Test Route - Remove this in production */}
          <Route
            path="/debug-api"
            element={<APIDebugTest />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
