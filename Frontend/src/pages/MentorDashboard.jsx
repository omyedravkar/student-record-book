import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function MentorDashboard() {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

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
        alert(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
        fetchPending();
      }
    } catch (error) {
      alert('Action failed');
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Mentor Dashboard</h2>
        {records.length > 0 && (
          <span style={styles.pendingBadge}>{records.length} pending</span>
        )}
      </div>

      {records.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyDot} />
          <p style={styles.emptyText}>All records verified. Nothing pending.</p>
        </div>
      ) : (
        records.map((r, i) => (
          <div key={i} style={{...styles.card, cursor: 'pointer'}} 
          onClick={() => navigate(`/activity/${r._id}`)}>

            <div style={styles.cardTop}>
              <span style={styles.typeBadge}>{r.type}</span>
              <span style={styles.prnLabel}>PRN: {r.prn}</span>
            </div>

            <h3 style={styles.title}>{r.title}</h3>

            <div style={styles.metaRow}>
              <span style={styles.metaItem}>{r.organisation}</span>
              {r.duration_weeks && (
                <span style={styles.metaItem}>{r.duration_weeks} weeks</span>
              )}
              {r.start_date && (
                <span style={styles.metaItem}>
                  {new Date(r.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
              {r.submitted_at && (
                <span style={styles.metaItem}>
                  Submitted: {new Date(r.submitted_at).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
              })}
                </span>
)}
            </div>

            {r.description && (
              <p style={styles.description}>{r.description}</p>
            )}

            <div style={styles.cardFooter}>
              {r.document_url ? (
                <a
                  href={`http://localhost:5000${r.document_url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.docLink}
                >
                  View Document
                </a>
              ) : (
                <span style={styles.noDoc}>No document uploaded</span>
              )}

              <div style={styles.actions}>
                <button
  style={styles.rejectBtn}
  onClick={(e) => {
    e.stopPropagation();
    handleAction(r._id, 'reject');
  }}
>
  Reject
</button>
<button
  style={styles.approveBtn}
  onClick={(e) => {
    e.stopPropagation();
    handleAction(r._id, 'approve');
  }}
>
  Approve
</button>
              </div>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '28px 24px',
    maxWidth: 820,
    margin: '0 auto',
    fontFamily: "'Segoe UI', sans-serif",
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  pageTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#1a237e',
  },
  pendingBadge: {
    backgroundColor: '#fff8e1',
    color: '#f57f17',
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '48px 24px',
    textAlign: 'center',
    boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
  },
  emptyDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#4caf50',
    margin: '0 auto 14px',
  },
  emptyText: {
    margin: 0,
    color: '#aaa',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
    marginBottom: 14,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#e8eaf6',
    color: '#3949ab',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  prnLabel: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: 500,
  },
  title: {
    margin: '0 0 8px',
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  metaRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: 13,
    color: '#888',
  },
  description: {
    margin: '0 0 14px',
    fontSize: 13,
    color: '#666',
    lineHeight: 1.6,
    borderLeft: '3px solid #e8eaf6',
    paddingLeft: 12,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #f5f5f5',
    paddingTop: 14,
    marginTop: 4,
  },
  docLink: {
    fontSize: 13,
    color: '#1a237e',
    fontWeight: 600,
    textDecoration: 'none',
    borderBottom: '1px solid #c5cae9',
    paddingBottom: 1,
  },
  noDoc: {
    fontSize: 13,
    color: '#ccc',
  },
  actions: {
    display: 'flex',
    gap: 10,
  },
  rejectBtn: {
    padding: '7px 18px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
  },
  approveBtn: {
    padding: '7px 18px',
    backgroundColor: '#1a237e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
  },
};

export default MentorDashboard;