import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import UpcomingEvents from '@/components/UpcomingEvents';
import QueryProvider from '@/components/QueryProvider';

export default function Home() {
  return (
    <QueryProvider>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Welcome to JumboMap
          </h1>

          <Card className="overflow-hidden mb-8">
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src="/images/dawea.jpg"
                  alt="Team photo"
                  width={600}
                  height={400}
                  className="w-full"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <h2 className="text-2xl font-semibold text-white">
                    Making events more accessible for students
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <UpcomingEvents />
          <Link
        href="/events/fullMap"
        className="bg-blue-500 text-white px-4 py-2 rounded">
          Full Map
        </Link>
    </div>
      </main>
    </QueryProvider>
  );
}