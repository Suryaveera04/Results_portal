import React, { useState, useEffect } from 'react';
import { resultLinksAPI } from '../services/api';

function ResultSelection({ onSelectionComplete, programType }) {
  const [formData, setFormData] = useState({
    programName: programType === 'PG' ? '' : 'B.Tech',
    yearSemester: '',
    regulation: '',
    examType: 'Regular'
  });
  const [availableLinks, setAvailableLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for selection

  const yearSemesters = [
    { value: 'I-I', label: 'I Year - I Semester' },
    { value: 'I-II', label: 'I Year - II Semester' },
    { value: 'II-I', label: 'II Year - I Semester' },
    { value: 'II-II', label: 'II Year - II Semester' },
    { value: 'III-I', label: 'III Year - I Semester' },
    { value: 'III-II', label: 'III Year - II Semester' },
    { value: 'IV-I', label: 'IV Year - I Semester' },
    { value: 'IV-II', label: 'IV Year - II Semester' }
  ];
  const regulations = ['R14','R18', 'R20', 'R22','R23', 'R24'];
  const pgPrograms = ['MBA', 'MCA', 'M.Tech'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSelectedLink('');
    setAvailableLinks([]);
  };

  const fetchAvailableLinks = async () => {
    if (!formData.yearSemester || !formData.regulation || !formData.examType) {
      alert('Please fill Year/Semester, Regulation, and Exam Type first');
      return;
    }
    
    if (programType === 'PG' && !formData.programName) {
      alert('Please select Program Name first');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await resultLinksAPI.getAvailable({
        programType,
        programName: formData.programName,
        yearSemester: formData.yearSemester,
        regulation: formData.regulation,
        examType: formData.examType
      });
      setAvailableLinks(data.links);
      if (data.links.length === 0) {
        alert('No results found for the selected criteria');
      }
    } catch (error) {
      alert('Failed to fetch available results');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedLink) {
      alert('Please select a result link');
      return;
    }
    
    const selectedResult = availableLinks.find(link => link.resultId === selectedLink);
    const [year, semester] = formData.yearSemester.split('-');
    
    const resultConfig = {
      programType,
      programName: formData.programName,
      year,
      semester,
      regulation: formData.regulation,
      examType: formData.examType,
      month: selectedResult.month,
      examYear: selectedResult.examYear
    };
    
    onSelectionComplete(resultConfig);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Selection time expired. Redirecting...');
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="page-title-section">
        <span className="page-icon">📋</span>
        <h2 className="page-title">Select Result Details</h2>
        <p className="page-subtitle">Choose your examination details below</p>
        <div style={{ marginTop: '12px' }}>
          <span className="timer-badge">
            ⏱️ Time remaining: <span className="timer-count">{timeLeft}s</span>
          </span>
        </div>
      </div>

      <div className="card card-wide">
        <form onSubmit={handleSubmit}>
          {/* Row 1: Program Name (if PG) */}
          {programType === 'PG' && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Program Name</label>
              <select name="programName" value={formData.programName} onChange={handleChange} className="form-select" required>
                <option value="">-- Select Program --</option>
                {pgPrograms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {/* Row 2: Year/Semester + Regulation */}
          <div className="form-grid-2" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Year & Semester</label>
              <select name="yearSemester" value={formData.yearSemester} onChange={handleChange} className="form-select" required>
                <option value="">-- Select Year & Semester --</option>
                {yearSemesters.map(ys => <option key={ys.value} value={ys.value}>{ys.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Regulation</label>
              <select name="regulation" value={formData.regulation} onChange={handleChange} className="form-select" required>
                <option value="">-- Select Regulation --</option>
                {regulations.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Exam Type Checkboxes */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Examination Type</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="examType"
                  value="Regular"
                  checked={formData.examType === 'Regular'}
                  onChange={handleChange}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                Regular
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="examType"
                  value="Supplementary"
                  checked={formData.examType === 'Supplementary'}
                  onChange={handleChange}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                Supplementary
              </label>
            </div>
          </div>

          {/* Fetch Links Button */}
          <button
            type="button"
            onClick={fetchAvailableLinks}
            className="btn btn-primary btn-lg btn-full"
            style={{ marginBottom: '24px' }}
            disabled={loading}
          >
            {loading ? '🔄 Fetching...' : '🔍 Fetch Available Results'}
          </button>

          {/* Available Links Selection */}
          {availableLinks.length > 0 && (
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Select Result Link</label>
              <select
                value={selectedLink}
                onChange={(e) => setSelectedLink(e.target.value)}
                className="form-select"
                required
              >
                <option value="">-- Select Result --</option>
                {availableLinks.map(link => (
                  <option key={link.resultId} value={link.resultId}>
                    {link.month} {link.examYear}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={!selectedLink}>
            ➡️ Continue to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResultSelection;
