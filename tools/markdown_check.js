const fs = require('fs');
const path = require('path');
const filePath = process.argv[2] || path.join(__dirname, '..', '.github', 'copilot-instructions.md');
let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (e) {
  console.error('ERROR: cannot read file', filePath, e.message);
  process.exit(2);
}
const lines = content.split(/\r?\n/);
let issues = [];
// Check for top Copilot directive
if (!content.startsWith('<!-- Copilot should follow')) {
  issues.push('Missing top Copilot directive comment (expected <!-- Copilot should follow ... -->)');
}
// Code fence count
const fenceCount = (content.match(/```/g) || []).length;
if (fenceCount % 2 !== 0) issues.push(`Unbalanced code fences: found ${fenceCount} occurrences of triple-backtick fences (should be even)`);
// Long lines and trailing spaces
const longLines = [];
const trailing = [];
for (let i = 0; i < lines.length; i++) {
  const L = lines[i];
  if (L.length > 120) longLines.push({line: i+1, len: L.length});
  if (/\s$/.test(L)) trailing.push(i+1);
}
if (longLines.length) issues.push(`Long lines (>120 chars) at: ${longLines.map(x=>x.line).join(', ')}`);
if (trailing.length) issues.push(`Lines with trailing spaces at: ${trailing.join(', ')}`);
// Excessive consecutive blank lines (>2)
let blankStreak = 0;
let blankIssues = [];
for (let i=0;i<lines.length;i++){
  if (/^\s*$/.test(lines[i])) {
    blankStreak++;
    if (blankStreak>2) blankIssues.push(i+1);
  } else {
    blankStreak = 0;
  }
}
if (blankIssues.length) issues.push(`Excessive consecutive blank lines (after line numbers): ${blankIssues.slice(0,10).join(', ')}${blankIssues.length>10?', ...':''}`);
// Heading order: ensure there's at least one H2 after H1
const hasH1 = lines.some(l=>/^#\s+/.test(l));
const hasH2 = lines.some(l=>/^##\s+/.test(l));
if (!hasH1) issues.push('No H1 heading found');
if (!hasH2) issues.push('No H2 headings found (recommended)');
// Report
if (issues.length===0){
  console.log('OK: No issues found by quick markdown check.');
  process.exit(0);
} else {
  console.log('Found issues:');
  issues.forEach((s,idx)=> console.log(`${idx+1}. ${s}`));
  process.exit(1);
}
