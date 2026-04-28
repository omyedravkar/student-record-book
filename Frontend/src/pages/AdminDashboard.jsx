import { useState } from 'react';

const allStudents = [
  { name: 'Apurva Uike', roll: '246100029', cgpa: 8.75, internships: 2, projects: 3, certs: 4 },
  { name: 'Soham Mahure', roll: '246100030', cgpa: 8.20, internships: 1, projects: 2, certs: 3 },
  { name: 'Om Yedravkar', roll: '246100014', cgpa: 9.10, internships: 3, projects: 4, certs: 5 },
];

function getScore(s) {
  return (s.cgpa * 5) + (s.internships * 10) + (s.projects * 8) + (s.certs * 3);
}

const rankLabel = (i) => {
  if (i === 0) return { text: '1', color: '#b8860b', bg: '#fffbea' };
  if (i === 1) return { text: '2', color: '#666', bg: '#f5f5f5' };
  if (i === 2) return { text: '3', color: '#a0522d', bg: '#fdf0e8' };
  return { text: String(i + 1), color: '#999', bg: 'transparent' };
};

function AdminDashboard() {
  const [search, setSearch] = useState('');

  const sorted = [...allStudents]
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.includes(search)
    )
    .sort((a, b) => getScore(b) - getScore(a));

  return (
    <div style={styles.page}>

      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Placement Ranking</h2>
        <span style={styles.countBadge}>{sorted.length} students</span>
      </div>

      <input
        style={styles.search}
        placeholder="Search by name or roll number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Roll No</th>
              <th style={styles.th}>CGPA</th>
              <th style={styles.th}>Internships</th>
              <th style={styles.th}>Projects</th>
              <th style={styles.th}>Certs</th>
              <th style={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const rank = rankLabel(i);
              return (
                <tr key={i} style={{
                  ...styles.tr,
                  backgroundColor: i === 0 ? '#fffdf0' : '#fff',
                }}>
                  <td style={styles.td}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: rank.bg,
                      color: rank.color,
                      fontSize: 13,
                      fontWeight: 700,
                    }}>
                      {rank.text}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#1a1a1a' }}>{s.name}</td>
                  <td style={{ ...styles.td, color: '#888' }}>{s.roll}</td>
                  <td style={styles.td}>{s.cgpa}</td>
                  <td style={styles.td}>{s.internships}</td>
                  <td style={styles.td}>{s.projects}</td>
                  <td style={styles.td}>{s.certs}</td>
                  <td style={styles.td}>
                    <span style={styles.scoreBadge}>{getScore(s)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <p style={styles.empty}>No students found.</p>
        )}
      </div>

    </div>
  );
}

const styles = {
  page: {
    padding: '28px 24px',
    maxWidth: 960,
    margin: '0 auto',
    fontFamily: "'Segoe UI', sans-serif",
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  pageTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#1a237e',
  },
  countBadge: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: 500,
  },
  search: {
    width: '100%',
    padding: '11px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 20,
    outline: 'none',
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', sans-serif",
  },
  tableWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
    overflow: 'hidden',
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
    backgroundColor: '#fff',
  },
  tr: {
    borderBottom: '1px solid #f7f7f7',
  },
  td: {
    padding: '13px 16px',
    fontSize: 14,
    color: '#444',
    verticalAlign: 'middle',
  },
  scoreBadge: {
    backgroundColor: '#e8eaf6',
    color: '#1a237e',
    fontWeight: 700,
    fontSize: 13,
    padding: '3px 10px',
    borderRadius: 20,
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
  },
};

export default AdminDashboard;