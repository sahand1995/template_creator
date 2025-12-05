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
 * Convert local image file to base64 data URI
 */
function imageToDataURI(imagePath, baseDir = null) {
    try {
        // If it's already a data URI or HTTP(S) URL, return as is
        if (!imagePath || imagePath.startsWith('http') || imagePath.startsWith('data:')) {
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
            console.warn(`Image not found: ${fullPath}`);
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
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.warn(`Error converting image to data URI: ${error.message}`);
        return imagePath; // Return original on error
    }
}

/**
 * Transform data from existing format to new simplified structure
 */
function transformData(data, inputFile = null) {
    // Get base directory from input file location for relative image paths
    const baseDir = inputFile ? path.dirname(path.resolve(inputFile)) : __dirname;
    // Extract event date and time
    const eventDateTime = data.event_date_time || '';
    const [eventDate, eventTime] = eventDateTime.split(' | ').map(s => s.trim());
    
    // Transform menu options
    const menus = data.menu_options ? data.menu_options.map((menu, index) => ({
        title: `Menu ${menu.menu_number || (index + 1)}`,
        items: {
            appetizer: menu.appetizer || '',
            mainCourse: menu.main_course || '',
            dessert: menu.dessert || ''
        }
    })) : [];

    // Transform RSVP questions
    const rsvpQuestions = data.rsvp_questions ? data.rsvp_questions.map(q => ({
        question: q.question_text || '',
        options: [
            q.accept_option_text || 'Yes',
            ...(q.allow_maybe ? ['Maybe'] : []),
            q.decline_option_text || 'No'
        ]
    })) : [];

    // Get menu options for RSVP
    const menuOptions = menus.map(m => m.title);

    // Convert local images to data URIs
    const heroImage = imageToDataURI(data.background_images?.hero || '', baseDir);
    const eventDetailsImage = imageToDataURI(data.background_images?.event_details || '', baseDir);
    const rsvpImage = imageToDataURI(data.background_images?.rsvp || '', baseDir);

    return {
        mainBackground: heroImage,
        eventInfo: {
            eventName: data.event_name || '',
            eventDate: eventDate || '',
            eventTime: eventTime || '',
            venueName: data.venue_name || '',
            venueAddress: data.venue_address || '',
            coupleName1: data.couple_name_1 || '',
            coupleName2: data.couple_name_2 || ''
        },
        eventDetails: {
            backgroundImage: eventDetailsImage,
            events: data.event_details || [],
            dressCode: data.dress_code || ''
        },
        menus: menus,
        rsvp: {
            backgroundImage: rsvpImage,
            deadline: data.rsvp_deadline || '',
            attendanceOptions: ['Joyfully Accepts', 'Maybe', 'Regretfully Declines'],
            menuOptions: menuOptions,
            questions: rsvpQuestions
        }
    };
}

/**
 * React Components using React.createElement
 */
function createComponents() {
    const BackgroundLayout = ({ children }) => {
        return React.createElement('div', {
            className: 'w-full relative'
        },
            React.createElement('div', {
                className: 'relative z-10'
            }, children)
        );
    };

    const HeroSection = ({ backgroundImage }) => {
        return React.createElement('div', {
            className: 'w-full relative',
            style: {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }
        },
            React.createElement('img', {
                src: backgroundImage,
                alt: 'Hero',
                style: {
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    maxWidth: '100%'
                }
            })
        );
    };

    const EventInfo = ({ eventInfo }) => {
        return React.createElement('div', {
            className: 'w-full py-16 px-12 bg-white'
        },
            React.createElement('div', {
                className: 'max-w-4xl mx-auto text-center'
            },
                eventInfo.coupleName1 && eventInfo.coupleName2 &&
                React.createElement('div', {
                    className: 'mb-8'
                },
                    React.createElement('h1', {
                        className: 'font-serif text-5xl md:text-6xl text-gray-800 mb-2 font-normal'
                    }, eventInfo.coupleName1),
                    React.createElement('span', {
                        className: 'font-serif text-4xl text-gray-800 italic mx-4'
                    }, '&'),
                    React.createElement('h1', {
                        className: 'font-serif text-5xl md:text-6xl text-gray-800 mb-2 font-normal'
                    }, eventInfo.coupleName2)
                ),
                React.createElement('p', {
                    className: 'text-lg text-gray-600 mb-6 font-serif italic'
                }, 'invite you to their wedding'),
                React.createElement('div', {
                    className: 'space-y-2'
                },
                    eventInfo.eventName &&
                    React.createElement('h2', {
                        className: 'text-2xl font-semibold text-gray-800 font-serif'
                    }, eventInfo.eventName),
                    eventInfo.eventDate &&
                    React.createElement('p', {
                        className: 'text-xl text-gray-700 font-serif'
                    }, eventInfo.eventDate),
                    eventInfo.eventTime &&
                    React.createElement('p', {
                        className: 'text-lg text-gray-600 font-serif'
                    }, eventInfo.eventTime),
                    eventInfo.venueName &&
                    React.createElement('p', {
                        className: 'text-lg text-gray-700 font-serif mt-4'
                    }, eventInfo.venueName),
                    eventInfo.venueAddress &&
                    React.createElement('p', {
                        className: 'text-base text-gray-600 font-serif'
                    }, eventInfo.venueAddress)
                )
            )
        );
    };

    const EventDetails = ({ eventDetails }) => {
        return React.createElement('div', {
            className: 'w-full min-h-[400px] relative',
            style: {
                backgroundImage: `url('${eventDetails.backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }
        },
            React.createElement('div', {
                className: 'absolute inset-0 bg-black/80 flex items-center justify-center py-16 px-12'
            },
                React.createElement('div', {
                    className: 'max-w-2xl w-full text-center'
                },
                    React.createElement('h2', {
                        className: 'text-3xl text-white mb-8 font-serif font-semibold'
                    }, 'Event Details'),
                    React.createElement('ul', {
                        className: 'list-none space-y-4 mb-8'
                    },
                        eventDetails.events.map((event, index) =>
                            React.createElement('li', {
                                key: index,
                                className: 'text-white text-lg font-serif flex items-center justify-center'
                            },
                                React.createElement('span', null, event.name || event.event),
                                React.createElement('span', {
                                    className: 'mx-4 opacity-60'
                                }, '|'),
                                React.createElement('span', null, event.time)
                            )
                        )
                    ),
                    React.createElement('div', {
                        className: 'border-t border-white/30 my-6'
                    }),
                    eventDetails.dressCode &&
                    React.createElement('p', {
                        className: 'text-lg text-white font-serif'
                    }, `Dress Code: ${eventDetails.dressCode}`)
                )
            )
        );
    };

    const Menu = ({ menus }) => {
        if (!menus || menus.length === 0) {
            return null;
        }

        return React.createElement('div', {
            className: 'w-full py-16 px-12 bg-white/95 backdrop-blur-sm'
        },
            React.createElement('div', {
                className: 'max-w-4xl mx-auto'
            },
                React.createElement('h2', {
                    className: 'text-4xl text-center text-gray-800 mb-12 font-serif font-normal'
                }, 'Menu'),
                React.createElement('div', {
                    className: 'space-y-12'
                },
                    menus.map((menu, index) =>
                        React.createElement('div', {
                            key: index,
                            className: `${index < menus.length - 1 ? 'border-b-2 border-gray-300 pb-12' : ''}`
                        },
                            React.createElement('h3', {
                                className: 'text-2xl font-bold text-gray-800 mb-6 text-center font-serif'
                            }, menu.title),
                            React.createElement('div', {
                                className: 'space-y-3 flex flex-col items-center'
                            },
                                Object.entries(menu.items).map(([course, dish], itemIndex) =>
                                    React.createElement('div', {
                                        key: itemIndex,
                                        className: 'flex items-center text-gray-700 text-base font-serif justify-center w-full max-w-md'
                                    },
                                        React.createElement('span', {
                                            className: 'font-semibold mr-4 min-w-[120px]'
                                        }, course === 'mainCourse' ? 'Main Course' : course.charAt(0).toUpperCase() + course.slice(1)),
                                        React.createElement('span', {
                                            className: 'mx-3 opacity-60'
                                        }, '|'),
                                        React.createElement('span', {
                                            className: 'flex-1'
                                        }, dish)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    };

    const RsvpSection = ({ rsvp }) => {
        if (!rsvp) {
            return null;
        }

        // Calculate dynamic height based on number of questions
        const questionCount = (rsvp.attendanceOptions ? 1 : 0) + 
                             (rsvp.menuOptions && rsvp.menuOptions.length > 0 ? 1 : 0) + 
                             1 + // Dependent question
                             (rsvp.questions ? rsvp.questions.length : 0) + 
                             (rsvp.menuOptions && rsvp.menuOptions.length > 0 ? 1 : 0); // Dependent menu option
        
        const minHeight = Math.max(600, 400 + (questionCount * 90)); // Base 400px + 90px per question

        return React.createElement('div', {
            className: 'w-full relative',
            style: {
                backgroundImage: `url('${rsvp.backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: `${minHeight}px`
            }
        },
            React.createElement('div', {
                className: 'absolute inset-0 bg-black/40 flex items-center justify-center py-16 px-12'
            },
                React.createElement('div', {
                    className: 'max-w-2xl w-full mx-auto'
                },
                    // Container box for RSVP form
                    React.createElement('div', {
                        className: 'bg-[rgba(101,67,33,0.45)] rounded-lg p-10 mx-auto text-center',
                        style: {
                            maxWidth: '600px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                        }
                    },
                    React.createElement('h2', {
                        className: 'text-3xl text-white mb-4 text-center font-serif font-semibold'
                    }, 'RSVP'),
                    rsvp.deadline &&
                    React.createElement('p', {
                        className: 'text-base text-white mb-10 text-center font-serif'
                    }, `Kindly reply before the ${rsvp.deadline}`),
                    React.createElement('div', {
                        className: 'space-y-6'
                    },
                        // Attendance Options
                        rsvp.attendanceOptions && rsvp.attendanceOptions.length > 0 &&
                        React.createElement('div', null,
                            React.createElement('label', {
                                className: 'block text-lg text-white mb-4 font-serif'
                            }, 'Will You Be Attending?'),
                            React.createElement('div', {
                                className: 'flex gap-6 flex-wrap justify-center'
                            },
                                rsvp.attendanceOptions.map((option, index) =>
                                    React.createElement('div', {
                                        key: index,
                                        className: 'flex items-center gap-2'
                                    },
                                        React.createElement('div', {
                                            className: 'w-5 h-5 rounded-full border-2 border-white bg-transparent'
                                        }),
                                        React.createElement('span', {
                                            className: 'text-base text-white font-serif'
                                        }, option)
                                    )
                                )
                            )
                        ),
                        // Menu Options
                        rsvp.menuOptions && rsvp.menuOptions.length > 0 &&
                        React.createElement('div', null,
                            React.createElement('label', {
                                className: 'block text-lg text-white mb-4 font-serif'
                            }, 'Menu Option'),
                            React.createElement('div', {
                                className: 'flex gap-6 flex-wrap justify-center'
                            },
                                rsvp.menuOptions.map((option, index) =>
                                    React.createElement('div', {
                                        key: index,
                                        className: 'flex items-center gap-2'
                                    },
                                        React.createElement('div', {
                                            className: 'w-5 h-5 rounded-full border-2 border-white bg-transparent'
                                        }),
                                        React.createElement('span', {
                                            className: 'text-base text-white font-serif'
                                        }, option)
                                    )
                                )
                            )
                        ),
                        // Dependent Question
                        React.createElement('div', null,
                            React.createElement('label', {
                                className: 'block text-lg text-white mb-4 font-serif'
                            }, 'Dependent'),
                            React.createElement('div', {
                                className: 'flex gap-6 flex-wrap justify-center'
                            },
                                React.createElement('div', {
                                    className: 'flex items-center gap-2'
                                },
                                    React.createElement('div', {
                                        className: 'w-5 h-5 rounded-full border-2 border-white bg-transparent'
                                    }),
                                    React.createElement('span', {
                                        className: 'text-base text-white font-serif'
                                    }, 'Yes')
                                ),
                                React.createElement('div', {
                                    className: 'flex items-center gap-2'
                                },
                                    React.createElement('div', {
                                        className: 'w-5 h-5 rounded-full border-2 border-white bg-transparent'
                                    }),
                                    React.createElement('span', {
                                        className: 'text-base text-white font-serif'
                                    }, 'No')
                                )
                            )
                        ),
                        // Dynamic Questions
                        rsvp.questions && rsvp.questions.map((q, qIndex) =>
                            React.createElement('div', {
                                key: qIndex
                            },
                                React.createElement('label', {
                                    className: 'block text-lg text-white mb-4 font-serif'
                                }, q.question),
                                React.createElement('div', {
                                    className: 'flex gap-6 flex-wrap justify-center'
                                },
                                    q.options.map((option, oIndex) =>
                                        React.createElement('div', {
                                            key: oIndex,
                                            className: 'flex items-center gap-2'
                                        },
                                            React.createElement('div', {
                                                className: 'w-5 h-5 rounded-full border-2 border-white bg-transparent'
                                            }),
                                            React.createElement('span', {
                                                className: 'text-base text-white font-serif'
                                            }, option)
                                        )
                                    )
                                )
                            )
                        ),
                        // Dependent Menu Option
                        rsvp.menuOptions && rsvp.menuOptions.length > 0 &&
                        React.createElement('div', null,
                            React.createElement('label', {
                                className: 'block text-lg text-white mb-4 font-serif'
                            }, 'Menu Option'),
                            React.createElement('div', {
                                className: 'flex gap-6 flex-wrap justify-center'
                            },
                                rsvp.menuOptions.map((option, index) =>
                                    React.createElement('div', {
                                        key: index,
                                        className: 'flex items-center gap-2'
                                    },
                                        React.createElement('div', {
                                            className: 'w-5 h-5 rounded-full border-2 border-white bg-transparent'
                                        }),
                                        React.createElement('span', {
                                            className: 'text-base text-white font-serif'
                                        }, option)
                                    )
                                )
                            )
                        )
                    )
                    )
                )
            )
        );
    };

    const App = ({ data }) => {
        return React.createElement(BackgroundLayout, {},
            React.createElement(HeroSection, { backgroundImage: data.mainBackground }),
            React.createElement(EventInfo, { eventInfo: data.eventInfo }),
            React.createElement(EventDetails, { eventDetails: data.eventDetails }),
            React.createElement(Menu, { menus: data.menus }),
            React.createElement(RsvpSection, { rsvp: data.rsvp })
        );
    };

    return { BackgroundLayout, HeroSection, EventInfo, EventDetails, Menu, RsvpSection, App };
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
    const templatePath = path.join(__dirname, 'templates', 'rsvp-template-v2.html');
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
        
        // Set viewport to match desired width (A4 width = 210mm = 794px at 96 DPI)
        await page.setViewport({
            width: 794,
            height: 1123, // Initial height, will be adjusted
            deviceScaleFactor: 1
        });
        
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Wait for all images and fonts to load
        await page.evaluateHandle(() => document.fonts.ready);
        
        // Get the actual content height
        const contentHeight = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            return Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
        });
        
        const pdf = await page.pdf({
            width: '210mm', // A4 width
            height: `${contentHeight}px`, // Dynamic height based on content
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            },
            preferCSSPageSize: false // Important: use explicit width/height
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
        
        // Transform data (pass inputFile for relative image path resolution)
        const transformedData = transformData(data, inputFile);
        
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


