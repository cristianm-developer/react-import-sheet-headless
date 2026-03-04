# Testing Guide: Worker Issue Diagnosis

Este documento explica cómo probar y diagnosticar el issue de workers que no responden en v1.0.1.

---

## 🎯 Objetivo

Verificar si los workers están correctamente empaquetados y se cargan en diferentes entornos (desarrollo, producción, Storybook).

---

## 📋 Pre-requisitos

1. Node.js instalado (v18+)
2. El paquete construido (`npm run build`)
3. Un proyecto de prueba (puede ser Storybook o una app simple)

---

## 🧪 Tests Disponibles

### Test 1: Verificar el Paquete Local

**Propósito:** Verificar que el paquete esté correctamente construido antes de publicar.

```bash
# Desde la raíz del proyecto react-import-sheet-headless
npm run build
npm run verify
```

**Qué verifica:**

- ✅ Carpeta `dist/` existe
- ✅ Todos los workers están presentes
- ✅ Entry points son válidos
- ✅ `package.json` incluye `dist` en `files`

**Resultado esperado:**

```
✅ All checks passed! Package is ready to publish.
```

**Si falla:**

- Revisa `tsup.config.ts` - todos los workers deben estar en `entry`
- Revisa `package.json` - `"files": ["dist"]` debe estar presente
- Ejecuta `npm run build` de nuevo

---

### Test 2: Verificar Instalación en Proyecto Consumidor

**Propósito:** Verificar que el paquete instalado desde npm tenga todos los archivos.

```bash
# Desde el proyecto que consume el paquete
npm install @cristianmpx/react-import-sheet-headless@1.0.1
npm run diagnose
# o
node node_modules/@cristianmpx/react-import-sheet-headless/scripts/diagnose-installation.js
```

**Qué verifica:**

- ✅ Paquete instalado correctamente
- ✅ `dist/` existe en `node_modules`
- ✅ Todos los workers están presentes
- ✅ El paquete se puede importar

**Resultado esperado:**

```
✅ Installation looks good!
```

**Si falla:**

- Los workers no están en el paquete publicado → Issue de empaquetado
- Reportar al mantenedor del paquete

---

### Test 3: Test Unitario de Worker URLs

**Propósito:** Verificar que las URLs de los workers se resuelven correctamente.

```bash
# Desde la raíz del proyecto react-import-sheet-headless
npm test src/core/parser/worker/worker-url.test.ts
```

**Qué verifica:**

- ✅ `getParserWorkerUrl()` retorna una URL válida
- ✅ La URL termina en `parser.worker.js`
- ✅ La URL se puede parsear
- ✅ El protocolo es válido

**Resultado esperado:**

```
✓ Parser Worker URL (5 tests)
✓ Worker URL Resolution (3 tests)
✓ Worker URL in Different Environments (2 tests)
```

**Si falla:**

- Revisa `worker-url.ts` - debe usar `import.meta.url`
- Revisa que el worker esté en la misma carpeta

---

### Test 4: Test en Navegador (HTML Diagnostic)

**Propósito:** Probar la carga de workers en un navegador real.

```bash
# 1. Copia el archivo de diagnóstico
cp node_modules/@cristianmpx/react-import-sheet-headless/test-worker-diagnostic.html .

# 2. Sirve con un servidor local
npx serve .

# 3. Abre en el navegador
# http://localhost:3000/test-worker-diagnostic.html
```

**Tests disponibles en la página:**

1. **Test 1: Worker URL Resolution**
   - Verifica que las URLs de los workers se puedan construir
   - Intenta hacer `fetch` de cada worker

2. **Test 2: Worker Creation**
   - Intenta crear instancias de `Worker`
   - Prueba diferentes rutas posibles

3. **Test 3: Comlink Communication**
   - Verifica que Comlink funcione
   - Crea un worker de prueba y llama un método

4. **Test 4: Full Pipeline**
   - Requiere subir un archivo CSV
   - Nota: Necesita contexto de React, usar Storybook en su lugar

5. **Test 5: Network Inspector**
   - Inspecciona las peticiones de red
   - Busca errores 404 o CORS

**Qué buscar:**

- ❌ **404 errors** → Workers no están accesibles
- ❌ **CORS errors** → Problema de configuración del servidor
- ❌ **Worker creation fails** → Problema de configuración del bundler
- ✅ **All tests pass** → Workers funcionan correctamente

---

### Test 5: Test en Storybook

**Propósito:** Probar el flujo completo en Storybook (el entorno donde se reportó el issue).

```bash
# En tu proyecto de Storybook
npm run storybook
```

**Story de diagnóstico:**

Si tienes una story de diagnóstico (como `DiagnosticHeadless.stories.tsx`):

1. Abre Storybook en el navegador
2. Navega a "Diagnostic > Headless"
3. Sube un archivo CSV
4. Observa los logs en tiempo real

**Qué observar:**

```
✅ Flujo correcto:
[timestamp] File selected: test.csv
[timestamp] Calling processFile...
[timestamp] Status: loading
[timestamp] Status: parsing
[timestamp] Status: validating
[timestamp] Status: success
[timestamp] convertResult: { ... }
```

```
❌ Flujo con error (workers no responden):
[timestamp] File selected: test.csv
[timestamp] Calling processFile...
[timestamp] Status: loading
[timestamp] Status: loading  ← Se queda aquí forever
(No más logs, no errores en consola)
```

**Si se queda en "loading":**

1. Abre DevTools (F12)
2. Revisa la pestaña **Console**:
   - ¿Hay errores de worker?
   - ¿Hay errores de importación?
3. Revisa la pestaña **Network**:
   - Filtra por "worker"
   - ¿Los archivos `.worker.js` se están cargando?
   - ¿Qué status code tienen? (200 OK, 404 Not Found, etc.)
4. Revisa la configuración de Vite en `.storybook/main.ts`:
   ```typescript
   async viteFinal(config) {
     config.optimizeDeps = {
       exclude: ['@cristianmpx/react-import-sheet-headless'],
     };
     config.worker = {
       format: 'es',
       plugins: [],
     };
     return config;
   }
   ```

---

## 🔍 Diagnóstico Paso a Paso

### Paso 1: Verificar que los workers existen

```bash
# Desde tu proyecto
ls -la node_modules/@cristianmpx/react-import-sheet-headless/dist/*.worker.js
```

**Esperado:**

```
parser.worker.js
sanitizer.worker.js
validator.worker.js
transform.worker.js
edit.worker.js
```

**Si no existen:**

- El paquete no fue construido correctamente
- Reportar issue al mantenedor

### Paso 2: Verificar que se pueden importar

```bash
node -e "import('@cristianmpx/react-import-sheet-headless').then(pkg => console.log(Object.keys(pkg)))"
```

**Esperado:**

```javascript
[
  'ImporterProvider',
  'useImporter',
  'useImporterStatus',
  'useSheetData',
  // ... otros exports
];
```

### Paso 3: Verificar URLs de workers

Crea un archivo de prueba `test-worker-url.js`:

```javascript
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
console.log('Current file:', __filename);

const workerUrl = new URL('./parser.worker.js', import.meta.url);
console.log('Worker URL:', workerUrl.href);
```

Ejecuta:

```bash
node test-worker-url.js
```

**Esperado:**

```
Current file: /path/to/test-worker-url.js
Worker URL: file:///path/to/parser.worker.js
```

### Paso 4: Verificar en el navegador

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Ejecuta:

   ```javascript
   const url = new URL('./parser.worker.js', import.meta.url);
   console.log('Worker URL:', url.href);

   fetch(url.href, { method: 'HEAD' })
     .then((res) => console.log('Worker accessible:', res.ok))
     .catch((err) => console.error('Worker not accessible:', err));
   ```

**Esperado:**

```
Worker URL: http://localhost:3000/node_modules/@cristianmpx/react-import-sheet-headless/dist/parser.worker.js
Worker accessible: true
```

**Si `false` o error:**

- 404 → Worker no existe en esa ruta
- CORS → Problema de configuración del servidor

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Workers no están en el paquete publicado

**Síntomas:**

```bash
npm run diagnose
❌ parser.worker.js - MISSING!
```

**Causa:**

- `tsup.config.ts` no incluye los workers en `entry`
- `package.json` no incluye `dist` en `files`

**Solución:**

```typescript
// tsup.config.ts
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'parser.worker': 'src/core/parser/worker/parser.worker.ts',
    'sanitizer.worker': 'src/core/sanitizer/worker/sanitizer.worker.ts',
    'validator.worker': 'src/core/validator/worker/validator.worker.ts',
    'transform.worker': 'src/core/transform/worker/transform.worker.ts',
    'edit.worker': 'src/core/editor/worker/edit.worker.ts',
  },
  // ...
});
```

```json
// package.json
{
  "files": ["dist"]
}
```

### Problema 2: Vite pre-bundlea el paquete

**Síntomas:**

- Workers se quedan en "loading"
- No hay errores en consola
- Network tab no muestra peticiones de workers

**Causa:**
Vite está pre-bundleando el paquete y los workers no se resuelven correctamente.

**Solución:**

```typescript
// vite.config.ts o .storybook/main.ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },
});
```

### Problema 3: Worker URL no se resuelve

**Síntomas:**

- Error: `Failed to load worker script`
- 404 en Network tab

**Causa:**
La URL del worker no se construye correctamente.

**Solución:**
Verifica que `worker-url.ts` use `import.meta.url`:

```typescript
export function getParserWorkerUrl(): string {
  return new URL('./parser.worker.js', import.meta.url).href;
}
```

---

## 📊 Checklist de Diagnóstico Completo

Usa este checklist para diagnosticar el issue:

- [ ] **Build local**
  - [ ] `npm run build` exitoso
  - [ ] `npm run verify` pasa todos los checks
  - [ ] Archivos `.worker.js` existen en `dist/`

- [ ] **Instalación**
  - [ ] Paquete instalado desde npm
  - [ ] `npm run diagnose` pasa todos los checks
  - [ ] Workers existen en `node_modules/.../dist/`

- [ ] **Configuración del bundler**
  - [ ] Vite: `optimizeDeps.exclude` configurado
  - [ ] Vite: `worker.format = 'es'` configurado
  - [ ] Webpack: `worker-loader` configurado (si aplica)

- [ ] **Tests unitarios**
  - [ ] `worker-url.test.ts` pasa
  - [ ] URLs se resuelven correctamente

- [ ] **Test en navegador**
  - [ ] HTML diagnostic pasa todos los tests
  - [ ] No hay errores 404 en Network tab
  - [ ] No hay errores CORS
  - [ ] Workers se pueden crear

- [ ] **Test en Storybook**
  - [ ] Story de diagnóstico funciona
  - [ ] Status progresa más allá de "loading"
  - [ ] `convertResult` aparece
  - [ ] No hay errores en Console

---

## 📝 Reportar Resultados

Si encuentras un issue, reporta con:

1. **Resultados de los tests:**

   ```
   npm run verify: ✅/❌
   npm run diagnose: ✅/❌
   HTML diagnostic: ✅/❌
   Storybook: ✅/❌
   ```

2. **Logs relevantes:**
   - Output de `npm run verify`
   - Output de `npm run diagnose`
   - Errores de consola del navegador
   - Screenshot de Network tab

3. **Configuración:**
   - `tsup.config.ts`
   - `vite.config.ts` o `.storybook/main.ts`
   - `package.json` (sección `files` y `exports`)

4. **Entorno:**
   - Node version: `node --version`
   - Package version: `1.0.1`
   - Bundler: Vite/Webpack/etc.
   - Browser: Chrome/Firefox/Safari

---

## 🎓 Recursos Adicionales

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guía completa de troubleshooting
- [Architecture.md](./docs/Architecture.md) - Documentación de arquitectura
- [How-to.md](./docs/how-to.md) - Guía de uso

---

## ✅ Resultado Esperado

Después de seguir esta guía, deberías poder:

1. ✅ Verificar que el paquete está correctamente construido
2. ✅ Confirmar que los workers están presentes
3. ✅ Identificar si el problema es de empaquetado o configuración
4. ✅ Probar en diferentes entornos (Node, navegador, Storybook)
5. ✅ Reportar el issue con información completa

Si todos los tests pasan pero el issue persiste, es probable que sea un problema de configuración del bundler en el proyecto consumidor, no del paquete en sí.
