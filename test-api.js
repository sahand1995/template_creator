/**
 * Test Script for Template Microservice API
 * 
 * Usage:
 *   node test-api.js                    # Test with default settings
 *   node test-api.js --health           # Test health endpoint only
 *   node test-api.js --jwt <token>      # Test with custom JWT token
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const DEFAULT_JWT_TOKEN = process.env.JWT_TOKEN || 'your-jwt-token-here';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠ ${message}`, 'yellow');
}

/**
 * Test health endpoint
 */
async function testHealth() {
    log('\n=== Testing Health Endpoint ===', 'cyan');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        
        if (response.status === 200 && response.data.status === 'ok') {
            logSuccess('Health check passed');
            logInfo(`Service: ${response.data.service}`);
            logInfo(`Timestamp: ${response.data.timestamp}`);
            return true;
        } else {
            logError('Health check failed: Invalid response');
            return false;
        }
    } catch (error) {
        logError(`Health check failed: ${error.message}`);
        if (error.response) {
            logError(`Status: ${error.response.status}`);
            logError(`Data: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

/**
 * Test template generation with valid data
 */
async function testTemplateGeneration(jwtToken) {
    log('\n=== Testing Template Generation ===', 'cyan');
    
    // Load test data
    const testDataPath = path.join(__dirname, 'test-request.json');
    
    if (!fs.existsSync(testDataPath)) {
        logError(`Test data file not found: ${testDataPath}`);
        return false;
    }
    
    let requestData;
    try {
        requestData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    } catch (error) {
        logError(`Failed to parse test data: ${error.message}`);
        return false;
    }
    
    // Replace JWT token
    requestData.jwt_token = jwtToken;
    
    // Check if JWT token is still placeholder
    if (jwtToken === 'your-jwt-token-here' || jwtToken === '') {
        logWarning('Using placeholder JWT token. Django upload will fail.');
        logWarning('Set JWT_TOKEN environment variable or use --jwt flag for full test.');
    }
    
    try {
        logInfo('Sending request to /generate_template...');
        logInfo(`Template Type: ${requestData.template_type}`);
        logInfo(`Template Sub Type: ${requestData.template_sub_type}`);
        
        const startTime = Date.now();
        const response = await axios.post(
            `${API_BASE_URL}/generate_template`,
            requestData,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 120000 // 2 minutes timeout for PDF generation
            }
        );
        const duration = Date.now() - startTime;
        
        if (response.status === 200 && response.data.success) {
            logSuccess('Template generation successful!');
            logInfo(`PDF Attachment ID: ${response.data.pdf_attachment_id}`);
            logInfo(`Thumbnail Attachment ID: ${response.data.thumbnail_attachment_id}`);
            logInfo(`Duration: ${(duration / 1000).toFixed(2)}s`);
            return true;
        } else {
            logError('Template generation failed: Invalid response');
            logError(`Response: ${JSON.stringify(response.data, null, 2)}`);
            return false;
        }
    } catch (error) {
        logError(`Template generation failed: ${error.message}`);
        
        if (error.response) {
            logError(`Status: ${error.response.status}`);
            logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
            
            if (error.response.status === 400) {
                logWarning('This is a validation error. Check your test data format.');
            } else if (error.response.status === 502) {
                logWarning('This is a Django API error. Check your JWT token and Django URL.');
            }
        } else if (error.request) {
            logError('No response received. Is the service running?');
        }
        
        return false;
    }
}

/**
 * Test validation errors
 */
async function testValidationErrors() {
    log('\n=== Testing Validation Errors ===', 'cyan');
    
    const invalidRequests = [
        {
            name: 'Missing template_type',
            data: {
                template_sub_type: 'v2',
                source_data: {},
                jwt_token: 'test'
            }
        },
        {
            name: 'Missing source_data',
            data: {
                template_type: 'rsvp',
                template_sub_type: 'v2',
                jwt_token: 'test'
            }
        },
        {
            name: 'Invalid template_type',
            data: {
                template_type: 'invalid',
                template_sub_type: 'v2',
                source_data: {},
                jwt_token: 'test'
            }
        },
        {
            name: 'Missing event.name',
            data: {
                template_type: 'rsvp',
                template_sub_type: 'v2',
                source_data: {
                    event: {
                        category: 'Wedding',
                        start_date: '2024-04-25T17:00:00Z',
                        venue: { name: 'Test Venue' }
                    },
                    rsvp_page: {
                        questions: []
                    }
                },
                jwt_token: 'test'
            }
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of invalidRequests) {
        try {
            await axios.post(`${API_BASE_URL}/generate_template`, test.data);
            logError(`${test.name}: Expected 400 but got success`);
            failed++;
        } catch (error) {
            if (error.response && error.response.status === 400) {
                logSuccess(`${test.name}: Correctly returned 400`);
                passed++;
            } else {
                logError(`${test.name}: Expected 400 but got ${error.response?.status || 'error'}`);
                failed++;
            }
        }
    }
    
    logInfo(`Validation tests: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

/**
 * Main test function
 */
async function runTests() {
    log('\n' + '='.repeat(50), 'cyan');
    log('Template Microservice API Test Suite', 'cyan');
    log('='.repeat(50) + '\n', 'cyan');
    
    logInfo(`API Base URL: ${API_BASE_URL}`);
    logInfo(`JWT Token: ${DEFAULT_JWT_TOKEN.substring(0, 20)}...`);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const healthOnly = args.includes('--health');
    const jwtIndex = args.indexOf('--jwt');
    const jwtToken = jwtIndex !== -1 && args[jwtIndex + 1] 
        ? args[jwtIndex + 1] 
        : DEFAULT_JWT_TOKEN;
    
    const results = {
        health: false,
        templateGeneration: false,
        validation: false
    };
    
    // Test health endpoint
    results.health = await testHealth();
    
    if (healthOnly) {
        log('\n' + '='.repeat(50), 'cyan');
        log(`Health Test: ${results.health ? 'PASSED' : 'FAILED'}`, results.health ? 'green' : 'red');
        process.exit(results.health ? 0 : 1);
    }
    
    // Test template generation
    if (results.health) {
        results.templateGeneration = await testTemplateGeneration(jwtToken);
    } else {
        logWarning('Skipping template generation test (health check failed)');
    }
    
    // Test validation errors
    if (results.health) {
        results.validation = await testValidationErrors();
    } else {
        logWarning('Skipping validation tests (health check failed)');
    }
    
    // Summary
    log('\n' + '='.repeat(50), 'cyan');
    log('Test Summary', 'cyan');
    log('='.repeat(50), 'cyan');
    log(`Health Check:        ${results.health ? 'PASSED' : 'FAILED'}`, results.health ? 'green' : 'red');
    log(`Template Generation: ${results.templateGeneration ? 'PASSED' : 'FAILED'}`, results.templateGeneration ? 'green' : 'red');
    log(`Validation Tests:    ${results.validation ? 'PASSED' : 'FAILED'}`, results.validation ? 'green' : 'red');
    
    const allPassed = results.health && results.templateGeneration && results.validation;
    log('\n' + '='.repeat(50), 'cyan');
    log(`Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`, allPassed ? 'green' : 'red');
    log('='.repeat(50) + '\n', 'cyan');
    
    process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
});

