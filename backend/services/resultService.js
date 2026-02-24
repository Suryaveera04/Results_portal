const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('querystring');

const DEPT_MAP = {
  'Civil Engineering (CE)': 'CE',
  'Electrical & Electronics Engineering (EEE)': 'EEE',
  'Mechanical Engineering (MECH)': 'ME',
  'Electronics & Communication Engineering (ECE)': 'ECE',
  'Computer Science & Engineering (CSE)': 'CSE',
  'Computer Science & Engineering – Artificial Intelligence (CSE-AI)': 'CSE-AI',
  'Computer Science & Engineering – Data Science (CSE-DS)': 'CSE-DS',
  'Computer Science & Engineering – Cyber Security (CSE-CS)': 'CSE-CS',
  'Computer Science & Engineering – Networks (CSE-Networks)': 'CSE-NW',
  'Computer Science & Engineering – Artificial Intelligence & Machine Learning (CSE-AI & ML)': 'CSE-AI&ML',
  'Computer Science & Engineering – IOT (CSE-IOT)': 'CSE-IOT',
  'Computer Science & Technology (CST)': 'CST',
  'Computer Science & Information Technology (CS-IT)': 'CST-IT',
  'Information Technology (IT)': 'IT'
};

class ResultService {
  buildResultURL(resultConfig) {
    const { programType, programName, year, semester, regulation, examType, month, examYear } = resultConfig;
    
    // Determine endpoint: myresultug or myresultpg
    const endpoint = programType === 'UG' ? 'myresultug' : 'myresultpg';
    
    // Build resultid string: ProgramName-Year-Semester-Regulation-ExamType-Month-Year
    // Example: B.Tech-III-I-R23-Regular-November-2025 or MBA-I-II-R24-Supplementary-January-2026
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
      
      if (!resultConfig) {
        throw new Error('resultConfig is missing! Cannot build URL.');
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
      
      const deptCode = DEPT_MAP[department] || 'CSE';
      
      // Convert DOB from DD-MM-YYYY to YYYY-MM-DD
      const dobParts = dob.split('-');
      const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
      
      const formData = qs.stringify({
        department1: deptCode,
        usn: rollNo,
        dateofbirth: formattedDob
      });
      
      const url = this.buildResultURL(resultConfig);
      
      const response = await axios.post(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 10000
        }
      );

      const $ = cheerio.load(response.data);
      
      // Extract student name
      const bodyText = $('body').text();
      const nameMatch = bodyText.match(/Name:\s*([A-Z\s]+?)(?=\s+Course Code|\s+Roll Number|\s+Credits)/i);
      const name = nameMatch ? nameMatch[1].trim() : `Student ${rollNo}`;
      
      const subjects = [];
      let sgpa = null;
      let cgpa = null;
      let totalCredits = null;
      
      // Find result table
      $('table').each((i, table) => {
        $(table).find('tr').each((j, row) => {
          const cells = $(row).find('td');
          
          // Check if it's a subject row (has subject code pattern and 5 cells)
          if (cells.length >= 5) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();
            const col5 = $(cells[4]).text().trim();
            
            if (col1.match(/^\d{2}[A-Z]{3}\d{3}$/) && col2 && col3) {
              subjects.push({
                code: col1,
                name: col2,
                credits: col3,
                grade: col4
              });
            }
            
            // Check for summary row: Credits Taken | Credits Earned | SGPA | CGPA | Total Credits
            if (col1.match(/^\d+$/) && col2.match(/^\d+$/) && col3.match(/^\d+\.\d+$/) && col4.match(/^\d+\.\d+$/) && col5.match(/^\d+$/)) {
              totalCredits = col5; // Total Credits (cumulative)
              sgpa = col3;
              cgpa = col4;
              console.log('Found summary row - Credits Taken:', col1, 'Credits Earned:', col2, 'SGPA:', col3, 'CGPA:', col4, 'Total Credits:', col5);
            }
          }
        });
      });
      
      // Calculate credits earned from current semester subjects
      const creditsEarned = subjects.reduce((sum, sub) => sum + parseFloat(sub.credits || 0), 0);

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
        creditsEarned: creditsEarned,
        totalCredits: totalCredits || 'N/A'
      };

      console.log('Final Result - Credits Earned:', creditsEarned, 'Total Credits:', totalCredits);

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
      throw new Error('Unable to fetch result. Please check your details and try again.');
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
