import React, { useEffect, useState } from 'react';
import { queueAPI } from '../services/api';

function QueueWaiting({ queueToken, socket, onQueueReady }) {
  const [status, setStatus] = useState({ position: 0, queueLength: 0, estimatedWait: 0, joinedAt: Date.now() });
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!queueToken) return;

    // Store token immediately
    sessionStorage.setItem('queueToken', queueToken);
    console.log('Token stored in sessionStorage:', queueToken);

    const fetchStatus = async () => {
      try {
        const { data } = await queueAPI.getStatus(queueToken);
        console.log('Queue status response:', data);
        setStatus(data);
        setLoading(false);
        
        // Check if already active or position is 0
        if (data.status === 'ACTIVE' || data.position === 0) {
          console.log('Queue ready! Token:', queueToken);
          sessionStorage.setItem('queueToken', queueToken);
          onQueueReady();
        }
      } catch (error) {
        console.error('Queue status error:', error);
        setLoading(false);
        if (error.response?.status === 404) {
          console.error('Token not found - it may have expired');
          setError('Queue token expired. Please refresh and try again.');
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    try {
      socket.on('queue_ready', (data) => {
        console.log('Socket event received:', data);
        console.log('My token:', queueToken);
        if (data.token === queueToken) {
          console.log('Token matched! Moving to next page...');
          onQueueReady();
        } else {
          console.log('Token mismatch - this event is for another user');
        }
      });

      socket.on('connect_error', (error) => {
        console.log('Socket connection error, using polling fallback');
      });
    } catch (err) {
      console.log('Socket.io not available, using polling only');
    }

    return () => {
      clearInterval(interval);
      try {
        socket.off('queue_ready');
        socket.off('connect_error');
      } catch (err) {
        // Ignore socket cleanup errors
      }
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
      <div style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div className="loader"></div>
        <p style={{ fontSize: '18px', color: '#1a237e', fontWeight: 500 }}>Loading queue status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <h2 style={{ color: '#c62828', marginBottom: '15px' }}>Queue Error</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title-section">
        <span className="page-icon">⏳</span>
        <h2 className="page-title">You're in the Queue</h2>
        <p className="page-subtitle">Please keep this window open</p>
      </div>

      <div className="card card-medium">
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-number">{status.position}</div>
            <div className="stat-label">Your Position</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{status.queueLength}</div>
            <div className="stat-label">Queue Length</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</div>
            <div className="stat-label">Est. Wait (mm:ss)</div>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{
              width: `${Math.max(5, 100 - (status.position / status.queueLength * 100))}%`
            }}></div>
          </div>
        </div>

        <div className="loader"></div>

        <p style={{ fontSize: '16px', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
          ✨ Hang tight! You'll be redirected automatically when it's your turn
        </p>
      </div>
    </div>
  );
}

export default QueueWaiting;
