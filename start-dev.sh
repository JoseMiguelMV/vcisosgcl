#!/bin/bash

echo "🚀 Iniciando vCISOSGCI en modo desarrollo..."

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
fi

# Generar Prisma Client si es necesario
npx prisma generate

# Crear base de datos si no existe
npm run db:push

# Iniciar ambos servidores
echo "🔄 Iniciando servidor API (puerto 3001) y Frontend (puerto 5173)..."
npm run dev:all
