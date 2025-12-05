import React from 'react';
import HeroSection from './HeroSection';
import InvitationText from './InvitationText';
import EventDetails from './EventDetails';
import MenuSection from './MenuSection';
import RSVPForm from './RSVPForm';

const App = ({ data }) => {
    const {
        coupleName1,
        coupleName2,
        eventDateTime,
        venueName,
        venueAddress,
        eventDetails,
        dressCode,
        menus,
        rsvp,
        backgroundImages
    } = data;

    return (
        <div className="flex flex-col w-full min-h-screen bg-white">
            <HeroSection backgroundImage={backgroundImages?.hero} />
            <InvitationText 
                coupleName1={coupleName1}
                coupleName2={coupleName2}
                eventDateTime={eventDateTime}
                venueName={venueName}
                venueAddress={venueAddress}
            />
            <EventDetails 
                eventDetails={eventDetails}
                dressCode={dressCode}
                backgroundImage={backgroundImages?.eventDetails}
            />
            <MenuSection menus={menus} />
            <RSVPForm 
                rsvp={{
                    ...rsvp,
                    backgroundImage: backgroundImages?.rsvp
                }}
                menus={menus}
            />
        </div>
    );
};

export default App;

