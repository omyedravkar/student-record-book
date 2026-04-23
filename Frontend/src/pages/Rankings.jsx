import { useState, useEffect } from "react";
import axios from "axios";

const medalColor = (i) => ["#FFD700", "#C0C0C0", "#CD7F32"][i] ?? "#e8eaf6";

export default function Rankings() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student-record/search?q=${query}&type=${type}`);
      if (response.data.success) {
        setResults(response.data.data);
        setSearched(true);
      }
    } catch (error) {
      console.log('Search error:', error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#1a237e", margin: 0 }}>Placement Search</h2>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <input
          style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
          placeholder='Search e.g. "NPTEL", "8 week", "machine learning"...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select
          style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="internship">Internship</option>
          <option value="certificate">Certificate</option>
          <option value="project">Project</option>
          <option value="activity">Activity</option>
        </select>
        <button
          onClick={handleSearch}
          style={{ padding: "10px 24px", backgroundColor: "#1a237e", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {/* Results */}
      {results.length === 0 && searched ? (
        <p style={{ color: "#888", textAlign: "center", padding: 30 }}>No matching students found.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0e0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={th}>Rank</th>
                <th style={th}>PRN</th>
                <th style={th}>Matched Records</th>
                <th style={th}>Total Verified</th>
              </tr>
            </thead>
            <tbody>
              {results.map((s, i) => (
                <tr key={s.prn} style={{
                  borderTop: "0.5px solid #eee",
                  backgroundColor: s.matched && query ? "#fffde7" : "white"
                }}>
                  <td style={td}>
                    <span style={{
                      display: "inline-flex", width: 28, height: 28, borderRadius: "50%",
                      background: medalColor(i), alignItems: "center",
                      justifyContent: "center", fontSize: 13, fontWeight: 500
                    }}>{i + 1}</span>
                  </td>
                  <td style={{ ...td, fontWeight: 500 }}>
                    {s.matched && query && <span style={{ color: "#f57f17", fontWeight: 700, marginRight: 6 }}>★</span>}
                    {s.prn}
                  </td>
                  <td style={td}>
                    {s.records.map((r, j) => (
                      <div key={j} style={{ marginBottom: 4 }}>
                        <span style={{ backgroundColor: "#e8eaf6", color: "#1a237e", padding: "2px 8px", borderRadius: 20, fontSize: 12, marginRight: 6 }}>{r.type}</span>
                        <strong>{r.title}</strong> — {r.organisation}
                      </div>
                    ))}
                  </td>
                  <td style={td}>{s.records.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = { padding: "12px 16px", textAlign: "left", fontWeight: 500, fontSize: 13, color: "#555" };
const td = { padding: "12px 16px", color: "#333", verticalAlign: "top" };