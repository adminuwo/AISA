const fs = require('fs');
const content = fs.readFileSync('src/Tools/AI_Legal/data/draftTemplates.js', 'utf8');
const match = content.match(/export const DRAFT_TEMPLATES = (\{[\s\S]+?\n\});/);
if (match) {
  // Try to parse or just search for category
  const lines = match[1].split('\n');
  const cats = lines.filter(l => l.includes('category:'));
  console.log(cats);
}
