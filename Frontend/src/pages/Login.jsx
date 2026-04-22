import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password!');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('prn', response.data.prn);
        localStorage.setItem('name', response.data.name);

        const role = response.data.role;
        if (role === 'student') navigate('/student');
        else if (role === 'mentor') navigate('/mentor');
        else if (role === 'admin') navigate('/admin');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📘 Student Record Book</h2>
        <p style={styles.subtitle}>Walchand College of Engineering, Sangli</p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="Enter your college email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="Enter your password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button style={styles.button} onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8eaf6' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '380px' },
  title: { textAlign: 'center', color: '#1a237e', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '25px' },
  inputGroup: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  button: { width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', marginTop: '8px' },
};

export default Login;