const { normalizeText, tokenize, extractKeywords } = require('../utils/textUtils');

function computeScore({ resumeText = '', jobText = '', jobKeywords = [] }) {
  resumeText = normalizeText(resumeText);
  jobText = normalizeText(jobText);

  if ((!jobKeywords || jobKeywords.length === 0) && jobText) {
    jobKeywords = extractKeywords(jobText, 25);
  }

  const resumeTokens = new Set(tokenize(resumeText));
  const jobTokens = new Set(jobKeywords.map(k => k.toLowerCase()));

  const matchedKeywords = [...jobTokens].filter(k => resumeTokens.has(k));
  const keywordMatchRatio = jobTokens.size ? (matchedKeywords.length / jobTokens.size) : 0;

  // experience heuristic
  const expRegex = /(\d+)\s*\+?\s*(years|yrs)/;
  const resumeExpMatch = resumeText.match(expRegex);
  let years = 0;
  if (resumeExpMatch) years = parseInt(resumeExpMatch[1], 10);

  let jobYears = 0;
  const jobExpMatch = jobText.match(expRegex);
  if (jobExpMatch) jobYears = parseInt(jobExpMatch[1], 10);

  let experienceScore = 0;
  if (jobYears > 0) {
    experienceScore = Math.max(0, Math.min(1, years / jobYears));
  } else {
    experienceScore = /experience|experienced/.test(resumeText) ? 0.7 : 0.4;
  }

  // format/readability
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  let formatScore = 1;
  if (wordCount < 150) formatScore = 0.4;
  else if (wordCount < 350) formatScore = 0.8;
  else formatScore = Math.min(1, 350 / wordCount + 0.5);

  const contactPresent = /\b(email|@|phone|phone:|contact|linkedin)\b/.test(resumeText) ? 1 : 0;
  formatScore = (formatScore * 0.8) + (contactPresent * 0.2);

  let lengthScore = 1;
  if (wordCount < 150) lengthScore = 0.6;
  else if (wordCount > 1200) lengthScore = 0.5;

  const weights = {
    keyword: 0.40,
    experience: 0.25,
    keywordPresence: 0.20,
    format: 0.10,
    length: 0.05
  };

  const keywordPresence = keywordMatchRatio;

  const rawScore = (
    weights.keyword * keywordMatchRatio +
    weights.experience * experienceScore +
    weights.keywordPresence * keywordPresence +
    weights.format * formatScore +
    weights.length * lengthScore
  );

  const finalScore = Math.round(rawScore * 100);

  const suggestions = [];
  if (keywordMatchRatio < 0.5) suggestions.push('Add more keywords from the job description (skills, tools, technologies).');
  if (experienceScore < 0.6) suggestions.push('Clarify years of experience and relevant project roles.');
  if (!contactPresent) suggestions.push('Add contact info and LinkedIn profile.');
  if (wordCount < 150) suggestions.push('Resume seems short — add more details on achievements and responsibilities.');
  if (wordCount > 1200) suggestions.push('Resume is long — trim to focus on most relevant achievements.');

  return {
    score: finalScore,
    breakdown: {
      keywordMatchRatio: Number((keywordMatchRatio).toFixed(3)),
      yearsOfExperienceFound: years,
      experienceScore: Number(experienceScore.toFixed(3)),
      formatScore: Number(formatScore.toFixed(3)),
      lengthScore: Number(lengthScore.toFixed(3)),
      rawScore: Number(rawScore.toFixed(3))
    },
    matchedKeywords,
    suggestions
  };
}

module.exports = { computeScore };
