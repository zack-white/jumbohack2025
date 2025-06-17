"use client";

import { useState } from "react";
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

    const [errors, setErrors] = useState({
      name: "",
      category: "",
      contact: "",
      start_time: "",
      end_time: "",
      description: "",
      location: "",
    });

    const handleSubmit = async () => {

    }
    return (
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Organization Information */}
            <div>
              <CardTitle className="text-xl font-semibold">Organization Information</CardTitle>
              <div className="space-y-1">
                <label className="text-sm text-primary flex items-center">
                  Organization Name*
                  {errors.name && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                  )}
                </label>
                <Input
                  placeholder="e.g. JumboHack"
                  value={clubData.name}
                  onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                  required
                />
                <label className="text-sm text-primary flex items-center">
                  Select Category*
                  {errors.category && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                  )}
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                  value={clubData.category}
                  onChange={(e) => setClubData({ ...clubData, category: e.target.value })}
                  required
                >
                  <option value="">Select...</option>
                  <option value="tech">Tech</option>
                  <option value="arts">Arts</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl font-semibold">Contact Information</CardTitle>
                {/* <Tooltip content="Contact person responsible for this table." /> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <label className="text-sm text-primary flex items-center">
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
                className="mt-4"
                
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 px-6" 
              >
                Cancel
              </Button>
              <Button
                type="submit" 
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