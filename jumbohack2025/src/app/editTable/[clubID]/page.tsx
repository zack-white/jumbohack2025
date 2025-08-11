"use client";

import { useState, useEffect } from "react";
import ClubForm from "@/components/ClubForm";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

type ClubRecord = {
  id: number;
  event_id: number;
  name: string;
  category: string;
  contact: string;
  description: string;
  start_time?: string;
  end_time?: string;
  coordinates?: { x: number; y: number } | null;
};

export default function EditTablePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
        router.replace("/sign-in");
      }
    }, [isLoaded, isSignedIn, router]);

  const { clubID } = useParams<{ clubID: string }>();

  const [clubData, setClubData] = useState<ClubRecord | null>(null);
  const [eventID, setEventID] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState({ name: "", category: "", contact: "" });

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const res = await fetch("/api/getClubByCoords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "findById",
            id: Number(clubID),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ClubRecord;
        setClubData(data);
        setEventID(data.event_id);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching club details.");
      }
    };

    if (clubID) fetchClubData();
  }, [clubID]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/getClubs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventID }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const clubs = (await res.json()) as Array<{ category: string }>;
        const unique = new Set<string>(clubs.map((c) => c.category));
        setCategories(Array.from(unique));
      } catch (error) {
        console.error(error);
      }
    };
    if (eventID) fetchCategories();
  }, [eventID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubData) return;

    const newErrors = {
      name: clubData.name ? "" : "Required",
      category: clubData.category ? "" : "Required",
      contact: clubData.contact ? "" : "Required",
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== "")) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/updateClub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateDetails",
          id: Number(clubID),
          name: clubData.name,
          category: clubData.category,
          contact: clubData.contact,
          description: clubData.description,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to update club.");
        return;
      }

      toast.success("Club updated successfully!");
      router.push(`/placement/${eventID}`);
    } catch (err) {
      console.error(err);
      toast.error("Error updating club.");
    }
  };

  const handleCancel = () => {
    router.push(`/eventview?id=${eventID}`);
  };

  if (!clubData) return <div className="p-4">Loading...</div>;

  // Adapter: ensure the setter type matches ClubForm's non-null expectation
  const setClubDataSafe: React.Dispatch<React.SetStateAction<ClubRecord>> = (updater) => {
    setClubData((prev) => {
      if (!prev) return prev; // won't happen because we gate render above
      return typeof updater === "function"
        ? (updater as (p: ClubRecord) => ClubRecord)(prev)
        : updater;
    });
  };

  return (
    <ClubForm
      clubData={clubData}
      setClubData={setClubDataSafe}
      categories={categories}
      errors={errors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      mode="edit"
    />
  );
}
