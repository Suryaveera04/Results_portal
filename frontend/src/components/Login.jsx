import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login({ queueToken: propQueueToken, resultConfig: propResultConfig, onLoginSuccess, programType }) {
  const navigate = useNavigate();
  const [rollNo, setRollNo] = useState('');
  const [dob, setDob] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for login
  const [loading, setLoading] = useState(false);
  
  // Get token and config from props or sessionStorage
  const queueToken = propQueueToken || sessionStorage.getItem('queueToken');
  const resultConfig = propResultConfig || JSON.parse(sessionStorage.getItem('resultConfig') || 'null');

  const ugDepartments = [
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

  const pgDepartments = [
    'Master of Business Administration (MBA)',
    'Master of Computer Applications (MCA)',
    'M.Tech - VLSI Design and Embedded Systems',
    'M.Tech - Computer Science and Engineering'
  ];

  const departments = programType === 'PG' ? pgDepartments : ugDepartments;

  useEffect(() => {
    console.log('=== Login component mounted ===');
    console.log('Queue token from props:', propQueueToken);
    console.log('Queue token from sessionStorage:', sessionStorage.getItem('queueToken'));
    console.log('Final queueToken:', queueToken);
    console.log('Result config:', resultConfig);
    
    if (!queueToken) {
      console.error('No queue token available!');
      setError('Session expired. Please start again.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }
    
    if (!resultConfig) {
      console.error('No result config available!');
      setError('Result selection missing. Please start again.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Login window expired. Redirecting to queue.');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [propQueueToken, queueToken, resultConfig, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('Sending login with resultConfig:', resultConfig);

      // Convert date from YYYY-MM-DD to DD-MM-YYYY for backend
      const dobParts = dob.split('-');
      const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;

      const loginData = { rollNo, dob: formattedDob, department, queueToken, resultConfig };
      console.log('=== Sending Login Request ===');
      console.log('Login data:', JSON.stringify(loginData, null, 2));
      console.log('Queue token:', queueToken);
      console.log('Queue token type:', typeof queueToken);
      console.log('Queue token length:', queueToken?.length);
      
      const { data } = await authAPI.login(loginData);
      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('student', JSON.stringify(data.student));
      localStorage.setItem('department', department);
      localStorage.setItem('resultConfig', JSON.stringify(resultConfig));
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please try again.';
      console.error('Error message:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title-section">
        <span className="page-icon">🔐</span>
        <h2 className="page-title">Login to View Result</h2>
        <p className="page-subtitle">Enter your credentials below</p>
        <div style={{ marginTop: '12px' }}>
          <span className="timer-badge">
            ⏱️ Time remaining: <span className="timer-count">{timeLeft}s</span>
          </span>
        </div>
      </div>

      <div className="card card-wide">
        <form onSubmit={handleSubmit}>
          {/* Row 1: Department (full width) */}
          <div style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-select"
                required
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Roll Number + Date of Birth */}
          <div className="form-grid-2" style={{ marginBottom: '32px' }}>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                placeholder="Enter your roll number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                placeholder="DD-MM-YYYY"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
          >
            {loading ? '⏳ Fetching Result...' : '🔑 Login'}
          </button>
        </form>

        {error && <div className="msg-error">❌ {error}</div>}
      </div>
    </div>
  );
}

export default Login;
