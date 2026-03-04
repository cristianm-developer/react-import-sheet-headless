import { readFileSync } from 'fs';

const workerUrlContent = readFileSync('src/core/parser/worker/worker-url.ts', 'utf-8');
const indexContent = readFileSync('dist/index.js', 'utf-8');

// Check if worker-url.ts contains the inlined worker
const hasWorkerCode = workerUrlContent.includes('const workerCode = ');
console.log('worker-url.ts has workerCode?', hasWorkerCode);

if (hasWorkerCode) {
  // Check if the inlined worker contains the API
  const hasLoad = workerUrlContent.includes('Jp={async load');
  const hasExpose = workerUrlContent.includes('wa(Jp)');
  console.log('  Contains Jp={async load?', hasLoad);
  console.log('  Contains wa(Jp)?', hasExpose);
}

// Check if dist/index.js contains the inlined worker
const indexHasWorkerCode = indexContent.includes('Jp={async load');
const indexHasExpose = indexContent.includes('wa(Jp)');
console.log('\ndist/index.js:');
console.log('  Contains Jp={async load?', indexHasWorkerCode);
console.log('  Contains wa(Jp)?', indexHasExpose);

// Check for the specific pattern that creates the worker
const hasGetParserWorkerUrl = indexContent.includes('getParserWorkerUrl');
console.log('  Contains getParserWorkerUrl?', hasGetParserWorkerUrl);
