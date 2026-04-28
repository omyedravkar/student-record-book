import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password!');
      return;
    }
    setLoading(true);
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
        else if (role === 'placement') navigate('/recruiter');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div style={styles.dot} />
          <h2 style={styles.title}>Student Record Book</h2>
          <p style={styles.subtitle}>Walchand College of Engineering, Sangli</p>
        </div>

        <div style={styles.divider} />

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={{
              ...styles.input,
              border: focused === 'email' ? '1.5px solid #1a237e' : '1.5px solid #e0e0e0',
            }}
            type="email"
            placeholder="Enter your college email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={{
              ...styles.input,
              border: focused === 'password' ? '1.5px solid #1a237e' : '1.5px solid #e0e0e0',
            }}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f8',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px 36px',
    borderRadius: 14,
    boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
    width: 380,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#1a237e',
    margin: '0 auto 14px',
  },
  title: {
    margin: 0,
    marginBottom: 6,
    fontSize: 20,
    fontWeight: 700,
    color: '#1a237e',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    margin: 0,
    fontSize: 12,
    color: '#9e9e9e',
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    margin: '20px 0',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#444',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 13px',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
    transition: 'border 0.15s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#1a237e',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    marginTop: 8,
    letterSpacing: 0.2,
    transition: 'opacity 0.15s',
  },
};

export default Login;