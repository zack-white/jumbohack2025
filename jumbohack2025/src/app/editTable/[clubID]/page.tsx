"use client";

import { use, useState, useEffect } from "react";
import MapboxMap from "@/app/map/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClubForm from "@/components/ClubForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

import Tooltip from "@/components/tooltip";

export default function EditTablePage() {
  const { userId } = useAuth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = useParams();
  const clubID = params.clubID;

  const router = useRouter();
  const [clubData, setClubData] = useState<any>(null);
  // const [clubData, setClubData] = useState({ category: "test" });
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
            action: 'findById',
            id: clubID
          }),
        });
        const data = await res.json();
        setClubData(data);
        // Extract eventID from the fetched club data so it can be used in other functions
        setEventID(data.event_id);

      } catch (error) {
        console.error(error);
        toast.error("Error fetching club details.");
      }
    };

    if (clubID) fetchClubData();
  }, [clubID]); // Ensure eventID is set before fetching categories

  // console.log("Club Data:", clubData);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/getClubs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventID }),
        });
        const clubs = await res.json();
        const unique = new Set<string>(clubs.map((c: any) => c.category));

        setCategories(Array.from(unique));
      } catch (error) {
        console.error(error);
      }
    };
    if (eventID) fetchCategories();
  }, [eventID]);

  // console.log("Categories:", categories);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          id: clubID,
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

  return (
    <ClubForm
      clubData={clubData}
      setClubData={setClubData}
      categories={categories}
      errors={errors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      mode="edit"
    />
  );
}