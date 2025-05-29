import Image from "next/image";

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

        {/* Address and phone/email row */}
        <div
          className={`flex flex-row text-xs mt-4 ${
            contactInfo.address ? 'justify-between' : 'justify-end'
          } items-center`}
        >
          {contactInfo.address && <p>{contactInfo.address}</p>}

          <div className="flex items-center gap-1 text-[#2971AC]">
            {contactInfo.phoneNumber ? (
              <>
                <span>{contactInfo.phoneNumber}</span>
                <Image src="/phone.svg" alt="Phone Icon" width={14} height={14} />
              </>
            ) : contactInfo.email ? (
              <>
                <span>{contactInfo.email}</span>
                <Image src="/email.svg" alt="Email Icon" width={14} height={14} />
              </>
            ) : null}
          </div>
        </div>

        {/* City/state/zip and email row (only if phone exists) */}
        {contactInfo.city && (
          <div className="flex flex-row justify-between text-xs mt-1 items-center">
            <p>
              {contactInfo.city}
              {contactInfo.state ? `, ${contactInfo.state}` : ''} {contactInfo.zipCode}
            </p>
            {contactInfo.phoneNumber && contactInfo.email && (
              <div className="flex items-center gap-1 text-[#2971AC]">
                <span>{contactInfo.email}</span>
                <Image src="/email.svg" alt="Email Icon" width={14} height={14} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }