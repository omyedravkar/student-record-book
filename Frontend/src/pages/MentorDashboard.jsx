import { useState, useEffect } from 'react';
import axios from 'axios';

function MentorDashboard() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/mentor/pending');
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching pending records:', error);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const mentorName = localStorage.getItem('name') || 'Mentor';
      const url = `http://localhost:5000/api/mentor/${action}/${id}`;
      const body = action === 'reject'
        ? { mentor_name: mentorName, reason: 'Does not meet requirements' }
        : { mentor_name: mentorName };

      const response = await axios.put(url, body);
      if (response.data.success) {
        alert(`${action === 'approve' ? '✅ Approved' : '❌ Rejected'} successfully!`);
        fetchPending();
      }
    } catch (error) {
      alert('Action failed');
    }
  };

  return (
    <div>
      <div style={styles.container}>
        <h2 style={styles.heading}>Mentor Dashboard</h2>
        <p style={styles.sub}>Pending verifications: {records.length}</p>

        {records.length === 0 ? (
          <div style={styles.empty}>🎉 All records verified! Nothing pending.</div>
        ) : (
          records.map((r, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardLeft}>
                <span style={styles.typeBadge}>{r.type}</span>
                <h3 style={styles.title}>{r.title}</h3>
                <p style={styles.meta}>👤 {r.prn} — 🏢 {r.organisation}</p>
                <p style={styles.meta}>📅 {r.start_date ? new Date(r.start_date).toLocaleDateString() : 'N/A'} — {r.duration_weeks} weeks</p>
                {r.description && <p style={styles.meta}>📝 {r.description}</p>}
                {r.document_url && (
                  <a href={`http://localhost:5000${r.document_url}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: '13px', color: '#1a237e', fontWeight: '600' }}>
                    📄 View Document
                  </a>
                )}
              </div>
              <div style={styles.actions}>
                <button style={styles.approveBtn} onClick={() => handleAction(r._id, 'approve')}>✅ Approve</button>
                <button style={styles.rejectBtn} onClick={() => handleAction(r._id, 'reject')}>❌ Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '800px', margin: '0 auto' },
  heading: { color: '#1a237e', marginBottom: '5px' },
  sub: { color: '#888', fontSize: '14px', marginBottom: '20px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '15px' },
  cardLeft: { flex: 1 },
  typeBadge: { backgroundColor: '#e8eaf6', color: '#1a237e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  title: { margin: '8px 0 5px', color: '#222' },
  meta: { color: '#888', fontSize: '13px', marginTop: '3px' },
  actions: { display: 'flex', gap: '10px' },
  approveBtn: { padding: '8px 16px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  rejectBtn: { padding: '8px 16px', backgroundColor: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#888', padding: '50px', fontSize: '16px' },
};

export default MentorDashboard;