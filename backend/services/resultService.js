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
  async getResult(rollNo, department, dob) {
    try {
      const deptCode = DEPT_MAP[department] || 'CSE';
      
      // Convert DOB from DD-MM-YYYY to YYYY-MM-DD
      const dobParts = dob.split('-');
      const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
      
      const formData = qs.stringify({
        department1: deptCode,
        usn: rollNo,
        dateofbirth: formattedDob
      });
      
      const response = await axios.post(
        'http://125.16.54.154/mitsresults/myresultug?resultid=B.Tech-III-I-R23-Regular-November-2025',
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
      
      // Find result table
      $('table').each((i, table) => {
        $(table).find('tr').each((j, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 4) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();
            
            // Check if it's a subject row (has subject code pattern)
            if (col1.match(/^\d{2}[A-Z]{3}\d{3}$/) && col2 && col3) {
              subjects.push({
                code: col1,
                name: col2,
                credits: col3,
                grade: col4
              });
            }
            
            // Check for SGPA/CGPA row (last row with numbers)
            if (col1.match(/^\d+$/) && col2.match(/^\d+$/) && col3.match(/^\d+\.\d+$/) && col4.match(/^\d+\.\d+$/)) {
              sgpa = col3;
              cgpa = col4;
            }
          }
        });
      });

      const result = {
        rollNo,
        name,
        department,
        subjects,
        sgpa,
        cgpa,
        status: subjects.length > 0 ? 'PASS' : 'PENDING'
      };

      return { result, student: { rollNo, name, department } };
    } catch (error) {
      console.error('Error fetching result:', error.message);
      throw new Error('Unable to fetch result. Please check your details and try again.');
    }
  }

  async generatePDF(rollNo, department, dob) {
    const { result, student } = await this.getResult(rollNo, department, dob);
    
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

  async emailResult(rollNo, department, dob) {
    const email = `${rollNo}@mits.ac.in`;
    const pdfBuffer = await this.generatePDF(rollNo, department, dob);

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
