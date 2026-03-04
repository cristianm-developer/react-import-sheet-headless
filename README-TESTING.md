# 🧪 Cómo Testear el Issue de Workers

Este documento resume cómo usar las herramientas de diagnóstico para el issue de workers que no responden en v1.0.1.

---

## 🚀 Quick Start

### 1. Verificar el Paquete Local (Antes de Publicar)

```bash
npm run build
npm run verify
```

✅ **Resultado esperado:** "All checks passed! Package is ready to publish."

---

### 2. Verificar Instalación (Después de Instalar desde npm)

```bash
# En tu proyecto que usa el paquete
npm run diagnose

# O directamente:
node node_modules/@cristianmpx/react-import-sheet-headless/scripts/diagnose-installation.js
```

✅ **Resultado esperado:** "Installation looks good!"

---

### 3. Test Unitario de Worker URLs

```bash
npm test src/core/parser/worker/worker-url.test.ts
```

✅ **Resultado esperado:** 12 tests passed

---

### 4. Test en Navegador (HTML Diagnostic)

```bash
# 1. Copia el archivo
cp test-worker-diagnostic.html /tu/proyecto/public/

# 2. Sirve con un servidor
npx serve .

# 3. Abre en navegador
# http://localhost:3000/test-worker-diagnostic.html
```

Ejecuta los 5 tests disponibles y revisa los resultados.

---

## 📋 Herramientas Disponibles

| Herramienta               | Archivo                                     | Propósito                                                  |
| ------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| **Verify Package**        | `scripts/verify-package.js`                 | Verifica que el paquete esté correctamente construido      |
| **Diagnose Installation** | `scripts/diagnose-installation.js`          | Verifica que el paquete instalado tenga todos los archivos |
| **Worker URL Test**       | `src/core/parser/worker/worker-url.test.ts` | Test unitario de resolución de URLs                        |
| **HTML Diagnostic**       | `test-worker-diagnostic.html`               | Test interactivo en navegador                              |
| **Troubleshooting Guide** | `TROUBLESHOOTING.md`                        | Guía completa de solución de problemas                     |
| **Testing Guide**         | `TESTING-GUIDE.md`                          | Guía detallada de testing                                  |

---

## 🔍 Diagnóstico Rápido

### Si los workers se quedan en "loading" forever:

1. **Verifica que los workers existan:**

   ```bash
   ls -la node_modules/@cristianmpx/react-import-sheet-headless/dist/*.worker.js
   ```

2. **Verifica la configuración de Vite:**

   ```typescript
   // vite.config.ts o .storybook/main.ts
   export default defineConfig({
     optimizeDeps: {
       exclude: ['@cristianmpx/react-import-sheet-headless'],
     },
     worker: {
       format: 'es',
     },
   });
   ```

3. **Revisa la consola del navegador:**
   - ¿Hay errores de worker?
   - ¿Hay errores 404?
   - ¿Hay errores CORS?

4. **Revisa la pestaña Network:**
   - Filtra por "worker"
   - ¿Los archivos `.worker.js` se cargan?
   - ¿Qué status code tienen?

---

## 📊 Checklist de Diagnóstico

- [ ] `npm run verify` pasa ✅
- [ ] Todos los workers están en `dist/` ✅
- [ ] `npm run diagnose` pasa ✅
- [ ] Test unitario pasa ✅
- [ ] HTML diagnostic pasa ✅
- [ ] Vite configurado correctamente ✅
- [ ] No hay errores en consola ✅
- [ ] No hay errores 404 en Network ✅

---

## 🐛 Problemas Comunes

### Problema: Workers no están en el paquete

**Solución:** Reportar al mantenedor. Es un issue de empaquetado.

### Problema: Vite pre-bundlea el paquete

**Solución:** Agregar a `optimizeDeps.exclude`

### Problema: 404 en workers

**Solución:** Verificar configuración del bundler

---

## 📚 Documentación Completa

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guía completa de troubleshooting
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Guía detallada de testing
- [Architecture.md](./docs/Architecture.md) - Documentación de arquitectura

---

## 🎯 Resultado Esperado

Después de ejecutar todas las herramientas, deberías poder:

1. ✅ Confirmar que el paquete está correctamente construido
2. ✅ Confirmar que los workers están presentes
3. ✅ Identificar si el problema es de empaquetado o configuración
4. ✅ Probar en diferentes entornos
5. ✅ Reportar el issue con información completa

---

## 💡 Tip

Si todos los tests pasan pero el issue persiste en Storybook:

1. Revisa `.storybook/main.ts`
2. Agrega el paquete a `optimizeDeps.exclude`
3. Configura `worker.format = 'es'`
4. Reinicia Storybook

---

## 📞 Reportar Issue

Si el problema persiste, reporta con:

- Output de `npm run verify`
- Output de `npm run diagnose`
- Screenshot de HTML diagnostic
- Errores de consola del navegador
- Tu configuración de Vite/Webpack

---

**Última actualización:** 2026-03-04
