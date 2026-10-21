const fs = require('fs');

const file = 'index.html';

if (!fs.existsSync(file)) {
  console.log('ERROR: index.html nahi mili.');
  console.log('HTML files:');
  console.log(require('child_process').execSync(
    "find . -maxdepth 3 -name '*.html' -not -path './node_modules/*'"
  ).toString());
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');

if (html.includes('AI_FUSION_ORB_CLEANUP_V1')) {
  console.log('Cleanup pehle se laga hua hai.');
  process.exit(0);
}

fs.copyFileSync(file, 'index.html.backup-before-cleanup');

const css = `
/* AI_FUSION_ORB_CLEANUP_V1 */
.orbwrap,
.orbwrap::before,
.orbwrap::after,
.orb,
.orb::before,
.orb::after,
.orb-ring,
.orb-ring-1,
.orb-ring-2,
.orb-ring-3,
.orb-glow {
  display: none !important;
  animation: none !important;
  box-shadow: none !important;
}
`;

if (/<\/head>/i.test(html)) {
  html = html.replace(/<\/head>/i, `<style>${css}</style>\n</head>`);
} else {
  html = `<style>${css}</style>\n${html}`;
}

fs.writeFileSync(file, html);

console.log('SUCCESS: Orb CSS cleanup applied.');
console.log('Backup: index.html.backup-before-cleanup');
console.log('Ab duplicate sections check karne ke liye next step zaroori hai.');
