import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { queueAPI } from './services/api';
import Landing from './components/Landing';
import QueueWaiting from './components/QueueWaiting';
import Login from './components/Login';
import ResultView from './components/ResultView';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [stage, setStage] = useState('landing');
  const [queueToken, setQueueToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setStage('result');
  }, []);

  const handleEnterQueue = async () => {
    try {
      const { data } = await queueAPI.join();
      setQueueToken(data.token);
      setStage('queue');
    } catch (error) {
      console.error('Queue join error:', error);
      // If queue fails (Redis not available), go directly to login
      setStage('login');
    }
  };

  const handleQueueReady = () => {
    setStage('login');
  };

  const handleLoginSuccess = () => {
    setStage('result');
  };

  return (
    <div className="App">
      {stage === 'landing' && <Landing onEnterQueue={handleEnterQueue} />}
      {stage === 'queue' && <QueueWaiting queueToken={queueToken} socket={socket} onQueueReady={handleQueueReady} />}
      {stage === 'login' && <Login queueToken={queueToken} onLoginSuccess={handleLoginSuccess} />}
      {stage === 'result' && <ResultView />}
    </div>
  );
}

export default App;
