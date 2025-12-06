/**
 * Data Transformer Utility
 * Transforms Django model data structure to renderer format
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert local image file to base64 data URI
 */
function imageToDataURI(imagePath, baseDir = null) {
    try {
        // If it's already a data URI or HTTP(S) URL, return as is
        if (!imagePath) {
            return '';
        }
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // Resolve the full path
        let fullPath;
        if (path.isAbsolute(imagePath)) {
            fullPath = imagePath;
        } else if (baseDir) {
            fullPath = path.resolve(baseDir, imagePath);
        } else {
            fullPath = path.resolve(imagePath);
        }
        
        if (!fs.existsSync(fullPath)) {
            return imagePath; // Return original if not found
        }
        
        const imageBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        let mimeType = 'image/png';
        
        if (ext === '.jpg' || ext === '.jpeg') {
            mimeType = 'image/jpeg';
        } else if (ext === '.png') {
            mimeType = 'image/png';
        } else if (ext === '.gif') {
            mimeType = 'image/gif';
        } else if (ext === '.webp') {
            mimeType = 'image/webp';
        }
        
        const base64 = imageBuffer.toString('base64');
        const dataURI = `data:${mimeType};base64,${base64}`;
        return dataURI;
    } catch (error) {
        return imagePath; // Return original on error
    }
}

/**
 * Format event date and time from Django datetime
 * @param {string|Date} startDate - Event start date
 * @returns {string} Formatted date time string
 */
function formatEventDateTime(startDate) {
    if (!startDate) return '';
    
    try {
        const date = new Date(startDate);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateStr = date.toLocaleDateString('en-US', options);
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Format: "Saturday, 25th of April | 05:00 PM"
        // Extract day number and add ordinal suffix
        const day = date.getDate();
        const daySuffix = getOrdinalSuffix(day);
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        
        return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${day}${daySuffix} of ${month} | ${timeStr}`;
    } catch (error) {
        console.warn(`Error formatting date: ${error.message}`);
        return '';
    }
}

/**
 * Get ordinal suffix for day number
 */
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

/**
 * Transform Django RSVP data to renderer format
 * @param {Object} sourceData - Source data from Django models
 * @param {string} baseDir - Base directory for resolving image paths (optional)
 * @returns {Object} Transformed data for renderer
 */
function transformRSVPData(sourceData, baseDir = null) {
    const { event, rsvp_page, background_images, theme } = sourceData;
    
    // Set baseDir to project root if not provided
    if (!baseDir) {
        baseDir = path.resolve(path.join(__dirname, '..', '..'));
    }
    
    // Format event date and time
    const eventDateTime = formatEventDateTime(event.start_date);
    const [eventDate, eventTime] = eventDateTime.split(' | ').map(s => s.trim());
    
    // Transform menu options
    const menus = [];
    if (rsvp_page.menu_options && Array.isArray(rsvp_page.menu_options)) {
        rsvp_page.menu_options.forEach((menu, index) => {
            menus.push({
                title: `Menu ${menu.menu_number || (index + 1)}`,
                items: {
                    appetizer: menu.appetizer || '',
                    mainCourse: menu.main_course || '',
                    dessert: menu.dessert || ''
                }
            });
        });
    }
    
    // Transform RSVP questions
    const rsvpQuestions = rsvp_page.questions.map(q => ({
        question: q.question_text || '',
        options: [
            q.accept_option_text || 'Yes',
            ...(q.allow_maybe ? ['Maybe'] : []),
            q.decline_option_text || 'No'
        ]
    }));
    
    // Get menu options for RSVP
    const menuOptions = menus.map(m => m.title);
    
    // Transform event details
    const eventDetails = [];
    if (rsvp_page.event_details && Array.isArray(rsvp_page.event_details)) {
        rsvp_page.event_details.forEach(detail => {
            eventDetails.push({
                event: detail.event || detail.name || '',
                time: detail.time || ''
            });
        });
    }
    
    // Convert background images to data URIs
    const heroImage = background_images?.hero 
        ? imageToDataURI(background_images.hero, baseDir)
        : '';
    
    // Use assets images for EventDetails and RSVP sections
    const eventDetailsImagePath = path.join(baseDir, 'assets', 'rsvp', 'rsvp_event_details.png');
    const rsvpImagePath = path.join(baseDir, 'assets', 'rsvp', 'rsvp_questions.png');
    
    const eventDetailsImage = imageToDataURI(eventDetailsImagePath, baseDir);
    const rsvpImage = imageToDataURI(rsvpImagePath, baseDir);
    
    return {
        mainBackground: heroImage,
        theme: {
            boxColour: theme?.box_colour || 'rgba(101,67,33,0.45)',
            backgroundColour: theme?.background_colour || '#ffffff'
        },
        eventInfo: {
            eventName: event.name || '',
            eventDate: eventDate || '',
            eventTime: eventTime || '',
            venueName: event.venue?.name || '',
            venueAddress: event.venue?.address_line_1 || '',
            coupleName1: event.couple_name_1 || '',
            coupleName2: event.couple_name_2 || ''
        },
        eventDetails: {
            backgroundImage: eventDetailsImage,
            events: eventDetails,
            dressCode: rsvp_page.dress_code || ''
        },
        menus: menus,
        rsvp: {
            backgroundImage: rsvpImage,
            deadline: rsvp_page.rsvp_deadline || '',
            attendanceOptions: ['Joyfully Accepts', 'Maybe', 'Regretfully Declines'],
            menuOptions: menuOptions,
            questions: rsvpQuestions
        }
    };
}

module.exports = {
    transformRSVPData,
    imageToDataURI,
    formatEventDateTime
};

