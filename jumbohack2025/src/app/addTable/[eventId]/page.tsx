"use client";

import { use, useState } from "react";
import MapboxMap from "@/app/map/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const eventID = params.eventId;
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
        router.push(`/eventview?id=${eventID}`);
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
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
      <Card>
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-titleFont">Add Table</CardTitle>
            <hr className="my-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Organization Information */}
            <div>
              <CardTitle className="text-xl font-semibold text-titleFont">Organization Information</CardTitle>
              <div className="">
                <label className="mt-4 text-sm text-primary flex items-center">
                  Organization Name*
                  {errors.name && (
                    <span className="ml-2 text-xs text-red-500">
                    (Required)
                    </span>
                  )}
                </label>
                <Input
                  className="mt-2"
                  placeholder="e.g. JumboHack"
                  value={clubData.name}
                  onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                  required
                />
                <label className="mt-4 text-sm text-primary flex items-center">
                  Select Category*
                  {errors.category && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                  )}
                </label>
                <select
                  className="mt-2 w-full border rounded px-3 py-2 text-sm text-gray-700"
                  value={clubData.category}
                  onChange={(e) => setClubData({ ...clubData, category: e.target.value })}
                  required
                >
                  <option value="">Select...</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="mt-8 items-center gap-2 mb-2">
                <CardTitle className="text-xl font-semibold text-titleFont">Contact Information</CardTitle>
                {/* <Tooltip content="Contact person responsible for this table." /> */}
              </div>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Representative First Name"
                  required
                  onChange={(e) => setClubData({ ...clubData, firstName: e.target.value })}
                />
                <Input
                  placeholder="Representative Last Name"
                  required
                  onChange={(e) => setClubData({ ...clubData, lastName: e.target.value })}
                />
              </div> */}
              <label className="mt-4 text-sm text-primary flex items-center">
                Email*
                {errors.contact && (
                    <span className="ml-2 text-xs text-red-500">
                      (Required)
                    </span>
                )}
              </label>
              <Input
                type="email"
                placeholder="example@gmail.com"
                className="mt-2"
                required
                onChange={(e) => setClubData({ ...clubData, contact: e.target.value })}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button 
                type="button" 
                onClick={handleCancel}
                variant="outline" 
                className="h-11 px-6" 
              >
                Cancel
              </Button>
              <Button
                type="submit"
                // onClick={handleSubmit}
                className="h-11 px-6 bg-[#2E73B5] hover:bg-[#235d92]"
                >
                Add Table
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

}