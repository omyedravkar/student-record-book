{/*Edited by soham trail for edit and delete page */}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditActivity() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    type: 'internship', title: '', organisation: '',
    startDate: '', endDate: '', description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const prn = localStorage.getItem('prn');
        const res = await axios.get(`http://localhost:5000/api/student-record/my?prn=${prn}`);
        const activity = res.data.data.find(a => a._id === id);
        if (activity) {
          setForm({
            type: activity.type || 'internship',
            title: activity.title || '',
            organisation: activity.organisation || '',
            startDate: activity.start_date ? activity.start_date.slice(0, 10) : '',
            endDate: activity.end_date ? activity.end_date.slice(0, 10) : '',
            description: activity.description || '',
          });
        }
      } catch (error) {
        console.log('Error fetching:', error);
      }
    };
    fetchActivity();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.organisation) {
      alert('Please fill all required fields!');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/student-record/edit/${id}`, {
        type: form.type,
        title: form.title,
        organisation: form.organisation,
        start_date: form.startDate,
        end_date: form.endDate,
        description: form.description,
      });
      alert('Activity updated successfully!');
      navigate('/student');
    } catch (error) {
      alert('Update failed!');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { padding: '28px 24px', display: 'flex', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" },
    card: { backgroundColor: '#fff', borderRadius: 14, width: 640, padding: '32px 36px', boxShadow: '0 1px 12px rgba(0,0,0,0.08)' },
    title: { margin: 0, fontSize: 20, fontWeight: 700, color: '#1a237e' },
    field: { flex: 1, marginBottom: 18 },
    label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#444', fontSize: 13 },
    input: { width: '100%', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box' },
    row: { display: 'flex', gap: 18 },
    btnRow: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
    cancelBtn: { padding: '10px 22px', border: '1.5px solid #e0e0e0', borderRadius: 8, backgroundColor: '#fff', fontSize: 14, color: '#555', cursor: 'pointer' },
    submitBtn: { padding: '10px 24px', backgroundColor: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Activity</h2>
        <br />
        <div style={styles.field}>
          <label style={styles.label}>Type</label>
          <select name="type" style={styles.input} value={form.type} onChange={handleChange}>
            <option value="internship">Internship</option>
            <option value="project">Project</option>
            <option value="certificate">Certificate</option>
            <option value="activity">Extracurricular</option>
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Title <span style={{ color: '#e53935' }}>*</span></label>
          <input name="title" style={styles.input} value={form.title} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Organisation <span style={{ color: '#e53935' }}>*</span></label>
          <input name="organisation" style={styles.input} value={form.organisation} onChange={handleChange} />
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Start Date</label>
            <input name="startDate" type="date" style={styles.input} value={form.startDate} onChange={handleChange} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>End Date</label>
            <input name="endDate" type="date" style={styles.input} value={form.endDate} onChange={handleChange} />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea name="description" style={{ ...styles.input, height: 80, resize: 'vertical' }} value={form.description} onChange={handleChange} />
        </div>
        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={() => navigate('/student')}>Cancel</button>
          <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditActivity;