import { useState } from 'react';

const allStudents = [
  { name: 'Apurva Uike', roll: '246100029', cgpa: 8.75, internships: 2, projects: 3, certs: 4 },
  { name: 'Soham Mahure', roll: '246100030', cgpa: 8.20, internships: 1, projects: 2, certs: 3 },
  { name: 'Om Yedravkar', roll: '246100014', cgpa: 9.10, internships: 3, projects: 4, certs: 5 },
];

function getScore(s) {
  return (s.cgpa * 5) + (s.internships * 10) + (s.projects * 8) + (s.certs * 3);
}

function AdminDashboard() {
  const [search, setSearch] = useState('');
  const sorted = [...allStudents]
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search))
    .sort((a, b) => getScore(b) - getScore(a));

  return (
    <div>
      <div style={styles.container}>
        <h2 style={styles.heading}>Admin Dashboard — Placement Ranking</h2>
        <input
          style={styles.search}
          placeholder="🔍 Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
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
            {sorted.map((s, i) => (
              <tr key={i} style={{ ...styles.row, backgroundColor: i === 0 ? '#fffde7' : 'white' }}>
                <td style={styles.td}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                <td style={{ ...styles.td, fontWeight: '600' }}>{s.name}</td>
                <td style={styles.td}>{s.roll}</td>
                <td style={styles.td}>{s.cgpa}</td>
                <td style={styles.td}>{s.internships}</td>
                <td style={styles.td}>{s.projects}</td>
                <td style={styles.td}>{s.certs}</td>
                <td style={{ ...styles.td, color: '#1a237e', fontWeight: '700' }}>{getScore(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '950px', margin: '0 auto' },
  heading: { color: '#1a237e', marginBottom: '20px' },
  search: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  thead: { backgroundColor: '#1a237e' },
  th: { padding: '14px', color: 'white', textAlign: 'left', fontSize: '14px' },
  row: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '13px 14px', fontSize: '14px', color: '#444' },
};

export default AdminDashboard;