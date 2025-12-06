# Template Microservice

A standalone Node.js/Express microservice for generating RSVP invitation templates. The service validates data, generates PDF and thumbnail files, and uploads them to the Django backend via the attachment endpoint.

## Features

- **REST API**: Single endpoint for template generation
- **Swagger Documentation**: Interactive API documentation at `/api-docs`
- **Data Validation**: Validates RSVP data structure before processing
- **PDF Generation**: Generates high-quality PDF files using Puppeteer
- **Thumbnail Generation**: Creates PNG thumbnails for preview
- **Django Integration**: Automatically uploads files to Django attachment endpoint
- **React SSR**: Server-side rendering with React components
- **Tailwind CSS**: Modern utility-first CSS framework

## Architecture

The microservice is structured as follows:

```
template_microservice/
├── src/
│   ├── server.js              # Express server setup
│   ├── routes/
│   │   └── templates.js       # Template generation route
│   ├── services/
│   │   ├── renderer.js       # PDF/thumbnail generation
│   │   ├── validator.js       # Data validation
│   │   └── attachment.js     # Django API client
│   ├── utils/
│   │   └── dataTransformer.js # Data transformation
│   └── config/
│       ├── constants.js       # Configuration constants
│       └── swagger.js         # Swagger/OpenAPI configuration
├── components/                # React components
├── templates/                 # HTML templates
└── package.json
```

## Installation

1. Install dependencies:
```bash
npm install --ignore-scripts
```

**Note**: On Windows, if you encounter Puppeteer installation errors, use `--ignore-scripts` and then manually install Chromium:
```bash
npx puppeteer browsers install chrome
```

2. Create `.env` file in the root directory:
```bash
PORT=3001
DJANGO_BASE_URL=https://dev-jupiera-api.darkube.app
DJANGO_AUTH_EMAIL=jalali.sahand1995@gmail.com
DJANGO_AUTH_PASSWORD=admin1234
NODE_ENV=development
```

**Note**: Create `.env` manually with the above variables. The service will use defaults if `.env` is not present.

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will start on port 3001 (or the port specified in `.env`).

## API Endpoints

### POST /generate_template

Generate a template (PDF and thumbnail) and upload to Django.

**Request Body:**
```json
{
  "template_type": "rsvp",
  "template_sub_type": "v2",
  "generate_type": "pdf",
  "source_data": {
    "event": {
      "name": "Wedding Celebration",
      "category": "Wedding",
      "start_date": "2024-04-25T17:00:00Z",
      "venue": {
        "name": "Royal Albert Banquet",
        "address_line_1": "134 Maple Street, Newbury hills, California"
      },
      "couple_name_1": "Michelle Smith",
      "couple_name_2": "Thomas Anderson"
    },
    "rsvp_page": {
      "questions": [
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
      "menu_options": [
        {
          "menu_number": 1,
          "appetizer": "Stuffed Mushrooms",
          "main_course": "Finestra's Omi Wagyu Steak",
          "dessert": "Glazed Lemon Tart"
        }
      ],
      "event_details": [
        {
          "event": "Reception",
          "time": "5:00 PM"
        }
      ],
      "dress_code": "Formal",
      "rsvp_deadline": "15th of May"
    },
    "background_images": {
      "hero": "https://example.com/hero.jpg"
    },
    "theme": {
      "box_colour": "#8EA8B3",
      "background_colour": "#D5F5FB"
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "attachment_id": 123,
  "message": "PDF generated and uploaded successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message here",
  "field": "field_name" // Optional, for validation errors
}
```

**Status Codes:**
- `200`: Success
- `400`: Validation error
- `500`: Internal server error
- `502`: Django API error

### GET /api-docs

Interactive Swagger UI documentation. Visit this endpoint in your browser to explore and test the API.

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "template-microservice",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Request Validation

The service validates:

1. **Required Fields:**
   - `template_type`: Must be "rsvp"
   - `template_sub_type`: Required (e.g., "v2", "premium", "basic")
   - `source_data`: Required object
   - `generate_type`: Must be either "pdf" or "thumbnail"

2. **Event Data:**
   - `event.name`: Required string
   - `event.category`: Required string
   - `event.start_date`: Required date
   - `event.venue.name`: Required string

3. **RSVP Page Data:**
   - `rsvp_page.questions`: Required array
   - Each question must have:
     - `question_text`: Required string
     - `accept_option_text`: Required string
     - `decline_option_text`: Required string
     - `allow_maybe`: Optional boolean

## Data Transformation

The service transforms Django model data to the renderer format:

- Event date/time formatting
- Menu options transformation
- RSVP questions mapping
- Background image handling (local paths to data URIs)

## Swagger API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

### Access Swagger UI

Once the server is running, visit:
```
http://localhost:3001/api-docs
```

### Features

- **Interactive Testing**: Try out API endpoints directly from the browser
- **Request/Response Examples**: See example payloads and responses
- **Schema Documentation**: View detailed request and response schemas
- **Try It Out**: Execute requests and see real responses

### Using Swagger UI

1. Start the server: `npm start` or `npm run dev`
2. Open your browser and navigate to `http://localhost:3001/api-docs`
3. Explore the endpoints:
   - Click on an endpoint to expand it
   - Click "Try it out" to test the endpoint
   - Fill in the request body (example provided)
   - Click "Execute" to send the request
   - View the response below

## Environment Variables

- `PORT`: Server port (default: 3001)
- `DJANGO_BASE_URL`: Django backend URL (default: https://dev-jupiera-api.darkube.app)
- `DJANGO_AUTH_EMAIL`: Email for Django authentication (default: jalali.sahand1995@gmail.com)
- `DJANGO_AUTH_PASSWORD`: Password for Django authentication (default: admin1234)
- `NODE_ENV`: Environment (development/production)

## Testing

### 1. Setup Environment

Create a `.env` file in the root directory:
```bash
PORT=3001
DJANGO_BASE_URL=https://dev-jupiera-api.darkube.app
DJANGO_AUTH_EMAIL=jalali.sahand1995@gmail.com
DJANGO_AUTH_PASSWORD=admin1234
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install --ignore-scripts
```

**Note**: On Windows, if you encounter Puppeteer installation errors:
```bash
# Install dependencies first
npm install --ignore-scripts

# Then manually install Chromium (if needed)
npx puppeteer browsers install chrome
```

### 3. Start the Service

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The service will start on `http://localhost:3001` (or your configured PORT).

**Access Swagger UI**: Once the server is running, visit `http://localhost:3001/api-docs` for interactive API documentation.

### 4. Test the Health Endpoint

```bash
# Using curl
curl http://localhost:3001/health

# Using PowerShell (Windows)
Invoke-WebRequest -Uri http://localhost:3001/health -Method GET

# Expected response:
# {
#   "status": "ok",
#   "service": "template-microservice",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

### 5. Test Template Generation

#### Option A: Using curl (Linux/Mac)

```bash
curl -X POST http://localhost:3001/generate_template \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

#### Option B: Using PowerShell (Windows)

```powershell
$body = Get-Content test-request.json -Raw | ConvertFrom-Json | ConvertTo-Json -Depth 10
Invoke-WebRequest -Uri http://localhost:3001/generate_template `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### Option C: Using Postman or Insomnia

1. Create a new POST request to `http://localhost:3001/generate_template`
2. Set header: `Content-Type: application/json`
3. Use the body from `test-request.json`
4. **Important**: Replace `"your-jwt-token-here"` with a valid JWT token from your Django backend

#### Option D: Using Test Script (Recommended)

A comprehensive test script is included: `test-api.js`

```bash
# Run all tests
npm run test-api

# Or directly
node test-api.js

# Test health endpoint only
npm run test-api:health

# Test with custom JWT token
node test-api.js --jwt "your-actual-jwt-token"

# Set JWT token via environment variable
JWT_TOKEN="your-actual-jwt-token" node test-api.js
```

The test script will:
- Test the health endpoint
- Test template generation with valid data
- Test validation error handling
- Provide colored output and detailed error messages

### 6. Test Without Django (Local Testing)

To test the rendering without uploading to Django, you can:

1. **Use the CLI tool** (bypasses Django upload):
```bash
# Generate HTML
npm test

# Generate PDF
npm run test-pdf
```

2. **Mock the Django endpoint** (for development):
   - Use a tool like [Mockoon](https://mockoon.com/) or [json-server](https://github.com/typicode/json-server)
   - Create a mock endpoint at `http://localhost:8000/api/v1/attachments/`
   - Return a mock response: `{ "id": 123 }`

### 7. Expected Responses

#### Success Response (200):
```json
{
  "success": true,
  "attachment_id": 123,
  "message": "PDF generated and uploaded successfully"
}
```

#### Validation Error (400):
```json
{
  "success": false,
  "error": "event.name is required",
  "field": "event.name"
}
```

#### Server Error (500):
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

#### Django API Error (502):
```json
{
  "success": false,
  "error": "Failed to upload file to Django: Django API error (401): Unauthorized"
}
```

### 8. Testing Checklist

- [ ] Service starts without errors
- [ ] Health endpoint returns 200
- [ ] Template generation with valid data returns 200
- [ ] Validation errors return 400 with proper error messages
- [ ] Authentication failures return 502
- [ ] Missing required fields return 400
- [ ] PDF or thumbnail file is generated based on generate_type
- [ ] File is uploaded to Django (if Django is running)
- [ ] Attachment ID is returned in response

## Integration with Django

The Django backend should:

1. Call `POST /generate_template` with:
   - Event data from `Event` model
   - RSVP data from `RSVPPage`, `RSVPQuestion`, `RSVPMenuOption` models
   - `generate_type`: Either "pdf" or "thumbnail" to specify which file type to generate

2. Receive attachment ID for:
   - Generated PDF (if `generate_type` is "pdf")
   - Generated thumbnail (if `generate_type` is "thumbnail")

3. Use attachment ID to create `Archive` records

**Note**: The microservice handles authentication automatically using credentials from environment variables. No JWT token needs to be passed in the request.

## Error Handling

The service handles:

- **Validation Errors**: Returns 400 with field-specific errors
- **Rendering Errors**: Returns 500 with error message
- **Django API Errors**: Returns 502 with upstream error details
- **File System Errors**: Returns 500 with error message

Temporary files are automatically cleaned up on success or error.

## Notes

- All HTML is escaped to prevent XSS attacks
- Images can be URLs or local file paths (converted to data URIs)
- PDF generation uses A4 page size with dynamic height
- React components are server-side rendered
- Tailwind CSS is loaded via CDN

## Troubleshooting

### Service Won't Start
- Check that port 3001 is available
- Verify `.env` file exists and is properly configured
- Ensure all dependencies are installed

### PDF Generation Fails
- Verify Puppeteer is installed correctly
- Check that all background images are accessible
- Ensure sufficient memory is available

### Django Upload Fails
- Verify `DJANGO_BASE_URL` is correct
- Check `DJANGO_AUTH_EMAIL` and `DJANGO_AUTH_PASSWORD` are correct
- Ensure Django attachment endpoint is accessible
- Verify authentication endpoint `/api/v1/user/login/` is accessible

### Validation Errors
- Check request body matches expected format
- Verify all required fields are present
- Ensure data types match expected types
