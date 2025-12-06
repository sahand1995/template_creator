/**
 * Renderer Service
 * Handles PDF and thumbnail generation from template data
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

/**
 * Convert hex color to rgba with opacity
 */
function hexToRgba(hex, alpha = 0.45) {
    if (!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create React components using React.createElement
 */
function createComponents(theme = {}) {
    // Convert box color to rgba with opacity if it's a hex color
    // Using higher opacity (0.7) to make the box more visible and distinct from background
    const boxColourRaw = theme.boxColour || 'rgba(101,67,33,0.45)';
    const boxColour = boxColourRaw.startsWith('#') ? hexToRgba(boxColourRaw, 0.7) : boxColourRaw;
    const backgroundColour = theme.backgroundColour || '#ffffff';
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
            className: 'w-full py-16 px-12',
            style: {
                backgroundColor: backgroundColour
            }
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
        const bgImage = eventDetails.backgroundImage || '';
        const bgImageUrl = `url('${bgImage}')`;
        
        return React.createElement('div', {
            className: 'w-full min-h-[400px] relative',
            style: {
                backgroundImage: bgImageUrl,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }
        },
            React.createElement('div', {
                className: 'absolute inset-0 bg-black/40 flex items-center justify-center py-16 px-12'
            },
                React.createElement('div', {
                    className: 'max-w-2xl w-full mx-auto'
                },
                    // Container box for Event Details content
                    React.createElement('div', {
                        className: 'rounded-lg p-10 mx-auto text-center',
                        style: {
                            backgroundColor: boxColour,
                            maxWidth: '600px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                        }
                    },
                        React.createElement('h2', {
                            className: 'text-3xl text-white mb-4 text-center font-serif font-semibold'
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
            )
        );
    };

    const Menu = ({ menus }) => {
        if (!menus || menus.length === 0) {
            return null;
        }

        // Convert hex to rgba with 95% opacity
        const menuBgColor = backgroundColour.startsWith('#') 
            ? hexToRgba(backgroundColour, 0.95)
            : backgroundColour;

        return React.createElement('div', {
            className: 'w-full py-16 px-12 backdrop-blur-sm',
            style: {
                backgroundColor: menuBgColor
            }
        },
            React.createElement('div', {
                className: 'w-full mx-auto'
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
                                className: 'w-full mx-auto text-center',
                                style: { maxWidth: '600px', marginLeft: '125px' }
                            },
                                React.createElement('div', {
                                    className: 'space-y-3 flex flex-col items-center'
                                },
                                    Object.entries(menu.items).map(([course, dish], itemIndex) => {
                                        const label = course === 'mainCourse' ? 'Main Course' : course.charAt(0).toUpperCase() + course.slice(1);
                                        return React.createElement('div', {
                                            key: itemIndex,
                                            className: 'flex items-center text-gray-700 text-base font-serif'
                                        },
                                            React.createElement('span', {
                                                className: 'font-semibold',
                                                style: { width: '120px', textAlign: 'right' }
                                            }, label),
                                            React.createElement('span', {
                                                className: 'mx-3 opacity-60'
                                            }, '|'),
                                            React.createElement('span', {
                                                className: '',
                                                style: { width: '300px', textAlign: 'left' }
                                            }, dish)
                                        );
                                    })
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

        const bgImage = rsvp.backgroundImage || '';
        const bgImageUrl = `url('${bgImage}')`;
        
        return React.createElement('div', {
            className: 'w-full relative',
            style: {
                backgroundImage: bgImageUrl,
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
                        className: 'rounded-lg p-10 mx-auto text-center',
                        style: {
                            backgroundColor: boxColour,
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
    const theme = transformedData.theme || {};
    const { App } = createComponents(theme);
    const html = ReactDOMServer.renderToString(React.createElement(App, { data: transformedData }));
    return html;
}

/**
 * Load HTML template
 */
function loadTemplate() {
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'rsvp-template-v2.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
    }
    return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Replace template variables
 */
function renderTemplate(template, reactHtml, backgroundColour = '#ffffff') {
    let html = template;
    html = html.replace(/\{\{REACT_APP\}\}/g, reactHtml);
    // Replace body background color
    html = html.replace(/class="bg-white"/g, `style="background-color: ${backgroundColour}"`);
    html = html.replace(/bg-white/g, '');
    return html;
}

/**
 * Generate PDF from HTML using Puppeteer
 * @param {string} html - HTML content
 * @param {string} outputPath - Output file path
 * @returns {Promise<Buffer>} PDF buffer
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
        
        // Log images in the page
        const imageInfo = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            const elementsWithBg = Array.from(document.querySelectorAll('*')).filter(el => {
                const bg = window.getComputedStyle(el).backgroundImage;
                return bg && bg !== 'none';
            });
            
            return {
                imgTags: images.map(img => ({
                    src: img.src.substring(0, 100),
                    complete: img.complete,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight
                })),
                backgroundImages: elementsWithBg.map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    backgroundImage: window.getComputedStyle(el).backgroundImage.substring(0, 100)
                }))
            };
        });
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
        }
        
        return pdf;
    } finally {
        await browser.close();
    }
}

/**
 * Generate thumbnail (PNG) from HTML using Puppeteer
 * @param {string} html - HTML content
 * @param {string} outputPath - Output file path
 * @param {number} width - Thumbnail width (default: 400)
 * @param {number} height - Thumbnail height (default: 600)
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateThumbnail(html, outputPath, width = 400, height = 600) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for thumbnail
        await page.setViewport({
            width: width,
            height: height,
            deviceScaleFactor: 2 // Higher DPI for better quality
        });
        
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Wait for all fonts to load
        await page.evaluateHandle(() => document.fonts.ready);
        
        // Wait for all images to load (same as PDF generation)
        await page.evaluate(async () => {
            const images = Array.from(document.querySelectorAll('img'));
            await Promise.all(images.map(img => {
                if (img.complete && img.naturalHeight !== 0) {
                    return Promise.resolve();
                }
                if (img.src && img.src.startsWith('data:')) {
                    return new Promise(resolve => {
                        if (img.complete) {
                            resolve();
                        } else {
                            img.onload = resolve;
                            img.onerror = resolve;
                            setTimeout(resolve, 1000);
                        }
                    });
                }
                return new Promise((resolve) => {
                    const timeout = setTimeout(resolve, 10000);
                    if (img.complete) {
                        clearTimeout(timeout);
                        resolve();
                    } else {
                        img.onload = () => { clearTimeout(timeout); resolve(); };
                        img.onerror = () => { clearTimeout(timeout); resolve(); };
                    }
                });
            }));
        });
        
        // Additional wait for rendering
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false, // Only capture viewport
            clip: {
                x: 0,
                y: 0,
                width: width,
                height: height
            }
        });
        
        if (outputPath) {
            fs.writeFileSync(outputPath, screenshot);
        }
        
        return screenshot;
    } finally {
        await browser.close();
    }
}

/**
 * Generate both PDF and thumbnail from transformed data
 * @param {Object} transformedData - Transformed data for renderer
 * @param {string} pdfPath - PDF output path
 * @param {string} thumbnailPath - Thumbnail output path
 * @returns {Promise<{pdf: Buffer, thumbnail: Buffer}>}
 */
async function generateTemplate(transformedData, pdfPath, thumbnailPath) {
    // Render React app
    const reactHtml = renderReactApp(transformedData);
    
    // Load template
    const template = loadTemplate();
    
    // Get background color from theme
    const backgroundColour = transformedData.theme?.backgroundColour || '#ffffff';
    
    // Render template
    const html = renderTemplate(template, reactHtml, backgroundColour);
    
    // Generate PDF and thumbnail in parallel
    const [pdf, thumbnail] = await Promise.all([
        generatePDF(html, pdfPath),
        generateThumbnail(html, thumbnailPath)
    ]);
    
    return { pdf, thumbnail };
}

module.exports = {
    generatePDF,
    generateThumbnail,
    generateTemplate,
    renderReactApp,
    renderTemplate
};


