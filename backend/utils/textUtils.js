const natural = require('natural');
const sw = require('stopword');

function normalizeText(text) {
  if (!text) return '';
  text = text.replace(/\s+/g, ' ').trim().toLowerCase();
  return text;
}

function tokenize(text) {
  const toks = new natural.WordTokenizer().tokenize(text);
  return sw.removeStopwords(toks).filter(t => /^[a-z0-9\+\#\-]+$/.test(t));
}

function extractKeywords(text, topN = 20) {
  const tokens = tokenize(text);
  const freq = {};
  tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
  return Object.entries(freq)
    .sort((a,b) => b[1]-a[1])
    .slice(0, topN)
    .map(x => x[0]);
}

module.exports = { normalizeText, tokenize, extractKeywords };
