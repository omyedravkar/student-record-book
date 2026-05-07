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
  const [search, setSearch] = useState('');

  const filteredActivities = activities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    (a.organisation && a.organisation.toLowerCase().includes(search.toLowerCase()))
  );

  const verified = activities.filter(a => a.status === 'VERIFIED').length;
  const pending = activities.filter(a => a.status === 'PENDING').length;
  const rejected = activities.filter(a => a.status === 'REJECTED').length;

  const statusStyle = (status) => {
    if (status === 'VERIFIED') return { bg: '#e8f5e9', color: '#2e7d32' };
    if (status === 'REJECTED') return { bg: '#ffebee', color: '#c62828' };
    return { bg: '#fff8e1', color: '#f57f17' };
  };

  {/* added for the edit and delete [SOHAM]*/ }
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/student-record/delete/${id}`);
      fetchActivities(prn);
    } catch (error) {
      console.log('Error deleting:', error);
    }
  };
  const levelColor = (level) => {
  const map = {
    International: { bg: '#e8f5e9', color: '#2e7d32' },
    National: { bg: '#e3f2fd', color: '#1565c0' },
    State: { bg: '#f3e5f5', color: '#6a1b9a' },
    District: { bg: '#fff3e0', color: '#e65100' },
    College: { bg: '#fce4ec', color: '#c62828' },
    Other: { bg: '#f5f5f5', color: '#666' },
  };
  return map[level] || null;
};
  const isEditable = (activity) => {
    const originalDate = activity.created_at || activity.submitted_at
    const diff = (new Date() - new Date(originalDate)) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }
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
      <input
        type="text"
        placeholder="Search by title, type or organisation..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '9px 14px',
          border: '1.5px solid #e0e0e0',
          borderRadius: 8,
          fontSize: 14,
          marginBottom: 14,
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "'Segoe UI', sans-serif",
          backgroundColor: '#fafafa',
        }}
      />
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
                <th style={styles.th}>Submitted</th>
                {/* added for the edit and delete [SOHAM]*/}
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((a, i) => {
                const s = statusStyle(a.status);
                const lc = a.level ? levelColor(a.level) : null;
                return (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.typeTag}>{a.type}</span>
                      {a.subcategory && <span style={{ ...styles.typeTag, background: '#f5f5f5', color: '#666', marginLeft: 4 }}>{a.subcategory}</span>}
                    </td>
                    <td style={styles.td}>
                      {a.title}
                      {lc && (
                        <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: lc.bg, color: lc.color }}>
                          {a.level}
                        </span>
                      )}
                    </td>
                    <td style={{ ...styles.td, color: '#888' }}>{a.organisation}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: s.bg, color: s.color }}>{a.status}</span>
                    </td>
                    <td style={styles.td}>
                      {a.submitted_at ? new Date(a.submitted_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td style={styles.td}>
                      {(a.status === 'PENDING' || a.status === 'REJECTED') ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {isEditable(a) ? (
                            <button onClick={() => navigate(`/edit-activity/${a._id}`)} style={styles.editBtn}>Edit</button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#aaa' }}>Locked</span>
                          )}
                          <button onClick={() => handleDelete(a._id)} style={styles.deleteBtn}>Delete</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#ccc' }}>—</span>
                      )}
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