import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentDashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [prn, setPrn] = useState('');

  useEffect(() => {
    // Get PRN from localStorage (we'll store it at login)
    const storedPrn = localStorage.getItem('prn');
    if (storedPrn) {
      setPrn(storedPrn);
      fetchActivities(storedPrn);
    }
  }, []);

  const fetchActivities = async (studentPrn) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student-record/my?prn=${prn}`);
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching activities:', error);
    }
  };

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>
          <div>
            <h2 style={styles.name}>{localStorage.getItem('name') || 'Student'}</h2>
            <p style={styles.info}>Roll No: {prn}</p>
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{activities.length}</h3>
            <p style={styles.statLabel}>Total Activities</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{activities.filter(a => a.status === 'VERIFIED').length}</h3>
            <p style={styles.statLabel}>Verified</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{activities.filter(a => a.status === 'PENDING').length}</h3>
            <p style={styles.statLabel}>Pending</p>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>My Achievements</h3>
            <button style={styles.addBtn} onClick={() => navigate('/add-activity')}>
              + Add New
            </button>
          </div>
          {activities.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No activities yet. Add your first one!</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Organisation</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a, i) => (
                  <tr key={i} style={styles.tableRow}>
                    <td style={styles.td}>{a.type}</td>
                    <td style={styles.td}>{a.title}</td>
                    <td style={styles.td}>{a.organisation}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: a.status === 'VERIFIED' ? '#e8f5e9' : a.status === 'REJECTED' ? '#ffebee' : '#fff8e1',
                        color: a.status === 'VERIFIED' ? '#2e7d32' : a.status === 'REJECTED' ? '#c62828' : '#f57f17',
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
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '900px', margin: '0 auto' },
  profileCard: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '25px' },
  avatar: { fontSize: '60px' },
  name: { color: '#1a237e', fontSize: '22px' },
  info: { color: '#666', fontSize: '14px', marginTop: '4px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '25px' },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  statValue: { fontSize: '28px', color: '#1a237e' },
  statLabel: { color: '#888', fontSize: '13px', marginTop: '5px' },
  section: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  addBtn: { backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { backgroundColor: '#e8eaf6' },
  th: { padding: '12px', textAlign: 'left', fontSize: '14px', color: '#1a237e' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px', fontSize: '14px', color: '#444' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
};

export default StudentDashboard;