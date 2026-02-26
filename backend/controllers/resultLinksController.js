const axios = require('axios');
const cheerio = require('cheerio');

exports.getAvailableResults = async (req, res) => {
  try {
    const { programType, yearSemester, regulation, examType, programName } = req.query;
    
    const [year, semester] = yearSemester.split('-');
    const listingUrl = programType === 'UG' 
      ? 'http://125.16.54.154/mitsresults/resultug'
      : 'http://125.16.54.154/mitsresults/resultpg';
    
    const response = await axios.get(listingUrl, { 
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const $ = cheerio.load(response.data);
    const availableLinks = [];
    const seen = new Set();
    
    $('a').each((i, elem) => {
      const href = $(elem).attr('href') || '';
      const text = $(elem).text().trim();
      
      const match = href.match(/resultid=([^&"'\s]+)/);
      
      if (match) {
        const resultId = decodeURIComponent(match[1]);
        const parts = resultId.split('-');
        
        if (parts.length >= 7) {
          const [prog, yr, sem, reg, type, month, examYear] = parts;
          
          // For PG, also check program name matches
          const programMatches = programType === 'UG' || !programName || prog === programName;
          
          if (yr === year && sem === semester && reg === regulation && type === examType && programMatches) {
            const key = `${month}-${examYear}`;
            if (!seen.has(key)) {
              seen.add(key);
              availableLinks.push({
                resultId,
                month,
                examYear,
                displayText: text || `${month} ${examYear}`
              });
            }
          }
        }
      }
    });
    
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    availableLinks.sort((a, b) => {
      if (a.examYear !== b.examYear) return b.examYear - a.examYear;
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    });
    
    console.log(`Found ${availableLinks.length} links for ${programType} ${programName || ''} ${yearSemester}-${regulation}-${examType}`);
    res.json({ links: availableLinks });
  } catch (error) {
    console.error('Error fetching result links:', error.message);
    res.status(500).json({ error: 'Failed to fetch result links', links: [] });
  }
};
