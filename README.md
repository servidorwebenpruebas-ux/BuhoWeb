# [ES] BuhoWeb - Sistema de monitorización de sitios web | [EN] BuhoWeb - Web asset monitoring system

### [ES] Descripción

BuhoWeb es una herramienta profesional de vigilancia diseñada para monitorizar la disponibilidad de servicios web en tiempo real. Este proyecto constituye el Trabajo de Fin de Grado (TFG) de Desarrollo de Aplicaciones Web (DAW).

### [EN] Description

BuhoWeb is a professional surveillance tool designed to monitor the availability of web services in real time. This project constitutes the Final Degree Project for Web Applications Development.

---

## [ES] Funcionalidades del sistema

- **Gestión de Identidad**: Registro seguro, verificación por código y bloqueo de cuenta por seguridad.
- **Vigilancia SRE**: Motor asíncrono que distingue entre fallos de red y errores de aplicación.
- **Telemetría Avanzada**: Historial de 150 registros por activo con gráficas de latencia en tiempo real.
- **Informes de Auditoría**: Generación de reportes CSV con diagnósticos técnicos detallados.
- **Alertas SMTP**: Envío de correos electrónicos automáticos ante caídas de servicio.

## [EN] System features

- **Identity Management**: Secure registration, code verification, and account lockout for security.
- **SRE Monitoring**: Asynchronous engine that distinguishes between network failures and app errors.
- **Advanced Telemetry**: 150-record history per asset with real-time latency graphs.
- **Audit Reports**: CSV report generation with detailed technical diagnostics.
- **SMTP Alerts**: Automatic email notifications during service outages.

---

## [ES] Stack tecnológico | [EN] Tech Stack

- **Backend**: Node.js & Express.js.
- **Security**: Helmet (HTTP Header protection), CORS, JWT, Bcrypt.
- **Database**: SQLite3.
- **Frontend**: HTML5, Modern JavaScript (ES6+), Tailwind CSS.
- **Visuals**: Chart.js.
- **DevOps**: Docker, Docker Compose.

---

## [ES] Despliegue e Instalación /

Esta es la opción más sencilla y robusta, ya que empaqueta todo lo necesario (servidor, base de datos y motor de monitorización) en contenedores aislados:

1. Asegurarse de tener Docker y Docker Compose instalados en el sistema.
2. Ejecutar el comando `docker-compose up --build -d` en la raíz del proyecto. Este comando construirá las imágenes y levantará los servicios en segundo plano.
3. El sistema de SRE Smart Monitoring comenzará a funcionar de forma asíncrona automáticamente.
4. Acceder a la aplicación a través de la dirección: `http://localhost:3000`

## [EN] Deployment & Installation

This is the easiest and most robust option, as it packages everything needed (server, database, and monitoring engine) into isolated containers:

1. Ensure Docker and Docker Compose are installed on your system.
2. Run the command `docker-compose up --build -d` in the project root. This command will build the images and start the services in the background.
3. The SRE Smart Monitoring system will start running asynchronously automatically.
4. Access the application via: `http://localhost:3000`

---

## [ES] Guía de ejecución en Local

Para poner en marcha el proyecto en un entorno de desarrollo, se deben seguir estos pasos:

1. Clonar el repositorio en el equipo local.
2. Acceder a la carpeta del proyecto y ejecutar el comando `npm install` para descargar las dependencias.
3. Crear un archivo `.env` en la raíz con las variables de configuración (ver archivo `.env.example`).
4. Iniciar el servidor mediante el comando `npm start`.
5. Acceder a la dirección `http://localhost:3000` desde cualquier navegador web.

## [EN] Local Execution Guide

To launch the project in a development environment, the following steps must be followed:

1. Clone the repository to the local machine.
2. Access the project folder and run the command `npm install` to download the dependencies. Access the project folder and run the command `npm install` to download the dependencies.
3. Create a `.env` file in the root with the configuration variables (see `.env.example` file). Create a `.env` file in the root with the configuration variables (see `.env.example` file).
4. Start the server using the command `npm start`. Start the server using the command `npm start`.
5. Access the address ``http://localhost:3000` from any web browser.

---

## [ES] Resolución de Problemas

Si el puerto 3000 ya está siendo utilizado por otra aplicación, el despliegue fallará. Seguir estos pasos para redirigir el servicio al puerto 3001:

1. Editar configuración: Abre el archivo docker-compose.yml en tu editor de código.
2. Modificar mapeo de puertos: Localiza la sección ports y cambia 3000:3000 por 3001:3000.
   Nota: Esto vincula el puerto físico 3001 de tu máquina al puerto 3000 interno del contenedor.
3. Reiniciar contenedores: Guarda el archivo y ejecuta `docker-compose up --build -d` para aplicar los cambios.
4. Acceso alternativo: Una vez reiniciado, accede a la aplicación a través de: `http://localhost:3001`.

## [EN] Troubleshooting

If port 3000 is already in use by another application, the deployment will fail. Follow these steps to redirect the service to port 3001:

1. Edit configuration: Open the docker-compose.yml file in your code editor.
2. Modify port mapping: Locate the ports section and change 3000:3000 to 3001:3000.
   Note: This binds physical port 3001 on your machine to the internal port 3000 of the container.
3. Restart containers: Save the file and run `docker-compose up --build -d` to apply the changes.
4. Alternative access: Once restarted, access the application via:`http://localhost:3001`.

---

## [ES] Verificación de Logs (Monitorización Inteligente SRE)

Para comprobar que el motor de vigilancia está funcionando y observar cómo clasifica los errores en tiempo real, se recomienda utilizar los registros de Docker:

1. Ver logs en tiempo real: Ejecuta `docker logs -f [nombre_del_contenedor]` para ver la actividad actual.
2. Filtrar errores: Busca etiquetas como `[INFRA]` o `[APP]` en la consola para identificar el origen de cualquier incidencia detectada por el motor.
3. Salir de la vista: Pulsa `Ctrl + C` para detener la visualización de registros sin apagar el servicio.

## [EN] Log Verification (SRE Smart Monitoring)

To verify that the monitoring engine is running and observe how it classifies errors in real time, use the Docker logs:

1. View logs in real time: Run `docker logs -f [container_name]` to watch the current activity.
2. Filter errors: Look for tags like `[INFRA]` or `[APP]` in the console to identify the source of any incident detected by the engine.
3. Exit view: Press `Ctrl + C` to stop viewing the logs without shutting down the service.

---

[ES] Documentación técnica del proyecto de TFG de DAW - Autor: José Alberto Moreno González.

[EN] Technical documentation of the DAW TFG project - Author: José Alberto Moreno González.
