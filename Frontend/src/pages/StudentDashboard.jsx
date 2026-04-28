import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentDashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [prn, setPrn] = useState('');

  useEffect(() => {
    const storedPrn = localStorage.getItem('prn');
    if (storedPrn) {
      setPrn(storedPrn);
      fetchActivities(storedPrn);
    }
  }, []);

  const fetchActivities = async (studentPrn) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student-record/my?prn=${studentPrn}`);
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching activities:', error);
    }
  };

  const verified = activities.filter(a => a.status === 'VERIFIED').length;
  const pending = activities.filter(a => a.status === 'PENDING').length;
  const rejected = activities.filter(a => a.status === 'REJECTED').length;

  const statusStyle = (status) => {
    if (status === 'VERIFIED') return { bg: '#e8f5e9', color: '#2e7d32' };
    if (status === 'REJECTED') return { bg: '#ffebee', color: '#c62828' };
    return { bg: '#fff8e1', color: '#f57f17' };
  };

  return (
    <div style={styles.page}>

      {/* Profile */}
      <div style={styles.card}>
        <div style={styles.avatarCircle}>
          {(localStorage.getItem('name') || 'S').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={styles.name}>{localStorage.getItem('name') || 'Student'}</h2>
          <p style={styles.prn}>PRN: {prn}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total', value: activities.length },
          { label: 'Verified', value: verified },
          { label: 'Pending', value: pending },
          { label: 'Rejected', value: rejected },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activities Table */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>My Achievements</h3>
          <button style={styles.addBtn} onClick={() => navigate('/add-activity')}>
            + Add New
          </button>
        </div>

        {activities.length === 0 ? (
          <p style={styles.empty}>No activities yet. Add your first one!</p>
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
              {activities.map((a, i) => {
                const s = statusStyle(a.status);
                return (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.typeTag}>{a.type}</span>
                    </td>
                    <td style={styles.td}>{a.title}</td>
                    <td style={{ ...styles.td, color: '#888' }}>{a.organisation}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: s.bg, color: s.color }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '22px 24px',
    boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    backgroundColor: '#1a237e',
    color: '#fff',
    fontSize: 22,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    flexShrink: 0,
    verticalAlign: 'middle',
  },
  name: {
    display: 'inline-block',
    verticalAlign: 'middle',
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#1a237e',
  },
  prn: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#888',
    paddingLeft: 70,
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '18px 16px',
    textAlign: 'center',
    boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a237e',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#1a237e',
  },
  addBtn: {
    backgroundColor: '#1a237e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  empty: {
    color: '#aaa',
    textAlign: 'center',
    padding: '28px 0',
    fontSize: 14,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #f0f0f0',
  },
  tr: {
    borderBottom: '1px solid #f7f7f7',
  },
  td: {
    padding: '13px 12px',
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
  badge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
};

export default StudentDashboard;