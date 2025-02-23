"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ShowMapButton() {
    const router = useRouter();
  
    return (
      <div className="w-full flex items-center py-5"> 
        <button
          onClick={() => router.push("/mapview")}
          className="relative w-full max-w-[600px] aspect-[3/2] transition-opacity hover:opacity-100"
        >
          <Image
            src="/mapFoButt.png"
            alt="Expand Map"
            layout="fill" 
            objectFit="cover" 
            className="rounded-md opacity-80 brightness-90 contrast-90 hover:brightness-100 hover:contrast-100 transition"
          />
  
          <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold bg-black/30">
            Expand Map
          </div>
        </button>
      </div>
    );
  }
  