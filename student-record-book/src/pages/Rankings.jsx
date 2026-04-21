import { useState } from "react";

const DUMMY_STUDENTS = [
  { id: 1, name: "Apurva Uike", branch: "Information Technology", cgpa: 8.75, attendance: 87, achievements: 3 },
  { id: 2, name: "Rahul Sharma", branch: "Computer Science", cgpa: 9.10, attendance: 92, achievements: 5 },
  { id: 3, name: "Priya Patel", branch: "Electronics", cgpa: 8.50, attendance: 78, achievements: 2 },
  { id: 4, name: "Amit Singh", branch: "Mechanical", cgpa: 7.90, attendance: 85, achievements: 4 },
  { id: 5, name: "Sneha Joshi", branch: "Computer Science", cgpa: 9.30, attendance: 95, achievements: 6 },
];

const medalColor = (i) => ["#FFD700", "#C0C0C0", "#CD7F32"][i] ?? "#e8eaf6";

export default function Rankings() {
  const [sortBy, setSortBy] = useState("cgpa");

  const sorted = [...DUMMY_STUDENTS].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#1a237e", margin: 0 }}>Rankings</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["cgpa", "attendance", "achievements"].map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13,
                border: "1px solid #1a237e",
                background: sortBy === key ? "#1a237e" : "#fff",
                color: sortBy === key ? "#fff" : "#1a237e",
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0e0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>Rank</th>
              <th style={th}>Name</th>
              <th style={th}>Branch</th>
              <th style={th}>CGPA</th>
              <th style={th}>Attendance</th>
              <th style={th}>Achievements</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.id} style={{ borderTop: "0.5px solid #eee" }}>
                <td style={td}>
                  <span style={{
                    display: "inline-flex", width: 28, height: 28, borderRadius: "50%",
                    background: medalColor(i), alignItems: "center",
                    justifyContent: "center", fontSize: 13, fontWeight: 500
                  }}>{i + 1}</span>
                </td>
                <td style={{ ...td, fontWeight: 500 }}>{s.name}</td>
                <td style={td}>{s.branch}</td>
                <td style={td}>{s.cgpa}</td>
                <td style={td}>{s.attendance}%</td>
                <td style={td}>{s.achievements}</td>
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