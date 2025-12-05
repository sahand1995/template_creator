import React from 'react';

const MenuSection = ({ menus }) => {
    if (!menus || menus.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-[#F4E7EC] py-16 px-12 flex flex-col items-center">
            {/* Olive Branch Icon */}
            <svg className="w-8 h-8 mb-6 opacity-60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,10 L45,30 L40,50 L35,70 L30,90 M50,10 L55,30 L60,50 L65,70 L70,90" 
                      stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
                <circle cx="35" cy="50" r="2" fill="currentColor" opacity="0.7"/>
                <circle cx="65" cy="50" r="2" fill="currentColor" opacity="0.7"/>
            </svg>
            
            <h2 className="font-serif text-4xl text-gray-800 mb-10 text-center font-normal">Menu</h2>
            
            <div className="w-full max-w-2xl space-y-8">
                {menus.map((menu, menuIndex) => (
                    <div 
                        key={menuIndex} 
                        className={`${menuIndex < menus.length - 1 ? 'border-b-2 border-gray-300 pb-8' : ''}`}
                    >
                        <div className="text-xl font-bold text-gray-800 mb-6 text-center font-serif">
                            {menu.title}
                        </div>
                        
                        {Object.entries(menu.items).map(([course, dish], itemIndex) => (
                            <div key={itemIndex} className="flex items-center py-2 text-gray-700 text-base font-serif">
                                <span className="font-semibold mr-4 min-w-[120px]">{course}</span>
                                <span className="mx-2 opacity-60">|</span>
                                <span className="flex-1">{dish}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuSection;

