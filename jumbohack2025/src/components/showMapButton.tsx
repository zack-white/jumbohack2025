"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ShowMapButton({ eventID }: { eventID: number }) {
  const router = useRouter();
  console.log("Navigating to map with event ID:", eventID);

  return (
    <div className="flex items-center justify-center py-4 pl-4">
      <button
        onClick={() => router.push(`/mapview/${eventID}`)}
        className="relative w-full max-w-[600px] transition-opacity hover:opacity-100"
        >
        {/* Grayed-out Map Image */}
        <Image
          src="/mapFoButt.png" // Image from the public folder
          alt="Expand Map"
          height={200}
          width={600}
          className="w-full max-h-[200px] opacity-80 brightness-90 contrast-90 hover:brightness-100 hover:contrast-100 transition"
        />

        {/* Overlay Text */}
        {/* <div className="max-h-[200px] absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/30">
          Expand Map
        </div> */}
      </button>
    </div>
  );
}
