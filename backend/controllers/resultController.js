const resultService = require('../services/resultService');

exports.getResult = async (req, res) => {
  try {
    const { result, student } = await resultService.getResult(
      req.rollNo, 
      req.department,
      req.dob
    );
    res.json({ result, student });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const pdfBuffer = await resultService.generatePDF(
      req.rollNo,
      req.department,
      req.dob
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=result_${req.rollNo}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.emailResult = async (req, res) => {
  try {
    const email = await resultService.emailResult(
      req.rollNo,
      req.department,
      req.dob
    );
    res.json({ message: `Result sent to ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
