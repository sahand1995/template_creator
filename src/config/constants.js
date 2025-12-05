/**
 * Template Microservice Configuration Constants
 */

// Supported template types
const TEMPLATE_TYPES = {
    RSVP: 'rsvp'
};

// Supported template sub-types for RSVP
const RSVP_SUB_TYPES = {
    V2: 'v2',
    PREMIUM: 'premium',
    BASIC: 'basic'
};

// File types for attachments
const FILE_TYPES = {
    PDF: 'pdf',
    PNG: 'png',
    JPEG: 'jpeg'
};

// Validation error messages
const VALIDATION_MESSAGES = {
    TEMPLATE_TYPE_REQUIRED: 'template_type is required',
    TEMPLATE_TYPE_INVALID: 'template_type must be "rsvp"',
    TEMPLATE_SUB_TYPE_REQUIRED: 'template_sub_type is required',
    SOURCE_DATA_REQUIRED: 'source_data is required',
    JWT_TOKEN_REQUIRED: 'jwt_token is required',
    EVENT_REQUIRED: 'event is required in source_data',
    EVENT_NAME_REQUIRED: 'event.name is required',
    EVENT_CATEGORY_REQUIRED: 'event.category is required',
    EVENT_START_DATE_REQUIRED: 'event.start_date is required',
    VENUE_REQUIRED: 'event.venue is required',
    VENUE_NAME_REQUIRED: 'event.venue.name is required',
    RSVP_PAGE_REQUIRED: 'rsvp_page is required in source_data',
    RSVP_QUESTIONS_REQUIRED: 'rsvp_page.questions is required and must be an array',
    RSVP_QUESTION_INVALID: 'Each question must have question_text, accept_option_text, and decline_option_text'
};

module.exports = {
    TEMPLATE_TYPES,
    RSVP_SUB_TYPES,
    FILE_TYPES,
    VALIDATION_MESSAGES
};

