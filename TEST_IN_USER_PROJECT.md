# Test Directo en tu Proyecto

Ejecuta esto en tu proyecto `react-import-sheet-ui-raw`:

## 1. Crea un archivo de test simple

Crea `test-headless.html` en el root de tu proyecto:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Test Headless Direct</title>
  </head>
  <body>
    <h1>Test Direct Import</h1>
    <input type="file" id="fileInput" accept=".csv" />
    <div id="output" style="font-family: monospace; white-space: pre; margin-top: 20px;"></div>

    <script type="module">
      const output = document.getElementById('output');
      function log(msg) {
        output.textContent += msg + '\n';
        console.log(msg);
      }

      // Import directly from node_modules
      log('Importing from node_modules...');
      const lib =
        await import('./node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js');
      log('✓ Imported');
      log('Exports: ' + Object.keys(lib).slice(0, 10).join(', '));

      // This won't work because it's React, but we can check if it loads
      log('\n✓ Library loaded successfully');
      log('\nSi ves este mensaje, el paquete se puede importar correctamente.');
      log('El problema está en cómo Storybook/Vite está bundleando tu código.');
    </script>
  </body>
</html>
```

## 2. Abre el archivo en tu navegador

```powershell
# Inicia un servidor HTTP simple
npx http-server -p 8080
```

Luego abre: http://localhost:8080/test-headless.html

## 3. Revisa la consola del navegador

Si ves "✓ Library loaded successfully", entonces el paquete está correcto y el problema es tu bundler.

---

## Si el problema es el bundler:

El problema es que **Vite/Storybook está transformando el código del headless library de manera incorrecta**.

### Solución: Optimizar deps en Vite

Agrega esto a tu `vite.config.ts` (o `.storybook/main.ts` si estás usando Storybook):

```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },
  // O alternativamente, incluir explícitamente:
  optimizeDeps: {
    include: ['@cristianmpx/react-import-sheet-headless'],
  },
});
```

Luego:

```powershell
# Borra el caché de Vite
Remove-Item -Recurse -Force node_modules\.vite
Remove-Item -Recurse -Force .vite

# Reinicia
npm run storybook
```

---

## Si eso no funciona:

El problema podría ser que Vite está tratando de optimizar el worker code. Intenta esto:

```typescript
export default defineConfig({
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
});
```
