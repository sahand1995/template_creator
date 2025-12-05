import React from 'react';

const RSVPForm = ({ rsvp, menus }) => {
    if (!rsvp) {
        return null;
    }

    const menuTitles = menus ? menus.map(m => m.title) : [];

    return (
        <div 
            className="w-full min-h-[400px] relative flex items-center justify-center"
            style={{ 
                backgroundImage: `url('${rsvp.backgroundImage || ''}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(3px)'
            }}
        >
            <div className="absolute inset-0 bg-gray-900/85 flex flex-col items-center justify-center px-12 py-10">
                <h2 className="text-3xl text-white mb-3 text-center font-serif font-semibold">RSVP</h2>
                <p className="text-base text-white mb-10 text-center font-serif">
                    Kindly reply before the {rsvp.deadline || 'specified date'}
                </p>
                
                <div className="w-full max-w-2xl space-y-6">
                    {/* Attendance Question */}
                    {rsvp.attendanceOptions && rsvp.attendanceOptions.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-lg text-white mb-4 font-serif">Will You Be Attending?</label>
                            <div className="flex gap-6 flex-wrap">
                                {rsvp.attendanceOptions.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800"></div>
                                        <span className="text-base text-white font-serif">{option}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Menu Selection */}
                    {rsvp.menuSelectionEnabled && menuTitles.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-lg text-white mb-4 font-serif">Menu Option</label>
                            <div className="flex gap-6 flex-wrap">
                                {menuTitles.map((title, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800"></div>
                                        <span className="text-base text-white font-serif">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dependent Question */}
                    {rsvp.dependentEnabled && (
                        <div className="mb-6">
                            <label className="block text-lg text-white mb-4 font-serif">Dependent</label>
                            <div className="flex gap-6 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800"></div>
                                    <span className="text-base text-white font-serif">Yes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800"></div>
                                    <span className="text-base text-white font-serif">No</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dynamic RSVP Questions */}
                    {rsvp.questions && rsvp.questions.map((question, qIndex) => (
                        <div key={qIndex} className="mb-6">
                            <label className="block text-lg text-white mb-4 font-serif">{question.questionText}</label>
                            <div className="flex gap-6 flex-wrap">
                                {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800"></div>
                                        <span className="text-base text-white font-serif">{option}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Dependent Menu Selection */}
                    {rsvp.dependentEnabled && rsvp.menuSelectionEnabled && menuTitles.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-lg text-white mb-4 font-serif">Menu Option</label>
                            <div className="flex gap-6 flex-wrap">
                                {menuTitles.map((title, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-800"></div>
                                        <span className="text-base text-white font-serif">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Bottom Swirl */}
                <svg className="w-8 h-8 mt-10 opacity-60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50,20 Q30,40 20,50 Q10,60 20,70 Q30,80 50,80 Q70,80 80,70 Q90,60 80,50 Q70,40 50,20" 
                          stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
                </svg>
            </div>
        </div>
    );
};

export default RSVPForm;

