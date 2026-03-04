#!/usr/bin/env node

/**
 * Verify Package Script
 * 
 * This script verifies that the published package contains all necessary files,
 * especially the worker files that are critical for the library to function.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function checkmark(condition) {
  return condition ? '✅' : '❌';
}

// Read package.json
function readPackageJson() {
  const pkgPath = join(rootDir, 'package.json');
  if (!existsSync(pkgPath)) {
    log('❌ package.json not found!', 'red');
    process.exit(1);
  }
  return JSON.parse(readFileSync(pkgPath, 'utf-8'));
}

// Check if dist folder exists
function checkDistFolder() {
  const distPath = join(rootDir, 'dist');
  return existsSync(distPath);
}

// Get all files in dist recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Main verification
function verifyPackage() {
  logSection('📦 Package Verification for react-import-sheet-headless');

  const pkg = readPackageJson();
  
  log(`\nPackage: ${pkg.name}`, 'blue');
  log(`Version: ${pkg.version}`, 'blue');
  log(`Type: ${pkg.type}`, 'blue');

  // Check 1: Verify dist folder exists
  logSection('1️⃣ Checking dist folder');
  const distExists = checkDistFolder();
  log(`${checkmark(distExists)} dist/ folder exists`, distExists ? 'green' : 'red');
  
  if (!distExists) {
    log('\n⚠️  Run "npm run build" first!', 'yellow');
    process.exit(1);
  }

  // Check 2: List all files in dist
  logSection('2️⃣ Files in dist/');
  const distPath = join(rootDir, 'dist');
  const allFiles = getAllFiles(distPath);
  
  allFiles.forEach((file) => {
    const relativePath = relative(distPath, file);
    const size = statSync(file).size;
    const sizeKB = (size / 1024).toFixed(2);
    log(`  📄 ${relativePath} (${sizeKB} KB)`, 'reset');
  });

  // Check 3: Verify worker files
  logSection('3️⃣ Verifying Worker Files');
  const requiredWorkers = [
    'parser.worker.js',
    'sanitizer.worker.js',
    'validator.worker.js',
    'transform.worker.js',
    'edit.worker.js',
  ];

  let allWorkersPresent = true;
  requiredWorkers.forEach((workerFile) => {
    const workerPath = join(distPath, workerFile);
    const exists = existsSync(workerPath);
    allWorkersPresent = allWorkersPresent && exists;
    
    if (exists) {
      const size = statSync(workerPath).size;
      const sizeKB = (size / 1024).toFixed(2);
      log(`${checkmark(true)} ${workerFile} (${sizeKB} KB)`, 'green');
    } else {
      log(`${checkmark(false)} ${workerFile} - MISSING!`, 'red');
    }
  });

  // Check 4: Verify main entry points
  logSection('4️⃣ Verifying Entry Points');
  const entryPoints = [
    { field: 'main', path: pkg.main },
    { field: 'module', path: pkg.module },
    { field: 'types', path: pkg.types },
  ];

  let allEntriesValid = true;
  entryPoints.forEach(({ field, path }) => {
    if (!path) {
      log(`${checkmark(false)} ${field}: not defined`, 'red');
      allEntriesValid = false;
      return;
    }

    const fullPath = join(rootDir, path);
    const exists = existsSync(fullPath);
    allEntriesValid = allEntriesValid && exists;
    
    log(`${checkmark(exists)} ${field}: ${path}`, exists ? 'green' : 'red');
  });

  // Check 5: Verify exports field
  logSection('5️⃣ Verifying Package Exports');
  if (pkg.exports) {
    const mainExport = pkg.exports['.'];
    if (mainExport) {
      log('Main export ("."):', 'blue');
      Object.entries(mainExport).forEach(([key, value]) => {
        const fullPath = join(rootDir, value);
        const exists = existsSync(fullPath);
        log(`  ${checkmark(exists)} ${key}: ${value}`, exists ? 'green' : 'red');
      });
    }
  } else {
    log('⚠️  No "exports" field in package.json', 'yellow');
  }

  // Check 6: Verify files field
  logSection('6️⃣ Verifying Files Field');
  if (pkg.files && Array.isArray(pkg.files)) {
    log('Files to be published:', 'blue');
    pkg.files.forEach((pattern) => {
      log(`  📦 ${pattern}`, 'reset');
    });

    if (!pkg.files.includes('dist')) {
      log('\n❌ "dist" is not in the files array!', 'red');
      log('   Workers will NOT be included in the published package!', 'red');
      allWorkersPresent = false;
    }
  } else {
    log('⚠️  No "files" field in package.json', 'yellow');
    log('   All files will be published (not recommended)', 'yellow');
  }

  // Check 7: Check for source maps
  logSection('7️⃣ Checking Source Maps');
  const sourceMaps = allFiles.filter(f => f.endsWith('.map'));
  if (sourceMaps.length > 0) {
    log(`${checkmark(true)} Found ${sourceMaps.length} source map(s)`, 'green');
    sourceMaps.forEach((map) => {
      const relativePath = relative(distPath, map);
      log(`  🗺️  ${relativePath}`, 'reset');
    });
  } else {
    log('⚠️  No source maps found', 'yellow');
  }

  // Check 8: Verify tsup config
  logSection('8️⃣ Verifying Build Configuration');
  const tsupConfigPath = join(rootDir, 'tsup.config.ts');
  if (existsSync(tsupConfigPath)) {
    log(`${checkmark(true)} tsup.config.ts exists`, 'green');
    const tsupConfig = readFileSync(tsupConfigPath, 'utf-8');
    
    // Check if all workers are in entry
    requiredWorkers.forEach((workerFile) => {
      const workerName = workerFile.replace('.js', '');
      const isInConfig = tsupConfig.includes(workerName);
      log(`  ${checkmark(isInConfig)} ${workerName} in config`, isInConfig ? 'green' : 'red');
    });
  } else {
    log('❌ tsup.config.ts not found!', 'red');
  }

  // Final summary
  logSection('📊 Summary');
  
  const checks = [
    { name: 'Dist folder exists', passed: distExists },
    { name: 'All workers present', passed: allWorkersPresent },
    { name: 'Entry points valid', passed: allEntriesValid },
    { name: 'Files field includes dist', passed: pkg.files?.includes('dist') },
  ];

  let allPassed = true;
  checks.forEach(({ name, passed }) => {
    log(`${checkmark(passed)} ${name}`, passed ? 'green' : 'red');
    allPassed = allPassed && passed;
  });

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    log('✅ All checks passed! Package is ready to publish.', 'green');
    return 0;
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    return 1;
  }
}

// Run verification
try {
  const exitCode = verifyPackage();
  process.exit(exitCode);
} catch (error) {
  log(`\n❌ Verification failed with error:`, 'red');
  console.error(error);
  process.exit(1);
}
