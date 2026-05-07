import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/student-record/detail/${id}`);
        if (res.data.success) setActivity(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetch();
  }, [id]);

  if (!activity) return <div style={styles.page}>Loading...</div>;

  const statusColors = {
    VERIFIED: { bg: '#e8f5e9', color: '#2e7d32' },
    PENDING:  { bg: '#fff8e1', color: '#f57f17' },
    REJECTED: { bg: '#ffebee', color: '#c62828' },
  };
  const s = statusColors[activity.status] || statusColors.PENDING;

  const actionColors = {
    Added:    '#1a237e',
    Edited:   '#f57f17',
    Verified: '#2e7d32',
    Rejected: '#c62828',
  };

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

      <div style={styles.card}>
        <div style={styles.cardTop}>
          <span style={styles.typeBadge}>{activity.type}</span>
          <span style={{ ...styles.statusBadge, backgroundColor: s.bg, color: s.color }}>
            {activity.status}
          </span>
        </div>

        <h2 style={styles.title}>{activity.title}</h2>
        <p style={styles.org}>{activity.organisation}</p>

        <div style={styles.divider} />

        <div style={styles.infoGrid}>
         
          {(() => {
    const originalDate = activity.created_at || activity.submitted_at
    const diff = (new Date() - new Date(originalDate)) / (1000 * 60 * 60 * 24)
    const daysLeft = Math.max(0, 7 - Math.floor(diff))
    return (
        <div style={{
            backgroundColor: daysLeft === 0 ? '#ffebee' : '#e8f5e9',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 14,
            fontSize: 13,
            color: daysLeft === 0 ? '#c62828' : '#2e7d32',
            fontWeight: 600
        }}>
            {daysLeft === 0 
                ? ' Edit window closed — 7 days have passed'
                : ` Edit window open — ${daysLeft} day(s) remaining`
            }
        </div>
    )
})()}
          {activity.start_date && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Start Date</span>
              <span style={styles.infoValue}>
                {new Date(activity.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
          {activity.end_date && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>End Date</span>
              <span style={styles.infoValue}>
                {new Date(activity.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
          {activity.duration_weeks && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Duration</span>
              <span style={styles.infoValue}>{activity.duration_weeks} weeks</span>
            </div>
          )}
          {activity.verified_by && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>
                {activity.status === 'VERIFIED' ? 'Verified By' : 'Reviewed By'}
              </span>
              <span style={styles.infoValue}>{activity.verified_by}</span>
            </div>
          )}
        </div>

        {activity.description && (
          <div style={styles.descBox}>
            <span style={styles.infoLabel}>Description</span>
            <p style={styles.descText}>{activity.description}</p>
          </div>
        )}

        {activity.rejection_reason && (
          <div style={styles.rejectBox}>
            <span style={styles.rejectLabel}>Rejection Reason</span>
            <p style={styles.rejectText}>{activity.rejection_reason}</p>
          </div>
        )}

        <div style={styles.divider} />

        <h3 style={styles.historyTitle}>Activity History</h3>

        {activity.history && activity.history.length > 0 ? (
          <div style={styles.timeline}>
            {activity.history.map((h, i) => (
              <div key={i} style={styles.timelineItem}>
                <div style={styles.timelineDot(actionColors[h.action] || '#888')} />
                {i < activity.history.length - 1 && <div style={styles.timelineLine} />}
                <div style={styles.timelineContent}>
                  <span style={{ ...styles.actionBadge, color: actionColors[h.action] || '#888' }}>
                    {h.action}
                  </span>
                  <span style={styles.timelineTime}>
                    {new Date(h.timestamp).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  {h.note && <p style={styles.timelineNote}>{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#bbb', fontSize: 13 }}>No history available.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '28px 24px', maxWidth: 700, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  backBtn: { background: 'none', border: 'none', color: '#1a237e', fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0, fontFamily: "'Segoe UI', sans-serif" },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: '28px 32px', boxShadow: '0 1px 12px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  typeBadge: { backgroundColor: '#e8eaf6', color: '#3949ab', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' },
  statusBadge: { padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  title: { margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1a1a1a' },
  org: { margin: '0 0 18px', fontSize: 14, color: '#888' },
  divider: { height: 1, backgroundColor: '#f0f0f0', margin: '18px 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 16 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 3 },
  infoLabel: { fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: '#333', fontWeight: 500 },
  descBox: { marginBottom: 14 },
  descText: { margin: '6px 0 0', fontSize: 14, color: '#555', lineHeight: 1.6 },
  rejectBox: { backgroundColor: '#ffebee', borderRadius: 8, padding: '10px 14px', marginBottom: 14 },
  rejectLabel: { fontSize: 11, color: '#c62828', fontWeight: 600, textTransform: 'uppercase' },
  rejectText: { margin: '4px 0 0', fontSize: 13, color: '#c62828' },
  historyTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1a237e' },
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineItem: { display: 'flex', gap: 14, position: 'relative', paddingBottom: 20 },
  timelineDot: (color) => ({ width: 12, height: 12, borderRadius: '50%', backgroundColor: color, marginTop: 3, flexShrink: 0 }),
  timelineLine: { position: 'absolute', left: 5, top: 16, bottom: 0, width: 2, backgroundColor: '#f0f0f0' },
  timelineContent: { flex: 1 },
  actionBadge: { fontSize: 13, fontWeight: 700 },
  timelineTime: { fontSize: 12, color: '#aaa', marginLeft: 10 },
  timelineNote: { margin: '4px 0 0', fontSize: 13, color: '#666' },
};

export default ActivityDetail;