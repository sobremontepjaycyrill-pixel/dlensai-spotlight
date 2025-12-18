const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const ROOT_DIR = path.join(__dirname, '..');
const PROMPT_PATH = path.join(
  ROOT_DIR,
  'prompts',
  'DLENS_Spotlight_MasterPrompt_v1_for_API.txt'
);

// Load the DLENS Spotlight Master Prompt (template reference)
const masterPromptTemplate = fs.readFileSync(PROMPT_PATH, 'utf8');

// Simple mapping from ticker to company display name
const COMPANY_DISPLAY_NAMES = {
  TSLA: 'Tesla, Inc.',
  JOBY: 'Joby Aviation, Inc.',
  SMCI: 'Super Micro Computer, Inc.',
  NVDA: 'NVIDIA Corporation',
};

let cachedClient = null;

function getClient() {
  if (cachedClient) return cachedClient;

  const { OPENAI_API_KEY, OPENAI_ORG_ID, OPENAI_PROJECT_ID } = process.env;

  if (!OPENAI_API_KEY) {
    throw new Error('Missing required environment variable OPENAI_API_KEY');
  }

  cachedClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
    organization: OPENAI_ORG_ID,
    project: OPENAI_PROJECT_ID,
  });

  return cachedClient;
}

/**
 * FINAL prompt builder.
 *
 * IMPORTANT:
 * - The DLENS master prompt is treated as a TEMPLATE REFERENCE ONLY
 * - We EXPLICITLY END the template
 * - We then issue a FINAL AUTHORITATIVE TASK that overrides all examples
 *
 * This prevents NVDA / TSLA continuation 100%.
 */
function buildPrompt(ticker, termYears) {
  const upperTicker = ticker.toUpperCase();
  const companyName =
    COMPANY_DISPLAY_NAMES[upperTicker] || `Company for ticker ${upperTicker}`;

  return `
${masterPromptTemplate}

============================================================
END OF DLENS TEMPLATE REFERENCE (DO NOT CONTINUE ABOVE CONTENT)
============================================================

FINAL AUTHORITATIVE TASK — OVERRIDES ALL ABOVE:

You are NOT continuing any example, sample, or gold-standard company.

You MUST generate a NEW, ORIGINAL DLENS v16_1 Disruptor Spotlight report
using the template ABOVE for STRUCTURE ONLY.

TARGET COMPANY (AUTHORITATIVE — USE THIS ONLY):

- Company: ${companyName}
- Ticker: ${upperTicker}
- Term: ${termYears} years

CRITICAL OVERRIDES (NON-NEGOTIABLE):
- Ignore TSLA, NVDA, or any company mentioned earlier in the prompt.
- Do NOT reuse any company name, CSP, DUU values, probabilities, or prose.
- Gold Standard examples are STRUCTURAL ONLY (layout, CSS, section order).
- ALL analysis, numbers, and narrative MUST be recalculated for ${upperTicker}.
- The H1 header MUST reflect ${companyName} (${upperTicker}) — ${termYears}-Year Horizon.

Now generate the complete DLENS v16_1 Disruptor Spotlight HTML.

`
    // Safety: also replace template placeholders if present
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
  buildPrompt,
  generateSpotlightHtml,
  getOutputFilename,
};
