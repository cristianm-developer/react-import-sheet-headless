# Troubleshooting: "t.load is not a function" Still Occurs After v1.0.6 Update

If you're still seeing the `"t.load is not a function"` error after updating to v1.0.6, follow these steps:

---

## Step 1: Verify the Installed Version

In your **consumer project** (not the headless library), run:

```bash
npm list @cristianmpx/react-import-sheet-headless
```

**Expected output:**

```
@cristianmpx/react-import-sheet-headless@1.0.6
```

**If you see a different version:**

- You're still using the old version
- Run `npm install @cristianmpx/react-import-sheet-headless@1.0.6` again
- Make sure there's no `^` or `~` in your package.json that might prevent the update

---

## Step 2: Clear All Caches

Even if Step 1 shows v1.0.6, you might have cached files. Clear everything:

### Clear npm cache

```bash
npm cache clean --force
```

### Delete node_modules and lockfile

```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear build tool cache

**For Vite:**

```bash
rm -rf node_modules/.vite
rm -rf .vite
```

**For Webpack:**

```bash
rm -rf node_modules/.cache
rm -rf .cache
```

**For Next.js:**

```bash
rm -rf .next
```

### Clear browser cache

- Open DevTools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

---

## Step 3: Verify the Fix Is in Your node_modules

Check if the installed package has the fix:

```bash
# On Windows (PowerShell)
Get-Content node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js | Select-String -Pattern 'type:"module"'

# On Mac/Linux
grep 'type:"module"' node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js
```

**Expected output:** Nothing (no matches)

**If you see matches:**

- The old version is still installed
- Go back to Step 1 and 2

---

## Step 4: Check for Multiple Versions

Sometimes npm installs multiple versions due to dependency conflicts:

```bash
npm ls @cristianmpx/react-import-sheet-headless
```

**If you see multiple versions:**

```bash
npm dedupe
npm install
```

---

## Step 5: Verify Worker Creation in Browser

Open your browser DevTools (F12) and add this to your diagnostic component:

```typescript
useEffect(() => {
  const checkWorkerCreation = async () => {
    try {
      // Get the worker URL function from the installed package
      const { getParserWorkerUrl } =
        await import('@cristianmpx/react-import-sheet-headless/dist/index.js');

      console.log('[DEBUG] getParserWorkerUrl exists:', typeof getParserWorkerUrl);

      if (typeof getParserWorkerUrl === 'function') {
        const url = getParserWorkerUrl();
        console.log('[DEBUG] Worker URL:', url);
        console.log('[DEBUG] URL starts with blob:', url.startsWith('blob:'));
      }
    } catch (err) {
      console.error('[DEBUG] Failed to import:', err);
    }
  };

  checkWorkerCreation();
}, []);
```

**Expected console output:**

```
[DEBUG] getParserWorkerUrl exists: function
[DEBUG] Worker URL: blob:http://localhost:6006/...
[DEBUG] URL starts with blob: true
```

---

## Step 6: Test Worker Directly

Create a test file in your consumer project:

**File:** `test-worker-direct.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Direct Worker Test</title>
  </head>
  <body>
    <h1>Direct Worker Test</h1>
    <button id="test">Test Worker</button>
    <pre id="output"></pre>

    <script type="module">
      import * as Comlink from 'https://unpkg.com/comlink@4.4.2/dist/esm/comlink.mjs';

      document.getElementById('test').addEventListener('click', async () => {
        const output = document.getElementById('output');
        output.textContent = 'Testing...\n';

        try {
          // Import the headless library
          const lib = await import('@cristianmpx/react-import-sheet-headless');
          output.textContent += 'Library imported\n';
          output.textContent += `Version check: ${JSON.stringify(lib)}\n`;

          // Try to access internal worker URL function
          // (This is just for debugging - not recommended in production)
          const libInternal =
            await import('@cristianmpx/react-import-sheet-headless/dist/index.js');
          output.textContent += `Internal import successful\n`;
        } catch (err) {
          output.textContent += `Error: ${err.message}\n`;
          console.error(err);
        }
      });
    </script>
  </body>
</html>
```

Open this file in your browser and click "Test Worker". Check the console for any errors.

---

## Step 7: Check Package.json Dependencies

In your **consumer project's** `package.json`, verify:

```json
{
  "dependencies": {
    "@cristianmpx/react-import-sheet-headless": "1.0.6"
  }
}
```

**Remove any version ranges:**

- ❌ `"^1.0.6"` - might install a newer version
- ❌ `"~1.0.6"` - might install a patch version
- ✅ `"1.0.6"` - exact version

---

## Step 8: Verify npm Registry

Make sure you're pulling from the correct npm registry:

```bash
npm config get registry
```

**Expected:** `https://registry.npmjs.org/`

**If different:**

```bash
npm config set registry https://registry.npmjs.org/
npm install
```

---

## Step 9: Check Published Package Directly

Download and inspect the published package:

```bash
npm pack @cristianmpx/react-import-sheet-headless@1.0.6
tar -xzf cristianmpx-react-import-sheet-headless-1.0.6.tgz
```

Then check:

```bash
# On Windows (PowerShell)
Get-Content package/dist/index.js | Select-String -Pattern 'type:"module"'

# On Mac/Linux
grep 'type:"module"' package/dist/index.js
```

**Expected:** No matches

**If you see matches:**

- The published package doesn't have the fix
- The package needs to be rebuilt and republished

---

## Step 10: Nuclear Option - Link Locally

If nothing else works, test with a local link:

### In the headless library repo:

```bash
npm link
```

### In your consumer project:

```bash
npm link @cristianmpx/react-import-sheet-headless
```

This uses the local version directly, bypassing npm entirely.

---

## Still Not Working?

If you've tried all the above and the error persists, there might be another issue. Please provide:

1. **Exact version installed:**

   ```bash
   npm list @cristianmpx/react-import-sheet-headless
   ```

2. **Check the actual file in node_modules:**

   ```bash
   # Windows
   Get-Content node_modules/@cristianmpx/react-import-sheet-headless/package.json | Select-String -Pattern '"version"'

   # Mac/Linux
   cat node_modules/@cristianmpx/react-import-sheet-headless/package.json | grep version
   ```

3. **Browser console output:**
   - Open DevTools (F12)
   - Go to Console tab
   - Share any errors or warnings

4. **Network tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "blob:"
   - Check if any blob URLs are being created
   - Share screenshots if possible

---

## Common Issues

### Issue: Old version in node_modules despite package.json showing 1.0.6

**Cause:** npm cache or lockfile is stale

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Multiple versions installed

**Cause:** Dependency conflict

**Solution:**

```bash
npm ls @cristianmpx/react-import-sheet-headless
npm dedupe
```

### Issue: Vite/Webpack caching old bundle

**Cause:** Build tool cache

**Solution:**

```bash
rm -rf node_modules/.vite .vite node_modules/.cache .cache
npm run dev
```

### Issue: Browser caching old JavaScript

**Cause:** Browser cache

**Solution:**

- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Or clear browser cache completely

---

## Debug: Add Logging to Verify Version

Add this to your diagnostic component to verify which version is actually running:

```typescript
useEffect(() => {
  // This will help verify which version is loaded
  console.log('[DEBUG] Headless library loaded');
  console.log('[DEBUG] useImporter type:', typeof useImporter);
  console.log('[DEBUG] useSheetData type:', typeof useSheetData);

  // Try to access the package.json (if available)
  import('@cristianmpx/react-import-sheet-headless/package.json', {
    assert: { type: 'json' },
  })
    .then((pkg) => {
      console.log('[DEBUG] Package version:', pkg.version);
    })
    .catch((err) => {
      console.log('[DEBUG] Could not read package.json:', err.message);
    });
}, []);
```

This will log which version is actually being used at runtime.
