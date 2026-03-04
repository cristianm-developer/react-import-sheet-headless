import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const srcDir = join(__dirname, '..', 'src');

const workers = [
  { name: 'parser', srcPath: 'core/parser/worker' },
  { name: 'sanitizer', srcPath: 'core/sanitizer/worker' },
  { name: 'validator', srcPath: 'core/validator/worker' },
  { name: 'transform', srcPath: 'core/transform/worker' },
  { name: 'edit', srcPath: 'core/editor/worker' },
];

console.log('[inline-workers] Starting Worker inlining process...');

for (const worker of workers) {
  const workerBundlePath = join(distDir, `${worker.name}.worker.js`);
  const workerUrlPath = join(srcDir, worker.srcPath, 'worker-url.ts');

  try {
    const workerCode = readFileSync(workerBundlePath, 'utf-8');
    
    const functionName = `get${capitalize(worker.name)}WorkerUrl`;
    
    const inlineCode = `export function ${functionName}(): string {
  const workerCode = ${JSON.stringify(workerCode)};
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
`;

    writeFileSync(workerUrlPath, inlineCode, 'utf-8');
    console.log(`[inline-workers] ✓ Updated ${worker.srcPath}/worker-url.ts`);
  } catch (error) {
    console.error(`[inline-workers] ✗ Failed to inline ${worker.name}:`, error.message);
    process.exit(1);
  }
}

console.log('[inline-workers] All Workers inlined successfully!');
console.log('[inline-workers] Note: You must rebuild (npm run build) for changes to take effect.');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
