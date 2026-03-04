# SOLUCIÓN: Problema con Vite optimizeDeps

## El Problema Real

El error `"t.load is not a function"` NO es un bug del headless library. Es un problema de **Vite optimizeDeps**.

Cuando Vite pre-bundlea las dependencias (optimizeDeps), está **rompiendo el worker code** que usa Blob URLs. Esto es un problema conocido de Vite con librerías que usan Web Workers.

## La Solución

En tu proyecto `react-import-sheet-ui-raw`, necesitas **excluir el headless library de la optimización de Vite**.

### Opción 1: Excluir de optimizeDeps (RECOMENDADO)

Crea o edita `vite.config.ts` en el root de tu proyecto:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },
});
```

### Opción 2: Si estás usando Storybook

Edita `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // ... tu config existente ...

  async viteFinal(config) {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        exclude: [
          ...(config.optimizeDeps?.exclude || []),
          '@cristianmpx/react-import-sheet-headless',
        ],
      },
    };
  },
};

export default config;
```

## Después de aplicar la solución:

```powershell
# 1. Borra el caché de Vite
Remove-Item -Recurse -Force node_modules\.vite
Remove-Item -Recurse -Force .vite

# 2. Reinicia Storybook
npm run storybook

# 3. Hard refresh en el navegador (Ctrl+Shift+R)
```

## ¿Por qué funciona esto?

Cuando excluyes el paquete de `optimizeDeps`, Vite NO pre-bundlea el headless library. Esto significa que:

1. El código del headless library se sirve **tal cual** desde `node_modules`
2. Los Blob URLs se crean correctamente
3. Los workers se cargan correctamente
4. Comlink funciona correctamente

## Referencias

- [Vite Issue #21422: Importing worker from a vite library fails](https://github.com/vitejs/vite/issues/21422)
- [Vite Docs: optimizeDeps.exclude](https://vitejs.dev/config/dep-optimization-options.html#optimizedeps-exclude)

---

## Si SIGUE fallando después de esto:

Entonces el problema es otro. Envíame:

1. Tu `vite.config.ts` completo
2. Tu `.storybook/main.ts` completo
3. Los logs completos de la consola del navegador (F12 → Console)
4. Los logs de Storybook cuando inicia
