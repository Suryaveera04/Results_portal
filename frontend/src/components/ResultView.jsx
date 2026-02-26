import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultAPI, authAPI } from '../services/api';

function ResultView() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(80);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLogout = React.useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.clear();
    alert('Session expired. You have been logged out.');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching result...');
        const { data } = await resultAPI.get();
        console.log('Result received:', data);
        setResult(data.result);
        setStudent(data.student);
        setLoading(false);
      } catch (error) {
        console.error('Result fetch error:', error);
        setLoading(false);
        if (error.response?.status === 401) {
          localStorage.clear();
          alert('Session expired. Please login again.');
          navigate('/');
        } else {
          setError(error.response?.data?.error || 'Failed to fetch result. Please try again.');
        }
      }
    };

    fetchResult();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleLogout, navigate]);

  const handleDownload = async () => {
    try {
      const { data } = await resultAPI.download();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `result_${student.rollNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleEmail = async () => {
    try {
      const { data } = await resultAPI.email();
      setMessage(data.message);
    } catch (error) {
      setMessage('Email failed');
    }
  };

  if (loading) return (
    <div className="loading-page">
      <div className="loader"></div>
      <p style={{ fontSize: '18px', color: '#1a237e', fontWeight: 500, marginTop: '20px' }}>
        Fetching your result...
      </p>
    </div>
  );

  if (error) return (
    <div className="card card-medium" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
      <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>Error</h2>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px' }}>{error}</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">
        Go Back to Home
      </button>
    </div>
  );

  if (!result) return (
    <div className="card card-medium" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
      <h2 style={{ color: '#f57c00', marginBottom: '15px' }}>No Result Found</h2>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px' }}>Unable to load result data.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">
        Go Back to Home
      </button>
    </div>
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div>
      <div className="card card-wide">
        {/* Header */}
        <div className="result-header">
          <h2 className="page-title" style={{ marginBottom: 0 }}>🎓 Result Card</h2>
          <span className="timer-badge">
            ⏱️ Session expires in: <span className="timer-count">{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </span>
        </div>

        {/* Student Info */}
        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Name</span>
            <span className="info-value">{student.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Roll No</span>
            <span className="info-value">{student.rollNo}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Department</span>
            <span className="info-value">{student.department}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Year</span>
            <span className="info-value">{student.year || result.year}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Semester</span>
            <span className="info-value">{student.semester || result.semester}</span>
          </div>
        </div>

        {/* Subjects Table */}
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1a237e', marginBottom: '15px' }}>📚 Subjects</h3>
        <div className="table-container" style={{ marginBottom: '30px' }}>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Credits</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td>{sub.code}</td>
                  <td>{sub.name}</td>
                  <td>{sub.credits}</td>
                  <td>
                    <span className="grade-badge" style={{
                      background: sub.grade === 'S' || sub.grade === 'A' ? '#2e7d32' :
                        sub.grade === 'B' ? '#0277bd' :
                          sub.grade === 'C' ? '#f57f17' : '#546e7a'
                    }}>{sub.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance */}
        <div className="performance-row">
          <div className="performance-box">
            <div className="performance-label">SGPA</div>
            <div className="performance-value">{result.sgpa || 'N/A'}</div>
          </div>
          <div className="performance-box">
            <div className="performance-label">CGPA</div>
            <div className="performance-value">{result.cgpa || 'N/A'}</div>
          </div>
          <div className="performance-box">
            <div className="performance-label">Status</div>
            <div className="performance-value" style={{
              color: result.status === 'PASS' ? '#a5d6a7' : '#ef9a9a'
            }}>{result.status}</div>
          </div>
          <div className="performance-box">
            <div className="performance-label">Credits Earned</div>
            <div className="performance-value">{result.creditsEarned || 0}</div>
          </div>
          <div className="performance-box">
            <div className="performance-label">Total Credits</div>
            <div className="performance-value">{result.totalCredits || 0}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions-row">
          <button onClick={handleDownload} className="btn btn-primary">
            💾 Download PDF
          </button>
          <button onClick={handleEmail} className="btn btn-info">
            📧 Email Result
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            🚪 Logout
          </button>
        </div>

        {message && <div className="msg-success">✅ {message}</div>}
      </div>
    </div>
  );
}

export default ResultView;
