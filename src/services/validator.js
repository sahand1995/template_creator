/**
 * Data Validation Service
 * Validates source data for template generation
 */

const { TEMPLATE_TYPES, VALIDATION_MESSAGES } = require('../config/constants');

class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Validate RSVP template data
 * @param {Object} sourceData - Source data from Django models
 * @throws {ValidationError} If validation fails
 */
function validateRSVPData(sourceData) {
    if (!sourceData) {
        throw new ValidationError(VALIDATION_MESSAGES.SOURCE_DATA_REQUIRED);
    }

    // Validate event data
    if (!sourceData.event) {
        throw new ValidationError(VALIDATION_MESSAGES.EVENT_REQUIRED);
    }

    const { event, rsvp_page } = sourceData;

    // Validate event fields
    if (!event.name || typeof event.name !== 'string' || event.name.trim() === '') {
        throw new ValidationError(VALIDATION_MESSAGES.EVENT_NAME_REQUIRED, 'event.name');
    }

    if (!event.category || typeof event.category !== 'string' || event.category.trim() === '') {
        throw new ValidationError(VALIDATION_MESSAGES.EVENT_CATEGORY_REQUIRED, 'event.category');
    }

    if (!event.start_date) {
        throw new ValidationError(VALIDATION_MESSAGES.EVENT_START_DATE_REQUIRED, 'event.start_date');
    }

    // Validate venue
    if (!event.venue) {
        throw new ValidationError(VALIDATION_MESSAGES.VENUE_REQUIRED, 'event.venue');
    }

    if (!event.venue.name || typeof event.venue.name !== 'string' || event.venue.name.trim() === '') {
        throw new ValidationError(VALIDATION_MESSAGES.VENUE_NAME_REQUIRED, 'event.venue.name');
    }

    // Validate RSVP page data
    if (!rsvp_page) {
        throw new ValidationError(VALIDATION_MESSAGES.RSVP_PAGE_REQUIRED);
    }

    // Validate RSVP questions
    if (!rsvp_page.questions || !Array.isArray(rsvp_page.questions)) {
        throw new ValidationError(VALIDATION_MESSAGES.RSVP_QUESTIONS_REQUIRED, 'rsvp_page.questions');
    }

    // Validate each question structure
    rsvp_page.questions.forEach((question, index) => {
        if (!question.question_text || typeof question.question_text !== 'string') {
            throw new ValidationError(
                `${VALIDATION_MESSAGES.RSVP_QUESTION_INVALID} (question ${index + 1}: missing question_text)`,
                `rsvp_page.questions[${index}].question_text`
            );
        }

        if (!question.accept_option_text || typeof question.accept_option_text !== 'string') {
            throw new ValidationError(
                `${VALIDATION_MESSAGES.RSVP_QUESTION_INVALID} (question ${index + 1}: missing accept_option_text)`,
                `rsvp_page.questions[${index}].accept_option_text`
            );
        }

        if (!question.decline_option_text || typeof question.decline_option_text !== 'string') {
            throw new ValidationError(
                `${VALIDATION_MESSAGES.RSVP_QUESTION_INVALID} (question ${index + 1}: missing decline_option_text)`,
                `rsvp_page.questions[${index}].decline_option_text`
            );
        }

        // allow_maybe is optional, but if present should be boolean
        if (question.allow_maybe !== undefined && typeof question.allow_maybe !== 'boolean') {
            throw new ValidationError(
                `allow_maybe must be a boolean (question ${index + 1})`,
                `rsvp_page.questions[${index}].allow_maybe`
            );
        }
    });

    // Validate menu options if provided (optional)
    if (rsvp_page.menu_options !== undefined) {
        if (!Array.isArray(rsvp_page.menu_options)) {
            throw new ValidationError(
                'rsvp_page.menu_options must be an array',
                'rsvp_page.menu_options'
            );
        }

        rsvp_page.menu_options.forEach((menu, index) => {
            if (!menu.menu_number && menu.menu_number !== 0) {
                throw new ValidationError(
                    `menu_options[${index}].menu_number is required`,
                    `rsvp_page.menu_options[${index}].menu_number`
                );
            }
        });
    }

    // Validate event details if provided (optional)
    if (rsvp_page.event_details !== undefined) {
        if (!Array.isArray(rsvp_page.event_details)) {
            throw new ValidationError(
                'rsvp_page.event_details must be an array',
                'rsvp_page.event_details'
            );
        }
    }

    return true;
}

/**
 * Validate template type and sub-type
 * @param {string} templateType - Template type
 * @param {string} templateSubType - Template sub-type
 * @throws {ValidationError} If validation fails
 */
function validateTemplateType(templateType, templateSubType) {
    if (!templateType) {
        throw new ValidationError(VALIDATION_MESSAGES.TEMPLATE_TYPE_REQUIRED);
    }

    if (templateType !== TEMPLATE_TYPES.RSVP) {
        throw new ValidationError(VALIDATION_MESSAGES.TEMPLATE_TYPE_INVALID);
    }

    if (!templateSubType) {
        throw new ValidationError(VALIDATION_MESSAGES.TEMPLATE_SUB_TYPE_REQUIRED);
    }

    return true;
}

module.exports = {
    validateRSVPData,
    validateTemplateType,
    ValidationError
};

