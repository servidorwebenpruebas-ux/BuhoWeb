/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUHOWEB - v1.0.0 - MVP
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * [ES] Este archivo contiene la lógica completa del servidor Express:
 *      - Autenticación por JWT (JSON Web Tokens)
 *      - Base de datos SQLite con usuarios, activos y registros
 *      - Motor de vigilancia automática cada 30 segundos
 *      - Sistema de alertas por email cuando un sitio cae
 *      - API REST para gestionar activos y generar reportes
 *
 * [EN] This file contains the complete Express server logic:
 *      - JWT authentication (JSON Web Tokens)
 *      - SQLite database with users, assets, and logs
 *      - Automatic monitoring engine every 30 seconds
 *      - Alert system via email when a website goes down
 *      - REST API to manage assets and generate reports
 * ═══════════════════════════════════════════════════════════════════════════
 */

// [ES] Cargar variables de entorno desde el archivo .env | [EN] Load environment variables from the .env file
require('dotenv').config();
// [ES] Importar las librerías necesarias para el funcionamiento del servidor | [EN] Import the necessary libraries for the server to work
const express = require('express');           // [ES] Framework para crear el servidor HTTP | [EN] Framework for creating HTTP server
const axios = require('axios');               // [ES] Librería para hacer peticiones HTTP (monitoreo de URLs) | [EN] Library for making HTTP requests (URL monitoring)
const sqlite3 = require('sqlite3').verbose(); // [ES] Base de datos relacional ligera | [EN] Lightweight relational database
const bcrypt = require('bcryptjs');           // [ES] Cifrado de contraseñas de forma segura | [EN] Secure password encryption
const jwt = require('jsonwebtoken');          // [ES] Crear y verificar tokens de sesión | [EN] Create and verify session tokens
const helmet = require('helmet');             // [ES] Proteger el servidor con headers de seguridad HTTP | [EN] Protect server with HTTP security headers
const cors = require('cors');                 // [ES] Permitir peticiones desde otros dominios | [EN] Allow requests from other domains
const nodemailer = require('nodemailer');     // [ES] Enviar correos electrónicos automáticamente | [EN] Send emails automatically
const fs = require('fs');                     // [ES] Gestionar archivos y directorios del sistema | [EN] Manage system files and directories
const path = require('path');                 // [ES] Trabajar con rutas de archivos de forma segura | [EN] Work with file paths safely


// [ES] CONFIGURACIÓN INICIAL DEL SERVIDOR EXPRESS | [EN] INITIAL CONFIGURATION OF EXPRESS SERVER

// [ES] Crear instancia de la aplicación Express | [EN] Create Express application instance
const app = express();
// [ES] Obtener el puerto desde .env o usar 3000 por defecto | [EN] Get port from .env or use 3000 as default
const PUERTO = process.env.PORT || 3000;
// [ES] Obtener la clave secreta para firmar tokens JWT desde .env | [EN] Get the secret key for signing JWT tokens from .env
const CLAVE_JWT = process.env.JWT_SECRET || "escribe_aqui_una_clave_aleatoria_y_larga";


// [ES] GESTIÓN DE CARPETAS Y ALMACENAMIENTO | [EN] FOLDER MANAGEMENT AND STORAGE

// [ES] Crear ruta a la carpeta 'data' donde se guarda la base de datos | [EN] Create path to 'data' folder where database is stored
const carpetaDatos = path.join(__dirname, '..', 'data');
// [ES] Si la carpeta 'data' no existe, crearla de forma recursiva | [EN] If 'data' folder doesn't exist, create it recursively
if (!fs.existsSync(carpetaDatos)) fs.mkdirSync(carpetaDatos, { recursive: true });
// [ES] Ruta completa al archivo de base de datos SQLite | [EN] Complete path to SQLite database file
const rutaBD = path.join(carpetaDatos, 'buhoweb.sqlite');


// [ES] CONFIGURACIÓN DE MIDDLEWARE DE SEGURIDAD | [EN] SECURITY MIDDLEWARE CONFIGURATION

// [ES] Helmet protege contra vulnerabilidades comunes agregando headers HTTP seguros | [EN] Helmet protects against common vulnerabilities by adding secure HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));
// [ES] CORS permite que el navegador realice peticiones a este servidor desde otros dominios | [EN] CORS allows the browser to make requests to this server from other domains
app.use(cors());
// [ES] Middleware para parsear JSON en el cuerpo de las peticiones | [EN] Middleware to parse JSON in the body of requests
app.use(express.json());
// [ES] Servir archivos estáticos (HTML, CSS, JS) desde la carpeta 'public' | [EN] Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static('public'));


// [ES] CONEXIÓN A BASE DE DATOS SQLITE | [EN] CONNECTION TO SQLITE DATABASE

// [ES] Crear o conectar a la base de datos SQLite | [EN] Create or connect to the SQLite database
const db = new sqlite3.Database(rutaBD, (err) => {
    // [ES] Si hay error en la conexión, mostrarlo en la consola | [EN] If there's a connection error, show it in the console
    if (err) console.error("Error BD:", err.message);
    else {
        console.log("Base de datos conectada con éxito.");
        // [ES] Habilitar las claves foráneas para mantener la integridad referencial | [EN] Enable foreign keys to maintain referential integrity
        db.run("PRAGMA foreign_keys = ON");
    }
});


// [ES] CREACIÓN DE TABLAS DE LA BASE DE DATOS | [EN] DATABASE TABLE CREATION

// [ES] db.serialize() asegura que las tablas se creen antes de cualquier operación | [EN] db.serialize() ensures tables are created before any operation
db.serialize(() => {
    // [ES] TABLA USUARIOS: Almacena cuentas de usuario | [EN] USERS TABLE: Stores user accounts
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,           -- [ES/EN] ID único, incrementa automáticamente
        correo TEXT UNIQUE,                              -- [ES/EN] Email único para cada usuario
        clave TEXT,                                      -- [ES/EN] Contraseña cifrada con bcrypt
        verificado INTEGER DEFAULT 0,                   -- [ES/EN] 0=no verificado, 1=verificado
        codigo_verificacion TEXT,                       -- [ES/EN] Código de 4 dígitos para verificar email
        intentos_fallidos INTEGER DEFAULT 0,           -- [ES/EN] Contador de intentos fallidos de login
        bloqueado_hasta DATETIME DEFAULT NULL           -- [ES/EN] Fecha/hora hasta la que está bloqueada la cuenta
    )`);
    // [ES] TABLA ACTIVOS: Sitios web a monitorizar | [EN] ASSETS TABLE: Websites to monitor
    db.run(`CREATE TABLE IF NOT EXISTS activos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,           -- [ES/EN] ID único del sitio web
        usuario_id INTEGER,                             -- [ES/EN] ID del usuario propietario (referencia a usuarios.id)
        nombre TEXT,                                    -- [ES/EN] Nombre amigable del sitio (ej: "Google")
        url TEXT,                                       -- [ES/EN] URL completa (ej: https://google.com)
        ultimo_estado TEXT DEFAULT 'Pendiente',        -- [ES/EN] Estado: "OK", "KO", o "Pendiente" (primera vez)
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)  -- [ES/EN] Relación con la tabla usuarios
    )`);
    // [ES] TABLA REGISTROS: Historial de mediciones/chequeos │ [EN] RECORDS TABLE: History of measurements/checks
    db.run(`CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,                    -- [ES/EN] ID único del registro
        sitio_id INTEGER,                                        -- [ES/EN] ID del sitio web (referencia a activos.id)
        latencia INTEGER,                                        -- [ES/EN] Tiempo en milisegundos que tardó en responder
        estado TEXT,                                             -- [ES/EN] "OK" o "KO" (operativo o caído)
        codigo_http INTEGER,                                     -- [ES/EN] Código de respuesta HTTP (200, 404, 500, etc)
        diagnostico TEXT,                                        -- [ES/EN] Mensaje explicativo ("Operativo", "Timeout", etc)
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,               -- [ES/EN] Fecha y hora del registro (automático)
        FOREIGN KEY(sitio_id) REFERENCES activos(id) ON DELETE CASCADE  -- [ES/EN] Si se elimina sitio, se borran sus registros
    )`);
});


// [ES] CONFIGURACIÓN DE ENVÍO DE CORREOS ELECTRÓNICOS | [EN] EMAIL SENDING CONFIGURATION
/**
 * [ES] Configurar el transporte SMTP para enviar correos
 *      Se conecta al servidor de correo definido en .env
 *      (ej: Gmail, Outlook, servidor privado, etc)
 * 
 * [EN] Configure SMTP transport to send emails
 *      Connects to the mail server defined in .env
 *      (e.g.: Gmail, Outlook, private server, etc)
 */
const transportador = nodemailer.createTransport({
    host: process.env.SMTP_HOST,              // [ES] Servidor SMTP | [EN] SMTP server
    port: parseInt(process.env.SMTP_PORT),    // [ES] Puerto SMTP (465 para SSL, 587 para TLS) | [EN]  SMTP port (465 for SSL, 587 for TLS)
    secure: process.env.SMTP_SECURE === 'true', // [ES/EN] true = puerto/port 465 (SSL); false = puerto/port 587 (TLS)
    auth: {
        user: process.env.SMTP_USER,          // [ES] Email de envío | [EN] Shipping email
        pass: process.env.SMTP_PASS            // [ES] Contraseña o token de aplicación | [EN] Application password or token
    },
    tls: { rejectUnauthorized: false }        // [ES] Permitir certificados auto-firmados (próxima versión) | [EN] Allow self-signed certificates (next version)
});

/**
 * [ES] Función para enviar correos electrónicos
 *      Se usa para alertas, códigos de verificación, recuperación de contraseña
 *
 * [EN] Function to send emails
 *      Used for alerts, verification codes, password recovery
 */
const enviarEmail = async (destino, asunto, texto) => {
    try {
        // [ES] Intentar enviar el correo usando nodemailer | [EN] Try to send the email using nodemailer
        await transportador.sendMail({
            from: `"mensaje de BuhoWebv" <${process.env.SMTP_USER}>`, // [ES] Remitente del correo  | [EN] Email's sender
            to: destino,                                            // [ES] Destinatario  | [EN] Email's addressee
            subject: asunto,                                        // [ES] Asunto del correo  | [EN] Email's subject
            text: texto                                             // [ES] Cuerpo del correo (en texto plano)  | [EN] Email's body (in plain text)
        });
        // [ES] Registrar en consola que el correo fue enviado exitosamente | [EN] Log in console that email was sent successfully
        console.log(`[SMTP] Correo enviado a ${destino}`);
    } catch (e) {
        // [ES] Si falla el envío (ej: servidor SMTP no disponible), usar "modo simulación" para desarrollo sin servidor SMTP real
        // [EN] If sending fails (e.g.: SMTP server unavailable), use "simulation mode" for development without real SMTP server
        console.log("Simulación SMTP activa.");
    }
};


// [ES] MIDDLEWARE DE AUTENTICACIÓN CON JWT | [EN] JWT AUTHENTICATION MIDDLEWARE

/**
 * [ES] Función middleware para verificar que el usuario está autenticado
 *      Extrae el token JWT del header "Authorization" o del parámetro URL "?token="
 *      Si el token es válido, permite continuar. Si no, devuelve error 401/403.
 *
 * [EN] Middleware function to verify that the user is authenticated
 *      Extracts JWT token from "Authorization" header or "?token=" URL parameter
 *      If token is valid, allows continue. If not, returns 401/403 error.
 */
const verificarAcceso = (req, res, next) => {
    // [ES] Buscar token en el header Authorization o en la query ?token=valor | [EN] Look for token in Authorization header or in ?token=value query
    const tokenRaw = req.headers['authorization'] || req.query.token;
    
    // [ES] Si no hay token, rechazar la petición | [EN] If there's no token, reject the request
    if (!tokenRaw) return res.status(403).json({ error: "Token requerido." });
    
    // [ES] Si el header contiene "Bearer ", extraer solo el token | [EN] If header contains "Bearer ", extract only the token
    const token = tokenRaw.startsWith('Bearer ') ? tokenRaw.split(' ')[1] : tokenRaw;
    // [ES] Verificar que el token es válido y no ha expirado | [EN] Verify that the token is valid and not expired
    jwt.verify(token, CLAVE_JWT, (err, dec) => {
        // [ES] Si hay error (token inválido, expirado, etc), rechazar  | [EN] If there's an error (invalid token, expired, etc), reject
        if (err) return res.status(401).json({ error: "Sesión expirada." });
        // [ES] Si es válido, guardar el ID del usuario en la petición para usarlo en las rutas protegidas
        // [EN] If valid, save user ID in the request to use it in protected routes
        req.uId = dec.id;
        // [ES] Continuar con la siguiente función/ruta | [EN] Continue with the next function/route
        next();
    });
};


// [ES] MOTOR DE VIGILANCIA AUTOMÁTICA | [EN] AUTOMATIC MONITORING ENGINE

/**
 * [ES] FUNCIÓN PRINCIPAL DE VIGILANCIA
 *      Se ejecuta cada 30 segundos para revisar si los sitios web están activos
 *      Recorre todos los sitios del database y realiza peticiones HTTP a ellos
 *      Registra latencia, estado y diagnostico en la tabla 'registros'
 *      Si un sitio pasa de OK a KO, envía alerta por email
 *
 * [EN] MAIN MONITORING FUNCTION
 *      Runs every 30 seconds to check if websites are active
 *      Iterates through all sites in database and makes HTTP requests to them
 *      Records latency, status and diagnostics in 'records' table
 *      If a website goes from OK to KO, sends email alert
 */
const ejecutarVigilancia = async () => {
    // [ES] Mostrar en consola que la vigilancia está activa | [EN] Show in console that monitoring is active
    console.log('--- [SRE] Vigilando infraestructura activa ---');
    // [ES] Obtener todos los activos (sitios web) con información del usuario propietario | [EN] Get all assets (websites) with owner user information
    db.all(`SELECT activos.*, usuarios.correo FROM activos 
            JOIN usuarios ON activos.usuario_id = usuarios.id`, [], async (err, filas) => {
        // [ES] Si hay error o no hay datos, salir de la función | [EN] If there's an error or no data, exit the function
        if (err || !filas) return;
        // [ES] Recorrer cada sitio web | [EN] Iterate through each website
        for (const s of filas) {
            // [ES] Anotar la hora de inicio para calcular latencia | [EN] Note the start time to calculate latency
            const inicio = Date.now();
            // [ES] Valores por defecto (asumir que falla) | [EN] Default values (assume it fails)
            let log = {
                lat: 0,        // [ES] Latencia (en milisegundos) | [EN] Latency (in milliseconds)
                est: 'KO',     // [ES] Estado = Caído | [EN] Status = Fallen
                cod: 0,        // [ES] Código HTTP | [EN] HTTP code
                diag: 'Fallo de Red (Timeout/DNS)'  // [ES] Diagnóstico | [EN] Diagnosis
            };
            
            try {
                // [ES] Intentar conectar al sitio durante un período de 8 segundos | [EN] Try to connect to the website with 8 second timeout
                const res = await axios.get(s.url, { timeout: 8000 });
                // [ES] Si la petición fue exitosa (status 2xx)  | [EN] If the request was successful (status 2xx)
                log = {
                    lat: Date.now() - inicio,  // [ES] Calcular latencia real | [EN] Calculate real latency
                    est: 'OK',                 // [ES] El sitio está operativo | [EN] The site is operational
                    cod: res.status,           // [ES] Código 200, 201, etc | [EN] Code 200, 201, etc
                    diag: 'Operativo'          // [ES] Sitio funcionando correctamente | [EN] Site working correctly
                };
                // [ES] Actualizar el estado a OK en la base de datos | [EN] Update status to OK in database
                db.run("UPDATE activos SET ultimo_estado = 'OK' WHERE id = ?", [s.id]);
                
            } catch (e) {
                // [ES] Si la petición falló pero obtuvo respuesta (4xx, 5xx) | [EN] If the request failed but received response (4xx, 5xx)
                if (e.response) {
                    log = {
                        lat: 0,
                        est: 'KO',
                        cod: e.response.status,           // [ES] Código de error (404, 500, etc) | [EN] Error code (404, 500, etc)
                        diag: `Fallo App (HTTP ${e.response.status})`  // [ES] Error HTTP específico | [EN] HTTP's specific error
                    };
                }
                
                // [ES] LÓGICA DE ALERTAS: Solo si TRANSICIÓN a KO | [EN] ALERT LOGIC: Only if TRANSITION to KO

                // [ES] Solo envia correo si:
                //      1. El estado anterior era OK (estaba funcionando)
                //      2. O es la primera vez (estado = Pendiente)
                // [EN] Only sends email if:
                //      1. Previous status was OK (was working)
                //      2. Or it's the first check (status = Pending)

                if (s.ultimo_estado === 'OK' || s.ultimo_estado === 'Pendiente') {
                    // [ES] Obtener la plantilla de correo desde .env y completar los espacios reservados  | [EN] Get email template from .env and replace placeholders
                    const mensaje = (process.env.TEXTO_ALERTA || "Caída")
                        .replace('%SITIO%', s.nombre)  // [ES] Identificador del sitio | [EN] Website identifier
                        .replace('%URL%', s.url);      // [ES] Dirección web | [EN] URL's site

                    await enviarEmail( // [ES] Envia correo de alerta al usuario  | [EN] Sends an alert email to the user
                        s.correo,
                        process.env.ASUNTO_ALERTA,
                        `${mensaje}\nDiagnóstico: ${log.diag}`
                    );
                }
                
                // [ES] Actualizar el estado a KO en la base de datos | [EN] Update status to KO in database
                db.run("UPDATE activos SET ultimo_estado = 'KO' WHERE id = ?", [s.id]);
            }
            
            // [ES] Guardar el resultado de esta comprobación en el historial | [EN] Save the result of this check in the history
            db.run(
                "INSERT INTO registros (sitio_id, latencia, estado, codigo_http, diagnostico) VALUES (?, ?, ?, ?, ?)",
                [s.id, log.lat, log.est, log.cod, log.diag]
            );
            
            // [ES] Limpiar registros antiguos: mantener solo los últimos 150. Esto evita que la base de datos crezca indefinidamente
            // [EN] Clean old records: keep only the last 150. This prevents the database from growing indefinitely
            db.run(
                `DELETE FROM registros WHERE id NOT IN (
                    SELECT id FROM registros WHERE sitio_id = ? ORDER BY fecha DESC LIMIT 150
                )`,
                [s.id]
            );
        }
    });
};

// [ES] Ejecutar el motor de vigilancia cada 30 segundos (30000 milisegundos) | [EN] Run monitoring engine every 30 seconds (30000 milliseconds)
setInterval(ejecutarVigilancia, 30000);


// [ES] RUTAS DE AUTENTICACIÓN (Registro, Login, Verificación)  | [EN] AUTHENTICATION ROUTES (Registration, Login, Verification)

/**
 * [ES] POST /api/acceso/registro
 *      Ruta para que nuevos usuarios se registren
 *      1. Cifrar contraseña con bcrypt
 *      2. Generar código de verificación de 4 dígitos
 *      3. Guardar usuario sin verificar en la base de datos
 *      4. Enviar correo con el código
 *
 * [EN] POST /api/acceso/registro
 *      Route for new users to register
 *      1. Encrypt password with bcrypt
 *      2. Generate 4-digit verification code
 *      3. Save unverified user in database
 *      4. Send email with the code
 */
app.post('/api/acceso/registro', async (req, res) => {
    // [ES] Cifrar la contraseña usando bcrypt (sal = 10 rondas) | [EN] Encrypt password using bcrypt (salt = 10 rounds)
    const hash = await bcrypt.hash(req.body.clave, 10);
    // [ES] Generar un código aleatorio de 4 dígitos | [EN] Generate a random 4-digit code
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();
    // [ES] Guardar usuario en la base de datos | [EN] Save user in the database
    db.run(
        "INSERT INTO usuarios (correo, clave, codigo_verificacion) VALUES (?, ?, ?)",
        [req.body.correo, hash, codigo],
        (err) => {
            // [ES] Si el correo ya existe (UNIQUE constraint), devolver error | [EN] If email already exists (UNIQUE constraint), return error
            if (err) return res.status(400).json({ error: "Usuario ya existe." });
            // [ES] Enviar correo con el código de verificación | [EN] Send email with verification code
            enviarEmail(
                req.body.correo,
                process.env.ASUNTO_REGISTRO,
                process.env.TEXTO_REGISTRO.replace('%CODIGO%', codigo)
            );
            
            // [ES] Responder al cliente que el registro fue exitoso | [EN] Respond to client that registration was successful
            res.json({ exito: true });
        }
    );
});


/**
 * [ES] POST /api/acceso/verificar
 *      Ruta para verificar el correo usando el código recibido
 *      Si el código es correcto: Activar la cuenta
 *      Si el código es incorrecto (3+ intentos): Eliminar el usuario
 *
 * [EN] POST /api/acceso/verificar
 *      Route to verify email using received code
 *      If code is correct: Activate the account
 *      If code is incorrect (3+ attempts): Delete the user
 */
app.post('/api/acceso/verificar', (req, res) => {
    const { correo, codigo } = req.body;
    // [ES] Buscar el usuario, asegurándose de comparar correos en minúscula | [EN] Find the user, making sure to compare emails in lowercase
    db.get("SELECT * FROM usuarios WHERE correo = ?", [correo.toLowerCase().trim()], (err, usuario) => {
        // [ES] Si no existe el usuario | [EN] If user doesn't exist
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });
        // [ES] Verificar si el código ingresado coincide con el almacenado | [EN] Check if the entered code matches the stored one
        if (usuario.codigo_verificacion === codigo) {
            // [ES] ¡Código correcto! Marcar usuario como verificado | [EN] Code is correct! Mark user as verified
            db.run(
                "UPDATE usuarios SET verificado = 1, intentos_fallidos = 0 WHERE id = ?",
                [usuario.id]
            );
            res.json({ exito: true });
        } else {
            // [ES] Código incorrecto, incrementar contador de intentos | [EN] Wrong code, increment attempt counter
            const fallos = usuario.intentos_fallidos + 1;
            // [ES] Si ha fallado 3 veces, ELIMINAR el usuario (seguridad) | [EN] If he/she has failed 3 times, DELETE the user (security)
            if (fallos >= 3) {
                db.run("DELETE FROM usuarios WHERE id = ?", [usuario.id]);
                res.status(403).json({
                    error: "Se ha superado el máximo número de intentos fallidos. \n\nEl usuario ha sido borrado por seguridad, y debe registrarse de nuevo."
                });
            } else {
                // [ES] Aún quedan intentos, actualizar el contador | [EN] Still have attempts left, update the counter
                db.run("UPDATE usuarios SET intentos_fallidos = ? WHERE id = ?", [fallos, usuario.id]);
                res.status(400).json({ error: `Código incorrecto. Intento ${fallos} de 3.` });
            }
        }
    });
});


/**
 * [ES] POST /api/acceso/login
 *      Ruta para que usuarios verificados inicien sesión
 *      Genera un token JWT si las credenciales son correctas
 *      Implementa bloqueo de cuenta nach 3 intentos fallidos
 *
 * [EN] POST /api/acceso/login
 *      Route for verified users to log in
 *      Generates a JWT token if credentials are correct
 *      Implements account lock after 3 failed attempts
 */
app.post('/api/acceso/login', (req, res) => {
    const { correo, clave } = req.body;
    // [ES] Buscar el usuario por correo (en minúscula para consistencia) | [EN] Find the user by email (in lowercase for consistency)
    db.get("SELECT * FROM usuarios WHERE correo = ?", [correo.toLowerCase().trim()], async (err, user) => {
        // [ES] Si el usuario no existe | [EN] If user doesn't exist
        if (!user) return res.status(401).json({ error: "Usuario no registrado." });
        // [ES] PASO 1: Verificar si la cuenta está bloqueada | [EN] STEP 1: Check if account is locked             
        if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
            // [ES] La fecha de bloqueo aún no ha pasado, cuenta sigue bloqueada | [EN] The lock date hasn't passed yet, account is still locked
            return res.status(403).json({
                error: "Cuenta bloqueada por seguridad tras 3 intentos fallidos. Revise su correo."
            });
        }

        // [ES] PASO 2: Comparar contraseña (usando bcrypt) | [EN] STEP 2: Compare password (using bcrypt)     
        if (await bcrypt.compare(clave, user.clave)) {
            // [ES] Contraseña correcta, pero comprueba si el usuario fue verificado por email
            // [EN] Password is correct, but checks if user was verified by email
            if (!user.verificado) {
                return res.status(401).json({ error: "Cuenta sin activar." });
            }
            // [ES] TODO CORRECTO: Resetear contadores de intentos fallidos | [EN] EVERYTHING CORRECT: Reset failed attempt counters
            db.run(
                "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
                [user.id]
            );
            // [ES] Crear token JWT válido por 4 horas | [EN] Create JWT token valid for 4 hours
            const token = jwt.sign({ id: user.id }, CLAVE_JWT, { expiresIn: '4h' }); 
            // [ES] Devolver el token al frontend para que lo guarde | [EN] Return the token to frontend so it can save it
            res.json({ token });
        } else {
            // [ES] CONTRASEÑA INCORRECTA: Incrementar intentos │ [EN] WRONG PASSWORD: Increment attempt counter
            const n = user.intentos_fallidos + 1;
            
            if (n >= 3) {
                // [ES] Tercer intento fallido: BLOQUEAR LA CUENTA por 1 hora │ [EN] Third failed attempt: LOCK THE ACCOUNT for 1 hour
                const finBloqueo = new Date(Date.now() + 3600000).toISOString(); // [ES/EN] 1 hora/hour = 3600000 ms
                db.run(
                    "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = ? WHERE id = ?",
                    [finBloqueo, user.id]
                );            
                // [ES] Enviar correo notificando el bloqueo │ [EN] Send email notifying the lock
                await enviarEmail(
                    user.correo,
                    "Seguridad: Acceso Bloqueado",
                    "Se ha bloqueado su acceso tras 3 intentos fallidos. Puede recuperarlo solicitando una contraseña temporal."
                );
                res.status(403).json({ error: "Máximo de intentos. Cuenta bloqueada 1 hora." });
            } else {
                // [ES] Aún quedan intentos, solo incrementar el contador │ [EN] Still have attempts left, just increment the counter
                db.run("UPDATE usuarios SET intentos_fallidos = ? WHERE id = ?", [n, user.id]);
                res.status(401).json({
                    error: `Contraseña incorrecta (Intento ${n} de 3).`
                });
            }
        }
    });
});


/**
 * [ES] POST /api/acceso/recuperar
 *      Ruta para recuperar acceso cuando se olvidó la contraseña
 *      Genera una contraseña temporal y la envía por correo
 *      También desbloquea la cuenta si estaba bloqueada
 *
 * [EN] POST /api/acceso/recuperar
 *      Route to recover access when password is forgotten
 *      Generates a temporary password and sends it by email
 *      Also unlocks the account if it was locked
 */
app.post('/api/acceso/recuperar', async (req, res) => {
    const { correo } = req.body;
    
    // [ES] Generar contraseña temporal: "Buho" + 4 dígitos aleatorios │ [EN] Generate temporary password: "Buho" + 4 random digits
    const claveTemp = "Buho" + Math.floor(1000 + Math.random() * 9000);
    // [ES] Cifrar la contraseña temporal con bcrypt │ [EN] Encrypt the temporary password with bcrypt
    const hash = await bcrypt.hash(claveTemp, 10);
    // [ES] Actualizar contraseña y desbloquear la cuenta (si estaba bloqueada) │ [EN] Update password and unlock account (if it was locked)
    db.run(
        "UPDATE usuarios SET clave = ?, bloqueado_hasta = NULL, intentos_fallidos = 0 WHERE correo = ?",
        [hash, correo.toLowerCase().trim()],
        async function() {
            // [ES] this.changes indica cuántas filas fueron actualizadas │ [EN] this.changes indicates how many rows were updated
            if (this.changes > 0) {
                // [ES] Usuario encontrado, enviar correo con la nueva contraseña │ [EN] User found, send email with new password
                const texto = (process.env.TEXTO_RECUPERAR || "Clave: %CLAVE%")
                    .replace('%CLAVE%', claveTemp);
                await enviarEmail(
                    correo,
                    process.env.ASUNTO_RECUPERAR,
                    texto
                );
                res.json({ exito: true });
            } else {
                // [ES] El correo no existe en la base de datos │ [EN] The email doesn't exist in the database
                res.status(404).json({
                    error: "El correo no existe en nuestra base de datos."
                });
            }
        }
    );
});

/**
 * [ES] POST /api/usuario/cambiar-clave
 *      Ruta protegida para que usuarios autenticados cambien su contraseña
 *      Valida que la nueva contraseña cumpla requisitos de seguridad:
 *      - Mínimo 8 caracteres
 *      - Al menos una mayúscula
 *      - Al menos una minúscula
 *      - Al menos un número
 *
 * [EN] POST /api/usuario/cambiar-clave
 *      Protected route for authenticated users to change password
 *      Validates that new password meets security requirements:
 *      - Minimum 8 characters
 *      - At least one uppercase
 *      - At least one lowercase
 *      - At least one number
 */
app.post('/api/usuario/cambiar-clave', verificarAcceso, async (req, res) => {
    const { nuevaClave } = req.body;

    // [ES] Expresión regular que define los requisitos de seguridad │ [EN] Regular expression that defines security requirements
    const patronSeguridad = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    // [ES] Validar que la contraseña cumple los requisitos │ [EN] Validate that password meets requirements
    if (!nuevaClave || !patronSeguridad.test(nuevaClave)) {
        return res.status(400).json({
            error: "La nueva contraseña no cumple los requisitos mínimos de seguridad."
        });
    }

    try {
        // [ES] Cifrar la nueva contraseña antes de guardarla en la base de datos │ [EN] Encrypt the new password before saving it in the database
        const hash = await bcrypt.hash(nuevaClave, 10);
        
        // [ES] Actualizar la contraseña para el usuario autenticado (req.uId viene del middleware) │ [EN] Update password for authenticated user (req.uId comes from middleware)
        db.run("UPDATE usuarios SET clave = ? WHERE id = ?", [hash, req.uId], (err) => {
            if (err) {
                return res.status(500).json({
                    error: "Error técnico al actualizar la base de datos."
                });
            }
            res.json({ ok: true });
        });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

/**
 * [ES] DELETE /api/acceso/abortar
 *      Ruta para que usuarios no verificados cancelen su registro
 *      Solo borra usuarios que NO han sido verificados (seguridad)
 *
 * [EN] DELETE /api/acceso/abortar
 *      Route for unverified users to cancel registration
 *      Only deletes users who have NOT been verified (security)
 */
app.delete('/api/acceso/abortar', (req, res) => {
    const { correo } = req.body;
    
    // [ES] Solo permitir borrar si el usuario existe Y estado = sin verificar (0) │ [EN] Only allow deletion if user exists AND status = unverified (0)
    db.run(
        "DELETE FROM usuarios WHERE correo = ? AND verificado = 0",
        [correo.toLowerCase().trim()],
        function(err) {
            if (err) {
                return res.status(500).json({ error: "Error al cancelar registro." });
            }
            res.json({ ok: true });
        }
    );
});

 
// [ES] RUTAS DE GESTIÓN DE ACTIVOS (Sitios web a monitorizar)  │ [EN] ROUTES FOR ASSET MANAGEMENT (Websites to monitor)
/**
 * [ES] GET /api/activos
 *      Obtener lista de todos los activos del usuario autenticado
 *      Devuelve un array JSON con los sitios web
 *
 * [EN] GET /api/activos
 *      Get list of all assets for authenticated user
 *      Returns JSON array with websites
 */
app.get('/api/activos', verificarAcceso, (req, res) => {
    // [ES] Obtener todos los activos que pertenecen al usuario (req.uId del middleware) │ [EN] Get all assets that belong to the user (req.uId from middleware)
    db.all(
        "SELECT * FROM activos WHERE usuario_id = ?",
        [req.uId],
        (err, r) => res.json(r)
    );
});

/**
 * [ES] POST /api/activos
 *      Crear/agregar un nuevo sitio web a monitorizar
 *      Valida que la URL sea válida y añade prefijo HTTPS si falta
 *
 * [EN] POST /api/activos
 *      Create/add a new website to monitor
 *      Validates URL is valid and adds HTTPS prefix if missing
 */
app.post('/api/activos', verificarAcceso, (req, res) => {
    const { nombre, url } = req.body;
    
    // [ES] Validar que la URL empieza con http/https, si no, añadir https: │ [EN] Validate URL starts with http/https, if not, add https://
    const urlF = url.startsWith('http') ? url : 'https://' + url;
    
    // [ES] Insertar nuevo activo en la base de datos │ [EN] Insert new asset in the database
    db.run(
        "INSERT INTO activos (usuario_id, nombre, url) VALUES (?, ?, ?)",
        [req.uId, nombre, urlF],
        () => res.json({ ok: true })
    );
});

/**
 * [ES] DELETE /api/activos/:id
 *      Eliminar un sitio web del monitoreo
 *      Se usa verificarAcceso para asegurar que solo el propietario puede borrarlo
 *      Al borrar el activo, se borran automáticamente sus registros (ON DELETE CASCADE)
 *
 * [EN] DELETE /api/activos/:id
 *      Remove website from monitoring
 *      Uses verificarAcceso to ensure only owner can delete it
 *      When asset is deleted, its records are automatically deleted (ON DELETE CASCADE)
 */
app.delete('/api/activos/:id', verificarAcceso, (req, res) => {
    // [ES] Borrar el activo, pero solo si el usuario es el propietario │ [EN] Delete the asset, but only if user is the owner
    db.run(
        "DELETE FROM activos WHERE id = ? AND usuario_id = ?",
        [req.params.id, req.uId],
        () => res.json({ ok: true })
    );
});


// [ES] RUTAS DE TELEMETRÍA Y REPORTES  │ [EN] TELEMETRY AND REPORTS ROUTES
/**
 * [ES] GET /api/grafica/:id
 *      Obtener los últimos 150 valores de latencia para dibujar gráfica
 *      Los datos están ordenados de más antiguos a más recientes
 *      Chart.js utiliza estos datos para graficar la serie temporal
 *
 * [EN] GET /api/grafica/:id
 *      Get the last 150 latency values to draw graph
 *      Data is ordered from oldest to most recent
 *      Chart.js uses this data to plot the time series
 */
app.get('/api/grafica/:id', verificarAcceso, (req, res) => {
    // [ES] Obtener latencias en orden inverso (DESC), luego revertir para gráfica │ [EN] Get latencies in reverse order (DESC), then reverse for graph
    db.all(
        "SELECT latencia FROM registros WHERE sitio_id = ? ORDER BY fecha DESC LIMIT 150",
        [req.params.id],
        (err, r) => {
            // [ES] Si hay datos, revertir el orden para que sea de viejo a nuevo │ [EN] If there's data, reverse the order from old to new
            return res.json(r ? r.reverse() : []);
        }
    );
});

/**
 * [ES] GET /api/estadisticas/:id
 *      Obtener estadísticas de un sitio web:
 *      - Latencia media en milisegundos
 *      - Porcentaje de disponibilidad (uptime)
 *
 * [EN] GET /api/estadisticas/:id
 *      Get statistics for a website:
 *      - Average latency in milliseconds
 *      - Availability percentage (uptime)
 */
app.get('/api/estadisticas/:id', verificarAcceso, (req, res) => {
    // [ES] Consulta SQL que calcula:
    //      AVG(latencia) = promedio de todas las latencias
    //      uptime = (registros OK / total registros) * 100
    // [EN] SQL query that calculates:
    //      AVG(latency) = average of all latencies
    //      uptime = (OK records / total records) * 100
    const sql = `
        SELECT
            AVG(latencia) as media,
            (COUNT(CASE WHEN estado = 'OK' THEN 1 END) * 100.0 / COUNT(*)) as uptime
        FROM registros
        WHERE sitio_id = ?
    `;
    
    db.get(sql, [req.params.id], (err, fila) => {
        // [ES] Si no hay registros, devolver valores por defecto │ [EN] If there are no records, return default values
        res.json(fila || { media: 0, uptime: 100 });
    });
});

/**
 * [ES] GET /api/reporte/:id
 *      Generar y descargar un informe CSV con los últimos 150 registros, que incluye: Fecha, Latencia, Estado, Diagnóstico
 * [EN] GET /api/reporte/:id
 *      Generate and download CSV report with last 150 records that includes: Date, Latency, Status, Diagnostic
 */
app.get('/api/reporte/:id', verificarAcceso, (req, res) => {
    // [ES] Obtener información del sitio web │ [EN] Get website information
    db.get(
        "SELECT nombre, url FROM activos WHERE id = ?",
        [req.params.id],
        (err, activo) => {
            // [ES] Obtener los últimos 150 registros │ [EN] Get the last 150 records
            db.all(
                "SELECT fecha, latencia, estado, diagnostico FROM registros WHERE sitio_id = ? ORDER BY fecha DESC LIMIT 150",
                [req.params.id],
                (err, filas) => {
                    // [ES] Construir CSV manualmente │ [EN] Build CSV manually
                    let csv = `\ufeffBuhoWeb - Informe de Nivel Básico\nIdentificador: ${activo.nombre}\nURL: ${activo.url}\n\nFecha y Hora,Latencia(ms),Estado,Diagnóstico\n`;
                    // [ES] Añadir cada registro al CSV │ [EN] Add each record to CSV
                    filas.forEach(f => {
                        csv += `${f.fecha},${f.latencia},${f.estado},${f.diagnostico}\n`;
                    });
                    // [ES] Configurar headers HTTP para descargar archivo CSV │ [EN] Configure HTTP headers to download CSV file
                    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                    res.attachment(`Informe-${activo.nombre}.csv`);
                    // [ES] Enviar el contenido CSV al navegador │ [EN] Send CSV content to browser
                    res.send(csv);
                }
            );
        }
    );
});


// [ES] INICIAR EL SERVIDOR  │ [EN] START THE SERVER

app.listen(PUERTO, '0.0.0.0', () => {
    // [ES] Mostrar en consola que el servidor está escuchando en el puerto especificado  │ [EN] Show in console that server is listening on the specified port
    console.log(`BUHOWEB v1.0.0 Activo en puerto ${PUERTO}`);
    // [ES] Ejecutar una vez el motor de vigilancia al iniciar │ [EN] Run monitoring engine once on startup
    ejecutarVigilancia();
});