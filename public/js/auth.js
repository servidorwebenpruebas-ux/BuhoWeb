/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUHOWEB - v1.0.0 - MVP
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * [ES] Módulo para gestionar el token JWT en el navegador:
 *      - Guardar token después de login exitoso
 *      - Recuperar token para incluirlo en peticiones autenticadas
 *      - Comprobar si el usuario tiene sesión activa
 *      - Cerrar sesión eliminando el token
 *
 * [EN] Module to manage JWT token in the browser:
 *      - Save token after successful login
 *      - Retrieve token to include in authenticated requests
 *      - Check if user has active session
 *      - Log out by deleting the token
 * ═══════════════════════════════════════════════════════════════════════════
 */

// [ES] Objeto Auth que contiene funciones de autenticación | [EN] Auth object containing authentication functions
const Auth = {

    /**
     * [ES] saveSession: Guarda el token JWT en localStorage con la clave 'buho_token' para recuperarlo después
     * [EN] saveSession: Saves JWT token in localStorage with key 'buho_token' to retrieve it later
     */
    saveSession(token) { 
        localStorage.setItem('buho_token', token); 
    },
    
    /**
     * [ES] getToken: Recupera el token del navegador en formato Bearer
     *      Devuelve el token listo para usar en el header de autenticación
     *      Ejemplo: "Bearer eyJhbGc..."
     *
     * [EN] getToken: Retrieves token from browser in Bearer format
     *      Returns the token ready to use in authentication header
     *      Example: "Bearer eyJhbGc..."
     */
    getToken() {
        // [ES] Obtener token de localStorage | [EN] Get token from localStorage
        const token = localStorage.getItem('buho_token');
        
        // [ES] Si existe el token, devolverlo con prefijo "Bearer " | [EN] If token exists, return it with "Bearer " prefix
        return token ? `Bearer ${token}` : null;
    },

    /**
     * [ES] isLoggedIn: Verifica si el usuario está autenticado. Retorna true/false según si hay token en localStorage
     * [EN] isLoggedIn: Checks if user is authenticated. Returns true/false based on whether token exists in localStorage
     */
    isLoggedIn() {
        // [ES] Comprobar si existe la clave 'buho_token' en localStorage | [EN] Check if 'buho_token' key exists in localStorage
        return !!localStorage.getItem('buho_token'); 
    },

    /**
     * [ES] logout: Cierra la sesión del usuario
     *      Elimina todos los datos de localStorage
     *      Redirige a la página de login
     *
     * [EN] logout: Closes user session
     *      Deletes all localStorage data
     *      Redirects to login page
     */
    logout() { 
        // [ES] Limpiar todo localStorage (elimina el token y otros datos) | [EN] Clear all localStorage (removes token and other data)
        localStorage.clear();
        // [ES] Redirigir al usuario a la página de inicio/login | [EN] Redirect user to home/login page
        window.location.href = 'index.html'; 
    }
};