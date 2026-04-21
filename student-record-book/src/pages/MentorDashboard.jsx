import { useState } from 'react';

const pending = [
  { student: 'Apurva Uike', roll: '246100029', type: 'Internship', title: 'Web Dev Intern at TechCorp', date: '2024-06-01' },
  { student: 'Soham Mahure', roll: '246100030', type: 'Certificate', title: 'AWS Cloud Practitioner', date: '2024-03-15' },
  { student: 'Om Yedravkar', roll: '246100014', type: 'Project', title: 'ML based Attendance System', date: '2025-01-10' },
];

function MentorDashboard() {
  const [records, setRecords] = useState(pending);

  const handleAction = (index, action) => {
    const updated = [...records];
    updated.splice(index, 1);
    setRecords(updated);
    alert(`${action === 'approve' ? '✅ Approved' : '❌ Rejected'} successfully!`);
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
                <p style={styles.meta}>👤 {r.student} ({r.roll}) — 📅 {r.date}</p>
              </div>
              <div style={styles.actions}>
                <button style={styles.approveBtn} onClick={() => handleAction(i, 'approve')}>✅ Approve</button>
                <button style={styles.rejectBtn} onClick={() => handleAction(i, 'reject')}>❌ Reject</button>
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
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '15px',
  },
  cardLeft: { flex: 1 },
  typeBadge: { backgroundColor: '#e8eaf6', color: '#1a237e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  title: { margin: '8px 0 5px', color: '#222' },
  meta: { color: '#888', fontSize: '13px' },
  actions: { display: 'flex', gap: '10px' },
  approveBtn: { padding: '8px 16px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  rejectBtn: { padding: '8px 16px', backgroundColor: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#888', padding: '50px', fontSize: '16px' },
};

export default MentorDashboard;