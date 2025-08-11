"use client";

import { useState, useEffect } from "react";
import ClubForm from "@/components/ClubForm";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

type ClubFormData = {
  name: string;
  category: string;
  contact: string;
  start_time: string;
  end_time: string;
  description: string;
  event_id: string | string[] | undefined;
  location: { x: number; y: number } | null;
  scale: number;
};

export default function AddTablePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  // Client-side auth gate (don't use redirect() in client components)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const { eventId } = useParams<{ eventId: string }>();
  const eventID = eventId;

  const [clubData, setClubData] = useState<ClubFormData>({
    name: "",
    category: "",
    contact: "",
    start_time: "",
    end_time: "",
    description: "",
    event_id: eventID,
    location: null,
    scale: 0,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    contact: "",
    start_time: "",
    end_time: "",
  });

  // Fetch categories (in an effect, not during render)
  useEffect(() => {
    if (!eventID || !isLoaded || !isSignedIn || categories.length > 0) return;
    (async () => {
      try {
        const response = await fetch("/api/getClubs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventID }),
        });
        if (!response.ok) {
          console.error("Error fetching existing clubs.");
          return;
        }
        const clubs = (await response.json()) as Array<{ category: string }>;
        setCategories(Array.from(new Set(clubs.map((c) => c.category))));
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    })();
  }, [eventID, isLoaded, isSignedIn, categories.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: clubData.name ? "" : "Required",
      category: clubData.category ? "" : "Required",
      contact: clubData.contact ? "" : "Required",
      start_time: "",
      end_time: "",
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((v) => v !== "");
    if (hasErrors) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/addClub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clubData.name,
          category: clubData.category,
          contact: clubData.contact,
          description: "", // not collected from form
          coordinates: null, // not set yet
          confirmed: false, // default
          event_id: eventID,
        }),
      });

      if (!res.ok) {
        let errMsg = "Error adding table.";
        try {
          const data = (await res.json()) as { error?: string };
          if (typeof data?.error === "string") errMsg = data.error;
        } catch {
          // ignore JSON parse errors
        }
        console.error("Server error:", errMsg);
        toast.error(errMsg);
        return;
      }


      toast.success("Table added successfully!");
      router.push(`/placement/${eventID}`);
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Network error while adding table.");
    }
  };

  const handleCancel = () => {
    router.push(`/placement/${eventID}`);
  };

  // While Clerk is loading (or signed-out redirect pending), render nothing
  if (!isLoaded || (!isSignedIn && typeof window !== "undefined")) return null;

  return (
    <div>
      <ClubForm
        clubData={clubData}
        setClubData={setClubData}
        categories={categories}
        errors={errors}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
