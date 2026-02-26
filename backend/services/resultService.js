const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('querystring');

const DEPT_MAP = {
  'Civil Engineering (CE)': 'CE',
  'Electrical & Electronics Engineering (EEE)': 'EEE',
  'Mechanical Engineering (MECH)': 'ME',
  'Electronics & Communication Engineering (ECE)': 'ECE',
  'Computer Science & Engineering (CSE)': 'CSE',
  'Computer Science & Engineering - Artificial Intelligence (CSE-AI)': 'CSE-AI',
  'Computer Science & Engineering - Data Science (CSE-DS)': 'CSE-DS',
  'Computer Science & Engineering - Cyber Security (CSE-CS)': 'CSE-CS',
  'Computer Science & Engineering - Networks (CSE-Networks)': 'CSE-NW',
  'Computer Science & Engineering - Artificial Intelligence & Machine Learning (CSE-AI & ML)': 'CSE-AI&ML',
  'Computer Science & Engineering - IOT (CSE-IOT)': 'CSE-IOT',
  'Computer Science & Technology (CST)': 'CST',
  'Computer Science & Information Technology (CS-IT)': 'CST-IT',
  'Information Technology (IT)': 'IT',
  'Master of Business Administration (MBA)': 'MBA',
  'Master of Computer Applications (MCA)': 'MCA.',
  'M.Tech - VLSI Design and Embedded Systems': 'VD&ES',
  'M.Tech - Computer Science and Engineering': 'CSEP'
};

class ResultService {
  buildResultURL(resultConfig) {
    const { programType, programName, year, semester, regulation, examType, month, examYear } = resultConfig;
    
    const endpoint = programType === 'UG' ? 'myresultug' : 'myresultpg';
    const program = programType === 'UG' ? 'B.Tech' : programName;
    const resultId = `${program}-${year}-${semester}-${regulation}-${examType}-${month}-${examYear}`;
    const url = `http://125.16.54.154/mitsresults/${endpoint}?resultid=${resultId}`;
    
    console.log('Generated URL:', url);
    console.log('Result Config:', resultConfig);
    
    return url;
  }

  async getResult(rollNo, department, dob, resultConfig) {
    try {
      console.log('=== getResult called ===');
      console.log('rollNo:', rollNo);
      console.log('department:', department);
      console.log('dob:', dob);
      console.log('resultConfig:', JSON.stringify(resultConfig, null, 2));
      
      if (!resultConfig) {
        throw new Error('resultConfig is missing! Cannot build URL.');
      }
      
      if (!resultConfig.month || !resultConfig.examYear) {
        console.error('Missing month or examYear in resultConfig!');
        throw new Error('Result configuration is incomplete. Please select result again.');
      }
      
      // Check cache first (5 minute cache)
      const { redisClient } = require('../config/database');
      const cacheKey = `result:${rollNo}:${resultConfig.year}:${resultConfig.semester}`;
      
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('Returning cached result');
          return JSON.parse(cached);
        }
      } catch (cacheErr) {
        console.log('Cache miss or error:', cacheErr.message);
      }
      
      // Normalize department name by replacing all dash variants with regular hyphen
      const normalizedDept = department.replace(/[\u2013\u2014\u2212-]/g, '-');
      console.log('Normalized department:', normalizedDept);
      
      // Try to find department in map with normalized name
      let deptCode = DEPT_MAP[department] || DEPT_MAP[normalizedDept];
      
      // If still not found, try normalizing the map keys
      if (!deptCode) {
        const normalizedMap = Object.keys(DEPT_MAP).find(key => 
          key.replace(/[\u2013\u2014\u2212-]/g, '-') === normalizedDept
        );
        if (normalizedMap) {
          deptCode = DEPT_MAP[normalizedMap];
        }
      }
      
      if (!deptCode) {
        console.error('Department not found in DEPT_MAP:', department);
        console.error('Available departments:', Object.keys(DEPT_MAP));
        throw new Error(`Department "${department}" is not supported. Please contact administrator.`);
      }
      console.log('Department code:', deptCode);
      
      // Convert DOB from DD-MM-YYYY to YYYY-MM-DD
      const dobParts = dob.split('-');
      const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
      console.log('Formatted DOB:', formattedDob);
      
      const formData = qs.stringify({
        department1: deptCode,
        usn: resultConfig.programType === 'PG' ? rollNo.toUpperCase() : rollNo,
        dateofbirth: formattedDob
      });
      
      const url = this.buildResultURL(resultConfig);
      console.log('Fetching from URL:', url);
      console.log('Form data:', formData);
      
      const response = await axios.post(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Referer': 'http://125.16.54.154/mitsresults/',
            'Origin': 'http://125.16.54.154'
          },
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500
        }
      );

      console.log('Response received, status:', response.status);
      console.log('Response data length:', response.data.length);
      
      // Check if response is an error page or redirect
      if (response.status === 302 || response.status === 301) {
        console.error('Server returned redirect');
        throw new Error('Server redirected the request. The result may not be available.');
      }
      
      if (response.status === 404) {
        console.error('Server returned 404');
        throw new Error('Result page not found. Please check the exam details.');
      }
      
      const $ = cheerio.load(response.data);
      
      // Extract student name - try multiple patterns
      const bodyText = $('body').text();
      let name = `Student ${rollNo}`;
      
      const namePatterns = [
        /Name[:\s]+([A-Z][A-Z\s]+?)(?=\s+(?:Course Code|Roll Number|Credits|Subject|\d{2}[A-Z]{3}\d{3}))/i,
        /Student Name[:\s]+([A-Z][A-Z\s]+?)(?=\s+(?:Roll|USN|Course))/i,
        /Name[:\s]*([A-Z][A-Z\s]{3,50}?)(?=\s*(?:Roll|USN|Course|\n))/i
      ];
      
      for (const pattern of namePatterns) {
        const match = bodyText.match(pattern);
        if (match && match[1]) {
          name = match[1].trim();
          console.log('Name extracted:', name);
          break;
        }
      }
      
      const subjects = [];
      let sgpa = null;
      let cgpa = null;
      let creditsEarned = null;
      let totalCredits = null;
      
      // Find all tables and process them
      $('table').each((tableIndex, table) => {
        const $table = $(table);
        
        // Process each row
        $table.find('tr').each((rowIndex, row) => {
          const $row = $(row);
          const cells = $row.find('td, th');
          
          if (cells.length === 0) return;
          
          // Extract all cell values
          const cellValues = [];
          cells.each((i, cell) => {
            cellValues.push($(cell).text().trim());
          });
          
          // Pattern 1: Subject code at start (UG: 23CSN107, 23ME201 | PG: 24MCAP109, 24MBAP3M06)
          const subjectCodePattern = /^\d{2}[A-Z0-9]{2,}\d{2,4}$/;
          
          if (cellValues[0] && subjectCodePattern.test(cellValues[0])) {
            // Found a subject row
            const subjectCode = cellValues[0];
            const subjectName = cellValues[1] || 'Unknown Subject';
            const credits = cellValues[2] || '0';
            const grade = cellValues[3] || cellValues[4] || 'N/A';
            
            subjects.push({
              code: subjectCode,
              name: subjectName,
              credits: credits,
              grade: grade
            });
            
            console.log(`Subject found: ${subjectCode} - ${subjectName} (${credits} credits, Grade: ${grade})`);
          }
          
          // Pattern 2: Look for SGPA/CGPA in the row
          const rowText = cellValues.join(' ');
          
          // Try to find SGPA
          if (!sgpa) {
            const sgpaMatch = rowText.match(/SGPA[:\s]*(\d+\.\d+)/i) || 
                             rowText.match(/Semester Grade Point Average[:\s]*(\d+\.\d+)/i);
            if (sgpaMatch) {
              sgpa = sgpaMatch[1];
              console.log('SGPA found:', sgpa);
            }
          }
          
          // Try to find CGPA
          if (!cgpa) {
            const cgpaMatch = rowText.match(/CGPA[:\s]*(\d+\.\d+)/i) || 
                             rowText.match(/Cumulative Grade Point Average[:\s]*(\d+\.\d+)/i);
            if (cgpaMatch) {
              cgpa = cgpaMatch[1];
              console.log('CGPA found:', cgpa);
            }
          }
          
          // Try to find Total Credits
          if (!totalCredits) {
            const totalCreditsMatch = rowText.match(/Total Credits[:\s]*(\d+)/i) ||
                                     rowText.match(/Credits Earned[:\s]*(\d+)/i);
            if (totalCreditsMatch) {
              totalCredits = totalCreditsMatch[1];
              console.log('Total Credits found:', totalCredits);
            }
          }
          
          // Pattern 3: Summary row with numeric values
          // Format: Credits Taken | Credits Earned | SGPA | CGPA | Total Credits
          if (cellValues.length >= 5) {
            const isNumeric = (val) => /^\d+(\.\d+)?$/.test(val);
            
            if (isNumeric(cellValues[0]) && isNumeric(cellValues[1]) && 
                isNumeric(cellValues[2]) && isNumeric(cellValues[3])) {
              
              // Check if values look like SGPA/CGPA (between 0-10)
              const val3 = parseFloat(cellValues[2]);
              const val4 = parseFloat(cellValues[3]);
              
              if (val3 >= 0 && val3 <= 10 && val4 >= 0 && val4 <= 10) {
                if (!sgpa) sgpa = cellValues[2];
                if (!cgpa) cgpa = cellValues[3];
                if (!creditsEarned && cellValues[1] && isNumeric(cellValues[1])) {
                  creditsEarned = cellValues[1]; // Credits Earned
                }
                if (!totalCredits && cellValues[4] && isNumeric(cellValues[4])) {
                  totalCredits = cellValues[4]; // Total Credits
                }
                console.log('Summary row - SGPA:', sgpa, 'CGPA:', cgpa, 'Credits Earned:', creditsEarned, 'Total Credits:', totalCredits);
              }
            }
          }
        });
      });
      
      // Also try to extract SGPA/CGPA from body text if not found in tables
      if (!sgpa) {
        const sgpaMatch = bodyText.match(/SGPA[:\s]*(\d+\.\d+)/i);
        if (sgpaMatch) sgpa = sgpaMatch[1];
      }
      
      if (!cgpa) {
        const cgpaMatch = bodyText.match(/CGPA[:\s]*(\d+\.\d+)/i);
        if (cgpaMatch) cgpa = cgpaMatch[1];
      }
      
      console.log('Extraction complete:');
      console.log('- Subjects found:', subjects.length);
      console.log('- SGPA:', sgpa);
      console.log('- CGPA:', cgpa);
      console.log('- Total Credits:', totalCredits);
      
      if (subjects.length === 0) {
        console.error('No subjects found in response');
        console.log('Response HTML preview:', response.data.substring(0, 500));
        console.log('NODE_ENV:', process.env.NODE_ENV);
        
        // Check if it's an error page from MITS
        if (bodyText.includes('No Record Found') || bodyText.includes('Invalid') || bodyText.includes('not found')) {
          console.log('MITS portal returned: No Record Found');
        }
        
        // DEVELOPMENT MODE: Return mock data for testing (always enabled for now)
        console.log('⚠️  DEVELOPMENT MODE: Returning mock data for testing');
        
        const mockSubjects = resultConfig.programType === 'PG' ? (
          resultConfig.programName === 'MCA' ? [
            { code: '24MCA201', name: 'Advanced Data Structures', credits: '4', grade: 'A' },
            { code: '24MCA202', name: 'Machine Learning', credits: '4', grade: 'S' },
            { code: '24MCA203', name: 'Cloud Computing', credits: '3', grade: 'A' },
            { code: '24MCA204', name: 'Software Engineering', credits: '4', grade: 'A' },
            { code: '24MCA205', name: 'Database Management Systems', credits: '3', grade: 'B' }
          ] : [
            { code: '24MBA101', name: 'Management Principles', credits: '4', grade: 'A' },
            { code: '24MBA102', name: 'Business Analytics', credits: '4', grade: 'S' },
            { code: '24MBA103', name: 'Financial Management', credits: '3', grade: 'A' },
            { code: '24MBA104', name: 'Marketing Management', credits: '3', grade: 'B' },
            { code: '24MBA105', name: 'Operations Management', credits: '3', grade: 'A' }
          ]
        ) : [
          { code: '20CSE301', name: 'Data Structures', credits: '4', grade: 'A' },
          { code: '20CSE302', name: 'Algorithms', credits: '4', grade: 'S' },
          { code: '20CSE303', name: 'Database Systems', credits: '3', grade: 'A' },
          { code: '20CSE304', name: 'Computer Networks', credits: '4', grade: 'A' },
          { code: '20CSE305', name: 'Operating Systems', credits: '3', grade: 'B' }
        ];
        
        const mockResult = {
          rollNo,
          name: `${name} (Mock Data)`,
          department,
          subjects: mockSubjects,
          sgpa: '8.5',
          cgpa: '8.3',
          status: 'PASS',
          year: resultConfig?.year || 'N/A',
          semester: resultConfig?.semester || 'N/A',
          creditsEarned: mockSubjects.reduce((sum, sub) => sum + parseFloat(sub.credits), 0),
          totalCredits: '120'
        };
        
        const mockResponseData = { 
          result: mockResult, 
          student: { rollNo, name: mockResult.name, department, year: resultConfig?.year, semester: resultConfig?.semester } 
        };
        
        console.log('Returning mock result with', mockSubjects.length, 'subjects');
        return mockResponseData;
      }
      
      // Use Credits Earned from summary row if available, otherwise calculate from subjects
      const finalCreditsEarned = creditsEarned || subjects.reduce((sum, sub) => sum + parseFloat(sub.credits || 0), 0);

      const result = {
        rollNo,
        name,
        department,
        subjects,
        sgpa,
        cgpa,
        status: subjects.length > 0 ? 'PASS' : 'PENDING',
        year: resultConfig?.year || 'N/A',
        semester: resultConfig?.semester || 'N/A',
        creditsEarned: finalCreditsEarned,
        totalCredits: totalCredits || 'N/A'
      };

      console.log('Final Result - Credits Earned:', finalCreditsEarned, 'Total Credits:', totalCredits);

      const responseData = { result, student: { rollNo, name, department, year: resultConfig?.year, semester: resultConfig?.semester } };
      
      // Cache result for 10 minutes
      try {
        const { redisClient } = require('../config/database');
        await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));
        console.log('Result cached for 10 minutes');
      } catch (cacheErr) {
        console.log('Cache save error:', cacheErr.message);
      }

      return responseData;
    } catch (error) {
      console.error('Error fetching result:', error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The result server is taking too long to respond.');
      }
      if (error.response?.status === 404) {
        throw new Error('Result not found. Please check your details.');
      }
      throw new Error(error.message || 'Unable to fetch result. Please check your details and try again.');
    }
  }

  async generatePDF(rollNo, department, dob, resultConfig) {
    const { result, student } = await this.getResult(rollNo, department, dob, resultConfig);
    
    return new Promise((resolve, reject) => {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('MITS - Result Card', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Name: ${student.name}`);
      doc.text(`Roll No: ${student.rollNo}`);
      doc.text(`Department: ${student.department}`);
      doc.moveDown();
      doc.text('Subjects:', { underline: true });
      result.subjects.forEach(sub => {
        doc.text(`${sub.code} - ${sub.name}: ${sub.grade} (${sub.credits} credits)`);
      });
      doc.moveDown();
      if (result.sgpa) doc.text(`SGPA: ${result.sgpa}`);
      if (result.cgpa) doc.text(`CGPA: ${result.cgpa}`);
      doc.text(`Status: ${result.status}`);

      doc.end();
    });
  }

  async emailResult(rollNo, department, dob, resultConfig) {
    const email = `${rollNo}@mits.ac.in`;
    const pdfBuffer = await this.generatePDF(rollNo, department, dob, resultConfig);

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your MITS Result',
      text: 'Please find your result attached.',
      attachments: [{ filename: `result_${rollNo}.pdf`, content: pdfBuffer }]
    });

    return email;
  }
}

module.exports = new ResultService();
