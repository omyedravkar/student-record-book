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
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedPrn, setExpandedPrn] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);   // which card shows rejection input
  const [rejectReason, setRejectReason] = useState('');   // inline rejection reason
  const [actionLoading, setActionLoading] = useState(null);
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
    if (erpCache[prn]) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/erp/student/${prn}`);
      if (res.data.success) setErpCache(prev => ({ ...prev, [prn]: res.data.data }));
    } catch (e) { console.log(e); }
  };

  const toggleCard = (id) => {
    setExpandedCard(prev => prev === id ? null : id);
    setExpandedPrn(null);
    setRejectingId(null);
    setRejectReason('');
  };

  const toggleStudentCard = (e, prn) => {
    e.stopPropagation();
    if (expandedPrn === prn) {
      setExpandedPrn(null);
    } else {
      setExpandedPrn(prn);
      fetchErpForStudent(prn);
    }
  };

  const handleApprove = async (e, id) => {
    e.stopPropagation();
    setActionLoading(id + '_approve');
    try {
      const res = await axios.put(`http://localhost:5000/api/mentor/approve/${id}`, { mentor_name: mentorName });
      if (res.data.success) {
        fetchPending();
        setExpandedCard(null);
      }
    } catch (e) { alert('Action failed'); }
    setActionLoading(null);
  };

  const startReject = (e, id) => {
    e.stopPropagation();
    setRejectingId(id);
    setRejectReason('');
  };

  const cancelReject = (e) => {
    e.stopPropagation();
    setRejectingId(null);
    setRejectReason('');
  };

  const submitReject = async (e, id) => {
    e.stopPropagation();
    if (!rejectReason.trim()) return;
    setActionLoading(id + '_reject');
    try {
      const res = await axios.put(`http://localhost:5000/api/mentor/reject/${id}`, {
        mentor_name: mentorName,
        reason: rejectReason.trim()
      });
      if (res.data.success) {
        fetchPending();
        setExpandedCard(null);
        setRejectingId(null);
        setRejectReason('');
      }
    } catch (e) { alert('Action failed'); }
    setActionLoading(null);
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
        .req-card { cursor:pointer; transition: box-shadow 0.15s, border 0.15s; }
        .req-card:hover { box-shadow: 0 4px 18px rgba(26,35,126,0.10) !important; }
        .approve-btn:hover { background:#1565c0 !important; }
        .reject-btn-start:hover { background:#ffcdd2 !important; }
        .submit-reject:hover { background:#b71c1c !important; }
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
            Pending {records.length > 0 && <span style={S.pendingBadge}>{records.length}</span>}
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

          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 14, marginTop: -10 }}>
            Click a card to review · Click PRN to view student profile
          </p>

          {filtered.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <p style={{ margin: 0, fontWeight: 600, color: '#555' }}>
                {search || filterType ? 'No records match your search' : 'All caught up! Nothing pending.'}
              </p>
            </div>
          ) : (
            filtered.map((r, i) => {
              const isOpen = expandedCard === r._id;
              const isPrnOpen = expandedPrn === r.prn;
              const isRejecting = rejectingId === r._id;
              const lc = r.level ? levelColor(r.level) : null;
              const tc = typeColor(r.type);

              return (
                <div key={i} className="req-card"
                  onClick={() => toggleCard(r._id)}
                  style={{
                    ...S.card,
                    border: isOpen ? '1.5px solid #c5cae9' : '1.5px solid #f0f0f0',
                    background: isOpen ? '#fefeff' : '#fff',
                  }}>

                  {/* ── TOP ROW ── */}
                  <div style={S.cardTop}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ ...S.typeBadge, ...tc }}>{r.type}</span>
                      {r.subcategory && (
                        <span style={{ ...S.typeBadge, background: '#f5f5f5', color: '#666' }}>{r.subcategory}</span>
                      )}
                      {lc && (
                        <span style={{ ...S.typeBadge, background: lc.bg, color: lc.color }}>🏆 {r.level}</span>
                      )}
                      <button onClick={(e) => toggleStudentCard(e, r.prn)} style={S.prnBtn}>
                        👤 PRN: {r.prn} {isPrnOpen ? '▲' : '▼'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={S.submittedAt}>
                        {r.submitted_at && new Date(r.submitted_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <span style={{ fontSize: 14, color: '#bbb' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* ── PREVIEW (always visible) ── */}
                  <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
                    {r.title}
                    {r.organisation && (
                      <span style={{ fontWeight: 400, color: '#aaa', fontSize: 13, marginLeft: 8 }}>
                        · {r.organisation}
                      </span>
                    )}
                  </p>

                  {/* ── STUDENT ERP CARD ── */}
                  {isPrnOpen && (
                    <div style={{ ...S.erpCard, marginTop: 14 }} onClick={e => e.stopPropagation()}>
                      {erpCache[r.prn] ? (
                        <>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                            <div style={S.erpAvatar}>
                              {(erpCache[r.prn].name || r.prn).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a237e' }}>
                                {erpCache[r.prn].name}
                              </p>
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

                  {/* ── EXPANDED DETAILS ── */}
                  {isOpen && (
                    <div style={S.expandedSection} onClick={e => e.stopPropagation()}>

                      {/* Activity Detail Card — same style as student sees */}
                      <div style={S.activityCard}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                          <span style={{ ...S.typeBadge, ...tc, fontSize: 12 }}>{r.type}</span>
                          {r.subcategory && <span style={{ ...S.typeBadge, background: '#f0f0f0', color: '#555', fontSize: 12 }}>{r.subcategory}</span>}
                          {lc && <span style={{ ...S.typeBadge, background: lc.bg, color: lc.color, fontSize: 12 }}>🏆 {r.level}</span>}
                        </div>

                        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{r.title}</h3>

                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                          {r.organisation && (
                            <div style={S.metaChip}>
                              <span style={S.metaIcon}>🏢</span>
                              <span>{r.organisation}</span>
                            </div>
                          )}
                          {r.duration_weeks && (
                            <div style={S.metaChip}>
                              <span style={S.metaIcon}>⏱</span>
                              <span>{r.duration_weeks} weeks</span>
                            </div>
                          )}
                          {r.start_date && (
                            <div style={S.metaChip}>
                              <span style={S.metaIcon}>📅</span>
                              <span>
                                {new Date(r.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {r.end_date && ` → ${new Date(r.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {r.description && (
                          <div style={S.descBox}>
                            <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.7 }}>{r.description}</p>
                          </div>
                        )}

                        {r.document_url ? (
                          <a href={`http://localhost:5000${r.document_url}`} target="_blank" rel="noreferrer"
                            style={S.docBtn}>
                            📄 View Uploaded Document
                          </a>
                        ) : (
                          <div style={S.noDoc}>📎 No document uploaded</div>
                        )}
                      </div>

                      {/* ── REJECTION INLINE UI ── */}
                      {isRejecting ? (
                        <div style={S.rejectBox}>
                          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#c62828' }}>
                            ✏️ Reason for rejection
                          </p>
                          <textarea
                            autoFocus
                            placeholder="e.g. Certificate does not match the claimed platform, dates are incorrect..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={S.rejectTextarea}
                            rows={3}
                          />
                          {!rejectReason.trim() && (
                            <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#e57373' }}>
                              Please enter a reason before submitting.
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={cancelReject} style={S.cancelBtn}>Cancel</button>
                            <button
                              className="submit-reject"
                              onClick={(e) => submitReject(e, r._id)}
                              disabled={!rejectReason.trim() || actionLoading === r._id + '_reject'}
                              style={{
                                ...S.submitRejectBtn,
                                opacity: (!rejectReason.trim() || actionLoading === r._id + '_reject') ? 0.5 : 1,
                                cursor: (!rejectReason.trim() || actionLoading === r._id + '_reject') ? 'not-allowed' : 'pointer',
                              }}>
                              {actionLoading === r._id + '_reject' ? 'Rejecting...' : '❌ Confirm Reject'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── ACTION BUTTONS ── */
                        <div style={S.actionRow}>
                          <button
                            className="reject-btn-start"
                            onClick={(e) => startReject(e, r._id)}
                            style={S.rejectBtn}>
                            ✕ Reject
                          </button>
                          <button
                            className="approve-btn"
                            onClick={(e) => handleApprove(e, r._id)}
                            disabled={actionLoading === r._id + '_approve'}
                            style={{
                              ...S.approveBtn,
                              opacity: actionLoading === r._id + '_approve' ? 0.7 : 1,
                              cursor: actionLoading === r._id + '_approve' ? 'not-allowed' : 'pointer',
                            }}>
                            {actionLoading === r._id + '_approve' ? 'Approving...' : '✓ Approve'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <p style={{ margin: 0, color: '#aaa' }}>No activity verified or rejected yet.</p>
            </div>
          ) : (
            <div style={S.timeline}>
              {history.map((r, i) => {
                const lc = r.level ? levelColor(r.level) : null;
                return (
                  <div key={i} style={S.timelineItem}>
                    <div style={S.timelineDot(r.status)} />
                    <div style={S.timelineContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ ...S.typeBadge, ...typeColor(r.type) }}>{r.type}</span>
                          {r.subcategory && <span style={{ ...S.typeBadge, background: '#f5f5f5', color: '#666' }}>{r.subcategory}</span>}
                          {lc && <span style={{ ...S.typeBadge, background: lc.bg, color: lc.color }}>🏆 {r.level}</span>}
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{r.title}</span>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0,
                          backgroundColor: r.status === 'VERIFIED' ? '#e8f5e9' : '#ffebee',
                          color: r.status === 'VERIFIED' ? '#2e7d32' : '#c62828',
                        }}>{r.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={S.meta}>PRN: {r.prn}</span>
                        {r.organisation && <span style={S.meta}>🏢 {r.organisation}</span>}
                        {r.duration_weeks && <span style={S.meta}>⏱ {r.duration_weeks}w</span>}
                      </div>
                      {r.rejection_reason && (
                        <div style={{ margin: '8px 0 0', background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: 6, padding: '6px 10px' }}>
                          <p style={{ margin: 0, fontSize: 12, color: '#c62828' }}>
                            <strong>Rejection reason:</strong> {r.rejection_reason}
                          </p>
                        </div>
                      )}
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#bbb' }}>
                        {r.verified_at && new Date(r.verified_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  pendingBadge: { backgroundColor: '#fde68a', color: '#92400e', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px', marginLeft: 6 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { flex: 1, padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Segoe UI', sans-serif", background: '#fafafa' },
  select: { padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: "'Segoe UI', sans-serif", background: '#fafafa', color: '#444' },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' },
  card: { borderRadius: 12, padding: '18px 22px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', marginBottom: 12 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.03em' },
  prnBtn: { background: 'none', border: '1px solid #e8eaf6', borderRadius: 20, padding: '3px 12px', fontSize: 12, color: '#3949ab', cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 },
  submittedAt: { fontSize: 12, color: '#ccc' },
  erpCard: { background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: 10, padding: '14px 18px' },
  erpAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1a237e,#3949ab)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, flexShrink: 0 },
  erpStat: { background: '#fff', border: '1px solid #eef0fb', borderRadius: 8, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 64 },
  erpStatLabel: { fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  expandedSection: { marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 },
  activityCard: { background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: 12, padding: '18px 20px', marginBottom: 14 },
  metaChip: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#666', background: '#fff', border: '1px solid #eee', borderRadius: 20, padding: '4px 12px' },
  metaIcon: { fontSize: 13 },
  descBox: { background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '12px 14px', marginBottom: 12 },
  docBtn: { display: 'inline-block', marginTop: 4, padding: '7px 16px', background: '#e8eaf6', color: '#1a237e', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  noDoc: { marginTop: 4, fontSize: 13, color: '#ccc' },
  actionRow: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  rejectBtn: { padding: '9px 20px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif", transition: 'background 0.15s' },
  approveBtn: { padding: '9px 22px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", transition: 'background 0.15s' },
  rejectBox: { background: '#fff5f5', border: '1.5px solid #ffcdd2', borderRadius: 10, padding: '16px 18px' },
  rejectTextarea: { width: '100%', padding: '10px 12px', border: '1.5px solid #ffcdd2', borderRadius: 8, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", outline: 'none', resize: 'vertical', background: '#fff', color: '#333', marginBottom: 8 },
  cancelBtn: { padding: '8px 16px', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#666', cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" },
  submitRejectBtn: { padding: '8px 18px', background: '#c62828', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", transition: 'background 0.15s' },
  meta: { fontSize: 13, color: '#888' },
  timeline: { position: 'relative', paddingLeft: 28 },
  timelineItem: { display: 'flex', gap: 16, marginBottom: 18, position: 'relative' },
  timelineDot: (status) => ({ width: 12, height: 12, borderRadius: '50%', marginTop: 4, flexShrink: 0, backgroundColor: status === 'VERIFIED' ? '#4caf50' : '#ef5350', boxShadow: status === 'VERIFIED' ? '0 0 0 3px #e8f5e9' : '0 0 0 3px #ffebee' }),
  timelineContent: { background: '#fff', borderRadius: 10, padding: '14px 18px', flex: 1, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f5f5f5' },
};