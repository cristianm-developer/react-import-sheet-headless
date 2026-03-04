# How to Verify v1.0.6 Fix Is Actually Being Used

If you're still seeing the `"t.load is not a function"` error after updating to v1.0.6, follow these steps to verify which version is actually running:

---

## Step 1: Check Installed Version

In your **consumer project** (e.g., `@cristianmpx/react-import-sheet-ui-raw`), run:

```bash
npm list @cristianmpx/react-import-sheet-headless
```

**Expected output:**

```
@cristianmpx/react-import-sheet-headless@1.0.6
```

---

## Step 2: Check package.json Version

```bash
cat node_modules/@cristianmpx/react-import-sheet-headless/package.json | grep version
```

Or on Windows PowerShell:

```powershell
Get-Content node_modules/@cristianmpx/react-import-sheet-headless/package.json | Select-String -Pattern '"version"'
```

**Expected output:**

```json
"version": "1.0.6",
```

---

## Step 3: Verify the Fix Is in node_modules

Check if the installed package has `type:"module"` in the Worker creation:

```bash
# Mac/Linux
grep -c 'type:"module"' node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js

# Windows PowerShell
(Get-Content node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js | Select-String -Pattern 'type:"module"').Count
```

**Expected output:** `0` (zero occurrences)

**If you see a number > 0:**

- The old version is still installed
- Clear caches and reinstall (see Step 4)

---

## Step 4: Nuclear Reinstall

If Steps 1-3 show the wrong version or the fix is missing:

```bash
# 1. Remove the package
npm uninstall @cristianmpx/react-import-sheet-headless

# 2. Clear npm cache
npm cache clean --force

# 3. Delete node_modules and lockfile
rm -rf node_modules package-lock.json

# 4. Reinstall everything
npm install

# 5. Install the headless library specifically
npm install @cristianmpx/react-import-sheet-headless@1.0.6
```

---

## Step 5: Clear Build Tool Cache

### Vite

```bash
rm -rf node_modules/.vite
rm -rf .vite
```

### Webpack

```bash
rm -rf node_modules/.cache
rm -rf .cache
```

### Next.js

```bash
rm -rf .next
```

### Storybook

```bash
rm -rf node_modules/.cache/storybook
```

---

## Step 6: Restart Dev Server

After clearing caches:

```bash
# Kill any running dev servers
# Then start fresh
npm run dev
# or
npm run storybook
```

---

## Step 7: Hard Refresh Browser

1. Open your app in the browser
2. Open DevTools (F12)
3. Right-click the refresh button
4. Select "Empty Cache and Hard Reload"

Or use keyboard shortcut:

- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

---

## Step 8: Add Version Logging

Add this to your diagnostic component to see which version is actually running:

```typescript
useEffect(() => {
  console.log('[VERSION CHECK] Checking headless library version...');

  // Check if the hooks are available
  console.log('[VERSION CHECK] useImporter:', typeof useImporter);
  console.log('[VERSION CHECK] useSheetData:', typeof useSheetData);

  // Try to read the package version
  fetch('/node_modules/@cristianmpx/react-import-sheet-headless/package.json')
    .then((res) => res.json())
    .then((pkg) => {
      console.log('[VERSION CHECK] Package version:', pkg.version);
    })
    .catch((err) => {
      console.log('[VERSION CHECK] Could not read package.json (this is normal in production)');
    });

  // Check if Worker is created correctly
  console.log('[VERSION CHECK] Worker constructor:', Worker.toString().substring(0, 100));
}, []);
```

---

## Step 9: Verify Published Package

Download the published package directly from npm to verify it has the fix:

```bash
# Download the package
npm pack @cristianmpx/react-import-sheet-headless@1.0.6

# Extract it
tar -xzf cristianmpx-react-import-sheet-headless-1.0.6.tgz

# Check the version
cat package/package.json | grep version

# Check for type:"module" in the bundle
grep -c 'type:"module"' package/dist/index.js
```

**Expected:**

- Version: `1.0.6`
- type:"module" count: `0`

**If the count is > 0:**

- The published package doesn't have the fix
- The headless library needs to be rebuilt and republished

---

## Step 10: Test with npm link (Local Version)

If you want to test with the local version of the headless library:

### In the headless library repo:

```bash
cd /path/to/react-import-sheet-headless
npm link
```

### In your consumer project:

```bash
cd /path/to/react-import-sheet-ui-raw
npm link @cristianmpx/react-import-sheet-headless
```

This bypasses npm entirely and uses the local version directly.

---

## What to Check in Browser DevTools

### Console Tab

Look for these messages:

- `[VERSION CHECK] Package version: 1.0.6` ✅
- Any Worker-related errors ❌

### Network Tab

1. Filter by "blob:"
2. You should see blob URLs being created for Workers
3. Click on them to see if they load successfully

### Application Tab

1. Go to "Service Workers" or "Workers"
2. Check if any Workers are running
3. Verify they're not showing errors

---

## Still Getting the Error?

If after all these steps you're still seeing `"t.load is not a function"`, please provide:

### 1. Version Confirmation

```bash
npm list @cristianmpx/react-import-sheet-headless
cat node_modules/@cristianmpx/react-import-sheet-headless/package.json | grep version
```

### 2. Fix Verification

```bash
grep -c 'type:"module"' node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js
```

### 3. Browser Console Output

Share the full console output, including:

- Any Worker errors
- Any Comlink errors
- The version check logs (if you added Step 8)

### 4. Network Tab

Screenshot of the Network tab showing:

- Any blob: URLs
- Any failed requests
- Any Worker-related files

---

## Alternative: Check if It's a Different Error

The error message `"t.load is not a function"` is from your **consumer's** minified code, not from the headless library. The variable `t` is minified.

To get the **unminified** error:

1. In your consumer project, create a **development build** (not production)
2. Or disable minification temporarily
3. Run the test again
4. The error message should show the actual variable names

This will help us understand if `t` is really `workerProxy` or something else.

---

## Contact

If none of these steps resolve the issue, please open an issue with:

- Output from Steps 1-3 above
- Browser console output (unminified if possible)
- Your consumer project's package.json (dependencies section)
- Screenshots of Network tab showing blob: URLs
