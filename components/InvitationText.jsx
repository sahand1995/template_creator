import React from 'react';

const InvitationText = ({ coupleName1, coupleName2, eventDateTime, venueName, venueAddress }) => {
    return (
        <div className="w-full bg-[#F4E7EC] py-16 px-12 flex flex-col items-center">
            {/* Decorative Swirl Top */}
            <svg className="w-8 h-8 self-start mb-6 opacity-60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,20 Q30,40 20,50 Q10,60 20,70 Q30,80 50,80 Q70,80 80,70 Q90,60 80,50 Q70,40 50,20" 
                      stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
            </svg>
            
            {/* Couple Names */}
            <div className="flex items-center gap-4 my-6">
                <span className="font-serif text-5xl text-gray-800 font-normal">{coupleName1}</span>
                <span className="font-serif text-4xl text-gray-800 italic">&</span>
                <span className="font-serif text-5xl text-gray-800 font-normal">{coupleName2}</span>
            </div>
            
            {/* Invitation Text */}
            <p className="text-lg text-gray-700 my-4 text-center font-serif">invite you to their wedding</p>
            
            {/* Decorative Swirl Middle */}
            <svg className="w-8 h-8 my-6 opacity-60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,20 Q30,40 20,50 Q10,60 20,70 Q30,80 50,80 Q70,80 80,70 Q90,60 80,50 Q70,40 50,20" 
                      stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
            </svg>
            
            {/* Event Details */}
            <div className="text-center mt-6">
                <div className="text-2xl font-semibold text-gray-800 my-3 font-serif">{eventDateTime}</div>
                <div className="text-xl text-gray-700 my-2 font-serif">{venueName}</div>
                <div className="text-base text-gray-600 my-1 font-serif">{venueAddress}</div>
            </div>
            
            {/* Decorative Swirl Bottom */}
            <svg className="w-8 h-8 self-end mt-6 opacity-60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,20 Q30,40 20,50 Q10,60 20,70 Q30,80 50,80 Q70,80 80,70 Q90,60 80,50 Q70,40 50,20" 
                      stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
            </svg>
        </div>
    );
};

export default InvitationText;

