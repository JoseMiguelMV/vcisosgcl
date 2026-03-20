# Etapa 1: Construcción (Build)
FROM node:20-alpine as builder

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos las librerías 
RUN npm install

# Copiamos el resto del código y creamos el empaquetado final de React/Vite
COPY . .
RUN npm run build

# Etapa 2: Servidor Web Liviano (Nginx) para Producción
FROM nginx:alpine

# Removemos conf default de Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Agregamos configuración de seguridad (ISO27001) para routing SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos empaquetados desde la Etapa 1 a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto local
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
