import { useState } from "react";

const DUMMY_ACTIVITIES = [
  { id: 1, type: "Internship", title: "Web Dev Intern at TechCorp", date: "2024-06-01", status: "Verified" },
  { id: 2, type: "Certificate", title: "AWS Cloud Practitioner", date: "2024-03-15", status: "Pending" },
  { id: 3, type: "Workshop", title: "React Workshop - IIT Bombay", date: "2024-08-10", status: "Verified" },
  { id: 4, type: "Sports", title: "District Cricket Championship", date: "2024-01-20", status: "Pending" },
];

const STATUS_COLORS = {
  Verified: { bg: "#e8f5e9", color: "#2e7d32" },
  Pending:  { bg: "#fff8e1", color: "#f57f17" },
  Rejected: { bg: "#ffebee", color: "#c62828" },
};

export default function ActivityList() {
  const [activities] = useState(DUMMY_ACTIVITIES);

  return (
    <div>
      <h2 style={{ color: "#1a237e" }}>My Activities</h2>
      <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0e0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>Type</th>
              <th style={th}>Title</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(a => (
              <tr key={a.id} style={{ borderTop: "0.5px solid #eee" }}>
                <td style={td}>{a.type}</td>
                <td style={{ ...td, fontWeight: 500 }}>{a.title}</td>
                <td style={td}>{a.date}</td>
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
      </div>
    </div>
  );
}

const th = { padding: "12px 16px", textAlign: "left", fontWeight: 500, fontSize: 13, color: "#555" };
const td = { padding: "12px 16px", color: "#333" };