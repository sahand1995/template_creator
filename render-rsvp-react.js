const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

/**
 * Load and parse JSON data from file or stdin
 */
function loadData(inputFile) {
    let data;
    
    if (inputFile) {
        const filePath = path.resolve(inputFile);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const fileContent = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(fileContent);
    } else {
        const stdin = fs.readFileSync(0, 'utf8');
        if (!stdin.trim()) {
            throw new Error('No input data provided. Use a file or pipe JSON to stdin.');
        }
        data = JSON.parse(stdin);
    }
    
    return data;
}

/**
 * Transform data to match component structure
 */
function transformData(data) {
    // Transform menu options to the new format
    const menus = data.menu_options ? data.menu_options.map((menu, index) => ({
        title: `Menu ${menu.menu_number || (index + 1)}`,
        items: {
            'Appetizer': menu.appetizer || '',
            'Main Course': menu.main_course || '',
            'Dessert': menu.dessert || ''
        }
    })) : [];

    // Transform RSVP data
    const rsvp = {
        attendanceOptions: ['Joyfully Accepts', 'Maybe', 'Regretfully Declines'],
        menuSelectionEnabled: menus.length > 0,
        dependentEnabled: true,
        deadline: data.rsvp_deadline || '',
        questions: data.rsvp_questions ? data.rsvp_questions.map(q => ({
            questionText: q.question_text,
            options: [
                q.accept_option_text || 'Yes',
                ...(q.allow_maybe ? ['Maybe'] : []),
                q.decline_option_text || 'No'
            ]
        })) : []
    };

    return {
        coupleName1: data.couple_name_1 || '',
        coupleName2: data.couple_name_2 || '',
        eventDateTime: data.event_date_time || '',
        venueName: data.venue_name || '',
        venueAddress: data.venue_address || '',
        eventDetails: data.event_details || [],
        dressCode: data.dress_code || '',
        menus: menus,
        rsvp: rsvp,
        backgroundImages: data.background_images || {}
    };
}

/**
 * React Components using React.createElement
 */
function createComponents() {
    const HeroSection = ({ backgroundImage }) => {
        return React.createElement('div', {
            className: 'w-full h-[70vh] bg-cover bg-center bg-no-repeat relative',
            style: { backgroundImage: `url('${backgroundImage}')` }
        });
    };

    const InvitationText = ({ coupleName1, coupleName2, eventDateTime, venueName, venueAddress }) => {
        const Swirl = () => React.createElement('svg', {
            className: 'w-8 h-8 opacity-60',
            viewBox: '0 0 100 100',
            xmlns: 'http://www.w3.org/2000/svg'
        }, React.createElement('path', {
            d: 'M50,20 Q30,40 20,50 Q10,60 20,70 Q30,80 50,80 Q70,80 80,70 Q90,60 80,50 Q70,40 50,20',
            stroke: 'currentColor',
            strokeWidth: '2',
            fill: 'none',
            opacity: '0.4'
        }));

        return React.createElement('div', {
            className: 'w-full bg-[#F4E7EC] py-16 px-12 flex flex-col items-center'
        },
            React.createElement('div', { className: 'self-start mb-6' }, React.createElement(Swirl)),
            React.createElement('div', { className: 'flex items-center gap-4 my-6' },
                React.createElement('span', { className: 'font-serif text-5xl text-gray-800 font-normal' }, coupleName1),
                React.createElement('span', { className: 'font-serif text-4xl text-gray-800 italic' }, '&'),
                React.createElement('span', { className: 'font-serif text-5xl text-gray-800 font-normal' }, coupleName2)
            ),
            React.createElement('p', { className: 'text-lg text-gray-700 my-4 text-center font-serif' }, 'invite you to their wedding'),
            React.createElement('div', { className: 'my-6' }, React.createElement(Swirl)),
            React.createElement('div', { className: 'text-center mt-6' },
                React.createElement('div', { className: 'text-2xl font-semibold text-gray-800 my-3 font-serif' }, eventDateTime),
                React.createElement('div', { className: 'text-xl text-gray-700 my-2 font-serif' }, venueName),
                React.createElement('div', { className: 'text-base text-gray-600 my-1 font-serif' }, venueAddress)
            ),
            React.createElement('div', { className: 'self-end mt-6' }, React.createElement(Swirl))
        );
    };

    const EventDetails = ({ eventDetails, dressCode, backgroundImage }) => {
        return React.createElement('div', {
            className: 'w-full min-h-[300px] relative flex items-center justify-center',
            style: {
                backgroundImage: `url('${backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(3px)'
            }
        },
            React.createElement('div', {
                className: 'absolute inset-0 bg-gray-900/85 flex flex-col items-center justify-center px-12 py-10'
            },
                React.createElement('svg', {
                    className: 'w-10 h-10 mb-4 opacity-80',
                    viewBox: '0 0 100 100',
                    xmlns: 'http://www.w3.org/2000/svg'
                },
                    React.createElement('path', {
                        d: 'M50,10 L45,30 L40,50 L35,70 L30,90 M50,10 L55,30 L60,50 L65,70 L70,90',
                        stroke: '#ffffff',
                        strokeWidth: '3',
                        fill: 'none',
                        opacity: '0.7'
                    }),
                    React.createElement('circle', { cx: '35', cy: '50', r: '3', fill: '#ffffff', opacity: '0.7' }),
                    React.createElement('circle', { cx: '65', cy: '50', r: '3', fill: '#ffffff', opacity: '0.7' })
                ),
                React.createElement('h2', { className: 'text-3xl text-white mb-6 text-center font-serif font-semibold' }, 'Event Details'),
                React.createElement('ul', { className: 'list-none w-full max-w-md space-y-3' },
                    eventDetails.map((detail, index) =>
                        React.createElement('li', {
                            key: index,
                            className: 'flex items-center justify-center py-2 text-white text-lg font-serif'
                        },
                            React.createElement('span', null, detail.event),
                            React.createElement('span', { className: 'mx-3 opacity-60' }, '|'),
                            React.createElement('span', null, detail.time)
                        )
                    )
                ),
                React.createElement('div', { className: 'w-full max-w-md border-t border-white/30 my-6' }),
                React.createElement('p', { className: 'text-lg text-white text-center font-serif' }, `Dress Code: ${dressCode}`)
            )
        );
    };

    const MenuSection = ({ menus }) => {
        if (!menus || menus.length === 0) return null;

        return React.createElement('div', {
            className: 'w-full bg-[#F4E7EC] py-16 px-12 flex flex-col items-center'
        },
            React.createElement('svg', {
                className: 'w-8 h-8 mb-6 opacity-60',
                viewBox: '0 0 100 100',
                xmlns: 'http://www.w3.org/2000/svg'
            },
                React.createElement('path', {
                    d: 'M50,10 L45,30 L40,50 L35,70 L30,90 M50,10 L55,30 L60,50 L65,70 L70,90',
                    stroke: 'currentColor',
                    strokeWidth: '2',
                    fill: 'none',
                    opacity: '0.7'
                }),
                React.createElement('circle', { cx: '35', cy: '50', r: '2', fill: 'currentColor', opacity: '0.7' }),
                React.createElement('circle', { cx: '65', cy: '50', r: '2', fill: 'currentColor', opacity: '0.7' })
            ),
            React.createElement('h2', { className: 'font-serif text-4xl text-gray-800 mb-10 text-center font-normal' }, 'Menu'),
            React.createElement('div', { className: 'w-full max-w-2xl space-y-8' },
                menus.map((menu, menuIndex) =>
                    React.createElement('div', {
                        key: menuIndex,
                        className: `${menuIndex < menus.length - 1 ? 'border-b-2 border-gray-300 pb-8' : ''}`
                    },
                        React.createElement('div', {
                            className: 'text-xl font-bold text-gray-800 mb-6 text-center font-serif'
                        }, menu.title),
                        Object.entries(menu.items).map(([course, dish], itemIndex) =>
                            React.createElement('div', {
                                key: itemIndex,
                                className: 'flex items-center py-2 text-gray-700 text-base font-serif'
                            },
                                React.createElement('span', { className: 'font-semibold mr-4 min-w-[120px]' }, course),
                                React.createElement('span', { className: 'mx-2 opacity-60' }, '|'),
                                React.createElement('span', { className: 'flex-1' }, dish)
                            )
                        )
                    )
                )
            )
        );
    };

    const RSVPForm = ({ rsvp, menus }) => {
        if (!rsvp) return null;

        const menuTitles = menus ? menus.map(m => m.title) : [];

        return React.createElement('div', {
            className: 'w-full min-h-[400px] relative flex items-center justify-center',
            style: {
                backgroundImage: `url('${rsvp.backgroundImage || ''}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(3px)'
            }
        },
            React.createElement('div', {
                className: 'absolute inset-0 bg-gray-900/85 flex flex-col items-center justify-center px-12 py-10'
            },
                React.createElement('h2', { className: 'text-3xl text-white mb-3 text-center font-serif font-semibold' }, 'RSVP'),
                React.createElement('p', { className: 'text-base text-white mb-10 text-center font-serif' },
                    `Kindly reply before the ${rsvp.deadline || 'specified date'}`
                ),
                React.createElement('div', { className: 'w-full max-w-2xl space-y-6' },
                    rsvp.attendanceOptions && rsvp.attendanceOptions.length > 0 &&
                    React.createElement('div', { className: 'mb-6' },
                        React.createElement('label', { className: 'block text-lg text-white mb-4 font-serif' }, 'Will You Be Attending?'),
                        React.createElement('div', { className: 'flex gap-6 flex-wrap' },
                            rsvp.attendanceOptions.map((option, index) =>
                                React.createElement('div', { key: index, className: 'flex items-center gap-2' },
                                    React.createElement('div', { className: 'w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800' }),
                                    React.createElement('span', { className: 'text-base text-white font-serif' }, option)
                                )
                            )
                        )
                    ),
                    rsvp.menuSelectionEnabled && menuTitles.length > 0 &&
                    React.createElement('div', { className: 'mb-6' },
                        React.createElement('label', { className: 'block text-lg text-white mb-4 font-serif' }, 'Menu Option'),
                        React.createElement('div', { className: 'flex gap-6 flex-wrap' },
                            menuTitles.map((title, index) =>
                                React.createElement('div', { key: index, className: 'flex items-center gap-2' },
                                    React.createElement('div', { className: 'w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800' }),
                                    React.createElement('span', { className: 'text-base text-white font-serif' }, title)
                                )
                            )
                        )
                    ),
                    rsvp.dependentEnabled &&
                    React.createElement('div', { className: 'mb-6' },
                        React.createElement('label', { className: 'block text-lg text-white mb-4 font-serif' }, 'Dependent'),
                        React.createElement('div', { className: 'flex gap-6 flex-wrap' },
                            React.createElement('div', { className: 'flex items-center gap-2' },
                                React.createElement('div', { className: 'w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800' }),
                                React.createElement('span', { className: 'text-base text-white font-serif' }, 'Yes')
                            ),
                            React.createElement('div', { className: 'flex items-center gap-2' },
                                React.createElement('div', { className: 'w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800' }),
                                React.createElement('span', { className: 'text-base text-white font-serif' }, 'No')
                            )
                        )
                    ),
                    rsvp.questions && rsvp.questions.map((question, qIndex) =>
                        React.createElement('div', { key: qIndex, className: 'mb-6' },
                            React.createElement('label', { className: 'block text-lg text-white mb-4 font-serif' }, question.questionText),
                            React.createElement('div', { className: 'flex gap-6 flex-wrap' },
                                question.options.map((option, oIndex) =>
                                    React.createElement('div', { key: oIndex, className: 'flex items-center gap-2' },
                                        React.createElement('div', { className: 'w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800' }),
                                        React.createElement('span', { className: 'text-base text-white font-serif' }, option)
                                    )
                                )
                            )
                        )
                    ),
                    rsvp.dependentEnabled && rsvp.menuSelectionEnabled && menuTitles.length > 0 &&
                    React.createElement('div', { className: 'mb-6' },
                        React.createElement('label', { className: 'block text-lg text-white mb-4 font-serif' }, 'Menu Option'),
                        React.createElement('div', { className: 'flex gap-6 flex-wrap' },
                            menuTitles.map((title, index) =>
                                React.createElement('div', { key: index, className: 'flex items-center gap-2' },
                                    React.createElement('div', { className: 'w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800' }),
                                    React.createElement('span', { className: 'text-base text-white font-serif' }, title)
                                )
                            )
                        )
                    )
                ),
                React.createElement('svg', {
                    className: 'w-8 h-8 mt-10 opacity-60',
                    viewBox: '0 0 100 100',
                    xmlns: 'http://www.w3.org/2000/svg'
                },
                    React.createElement('path', {
                        d: 'M50,20 Q30,40 20,50 Q10,60 20,70 Q30,80 50,80 Q70,80 80,70 Q90,60 80,50 Q70,40 50,20',
                        stroke: 'currentColor',
                        strokeWidth: '2',
                        fill: 'none',
                        opacity: '0.4'
                    })
                )
            )
        );
    };

    const App = ({ data }) => {
        return React.createElement('div', { className: 'flex flex-col w-full min-h-screen bg-white' },
            React.createElement(HeroSection, { backgroundImage: data.backgroundImages?.hero }),
            React.createElement(InvitationText, {
                coupleName1: data.coupleName1,
                coupleName2: data.coupleName2,
                eventDateTime: data.eventDateTime,
                venueName: data.venueName,
                venueAddress: data.venueAddress
            }),
            React.createElement(EventDetails, {
                eventDetails: data.eventDetails,
                dressCode: data.dressCode,
                backgroundImage: data.backgroundImages?.eventDetails
            }),
            React.createElement(MenuSection, { menus: data.menus }),
            React.createElement(RSVPForm, {
                rsvp: {
                    ...data.rsvp,
                    backgroundImage: data.backgroundImages?.rsvp
                },
                menus: data.menus
            })
        );
    };

    return { HeroSection, InvitationText, EventDetails, MenuSection, RSVPForm, App };
}

/**
 * Render React app to HTML string
 */
function renderReactApp(transformedData) {
    const { App } = createComponents();
    const html = ReactDOMServer.renderToString(React.createElement(App, { data: transformedData }));
    return html;
}

/**
 * Load HTML template
 */
function loadTemplate() {
    const templatePath = path.join(__dirname, 'templates', 'rsvp-template.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
    }
    return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Replace template variables
 */
function renderTemplate(template, reactHtml) {
    let html = template;
    html = html.replace(/\{\{REACT_APP\}\}/g, reactHtml);
    html = html.replace(/\{\{COMPONENT_SCRIPTS\}\}/g, '');
    html = html.replace(/\{\{RENDER_SCRIPT\}\}/g, '');
    return html;
}

/**
 * Generate PDF from HTML using Puppeteer
 */
async function generatePDF(html, outputPath) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });
        
        if (outputPath) {
            fs.writeFileSync(outputPath, pdf);
            console.log(`PDF generated: ${outputPath}`);
        }
        
        return pdf;
    } finally {
        await browser.close();
    }
}

/**
 * Main function
 */
async function main() {
    try {
        const args = process.argv.slice(2);
        const inputFile = args[0] || null;
        const outputFile = args[1] || null;
        const generatePDFFlag = args.includes('--pdf') || args.includes('-p');
        
        // Load data
        const data = loadData(inputFile);
        
        // Transform data
        const transformedData = transformData(data);
        
        // Render React app
        const reactHtml = renderReactApp(transformedData);
        
        // Load template
        const template = loadTemplate();
        
        // Render template
        const html = renderTemplate(template, reactHtml);
        
        // Output HTML
        if (outputFile && !generatePDFFlag) {
            fs.writeFileSync(outputFile, html);
            console.log(`HTML generated: ${outputFile}`);
        } else if (!outputFile && !generatePDFFlag) {
            console.log(html);
        }
        
        // Generate PDF if requested
        if (generatePDFFlag) {
            const pdfOutputPath = outputFile || 'output.pdf';
            await generatePDF(html, pdfOutputPath);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    loadData,
    transformData,
    renderReactApp,
    generatePDF
};
