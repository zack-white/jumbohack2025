"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ShowMapButton() {
  const router = useRouter();

  return (
        <div className="flex items-center justify-center p-5"> 
        <button
        onClick={() => router.push("/mapview")}
        className="relative w-full max-w-xs mx-auto transition-opacity hover:opacity-100"
        >
        {/* Grayed-out Map Image */}
        <Image
                src="/mapFoButt.png" // Image from the public folder
                alt="Expand Map"
                width={300}
                height={200}
                className="w-full h-auto opacity-80 brightness-90 contrast-90 hover:brightness-100 hover:contrast-100 transition"
        />

        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/30">
                Expand Map
        </div>
        </button>
        </div>
  );
}
