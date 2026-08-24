const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'ScentLabs', 'src', 'data', 'fragrances.ts');
const content = fs.readFileSync('e:/ScentLabs/src/data/fragrances.ts', 'utf8');

// Parse fragrances
const fragIds = [];
const idRegex = /id:\s*"([^"]+)"/g;
let m;
while ((m = idRegex.exec(content)) !== null) {
  if (m[1].startsWith('frag_')) {
    fragIds.push(m[1]);
  }
}

const variants033 = (content.match(/sellingSize:\s*0\.33/g) || []).length;
const variants05 = (content.match(/sellingSize:\s*0\.5/g) || []).length;
const variants1 = (content.match(/sellingSize:\s*1\b/g) || []).length;
const variants2 = (content.match(/sellingSize:\s*2\b/g) || []).length;
const variants4 = (content.match(/sellingSize:\s*4\b/g) || []).length;
const variants8 = (content.match(/sellingSize:\s*8\b/g) || []).length;
const variants16 = (content.match(/sellingSize:\s*16\b/g) || []).length;

console.log(JSON.stringify({
  totalFragrances: fragIds.length,
  variants033,
  variants05,
  variants1,
  variants2,
  variants4,
  variants8,
  variants16,
  fragranceList: fragIds
}, null, 2));
