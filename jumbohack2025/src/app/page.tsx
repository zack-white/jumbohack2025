"use client";

import Link from "next/link";
import Image from "next/image";
import UpcomingEvents from "@/components/UpcomingEvents";
import QueryProvider from "@/components/QueryProvider";
// import { useTheme } from "next-themes";
import { ArrowUpToLineIcon, Info, Phone } from "lucide-react";

export default function Home() {
  // const { theme } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <QueryProvider>
      <main className="min-h-screen bg-white">
        {/* Outer container (mobile defaults, desktop overrides) */}
        <div className="mx-auto w-full py-6">
          <div className="px-[10vw]">
            {/* Top heading (mobile = text-2xl, desktop = text-3xl or 4xl) */}
            <div>
              <h1 className="text-2xl text-gray-900 mb-6 md:text-3xl font-serif font-bold pt-2 text-primary">
                Welcome to JumboMap
              </h1>
            </div>

            {/* Team Image & Overlay */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative w-full md:h-[50vh]">
                <Image
                  src="/images/HomePage_Banner.jpg"
                  alt="Team photo"
                  width={800}
                  height={400}
                  className="w-full h-full object-cover object-center md:object-[45%_25%]"
                  priority
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            
              {/* Text overlay */}
              <div className="absolute bottom-8 left-0 right-10 md: bg-white pt-2 pb-2 md:max-w-[30vw] md:bg-transparent md:bottom-1/2 md:left-0 md:p-0 md:transform md:translate-y-full">
                <h2 className="text-xl font-medium pl-2 md:p-5 md:text-3xl md:bg-white text-primary font-serif">
                  Making events more accessible for students
                </h2>
              </div>
            </div>

            {/* Upcoming Events (already has its own mobile vs desktop layout) */}
            <UpcomingEvents />
          </div>

          {/* CTA Section */}
          <div className="bg-[#2E73B5] text-white mt-12 py-24 px-6 w-full">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-24">
              <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold">
                Let&apos;s get your event started
              </h2>
              <Link
                href="/events/create"
                className="bg-white text-[#2E73B5] px-12 py-3 hover:bg-gray-100 transition-colors text-center md:text-xl font-inter"
              >
                Create New Event
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="px-[10vw]">
            <div className="flex justify-center md:justify-start mt-4">
              <img src="/logo-dark.svg" alt="JumboMap Logo" className="h-16 w-auto" />
            </div>
            <footer className="py-4 md:mt-8 md:py-4">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Emergency Section 1 */}
                <div className="bg-gray-50 p-4 rounded-lg flex-1">
                  <h3 className="text-base md:text-xl">
                    Emergency: <span className="font-bold">Tufts University Police Department</span>
                  </h3>

                  <div className="mt-2 flex flex-col gap-6">
                    {/* Address */}
                    <div className="text-base md:text-lg text-gray-700 ml-1">
                      <p>419 Boston Ave</p>
                      <p>Medford, MA 02155</p>
                    </div>

                    {/* Contact Info */}
                    <div className="w-full">
                      <p className="flex items-center justify-between gap-1 text-base md:text-lg">
                        <span className="font-semibold">Emergency:</span> 
                        <a href="tel:617-627-3780" className="text-blue-600 flex items-center">
                          617-627-3780
                          <Info size={16} className="ml-1 text-gray-900" />
                        </a>
                      </p>
                      <p className="flex items-center justify-between gap-1 text-base md:text-lg">
                        <span className="font-semibold">Non-Emergency:</span> 
                        <a href="tel:617-627-3030" className="text-blue-600 flex items-center">
                          617-627-3030
                          <Phone size={16} className="ml-1 text-gray-900" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Emergency Section 2 */}
                <div className="bg-gray-50 p-4 rounded-lg flex-1">
                  <h3 className="text-base md:text-xl">
                    Emergency: <span className="font-bold">Tufts University Health Services</span>
                  </h3>

                  <div className="mt-2 flex flex-col gap-6">
                    {/* Address */}
                    <div className="text-base md:text-lg text-gray-700 ml-1">
                      <p>124 Professors Row</p>
                      <p>Medford, MA 02155</p>
                    </div>

                    {/* Contact Info */}
                    <div className="w-full">
                      <p className="flex items-center justify-between gap-1 text-base md:text-lg">
                        <span className="font-semibold">Phone:</span> 
                        <a href="tel:617-627-3350" className="text-blue-600 flex items-center">
                          617-627-3350
                          <Phone size={16} className="ml-1 text-gray-900" />
                        </a>
                      </p>
                      <p className="flex items-center justify-between gap-1 text-base md:text-lg">
                        <span className="font-semibold">Fax:</span> 
                        <a href="tel:617-627-3592" className="text-blue-600 flex items-center">
                          617-627-3592
                          <Info size={16} className="ml-1 text-gray-900" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 md:gap-0">
                <p className="text-xs md:text-sm text-gray-500 font-inter">
                  © 2025 Created by Dan Glorioso, William Goldman, Hannah Jiang, Holden Kittelberger, Shayne Sidman, Elisa Yu, Zachary White
                </p>
                <button
                  onClick={scrollToTop}
                  className="bg-[#2E73B5] text-white px-6 h-12 text-sm flex items-center hover:cursor-pointer hover:bg-gray-400 transition-colors"
                >
                  Back to top <ArrowUpToLineIcon size={16} className="ml-1" />
                </button>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </QueryProvider>
  );
}
