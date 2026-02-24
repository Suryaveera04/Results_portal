import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { queueAPI } from './services/api';
import Landing from './components/Landing';
import QueueWaiting from './components/QueueWaiting';
import ResultSelection from './components/ResultSelection';
import Login from './components/Login';
import ResultView from './components/ResultView';
import './App.css';

const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000');

function App() {
  const [stage, setStage] = useState('landing');
  const [queueToken, setQueueToken] = useState(null);
  const [resultConfig, setResultConfig] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setStage('result');

    // Clear session on page refresh/reload
    const handleBeforeUnload = () => {
      localStorage.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleEnterQueue = async () => {
    try {
      const { data } = await queueAPI.join();
      setQueueToken(data.token);
      setStage('queue');
    } catch (error) {
      console.error('Queue join error:', error);
      setStage('selection');
    }
  };

  const handleQueueReady = () => {
    setStage('selection');
  };

  const handleSelectionComplete = (config) => {
    setResultConfig(config);
    setStage('login');
  };

  const handleLoginSuccess = () => {
    setStage('result');
  };

  return (
    <div className="App">
      {stage === 'landing' && <Landing onEnterQueue={handleEnterQueue} />}
      {stage === 'queue' && <QueueWaiting queueToken={queueToken} socket={socket} onQueueReady={handleQueueReady} />}
      {stage === 'selection' && <ResultSelection onSelectionComplete={handleSelectionComplete} />}
      {stage === 'login' && <Login queueToken={queueToken} resultConfig={resultConfig} onLoginSuccess={handleLoginSuccess} />}
      {stage === 'result' && <ResultView />}
    </div>
  );
}

export default App;
