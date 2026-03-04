#!/usr/bin/env node

/**
 * Installation Diagnostic Script
 * 
 * Run this script in a project that has installed @cristianmpx/react-import-sheet-headless
 * to diagnose why workers might not be loading.
 * 
 * Usage:
 *   node diagnose-installation.js
 *   
 * Or from the consuming project:
 *   npx @cristianmpx/react-import-sheet-headless-diagnose
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

function checkmark(condition) {
  return condition ? '✅' : '❌';
}

// Find node_modules directory
function findNodeModules(startDir = process.cwd()) {
  let currentDir = startDir;
  const maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    const nodeModulesPath = join(currentDir, 'node_modules');
    if (existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }

    const parentDir = resolve(currentDir, '..');
    if (parentDir === currentDir) {
      break; // Reached root
    }
    currentDir = parentDir;
    depth++;
  }

  return null;
}

// Find the package in node_modules
function findPackage(nodeModulesPath) {
  const packagePath = join(nodeModulesPath, '@cristianmpx', 'react-import-sheet-headless');
  return existsSync(packagePath) ? packagePath : null;
}

// Main diagnostic
async function diagnose() {
  logSection('🔍 Installation Diagnostic for @cristianmpx/react-import-sheet-headless');

  log(`\nCurrent directory: ${process.cwd()}`, 'blue');
  log(`Node version: ${process.version}`, 'blue');

  // Step 1: Find node_modules
  logSection('1️⃣ Locating node_modules');
  const nodeModulesPath = findNodeModules();
  
  if (!nodeModulesPath) {
    log('❌ Could not find node_modules directory', 'red');
    log('   Make sure you run this script from a project directory', 'yellow');
    process.exit(1);
  }
  
  log(`${checkmark(true)} Found node_modules at: ${nodeModulesPath}`, 'green');

  // Step 2: Find package
  logSection('2️⃣ Locating Package');
  const packagePath = findPackage(nodeModulesPath);
  
  if (!packagePath) {
    log('❌ Package not found in node_modules', 'red');
    log('   Run: npm install @cristianmpx/react-import-sheet-headless', 'yellow');
    process.exit(1);
  }
  
  log(`${checkmark(true)} Found package at: ${packagePath}`, 'green');

  // Step 3: Read package.json
  logSection('3️⃣ Reading Package Information');
  const pkgJsonPath = join(packagePath, 'package.json');
  
  if (!existsSync(pkgJsonPath)) {
    log('❌ package.json not found in package', 'red');
    process.exit(1);
  }
  
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  log(`${checkmark(true)} Package: ${pkg.name}`, 'green');
  log(`${checkmark(true)} Version: ${pkg.version}`, 'green');
  log(`${checkmark(true)} Type: ${pkg.type}`, 'green');

  // Step 4: Check dist folder
  logSection('4️⃣ Checking dist/ Folder');
  const distPath = join(packagePath, 'dist');
  const distExists = existsSync(distPath);
  
  log(`${checkmark(distExists)} dist/ folder exists`, distExists ? 'green' : 'red');
  
  if (!distExists) {
    log('❌ dist/ folder is missing!', 'red');
    log('   The package was not built correctly before publishing', 'yellow');
    process.exit(1);
  }

  // Step 5: List all files in dist
  logSection('5️⃣ Files in dist/');
  const distFiles = readdirSync(distPath);
  
  if (distFiles.length === 0) {
    log('❌ dist/ folder is empty!', 'red');
    process.exit(1);
  }
  
  distFiles.forEach((file) => {
    const fullPath = join(distPath, file);
    const stats = statSync(fullPath);
    const size = (stats.size / 1024).toFixed(2);
    log(`  📄 ${file} (${size} KB)`, 'reset');
  });

  // Step 6: Check for worker files
  logSection('6️⃣ Verifying Worker Files');
  const requiredWorkers = [
    'parser.worker.js',
    'sanitizer.worker.js',
    'validator.worker.js',
    'transform.worker.js',
    'edit.worker.js',
  ];

  let allWorkersPresent = true;
  const workerStatus = {};

  requiredWorkers.forEach((workerFile) => {
    const workerPath = join(distPath, workerFile);
    const exists = existsSync(workerPath);
    workerStatus[workerFile] = exists;
    allWorkersPresent = allWorkersPresent && exists;
    
    if (exists) {
      const size = statSync(workerPath).size;
      const sizeKB = (size / 1024).toFixed(2);
      log(`${checkmark(true)} ${workerFile} (${sizeKB} KB)`, 'green');
    } else {
      log(`${checkmark(false)} ${workerFile} - MISSING!`, 'red');
    }
  });

  // Step 7: Check entry points
  logSection('7️⃣ Verifying Entry Points');
  const entryPoints = [
    { name: 'main', path: pkg.main },
    { name: 'module', path: pkg.module },
    { name: 'types', path: pkg.types },
  ];

  entryPoints.forEach(({ name, path }) => {
    if (!path) {
      log(`${checkmark(false)} ${name}: not defined in package.json`, 'yellow');
      return;
    }

    const fullPath = join(packagePath, path);
    const exists = existsSync(fullPath);
    log(`${checkmark(exists)} ${name}: ${path}`, exists ? 'green' : 'red');
  });

  // Step 8: Test import
  logSection('8️⃣ Testing Package Import');
  try {
    log('Attempting to import package...', 'blue');
    const imported = await import('@cristianmpx/react-import-sheet-headless');
    
    log(`${checkmark(true)} Package imported successfully`, 'green');
    log(`Exported keys: ${Object.keys(imported).join(', ')}`, 'reset');
    
    // Check for expected exports
    const expectedExports = [
      'ImporterProvider',
      'useImporter',
      'useImporterStatus',
      'useSheetData',
    ];
    
    log('\nChecking expected exports:', 'blue');
    expectedExports.forEach((exportName) => {
      const exists = exportName in imported;
      log(`  ${checkmark(exists)} ${exportName}`, exists ? 'green' : 'red');
    });
    
  } catch (err) {
    log(`${checkmark(false)} Failed to import package`, 'red');
    log(`Error: ${err.message}`, 'red');
  }

  // Step 9: Check for common issues
  logSection('9️⃣ Common Issues Check');
  
  // Issue 1: Missing workers
  if (!allWorkersPresent) {
    log('❌ ISSUE: Worker files are missing', 'red');
    log('   This is a packaging issue. The package was not built correctly.', 'yellow');
    log('   Solution: Report this to the package maintainer', 'yellow');
  }
  
  // Issue 2: Check if using Vite
  const viteConfigExists = existsSync(join(process.cwd(), 'vite.config.js')) ||
                           existsSync(join(process.cwd(), 'vite.config.ts'));
  
  if (viteConfigExists) {
    log('ℹ️  Detected Vite configuration', 'blue');
    log('   Vite may need special configuration for Web Workers:', 'yellow');
    log('   1. Add to vite.config:', 'yellow');
    log('      optimizeDeps: {', 'reset');
    log('        exclude: ["@cristianmpx/react-import-sheet-headless"]', 'reset');
    log('      }', 'reset');
    log('   2. Configure worker options:', 'yellow');
    log('      worker: { format: "es" }', 'reset');
  }
  
  // Issue 3: Check if using Webpack
  const webpackConfigExists = existsSync(join(process.cwd(), 'webpack.config.js')) ||
                               existsSync(join(process.cwd(), 'webpack.config.ts'));
  
  if (webpackConfigExists) {
    log('ℹ️  Detected Webpack configuration', 'blue');
    log('   Webpack may need special configuration for Web Workers:', 'yellow');
    log('   Add to webpack.config:', 'yellow');
    log('   module: {', 'reset');
    log('     rules: [{', 'reset');
    log('       test: /\\.worker\\.js$/',', 'reset');
    log('       use: { loader: "worker-loader" }', 'reset');
    log('     }]', 'reset');
    log('   }', 'reset');
  }

  // Final summary
  logSection('📊 Summary');
  
  const checks = [
    { name: 'Package installed', passed: !!packagePath },
    { name: 'dist/ folder exists', passed: distExists },
    { name: 'All workers present', passed: allWorkersPresent },
  ];

  let allPassed = true;
  checks.forEach(({ name, passed }) => {
    log(`${checkmark(passed)} ${name}`, passed ? 'green' : 'red');
    allPassed = allPassed && passed;
  });

  console.log('\n' + '='.repeat(70));
  
  if (allPassed) {
    log('✅ Installation looks good!', 'green');
    log('\nIf workers still don\'t work:', 'yellow');
    log('1. Check your bundler configuration (Vite/Webpack)', 'yellow');
    log('2. Check browser console for errors', 'yellow');
    log('3. Use the HTML diagnostic tool (test-worker-diagnostic.html)', 'yellow');
    return 0;
  } else {
    log('❌ Installation has issues. See details above.', 'red');
    return 1;
  }
}

// Run diagnostic
diagnose()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    log('\n❌ Diagnostic failed with error:', 'red');
    console.error(error);
    process.exit(1);
  });
