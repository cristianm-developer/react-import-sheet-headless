import { readFileSync } from 'fs';

const workers = ['parser', 'sanitizer', 'validator', 'transform', 'edit'];

console.log('Verifying all workers have explicit self parameter in Comlink.expose():\n');

workers.forEach(name => {
  const content = readFileSync(`dist/${name}.worker.js`, 'utf-8');
  const hasSelf = content.includes(',self)');
  const status = hasSelf ? '✅' : '❌';
  console.log(`${status} ${name}.worker.js: wa(...,self)? ${hasSelf}`);
  
  if (hasSelf) {
    const match = content.match(/wa\([^,]+,self\)/);
    if (match) {
      console.log(`   Found: ${match[0]}`);
    }
  }
});
