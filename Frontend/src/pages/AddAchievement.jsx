import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddAchievement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'internship',
    title: '',
    organization: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.organization || !form.startDate) {
      alert('Please fill all required fields!');
      return;
    }

    const prn = localStorage.getItem('prn');
    if (!prn) {
      alert('Session expired. Please login again.');
      navigate('/');
      return;
    }

    try {
      const start = new Date(form.startDate);
      const end = form.endDate ? new Date(form.endDate) : new Date();
      const duration_weeks = Math.round((end - start) / (1000 * 60 * 60 * 24 * 7));

      const formData = new FormData();
      formData.append('prn', prn);
      formData.append('type', form.type);
      formData.append('title', form.title);
      formData.append('organisation', form.organization);
      formData.append('duration_weeks', duration_weeks);
      formData.append('start_date', form.startDate);
      formData.append('end_date', form.endDate);
      formData.append('description', form.description);
      if (file) formData.append('document', file);

      const response = await axios.post('http://localhost:5000/api/student-record/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('Achievement submitted for verification! ✅');
        navigate('/activities');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Add New Achievement</h2>
          <p style={styles.subtitle}>Fill in the details — your mentor will verify it</p>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Type *</label>
              <select name="type" style={styles.input} value={form.type} onChange={handleChange}>
                <option value="internship">Internship</option>
                <option value="project">Project</option>
                <option value="certificate">Certificate</option>
                <option value="activity">Extracurricular</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Title *</label>
              <input name="title" style={styles.input} placeholder="e.g. Web Dev Intern"
                value={form.title} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Organization / Platform *</label>
            <input name="organization" style={styles.input} placeholder="e.g. Google, Coursera"
              value={form.organization} onChange={handleChange} />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Start Date *</label>
              <input name="startDate" type="date" style={styles.input}
                value={form.startDate} onChange={handleChange} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>End Date</label>
              <input name="endDate" type="date" style={styles.input}
                value={form.endDate} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea name="description"
              style={{ ...styles.input, height: '100px', resize: 'vertical' }}
              placeholder="Briefly describe what you did..."
              value={form.description} onChange={handleChange} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Upload Certificate (PDF/Image)</label>
            <input type="file" style={styles.input} accept=".pdf,.jpg,.png"
              onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <div style={styles.btnRow}>
            <button style={styles.cancelBtn} onClick={() => navigate('/activities')}>Cancel</button>
            <button style={styles.submitBtn} onClick={handleSubmit}>Submit for Verification</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '35px', width: '650px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  title: { color: '#1a237e', marginBottom: '5px' },
  subtitle: { color: '#888', fontSize: '13px', marginBottom: '25px' },
  row: { display: 'flex', gap: '20px' },
  inputGroup: { flex: 1, marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
  btnRow: { display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' },
  cancelBtn: { padding: '10px 24px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white', fontSize: '14px' },
  submitBtn: { padding: '10px 24px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600' },
};

export default AddAchievement;