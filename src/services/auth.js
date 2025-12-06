/**
 * Authentication Service
 * Handles Django authentication and token caching
 */

const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Django backend and get JWT token
 * @param {string} baseUrl - Django base URL
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} JWT access token
 */
async function authenticate(baseUrl, email, password) {
    const loginUrl = `${baseUrl}/api/v1/user/login/`;
    
    try {
        const response = await axios.post(loginUrl, {
            email: email,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Extract token from response
        // Django API returns: { success: true, data: { access_token: "...", refresh_token: "..." } }
        // Also check for other common formats: { access: "..." }, { token: "..." }, etc.
        const token = response.data.data?.access_token || 
                     response.data.access || 
                     response.data.token || 
                     response.data.access_token;
        
        if (!token) {
            throw new Error('No token received from authentication endpoint. Response structure: ' + JSON.stringify(response.data));
        }

        // Calculate token expiry (default to 1 hour if not provided)
        // JWT tokens typically expire in 1 hour (3600 seconds)
        const expiresIn = response.data.expires_in || 3600;
        tokenExpiry = Date.now() + (expiresIn * 1000);

        return token;
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            throw new Error(
                `Authentication failed (${status}): ${JSON.stringify(data)}`
            );
        } else if (error.request) {
            throw new Error(`No response from Django backend at ${loginUrl}`);
        } else {
            throw new Error(`Authentication error: ${error.message}`);
        }
    }
}

/**
 * Get cached token or authenticate to get new token
 * @param {string} baseUrl - Django base URL
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} JWT access token
 */
async function getToken(baseUrl, email, password) {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    // Token expired or doesn't exist, get new one
    cachedToken = await authenticate(baseUrl, email, password);
    return cachedToken;
}

/**
 * Clear cached token (useful for testing or forced refresh)
 */
function clearToken() {
    cachedToken = null;
    tokenExpiry = null;
}

module.exports = {
    authenticate,
    getToken,
    clearToken
};

