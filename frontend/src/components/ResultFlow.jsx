import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { queueAPI } from '../services/api';
import QueueWaiting from './QueueWaiting';
import ResultSelection from './ResultSelection';
import Login from './Login';
import ResultView from './ResultView';

let socket = null;
try {
  const { io } = require('socket.io-client');
  socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
    transports: ['polling', 'websocket'],
    reconnection: false
  });
} catch (err) {
  console.log('Socket.IO not available, using polling only');
  socket = { on: () => {}, off: () => {}, emit: () => {} };
}

function ResultFlow({ programType }) {
    const navigate = useNavigate();
    const basePath = programType === 'UG' ? '/resultug' : '/resultpg';
    const [queueToken, setQueueToken] = useState(null);
    const [queueReady, setQueueReady] = useState(false);
    const [resultConfig, setResultConfig] = useState(null);
    const hasJoinedQueue = React.useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate(`${basePath}/result`, { replace: true });
            return;
        }

        // Prevent duplicate queue joins (React StrictMode calls useEffect twice)
        if (hasJoinedQueue.current) {
            console.log('Already joined queue, skipping...');
            return;
        }

        // Auto-enter the queue on mount
        const enterQueue = async () => {
            hasJoinedQueue.current = true;
            try {
                console.log('Joining queue...');
                const { data } = await queueAPI.join();
                console.log('Queue joined, token:', data.token);
                setQueueToken(data.token);
                sessionStorage.setItem('queueToken', data.token);
            } catch (error) {
                console.error('Queue join error:', error);
                hasJoinedQueue.current = false;
                // If queue fails, skip straight to selection
                setQueueReady(true);
            }
        };
        enterQueue();

        const handleBeforeUnload = () => {
            localStorage.clear();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [basePath, navigate]);

    const handleQueueReady = () => {
        console.log('=== Queue Ready Handler ===');
        console.log('Current queueToken:', queueToken);
        if (queueToken) {
            console.log('Storing queueToken in sessionStorage:', queueToken);
            sessionStorage.setItem('queueToken', queueToken);
        }
        setQueueReady(true);
    };

    const handleSelectionComplete = (config) => {
        console.log('Selection complete, config:', config);
        setResultConfig(config);
        // Store config in sessionStorage
        sessionStorage.setItem('resultConfig', JSON.stringify(config));
        navigate(`${basePath}/login`);
    };

    const handleLoginSuccess = () => {
        navigate(`${basePath}/result`);
    };

    // Show queue waiting inline (no separate URL) until ready
    if (!queueReady && queueToken) {
        return <QueueWaiting queueToken={queueToken} socket={socket} onQueueReady={handleQueueReady} />;
    }

    // If queue finished or skipped, show the routed pages
    if (!queueReady && !queueToken) {
        return (
            <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <div className="loader"></div>
                <p style={{ fontSize: '18px', color: '#1a237e', fontWeight: 500 }}>
                    Entering {programType} Results queue...
                </p>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/"
                element={<ResultSelection onSelectionComplete={handleSelectionComplete} programType={programType} />}
            />
            <Route
                path="/login"
                element={<Login 
                    queueToken={queueToken} 
                    resultConfig={resultConfig} 
                    onLoginSuccess={handleLoginSuccess} 
                    programType={programType} 
                />}
            />
            <Route
                path="/result"
                element={<ResultView />}
            />
        </Routes>
    );
}

export default ResultFlow;
