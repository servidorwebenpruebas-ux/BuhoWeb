# [ES] BuhoWeb - Sistema de monitorización de sitios web | [EN] BuhoWeb - Web asset monitoring system

### [ES] Descripción

BuhoWeb es una herramienta profesional de vigilancia diseñada para monitorizar la disponibilidad de servicios web en tiempo real. Este proyecto constituye el Trabajo de Fin de Grado (TFG) de Desarrollo de Aplicaciones Web (DAW).

### [EN] Description

BuhoWeb is a professional surveillance tool designed to monitor the availability of web services in real time. This project constitutes the Final Degree Project for Web Applications Development.

---

## [ES] Funcionalidades del sistema

- **Persistencia Relacional**: Uso de SQLite3 para el almacenamiento de activos y registros históricos de telemetría.
- **Vigilancia Asíncrona**: Motor de comprobaciones automáticas basado en el Event Loop de Node.js.
- **Observabilidad Visual**: Representación de latencias en tiempo real mediante gráficas dinámicas (Línea Azul) con Chart.js.
- **Cuadro de Mandos**: Panel interactivo para la gestión (Alta/Baja) de activos de red.

## [EN] System features

- **Relational Persistence**: SQLite3 integration for storing assets and historical telemetry logs.
- **Asynchronous Monitoring**: Automatic check engine based on the Node.js Event Loop.
- **Visual Observability**: Real-time latency representation using dynamic graphs (Blue Line) with Chart.js.
- **Dashboard**: Interactive panel for network asset management (Add/Remove).

---

## [ES] Stack tecnológico | [EN] Tech Stack

- **Backend**: Node.js & Express.js.
- **Security**: Helmet (HTTP Header protection) & CORS.
- **Database**: SQLite3.
- **Frontend**: HTML5, Modern JavaScript (ES6+), Tailwind CSS.
- **Visuals**: Chart.js.

---

## [ES] Guía de ejecución en Local

Para poner en marcha el proyecto en un entorno de desarrollo, se deben seguir estos pasos:

1. Clonar el repositorio en el equipo local.
2. Acceder a la carpeta del proyecto y ejecutar el comando `npm install` para descargar las dependencias.
3. Crear un archivo `.env` en la raíz con las variables de configuración (ver archivo `.env.example`).
4. Iniciar el servidor mediante el comando `npm start`.
5. Acceder a la dirección `localhost:3000` desde cualquier navegador web.

## [EN] Local Execution Guide

To launch the project in a development environment, the following steps must be followed:

1. Clone the repository to the local machine.
2. Access the project folder and run the command `npm install` to download the dependencies. Access the project folder and run the command `npm install` to download the dependencies.
3. Create a `.env` file in the root with the configuration variables (see `.env.example` file). Create a `.env` file in the root with the configuration variables (see `.env.example` file).
4. Start the server using the command `npm start`. Start the server using the command `npm start`.
5. Access the address `localhost:3000` from any web browser.

---

[ES] Documentación técnica del proyecto de TFG de DAW - Autor: José Alberto Moreno González.
[EN] Technical documentation of the DAW TFG project - Author: José Alberto Moreno González.
