# URGENT: Cache Issue - Error Persists After v1.0.6 Update

**Si sigues viendo el error `"t.load is not a function"` después de actualizar a v1.0.6, es un problema de caché.**

---

## El Fix ESTÁ en v1.0.6

He verificado que el fix está correctamente aplicado en el código:

✅ `dist/index.js` NO contiene `type:"module"`  
✅ Workers se crean con `new Worker(url)` (sin opciones)  
✅ El bundle está correcto  
✅ Todos los tests pasan

**El problema es que tu aplicación consumer está usando una versión cacheada.**

---

## Solución Rápida (Haz esto AHORA)

### En tu proyecto consumer (`react-import-sheet-ui-raw`):

```bash
# 1. Detén todos los servidores (Storybook, Vite, etc.)
# Ctrl+C en todas las terminales

# 2. Borra TODO
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vite
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# 3. Limpia caché de npm
npm cache clean --force

# 4. Reinstala TODO
npm install

# 5. Inicia Storybook de nuevo
npm run storybook
```

### En el navegador:

1. Abre DevTools (F12)
2. Ve a la pestaña "Application" o "Aplicación"
3. En el menú izquierdo, busca "Storage" o "Almacenamiento"
4. Click derecho en "Clear site data" o "Borrar datos del sitio"
5. Cierra y reabre el navegador

---

## Verificación: ¿Estás usando realmente v1.0.6?

Agrega esto a tu componente de diagnóstico:

```typescript
useEffect(() => {
  // Verificar versión
  import('@cristianmpx/react-import-sheet-headless/package.json')
    .then((pkg: any) => {
      console.log('🔍 HEADLESS VERSION:', pkg.default?.version || pkg.version);
      if (pkg.default?.version === '1.0.6' || pkg.version === '1.0.6') {
        console.log('✅ Using v1.0.6 (correct)');
      } else {
        console.log('❌ NOT using v1.0.6! Version:', pkg.default?.version || pkg.version);
      }
    })
    .catch((err) => {
      console.log('⚠️ Could not read version:', err.message);
    });
}, []);
```

---

## Si el Error TODAVÍA Persiste

Si después de limpiar TODO el caché el error persiste, entonces hay otro problema. En ese caso:

### Opción A: Usa la versión local (npm link)

#### En el repo del headless (`react-import-sheet-headless`):

```bash
npm link
```

#### En tu consumer (`react-import-sheet-ui-raw`):

```bash
npm link @cristianmpx/react-import-sheet-headless
```

Esto usa la versión local directamente, sin pasar por npm.

### Opción B: Verifica que publicaste correctamente

En el repo del headless, verifica:

```bash
# 1. ¿El dist tiene el fix?
grep -c 'type:"module"' dist/index.js
# Debe ser 0

# 2. ¿La versión es correcta?
cat package.json | grep version
# Debe ser 1.0.6

# 3. ¿Publicaste después de rebuild?
npm pack --dry-run
# Verifica que el tamaño sea correcto (~996 KB)
```

**Si el dist/index.js tiene `type:"module"`:**

- No rebuildeaste antes de publicar
- Necesitas:
  ```bash
  npm run build
  npm publish --access public
  ```

---

## Diagnóstico: ¿Qué versión está en npm?

Descarga el paquete publicado y verifica:

```bash
npm pack @cristianmpx/react-import-sheet-headless@1.0.6
tar -xzf cristianmpx-react-import-sheet-headless-1.0.6.tgz
grep -c 'type:"module"' package/dist/index.js
```

**Debe ser 0.**

**Si es > 0:**

- El paquete publicado NO tiene el fix
- Necesitas rebuildearlo y republicarlo

---

## Resumen

El fix ESTÁ en el código fuente. Si el error persiste, es porque:

1. **Caché del consumer** - Solución: Borra node_modules, caché de npm, caché del bundler
2. **Caché del navegador** - Solución: Hard refresh (Ctrl+Shift+R)
3. **Paquete publicado no tiene el fix** - Solución: Rebuild y republica
4. **npm link o versión local** - Solución: Usa `npm link` para probar localmente

**Haz la "Solución Rápida" de arriba PRIMERO antes de cualquier otra cosa.**

---

## Necesito Saber

Para ayudarte mejor, necesito que me digas:

1. ¿Hiciste `npm run build` ANTES de `npm publish`?
2. ¿Qué muestra `npm list @cristianmpx/react-import-sheet-headless` en tu consumer?
3. ¿Qué muestra `grep -c 'type:"module"' node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js` en tu consumer?

Con esta información podré decirte exactamente cuál es el problema.
