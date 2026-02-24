// Pre-cache results script - Run before result announcement
// This fetches and caches all results in advance

const resultService = require('./services/resultService');
const fs = require('fs');

async function preCacheResults() {
  // Load student list (you need to provide this)
  const students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
  
  console.log(`Pre-caching results for ${students.length} students...`);
  
  for (const student of students) {
    try {
      await resultService.getResult(
        student.rollNo,
        student.department,
        student.dob,
        student.resultConfig
      );
      console.log(`✓ Cached: ${student.rollNo}`);
      
      // Delay to avoid overwhelming MITS portal
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`✗ Failed: ${student.rollNo}`, error.message);
    }
  }
  
  console.log('Pre-caching complete!');
}

preCacheResults();
