import React from 'react';

const EventDetails = ({ eventDetails, dressCode, backgroundImage }) => {
    console.log('EventDetails - eventDetails:', eventDetails);
    console.log('EventDetails - dressCode:', dressCode);
    console.log('EventDetails - backgroundImage:', backgroundImage);
    
    return (
        <div 
            className="w-full min-h-[300px] relative flex items-center justify-center"
            style={{ 
                backgroundImage: `url('${backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(3px)'
            }}
        >
            <div className="absolute inset-0 bg-gray-900/85 flex flex-col items-center justify-center px-12 py-10">
                {/* Olive Branch Icon */}
                <svg className="w-10 h-10 mb-4 opacity-80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50,10 L45,30 L40,50 L35,70 L30,90 M50,10 L55,30 L60,50 L65,70 L70,90" 
                          stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.7"/>
                    <circle cx="35" cy="50" r="3" fill="#ffffff" opacity="0.7"/>
                    <circle cx="65" cy="50" r="3" fill="#ffffff" opacity="0.7"/>
                </svg>
                
                <h2 className="text-3xl text-white mb-6 text-center font-serif font-semibold">Event Details</h2>
                
                <div 
                    className="w-full max-w-2xl bg-gray-800/60 rounded-lg p-8 space-y-6 relative z-10"
                    style={{
                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    {console.log('EventDetails - Rendering box container')}
                    <ul className="list-none w-full space-y-3">
                        {eventDetails && eventDetails.map ? eventDetails.map((detail, index) => {
                            console.log('EventDetails - Rendering detail:', detail);
                            return (
                                <li key={index} className="flex items-center justify-center py-2 text-white text-lg font-serif">
                                    <span>{detail.event}</span>
                                    <span className="mx-3 opacity-60">|</span>
                                    <span>{detail.time}</span>
                                </li>
                            );
                        }) : <li>No event details</li>}
                    </ul>
                    
                    <div className="w-full border-t border-white/30 my-6"></div>
                    
                    <p className="text-lg text-white text-center font-serif">Dress Code: {dressCode}</p>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;

