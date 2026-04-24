import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AddAchievement from "./pages/AddAchievement.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import MentorDashboard from "./pages/MentorDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import ActivityList from "./pages/ActivityList.jsx";
import Rankings from "./pages/Rankings.jsx";
import RecruiterSearch from "./pages/RecruiterSearch";

function ProtectedRoute({ element, allowedRole }) {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
  return element;
}

function Layout() {
  const location = useLocation();
  const isLogin = location.pathname === '/';

  return (
    <>
      {!isLogin && <Navbar />}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isLogin ? "0" : "2rem 1rem" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<ProtectedRoute element={<StudentDashboard />} allowedRole="student" />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<StudentDashboard />} allowedRole="student" />} />
          <Route path="/add-activity" element={<ProtectedRoute element={<AddAchievement />} allowedRole="student" />} />
          <Route path="/add-achievement" element={<ProtectedRoute element={<AddAchievement />} allowedRole="student" />} />
          <Route path="/activities" element={<ProtectedRoute element={<ActivityList />} allowedRole="student" />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} allowedRole="student" />} />
          <Route path="/mentor" element={<ProtectedRoute element={<MentorDashboard />} allowedRole="mentor" />} />
          <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />} />
          <Route path="/rankings" element={<ProtectedRoute element={<Rankings />} allowedRole="admin" />} />
          <Route path="/recruiter" element={<RecruiterSearch />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}