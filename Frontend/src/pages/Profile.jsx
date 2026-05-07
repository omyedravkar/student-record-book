import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const prn = localStorage.getItem('prn');
    const token = localStorage.getItem('token');

    // axios.get(`http://localhost:5000/api/erp/student/${prn}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // .then(res => {
    //   if (res.data.success) setStudent(res.data.data);
    // })
    axios.get(`http://localhost:5000/api/erp/student/${prn}`)
.then(res => {
    if (res.data.success) setStudent(res.data.data)
})
    .catch(err => console.log(err));
  }, []);

  if (!student) return (
    <div style={styles.page}>
      <p style={{ color: '#aaa', fontSize: 14 }}>Loading profile...</p>
    </div>
  );

  const initials = student.name
    ? student.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  const Field = ({ label, value }) => (
    <div style={styles.fieldRow}>
      <span style={styles.fieldLabel}>{label}</span>
      <span style={styles.fieldValue}>{value || '—'}</span>
    </div>
  );

  return (
    <div style={styles.page}>

      <h2 style={styles.pageTitle}>My Profile</h2>

      <div style={styles.card}>

        {/* Avatar + Name */}
        <div style={styles.profileTop}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <p style={styles.name}>{student.name}</p>
            <p style={styles.branch}>{student.branch} &mdash; Year {student.year}</p>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Personal */}
        <p style={styles.sectionLabel}>Personal Details</p>
        <Field label="Date of Birth" value={student.dob} />
        <Field label="Email" value={student.email} />
        <Field label="Phone" value={student.phone} />

        <div style={styles.divider} />

        {/* Academic */}
        <p style={styles.sectionLabel}>Academic Details</p>
        <Field label="PRN Number" value={student.prn} />
        <Field label="CGPA" value={student.cgpa} />
        <Field label="Attendance" value={student.attendance ? `${student.attendance}%` : null} />
        <Field label="Mentor" value={student.mentor} />

      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '28px 24px',
    maxWidth: 680,
    margin: '0 auto',
    fontFamily: "'Segoe UI', sans-serif",
  },
  pageTitle: {
    margin: '0 0 20px',
    fontSize: 20,
    fontWeight: 700,
    color: '#1a237e',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: '28px 30px',
    boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
  },
  profileTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    marginBottom: 22,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: '#1a237e',
    color: '#fff',
    fontSize: 22,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  name: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  branch: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#888',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    margin: '18px 0',
  },
  sectionLabel: {
    margin: '0 0 12px',
    fontSize: 12,
    fontWeight: 700,
    color: '#1a237e',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldRow: {
    display: 'flex',
    padding: '9px 0',
    borderBottom: '1px solid #f7f7f7',
  },
  fieldLabel: {
    width: 160,
    fontSize: 13,
    color: '#999',
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#222',
  },
};