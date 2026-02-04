import React, { useEffect, useState } from 'react';
import { resultAPI, authAPI } from '../services/api';

function ResultView() {
  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await resultAPI.get();
        setResult(data.result);
        setStudent(data.student);
      } catch (error) {
        console.error('Result fetch error:', error);
        if (error.response?.status === 401) {
          localStorage.clear();
          alert('Session expired. Please login again.');
          window.location.reload();
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
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.clear();
    alert('Session expired. You have been logged out.');
    window.location.reload();
  };

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

  if (!result) return <div style={styles.loading}>Loading...</div>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>🎓 Result Card</h2>
          <div style={styles.timer}>
            ⏱️ Session expires in: <span style={styles.timerCount}>{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>
        
        <div style={styles.studentInfo}>
          <div style={styles.infoRow}>
            <span style={styles.label}>Name:</span>
            <span style={styles.value}>{student.name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Roll No:</span>
            <span style={styles.value}>{student.rollNo}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Department:</span>
            <span style={styles.value}>{student.department}</span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📚 Subjects</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Subject Name</th>
                  <th style={styles.th}>Credits</th>
                  <th style={styles.th}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((sub, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                    <td style={styles.td}>{sub.code}</td>
                    <td style={styles.td}>{sub.name}</td>
                    <td style={styles.td}>{sub.credits}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.gradeBadge,
                        background: sub.grade === 'S' || sub.grade === 'A' ? '#28a745' : 
                                   sub.grade === 'B' ? '#17a2b8' : 
                                   sub.grade === 'C' ? '#ffc107' : '#6c757d'
                      }}>{sub.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.performanceSection}>
          <div style={styles.performanceBox}>
            <div style={styles.performanceLabel}>SGPA</div>
            <div style={styles.performanceValue}>{result.sgpa || 'N/A'}</div>
          </div>
          <div style={styles.performanceBox}>
            <div style={styles.performanceLabel}>CGPA</div>
            <div style={styles.performanceValue}>{result.cgpa || 'N/A'}</div>
          </div>
          <div style={styles.performanceBox}>
            <div style={styles.performanceLabel}>Status</div>
            <div style={{
              ...styles.performanceValue,
              color: result.status === 'PASS' ? '#28a745' : '#dc3545'
            }}>{result.status}</div>
          </div>
        </div>

        <div style={styles.actions}>
          <button 
            onClick={handleDownload} 
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.background = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            💾 Download PDF
          </button>
          <button 
            onClick={handleEmail} 
            style={styles.buttonSecondary}
            onMouseEnter={(e) => {
              e.target.style.background = '#138496';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#17a2b8';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            📧 Email Result
          </button>
          <button 
            onClick={handleLogout} 
            style={styles.buttonDanger}
            onMouseEnter={(e) => {
              e.target.style.background = '#c82333';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#dc3545';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🚪 Logout
          </button>
        </div>
        
        {message && <div style={styles.message}>✅ {message}</div>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '30px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    borderBottom: '3px solid #667eea',
    paddingBottom: '20px',
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center'
  },
  timer: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666'
  },
  timerCount: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  studentInfo: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #dee2e6'
  },
  label: {
    fontWeight: '600',
    color: '#555'
  },
  value: {
    color: '#333'
  },
  section: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600'
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #dee2e6'
  },
  tableRowEven: {
    background: '#f8f9fa'
  },
  tableRowOdd: {
    background: 'white'
  },
  gradeBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px'
  },
  performanceSection: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px'
  },
  performanceBox: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    color: 'white'
  },
  performanceLabel: {
    fontSize: '14px',
    opacity: 0.9,
    marginBottom: '8px'
  },
  performanceValue: {
    fontSize: '32px',
    fontWeight: '700'
  },
  actions: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  button: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    minWidth: '150px'
  },
  buttonSecondary: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#17a2b8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    minWidth: '150px'
  },
  buttonDanger: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    minWidth: '150px'
  },
  message: {
    textAlign: 'center',
    color: '#28a745',
    marginTop: '20px',
    padding: '12px',
    background: '#d4edda',
    borderRadius: '8px',
    fontSize: '16px'
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
};

export default ResultView;
