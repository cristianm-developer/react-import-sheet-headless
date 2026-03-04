# Instrucciones de Debug para el User

El paquete publicado en npm v1.0.6 está **correcto** y contiene el fix. El problema está en tu aplicación consumer.

## Verifica que estás usando v1.0.6

En tu proyecto `react-import-sheet-ui-raw`, ejecuta:

```powershell
# 1. Ver la versión en package.json
Get-Content package.json | Select-String "@cristianmpx/react-import-sheet-headless"

# 2. Ver la versión instalada en node_modules
Get-Content node_modules/@cristianmpx/react-import-sheet-headless/package.json | Select-String "version"

# 3. Buscar TODAS las instalaciones del paquete (puede haber duplicados)
Get-ChildItem -Recurse -Filter "package.json" | Where-Object { $_.FullName -like "*react-import-sheet-headless*" } | ForEach-Object { Write-Host $_.FullName; Get-Content $_.FullName | Select-String "version" }
```

## Si la versión es correcta (1.0.6), haz esto:

```powershell
# 1. DETÉN Storybook completamente (Ctrl+C)

# 2. BORRA node_modules COMPLETO
Remove-Item -Recurse -Force node_modules

# 3. BORRA todos los cachés
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force storybook-static -ErrorAction SilentlyContinue

# 4. REINSTALA dependencias
npm install

# 5. VERIFICA que la versión instalada es 1.0.6
Get-Content node_modules/@cristianmpx/react-import-sheet-headless/package.json | Select-String "version"

# 6. VERIFICA que el fix está presente (debe dar 0)
(Get-Content node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js | Select-String -Pattern 'type:"module"').Count

# 7. INICIA Storybook
npm run storybook

# 8. En el navegador: Ctrl+Shift+Delete → Borrar TODO el caché
# 9. Cierra y reabre el navegador
# 10. Vuelve a abrir Storybook
# 11. Prueba de nuevo
```

## Si SIGUE fallando después de esto:

Envíame la salida de:

```powershell
# Versión de Node
node --version

# Versión de npm
npm --version

# Contenido de package.json (las dependencias)
Get-Content package.json | Select-String -Pattern "react-import-sheet-headless" -Context 2,2

# Verificar si hay lockfile
Test-Path package-lock.json
Test-Path npm-shrinkwrap.json
Test-Path yarn.lock
Test-Path pnpm-lock.yaml

# Si hay package-lock.json, ver la versión ahí
Get-Content package-lock.json | Select-String -Pattern "react-import-sheet-headless" -Context 0,5
```

## Teoría del problema:

El paquete v1.0.6 publicado en npm es correcto. El problema es que tu aplicación está usando una versión cacheada del bundle (ya sea en el bundler de Vite/Storybook, en el navegador, o en npm).

La única forma de que el error persista es si:

1. Tu `node_modules` tiene una versión vieja (verifica con los comandos arriba)
2. Tu bundler tiene un caché viejo (borra con los comandos arriba)
3. Tu navegador tiene un caché viejo (borra con Ctrl+Shift+Delete)
4. Hay un lockfile que está forzando una versión vieja (verifica con los comandos arriba)
