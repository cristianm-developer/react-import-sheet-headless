# 📊 Comparación de Configuración por Framework

Tabla rápida de referencia para configurar `@cristianmpx/react-import-sheet-headless` en diferentes frameworks.

---

## 🎯 Resumen Ejecutivo

| Framework            | Configuración Requerida | Complejidad | Notas                                      |
| -------------------- | ----------------------- | ----------- | ------------------------------------------ |
| **Vite + React**     | ✅ Sí (simple)          | 🟢 Baja     | 2 líneas en `vite.config.ts`               |
| **Next.js**          | ✅ Sí (moderada)        | 🟡 Media    | Webpack config + dynamic import            |
| **Create React App** | ⚠️ Opcional             | 🟢 Baja     | Funciona sin config en la mayoría de casos |
| **Remix**            | ✅ Sí (simple)          | 🟢 Baja     | Config + ClientOnly wrapper                |
| **Storybook**        | ✅ Sí (simple)          | 🟢 Baja     | Similar a Vite                             |
| **Webpack (manual)** | ✅ Sí (compleja)        | 🔴 Alta     | Requiere worker-loader                     |

---

## 📋 Configuración Detallada

### Vite + React

| Aspecto                | Detalle          |
| ---------------------- | ---------------- |
| **Archivo de config**  | `vite.config.ts` |
| **Líneas de código**   | ~5 líneas        |
| **Dependencias extra** | ❌ Ninguna       |
| **Dificultad**         | 🟢 Muy fácil     |

```typescript
// vite.config.ts
optimizeDeps: { exclude: ['@cristianmpx/react-import-sheet-headless'] },
worker: { format: 'es' },
```

**Por qué es necesario:**

- Vite pre-bundlea dependencias por defecto
- El pre-bundling rompe la resolución de workers
- `exclude` evita el pre-bundling
- `worker.format: 'es'` usa módulos ES (requerido)

---

### Next.js

| Aspecto                | Detalle            |
| ---------------------- | ------------------ |
| **Archivo de config**  | `next.config.js`   |
| **Líneas de código**   | ~15 líneas         |
| **Dependencias extra** | ✅ `worker-loader` |
| **Dificultad**         | 🟡 Media           |

```javascript
// next.config.js
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });
  }
  return config;
},
```

**Uso obligatorio:**

```typescript
// Siempre usar dynamic import con ssr: false
const Importer = dynamic(() => import('./Importer'), { ssr: false });
```

**Por qué es necesario:**

- Next.js hace SSR por defecto
- Workers NO funcionan en SSR (solo en el navegador)
- `worker-loader` maneja la carga de workers
- `dynamic` con `ssr: false` evita SSR del componente

---

### Create React App (CRA)

| Aspecto                | Detalle                       |
| ---------------------- | ----------------------------- |
| **Archivo de config**  | Ninguno (o `craco.config.js`) |
| **Líneas de código**   | 0 (o ~10 con CRACO)           |
| **Dependencias extra** | ⚠️ `@craco/craco` (opcional)  |
| **Dificultad**         | 🟢 Muy fácil                  |

**Sin configuración:**

```typescript
// Funciona directamente en la mayoría de casos
import { ImporterProvider } from '@cristianmpx/react-import-sheet-headless';
```

**Con CRACO (si hay problemas):**

```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (config) => {
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      });
      return config;
    },
  },
};
```

**Por qué funciona sin config:**

- CRA ya tiene soporte básico para workers
- Webpack está pre-configurado para módulos ES

---

### Remix

| Aspecto                | Detalle           |
| ---------------------- | ----------------- |
| **Archivo de config**  | `remix.config.js` |
| **Líneas de código**   | ~5 líneas         |
| **Dependencias extra** | ✅ `remix-utils`  |
| **Dificultad**         | 🟢 Fácil          |

```javascript
// remix.config.js
serverDependenciesToBundle: [
  /^@cristianmpx\/react-import-sheet-headless/,
],
```

**Uso obligatorio:**

```typescript
// Siempre usar ClientOnly
import { ClientOnly } from 'remix-utils/client-only';

<ClientOnly fallback={<div>Loading...</div>}>
  {() => <ImporterComponent />}
</ClientOnly>
```

**Por qué es necesario:**

- Remix hace SSR por defecto
- Workers solo funcionan en el cliente
- `ClientOnly` renderiza solo en el navegador

---

### Storybook

| Aspecto                | Detalle              |
| ---------------------- | -------------------- |
| **Archivo de config**  | `.storybook/main.ts` |
| **Líneas de código**   | ~10 líneas           |
| **Dependencias extra** | ❌ Ninguna           |
| **Dificultad**         | 🟢 Fácil             |

```typescript
// .storybook/main.ts
async viteFinal(config) {
  config.optimizeDeps = {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  };
  config.worker = { format: 'es' };
  return config;
}
```

**Por qué es necesario:**

- Storybook usa Vite (o Webpack)
- Misma razón que Vite: evitar pre-bundling

---

### Webpack (manual)

| Aspecto                | Detalle             |
| ---------------------- | ------------------- |
| **Archivo de config**  | `webpack.config.js` |
| **Líneas de código**   | ~10 líneas          |
| **Dependencias extra** | ✅ `worker-loader`  |
| **Dificultad**         | 🔴 Compleja         |

```javascript
// webpack.config.js
module: {
  rules: [
    {
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    },
  ],
},
```

**Por qué es necesario:**

- Webpack no maneja workers automáticamente
- `worker-loader` transforma imports de workers

---

## 🎯 Decisión Rápida

### ¿Qué framework elegir si empiezas de cero?

| Framework        | Recomendado para            | Configuración                     |
| ---------------- | --------------------------- | --------------------------------- |
| **Vite + React** | ✅ Proyectos nuevos, SPAs   | Muy simple                        |
| **Next.js**      | ✅ Apps con SEO, SSR        | Moderada                          |
| **CRA**          | ⚠️ Proyectos legacy         | Simple (pero CRA está deprecated) |
| **Remix**        | ✅ Apps full-stack modernas | Simple                            |

---

## 🔍 Matriz de Problemas Comunes

| Problema              | Vite                   | Next.js           | CRA             | Remix                        | Storybook             |
| --------------------- | ---------------------- | ----------------- | --------------- | ---------------------------- | --------------------- |
| Workers no cargan     | `optimizeDeps.exclude` | `worker-loader`   | CRACO           | `ClientOnly`                 | `viteFinal`           |
| Se queda en "loading" | `worker.format: 'es'`  | `ssr: false`      | -               | `serverDependenciesToBundle` | `worker.format: 'es'` |
| Error 404 en workers  | Verificar build        | Verificar webpack | Verificar build | Verificar config             | Verificar viteFinal   |
| SSR errors            | N/A                    | `dynamic` import  | N/A             | `ClientOnly`                 | N/A                   |

---

## 📊 Comparación de Rendimiento

| Framework   | Tiempo de build | Hot reload     | Tamaño bundle | Experiencia dev |
| ----------- | --------------- | -------------- | ------------- | --------------- |
| **Vite**    | 🟢 Muy rápido   | 🟢 Instantáneo | 🟢 Pequeño    | ⭐⭐⭐⭐⭐      |
| **Next.js** | 🟡 Moderado     | 🟡 Rápido      | 🟡 Medio      | ⭐⭐⭐⭐        |
| **CRA**     | 🔴 Lento        | 🔴 Lento       | 🔴 Grande     | ⭐⭐            |
| **Remix**   | 🟢 Rápido       | 🟢 Rápido      | 🟢 Pequeño    | ⭐⭐⭐⭐⭐      |

---

## 🆘 Troubleshooting por Framework

### Vite: "Workers no cargan"

```typescript
// ✅ Correcto
optimizeDeps: {
  exclude: ['@cristianmpx/react-import-sheet-headless'],
},

// ❌ Incorrecto (falta exclude)
optimizeDeps: {
  include: ['other-package'],
},
```

### Next.js: "window is not defined"

```typescript
// ✅ Correcto
const Importer = dynamic(() => import('./Importer'), { ssr: false });

// ❌ Incorrecto (SSR habilitado)
import Importer from './Importer';
```

### CRA: "Module not found"

```bash
# ✅ Solución
npm install --save-dev @craco/craco
# Luego crear craco.config.js
```

### Remix: "ReferenceError: Worker is not defined"

```typescript
// ✅ Correcto
<ClientOnly>
  {() => <Importer />}
</ClientOnly>

// ❌ Incorrecto (sin ClientOnly)
<Importer />
```

---

## 📚 Recursos por Framework

| Framework     | Documentación                                                   | Ejemplo                                                                   |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Vite**      | [FRAMEWORK-SETUP.md](./FRAMEWORK-SETUP.md#vite--react)          | [QUICK-START-FRAMEWORKS.md](./QUICK-START-FRAMEWORKS.md#vite--react)      |
| **Next.js**   | [FRAMEWORK-SETUP.md](./FRAMEWORK-SETUP.md#nextjs)               | [QUICK-START-FRAMEWORKS.md](./QUICK-START-FRAMEWORKS.md#nextjs)           |
| **CRA**       | [FRAMEWORK-SETUP.md](./FRAMEWORK-SETUP.md#create-react-app-cra) | [QUICK-START-FRAMEWORKS.md](./QUICK-START-FRAMEWORKS.md#create-react-app) |
| **Remix**     | [FRAMEWORK-SETUP.md](./FRAMEWORK-SETUP.md#remix)                | -                                                                         |
| **Storybook** | [FRAMEWORK-SETUP.md](./FRAMEWORK-SETUP.md#storybook)            | [QUICK-START-FRAMEWORKS.md](./QUICK-START-FRAMEWORKS.md#storybook)        |

---

## ✅ Checklist de Verificación

Después de configurar tu framework, verifica:

- [ ] Archivo de configuración creado
- [ ] Dependencias extra instaladas (si se requieren)
- [ ] Build exitoso sin errores
- [ ] Workers cargan correctamente (no 404)
- [ ] Status progresa: `idle` → `loading` → `success`
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings de SSR (Next.js/Remix)

---

**Última actualización:** 2026-03-04
