import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Landing from './components/Landing';
import Contact from './components/Contact';
import ResultFlow from './components/ResultFlow';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resultug/*" element={<ResultFlow programType="UG" />} />
            <Route path="/resultpg/*" element={<ResultFlow programType="PG" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
