import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function Login({ queueToken, resultConfig, onLoginSuccess }) {
  const [rollNo, setRollNo] = useState('');
  const [dob, setDob] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const [loading, setLoading] = useState(false);

  const departments = [
    'Civil Engineering (CE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering (MECH)',
    'Electronics & Communication Engineering (ECE)',
    'Computer Science & Engineering (CSE)',
    'Computer Science & Engineering – Artificial Intelligence (CSE-AI)',
    'Computer Science & Engineering – Data Science (CSE-DS)',
    'Computer Science & Engineering – Cyber Security (CSE-CS)',
    'Computer Science & Engineering – Networks (CSE-Networks)',
    'Computer Science & Engineering – Artificial Intelligence & Machine Learning (CSE-AI & ML)',
    'Computer Science & Engineering – IOT (CSE-IOT)',
    'Computer Science & Technology (CST)',
    'Computer Science & Information Technology (CS-IT)',
    'Information Technology (IT)'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Login window expired. Redirecting to queue.');
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('Sending login with resultConfig:', resultConfig);
      
      // Convert date from YYYY-MM-DD to DD-MM-YYYY for backend
      const dobParts = dob.split('-');
      const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
      
      const { data } = await authAPI.login({ rollNo, dob: formattedDob, department, queueToken, resultConfig });
      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('student', JSON.stringify(data.student));
      localStorage.setItem('department', department);
      localStorage.setItem('resultConfig', JSON.stringify(resultConfig));
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to View Result</h2>
        <p style={styles.timer}>⏱️ Time remaining: <span style={styles.timerCount}>{timeLeft}s</span></p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={styles.select}
              onMouseEnter={(e) => e.target.style.borderColor = '#007bff'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ddd'}
              required
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Roll Number</label>
            <input
              type="text"
              placeholder="Enter your roll number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              style={styles.input}
              onMouseEnter={(e) => e.target.style.borderColor = '#007bff'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ddd'}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Date of Birth</label>
            <input
              type="date"
              placeholder="DD-MM-YYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              style={styles.input}
              onMouseEnter={(e) => e.target.style.borderColor = '#007bff'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ddd'}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              required
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#0056b3';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#007bff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }
            }}
          >
            {loading ? '⏳ Fetching Result...' : 'Login'}
          </button>
        </form>
        
        {error && <p style={styles.error}>❌ {error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'fadeIn 0.5s ease-in'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '28px',
    fontWeight: '600'
  },
  timer: {
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
    marginBottom: '30px'
  },
  timerCount: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  },
  select: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: 'white'
  },
  button: {
    padding: '14px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginTop: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: '20px',
    padding: '12px',
    background: '#ffe6e6',
    borderRadius: '8px',
    fontSize: '14px'
  }
};

export default Login;
