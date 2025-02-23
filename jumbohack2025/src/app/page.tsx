"use client";

import Link from 'next/link';
import Image from 'next/image';
import UpcomingEvents from '@/components/UpcomingEvents';
import QueryProvider from '@/components/QueryProvider';
import { useTheme } from 'next-themes';

export default function Home() {
  const { theme } = useTheme();

  return (
    <QueryProvider>
      <main className="min-h-screen bg-white">
        <div className="mx-auto py-6">
          <div className="px-4">
            <h1 className="text-2xl text-3xl font-medium text-gray-900 mb-6">
              Welcome to JumboMap
            </h1>

            {/* Hero Image */}
            <div className="relative mb-8">
              <Image
                src="/images/team_photo.jpg"
                alt="Team photo"
                width={1200}
                height={600}
                className="w-full"
                priority
              />
              <div className="absolute bottom-8 right-9 bg-white p-2 max-w-md">
                <h2 className="text-2xl md:text-3xl font-medium text-gray-900 pl-2">
                  Making events more accessible for students
                </h2>
              </div>
            </div>

            {/* Upcoming Events */}
            <UpcomingEvents />
          </div>

          <div className="bg-[#2E73B5] text-white mt-12 py-12 px-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <h2 className="text-2xl font-medium text-center md:text-left">
                Let&apos;s get your event started
              </h2>
              <Link
                href="/create-event"
                className="bg-white text-[#2E73B5] px-6 py-3 rounded hover:bg-gray-100 transition-colors text-center"
              >
                Create New Event
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4">
            <footer className="mt-4 py-8 text-center">
              <Image
                src={theme === 'dark' ? '/logo-footer-light.svg' : '/logo-footer-dark.svg'}
                alt="JumboMap Logo"
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                This project was developed during JumboHack 2025 to create an innovative solution that helps 
                students easily navigate current campus events, explore event layouts, and discover clubs more efficiently. 
                We hope you enjoy!
              </p>
              <p className="text-xs text-gray-500 mt-4">
                © 2025 Eliza Yu, Hannah Jiang, Helen Kinberger, Shayne Selman, William Goldman, Zachary White
              </p>
            </footer>
          </div>
        </div>
      </main>
    </QueryProvider>
  );
}