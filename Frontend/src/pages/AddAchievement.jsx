import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SUBCATEGORIES = {
  internship: ['Software Development', 'Data Science', 'Cybersecurity', 'UI/UX Design', 'Marketing', 'Finance', 'Research', 'Other'],
  certificate: ['NPTEL', 'Coursera', 'Udemy', 'Google', 'Microsoft', 'AWS', 'LinkedIn Learning', 'Other'],
  project: ['Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Blockchain', 'Data Analytics', 'Other'],
  activity: ['Sports', 'Cultural', 'NSS/NCC', 'Technical Club', 'Hackathon', 'Workshop', 'Seminar', 'Other'],
};

const SPORT_TYPES = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Athletics', 'Swimming', 'Badminton', 'Chess', 'Other'];
const CULTURAL_TYPES = ['Dance', 'Music', 'Drama', 'Fine Arts', 'Literary', 'Photography', 'Other'];

function AddAchievement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'internship',
    subcategory: '',
    sportType: '',
    culturalType: '',
    title: '',
    organization: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setForm({ ...form, type: value, subcategory: '', sportType: '', culturalType: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.organization || !form.startDate) {
      alert('Please fill all required fields!');
      return;
    }
    const prn = localStorage.getItem('prn');
    if (!prn) { alert('Session expired. Please login again.'); navigate('/'); return; }

    setLoading(true);
    try {
      const start = new Date(form.startDate);
      const end = form.endDate ? new Date(form.endDate) : new Date();
      const duration_weeks = Math.round((end - start) / (1000 * 60 * 60 * 24 * 7));

      // Build descriptive tags from subcategory
      const extraTag = form.subcategory === 'Sports' ? form.sportType
        : form.subcategory === 'Cultural' ? form.culturalType
        : form.subcategory;

      const formData = new FormData();
      formData.append('prn', prn);
      formData.append('type', form.type);
      formData.append('title', form.title);
      formData.append('organisation', form.organization);
      formData.append('duration_weeks', duration_weeks);
      formData.append('start_date', form.startDate);
      formData.append('end_date', form.endDate);
      formData.append('description', form.description);
      if (form.subcategory) formData.append('customTags', [form.subcategory, extraTag].filter(Boolean).join(','));
      if (file) formData.append('document', file);

      const response = await axios.post('http://localhost:5000/api/student-record/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('Achievement submitted for verification!');
        navigate('/activities');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const subcats = SUBCATEGORIES[form.type] || [];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Add New Achievement</h2>
          <p style={styles.subtitle}>Fill in the details — your mentor will verify it</p>
        </div>
        <div style={styles.divider} />

        <div style={styles.row}>
          {/* Type */}
          <div style={styles.field}>
            <label style={styles.label}>Type <span style={styles.req}>*</span></label>
            <select name="type" style={styles.input} value={form.type} onChange={handleChange}>
              <option value="internship">Internship</option>
              <option value="project">Project</option>
              <option value="certificate">Certificate</option>
              <option value="activity">Extracurricular</option>
            </select>
          </div>

          {/* Subcategory */}
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <select name="subcategory" style={styles.input} value={form.subcategory} onChange={handleChange}>
              <option value="">Select category...</option>
              {subcats.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Sport type drill-down */}
        {form.subcategory === 'Sports' && (
          <div style={styles.field}>
            <label style={styles.label}>Sport Type</label>
            <select name="sportType" style={styles.input} value={form.sportType} onChange={handleChange}>
              <option value="">Select sport...</option>
              {SPORT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Cultural type drill-down */}
        {form.subcategory === 'Cultural' && (
          <div style={styles.field}>
            <label style={styles.label}>Cultural Type</label>
            <select name="culturalType" style={styles.input} value={form.culturalType} onChange={handleChange}>
              <option value="">Select type...</option>
              {CULTURAL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Title <span style={styles.req}>*</span></label>
          <input name="title" style={styles.input} placeholder="e.g. Web Dev Intern at TCS"
            value={form.title} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Organisation / Platform <span style={styles.req}>*</span></label>
          <input name="organization" style={styles.input} placeholder="e.g. Google, NPTEL, Coursera"
            value={form.organization} onChange={handleChange} />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Start Date <span style={styles.req}>*</span></label>
            <input name="startDate" type="date" style={styles.input} value={form.startDate} onChange={handleChange} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>End Date</label>
            <input name="endDate" type="date" style={styles.input} value={form.endDate} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea name="description" style={{ ...styles.input, height: 90, resize: 'vertical' }}
            placeholder="Briefly describe what you did..." value={form.description} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Upload Certificate</label>
          <input type="file" style={styles.fileInput} accept=".pdf,.jpg,.png"
            onChange={(e) => setFile(e.target.files[0])} />
          <p style={styles.fileHint}>PDF, JPG or PNG — max 2MB</p>
        </div>

        <div style={styles.divider} />
        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={() => navigate('/activities')}>Cancel</button>
          <button style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '28px 24px', display: 'flex', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: '32px 36px', width: 660, boxShadow: '0 1px 12px rgba(0,0,0,0.08)' },
  cardHeader: { marginBottom: 20 },
  title: { margin: 0, marginBottom: 5, fontSize: 20, fontWeight: 700, color: '#1a237e' },
  subtitle: { margin: 0, fontSize: 13, color: '#aaa' },
  divider: { height: 1, backgroundColor: '#f0f0f0', margin: '20px 0' },
  row: { display: 'flex', gap: 18 },
  field: { flex: 1, marginBottom: 18 },
  label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#444', fontSize: 13 },
  req: { color: '#e53935', marginLeft: 2 },
  input: { width: '100%', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fafafa', color: '#1a1a1a', boxSizing: 'border-box', fontFamily: "'Segoe UI', sans-serif" },
  fileInput: { width: '100%', padding: '9px 13px', border: '1.5px dashed #d0d0d0', borderRadius: 8, fontSize: 13, backgroundColor: '#fafafa', boxSizing: 'border-box', cursor: 'pointer' },
  fileHint: { margin: '5px 0 0', fontSize: 12, color: '#bbb' },
  btnRow: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: { padding: '10px 22px', border: '1.5px solid #e0e0e0', borderRadius: 8, backgroundColor: '#fff', fontSize: 14, color: '#555', cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif" },
  submitBtn: { padding: '10px 24px', backgroundColor: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" },
};

export default AddAchievement;