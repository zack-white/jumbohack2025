"use client";

import { use, useState } from "react";
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

export default function AddTablePage() {
    const { userId } = useAuth();
  
    if (!userId) {
      redirect("/sign-in");
    }

    const params = useParams();
    const eventID = params.eventId;

    const router = useRouter();
    const { user } = useUser();
    const userEmail = user?.emailAddresses[0];
    const [clubData, setClubData] = useState({
        name: "",
        category: "",
        contact: "",
        start_time: "",
        end_time: "",
        description: "",
        event_id: eventID,
        location: null as { x: number; y: number } | null,
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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors = {
        name: clubData.name ? "" : "Required",
        category: clubData.category ? "" : "Required",
        contact: clubData.contact ? "" : "Required",
        start_time: "", // not used
        end_time: "",   // not used
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
          headers: {
            "Content-Type": "application/json",
          },
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
          const data = await res.json();
          console.error("Server error:", data.error);
          toast.error("Error adding table.");
          return;
        }

        toast.success("Table added successfully!");
        router.push(`/placement/${eventID}`);
      } catch (err) {
        console.error("Error submitting form:", err);
        toast.error("Network error while adding table.");
      }
    };

    if (eventID && categories.length === 0) {
      (async () => {
        try {
          const response = await fetch("/api/getClubs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventID }),
          });

          if (!response.ok) {
            console.error("Error fetching existing clubs.");
          }

          const clubs = await response.json();
          const uniqueCategories = new Set<string>(
            clubs.map((club: any) => club.category)
          );
          setCategories(Array.from(uniqueCategories));
        } catch (error) {
          console.error("Error fetching clubs:", error);
        }
      })();
    }

    const handleCancel = () => {
      router.push(`/placement/${eventID}`);
    };
    
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