"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ShowMapButton({ eventID }: { eventID: number }) {
  const router = useRouter();
  console.log("Navigating to map with event ID:", eventID);

  return (
    <div className="w-full flex items-center py-5">
      <button
        onClick={() => router.push(`/mapview/${eventID}`)}
        className="relative w-full max-w-[600px] aspect-[3/2] transition-opacity hover:opacity-100"
      >
        {/* Grayed-out Map Image */}
        <Image
          src="/mapFoButt.png" // Image from the public folder
          alt="Expand Map"
          layout="fill"
          objectFit="cover"
          // width={300}
          // height={200}
          className="rounded-md opacity-80 brightness-90 contrast-90 hover:brightness-100 hover:contrast-100 transition"
        />

        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold bg-black/30">
          Expand Map
        </div>
      </button>
    </div>
  );
}
