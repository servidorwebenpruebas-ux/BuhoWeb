# Changelog - BuhoWeb

## [1.0.0] - 2026-03-02 (MMP Release)

### [ES] Añadido

- **Identidad y Acceso**: Sistema de usuarios con autenticación JWT (4h de sesión) y cifrado Bcrypt.
- **Seguridad Defensiva**: Bloqueo de cuenta tras 3 fallos y validación de contraseñas fuertes (Regex).
- **Mensajería Real**: Integración de Nodemailer para envío de códigos de activación y alertas vía SMTP.
- **Reporting Avanzado**: Exportación a CSV con metadatos del activo y soporte para caracteres especiales (UTF-8).
- **Monitorización Inteligente SRE**: Motor de vigilancia asíncrono con clasificación de errores (Infraestructura vs Aplicación).
- **Optimización de Datos**: Lógica de autolimpieza para mantener los últimos 150 registros por sitio web.
- **DevOps**: Paquetización completa del sistema mediante Docker y Docker Compose.

### [EN] Added

- **Identity & Access**: User system with JWT authentication (4h session) and Bcrypt encryption.
- **Defensive Security**: Account lockout after 3 failed attempts and strong password validation (Regex).
- **Real Messaging**: Nodemailer integration for activation codes and SMTP alerts.
- **Advanced Reporting**: CSV export with asset metadata and UTF-8 support for special characters.
- **SRE Smart Monitoring**: Asynchronous monitoring engine with error classification (Infrastructure vs. App).
- **Data Optimization**: Automatic pruning logic to keep the last 150 records per asset.
- **DevOps**: Full system packaging via Docker and Docker Compose.

---

## [0.5.0] - 2026-02-24 (MVP Release)

### [ES] Añadido

- **Persistencia SQL**: Implementación de base de datos relacional SQLite3 para activos y logs.
- **Telemetría Visual**: Integración de Chart.js para la visualización de la curva de latencia.
- **Cuadro de Mandos**: Interfaz interactiva para gestionar los activos de red en tiempo real.
- **Seguridad**: Protección del servidor mediante cabeceras Helmet.

### [EN] Added

- **SQL Persistence**: SQLite3 relational database implementation for assets and logs.
- **Visual Telemetry**: Chart.js integration for latency curve visualization.
- **Dashboard**: Interactive interface to manage network assets in real-time.
- **Security**: Server protection using Helmet headers.

---

## [0.1.0] - 2026-02-24 (PoC Release)

### [ES] Añadido

- Configuración del repositorio y de la estructura de carpetas.
- Lógica básica de comprobación de estado de URLs.

### [EN] Added

- Repository and folder structure configuration.
- Basic URL status check logic.
