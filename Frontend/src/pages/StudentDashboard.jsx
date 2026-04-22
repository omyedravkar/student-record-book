import { useNavigate } from 'react-router-dom';

const studentData = {
  name: 'Apurva Uike',
  rollNo: '246100029',
  branch: 'Information Technology',
  year: 'Second Year',
  cgpa: '8.75',
  attendance: '87%',
  achievements: [
    { type: 'Internship', title: 'Web Dev Intern at TechCorp', date: '2024-06-01', status: 'Verified' },
    { type: 'Certificate', title: 'AWS Cloud Practitioner', date: '2024-03-15', status: 'Pending' },
    { type: 'Project', title: 'Student Record Book System', date: '2025-01-10', status: 'Verified' },
  ],
};

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>
          <div>
            <h2 style={styles.name}>{studentData.name}</h2>
            <p style={styles.info}>Roll No: {studentData.rollNo}</p>
            <p style={styles.info}>{studentData.branch} — {studentData.year}</p>
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{studentData.cgpa}</h3>
            <p style={styles.statLabel}>CGPA</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{studentData.attendance}</h3>
            <p style={styles.statLabel}>Attendance</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{studentData.achievements.length}</h3>
            <p style={styles.statLabel}>Achievements</p>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>My Achievements</h3>
            <button style={styles.addBtn} onClick={() => navigate('/add-achievement')}>
              + Add New
            </button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentData.achievements.map((a, i) => (
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.td}>{a.type}</td>
                  <td style={styles.td}>{a.title}</td>
                  <td style={styles.td}>{a.date}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: a.status === 'Verified' ? '#e8f5e9' : '#fff8e1',
                      color: a.status === 'Verified' ? '#2e7d32' : '#f57f17',
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '900px', margin: '0 auto' },
  profileCard: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '25px', display: 'flex', alignItems: 'center',
    gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '25px',
  },
  avatar: { fontSize: '60px' },
  name: { color: '#1a237e', fontSize: '22px' },
  info: { color: '#666', fontSize: '14px', marginTop: '4px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '25px' },
  statCard: {
    flex: 1, backgroundColor: 'white', borderRadius: '12px',
    padding: '20px', textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  statValue: { fontSize: '28px', color: '#1a237e' },
  statLabel: { color: '#888', fontSize: '13px', marginTop: '5px' },
  section: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  addBtn: {
    backgroundColor: '#1a237e', color: 'white',
    border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { backgroundColor: '#e8eaf6' },
  th: { padding: '12px', textAlign: 'left', fontSize: '14px', color: '#1a237e' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px', fontSize: '14px', color: '#444' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
};

export default StudentDashboard;