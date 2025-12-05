# RSVP Template Renderer - React + Tailwind CSS

A modern, component-based JavaScript microservice for rendering dynamic RSVP wedding invitation templates using React and Tailwind CSS.

## Features

- **React Components**: Fully component-based architecture with reusable components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Dynamic Menu Rendering**: Automatically renders any number of menus from JSON
- **Dynamic RSVP Questions**: Generates form questions and options from JSON configuration
- **Elegant Typography**: Uses Playfair Display and Cormorant Garamond for elegant serif fonts
- **Soft Pastel Design**: Beautiful #F4E7EC background with elegant styling
- **PDF Generation**: Optional PDF output using Puppeteer

## Architecture

The template is built using React components:

- `<HeroSection />` - Full-width hero image with couple photo
- `<InvitationText />` - Couple names, date, and venue details
- `<EventDetails />` - Event schedule and dress code
- `<MenuSection />` - Dynamic menu rendering
- `<RSVPForm />` - Dynamic RSVP form with questions

## Installation

```bash
npm install --ignore-scripts
```

**Note**: On Windows, if you encounter installation errors, use `--ignore-scripts` and then manually install Chromium:
```bash
npx puppeteer browsers install chrome
```

## Usage

### Basic Usage (HTML Output)

```bash
# From file
node render-rsvp-react.js input.json output.html

# From stdin
cat input.json | node render-rsvp-react.js > output.html
```

### Generate PDF

```bash
# Generate PDF
node render-rsvp-react.js input.json output.pdf --pdf

# Or use -p flag
node render-rsvp-react.js input.json output.pdf -p
```

## Input JSON Format

The script expects a JSON object with the following structure:

```json
{
  "couple_name_1": "Michelle Smith",
  "couple_name_2": "Thomas Anderson",
  "event_date_time": "Saturday, 25th of April | 05:00 PM",
  "venue_name": "Royal Albert Banquet",
  "venue_address": "134 Maple Street, Newbury hills, California",
  
  "event_details": [
    {
      "event": "Reception",
      "time": "5:00 PM"
    },
    {
      "event": "Ceremony",
      "time": "6:30 PM"
    },
    {
      "event": "Dinner",
      "time": "9:00 PM"
    }
  ],
  
  "dress_code": "Formal",
  
  "menu_options": [
    {
      "menu_number": 1,
      "appetizer": "Stuffed Mushrooms",
      "main_course": "Finestra's Omi Wagyu Steak with Garlic mashed Potatto",
      "dessert": "Glazed Lemon Tart"
    },
    {
      "menu_number": 2,
      "appetizer": "Garlic Butter Lobster",
      "main_course": "Filet Mignon in mushroom wine sauce",
      "dessert": "Chocolate Raspberry Truffle"
    }
  ],
  
  "rsvp_questions": [
    {
      "question_text": "Vegetarian",
      "accept_option_text": "Yes",
      "decline_option_text": "No",
      "allow_maybe": false
    },
    {
      "question_text": "Gluten-free",
      "accept_option_text": "Yes",
      "decline_option_text": "No",
      "allow_maybe": false
    }
  ],
  
  "rsvp_deadline": "15th of May",
  
  "background_images": {
    "hero": "https://example.com/hero-image.jpg",
    "event_details": "https://example.com/event-details-bg.jpg",
    "rsvp": "https://example.com/rsvp-bg.jpg"
  }
}
```

## Component Structure

### MenuSection Component

The `MenuSection` component dynamically renders menus from the `menu_options` array. Each menu is automatically formatted with:
- Menu title (Menu 1, Menu 2, etc.)
- Appetizer, Main Course, and Dessert items
- Vertical separators (|) between course type and dish name
- Horizontal dividers between menu groups

### RSVPForm Component

The `RSVPForm` component dynamically generates:
- Attendance question with radio buttons (Joyfully Accepts, Maybe, Regretfully Declines)
- Menu selection based on available menus
- Dependent question (Yes/No)
- Dynamic RSVP questions from `rsvp_questions` array
- Dependent menu selection (if applicable)

All form elements are generated from JSON configuration, making it easy to add new questions without code changes.

## Design Features

- **Typography**: Playfair Display and Cormorant Garamond for elegant serif fonts
- **Colors**: Soft pastel background (#F4E7EC) with dark text
- **Layout**: Full-width vertical sections with proper spacing
- **Decorative Elements**: Swirls and olive branch icons
- **Radio Buttons**: Solid dark circles matching the design

## Integration with Django Backend

This script is designed to be called from the Django backend's `render-with-data` endpoint. The Django service should:

1. Fetch RSVP data from models (Event, RSVPPage, RSVPQuestion, RSVPMenuOption)
2. Transform data into the JSON format expected by this script
3. Call this script with the JSON data
4. Receive the rendered HTML or PDF
5. Save to MinIO and create Archive records

## Example

```bash
# Test with sample data
node render-rsvp-react.js test-data.json output.html

# Generate PDF
node render-rsvp-react.js test-data.json output.pdf --pdf
```

## Notes

- All HTML is escaped to prevent XSS attacks
- Images should be accessible URLs (not local file paths) for PDF generation
- The template uses A4 page size (210mm x 297mm)
- React components are server-side rendered for optimal PDF generation
- Tailwind CSS is loaded via CDN for simplicity

## Troubleshooting

### React Not Found
If you get "Cannot find module 'react'", run:
```bash
npm install --ignore-scripts
```

### PDF Generation Fails
- Ensure Puppeteer is properly installed
- Check that all background images are accessible
- Verify the HTML renders correctly first (without --pdf flag)

### Component Errors
- Ensure all component files are in the `components/` directory
- Check that the JSON data matches the expected format
