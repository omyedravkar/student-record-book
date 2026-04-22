import { useState, useEffect } from "react";
import axios from "axios";

const STATUS_COLORS = {
  VERIFIED: { bg: "#e8f5e9", color: "#2e7d32" },
  PENDING:  { bg: "#fff8e1", color: "#f57f17" },
  REJECTED: { bg: "#ffebee", color: "#c62828" },
};

export default function ActivityList() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const prn = localStorage.getItem('prn');
    if (prn) fetchActivities(prn);
  }, []);

  const fetchActivities = async (prn) => {
    try {
     const response = await axios.get(`http://localhost:5000/api/student-record/my?prn=${prn}`);
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  return (
    <div>
      <h2 style={{ color: "#1a237e" }}>My Activities</h2>
      <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0e0", overflow: "hidden" }}>
        {activities.length === 0 ? (
          <p style={{ padding: '20px', color: '#888', textAlign: 'center' }}>No activities yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={th}>Type</th>
                <th style={th}>Title</th>
                <th style={th}>Organisation</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={i} style={{ borderTop: "0.5px solid #eee" }}>
                  <td style={td}>{a.type}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{a.title}</td>
                  <td style={td}>{a.organisation}</td>
                  <td style={td}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: STATUS_COLORS[a.status]?.bg,
                      color: STATUS_COLORS[a.status]?.color
                    }}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const th = { padding: "12px 16px", textAlign: "left", fontWeight: 500, fontSize: 13, color: "#555" };
const td = { padding: "12px 16px", color: "#333" };