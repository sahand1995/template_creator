/**
 * Attachment API Client
 * Handles file uploads to Django backend attachment endpoint
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Upload file to Django attachment endpoint
 * @param {string} filePath - Path to file to upload
 * @param {string} jwtToken - JWT token for authentication
 * @param {string} djangoBaseUrl - Base URL of Django backend
 * @returns {Promise<number>} Attachment ID
 */
async function uploadFile(filePath, jwtToken, djangoBaseUrl) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    // Create form data
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    
    formData.append('file', fileStream, {
        filename: fileName,
        contentType: getContentType(filePath)
    });

    // Make request to Django attachment endpoint
    const url = `${djangoBaseUrl}/api/v1/attachments/`;
    
    try {
        const response = await axios.post(url, formData, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // Extract attachment ID from response
        // Django response format: { id: 123, ... }
        if (response.data && response.data.id) {
            return response.data.id;
        } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
            return response.data.id;
        } else {
            throw new Error('Invalid response format: missing attachment ID');
        }
    } catch (error) {
        if (error.response) {
            // Django returned an error response
            const status = error.response.status;
            const data = error.response.data;
            throw new Error(
                `Django API error (${status}): ${JSON.stringify(data)}`
            );
        } else if (error.request) {
            // Request was made but no response received
            throw new Error(`No response from Django backend at ${url}`);
        } else {
            // Error setting up request
            throw new Error(`Request setup error: ${error.message}`);
        }
    }
}

/**
 * Get content type from file extension
 * @param {string} filePath - File path
 * @returns {string} Content type
 */
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
}

module.exports = {
    uploadFile
};

