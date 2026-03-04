# 🚀 Configuración por Framework

> **Nota:** A partir de la versión 1.0.5, la mayoría de esta configuración **ya no es necesaria**. Los Workers ahora se cargan como Blob URLs, por lo que la librería funciona sin configuración adicional en todos los bundlers. Esta guía se mantiene como referencia y para usuarios de versiones anteriores.

---

Esta guía explica cómo configurar tu proyecto React/Next.js/etc. para que los Web Workers de `@cristianmpx/react-import-sheet-headless` funcionen correctamente.

---

## 📋 Índice

- [Vite + React](#vite--react)
- [Next.js](#nextjs)
- [Create React App (CRA)](#create-react-app-cra)
- [Remix](#remix)
- [Storybook](#storybook)
- [Webpack (manual)](#webpack-manual)
- [Verificación](#verificación)

---

## Vite + React

### ⚙️ Configuración Requerida

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // 🔴 CRÍTICO: Excluir el paquete del pre-bundling
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },

  // 🔴 CRÍTICO: Configurar formato de workers
  worker: {
    format: 'es',
    plugins: () => [],
  },
});
```

### 📝 Explicación

- **`optimizeDeps.exclude`**: Evita que Vite pre-bundlee el paquete, lo cual rompe la resolución de workers
- **`worker.format: 'es'`**: Usa módulos ES para workers (requerido por el paquete)

### ✅ Verificación

```bash
npm run dev
# Abre la app y prueba subir un archivo
# Los workers deberían funcionar sin quedarse en "loading"
```

---

## Next.js

### ⚙️ Configuración Requerida

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔴 CRÍTICO: Configurar webpack para workers
  webpack: (config, { isServer }) => {
    // Solo en el cliente (workers no funcionan en SSR)
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      });

      // Configurar resolución de módulos
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },

  // 🔴 CRÍTICO: Deshabilitar SSR para el componente que usa workers
  // (si usas App Router)
  experimental: {
    serverComponentsExternalPackages: ['@cristianmpx/react-import-sheet-headless'],
  },
};

module.exports = nextConfig;
```

### 📦 Dependencias Adicionales

```bash
npm install --save-dev worker-loader
```

### 🎯 Uso en Next.js

#### App Router (Next.js 13+)

```typescript
// app/import/page.tsx
'use client'; // 🔴 CRÍTICO: Debe ser Client Component

import dynamic from 'next/dynamic';

// 🔴 CRÍTICO: Importar con dynamic y ssr: false
const ImporterComponent = dynamic(
  () => import('@/components/Importer'),
  { ssr: false }
);

export default function ImportPage() {
  return <ImporterComponent />;
}
```

#### Pages Router (Next.js 12)

```typescript
// pages/import.tsx
import dynamic from 'next/dynamic';

// 🔴 CRÍTICO: Importar con dynamic y ssr: false
const ImporterComponent = dynamic(
  () => import('@/components/Importer'),
  { ssr: false }
);

export default function ImportPage() {
  return <ImporterComponent />;
}
```

### ⚠️ Importante para Next.js

**Los Web Workers NO funcionan en SSR.** Siempre debes:

1. Usar `'use client'` (App Router)
2. Importar con `dynamic` y `ssr: false`
3. Configurar webpack para workers

---

## Create React App (CRA)

### ⚙️ Configuración

CRA **no requiere configuración adicional** para workers básicos, pero si tienes problemas:

#### Opción 1: Usar CRACO (recomendado)

```bash
npm install --save-dev @craco/craco
```

```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Configurar workers
      webpackConfig.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      });

      return webpackConfig;
    },
  },
};
```

```json
// package.json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test"
  }
}
```

#### Opción 2: Eject (no recomendado)

```bash
npm run eject
# Luego edita config/webpack.config.js manualmente
```

### ✅ Verificación

```bash
npm start
# Los workers deberían funcionar sin configuración adicional
```

---

## Remix

### ⚙️ Configuración Requerida

```javascript
// remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // 🔴 CRÍTICO: Configurar para cliente
  serverDependenciesToBundle: [/^@cristianmpx\/react-import-sheet-headless/],

  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
```

### 🎯 Uso en Remix

```typescript
// app/routes/import.tsx
import { ClientOnly } from 'remix-utils/client-only';

export default function ImportRoute() {
  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      {() => <ImporterComponent />}
    </ClientOnly>
  );
}
```

---

## Storybook

### ⚙️ Configuración Requerida

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // 🔴 CRÍTICO: Configurar Vite para workers
  async viteFinal(config) {
    // Excluir del pre-bundling
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [
        ...(config.optimizeDeps?.exclude || []),
        '@cristianmpx/react-import-sheet-headless',
      ],
    };

    // Configurar workers
    config.worker = {
      format: 'es',
      plugins: () => [],
    };

    return config;
  },
};

export default config;
```

### ✅ Verificación

```bash
npm run storybook
# Los workers deberían funcionar en las stories
```

---

## Webpack (manual)

Si usas Webpack directamente (sin framework):

### ⚙️ Configuración Requerida

```javascript
// webpack.config.js
module.exports = {
  // ... resto de configuración

  module: {
    rules: [
      // 🔴 CRÍTICO: Configurar worker-loader
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
      // ... otras reglas
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
};
```

### 📦 Dependencias

```bash
npm install --save-dev worker-loader
```

---

## Verificación

### 🧪 Test Rápido

Después de configurar tu framework, verifica que funcione:

```typescript
import { ImporterProvider, useImporter, useImporterStatus } from '@cristianmpx/react-import-sheet-headless';

function TestComponent() {
  const { processFile } = useImporter({ layout: myLayout });
  const { status } = useImporterStatus();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFile} accept=".csv" />
      <p>Status: {status}</p>
      {/* Si status progresa de "idle" → "loading" → "parsing" → "success", ¡funciona! */}
    </div>
  );
}

export default function App() {
  return (
    <ImporterProvider>
      <TestComponent />
    </ImporterProvider>
  );
}
```

### ✅ Señales de que funciona:

1. ✅ Status cambia de `idle` → `loading` → `parsing` → `success`
2. ✅ No hay errores en la consola del navegador
3. ✅ No hay errores 404 en la pestaña Network
4. ✅ Los archivos `.worker.js` se cargan correctamente

### ❌ Señales de problemas:

1. ❌ Status se queda en `loading` forever
2. ❌ Error: "Failed to load worker script"
3. ❌ 404 en archivos `.worker.js`
4. ❌ Error de CORS

---

## 🔍 Diagnóstico por Framework

### Vite

```bash
# Verificar configuración
cat vite.config.ts | grep -A 5 "optimizeDeps"

# Debería mostrar:
# optimizeDeps: {
#   exclude: ['@cristianmpx/react-import-sheet-headless'],
# },
```

### Next.js

```bash
# Verificar que worker-loader esté instalado
npm list worker-loader

# Verificar configuración
cat next.config.js | grep -A 10 "webpack"
```

### Storybook

```bash
# Verificar configuración
cat .storybook/main.ts | grep -A 10 "viteFinal"
```

---

## 📚 Recursos Adicionales

- [Vite Worker Documentation](https://vitejs.dev/guide/features.html#web-workers)
- [Next.js Custom Webpack Config](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)
- [Storybook Vite Builder](https://storybook.js.org/docs/react/builders/vite)

---

## 🆘 Troubleshooting

Si después de configurar sigues teniendo problemas:

1. **Ejecuta el diagnóstico:**

   ```bash
   npm run diagnose
   ```

2. **Usa el HTML diagnostic:**

   ```bash
   cp node_modules/@cristianmpx/react-import-sheet-headless/test-worker-diagnostic.html ./public/
   # Abre http://localhost:3000/test-worker-diagnostic.html
   ```

3. **Revisa la guía completa:**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - [TESTING-GUIDE.md](./TESTING-GUIDE.md)

---

## 📝 Checklist de Configuración

- [ ] Framework identificado (Vite/Next.js/CRA/etc.)
- [ ] Configuración aplicada según framework
- [ ] Dependencias instaladas (si se requieren)
- [ ] Workers excluidos del pre-bundling (Vite/Storybook)
- [ ] SSR deshabilitado para el componente (Next.js/Remix)
- [ ] Test realizado con archivo CSV
- [ ] Status progresa correctamente
- [ ] No hay errores en consola
- [ ] No hay errores 404 en Network

---

**Última actualización:** 2026-03-04
