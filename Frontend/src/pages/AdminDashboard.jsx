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
  if (i === 0) return { bg: '#fffbea', color: '#b8860b', ring: '#fde68a', label: '🥇' };
  if (i === 1) return { bg: '#f9f9f9', color: '#555', ring: '#e0e0e0', label: '🥈' };
  if (i === 2) return { bg: '#fff8f4', color: '#a0522d', ring: '#f5cba7', label: '🥉' };
  return { bg: '#fff', color: '#999', ring: '#f0f0f0', label: null };
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

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [erpMap, setErpMap] = useState({});
  const [recordsMap, setRecordsMap] = useState({});
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [search, setSearch] = useState('');
  const [filterCgpa, setFilterCgpa] = useState('');
  const [showWeights, setShowWeights] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [adminTab, setAdminTab] = useState('rankings');

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchLevel, setSearchLevel] = useState('');
  const [searchCgpa, setSearchCgpa] = useState('');
  const [expandedSearchCard, setExpandedSearchCard] = useState(null);
  const [expandedSearchRecordPrn, setExpandedSearchRecordPrn] = useState(null);

  useEffect(() => { fetchRankings(); }, []);

  const fetchRankings = async () => {
    try {
      const [recRes, erpRes] = await Promise.all([
        axios.get('http://localhost:5000/api/student-record/verified'),
        axios.get('http://localhost:5000/api/erp/all'),
      ]);

      const erpByPrn = {};
      if (erpRes.data.success) {
        erpRes.data.data
          .filter(e => e.role === 'student')
          .forEach(e => { erpByPrn[e.prn] = e; });
      }
      setErpMap(erpByPrn);

      if (recRes.data.success) {
        const grouped = {};
        const recordsByPrn = {};

        recRes.data.data.forEach(r => {
          if (!grouped[r.prn]) {
            grouped[r.prn] = {
              prn: r.prn,
              internshipCount: 0, certificateCount: 0,
              projectCount: 0, activityCount: 0,
              cgpa: erpByPrn[r.prn]?.cgpa || 0,
              nationalCount: 0, internationalCount: 0,
            };
            recordsByPrn[r.prn] = [];
          }
          if (r.type === 'internship') grouped[r.prn].internshipCount++;
          if (r.type === 'certificate') grouped[r.prn].certificateCount++;
          if (r.type === 'project') grouped[r.prn].projectCount++;
          if (r.type === 'activity') grouped[r.prn].activityCount++;
          if (r.level === 'National') grouped[r.prn].nationalCount++;
          if (r.level === 'International') grouped[r.prn].internationalCount++;
          recordsByPrn[r.prn].push(r);
        });

        setStudents(Object.values(grouped));
        setRecordsMap(recordsByPrn);
      }
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const sorted = [...students]
    .filter(s => {
      const erp = erpMap[s.prn] || {};
      const matchSearch = !search ||
        s.prn?.toLowerCase().includes(search.toLowerCase()) ||
        erp.name?.toLowerCase().includes(search.toLowerCase());
      const matchCgpa = !filterCgpa ||
        (filterCgpa === 'high' && s.cgpa >= 8) ||
        (filterCgpa === 'mid' && s.cgpa >= 6 && s.cgpa < 8) ||
        (filterCgpa === 'low' && s.cgpa < 6);
      return matchSearch && matchCgpa;
    })
    .sort((a, b) => getScore(b, weights) - getScore(a, weights));

  // ── SEARCH TAB LOGIC ──
  // Search works across students AND their individual records
  const searchResults = (() => {
    if (!searchQuery && !searchType && !searchLevel && !searchCgpa) return [];

    return students.filter(s => {
      const erp = erpMap[s.prn] || {};
      const records = recordsMap[s.prn] || [];

      // CGPA filter
      if (searchCgpa) {
        if (searchCgpa === 'high' && s.cgpa < 8) return false;
        if (searchCgpa === 'mid' && (s.cgpa < 6 || s.cgpa >= 8)) return false;
        if (searchCgpa === 'low' && s.cgpa >= 6) return false;
      }

      // Type filter — student must have at least one record of that type
      if (searchType && !records.some(r => r.type === searchType)) return false;

      // Level filter — student must have at least one record of that level
      if (searchLevel && !records.some(r => r.level === searchLevel)) return false;

      // Text query — match name, PRN, branch, or any record title/org/subcategory
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchStudent =
          erp.name?.toLowerCase().includes(q) ||
          s.prn?.toLowerCase().includes(q) ||
          erp.branch?.toLowerCase().includes(q);
        const matchRecord = records.some(r =>
          r.title?.toLowerCase().includes(q) ||
          r.organisation?.toLowerCase().includes(q) ||
          r.subcategory?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
        );
        if (!matchStudent && !matchRecord) return false;
      }

      return true;
    });
  })();

  // For a given student + query, get matching records
  const getMatchingRecords = (prn) => {
    const records = recordsMap[prn] || [];
    return records.filter(r => {
      if (searchType && r.type !== searchType) return false;
      if (searchLevel && r.level !== searchLevel) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.title?.toLowerCase().includes(q) ||
          r.organisation?.toLowerCase().includes(q) ||
          r.subcategory?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  const hasSearchActive = searchQuery || searchType || searchLevel || searchCgpa;

  const totalStudents = students.length;
  const avgCgpa = students.length
    ? (students.reduce((s, x) => s + (x.cgpa || 0), 0) / students.length).toFixed(2) : '—';
  const totalRecords = Object.values(recordsMap).reduce((s, arr) => s + arr.length, 0);
  const nationalAchievers = students.filter(s => s.nationalCount > 0).length;
  const internationalAchievers = students.filter(s => s.internationalCount > 0).length;

  const openPortfolio = (s) => {
    const erp = erpMap[s.prn] || {};
    const records = recordsMap[s.prn] || [];
    setSelected({ ...s, erp, records });
    setSelectedTab('overview');
  };

  return (
    <div style={S.page}>
      <style>{`
        * { box-sizing:border-box; }
        .row:hover { background:#f0f3ff !important; cursor:pointer; }
        input[type=range] { accent-color:#1a237e; }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .tab-pill { cursor:pointer; border:none; font-family:inherit; transition: all 0.15s; }
        .stat-card:hover { box-shadow: 0 4px 18px rgba(26,35,126,0.10) !important; transform: translateY(-1px); }
        .search-card:hover { box-shadow: 0 4px 18px rgba(26,35,126,0.10) !important; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <p style={S.label}>ADMIN PANEL</p>
          <h2 style={S.heading}>Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={S.countBadge}>{totalStudents} students</span>
          <button onClick={() => setShowWeights(!showWeights)} style={S.settingsBtn}>
            ⚙️ {showWeights ? 'Hide' : 'Set'} Points
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={S.mainTabRow}>
        {[
          { key: 'rankings', label: '🏆 Rankings' },
          { key: 'overview', label: '📊 Overview' },
          { key: 'search', label: '🔍 Search' },
        ].map(t => (
          <button key={t.key} className="tab-pill" onClick={() => setAdminTab(t.key)} style={{
            ...S.mainTab,
            background: adminTab === t.key ? '#1a237e' : '#fff',
            color: adminTab === t.key ? '#fff' : '#888',
            border: adminTab === t.key ? '1.5px solid #1a237e' : '1.5px solid #e0e0e0',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {adminTab === 'overview' && (
        <div>
          <div style={S.statsGrid}>
            {[
              { label: 'Total Students', value: totalStudents, color: '#1a237e', bg: '#eef0fb', icon: '👥' },
              { label: 'Avg CGPA', value: avgCgpa, color: '#2e7d32', bg: '#e8f5e9', icon: '📚' },
              { label: 'Total Verified Records', value: totalRecords, color: '#6a1b9a', bg: '#f3e5f5', icon: '✅' },
              { label: 'National Achievers', value: nationalAchievers, color: '#1565c0', bg: '#e3f2fd', icon: '🏆' },
              { label: 'International Achievers', value: internationalAchievers, color: '#2e7d32', bg: '#e8f5e9', icon: '🌍' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ ...S.overviewStatCard, background: s.bg, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <span style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: '#888', fontWeight: 600, textAlign: 'center' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={S.breakdownCard}>
            <p style={S.sectionTitle}>Activity Breakdown</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Internships', count: students.reduce((s, x) => s + x.internshipCount, 0), ...typeColor('internship') },
                { label: 'Certificates', count: students.reduce((s, x) => s + x.certificateCount, 0), ...typeColor('certificate') },
                { label: 'Projects', count: students.reduce((s, x) => s + x.projectCount, 0), ...typeColor('project') },
                { label: 'Activities', count: students.reduce((s, x) => s + x.activityCount, 0), ...typeColor('activity') },
              ].map((b, i) => (
                <div key={i} style={{ background: b.background, border: `1px solid ${b.color}22`, borderRadius: 12, padding: '14px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 120 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: b.color }}>{b.count}</span>
                  <span style={{ fontSize: 12, color: b.color, fontWeight: 600 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={S.breakdownCard}>
            <p style={S.sectionTitle}>🏆 Top 3 Students</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sorted.slice(0, 3).map((s, i) => {
                const erp = erpMap[s.prn] || {};
                const r = rankStyle(i);
                return (
                  <div key={s.prn} onClick={() => openPortfolio(s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, background: r.bg, borderRadius: 10, padding: '12px 16px', cursor: 'pointer', border: `1px solid ${r.ring}` }}>
                    <span style={{ fontSize: 24 }}>{r.label}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a237e' }}>{erp.name || s.prn}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>CGPA: {s.cgpa} · Score: {getScore(s, weights)}</p>
                    </div>
                    <span style={{ fontSize: 12, color: '#aaa' }}>View →</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── RANKINGS TAB ── */}
      {adminTab === 'rankings' && (
        <>
          {showWeights && (
            <div style={S.weightsPanel}>
              <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 14, color: '#1a237e' }}>Adjust Point Weights</p>
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
          <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
            <input style={{ ...S.search, margin: 0, flex: 1 }}
              placeholder="Search by PRN or name..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select style={S.filterSelect} value={filterCgpa} onChange={e => setFilterCgpa(e.target.value)}>
              <option value="">All CGPA</option>
              <option value="high">High (≥ 8.0)</option>
              <option value="mid">Mid (6–8)</option>
              <option value="low">Low (&lt; 6)</option>
            </select>
          </div>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 14, marginTop: 4 }}>
            Click any row to view full student portfolio
          </p>
          {loading ? (
            <div style={S.empty}><p style={{ color: '#aaa' }}>Loading rankings...</p></div>
          ) : sorted.length === 0 ? (
            <div style={S.empty}><p style={{ color: '#aaa' }}>No verified student data found.</p></div>
          ) : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Rank', 'Student', 'CGPA', 'Internships', 'Certificates', 'Projects', 'Activities', 'Achievements', 'Score'].map(h => (
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: '50%', background: r.ring, alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: r.color }}>{i + 1}</span>
                            {r.label && <span style={{ fontSize: 16 }}>{r.label}</span>}
                          </div>
                        </td>
                        <td style={S.td}>
                          <p style={{ margin: 0, fontWeight: 700, color: '#1a237e', fontSize: 14 }}>{erp.name || '—'}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#aaa' }}>{s.prn}</p>
                        </td>
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
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {s.internationalCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#e8f5e9', color: '#2e7d32' }}>🌍 {s.internationalCount}</span>}
                            {s.nationalCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#e3f2fd', color: '#1565c0' }}>🏆 {s.nationalCount}</span>}
                            {s.internationalCount === 0 && s.nationalCount === 0 && <span style={{ fontSize: 12, color: '#ddd' }}>—</span>}
                          </div>
                        </td>
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
        </>
      )}

      {/* ── SEARCH TAB ── */}
      {adminTab === 'search' && (
        <div>
          {/* Search Panel */}
          <div style={S.searchPanel}>
            <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: '#1a237e' }}>
              🔍 Search Students & Records
            </p>

            {/* Main text search */}
            <input
              style={S.searchBig}
              placeholder="Search by name, PRN, branch, activity title, organisation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />

            {/* Filter chips row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              {/* Type filter */}
              <div style={S.filterGroup}>
                <span style={S.filterLabel}>Type</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['', 'internship', 'certificate', 'project', 'activity'].map(t => (
                    <button key={t} onClick={() => setSearchType(t)} style={{
                      ...S.chipBtn,
                      background: searchType === t ? typeColor(t || 'internship').color : '#f5f5f5',
                      color: searchType === t ? '#fff' : '#666',
                      border: searchType === t ? 'none' : '1px solid #e0e0e0',
                    }}>
                      {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level filter */}
              <div style={S.filterGroup}>
                <span style={S.filterLabel}>Level</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['', 'International', 'National', 'State', 'District', 'College'].map(l => {
                    const lc = l ? levelColor(l) : null;
                    return (
                      <button key={l} onClick={() => setSearchLevel(l)} style={{
                        ...S.chipBtn,
                        background: searchLevel === l ? (lc?.color || '#1a237e') : '#f5f5f5',
                        color: searchLevel === l ? '#fff' : '#666',
                        border: searchLevel === l ? 'none' : '1px solid #e0e0e0',
                      }}>
                        {l === '' ? 'All' : l}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CGPA filter */}
              <div style={S.filterGroup}>
                <span style={S.filterLabel}>CGPA</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { val: '', label: 'All' },
                    { val: 'high', label: '≥ 8.0' },
                    { val: 'mid', label: '6–8' },
                    { val: 'low', label: '< 6' },
                  ].map(c => (
                    <button key={c.val} onClick={() => setSearchCgpa(c.val)} style={{
                      ...S.chipBtn,
                      background: searchCgpa === c.val ? '#1a237e' : '#f5f5f5',
                      color: searchCgpa === c.val ? '#fff' : '#666',
                      border: searchCgpa === c.val ? 'none' : '1px solid #e0e0e0',
                    }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear button */}
            {hasSearchActive && (
              <button onClick={() => { setSearchQuery(''); setSearchType(''); setSearchLevel(''); setSearchCgpa(''); }}
                style={{ marginTop: 12, padding: '5px 14px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" }}>
                ✕ Clear all filters
              </button>
            )}
          </div>

          {/* Results */}
          {!hasSearchActive ? (
            <div style={{ ...S.empty, border: '1.5px dashed #e0e0e0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <p style={{ margin: 0, color: '#bbb', fontSize: 14 }}>Type a name, PRN, activity title, or use the filters above to find students.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>😶</div>
              <p style={{ margin: 0, color: '#aaa', fontWeight: 600 }}>No students match your search.</p>
              <p style={{ margin: '6px 0 0', color: '#ccc', fontSize: 13 }}>Try different keywords or remove some filters.</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>
                <strong style={{ color: '#1a237e' }}>{searchResults.length}</strong> student{searchResults.length !== 1 ? 's' : ''} found
                {searchQuery && <span> for <strong>"{searchQuery}"</strong></span>}
                {searchType && <span> · type: <strong>{searchType}</strong></span>}
                {searchLevel && <span> · level: <strong>{searchLevel}</strong></span>}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {searchResults.map((s, i) => {
                  const erp = erpMap[s.prn] || {};
                  const isExpanded = expandedSearchCard === s.prn;
                  const matchingRecs = getMatchingRecords(s.prn);
                  const allRecs = recordsMap[s.prn] || [];

                  return (
                    <div key={s.prn} className="search-card"
                      style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 10px rgba(0,0,0,0.07)', border: isExpanded ? '1.5px solid #c5cae9' : '1.5px solid #f0f0f0', overflow: 'hidden', transition: 'all 0.15s' }}>

                      {/* ── STUDENT CARD HEADER ── always visible */}
                      <div style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={() => setExpandedSearchCard(isExpanded ? null : s.prn)}>

                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          {/* Avatar */}
                          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#1a237e,#3949ab)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                            {(erp.name || s.prn).charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1a237e' }}>{erp.name || s.prn}</p>
                              <span style={{ fontSize: 11, color: '#aaa', background: '#f5f5f5', borderRadius: 20, padding: '2px 8px' }}>{s.prn}</span>
                            </div>
                            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>
                              {erp.branch && `${erp.branch} ·`} Year {erp.year || '?'} · Sem {erp.semester || '?'}
                              {erp.email && ` · ${erp.email}`}
                            </p>
                          </div>
                        </div>

                        {/* Right side quick stats */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: s.cgpa >= 8 ? '#2e7d32' : s.cgpa >= 6 ? '#e65100' : '#c62828' }}>{s.cgpa || '—'}</span>
                            <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'center' }}>CGPA</span>
                          </div>
                          <span style={{ width: 1, height: 20, background: '#eee' }} />
                          <div style={{ display: 'flex', gap: 4 }}>
                            {s.internationalCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#e8f5e9', color: '#2e7d32' }}>🌍 {s.internationalCount}</span>}
                            {s.nationalCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#e3f2fd', color: '#1565c0' }}>🏆 {s.nationalCount}</span>}
                          </div>
                          <span style={{ background: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                            Score: {getScore(s, weights)}
                          </span>
                          <span style={{ fontSize: 18, color: '#bbb' }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* ── EXPANDED DETAILS ── */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #f0f0f0' }}>

                          {/* Academic background */}
                          <div style={{ padding: '16px 22px', background: '#f8f9ff', borderBottom: '1px solid #f0f0f0' }}>
                            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#1a237e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Academic Background
                            </p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              <div style={S.acStat}>
                                <span style={{ fontWeight: 800, fontSize: 18, color: '#1a237e' }}>{erp.cgpa || '—'}</span>
                                <span style={S.acLabel}>CGPA</span>
                              </div>
                              <div style={S.acStat}>
                                <span style={{ fontWeight: 800, fontSize: 18, color: '#2e7d32' }}>{erp.attendance || '—'}%</span>
                                <span style={S.acLabel}>Attendance</span>
                              </div>
                              {erp.marks && Object.entries(erp.marks).map(([sub, mark]) => (
                                <div key={sub} style={S.acStat}>
                                  <span style={{ fontWeight: 700, fontSize: 16, color: '#555' }}>{mark}</span>
                                  <span style={S.acLabel}>{sub.toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Matching records */}
                          <div style={{ padding: '16px 22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {searchType || searchLevel || searchQuery
                                  ? `Matching Records (${matchingRecs.length} of ${allRecs.length})`
                                  : `All Verified Records (${allRecs.length})`}
                              </p>
                              <button onClick={() => openPortfolio(s)}
                                style={{ padding: '5px 14px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" }}>
                                Full Portfolio →
                              </button>
                            </div>

                            {(searchType || searchLevel || searchQuery ? matchingRecs : allRecs).length === 0 ? (
                              <p style={{ color: '#ccc', fontSize: 13 }}>No matching records found.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {(searchType || searchLevel || searchQuery ? matchingRecs : allRecs).map((rec, j) => {
                                  const lc = rec.level ? levelColor(rec.level) : null;
                                  const isRecOpen = expandedSearchRecordPrn === `${s.prn}-${j}`;
                                  return (
                                    <div key={j}
                                      onClick={() => setExpandedSearchRecordPrn(isRecOpen ? null : `${s.prn}-${j}`)}
                                      style={{ background: '#fafafa', borderRadius: 10, padding: '12px 16px', border: '1px solid #f0f0f0', cursor: 'pointer' }}>

                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                          <span style={{ ...S.typePill, ...typeColor(rec.type) }}>{rec.type}</span>
                                          {rec.subcategory && <span style={{ ...S.typePill, background: '#f0f0f0', color: '#666' }}>{rec.subcategory}</span>}
                                          {lc && <span style={{ ...S.typePill, background: lc.bg, color: lc.color }}>🏆 {rec.level}</span>}
                                          <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>{rec.title}</span>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#bbb' }}>{isRecOpen ? '▲' : '▼'}</span>
                                      </div>

                                      {rec.organisation && (
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>🏢 {rec.organisation}</p>
                                      )}

                                      {isRecOpen && (
                                        <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
                                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                                            {rec.duration_weeks && <span style={{ fontSize: 12, color: '#888' }}>⏱ {rec.duration_weeks} weeks</span>}
                                            {rec.start_date && <span style={{ fontSize: 12, color: '#888' }}>📅 {new Date(rec.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                                            {rec.end_date && <span style={{ fontSize: 12, color: '#888' }}>→ {new Date(rec.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                                          </div>
                                          {rec.description && <p style={{ margin: '0 0 8px', fontSize: 12, color: '#666', lineHeight: 1.6, borderLeft: '3px solid #e8eaf6', paddingLeft: 10 }}>{rec.description}</p>}
                                          {rec.document_url && (
                                            <a href={`http://localhost:5000${rec.document_url}`} target="_blank" rel="noreferrer"
                                              onClick={e => e.stopPropagation()}
                                              style={{ display: 'inline-block', fontSize: 12, color: '#1a237e', fontWeight: 600, textDecoration: 'none', background: '#e8eaf6', padding: '4px 12px', borderRadius: 20 }}>
                                              📄 View Document
                                            </a>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PORTFOLIO MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={S.closeBtn}>✕</button>
            <div style={S.modalHeader}>
              <div style={S.avatar}>
                {(selected.erp.name || selected.prn).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a237e' }}>{selected.erp.name || selected.prn}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
                  PRN: {selected.prn} &nbsp;·&nbsp; {selected.erp.branch || ''} &nbsp;·&nbsp; Year {selected.erp.year || ''}
                </p>
                {selected.erp.email && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>{selected.erp.email}</p>}
              </div>
            </div>
            <div style={S.modalTabRow}>
              {['overview', 'records'].map(t => (
                <button key={t} className="tab-pill" onClick={() => setSelectedTab(t)} style={{
                  ...S.modalTab,
                  background: selectedTab === t ? '#1a237e' : '#f5f5f5',
                  color: selectedTab === t ? '#fff' : '#888',
                }}>
                  {t === 'overview' ? '📊 Overview' : '📋 All Records'}
                </button>
              ))}
            </div>
            {selectedTab === 'overview' && (
              <>
                <div style={S.statsRow}>
                  <div style={S.statBox}><span style={{ fontSize: 20, fontWeight: 800, color: '#1a237e' }}>{selected.erp.cgpa || '—'}</span><span style={S.statLabel}>CGPA</span></div>
                  <div style={S.statBox}><span style={{ fontSize: 20, fontWeight: 800, color: '#2e7d32' }}>{selected.erp.attendance || '—'}%</span><span style={S.statLabel}>Attendance</span></div>
                  <div style={S.statBox}><span style={{ fontSize: 20, fontWeight: 800, color: '#6a1b9a' }}>{selected.internshipCount}</span><span style={S.statLabel}>Internships</span></div>
                  <div style={S.statBox}><span style={{ fontSize: 20, fontWeight: 800, color: '#e65100' }}>{selected.certificateCount + selected.projectCount + selected.activityCount}</span><span style={S.statLabel}>Other</span></div>
                </div>
                {(selected.internationalCount > 0 || selected.nationalCount > 0) && (
                  <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selected.internationalCount > 0 && (
                      <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 10, padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 18 }}>🌍</span>
                        <div><p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#2e7d32' }}>{selected.internationalCount} International</p><p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>achievements</p></div>
                      </div>
                    )}
                    {selected.nationalCount > 0 && (
                      <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 10, padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 18 }}>🏆</span>
                        <div><p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1565c0' }}>{selected.nationalCount} National</p><p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>achievements</p></div>
                      </div>
                    )}
                  </div>
                )}
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
                <div style={{ background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#1a237e', textTransform: 'uppercase', letterSpacing: 0.5 }}>Placement Score Breakdown</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: 'CGPA', val: ((selected.cgpa || 0) * weights.cgpa).toFixed(1), color: '#1a237e' },
                      { label: 'Internships', val: (selected.internshipCount * weights.internship).toFixed(1), color: '#1565c0' },
                      { label: 'Certs', val: (selected.certificateCount * weights.certificate).toFixed(1), color: '#6a1b9a' },
                      { label: 'Projects', val: (selected.projectCount * weights.project).toFixed(1), color: '#2e7d32' },
                      { label: 'Activities', val: (selected.activityCount * weights.activity).toFixed(1), color: '#e65100' },
                    ].map((b, i) => (
                      <div key={i} style={{ background: '#fff', border: '1px solid #eef0fb', borderRadius: 8, padding: '8px 12px', textAlign: 'center', minWidth: 72 }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: b.color }}>{b.val}</p>
                        <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>{b.label}</p>
                      </div>
                    ))}
                    <div style={{ background: '#e8eaf6', border: '1px solid #c5cae9', borderRadius: 8, padding: '8px 12px', textAlign: 'center', minWidth: 72 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#1a237e' }}>{getScore(selected, weights)}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#3949ab', textTransform: 'uppercase', fontWeight: 700 }}>Total</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'records' && (
              <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selected.records.length === 0 ? (
                  <p style={{ color: '#ccc', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No verified records yet.</p>
                ) : selected.records.map((rec, i) => {
                  const lc = rec.level ? levelColor(rec.level) : null;
                  return (
                    <div key={i} style={S.recCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ ...S.typePill, ...typeColor(rec.type) }}>{rec.type}</span>
                          {rec.subcategory && <span style={{ ...S.typePill, background: '#f5f5f5', color: '#666' }}>{rec.subcategory}</span>}
                          {lc && <span style={{ ...S.typePill, background: lc.bg, color: lc.color }}>🏆 {rec.level}</span>}
                        </div>
                        {rec.duration_weeks && <span style={{ fontSize: 12, color: '#aaa' }}>⏱ {rec.duration_weeks}w</span>}
                      </div>
                      <p style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{rec.title}</p>
                      {rec.organisation && <span style={{ fontSize: 12, color: '#888', display: 'block' }}>🏢 {rec.organisation}</span>}
                      {rec.description && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#999', lineHeight: 1.5 }}>{rec.description}</p>}
                      {rec.document_url && (
                        <a href={`http://localhost:5000${rec.document_url}`} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#1a237e', fontWeight: 600, textDecoration: 'none' }}>
                          📄 View Document
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CountBadge({ n, color, bg }) {
  return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, color, background: bg }}>{n}</span>;
}

const S = {
  page: { padding: '28px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  label: { margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#aaa', textTransform: 'uppercase', marginBottom: 4 },
  heading: { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a237e' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  countBadge: { fontSize: 13, fontWeight: 600, color: '#3949ab', background: '#eef0fb', padding: '5px 14px', borderRadius: 20 },
  settingsBtn: { padding: '8px 16px', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#444', fontFamily: "'Segoe UI', sans-serif" },
  mainTabRow: { display: 'flex', gap: 8, marginBottom: 20 },
  mainTab: { padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20 },
  overviewStatCard: { borderRadius: 14, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  breakdownCard: { background: '#fff', borderRadius: 12, padding: '20px 22px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', marginBottom: 20 },
  weightsPanel: { background: '#fff', border: '1.5px solid #e8eaf6', borderRadius: 12, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 8px rgba(26,35,126,0.06)' },
  weightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  weightItem: { background: '#fafafa', borderRadius: 8, padding: '10px 12px', border: '1px solid #f0f0f0' },
  weightVal: { background: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 10 },
  search: { width: '100%', padding: '11px 16px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, marginBottom: 6, outline: 'none', background: '#fafafa', fontFamily: "'Segoe UI', sans-serif" },
  filterSelect: { padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa', fontFamily: "'Segoe UI', sans-serif", color: '#444' },
  searchPanel: { background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 10px rgba(0,0,0,0.07)', marginBottom: 20, border: '1px solid #f0f0f0' },
  searchBig: { width: '100%', padding: '13px 18px', border: '2px solid #e8eaf6', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fafafa', fontFamily: "'Segoe UI', sans-serif", color: '#1a1a1a' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: { fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  chipBtn: { padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif", transition: 'all 0.15s' },
  acStat: { background: '#fff', border: '1px solid #e8eaf6', borderRadius: 8, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 64 },
  acLabel: { fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 12px rgba(0,0,0,0.07)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f0f0f0', background: '#fafafa' },
  td: { padding: '13px 16px', fontSize: 14, color: '#444', verticalAlign: 'middle' },
  empty: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' },
  modal: { background: '#fff', borderRadius: 16, padding: '28px', width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 14, cursor: 'pointer', color: '#666', fontWeight: 700 },
  modalHeader: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 },
  modalTabRow: { display: 'flex', gap: 8, marginBottom: 18 },
  modalTab: { padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" },
  avatar: { width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #3949ab)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 },
  statBox: { background: '#f8f9ff', borderRadius: 10, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: '1px solid #eef0fb' },
  statLabel: { fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: { margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 },
  markChip: { background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: 8, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 60 },
  recCard: { background: '#fafafa', borderRadius: 10, padding: '12px 16px', border: '1px solid #f0f0f0' },
  typePill: { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' },
};