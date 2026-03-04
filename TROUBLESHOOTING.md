# Troubleshooting Guide

## Workers Not Responding / Stuck in "Loading" State

If you're experiencing issues where the import process gets stuck in a "loading" state and workers never respond, follow this diagnostic guide.

### Quick Diagnostic Checklist

- [ ] Workers are included in the published package
- [ ] Bundler is configured correctly for Web Workers
- [ ] Browser supports Web Workers
- [ ] No CORS or network errors in console
- [ ] Worker files are accessible

---

## Step 1: Verify Package Installation

Run the installation diagnostic script:

```bash
npm run diagnose
# or
node node_modules/@cristianmpx/react-import-sheet-headless/scripts/diagnose-installation.js
```

This will check:

- ✅ Package is installed correctly
- ✅ `dist/` folder exists
- ✅ All worker files are present
- ✅ Entry points are valid

**Expected output:**

```
✅ Package installed
✅ dist/ folder exists
✅ All workers present
  ✅ parser.worker.js (XX KB)
  ✅ sanitizer.worker.js (XX KB)
  ✅ validator.worker.js (XX KB)
  ✅ transform.worker.js (XX KB)
  ✅ edit.worker.js (XX KB)
```

**If workers are missing:**
This is a packaging issue. The package was not built correctly before publishing. Please report this issue to the maintainer.

---

## Step 2: Configure Your Bundler

### Vite Configuration

If you're using **Vite** (including Storybook with Vite), add this to your `vite.config.ts` or `.storybook/main.ts`:

```typescript
export default defineConfig({
  // Exclude the headless package from pre-bundling
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },

  // Configure worker options
  worker: {
    format: 'es',
    plugins: [],
  },
});
```

**For Storybook with Vite:**

```typescript
// .storybook/main.ts
export default {
  async viteFinal(config) {
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [
        ...(config.optimizeDeps?.exclude || []),
        '@cristianmpx/react-import-sheet-headless',
      ],
    };

    config.worker = {
      format: 'es',
      plugins: [],
    };

    return config;
  },
};
```

### Webpack Configuration

If you're using **Webpack**, you may need to configure worker-loader:

```bash
npm install worker-loader --save-dev
```

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
    ],
  },
};
```

### Next.js Configuration

For **Next.js**, add to `next.config.js`:

```javascript
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });
    return config;
  },
};
```

---

## Step 3: Browser Diagnostic

Open the HTML diagnostic tool in your browser:

1. Copy `node_modules/@cristianmpx/react-import-sheet-headless/test-worker-diagnostic.html` to your project root
2. Serve it with a local server (e.g., `npx serve .`)
3. Open `http://localhost:3000/test-worker-diagnostic.html`
4. Run each test:
   - **Test 1: Worker URL Resolution** - Checks if worker files can be found
   - **Test 2: Worker Creation** - Tests if workers can be instantiated
   - **Test 3: Comlink Communication** - Verifies Comlink is working
   - **Test 4: Full Pipeline** - Tests the complete flow (requires React)
   - **Test 5: Network Inspector** - Checks for network errors

**What to look for:**

- ❌ 404 errors → Worker files are not accessible
- ❌ CORS errors → Server configuration issue
- ❌ Worker creation fails → Bundler configuration issue
- ❌ Comlink fails → Dependency issue

---

## Step 4: Check Browser Console

Open your browser's DevTools (F12) and check:

### Console Tab

Look for errors like:

- `Failed to load worker script` → Worker file not found
- `CORS policy` → CORS configuration issue
- `Unexpected token` → Worker file is not valid JavaScript
- `Module not found` → Import path issue

### Network Tab

1. Filter by "JS" or "worker"
2. Look for worker files (`parser.worker.js`, etc.)
3. Check status codes:
   - **200 OK** ✅ File loaded successfully
   - **404 Not Found** ❌ Worker file missing
   - **CORS error** ❌ CORS configuration issue

---

## Step 5: Verify Worker Files Manually

Check if worker files exist in your `node_modules`:

```bash
ls -la node_modules/@cristianmpx/react-import-sheet-headless/dist/*.worker.js
```

**Expected files:**

```
parser.worker.js
sanitizer.worker.js
validator.worker.js
transform.worker.js
edit.worker.js
```

If these files are missing, the package was not built correctly. Please report this issue.

---

## Common Issues & Solutions

### Issue 1: Workers Stuck in "Loading" Forever

**Symptoms:**

- `status` changes from `idle` to `loading`
- Never progresses to next stage
- No errors in console
- No network errors

**Possible Causes:**

1. **Worker files not accessible**
   - Solution: Check bundler configuration (Step 2)
   - Verify worker files exist (Step 5)

2. **Vite pre-bundling the package**
   - Solution: Add package to `optimizeDeps.exclude` (Step 2)

3. **Worker URL resolution fails**
   - Solution: Run browser diagnostic (Step 3)

### Issue 2: "Failed to load worker script"

**Symptoms:**

- Error in console: `Failed to load worker script`
- 404 error in Network tab

**Solution:**

1. Verify worker files exist in `node_modules` (Step 5)
2. Check bundler configuration (Step 2)
3. For Vite: Exclude package from pre-bundling

### Issue 3: CORS Errors

**Symptoms:**

- Error: `has been blocked by CORS policy`
- Worker files show CORS error in Network tab

**Solution:**

1. Ensure you're using a proper development server (not `file://`)
2. Configure your server to allow worker scripts:
   ```javascript
   // Express example
   app.use((req, res, next) => {
     res.header('Cross-Origin-Embedder-Policy', 'require-corp');
     res.header('Cross-Origin-Opener-Policy', 'same-origin');
     next();
   });
   ```

### Issue 4: "Unexpected token" in Worker

**Symptoms:**

- Error: `Unexpected token '<'` or similar
- Worker file loads but fails to parse

**Possible Causes:**

1. **HTML file served instead of JS**
   - Check Network tab → Preview of worker file
   - Should be JavaScript, not HTML

2. **Incorrect MIME type**
   - Server must serve `.js` files with `application/javascript`

**Solution:**
Configure your server to serve correct MIME types.

---

## Testing in Different Environments

### Development (Vite/Webpack Dev Server)

```bash
npm run dev
# Check: http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
# Check: http://localhost:4173
```

### Storybook

```bash
npm run storybook
# Check: http://localhost:6006
```

---

## Reporting Issues

If you've followed all steps and workers still don't work, please report an issue with:

1. **Environment Info:**
   - Node version: `node --version`
   - Package version: Check `package.json`
   - Bundler: Vite/Webpack/Next.js/etc.
   - Browser: Chrome/Firefox/Safari/etc.

2. **Diagnostic Results:**
   - Output of `npm run diagnose`
   - Output of `npm run verify`
   - Browser console errors
   - Network tab screenshot

3. **Configuration:**
   - Your `vite.config.ts` or `webpack.config.js`
   - Your `.storybook/main.ts` (if using Storybook)

4. **Reproduction:**
   - Minimal reproduction repository (if possible)
   - Steps to reproduce the issue

---

## Additional Resources

- [Architecture Documentation](./docs/Architecture.md)
- [How-to Guide](./docs/how-to.md)
- [GitHub Issues](https://github.com/cristianm-developer/react-import-sheet-headless/issues)

---

## Quick Fix Checklist

Try these quick fixes in order:

1. ✅ **Clear cache and reinstall:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. ✅ **Verify package:**

   ```bash
   npm run verify
   ```

3. ✅ **Configure bundler:**
   - Add package to `optimizeDeps.exclude` (Vite)
   - Configure worker-loader (Webpack)

4. ✅ **Test in browser:**
   - Open test-worker-diagnostic.html
   - Check browser console
   - Check network tab

5. ✅ **Try different browser:**
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari

If none of these work, please report an issue with full diagnostic information.
