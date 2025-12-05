import React from 'react';

const HeroSection = ({ backgroundImage }) => {
    return (
        <div 
            className="w-full h-[70vh] bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
    );
};

export default HeroSection;

