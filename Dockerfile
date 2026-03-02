# [ES] Usar una imagen de Node.js oficial y ligera
# [EN] Use official lightweight Node.js image
FROM node:20-slim

# [ES] Directorio de trabajo dentro del contenedor
# [EN] Working directory inside the container
WORKDIR /app

# [ES] Copiar los archivos de gestión de dependencias
# [EN] Copy the dependency management files
COPY package*.json ./

# [ES] Instalar las librerías necesarias (solo las de producción)
# [EN] Install necessary libraries (production only)
RUN npm install --production

# [ES] Copiar el resto del código del proyecto
# [EN] Copy the rest of the project code
COPY . .

# [ES] Crear la carpeta 'data' para asegurar que SQLite pueda escribir
# [EN] Create the 0data' folder to ensure that SQLite can write
RUN mkdir -p data

# [ES] Puerto por el que escucha la aplicación
# [EN] Port the application listens on
EXPOSE 3000

# [ES] Comando para arrancar el servidor
# [EN] Command to start the server
CMD ["npm", "start"]