import { useState } from 'react';
import axios from 'axios';

export default function RecruiterSearch() {
  const [type, setType] = useState('')
  const [minCgpa, setMinCgpa] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      let url = 'http://localhost:5000/api/recruiter/search?'
      if (type) url += `type=${type}&`
      if (minCgpa) url += `minCgpa=${minCgpa}`

      const response = await axios.get(url)
      if (response.data.success) {
        setResults(response.data.data)
      }
    } catch (error) {
      console.log('Error:', error)
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔍 Recruiter Search</h2>
      <p style={styles.subtitle}>Filter verified students by activity type and CGPA</p>

      <div style={styles.filterBox}>
        <div style={styles.filterRow}>
          <div style={styles.filterItem}>
            <label style={styles.label}>Activity Type</label>
            <select style={styles.input} value={type} onChange={e => setType(e.target.value)}>
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="project">Project</option>
              <option value="certificate">Certificate</option>
              <option value="activity">Activity</option>
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.label}>Minimum CGPA</label>
            <input
              style={styles.input}
              type="number"
              placeholder="e.g. 7.5"
              min="0" max="10" step="0.1"
              value={minCgpa}
              onChange={e => setMinCgpa(e.target.value)}
            />
          </div>

          <button style={styles.button} onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', marginTop: '2rem' }}>Searching...</p>}

      {!loading && searched && (
        <div style={styles.resultsBox}>
          <h3 style={styles.resultsTitle}>
            Results: {results.length} students found
          </h3>

          {results.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
              No students found matching your criteria.
            </p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>PRN</th>
                  <th style={styles.th}>Activity Type</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Organisation</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={styles.td}>{r.prn}</td>
                    <td style={styles.td}>{r.type}</td>
                    <td style={styles.td}>{r.title}</td>
                    <td style={styles.td}>{r.organisation || '-'}</td>
                    <td style={styles.td}>
                    <td style={styles.td}>
                    <span style={{ color: 'green', fontWeight: 600 }}>{r.status}</span>
                    </td>
                    <td style={styles.td}>{r.cgpa || '-'}</td>
                    {/* <span style={{ color: 'green', fontWeight: 600 }}>{r.status}</span> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
  title: { color: '#1a237e', marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: '1.5rem' },
  filterBox: { background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e0e0e0', marginBottom: '2rem' },
  filterRow: { display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' },
  filterItem: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 150 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  input: { padding: '10px 14px', border: '1px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none' },
  button: { padding: '10px 28px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  resultsBox: { background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e0e0e0' },
  resultsTitle: { color: '#1a237e', marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  thead: { background: '#f5f5f5' },
  th: { padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555' },
  td: { padding: '12px 16px', color: '#333' },
}