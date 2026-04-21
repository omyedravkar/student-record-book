import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AddAchievement from "./pages/AddAchievement";
import AdminDashboard from "./pages/AdminDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import Profile from "./pages/Profile.jsx";
import ActivityList from "./pages/ActivityList";
import Rankings from "./pages/Rankings";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />   
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
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