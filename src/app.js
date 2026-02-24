/**
 * [ES] BUHOWEB - Versión 0.0.1 (Prueba de Concepto)
 * Este archivo demuestra la capacidad del sistema para realizar 
 * peticiones asíncronas y verificar la disponibilidad de un servidor
 * //
 * [EN] BUHOWEB - Version 0.0.1 (Proof of Concept)
 * This file demonstrates the system's ability to perform asynchronous 
 * requests and verify the availability of a server
 */

const express = require('express');
const axios = require('axios');

const app = express();
const PUERTO = 3000;

// [ES] MÉTODO: comprobarEstado - Realiza una petición técnica a una URL para validar su respuesta
// [EN] METHOD: comprobarEstado - Makes a technical request to a URL to validate its response
const comprobarEstado = async (url) => {
    console.log(`[Vigilancia] Verificando: ${url}...`);
    try {
        const inicio = Date.now();
        const respuesta = await axios.get(url, { timeout: 5000 });
        const latencia = Date.now() - inicio;

        console.log(`[RESULTADO] OK: ${url} responde en ${latencia}ms (Código: ${respuesta.status})`);
    } catch (error) {
        console.log(`[RESULTADO] KO: ${url} no está disponible o ha superado el tiempo de espera.`);
    }
};

// [ES] Confirmación de que el servidor BuhoWeb está activo
// [EN] Confirmation that the BuhoWeb server is active
app.get('/', (req, res) => {
    res.send('<h1>BuhoWeb Activo</h1><p>Versión 0.0.1 - Prueba de Concepto funcionando correctamente.</p>');
});

// [ES] Iniciamos el servidor y realizamos una prueba de monitorización inmediata
// [EN] We start the server and conduct an immediate monitoring test
app.listen(PUERTO, () => {
    console.log(`\n=========================================`);
    console.log(`   BUHOWEB v0.0.1 - PRUEBA DE CONCEPTO`);
    console.log(`   Servidor activo en: http://localhost:${PUERTO}`);
    console.log(`=========================================\n`);

    // [ES] Prueba inicial de conectividad
    // [EN] Initial connectivity test
    comprobarEstado('https://www.google.es');
});