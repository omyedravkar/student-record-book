import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AddAchievement from "./pages/AddAchievement.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import MentorDashboard from "./pages/MentorDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import ActivityList from "./pages/ActivityList.jsx";
import Rankings from "./pages/Rankings.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />   
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/mentor" element={<MentorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-activity" element={<AddAchievement />} />
          <Route path="/add-achievement" element={<AddAchievement />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mentor" element={<MentorDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/activities" element={<ActivityList />} />
          <Route path="/rankings" element={<Rankings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}