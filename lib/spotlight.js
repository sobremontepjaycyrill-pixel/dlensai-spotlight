const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const ROOT_DIR = path.join(__dirname, '..');
const PROMPT_PATH = path.join(
  ROOT_DIR,
  'prompts',
  'DLENS_Spotlight_MasterPrompt_API_CLEAN.txt'
);

// Load CLEAN API prompt (instruction-only)
const promptTemplate = fs.readFileSync(PROMPT_PATH, 'utf8');

const COMPANY_DISPLAY_NAMES = {
  TSLA: 'Tesla, Inc.',
  JOBY: 'Joby Aviation, Inc.',
  SMCI: 'Super Micro Computer, Inc.',
  NVDA: 'NVIDIA Corporation',
};

let cachedClient = null;

function getClient() {
  if (cachedClient) return cachedClient;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing required environment variable OPENAI_API_KEY');
  }

  cachedClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return cachedClient;
}

function buildPrompt(ticker, termYears) {
  const upperTicker = ticker.toUpperCase();
  const companyName =
    COMPANY_DISPLAY_NAMES[upperTicker] || `Company for ticker ${upperTicker}`;

  return promptTemplate
    .replace(/\{\{COMPANY_NAME\}\}/g, companyName)
    .replace(/\{\{TICKER\}\}/g, upperTicker)
    .replace(/\{\{N\}\}/g, String(termYears));
}

async function generateSpotlightHtml(ticker, termYears) {
  const prompt = buildPrompt(ticker, termYears);
  const client = getClient();

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1',
    input: prompt,
    max_output_tokens: 8000,
  });

  return response.output_text;
}

function getOutputFilename(ticker, termYears) {
  return `DLENS_Spotlight_${ticker.toUpperCase()}_${termYears}y_via_API.html`;
}

module.exports = {
  generateSpotlightHtml,
  getOutputFilename,
};
