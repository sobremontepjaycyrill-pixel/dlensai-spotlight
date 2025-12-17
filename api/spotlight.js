const {
  generateSpotlightHtml,
  getOutputFilename,
} = require('../lib/spotlight');
require('dotenv').config();

function allowOnlyPost(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return false;
  }

  return true;
}

async function readJsonBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch (err) {
        throw new Error('Invalid JSON payload');
      }
    }

    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString('utf8'));
      } catch (err) {
        throw new Error('Invalid JSON payload');
      }
    }

    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error('Invalid JSON payload');
  }
}

module.exports = async function handler(req, res) {
  if (!allowOnlyPost(req, res)) return;

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    res.status(400).json({ error: err.message });
    return;
  }

  const { ticker, termYears } = body || {};

  if (!ticker || typeof ticker !== 'string') {
    res.status(400).json({ error: 'ticker is required as a string' });
    return;
  }

  const termNumber = Number(termYears);
  if (!Number.isFinite(termNumber)) {
    res
      .status(400)
      .json({ error: 'termYears is required and must be a number' });
    return;
  }

  try {
    const html = await generateSpotlightHtml(ticker, termNumber);
    res.status(200).json({
      html,
      filename: getOutputFilename(ticker, termNumber),
    });
  } catch (err) {
    console.error('Spotlight API error', err);
    res.status(500).json({
      error: 'Failed to generate spotlight',
      message: err.message,
    });
  }
};
