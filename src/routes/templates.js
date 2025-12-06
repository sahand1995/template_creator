/**
 * Template Generation Routes
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateRSVPData, validateTemplateType, ValidationError } = require('../services/validator');
const { transformRSVPData } = require('../utils/dataTransformer');
const { generateTemplate } = require('../services/renderer');
const { uploadFile } = require('../services/attachment');
const { VALIDATION_MESSAGES } = require('../config/constants');

/**
 * @swagger
 * /generate_template:
 *   post:
 *     summary: Generate template (PDF and thumbnail) and upload to Django
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateTemplateRequest'
 *           examples:
 *             minimal:
 *               summary: Minimal data example
 *               description: Example with minimal data - 1 question, 1 event detail, 1 menu option
 *               value:
 *                 template_type: "rsvp"
 *                 template_sub_type: "v2"
 *                 source_data:
 *                   event:
 *                     name: "Intimate Wedding"
 *                     category: "Wedding"
 *                     start_date: "2024-06-15T18:00:00Z"
 *                     venue:
 *                       name: "Garden Pavilion"
 *                       address_line_1: "123 Rose Lane, Spring Valley"
 *                     couple_name_1: "Emma Wilson"
 *                     couple_name_2: "James Brown"
 *                   rsvp_page:
 *                     questions:
 *                       - question_text: "Dietary Restrictions"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: false
 *                     menu_options:
 *                       - menu_number: 1
 *                         appetizer: "Caesar Salad"
 *                         main_course: "Grilled Salmon"
 *                         dessert: "Chocolate Cake"
 *                     event_details:
 *                       - event: "Ceremony"
 *                         time: "6:00 PM"
 *                     dress_code: "Semi-Formal"
 *                     rsvp_deadline: "1st of June"
 *                   background_images:
 *                     hero: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
 *                     event_details: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
 *                     rsvp: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800"
 *                   theme:
 *                     box_colour: "#8EA8B3"
 *                     background_colour: "#D5F5FB"
 *                 jwt_token: "your-jwt-token-here"
 *             standard:
 *               summary: Standard data example
 *               description: Example with standard data - 3 questions, 3 event details, 2 menu options
 *               value:
 *                 template_type: "rsvp"
 *                 template_sub_type: "v2"
 *                 source_data:
 *                   event:
 *                     name: "Wedding Celebration"
 *                     category: "Wedding"
 *                     start_date: "2024-04-25T17:00:00Z"
 *                     venue:
 *                       name: "Royal Albert Banquet"
 *                       address_line_1: "134 Maple Street, Newbury hills, California"
 *                     couple_name_1: "Michelle Smith"
 *                     couple_name_2: "Thomas Anderson"
 *                   rsvp_page:
 *                     questions:
 *                       - question_text: "Vegetarian"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: false
 *                       - question_text: "Allergies"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: false
 *                       - question_text: "Transportation Needed"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: true
 *                     menu_options:
 *                       - menu_number: 1
 *                         appetizer: "Stuffed Mushrooms"
 *                         main_course: "Wagyu Steak"
 *                         dessert: "Lemon Tart"
 *                       - menu_number: 2
 *                         appetizer: "Bruschetta"
 *                         main_course: "Grilled Chicken"
 *                         dessert: "Tiramisu"
 *                     event_details:
 *                       - event: "Reception"
 *                         time: "5:00 PM"
 *                       - event: "Dinner"
 *                         time: "7:00 PM"
 *                       - event: "Dancing"
 *                         time: "9:00 PM"
 *                     dress_code: "Formal"
 *                     rsvp_deadline: "15th of May"
 *                   background_images:
 *                     hero: "./young-wedding-couple-together-field 1.png"
 *                     event_details: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
 *                     rsvp: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800"
 *                   theme:
 *                     box_colour: "#8EA8B3"
 *                     background_colour: "#D5F5FB"
 *                 jwt_token: "your-jwt-token-here"
 *             extensive:
 *               summary: Extensive data example
 *               description: Example with extensive data - 5 questions, 5 event details, 4 menu options
 *               value:
 *                 template_type: "rsvp"
 *                 template_sub_type: "v2"
 *                 source_data:
 *                   event:
 *                     name: "Grand Wedding Celebration"
 *                     category: "Wedding"
 *                     start_date: "2024-08-10T16:00:00Z"
 *                     venue:
 *                       name: "Luxury Grand Hotel & Resort"
 *                       address_line_1: "500 Grand Boulevard, Metropolitan City, State 12345"
 *                     couple_name_1: "Sophia Martinez"
 *                     couple_name_2: "Alexander Johnson"
 *                   rsvp_page:
 *                     questions:
 *                       - question_text: "Vegetarian Option"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: false
 *                       - question_text: "Vegan Option"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: false
 *                       - question_text: "Gluten-Free Option"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: false
 *                       - question_text: "Food Allergies"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: true
 *                       - question_text: "Transportation Required"
 *                         accept_option_text: "Yes"
 *                         decline_option_text: "No"
 *                         allow_maybe: false
 *                     menu_options:
 *                       - menu_number: 1
 *                         appetizer: "Lobster Bisque"
 *                         main_course: "Prime Rib with Roasted Vegetables"
 *                         dessert: "New York Cheesecake"
 *                       - menu_number: 2
 *                         appetizer: "Caprese Salad"
 *                         main_course: "Herb-Crusted Salmon"
 *                         dessert: "Chocolate Lava Cake"
 *                       - menu_number: 3
 *                         appetizer: "Beef Carpaccio"
 *                         main_course: "Filet Mignon"
 *                         dessert: "Crème Brûlée"
 *                       - menu_number: 4
 *                         appetizer: "Shrimp Cocktail"
 *                         main_course: "Chicken Marsala"
 *                         dessert: "Apple Pie"
 *                     event_details:
 *                       - event: "Welcome Reception"
 *                         time: "4:00 PM"
 *                       - event: "Ceremony"
 *                         time: "5:00 PM"
 *                       - event: "Cocktail Hour"
 *                         time: "6:00 PM"
 *                       - event: "Dinner"
 *                         time: "7:00 PM"
 *                       - event: "Reception & Dancing"
 *                         time: "9:00 PM"
 *                     dress_code: "Black Tie Optional"
 *                     rsvp_deadline: "1st of August"
 *                   background_images:
 *                     hero: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
 *                     event_details: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
 *                     rsvp: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800"
 *                   theme:
 *                     box_colour: "#8EA8B3"
 *                     background_colour: "#D5F5FB"
 *                 jwt_token: "your-jwt-token-here"
 *     responses:
 *       200:
 *         description: Template generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateTemplateResponse'
 *             example:
 *               success: true
 *               pdf_attachment_id: 123
 *               thumbnail_attachment_id: 124
 *               message: "Template generated successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "event.name is required"
 *               field: "event.name"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Django API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/generate_template', async (req, res) => {
    let pdfPath = null;
    let thumbnailPath = null;
    
    try {
        // Validate request body
        const { template_type, template_sub_type, source_data, jwt_token } = req.body;
        
        // Validate required fields
        if (!template_type) {
            return res.status(400).json({
                success: false,
                error: VALIDATION_MESSAGES.TEMPLATE_TYPE_REQUIRED
            });
        }
        
        if (!template_sub_type) {
            return res.status(400).json({
                success: false,
                error: VALIDATION_MESSAGES.TEMPLATE_SUB_TYPE_REQUIRED
            });
        }
        
        if (!source_data) {
            return res.status(400).json({
                success: false,
                error: VALIDATION_MESSAGES.SOURCE_DATA_REQUIRED
            });
        }
        
        // jwt_token is optional now (commented out Django upload)
        // if (!jwt_token) {
        //     return res.status(400).json({
        //         success: false,
        //         error: VALIDATION_MESSAGES.JWT_TOKEN_REQUIRED
        //     });
        // }
        
        // Validate template type
        try {
            validateTemplateType(template_type, template_sub_type);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        // Validate source data based on template type
        if (template_type === 'rsvp') {
            try {
                validateRSVPData(source_data);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                    field: error.field || null
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                error: `Unsupported template type: ${template_type}`
            });
        }
        
        // Transform data (pass base directory for image resolution)
        let transformedData;
        if (template_type === 'rsvp') {
            // Use project root as base directory for resolving relative image paths
            // __dirname is src/routes, so we go up two levels to get project root
            const baseDir = path.resolve(path.join(__dirname, '..', '..'));
            transformedData = transformRSVPData(source_data, baseDir);
        } else {
            return res.status(400).json({
                success: false,
                error: `Unsupported template type: ${template_type}`
            });
        }
        
        // Generate output file paths (save locally)
        const outputDir = path.join(__dirname, '..', '..', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        pdfPath = path.join(outputDir, `template-${timestamp}.pdf`);
        thumbnailPath = path.join(outputDir, `template-${timestamp}.png`);
        
        // Generate PDF and thumbnail
        await generateTemplate(transformedData, pdfPath, thumbnailPath);
        
        // TODO: Commented out for now - will re-enable after fixing image loading issue
        // Get Django base URL from environment
        // const djangoBaseUrl = process.env.DJANGO_BASE_URL || 'http://localhost:8000';
        
        // Upload files to Django
        // let pdfAttachmentId, thumbnailAttachmentId;
        // try {
        //     [pdfAttachmentId, thumbnailAttachmentId] = await Promise.all([
        //         uploadFile(pdfPath, jwt_token, djangoBaseUrl),
        //         uploadFile(thumbnailPath, jwt_token, djangoBaseUrl)
        //     ]);
        // } catch (error) {
        //     return res.status(502).json({
        //         success: false,
        //         error: `Failed to upload files to Django: ${error.message}`
        //     });
        // }
        
        // Files are saved locally - no cleanup needed
        
        // Return success response with file paths
        return res.status(200).json({
            success: true,
            pdf_path: pdfPath,
            thumbnail_path: thumbnailPath,
            pdf_url: `/output/${path.basename(pdfPath)}`,
            thumbnail_url: `/output/${path.basename(thumbnailPath)}`,
            message: 'Template generated successfully and saved locally'
            // pdf_attachment_id: pdfAttachmentId,
            // thumbnail_attachment_id: thumbnailAttachmentId,
        });
        
    } catch (error) {
        // Keep files on error for debugging - don't clean up
        console.error('Template generation error:', error);
        
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
            // Include file paths if they exist (for debugging)
            pdf_path: pdfPath && fs.existsSync(pdfPath) ? pdfPath : null,
            thumbnail_path: thumbnailPath && fs.existsSync(thumbnailPath) ? thumbnailPath : null
        });
    }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "ok"
 *               service: "template-microservice"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'template-microservice',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

