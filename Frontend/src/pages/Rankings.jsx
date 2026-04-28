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
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .search-input:focus {
          border-color: #1a237e !important;
          box-shadow: 0 0 0 3px rgba(26,35,126,0.08);
          outline: none;
        }

        .search-select:focus {
          border-color: #1a237e !important;
          outline: none;
        }

        .search-btn:hover {
          background-color: #283593 !important;
        }

        .result-row:hover {
          background-color: #f5f6ff !important;
        }

        .type-tag {
          display: inline-block;
          padding: 2px 9px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: #eef0fb;
          color: #3949ab;
          margin-right: 7px;
        }
      `}</style>

      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.label}>PLACEMENT CELL</p>
          <h2 style={styles.heading}>Student Search</h2>
        </div>
        {results.length > 0 && (
          <span style={styles.countBadge}>{results.length} students</span>
        )}
      </div>

      {/* Search Bar */}
      <div style={styles.searchBox}>
        <input
          className="search-input"
          style={styles.input}
          placeholder='Search by name, NPTEL, internship, skill...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select
          className="search-select"
          style={styles.select}
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
          className="search-btn"
          onClick={handleSearch}
          style={styles.searchBtn}
        >
          Search
        </button>
      </div>

      {/* Results */}
      {results.length === 0 && searched ? (
        <div style={styles.empty}>
          <p style={{ margin: 0, fontWeight: 500, color: "#555" }}>No matching students found</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#aaa" }}>Try a different keyword or activity type</p>
        </div>
      ) : results.length > 0 ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>PRN</th>
                <th style={th}>Matched Records</th>
                <th style={th}>Total Verified</th>
              </tr>
            </thead>
            <tbody>
              {results.map((s, i) => (
                <tr
                  key={s.prn}
                  className="result-row"
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    backgroundColor: s.matched && query ? "#fffde7" : "white",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={td}>
                    <span style={{
                      display: "inline-flex",
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: medalColor(i),
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: i === 0 ? "#7a6000" : i === 1 ? "#4a4a4a" : i === 2 ? "#6b3a1f" : "#555",
                    }}>{i + 1}</span>
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: "#1a237e" }}>
                    {s.matched && query && (
                      <span style={{
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#f57f17",
                        marginRight: 8,
                        verticalAlign: "middle",
                      }} />
                    )}
                    {s.prn}
                  </td>
                  <td style={{ ...td, lineHeight: 1.8 }}>
                    {s.records.map((r, j) => (
                      <div key={j} style={{ marginBottom: 5 }}>
                        <span className="type-tag">{r.type}</span>
                        <span style={{ fontWeight: 500, color: "#222" }}>{r.title}</span>
                        <span style={{ color: "#999", fontSize: 13 }}> — {r.organisation}</span>
                      </div>
                    ))}
                  </td>
                  <td style={td}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      background: "#e8eaf6",
                      color: "#1a237e",
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: 13,
                    }}>{s.records.length}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    padding: "32px 30px",
    maxWidth: 980,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  label: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#aaa",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#1a237e",
  },
  countBadge: {
    fontSize: 13,
    fontWeight: 600,
    color: "#3949ab",
    background: "#eef0fb",
    padding: "5px 14px",
    borderRadius: 20,
  },
  searchBox: {
    display: "flex",
    gap: 10,
    marginBottom: 24,
    background: "#fff",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #e8e8e8",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fafafa",
  },
  select: {
    padding: "10px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    color: "#444",
    cursor: "pointer",
    background: "#fafafa",
  },
  searchBtn: {
    padding: "10px 26px",
    backgroundColor: "#1a237e",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.2s",
  },
  tableWrap: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #ebebeb",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  empty: {
    textAlign: "center",
    padding: "50px 20px",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #ebebeb",
  },
};

const th = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 11,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  background: "#f9f9f9",
  borderBottom: "1px solid #efefef",
};

const td = {
  padding: "13px 16px",
  color: "#333",
  verticalAlign: "top",
};