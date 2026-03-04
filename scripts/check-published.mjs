import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const tmpDir = process.env.TEMP || process.env.TMP || '/tmp';
const indexPath = join(tmpDir, 'package', 'dist', 'index.js');

if (!existsSync(indexPath)) {
  console.log('ERROR: File not found:', indexPath);
  console.log('Did tar extraction fail?');
  process.exit(1);
}

const content = readFileSync(indexPath, 'utf-8');
console.log('Published index.js size:', content.length, 'chars');
console.log('Contains Jp={async load?', content.includes('Jp={async load'));
console.log('Contains wa(Jp)?', content.includes('wa(Jp)'));
console.log('Contains type:"module"?', content.includes('type:"module"'));
console.log('Contains type:\'module\'?', content.includes("type:'module'"));

// Compare with local dist
const localContent = readFileSync('dist/index.js', 'utf-8');
console.log('\nLocal dist/index.js size:', localContent.length, 'chars');
console.log('Sizes match?', content.length === localContent.length);
console.log('Content matches?', content === localContent);
