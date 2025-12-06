/**
 * Swagger Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Template Microservice API',
            version: '1.0.0',
            description: 'Template rendering microservice for RSVP invitations. Generates PDF and thumbnail files and uploads them to Django backend.',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3001}`,
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                GenerateTemplateRequest: {
                    type: 'object',
                    required: ['template_type', 'template_sub_type', 'source_data', 'generate_type'],
                    properties: {
                        template_type: {
                            type: 'string',
                            example: 'rsvp',
                            description: 'Type of template to generate'
                        },
                        template_sub_type: {
                            type: 'string',
                            example: 'v2',
                            description: 'Sub-type of the template (e.g., v2, premium, basic)'
                        },
                        generate_type: {
                            type: 'string',
                            enum: ['pdf', 'thumbnail'],
                            example: 'pdf',
                            description: 'Type of file to generate and upload to Django attachment API'
                        },
                        source_data: {
                            type: 'object',
                            description: 'Source data from Django models (Event and RSVP data)',
                            properties: {
                                event: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Wedding Celebration' },
                                        category: { type: 'string', example: 'Wedding' },
                                        start_date: { type: 'string', format: 'date-time', example: '2024-04-25T17:00:00Z' },
                                        venue: {
                                            type: 'object',
                                            properties: {
                                                name: { type: 'string', example: 'Royal Albert Banquet' },
                                                address_line_1: { type: 'string', example: '134 Maple Street' }
                                            }
                                        },
                                        couple_name_1: { type: 'string', example: 'Michelle Smith' },
                                        couple_name_2: { type: 'string', example: 'Thomas Anderson' }
                                    }
                                },
                                rsvp_page: {
                                    type: 'object',
                                    properties: {
                                        questions: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    question_text: { type: 'string', example: 'Vegetarian' },
                                                    accept_option_text: { type: 'string', example: 'Yes' },
                                                    decline_option_text: { type: 'string', example: 'No' },
                                                    allow_maybe: { type: 'boolean', example: false }
                                                }
                                            }
                                        },
                                        menu_options: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    menu_number: { type: 'integer', example: 1 },
                                                    appetizer: { type: 'string', example: 'Stuffed Mushrooms' },
                                                    main_course: { type: 'string', example: 'Wagyu Steak' },
                                                    dessert: { type: 'string', example: 'Lemon Tart' }
                                                }
                                            }
                                        },
                                        event_details: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    event: { type: 'string', example: 'Reception' },
                                                    time: { type: 'string', example: '5:00 PM' }
                                                }
                                            }
                                        },
                                        dress_code: { type: 'string', example: 'Formal' },
                                        rsvp_deadline: { type: 'string', example: '15th of May' }
                                    }
                                },
                                background_images: {
                                    type: 'object',
                                    properties: {
                                        hero: { 
                                            type: 'string', 
                                            example: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                                            description: 'Hero image for the invitation header. EventDetails and RSVP section images are automatically loaded from assets folder.'
                                        }
                                    }
                                },
                                theme: {
                                    type: 'object',
                                    properties: {
                                        box_colour: { 
                                            type: 'string', 
                                            example: '#8EA8B3',
                                            description: 'Color code for the box containers in RSVP and Event Details sections'
                                        },
                                        background_colour: { 
                                            type: 'string', 
                                            example: '#D5F5FB',
                                            description: 'Background color for the whole page'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                GenerateTemplateResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        attachment_id: { type: 'integer', example: 123 },
                        message: { type: 'string', example: 'PDF generated and uploaded successfully' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Error message here' },
                        field: { type: 'string', example: 'event.name', nullable: true }
                    }
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'ok' },
                        service: { type: 'string', example: 'template-microservice' },
                        timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

