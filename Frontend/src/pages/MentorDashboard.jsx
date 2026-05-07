import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MentorDashboard() {
  const [tab, setTab] = useState('pending');
  const [records, setRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [erpCache, setErpCache] = useState({});
  const [expandedPrn, setExpandedPrn] = useState(null);
  const navigate = useNavigate();
  const mentorName = localStorage.getItem('name') || 'Mentor';

  useEffect(() => { fetchPending(); }, []);
  useEffect(() => { if (tab === 'history') fetchHistory(); }, [tab]);

  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/mentor/pending');
      if (res.data.success) setRecords(res.data.data);
    } catch (e) { console.log(e); }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/mentor/history?mentor_name=${mentorName}`);
      if (res.data.success) setHistory(res.data.data);
    } catch (e) { console.log(e); }
  };

  const fetchErpForStudent = async (prn) => {
    if (erpCache[prn]) return; // already fetched
    try {
      const res = await axios.get(`http://localhost:5000/api/erp/student/${prn}`);
      if (res.data.success) {
        setErpCache(prev => ({ ...prev, [prn]: res.data.data }));
      }
    } catch (e) { console.log(e); }
  };

  const toggleStudentCard = (prn) => {
    if (expandedPrn === prn) {
      setExpandedPrn(null);
    } else {
      setExpandedPrn(prn);
      fetchErpForStudent(prn);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const reason = action === 'reject' ? prompt('Reason for rejection:') || 'Does not meet requirements' : undefined;
      const body = action === 'reject' ? { mentor_name: mentorName, reason } : { mentor_name: mentorName };
      const res = await axios.put(`http://localhost:5000/api/mentor/${action}/${id}`, body);
      if (res.data.success) {
        alert(action === 'approve' ? '✅ Approved!' : '❌ Rejected!');
        fetchPending();
      }
    } catch (e) { alert('Action failed'); }
  };

  const filtered = records.filter(r => {
    const matchSearch = !search ||
      r.prn?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.organisation?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div style={S.page}>
      <style>{`
        .tab-btn { cursor:pointer; border:none; background:none; font-family:inherit; }
        .tab-btn:hover { color:#1a237e !important; }
        .action-btn:hover { opacity:0.85; }
        * { box-sizing:border-box; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <p style={S.label}>MENTOR PANEL</p>
          <h2 style={S.heading}>Dashboard</h2>
        </div>
        <div style={S.tabGroup}>
          <button className="tab-btn" onClick={() => setTab('pending')} style={{
            ...S.tab, color: tab === 'pending' ? '#1a237e' : '#aaa',
            borderBottom: tab === 'pending' ? '2px solid #1a237e' : '2px solid transparent',
            fontWeight: tab === 'pending' ? 700 : 500,
          }}>
            Pending {records.length > 0 && <span style={S.badge}>{records.length}</span>}
          </button>
          <button className="tab-btn" onClick={() => setTab('history')} style={{
            ...S.tab, color: tab === 'history' ? '#1a237e' : '#aaa',
            borderBottom: tab === 'history' ? '2px solid #1a237e' : '2px solid transparent',
            fontWeight: tab === 'history' ? 700 : 500,
          }}>
            My Timeline
          </button>
        </div>
      </div>

      {/* PENDING TAB */}
      {tab === 'pending' && (
        <>
          <div style={S.searchRow}>
            <input style={S.input} placeholder="Search by PRN, title, organisation..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select style={S.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="certificate">Certificate</option>
              <option value="project">Project</option>
              <option value="activity">Activity</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
              <p style={{ margin: 0, fontWeight: 600, color: '#555' }}>
                {search || filterType ? 'No records match your search' : 'All caught up! Nothing pending.'}
              </p>
            </div>
          ) : (
            filtered.map((r, i) => (
              <div key={i} style={S.card}>
                {/* Card top */}
                <div style={S.cardTop}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ ...S.typeBadge, ...typeColor(r.type) }}>{r.type}</span>
                    {/* Clickable PRN to toggle student card */}
                    <button onClick={() => toggleStudentCard(r.prn)} style={S.prnBtn}>
                      PRN: {r.prn} {expandedPrn === r.prn ? '▲' : '▼'}
                    </button>
                  </div>
                  <span style={S.submittedAt}>
                    {r.submitted_at && new Date(r.submitted_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Student ERP Card — expands when PRN clicked */}
                {expandedPrn === r.prn && (
                  <div style={S.erpCard}>
                    {erpCache[r.prn] ? (
                      <>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                          <div style={S.erpAvatar}>
                            {(erpCache[r.prn].name || r.prn).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a237e' }}>{erpCache[r.prn].name}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                              {erpCache[r.prn].branch} · Year {erpCache[r.prn].year} · {erpCache[r.prn].email}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <div style={S.erpStat}>
                            <span style={{ fontWeight: 800, fontSize: 18, color: '#1a237e' }}>{erpCache[r.prn].cgpa}</span>
                            <span style={S.erpStatLabel}>CGPA</span>
                          </div>
                          <div style={S.erpStat}>
                            <span style={{ fontWeight: 800, fontSize: 18, color: '#2e7d32' }}>{erpCache[r.prn].attendance}%</span>
                            <span style={S.erpStatLabel}>Attendance</span>
                          </div>
                          {erpCache[r.prn].marks && Object.entries(erpCache[r.prn].marks).map(([sub, mark]) => (
                            <div key={sub} style={S.erpStat}>
                              <span style={{ fontWeight: 700, fontSize: 16, color: '#555' }}>{mark}</span>
                              <span style={S.erpStatLabel}>{sub.toUpperCase()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: 0, color: '#aaa', fontSize: 13 }}>Loading student data...</p>
                    )}
                  </div>
                )}

                <h3 style={S.title}>{r.title}</h3>

                <div style={S.metaRow}>
                  {r.organisation && <span style={S.meta}>🏢 {r.organisation}</span>}
                  {r.duration_weeks && <span style={S.meta}>⏱ {r.duration_weeks} weeks</span>}
                  {r.start_date && <span style={S.meta}>📅 {new Date(r.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                </div>

                {r.description && <p style={S.desc}>{r.description}</p>}

                <div style={S.footer}>
                  {r.document_url
                    ? <a href={`http://localhost:5000${r.document_url}`} target="_blank" rel="noreferrer"
                        style={S.docLink}>📄 View Document</a>
                    : <span style={{ fontSize: 13, color: '#ccc' }}>No document</span>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="action-btn" style={S.rejectBtn}
                      onClick={() => handleAction(r._id, 'reject')}>Reject</button>
                    <button className="action-btn" style={S.approveBtn}
                      onClick={() => handleAction(r._id, 'approve')}>Approve</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              <p style={{ margin: 0, color: '#aaa' }}>No activity verified or rejected yet.</p>
            </div>
          ) : (
            <div style={S.timeline}>
              {history.map((r, i) => (
                <div key={i} style={S.timelineItem}>
                  <div style={S.timelineDot(r.status)} />
                  <div style={S.timelineContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ ...S.typeBadge, ...typeColor(r.type), marginRight: 8 }}>{r.type}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{r.title}</span>
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        backgroundColor: r.status === 'VERIFIED' ? '#e8f5e9' : '#ffebee',
                        color: r.status === 'VERIFIED' ? '#2e7d32' : '#c62828',
                      }}>{r.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                      <span style={S.meta}>PRN: {r.prn}</span>
                      {r.organisation && <span style={S.meta}>🏢 {r.organisation}</span>}
                      {r.duration_weeks && <span style={S.meta}>⏱ {r.duration_weeks}w</span>}
                    </div>
                    {r.rejection_reason && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#c62828', fontStyle: 'italic' }}>
                        Reason: {r.rejection_reason}
                      </p>
                    )}
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#bbb' }}>
                      {r.verified_at && new Date(r.verified_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const typeColor = (type) => {
  const map = {
    internship: { background: '#e3f2fd', color: '#1565c0' },
    certificate: { background: '#f3e5f5', color: '#6a1b9a' },
    project: { background: '#e8f5e9', color: '#2e7d32' },
    activity: { background: '#fff3e0', color: '#e65100' },
  };
  return map[type] || { background: '#e8eaf6', color: '#3949ab' };
};

const S = {
  page: { padding: '28px 24px', maxWidth: 860, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  label: { margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#aaa', textTransform: 'uppercase', marginBottom: 4 },
  heading: { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a237e' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  tabGroup: { display: 'flex', gap: 4, borderBottom: '1px solid #f0f0f0' },
  tab: { padding: '8px 18px', fontSize: 14, transition: 'all 0.15s' },
  badge: { backgroundColor: '#fde68a', color: '#92400e', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px', marginLeft: 6 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { flex: 1, padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Segoe UI', sans-serif", background: '#fafafa' },
  select: { padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: "'Segoe UI', sans-serif", background: '#fafafa', color: '#444' },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' },
  card: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', marginBottom: 14 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.03em' },
  prnBtn: { background: 'none', border: '1px solid #e8eaf6', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: '#3949ab', cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 },
  submittedAt: { fontSize: 12, color: '#ccc' },
  erpCard: { background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: 10, padding: '14px 18px', marginBottom: 14 },
  erpAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1a237e,#3949ab)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, flexShrink: 0 },
  erpStat: { background: '#fff', border: '1px solid #eef0fb', borderRadius: 8, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 64 },
  erpStatLabel: { fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
  metaRow: { display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' },
  meta: { fontSize: 13, color: '#888' },
  desc: { margin: '0 0 14px', fontSize: 13, color: '#666', lineHeight: 1.6, borderLeft: '3px solid #e8eaf6', paddingLeft: 12 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f5f5f5', paddingTop: 14 },
  docLink: { fontSize: 13, color: '#1a237e', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #c5cae9', paddingBottom: 1 },
  rejectBtn: { padding: '7px 16px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" },
  approveBtn: { padding: '7px 16px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" },
  timeline: { position: 'relative', paddingLeft: 28 },
  timelineItem: { display: 'flex', gap: 16, marginBottom: 18, position: 'relative' },
  timelineDot: (status) => ({ width: 12, height: 12, borderRadius: '50%', marginTop: 4, flexShrink: 0, backgroundColor: status === 'VERIFIED' ? '#4caf50' : '#ef5350', boxShadow: status === 'VERIFIED' ? '0 0 0 3px #e8f5e9' : '0 0 0 3px #ffebee' }),
  timelineContent: { background: '#fff', borderRadius: 10, padding: '14px 18px', flex: 1, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f5f5f5' },
};