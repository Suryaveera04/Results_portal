import React, { useState, useEffect } from 'react';

function ResultSelection({ onSelectionComplete }) {
  const [formData, setFormData] = useState({
    programType: '',
    programName: '',
    year: '',
    semester: '',
    regulation: '',
    examType: '',
    month: '',
    examYear: ''
  });
  const [timeLeft, setTimeLeft] = useState(60);

  const years = ['I', 'II', 'III', 'IV'];
  const semesters = ['I', 'II'];
  const regulations = ['R18', 'R20', 'R23', 'R24'];
  const pgPrograms = ['MBA', 'MCA', 'M.Tech'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const examYears = Array.from({ length: 13 }, (_, i) => 2015 + i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'programType') {
      setFormData({ ...formData, [name]: value, programName: value === 'UG' ? 'B.Tech' : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = formData.programType === 'PG' 
      ? Object.values(formData).every(val => val)
      : Object.entries(formData).filter(([key]) => key !== 'programName').every(([, val]) => val);
    
    if (requiredFields) {
      onSelectionComplete(formData);
    } else {
      alert('Please fill all fields');
    }
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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>📋</span>
        </div>
        <h2 style={styles.title}>Select Result Details</h2>
        <p style={styles.subtitle}>Choose your examination details</p>
        <p style={styles.timer}>⏱️ Time remaining: <span style={styles.timerCount}>{timeLeft}s</span></p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Program Type</label>
            <select name="programType" value={formData.programType} onChange={handleChange} style={styles.select} required>
              <option value="">-- Select Program --</option>
              <option value="UG">UG (Under Graduate)</option>
              <option value="PG">PG (Post Graduate)</option>
            </select>
          </div>

          {formData.programType === 'PG' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Program Name</label>
              <select name="programName" value={formData.programName} onChange={handleChange} style={styles.select} required>
                <option value="">-- Select Program --</option>
                {pgPrograms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Year</label>
              <select name="year" value={formData.year} onChange={handleChange} style={styles.select} required>
                <option value="">-- Select Year --</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Semester</label>
              <select name="semester" value={formData.semester} onChange={handleChange} style={styles.select} required>
                <option value="">-- Select Semester --</option>
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Regulation</label>
            <select name="regulation" value={formData.regulation} onChange={handleChange} style={styles.select} required>
              <option value="">-- Select Regulation --</option>
              {regulations.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Exam Type</label>
            <select name="examType" value={formData.examType} onChange={handleChange} style={styles.select} required>
              <option value="">-- Select Exam Type --</option>
              <option value="Regular">Regular</option>
              <option value="Supplementary">Supplementary</option>
            </select>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Examination Month</label>
              <select name="month" value={formData.month} onChange={handleChange} style={styles.select} required>
                <option value="">-- Select Month --</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Examination Year</label>
              <select name="examYear" value={formData.examYear} onChange={handleChange} style={styles.select} required>
                <option value="">-- Select Year --</option>
                {examYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #0056b3 0%, #003d82 100%)';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
             Continue to Login
          </button>
        </form>
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
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  iconContainer: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  icon: {
    fontSize: '60px',
    display: 'inline-block'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '10px'
  },
  timer: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px'
  },
  timerCount: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  row: {
    display: 'flex',
    gap: '15px'
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px'
  },
  select: {
    padding: '12px 15px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s ease',
    background: 'white',
    cursor: 'pointer'
  },
  button: {
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
    marginTop: '10px'
  }
};

export default ResultSelection;
