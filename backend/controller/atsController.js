const fs = require('fs');
const pdf = require('pdf-parse');
const scoreService = require('../services/scoreService');

async function postScore(req, res) {
  try {
    const { resumeText, jobText, jobKeywords } = req.body;
    if ((!resumeText || resumeText.trim().length === 0)) {
      return res.status(400).json({ error: 'resumeText required for this endpoint' });
    }
    const parsedJobKeywords = Array.isArray(jobKeywords) ? jobKeywords : (jobKeywords ? JSON.parse(jobKeywords) : []);
    const result = scoreService.computeScore({ resumeText, jobText, jobKeywords: parsedJobKeywords });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function postScoreFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required (field name: resume)' });
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    const resumeText = data.text || '';
    const { jobText, jobKeywords } = req.body;
    const parsedJobKeywords = Array.isArray(jobKeywords) ? jobKeywords : (jobKeywords ? JSON.parse(jobKeywords) : []);
    const result = scoreService.computeScore({ resumeText, jobText, jobKeywords: parsedJobKeywords });
    // cleanup uploaded file
    fs.unlink(req.file.path, (err) => { if (err) console.warn('cleanup failed', err); });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

module.exports = { postScore, postScoreFile };
