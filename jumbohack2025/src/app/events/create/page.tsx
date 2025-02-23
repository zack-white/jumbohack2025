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
import Tooltip from "@/components/tooltip";

export default function CreateEventPage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const userEmail = user?.emailAddresses[0];
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    duration: "",
    description: "",
    spreadsheet: "",
    location: null as { x: number; y: number } | null,
    scale: 0,
  });

  const [errors, setErrors] = useState({
    eventName: "",
    date: "",
    time: "",
    duration: "",
    description: "",
    spreadsheet: "",
    location: "",
  });

  const validateForm = () => {
    const newErrors = {
      eventName: "",
      date: "",
      time: "",
      duration: "",
      description: "",
      spreadsheet: "",
      location: "",
    };

    let isValid = true;

    if (!formData.eventName.trim()) {
      newErrors.eventName = "Event name is required";
      isValid = false;
    }
    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
      isValid = false;
    }
    if (!formData.time.trim()) {
      newErrors.time = "Time is required";
      isValid = false;
    }
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
      isValid = false;
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }
    if (!formData.spreadsheet) {
      newErrors.spreadsheet = "Spreadsheet is required";
      isValid = false;
    }
    if (!formData.location) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      eventName: "",
      date: "",
      time: "",
      duration: "",
      description: "",
      spreadsheet: "",
      location: null,
      scale: 0,
    });
    setErrors({
      eventName: "",
      date: "",
      time: "",
      duration: "",
      description: "",
      spreadsheet: "",
      location: "",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        spreadsheet: e.target.files![0].name,
      }));
      setErrors((prev) => ({ ...prev, spreadsheet: "" }));
    }
  };

  const handleLocationSelect = (
    coordinates: { x: number; y: number },
    zoom: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: coordinates,
      scale: zoom,
    }));
    setErrors((prev) => ({ ...prev, location: "" }));
    setShowMap(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log(userEmail);
      const promise = fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: formData.eventName,
          date: formData.date,
          startTime: formData.time,
          duration: formData.duration,
          description: formData.description,
          location: formData.location,
          scale: formData.scale,
          creator: userEmail?.emailAddress,
        }),
      });

      toast.promise(promise, {
        loading: "Creating event...",
        success: (response) => {
          resetForm();
          router.push("/placement");
          return "Event created successfully!";
        },
        error: "Failed to create event",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event. Please try again.");
    }
  };

  return (
    // Light-gray background & full height to mimic the screenshot
<div className="bg-white min-h-scree overflow-hidden">
  {/* Center the form with less max width */}
  <div className="bg-[#F7F9FB] max-w-4xl mx-auto pt-8 px-16">
    {/* Remove Card styling completely since the image doesn't show any card effects */}
    <div>
      {/* Header: Adjusted spacing and text size */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold font-serif text-primary">Create Event</h1>
      </div>

      {/* Form content with adjusted spacing */}
      <div>
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* EVENT NAME */}
          <div className="space-y-1">
            <label className="text-sm text-primary">Event Name*</label>
            <Input
              placeholder="e.g. JumboHack"
              value={formData.eventName}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  eventName: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, eventName: "" }));
              }}
              className={`${errors.eventName ? "border-red-500" : "border-gray-200"} h-11`}
            />
            {errors.eventName && (
              <p className="text-sm text-red-500">{errors.eventName}</p>
            )}
          </div>

          {/* DATE / TIME / DURATION with adjusted spacing */}
          <div className="grid grid-cols-3 gap-6">
            {/* DATE */}
            <div className="space-y-1">
              <label className="text-sm text-primary">Date*</label>
              <Input
                type="text"
                placeholder="00/00/0000"
                value={formData.date}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, date: "" }));
                }}
                className={`${errors.date ? "border-red-500" : "border-gray-200"} h-11`}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* TIME */}
            <div className="space-y-1">
              <label className="text-sm text-primary">Time*</label>
              <Input
                type="text"
                placeholder="00:00 PM"
                value={formData.time}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    time: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, time: "" }));
                }}
                className={`${errors.time ? "border-red-500" : "border-gray-200"} h-11`}
              />
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time}</p>
              )}
            </div>

            {/* DURATION */}
            <div className="space-y-1">
              <label className="text-sm text-primary">Duration*</label>
              <Input
                type="text"
                placeholder="e.g. 24hr 30m"
                value={formData.duration}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, duration: "" }));
                }}
                className={`${errors.duration ? "border-red-500" : "border-gray-200"} h-11`}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm text-primary">Description*</label>
            <Textarea
              placeholder="Add additional information about the event"
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
              className={`min-h-[120px] ${errors.description ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* SPREADSHEET */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <label className="text-sm text-primary">Select Spreadsheet*</label>
              <Tooltip />
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Choose a spreadsheet file (.xlsx)"
                value={formData.spreadsheet}
                readOnly
                className={`flex-grow h-11 ${errors.spreadsheet ? "border-red-500" : "border-gray-200"}`}
              />
              <Button
                type="button"
                variant="secondary"
                className="h-11 px-6 bg-[#2E73B5] text-[#fff]"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Upload
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </div>
            {errors.spreadsheet && (
              <p className="text-sm text-red-500">{errors.spreadsheet}</p>
            )}
          </div>

          {/* LOCATION */}
          <div className="space-y-1">
            <label className="text-sm text-primary">Location*</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={
                  formData.location
                    ? `${formData.location.x}, ${formData.location.y}`
                    : ""
                }
                readOnly
                className={`flex-grow h-11 ${errors.location ? "border-red-500" : "border-gray-200"}`}
              />
              <Button
                type="button"
                variant="secondary"
                className="h-11 px-6 bg-[#2E73B5] text-[#fff]"
                onClick={() => setShowMap(true)}
              >
                Choose Location
              </Button>
            </div>
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-6 pb-10">
            <Button type="button" variant="outline" className="h-11 px-6">
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6 bg-[#2E73B5]">
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>

  {/* MAP MODAL - kept the same since it's not visible in the screenshot */}
  {showMap && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[600px] shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Choose a General Location</CardTitle>
          <Button variant="ghost" onClick={() => setShowMap(false)}>
            ×
          </Button>
        </CardHeader>
        <CardContent className="h-[500px]">
          <MapboxMap onLocationSelect={handleLocationSelect} />
        </CardContent>
      </Card>
    </div>
  )}
</div>
  );
}
