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
    console.log(`[IMAGE] Starting conversion - Path: "${imagePath}", baseDir: "${baseDir}"`);
    
    try {
        // If it's already a data URI or HTTP(S) URL, return as is
        if (!imagePath) {
            console.log(`[IMAGE] Empty image path, returning empty string`);
            return '';
        }
        
        if (imagePath.startsWith('http')) {
            console.log(`[IMAGE] HTTP(S) URL detected, returning as-is: ${imagePath.substring(0, 50)}...`);
            return imagePath;
        }
        
        if (imagePath.startsWith('data:')) {
            console.log(`[IMAGE] Data URI already provided, returning as-is (length: ${imagePath.length})`);
            return imagePath;
        }
        
        // Resolve the full path
        let fullPath;
        if (path.isAbsolute(imagePath)) {
            fullPath = imagePath;
            console.log(`[IMAGE] Absolute path detected: ${fullPath}`);
        } else if (baseDir) {
            fullPath = path.resolve(baseDir, imagePath);
            console.log(`[IMAGE] Resolved relative path with baseDir: ${fullPath}`);
        } else {
            fullPath = path.resolve(imagePath);
            console.log(`[IMAGE] Resolved relative path without baseDir: ${fullPath}`);
        }
        
        if (!fs.existsSync(fullPath)) {
            console.error(`[IMAGE] ❌ FILE NOT FOUND: ${fullPath}`);
            console.error(`[IMAGE]    Original path: ${imagePath}`);
            console.error(`[IMAGE]    Base directory: ${baseDir}`);
            console.error(`[IMAGE]    Current working directory: ${process.cwd()}`);
            return imagePath; // Return original if not found
        }
        
        console.log(`[IMAGE] ✓ File found: ${fullPath}`);
        const imageBuffer = fs.readFileSync(fullPath);
        const fileSize = (imageBuffer.length / 1024).toFixed(2);
        console.log(`[IMAGE] File size: ${fileSize} KB`);
        
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
        
        console.log(`[IMAGE] Detected MIME type: ${mimeType} (extension: ${ext})`);
        const base64 = imageBuffer.toString('base64');
        const dataURI = `data:${mimeType};base64,${base64}`;
        const dataURISize = (dataURI.length / 1024).toFixed(2);
        console.log(`[IMAGE] ✓ Successfully converted to data URI (${dataURISize} KB)`);
        return dataURI;
    } catch (error) {
        console.error(`[IMAGE] ❌ ERROR converting image: ${error.message}`);
        console.error(`[IMAGE]    Stack: ${error.stack}`);
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
    const { event, rsvp_page, background_images } = sourceData;
    
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
    console.log(`[TRANSFORM] Converting background images...`);
    console.log(`[TRANSFORM] baseDir: ${baseDir}`);
    console.log(`[TRANSFORM] background_images object:`, JSON.stringify(background_images, null, 2));
    
    const heroImage = background_images?.hero 
        ? imageToDataURI(background_images.hero, baseDir)
        : '';
    console.log(`[TRANSFORM] Hero image result: ${heroImage ? heroImage.substring(0, 50) + '...' : 'EMPTY'} (length: ${heroImage.length})`);
    
    const eventDetailsImage = background_images?.event_details
        ? imageToDataURI(background_images.event_details, baseDir)
        : '';
    console.log(`[TRANSFORM] Event details image result: ${eventDetailsImage ? eventDetailsImage.substring(0, 50) + '...' : 'EMPTY'} (length: ${eventDetailsImage.length})`);
    
    const rsvpImage = background_images?.rsvp
        ? imageToDataURI(background_images.rsvp, baseDir)
        : '';
    console.log(`[TRANSFORM] RSVP image result: ${rsvpImage ? rsvpImage.substring(0, 50) + '...' : 'EMPTY'} (length: ${rsvpImage.length})`);
    
    return {
        mainBackground: heroImage,
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

