/**
 * Simple server startup script to ensure output is visible
 */

console.log('Starting Template Microservice...\n');

try {
    require('./src/server.js');
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}

