# 🚀 Quick Start por Framework

Guía rápida para empezar con `@cristianmpx/react-import-sheet-headless` en diferentes frameworks.

---

## 📦 Instalación Base (todos los frameworks)

```bash
npm install @cristianmpx/react-import-sheet-headless
```

---

## Vite + React

### 1. Instalar

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm install @cristianmpx/react-import-sheet-headless
```

### 2. Configurar

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },
  worker: {
    format: 'es',
  },
});
```

### 3. Usar

```typescript
// src/App.tsx
import { ImporterProvider, useImporter, useImporterStatus, useSheetData } from '@cristianmpx/react-import-sheet-headless';

const layout = {
  name: 'users',
  version: 1,
  fields: {
    name: { label: 'Name', required: true },
    email: { label: 'Email', required: true },
  },
};

function ImporterComponent() {
  const { processFile } = useImporter({ layout });
  const { status } = useImporterStatus();
  const { sheet } = useSheetData();

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
      <p>Status: {status}</p>
      {sheet && <p>Rows: {sheet.rows.length}</p>}
    </div>
  );
}

export default function App() {
  return (
    <ImporterProvider>
      <ImporterComponent />
    </ImporterProvider>
  );
}
```

### 4. Ejecutar

```bash
npm run dev
```

---

## Next.js

### 1. Instalar

```bash
npx create-next-app@latest my-app --typescript
cd my-app
npm install @cristianmpx/react-import-sheet-headless
npm install --save-dev worker-loader
```

### 2. Configurar

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      });
    }
    return config;
  },
};

module.exports = nextConfig;
```

### 3. Crear Componente (Client-side)

```typescript
// components/Importer.tsx
'use client';

import { ImporterProvider, useImporter, useImporterStatus, useSheetData } from '@cristianmpx/react-import-sheet-headless';

const layout = {
  name: 'users',
  version: 1,
  fields: {
    name: { label: 'Name', required: true },
    email: { label: 'Email', required: true },
  },
};

function ImporterComponent() {
  const { processFile } = useImporter({ layout });
  const { status } = useImporterStatus();
  const { sheet } = useSheetData();

  return (
    <div className="p-4">
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
        className="mb-4"
      />
      <p>Status: {status}</p>
      {sheet && <p>Rows: {sheet.rows.length}</p>}
    </div>
  );
}

export default function Importer() {
  return (
    <ImporterProvider>
      <ImporterComponent />
    </ImporterProvider>
  );
}
```

### 4. Usar en Página (con dynamic import)

```typescript
// app/import/page.tsx (App Router)
import dynamic from 'next/dynamic';

const Importer = dynamic(() => import('@/components/Importer'), {
  ssr: false,
  loading: () => <p>Loading importer...</p>,
});

export default function ImportPage() {
  return (
    <main>
      <h1>Import Data</h1>
      <Importer />
    </main>
  );
}
```

### 5. Ejecutar

```bash
npm run dev
```

---

## Create React App

### 1. Instalar

```bash
npx create-react-app my-app --template typescript
cd my-app
npm install @cristianmpx/react-import-sheet-headless
```

### 2. Usar (sin configuración adicional)

```typescript
// src/App.tsx
import { ImporterProvider, useImporter, useImporterStatus, useSheetData } from '@cristianmpx/react-import-sheet-headless';

const layout = {
  name: 'users',
  version: 1,
  fields: {
    name: { label: 'Name', required: true },
    email: { label: 'Email', required: true },
  },
};

function ImporterComponent() {
  const { processFile } = useImporter({ layout });
  const { status } = useImporterStatus();
  const { sheet } = useSheetData();

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
      <p>Status: {status}</p>
      {sheet && <p>Rows: {sheet.rows.length}</p>}
    </div>
  );
}

export default function App() {
  return (
    <ImporterProvider>
      <ImporterComponent />
    </ImporterProvider>
  );
}
```

### 3. Ejecutar

```bash
npm start
```

**Nota:** CRA funciona sin configuración adicional en la mayoría de los casos.

---

## Storybook

### 1. Instalar Storybook

```bash
npx storybook@latest init
npm install @cristianmpx/react-import-sheet-headless
```

### 2. Configurar

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

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
    };
    return config;
  },
};

export default config;
```

### 3. Crear Story

```typescript
// src/components/Importer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider, useImporter, useImporterStatus, useSheetData } from '@cristianmpx/react-import-sheet-headless';

const layout = {
  name: 'users',
  version: 1,
  fields: {
    name: { label: 'Name', required: true },
    email: { label: 'Email', required: true },
  },
};

function ImporterComponent() {
  const { processFile } = useImporter({ layout });
  const { status } = useImporterStatus();
  const { sheet } = useSheetData();

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
      <p>Status: {status}</p>
      {sheet && <p>Rows: {sheet.rows.length}</p>}
    </div>
  );
}

function Importer() {
  return (
    <ImporterProvider>
      <ImporterComponent />
    </ImporterProvider>
  );
}

const meta: Meta<typeof Importer> = {
  title: 'Components/Importer',
  component: Importer,
};

export default meta;
type Story = StoryObj<typeof Importer>;

export const Default: Story = {};
```

### 4. Ejecutar

```bash
npm run storybook
```

---

## 🧪 Verificar que Funciona

En todos los frameworks, después de subir un archivo CSV, deberías ver:

1. ✅ Status cambia: `idle` → `loading` → `parsing` → `success`
2. ✅ No hay errores en la consola
3. ✅ El número de filas aparece

### ❌ Si no funciona:

1. Revisa la configuración del framework en [FRAMEWORK-SETUP.md](./FRAMEWORK-SETUP.md)
2. Ejecuta el diagnóstico:
   ```bash
   npm run diagnose
   ```
3. Consulta [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Siguiente Paso

Una vez que funcione el ejemplo básico:

1. **Define tu layout:** [docs/how-to-layout.md](./docs/how-to-layout.md)
2. **Agrega validadores:** [docs/how-to-validators.md](./docs/how-to-validators.md)
3. **Personaliza la UI:** [docs/how-to.md](./docs/how-to.md)

---

## 🆘 Ayuda

- [FRAMEWORK-SETUP.md](./FRAMEWORK-SETUP.md) - Configuración detallada
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de problemas
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Guía de testing

---

**Última actualización:** 2026-03-04
