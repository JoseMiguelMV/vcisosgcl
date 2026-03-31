# Sesión de desarrollo - vcisosgci

## Estado: Completado - Aplicativo corriendo en local

## Contexto del proyecto
- Aplicación fullstack (React + Express + Prisma + PostgreSQL)
- Modo multi-tenant con Companies
- Schema en `server/prisma/schema.prisma`

## Configuración actual
- Database URL: `postgresql://vciso_admin:password123@localhost:5433/sgcs_db`
- Puerto servidor: 3000
- Puerto frontend (Vite): 5173

## Tareas completadas
1. [x] Configurar PostgreSQL local (ya estaba configurado)
2. [x] Ejecutar migraciones de Prisma (ya estaban en sync)
3. [x] Iniciar servidor Express (corriendo en puerto 3000)
4. [x] Iniciar frontend Vite (corriendo en puerto 5173)

## Cómo continuar en futuras sesiones
1. Abrir terminal en la raíz del proyecto
2. Iniciar servidor: `cd server && npx ts-node index.ts`
3. Iniciar frontend: `npm run dev`
4. Acceder a http://localhost:5173

## Notas adicionales
- El servidor Express usa Prisma con PostgreSQL en puerto 5433
- El frontend Vite está en el directorio raíz del proyecto
- Existe un archivo `.git/opencode` que parece contener un hash de sesión