const fs = require('fs');

const files = [
  'index.html',
  'virat-core/frontend/index.html'
].filter(fs.existsSync);

const brands = {
  'chatgpt': 'openai',
  'openai': 'openai',
  'youtube': 'youtube',
  'whatsapp': 'whatsapp',
  'instagram': 'instagram',
  'facebook': 'facebook',
  'github': 'github',
  'google': 'google',
  'gmail': 'gmail',
  'telegram': 'telegram',
  'x.com': 'x',
  'twitter': 'x',
  'linkedin': 'linkedin',
  'spotify': 'spotify',
  'netflix': 'netflix',
  'discord': 'discord',
  'reddit': 'reddit',
  'tiktok': 'tiktok',
  'pinterest': 'pinterest',
  'canva': 'canva',
  'figma': 'figma',
  'microsoft': 'microsoft',
  'amazon': 'amazon',
  'paytm': 'paytm',
  'phonepe': 'phonepe',
  'razorpay': 'razorpay',
  'claude': 'claude',
  'gemini': 'googlegemini',
  'perplexity': 'perplexity'
};

let total = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const found = Object.keys(brands).filter(name =>
    new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(html)
  );
  console.log('\n' + file + ':');
  console.log('Recognized brands:', found.join(', ') || 'No known brands found');
  total += found.length;
}
console.log('\nRecognized brand matches:', total);
console.log('Logo style file:', fs.existsSync('assets/logos/brand-logos.css') ? 'present' : 'not present');
