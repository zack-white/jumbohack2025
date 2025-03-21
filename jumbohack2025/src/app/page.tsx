"use client";

import Link from "next/link";
import Image from "next/image";
import UpcomingEvents from "@/components/UpcomingEvents";
import QueryProvider from "@/components/QueryProvider";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme } = useTheme();

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
                  src="/images/JumboMap_Group.jpeg"
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
          <div className="px-4 md:px-[10vw]">
            <footer className="mt-4 py-8 text-center md:mt-8 md:py-4">
              <Image
                src={
                  theme === "dark"
                    ? "/logo-footer-light.svg"
                    : "/logo-footer-dark.svg"
                }
                alt="JumboMap Logo"
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <p className="text-sm md:text-lg text-gray-600 max-w-2xl md:max-w-4xl mx-auto font-inter py-2">
                This project was developed during JumboHack 2025 to create an
                innovative solution that helps students easily navigate current
                campus events, explore event layouts, and discover clubs more efficiently.
                We hope you enjoy!
              </p>
              <p className="text-xs md:text-base text-gray-500 mt-4 font-inter">
                © 2025 Elisa Yu, Hannah Jiang, Holden Kittelberger, Shayne Sidman,
                William Goldman, Zachary White
              </p>
            </footer>
          </div>
        </div>
      </main>
    </QueryProvider>
  );
}