import { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_WEIGHTS = { cgpa: 5, internship: 10, certificate: 6, project: 8, activity: 3 };

function getScore(student, weights) {
  return (
    (student.cgpa || 0) * weights.cgpa +
    (student.internshipCount || 0) * weights.internship +
    (student.certificateCount || 0) * weights.certificate +
    (student.projectCount || 0) * weights.project +
    (student.activityCount || 0) * weights.activity
  ).toFixed(1);
}

const rankStyle = (i) => {
  if (i === 0) return { bg: '#fffbea', color: '#b8860b', ring: '#fde68a' };
  if (i === 1) return { bg: '#f9f9f9', color: '#555', ring: '#e0e0e0' };
  if (i === 2) return { bg: '#fff8f4', color: '#a0522d', ring: '#f5cba7' };
  return { bg: '#fff', color: '#999', ring: '#f0f0f0' };
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

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [erpMap, setErpMap] = useState({});
  const [recordsMap, setRecordsMap] = useState({});
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [search, setSearch] = useState('');
  const [showWeights, setShowWeights] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // portfolio modal

  useEffect(() => { fetchRankings(); }, []);

  const fetchRankings = async () => {
    try {
      // fetch verified records
      const res = await axios.get('http://localhost:5000/api/student-record/verified');
      // fetch all ERP student data
      const erpRes = await axios.get('http://localhost:5000/api/erp/all');

      const erpByPrn = {};
      if (erpRes.data.success) {
        erpRes.data.data
          .filter(e => e.role === 'student')
          .forEach(e => { erpByPrn[e.prn] = e; });
      }
      setErpMap(erpByPrn);

      if (res.data.success) {
        const grouped = {};
        const recordsByPrn = {};

        res.data.data.forEach(r => {
          if (!grouped[r.prn]) {
            grouped[r.prn] = {
              prn: r.prn,
              internshipCount: 0,
              certificateCount: 0,
              projectCount: 0,
              activityCount: 0,
              cgpa: erpByPrn[r.prn]?.cgpa || 0,
            };
            recordsByPrn[r.prn] = [];
          }
          if (r.type === 'internship') grouped[r.prn].internshipCount++;
          if (r.type === 'certificate') grouped[r.prn].certificateCount++;
          if (r.type === 'project') grouped[r.prn].projectCount++;
          if (r.type === 'activity') grouped[r.prn].activityCount++;
          recordsByPrn[r.prn].push(r);
        });

        setStudents(Object.values(grouped));
        setRecordsMap(recordsByPrn);
      }
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const sorted = [...students]
    .filter(s => !search || s.prn?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => getScore(b, weights) - getScore(a, weights));

  const openPortfolio = (s) => {
    const erp = erpMap[s.prn] || {};
    const records = recordsMap[s.prn] || [];
    setSelected({ ...s, erp, records });
  };

  return (
    <div style={S.page}>
      <style>{`
        * { box-sizing:border-box; }
        .row:hover { background:#f0f3ff !important; cursor:pointer; }
        input[type=range] { accent-color:#1a237e; }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:1000; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <p style={S.label}>ADMIN PANEL</p>
          <h2 style={S.heading}>Placement Rankings</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={S.countBadge}>{sorted.length} students</span>
          <button onClick={() => setShowWeights(!showWeights)} style={S.settingsBtn}>
            ⚙️ {showWeights ? 'Hide' : 'Set'} Points
          </button>
        </div>
      </div>

      {/* Points Config Panel */}
      {showWeights && (
        <div style={S.weightsPanel}>
          <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 14, color: '#1a237e' }}>
            Adjust Point Weights
          </p>
          <div style={S.weightsGrid}>
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} style={S.weightItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#444', textTransform: 'capitalize' }}>{key}</span>
                  <span style={S.weightVal}>{val} pts</span>
                </div>
                <input type="range" min={0} max={20} value={val}
                  onChange={e => setWeights({ ...weights, [key]: Number(e.target.value) })}
                  style={{ width: '100%' }} />
              </div>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 12, color: '#aaa' }}>
            Score = (CGPA × {weights.cgpa}) + (Internships × {weights.internship}) + (Certs × {weights.certificate}) + (Projects × {weights.project}) + (Activities × {weights.activity})
          </p>
        </div>
      )}

      {/* Search */}
      <input style={S.search} placeholder="Search by PRN or name..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <p style={{ fontSize: 12, color: '#aaa', marginBottom: 14, marginTop: -10 }}>
        Click any row to view student portfolio
      </p>

      {/* Table */}
      {loading ? (
        <div style={S.empty}><p style={{ color: '#aaa' }}>Loading rankings...</p></div>
      ) : sorted.length === 0 ? (
        <div style={S.empty}><p style={{ color: '#aaa' }}>No verified student data found.</p></div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Rank', 'PRN', 'Name', 'CGPA', 'Internships', 'Certificates', 'Projects', 'Activities', 'Score'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const r = rankStyle(i);
                const score = getScore(s, weights);
                const erp = erpMap[s.prn] || {};
                return (
                  <tr key={s.prn} className="row"
                    onClick={() => openPortfolio(s)}
                    style={{ backgroundColor: r.bg, borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' }}>
                    <td style={S.td}>
                      <span style={{ display: 'inline-flex', width: 30, height: 30, borderRadius: '50%', background: r.ring, alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: r.color }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontWeight: 700, color: '#1a237e' }}>{s.prn}</td>
                    <td style={{ ...S.td, fontWeight: 600, color: '#222' }}>{erp.name || '—'}</td>
                    <td style={S.td}>
                      <span style={{ fontWeight: 700, color: s.cgpa >= 8 ? '#2e7d32' : s.cgpa >= 6 ? '#e65100' : '#c62828' }}>
                        {s.cgpa || '—'}
                      </span>
                    </td>
                    <td style={S.td}><CountBadge n={s.internshipCount} color="#1565c0" bg="#e3f2fd" /></td>
                    <td style={S.td}><CountBadge n={s.certificateCount} color="#6a1b9a" bg="#f3e5f5" /></td>
                    <td style={S.td}><CountBadge n={s.projectCount} color="#2e7d32" bg="#e8f5e9" /></td>
                    <td style={S.td}><CountBadge n={s.activityCount} color="#e65100" bg="#fff3e0" /></td>
                    <td style={S.td}>
                      <span style={{ background: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: 14, padding: '4px 12px', borderRadius: 20 }}>{score}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Portfolio Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={S.closeBtn}>✕</button>

            {/* Student Header */}
            <div style={S.modalHeader}>
              <div style={S.avatar}>
                {(selected.erp.name || selected.prn).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a237e' }}>
                  {selected.erp.name || selected.prn}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
                  PRN: {selected.prn} &nbsp;·&nbsp; {selected.erp.branch || ''} &nbsp;·&nbsp; Year {selected.erp.year || ''}
                </p>
                {selected.erp.email && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>{selected.erp.email}</p>
                )}
              </div>
            </div>

            {/* ERP Academic Stats */}
            <div style={S.statsRow}>
              <div style={S.statBox}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#1a237e' }}>{selected.erp.cgpa || '—'}</span>
                <span style={S.statLabel}>CGPA</span>
              </div>
              <div style={S.statBox}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#2e7d32' }}>{selected.erp.attendance || '—'}%</span>
                <span style={S.statLabel}>Attendance</span>
              </div>
              <div style={S.statBox}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#6a1b9a' }}>{selected.internshipCount}</span>
                <span style={S.statLabel}>Internships</span>
              </div>
              <div style={S.statBox}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#e65100' }}>{selected.certificateCount + selected.projectCount + selected.activityCount}</span>
                <span style={S.statLabel}>Other Records</span>
              </div>
            </div>

            {/* Marks if available */}
            {selected.erp.marks && (
              <div style={{ marginBottom: 18 }}>
                <p style={S.sectionTitle}>Academic Marks</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(selected.erp.marks).map(([sub, mark]) => (
                    <div key={sub} style={S.markChip}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{mark}</span>
                      <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Records */}
            <p style={S.sectionTitle}>Verified Activities ({selected.records.length})</p>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.records.length === 0 ? (
                <p style={{ color: '#ccc', fontSize: 13 }}>No verified records yet.</p>
              ) : selected.records.map((rec, i) => (
                <div key={i} style={S.recCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ ...S.typePill, ...typeColor(rec.type) }}>{rec.type}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{rec.title}</span>
                    </div>
                    {rec.duration_weeks && (
                      <span style={{ fontSize: 12, color: '#aaa' }}>{rec.duration_weeks}w</span>
                    )}
                  </div>
                  {rec.organisation && (
                    <span style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'block' }}>🏢 {rec.organisation}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CountBadge({ n, color, bg }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, color, background: bg }}>{n}</span>
  );
}

const S = {
  page: { padding: '28px 24px', maxWidth: 1050, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  label: { margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#aaa', textTransform: 'uppercase', marginBottom: 4 },
  heading: { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a237e' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  countBadge: { fontSize: 13, fontWeight: 600, color: '#3949ab', background: '#eef0fb', padding: '5px 14px', borderRadius: 20 },
  settingsBtn: { padding: '8px 16px', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#444', fontFamily: "'Segoe UI', sans-serif" },
  weightsPanel: { background: '#fff', border: '1.5px solid #e8eaf6', borderRadius: 12, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 8px rgba(26,35,126,0.06)' },
  weightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  weightItem: { background: '#fafafa', borderRadius: 8, padding: '10px 12px', border: '1px solid #f0f0f0' },
  weightVal: { background: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 10 },
  search: { width: '100%', padding: '11px 16px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, marginBottom: 6, outline: 'none', background: '#fafafa', fontFamily: "'Segoe UI', sans-serif" },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 12px rgba(0,0,0,0.07)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f0f0f0', background: '#fff' },
  td: { padding: '13px 16px', fontSize: 14, color: '#444', verticalAlign: 'middle' },
  empty: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' },
  modal: { background: '#fff', borderRadius: 16, padding: '28px', width: '90%', maxWidth: 580, maxHeight: '88vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 14, cursor: 'pointer', color: '#666', fontWeight: 700 },
  modalHeader: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #3949ab)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 },
  statBox: { background: '#f8f9ff', borderRadius: 10, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: '1px solid #eef0fb' },
  statLabel: { fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: { margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 },
  markChip: { background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: 8, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 60 },
  recCard: { background: '#fafafa', borderRadius: 8, padding: '10px 14px', border: '1px solid #f0f0f0' },
  typePill: { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' },
};