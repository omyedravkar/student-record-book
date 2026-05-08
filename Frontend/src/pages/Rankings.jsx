import { useState, useEffect } from "react";
import axios from "axios";

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

export default function Rankings() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("");
  const [cgpaFilter, setCgpaFilter] = useState("");
  const [results, setResults] = useState([]);
  const [erpMap, setErpMap] = useState({});
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);

  useEffect(() => {
    fetchErpData();
    handleSearch();
  }, []);

  const fetchErpData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/erp/all');
      if (res.data.success) {
        const map = {};
        res.data.data.filter(e => e.role === 'student').forEach(e => { map[e.prn] = e; });
        setErpMap(map);
      }
    } catch (e) { console.log(e); }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/student-record/search?q=${query}&type=${type}`
      );
      if (res.data.success) {
        setResults(res.data.data);
        setSearched(true);
      }
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  // Client-side level + cgpa filter on top of backend tag results
  const filtered = results.filter(s => {
    const erp = erpMap[s.prn] || {};
    const cgpa = erp.cgpa || 0;
    if (cgpaFilter === 'high' && cgpa < 8) return false;
    if (cgpaFilter === 'mid' && (cgpa < 6 || cgpa >= 8)) return false;
    if (cgpaFilter === 'low' && cgpa >= 6) return false;
    if (level && !s.records.some(r => r.level === level)) return false;
    return true;
  });

  const hasFilters = query || type || level || cgpaFilter;

  const clearAll = () => {
    setQuery('');
    setType('');
    setLevel('');
    setCgpaFilter('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div style={S.page}>
      <style>{`
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #1a237e !important; box-shadow: 0 0 0 3px rgba(26,35,126,0.07); outline: none; }
        .search-btn:hover { background: #283593 !important; }
        .result-card { transition: box-shadow 0.15s, border 0.15s; cursor: pointer; }
        .result-card:hover { box-shadow: 0 4px 20px rgba(26,35,126,0.10) !important; }
        .rec-row { transition: background 0.12s; cursor: pointer; }
        .rec-row:hover { background: #f5f6ff !important; }
        .chip-btn { transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
        .chip-btn:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <p style={S.label}>PLACEMENT CELL</p>
          <h2 style={S.heading}>Student Search</h2>
          <p style={S.subheading}>Search by skill, activity, organisation or tag</p>
        </div>
        {filtered.length > 0 && searched && (
          <div style={S.countBadge}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
        )}
      </div>

      {/* Search Panel */}
      <div style={S.searchPanel}>

        {/* Main search row */}
        <div style={S.searchRow}>
          <input
            style={S.searchInput}
            placeholder="Search by name, PRN, skill, organisation, activity title..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch} style={S.searchBtn}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filter chips */}
        <div style={S.filtersRow}>

          {/* Type */}
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Type</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['', 'internship', 'certificate', 'project', 'activity'].map(t => {
                const active = type === t;
                const tc = t ? typeColor(t) : null;
                return (
                  <button key={t} className="chip-btn"
                    onClick={() => setType(t)}
                    style={{
                      ...S.chip,
                      background: active ? (tc?.color || '#1a237e') : '#f5f5f5',
                      color: active ? '#fff' : '#666',
                      border: active ? 'none' : '1px solid #e0e0e0',
                    }}>
                    {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level */}
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Achievement Level</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['', 'International', 'National', 'State', 'District', 'College'].map(l => {
                const active = level === l;
                const lc = l ? levelColor(l) : null;
                return (
                  <button key={l} className="chip-btn"
                    onClick={() => setLevel(l)}
                    style={{
                      ...S.chip,
                      background: active ? (lc?.color || '#1a237e') : '#f5f5f5',
                      color: active ? '#fff' : '#666',
                      border: active ? 'none' : '1px solid #e0e0e0',
                    }}>
                    {l === '' ? 'All' : l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CGPA */}
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>CGPA Range</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { val: '', label: 'All' },
                { val: 'high', label: '8.0 and above' },
                { val: 'mid', label: '6.0 – 8.0' },
                { val: 'low', label: 'Below 6.0' },
              ].map(c => (
                <button key={c.val} className="chip-btn"
                  onClick={() => setCgpaFilter(c.val)}
                  style={{
                    ...S.chip,
                    background: cgpaFilter === c.val ? '#1a237e' : '#f5f5f5',
                    color: cgpaFilter === c.val ? '#fff' : '#666',
                    border: cgpaFilter === c.val ? 'none' : '1px solid #e0e0e0',
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter summary + clear */}
        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {query && <span style={S.activeTag}>"{query}"</span>}
              {type && <span style={{ ...S.activeTag, ...typeColor(type) }}>{type}</span>}
              {level && (() => { const lc = levelColor(level); return <span style={{ ...S.activeTag, background: lc?.bg, color: lc?.color }}>{level}</span>; })()}
              {cgpaFilter && <span style={S.activeTag}>CGPA: {cgpaFilter === 'high' ? '≥ 8.0' : cgpaFilter === 'mid' ? '6–8' : '< 6'}</span>}
            </div>
            <button onClick={clearAll} style={S.clearBtn}>Clear all</button>
          </div>
        )}
      </div>

      {/* Results area */}
      {!searched && !loading && (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: '#888', fontSize: 15 }}>Start searching</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#bbb' }}>
            Enter a keyword or select filters, then press Search.
          </p>
        </div>
      )}

      {loading && (
        <div style={S.emptyState}>
          <p style={{ color: '#aaa', fontSize: 14 }}>Searching...</p>
        </div>
      )}

      {!loading && searched && filtered.length === 0 && (
        <div style={S.emptyState}>
          <p style={{ margin: 0, fontWeight: 600, color: '#555', fontSize: 15 }}>No students found</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#aaa' }}>
            Try a different keyword, activity type, or remove some filters.
          </p>
        </div>
      )}

      {!loading && searched && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((s, i) => {
            const erp = erpMap[s.prn] || {};
            const cgpa = erp.cgpa || 0;
            const isOpen = expandedCard === s.prn;

            // If level filter active, show only matching records; else show all
            const displayRecords = level
              ? s.records.filter(r => r.level === level)
              : s.records;

            return (
              <div key={s.prn} className="result-card"
                onClick={() => { setExpandedCard(isOpen ? null : s.prn); setExpandedRecord(null); }}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: isOpen ? '1.5px solid #c5cae9' : '1.5px solid #f0f0f0',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}>

                {/* ── CARD HEADER — always visible ── */}
                <div style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {/* Rank circle */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? '#fde68a' : i === 1 ? '#e0e0e0' : i === 2 ? '#f5cba7' : '#eef0fb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                      color: i === 0 ? '#92400e' : i === 1 ? '#555' : i === 2 ? '#7c3400' : '#3949ab',
                    }}>
                      {i + 1}
                    </div>

                    {/* Avatar */}
                    <div style={S.avatar}>
                      {(erp.name || s.prn).charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#1a237e' }}>{erp.name || s.prn}</span>
                        <span style={S.prnTag}>{s.prn}</span>
                        {s.matched && query && <span style={S.matchedTag}>Matched</span>}
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#aaa' }}>
                        {erp.branch && `${erp.branch}`}{erp.year && ` · Year ${erp.year}`}{erp.semester && ` · Sem ${erp.semester}`}
                      </p>
                    </div>
                  </div>

                  {/* Right stats */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                    <div style={S.statPill}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: cgpa >= 8 ? '#2e7d32' : cgpa >= 6 ? '#e65100' : '#c62828' }}>{cgpa || '—'}</span>
                      <span style={{ fontSize: 11, color: '#aaa' }}>CGPA</span>
                    </div>
                    <div style={S.statPill}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1a237e' }}>{s.records.length}</span>
                      <span style={{ fontSize: 11, color: '#aaa' }}>Records</span>
                    </div>
                    {/* Level highlights */}
                    {s.records.some(r => r.level === 'International') && (
                      <span style={{ ...S.levelPill, background: '#e8f5e9', color: '#2e7d32' }}>International</span>
                    )}
                    {s.records.some(r => r.level === 'National') && (
                      <span style={{ ...S.levelPill, background: '#e3f2fd', color: '#1565c0' }}>National</span>
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>

                {/* ── EXPANDED SECTION ── */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f0f0f0' }} onClick={e => e.stopPropagation()}>

                    {/* Academic background */}
                    <div style={S.academicSection}>
                      <p style={S.sectionLabel}>Academic Background</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div style={S.acBox}>
                          <span style={{ fontWeight: 800, fontSize: 18, color: '#1a237e' }}>{erp.cgpa || '—'}</span>
                          <span style={S.acLabel}>CGPA</span>
                        </div>
                        <div style={S.acBox}>
                          <span style={{ fontWeight: 800, fontSize: 18, color: '#2e7d32' }}>{erp.attendance || '—'}%</span>
                          <span style={S.acLabel}>Attendance</span>
                        </div>
                        {erp.marks && Object.entries(erp.marks).map(([sub, mark]) => (
                          <div key={sub} style={S.acBox}>
                            <span style={{ fontWeight: 700, fontSize: 16, color: '#555' }}>{mark}</span>
                            <span style={S.acLabel}>{sub.toUpperCase()}</span>
                          </div>
                        ))}
                        {erp.email && (
                          <div style={{ ...S.acBox, minWidth: 160 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: '#555' }}>{erp.email}</span>
                            <span style={S.acLabel}>Email</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Matched records */}
                    <div style={{ padding: '14px 22px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <p style={S.sectionLabel}>
                          {level || type || query
                            ? `Matching Records (${displayRecords.length} of ${s.records.length} total)`
                            : `Verified Records (${s.records.length})`}
                        </p>
                      </div>

                      {displayRecords.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#ccc' }}>No matching records for current filters.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {displayRecords.map((rec, j) => {
                            const lc = rec.level ? levelColor(rec.level) : null;
                            const tc = typeColor(rec.type);
                            const recKey = `${s.prn}-${j}`;
                            const isRecOpen = expandedRecord === recKey;

                            return (
                              <div key={j} className="rec-row"
                                onClick={e => { e.stopPropagation(); setExpandedRecord(isRecOpen ? null : recKey); }}
                                style={{
                                  background: isRecOpen ? '#f8f9ff' : '#fafafa',
                                  borderRadius: 8,
                                  padding: '10px 14px',
                                  border: isRecOpen ? '1px solid #e8eaf6' : '1px solid #f0f0f0',
                                }}>

                                {/* Record header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ ...S.typePill, background: tc.background, color: tc.color }}>{rec.type}</span>
                                    {rec.subcategory && (
                                      <span style={{ ...S.typePill, background: '#f0f0f0', color: '#666' }}>{rec.subcategory}</span>
                                    )}
                                    {lc && (
                                      <span style={{ ...S.typePill, background: lc.bg, color: lc.color }}>{rec.level}</span>
                                    )}
                                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{rec.title}</span>
                                  </div>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"
                                    style={{ transform: isRecOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                                    <path d="m6 9 6 6 6-6"/>
                                  </svg>
                                </div>

                                {rec.organisation && (
                                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>{rec.organisation}</p>
                                )}

                                {/* Expanded record details */}
                                {isRecOpen && (
                                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                                      {rec.duration_weeks && (
                                        <span style={S.metaItem}>Duration: {rec.duration_weeks} weeks</span>
                                      )}
                                      {rec.start_date && (
                                        <span style={S.metaItem}>
                                          From: {new Date(rec.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                      )}
                                      {rec.end_date && (
                                        <span style={S.metaItem}>
                                          To: {new Date(rec.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                      )}
                                    </div>
                                    {rec.description && (
                                      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#666', lineHeight: 1.7, borderLeft: '3px solid #e8eaf6', paddingLeft: 10 }}>
                                        {rec.description}
                                      </p>
                                    )}
                                    {rec.document_url && (
                                      <a href={`http://localhost:5000${rec.document_url}`}
                                        target="_blank" rel="noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        style={S.docLink}>
                                        View Document
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
      )}
    </div>
  );
}

const S = {
  page: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: '32px 28px', maxWidth: 1000, margin: '0 auto' },
  label: { margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#aaa', textTransform: 'uppercase', marginBottom: 4 },
  heading: { margin: 0, fontSize: 26, fontWeight: 700, color: '#1a237e' },
  subheading: { margin: '4px 0 0', fontSize: 13, color: '#aaa', fontWeight: 400 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  countBadge: { fontSize: 13, fontWeight: 600, color: '#3949ab', background: '#eef0fb', padding: '5px 14px', borderRadius: 20, flexShrink: 0 },
  searchPanel: { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 24, border: '1px solid #f0f0f0' },
  searchRow: { display: 'flex', gap: 10, marginBottom: 16 },
  searchInput: { flex: 1, padding: '11px 16px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fafafa', color: '#1a1a1a', transition: 'border-color 0.2s' },
  searchBtn: { padding: '11px 28px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s', whiteSpace: 'nowrap' },
  filtersRow: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 7 },
  filterLabel: { fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  chip: { padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' },
  activeTag: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#eef0fb', color: '#3949ab' },
  clearBtn: { padding: '4px 14px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' },
  emptyIcon: { display: 'flex', justifyContent: 'center', marginBottom: 14 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1a237e,#3949ab)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 },
  prnTag: { fontSize: 11, color: '#aaa', background: '#f5f5f5', borderRadius: 20, padding: '2px 8px', fontWeight: 500 },
  matchedTag: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fff8e1', color: '#f57f17' },
  statPill: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8f9ff', border: '1px solid #eef0fb', borderRadius: 8, padding: '6px 12px', minWidth: 52 },
  levelPill: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  academicSection: { padding: '14px 22px 16px', background: '#f8f9ff', borderBottom: '1px solid #f0f0f0' },
  sectionLabel: { margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#1a237e', textTransform: 'uppercase', letterSpacing: 0.5 },
  acBox: { background: '#fff', border: '1px solid #e8eaf6', borderRadius: 8, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 64 },
  acLabel: { fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  typePill: { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' },
  metaItem: { fontSize: 12, color: '#888', background: '#f5f5f5', padding: '3px 10px', borderRadius: 6 },
  docLink: { display: 'inline-block', fontSize: 12, color: '#1a237e', fontWeight: 600, textDecoration: 'none', background: '#eef0fb', padding: '4px 12px', borderRadius: 6 },
};