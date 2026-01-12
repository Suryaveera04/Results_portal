import React, { useEffect, useState } from 'react';
import { queueAPI } from '../services/api';

function QueueWaiting({ queueToken, socket, onQueueReady }) {
  const [status, setStatus] = useState({ position: 0, queueLength: 0, estimatedWait: 0, joinedAt: Date.now() });
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!queueToken) return;

    const fetchStatus = async () => {
      try {
        const { data } = await queueAPI.getStatus(queueToken);
        setStatus(data);
        setLoading(false);
        if (data.status === 'ACTIVE') onQueueReady();
      } catch (error) {
        console.error('Queue status error:', error);
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    socket.on('queue_ready', (data) => {
      if (data.token === queueToken) onQueueReady();
    });

    return () => {
      clearInterval(interval);
      socket.off('queue_ready');
    };
  }, [queueToken, socket, onQueueReady]);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - status.joinedAt) / 1000);
    const remaining = Math.max(0, status.estimatedWait - elapsed);
    setCountdown(remaining);

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [status.estimatedWait, status.joinedAt]);

  if (!queueToken || loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loaderContainer}>
            <div style={styles.loader}></div>
          </div>
          <p style={styles.message}>Loading queue status...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>⏳</span>
        </div>
        <h2 style={styles.title}>You're in the Queue</h2>
        <p style={styles.subtitle}>Please keep this window open</p>
        
        <div style={styles.statsContainer}>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{status.position}</div>
            <div style={styles.statLabel}>Your Position</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{status.queueLength}</div>
            <div style={styles.statLabel}>Queue Length</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</div>
            <div style={styles.statLabel}>Est. Wait (mm:ss)</div>
          </div>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.max(5, 100 - (status.position / status.queueLength * 100))}%`
            }}></div>
          </div>
        </div>

        <div style={styles.loaderContainer}>
          <div style={styles.loader}></div>
        </div>

        <p style={styles.message}>✨ Hang tight! You'll be redirected automatically when it's your turn</p>
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
    maxWidth: '600px',
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
    animation: 'spin 2s linear infinite'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px'
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    gap: '20px'
  },
  statBox: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '20px',
    color: 'white'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  progressContainer: {
    marginBottom: '30px'
  },
  progressBar: {
    width: '100%',
    height: '12px',
    background: '#e9ecef',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.5s ease',
    borderRadius: '10px'
  },
  loaderContainer: {
    marginBottom: '20px'
  },
  loader: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  },
  message: {
    fontSize: '16px',
    color: '#666',
    fontStyle: 'italic'
  }
};

export default QueueWaiting;
