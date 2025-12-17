// spotlight.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const {
  generateSpotlightHtml,
  getOutputFilename,
} = require('./lib/spotlight');

async function runSpotlight(ticker, termYears) {
  const html = await generateSpotlightHtml(ticker, termYears);

  const outFile = path.join(
    process.cwd(),
    getOutputFilename(ticker, termYears)
  );

  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`Spotlight generated: ${outFile}`);
}

// ---------- CLI wiring ----------
// Usage: node spotlight.js TSLA 10
const [, , ticker, termStr] = process.argv;

if (!ticker || !termStr) {
  console.error('Usage: node spotlight.js <TICKER> <TERM_YEARS>');
  process.exit(1);
}

const termYears = Number(termStr);
if (Number.isNaN(termYears)) {
  console.error('TERM_YEARS must be a number, got:', termStr);
  process.exit(1);
}

runSpotlight(ticker, termYears).catch((err) => {
  console.error('Error running Spotlight:');
  console.error('message:', err.message);
  console.error('details:', err);
  process.exit(1);
});
