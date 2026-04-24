import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [student, setStudent] = useState(null)

  useEffect(() => {
    const prn = localStorage.getItem('prn')
    const token = localStorage.getItem('token')
    
    axios.get(`http://localhost:5000/api/erp/student/${prn}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data.success) setStudent(res.data.data)
    })
    .catch(err => console.log(err))
  }, [])

  if (!student) return <div style={{padding: '2rem'}}>Loading...</div>

  const field = (label, value) => (
    <div style={{ display: "flex", padding: "10px 0", borderBottom: "0.5px solid #eee" }}>
      <span style={{ width: 180, color: "#666", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 14 }}>{value}</span>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "#1a237e" }}>My Profile</h2>
      <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", border: "0.5px solid #e0e0e0", maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "#e8eaf6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "#3949ab", fontWeight: 500
          }}>
            {student.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 18 }}>{student.name}</p>
            <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{student.branch} — {student.year}</p>
          </div>
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#1a237e", marginBottom: 8 }}>Personal details</p>
        {field("Date of birth", student.dob)}
        {field("Email", student.email)}
        {field("Phone", student.phone)}
        <p style={{ fontSize: 13, fontWeight: 500, color: "#1a237e", margin: "16px 0 8px" }}>Academic details</p>
        {field("Roll number", student.rollNo)}
        {field("CGPA", student.cgpa)}
        {field("Attendance", `${student.attendance}%`)}
        {field("Mentor", student.mentor)}
      </div>
    </div>
  );
}