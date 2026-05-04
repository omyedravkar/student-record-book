import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios";

const STATUS_COLORS = {
  VERIFIED: { bg: "#e8f5e9", color: "#2e7d32" },
  PENDING:  { bg: "#fff8e1", color: "#f57f17" },
  REJECTED: { bg: "#ffebee", color: "#c62828" },
};

export default function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

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
const filteredActivities = activities.filter(a => {
 const matchSearch = 
  a.title.toLowerCase().includes(search.toLowerCase()) ||
  (a.organisation && a.organisation.toLowerCase().includes(search.toLowerCase())) ||
  a.type.toLowerCase().includes(search.toLowerCase());
  const matchType = typeFilter === 'all' || a.type === typeFilter;
  return matchSearch && matchType;
});
  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h2 style={styles.title}>My Activities</h2>
        <span style={styles.count}>{activities.length} total</span>
      </div>

      <div style={styles.card}>
<div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
  <input
    type="text"
    placeholder="Search by title or organisation..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      flex: 1,
      padding: '9px 14px',
      border: '1.5px solid #e0e0e0',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: '#fafafa',
    }}
  />
  <select
    value={typeFilter}
    onChange={(e) => setTypeFilter(e.target.value)}
    style={{
      padding: '9px 14px',
      border: '1.5px solid #e0e0e0',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: '#fafafa',
      cursor: 'pointer',
    }}
  >
    <option value="all">All Types</option>
    <option value="internship">Internship</option>
    <option value="certificate">Certificate</option>
    <option value="project">Project</option>
    <option value="activity">Activity</option>
  </select>
</div>
        {activities.length === 0 ? (
          <p style={styles.empty}>No activities yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Organisation</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((a, i) => (
                <tr key={i} style={{...styles.tr, cursor: 'pointer'}} onClick={() => navigate(`/activity/${a._id}`)}>
                  <td style={styles.td}>
                    <span style={styles.typeTag}>{a.type}</span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#222' }}>{a.title}</td>
                  <td style={{ ...styles.td, color: '#888' }}>{a.organisation}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: STATUS_COLORS[a.status]?.bg,
                      color: STATUS_COLORS[a.status]?.color,
                    }}>
                      {a.status}
                    </span>
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

const styles = {
  page: {
    padding: '28px 24px',
    maxWidth: 900,
    margin: '0 auto',
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#1a237e',
  },
  count: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: 500,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  empty: {
    padding: '32px',
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '11px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #f0f0f0',
  },
  tr: {
    borderBottom: '1px solid #f7f7f7',
  },
  td: {
    padding: '13px 16px',
    fontSize: 14,
    color: '#333',
    verticalAlign: 'middle',
  },
  typeTag: {
    backgroundColor: '#e8eaf6',
    color: '#3949ab',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
};