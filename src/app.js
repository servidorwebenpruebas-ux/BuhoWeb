/**
 * [ES] BUHOWEB v0.5.0 - NÚCLEO DE OPERACIONES
 * Versión MVP: Monitorización con persistencia en SQLite y soporte para gráficas.
 * En esta versión el acceso es libre (sin usuarios) para validar la tecnología.
 * //
 * [EN] BUHOWEB v0.5.0 - OPERATIONS CORE
* MVP Version: Monitoring with persistence in SQLite and support for graphs.
* In this version, access is free (without users) to validate the technology.
 */
const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PUERTO = 3000;

// [ES] --- CONFIGURACIÓN DE SEGURIDAD Y MIDDLEWARES ---
// [EN] --- SECURITY CONFIGURATION AND MIDDLEWARES ---
app.use(helmet({ contentSecurityPolicy: false })); // [ES] Protege el servidor | [EN] Protects the server
app.use(cors()); // [ES] Permite peticiones desde el navegador | [EN] Allows requests from the browser
app.use(express.json()); // [ES] Permite leer datos JSON | [EN] Allows reading JSON data
app.use(express.static('public')); // [ES] Carpeta para la web | [EN] Folder for the web interface

// [ES] --- BASE DE DATOS (Persistencia de activos y telemetría) ---
// [EN] --- DATABASE (Persistence of assets and telemetry) ---
const db = new sqlite3.Database('./data/buhoweb.sqlite', (err) => {
    if (err) console.error("Error al conectar con SQLite:", err.message);
    else console.log("Base de datos de BuhoWeb lista.");
});

// [ES] Definición de tablas técnicas
// [EN] Technical table definitions
db.serialize(() => {
    // [ES] Tabla de activos: Sitios web que el sistema debe vigilar
    // [EN] Assets table: Websites that the system should monitor
    db.run(`CREATE TABLE IF NOT EXISTS activos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        ultimo_estado TEXT DEFAULT 'Pendiente'
    )`);

    // [ES] Tabla de registros: Historial de latencia para las gráficas
    // [EN] Records table: Latency history for graphs
    db.run(`CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activo_id INTEGER,
        latencia INTEGER,
        estado TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(activo_id) REFERENCES activos(id) ON DELETE CASCADE
    )`);
});

// [ES] ---  MOTOR DE VIGILANCIA (Lógica SRE) ---
// [EN] --- MONITORING ENGINE (SRE Logic) ---

// [ES] Función asíncrona que recorre los sitios y guarda su rendimiento
// [EN] Asynchronous function that goes through the assets and saves their performance 
const ejecutarVigilancia = async () => {
    console.log('--- [Vigilancia] Iniciando ronda de monitorización... ---');
    db.all("SELECT * FROM activos", [], async (err, filas) => {
        if (err || !filas) return;
        for (const activo of filas) {
            const t_inicio = Date.now();
            try {
                // [ES] Realiza una petición técnica a una URL para medir su respuesta
                // [EN] Makes a technical request to a URL to measure its response
                await axios.get(activo.url, { timeout: 8000 });
                const latencia = Date.now() - t_inicio;

                db.run("UPDATE activos SET ultimo_estado = 'OK' WHERE id = ?", [activo.id]);
                db.run("INSERT INTO registros (activo_id, latencia, estado) VALUES (?, ?, 'OK')", [activo.id, latencia]);
            } catch (e) {
                db.run("UPDATE activos SET ultimo_estado = 'KO' WHERE id = ?", [activo.id]);
                db.run("INSERT INTO registros (activo_id, latencia, estado) VALUES (?, 0, 'KO')", [activo.id]);
            }
        }
    });
};
// [ES] El sistema vigila automáticamente cada 30 segundos
// [EN] The system automatically monitors every 30 seconds
setInterval(ejecutarVigilancia, 30000);

// [ES] --- API: RUTAS DE GESTIÓN (Endpoints) ---
// [EN] --- API: MANAGEMENT ROUTES (Endpoints) ---

// [ES] Obtener todos los sitios web vigilados
// [EN] Get all monitored assets
app.get('/api/activos', (req, res) => {
    db.all("SELECT * FROM activos", (err, filas) => res.json(filas));
});

// [ES] Añadir un nuevo sitio web a la base de datos
// [EN] Add a new asset to the database
app.post('/api/activos', (req, res) => {
    const { nombre, url } = req.body;
    const urlFinal = url.startsWith('http') ? url : 'https://' + url;
    db.run("INSERT INTO activos (nombre, url) VALUES (?, ?)", [nombre, urlFinal], () => res.json({ ok: true }));
});

// [ES] Eliminar un sitio web y sus datos históricos
// [EN] Delete an asset and its historical data
app.delete('/api/activos/:id', (req, res) => {
    db.run("DELETE FROM activos WHERE id = ?", [req.params.id], () => res.json({ ok: true }));
});

// [ES] Obtener datos para la gráfica de un sitio web (últimos 15 registros)
// [EN] Get data for an asset's graph (last 15 records)
app.get('/api/grafica/:id', (req, res) => {
    db.all("SELECT latencia FROM registros WHERE activo_id = ? ORDER BY fecha DESC LIMIT 15", [req.params.id], (err, filas) => {
        res.json(filas.reverse());
    });
});

// [ES] Iniciamos el servidor y realizamos una prueba de monitorización inmediata
// [EN] Start the server and perform an immediate monitoring test
app.listen(PUERTO, () => {
    console.log(`\n=========================================`);
    console.log(`   BUHOWEB v0.5.0 - VERSUIÓN MVP CON GRÁFICAS`);
    console.log(`   Servidor activo en: http://localhost:${PUERTO}`);
    console.log(`=========================================\n`);

    // [ES] Prueba inicial de conectividad
    // [EN] Initial connectivity test
   ejecutarVigilancia();
});