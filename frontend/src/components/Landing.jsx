import React from 'react';

function Landing({ onEnterQueue }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🎓</span>
        </div>
        <h1 style={styles.title}>MITS Result Portal</h1>
        <p style={styles.subtitle}>Results are live. Please wait for your turn.</p>
        <div style={styles.infoBox}>
          <p style={styles.infoText}>📊 Fair queue system</p>
          <p style={styles.infoText}>⚡ Real-time updates</p>
          <p style={styles.infoText}>🔒 Secure access</p>
        </div>
        <button 
          onClick={onEnterQueue} 
          style={styles.button}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0056b3 0%, #003d82 100%)';
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 8px 20px rgba(0,123,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,123,255,0.3)';
          }}
        >
          🚀 Enter Queue
        </button>
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
    borderRadius: '20px',
    padding: '50px 40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center'
  },
  iconContainer: {
    marginBottom: '20px'
  },
  icon: {
    fontSize: '80px',
    display: 'inline-block',
    animation: 'bounce 2s infinite'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px'
  },
  infoBox: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px'
  },
  infoText: {
    fontSize: '16px',
    color: '#555',
    margin: '8px 0'
  },
  button: {
    padding: '16px 40px',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
    width: '100%'
  }
};

export default Landing;
