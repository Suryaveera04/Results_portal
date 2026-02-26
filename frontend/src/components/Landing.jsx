import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Result Category Boxes */}
      <div className="landing-boxes-row">
        <div className="landing-box landing-box-ug" onClick={() => navigate('/resultug')}>
          <div className="landing-box-icon"></div>
          <h2 className="landing-box-title">UG Results</h2>
          <p className="landing-box-desc">Under Graduate Examination Results</p>
          <p className="landing-box-sub">B.Tech </p>
          <span className="landing-box-arrow">→</span>
        </div>

        <div className="landing-box landing-box-pg" onClick={() => navigate('/resultpg')}>
          <div className="landing-box-icon"></div>
          <h2 className="landing-box-title">PG Results</h2>
          <p className="landing-box-desc">Post Graduate Examination Results</p>
          <p className="landing-box-sub">M.Tech / MBA / MCA</p>
          <span className="landing-box-arrow">→</span>
        </div>
      </div>

      {/* Important Updates Section */}
      <div className="updates-section">
        <div className="updates-header">
          <h3 className="updates-title">📢 Important Updates</h3>
        </div>
        <div className="updates-list">
          <div className="update-item">
            <span className="new-badge">NEW</span>
            <span className="update-text">B.Tech IV Year II Semester (R20) Regular Examination Results - February 2026 have been declared.</span>
          </div>
          <div className="update-item">
            <span className="new-badge">NEW</span>
            <span className="update-text">B.Tech III Year I Semester (R23) Supplementary Examination Results are now available.</span>
          </div>
          <div className="update-item">
            <span className="new-badge">NEW</span>
            <span className="update-text">MBA II Year (R20) Regular Examination Results - January 2026 have been published.</span>
          </div>
          <div className="update-item">
            <span className="update-text" style={{ paddingLeft: '0' }}>M.Tech I Year II Semester (R20) Regular Results - December 2025 are available for download.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
