/**
 * Attachment API Client
 * Handles file uploads to Django backend attachment endpoint
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Upload file buffer to Django attachment endpoint
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} jwtToken - JWT token for authentication
 * @param {string} djangoBaseUrl - Base URL of Django backend
 * @param {string} filename - Filename for the upload
 * @param {string} contentType - Content type of the file (optional, will be inferred from filename if not provided)
 * @returns {Promise<number>} Attachment ID
 */
async function uploadFile(fileBuffer, jwtToken, djangoBaseUrl, filename, contentType = null) {
    if (!fileBuffer) {
        throw new Error('File buffer is required');
    }
    
    // Convert Uint8Array to Buffer if needed (Puppeteer returns Uint8Array)
    let buffer;
    if (Buffer.isBuffer(fileBuffer)) {
        buffer = fileBuffer;
    } else if (fileBuffer instanceof Uint8Array) {
        buffer = Buffer.from(fileBuffer);
    } else {
        throw new Error(`Invalid file buffer provided. Expected Buffer or Uint8Array, got ${fileBuffer.constructor.name}`);
    }

    if (!filename) {
        throw new Error('Filename is required');
    }

    // Create form data
    const formData = new FormData();
    const fileContentType = contentType || getContentType(filename);
    
    formData.append('file', buffer, {
        filename: filename,
        contentType: fileContentType
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
        // Django response format could be:
        // - { id: 123, ... }
        // - { success: true, data: { id: 123, ... } }
        // - { attachment_id: 123, ... }
        let attachmentId = null;
        
        if (response.data) {
            // Try direct id
            if (response.data.id) {
                attachmentId = response.data.id;
            }
            // Try nested data.id
            else if (response.data.data && response.data.data.id) {
                attachmentId = response.data.data.id;
            }
            // Try attachment_id
            else if (response.data.attachment_id) {
                attachmentId = response.data.attachment_id;
            }
            // Try nested data.attachment_id
            else if (response.data.data && response.data.data.attachment_id) {
                attachmentId = response.data.data.attachment_id;
            }
        }
        
        if (attachmentId !== null) {
            return attachmentId;
        } else {
            throw new Error(`Invalid response format: missing attachment ID. Response: ${JSON.stringify(response.data)}`);
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
 * @param {string} filePathOrName - File path or filename
 * @returns {string} Content type
 */
function getContentType(filePathOrName) {
    const ext = path.extname(filePathOrName).toLowerCase();
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

/**
 * Upload file from path (legacy support, for backward compatibility)
 * @param {string} filePath - Path to file to upload
 * @param {string} jwtToken - JWT token for authentication
 * @param {string} djangoBaseUrl - Base URL of Django backend
 * @returns {Promise<number>} Attachment ID
 */
async function uploadFileFromPath(filePath, jwtToken, djangoBaseUrl) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    
    return uploadFile(fileBuffer, jwtToken, djangoBaseUrl, filename);
}

module.exports = {
    uploadFile,
    uploadFileFromPath
};

