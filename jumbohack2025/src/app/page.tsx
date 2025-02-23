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
              <h1 className="text-2xl font-medium text-gray-900 mt-2 mb-6 md:mt-6 md:mb-10 md:text-5xl">
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
                <div className="absolute bottom-4 right-8 bg-white p-2 md:max-w-[50vw] lg:max-w-[30vw] md:bg-transparent md:bottom-1/3 md:left-0 md:p-0 md:transform md:translate-y-3/4">
                  <h2 className="text-1xl font-medium text-gray-900 pl-2 md:p-4 lg:p-10 md:text-2xl lg:text-4xl md:bg-white md:text-black">
                    Making events more accessible for students
                  </h2>
                </div>
              </div>

            {/* Upcoming Events (already has its own mobile vs desktop layout) */}
            <UpcomingEvents />
          </div>

          {/* CTA Section */}
          <div className="bg-[#2E73B5] text-white mt-12 py-12 px-6 w-full">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-24">
              <h2 className="text-2xl font-medium text-center md:text-left md:text-3xl">
                Let&apos;s get your event started
              </h2>
              <Link
                href="/events/create"
                className="bg-white text-[#2E73B5] px-6 py-3 rounded hover:bg-gray-100 transition-colors text-center md:text-2xl"
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
              <p className="text-sm md:text-xl text-gray-600 max-w-2xl md:max-w-5xl mx-auto">
                This project was developed during JumboHack 2025 to create an
                innovative solution that helps students easily navigate current
                campus events, explore event layouts, and discover clubs more efficiently.
                We hope you enjoy!
              </p>
              <p className="text-xs md:text-lg text-gray-500 mt-4">
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