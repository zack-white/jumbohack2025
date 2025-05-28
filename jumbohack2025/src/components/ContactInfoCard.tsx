interface ContactInfoProps {
    isEventOrganizer: boolean; // Indicates whether to display 'Event Organizer' or 'Contact' at top
    organizer: string; // Will be the organizer name or contact name (some club, police, EMS, etc.)
    address: string;
    phoneNumber: string;
    city: string;
    state: string;
    zipCode: string;
    email: string;
}
  
export default function ContactInfoCard(contactInfo: ContactInfoProps) {
    return (
      <div className="bg-[#F7F9FB] px-6 py-4 font-inter">
        <p className="text-base">
          {contactInfo.isEventOrganizer ? (
            <>Event Organizer: </>
          ) : (
            <>Contact: </>
          )}
          <span className="font-bold">{contactInfo.organizer}</span>
        </p>
  
        {/* Address and phone or email */}
        <div className={`flex flex-row text-xs mt-4 ${contactInfo.address ? 'justify-between' : 'justify-end'}`}>
          {contactInfo.address && <p>{contactInfo.address}</p>}
          <p className="text-[#2971AC]">
            {contactInfo.phoneNumber || contactInfo.email}
          </p>
        </div>
  
        {/* City/state/zip and Email if phone number exists */}
        {contactInfo.city && (
          <div className="flex flex-row justify-between text-xs mt-1">
            <p>
              {contactInfo.city}
              {contactInfo.state ? `, ${contactInfo.state}` : ''} {contactInfo.zipCode}
            </p>
            {/* Show email here only if phone number is also shown above */}
            {contactInfo.phoneNumber && (
              <p className="text-[#2971AC]">{contactInfo.email}</p>
            )}
          </div>
        )}
      </div>
    );
  }