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

import Tooltip from "@/components/tooltip";

export default function CreateEventPage() {
  const { userId } = useAuth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const router = useRouter();
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0];
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    duration: "",
    description: "",
    contactInfo: {
      organizationName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    toggleTimedTables: false,
    spreadsheet: null as File | null,
    location: null as { x: number; y: number } | null,
    scale: 0,
  });

  const [errors, setErrors] = useState({
    eventName: "",
    date: "",
    time: "",
    duration: "",
    description: "",
    contactInfo: {
      organizationName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    toggleTimedTables: false,
    spreadsheet: "",
    location: "",
  });

  // Helper function to validate date format (MM/DD/YYYY)
  const isValidDate = (dateStr: string) => {
    const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{2,4}$/;
    if (!regex.test(dateStr)) return false;
    
    // Additional validation for actual date validity
    const parts = dateStr.split('/');
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && 
           date.getDate() === day && 
           date.getFullYear() === year;
  };

  // Helper function to validate time format (HH:MM AM/PM)
  const isValidTime = (timeStr: string) => {
    const regex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM|am|pm)$/;
    return regex.test(timeStr);
  };

  // Helper function to validate duration format
  const isValidDuration = (durationStr: string) => {
    // Accept formats like "24hr 30m", "24 hours", "1hr 30min", "90m", etc.
    const regex = /^(\d+\s?(hr|hour|hours|h))?\s?(\d+\s?(m|min|minute|minutes))?$/;
    return regex.test(durationStr) && durationStr.trim() !== "";
  };

  // Helper function to validate file type
  const isValidSpreadsheet = (file: File | null) => {
    if (!file) return false;
    
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const validateForm = () => {
    const newErrors = {
      eventName: "",
      date: "",
      time: "",
      duration: "",
      description: "",
      contactInfo: {
        organizationName: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      toggleTimedTables: false,
      spreadsheet: "",
      location: "",
    };

    let isValid = true;

    // Event name validation
    if (!formData.eventName.trim()) {
      newErrors.eventName = "Event name is required";
      isValid = false;
    } else if (formData.eventName.length > 100) {
      newErrors.eventName = "Event name must be less than 100 characters";
      isValid = false;
    }

    // Date validation
    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
      isValid = false;
    } else if (!isValidDate(formData.date)) {
      newErrors.date = "Please use MM/DD/YYYY format";
      isValid = false;
    }

    // Time validation
    if (!formData.time.trim()) {
      newErrors.time = "Time is required";
      isValid = false;
    } else if (!isValidTime(formData.time)) {
      newErrors.time = "Please use HH:MM AM/PM format";
      isValid = false;
    }

    // Duration validation
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
      isValid = false;
    } else if (!isValidDuration(formData.duration)) {
      newErrors.duration = "Use format like '24hr 30m' or '2 hours'";
      isValid = false;
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    // Spreadsheet validation
    if (!formData.spreadsheet) {
      newErrors.spreadsheet = "Spreadsheet is required";
      isValid = false;
    } else if (!isValidSpreadsheet(formData.spreadsheet)) {
      newErrors.spreadsheet = "Only .xlsx or .xls files are allowed";
      isValid = false;
    }

    // Location validation
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
      contactInfo: {
        organizationName: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      toggleTimedTables: false,
      spreadsheet: null,
      location: null,
      scale: 0,
    });
    setErrors({
      eventName: "",
      date: "",
      time: "",
      duration: "",
      description: "",
      contactInfo: {
        organizationName: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      toggleTimedTables: false,
      spreadsheet: "",
      location: "",
    });
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    
    // Real-time validation for specific fields
    if (field === 'date' && value && !isValidDate(value)) {
      setErrors(prev => ({ ...prev, date: "Please use MM/DD/YYYY format" }));
    }
    
    if (field === 'time' && value && !isValidTime(value)) {
      setErrors(prev => ({ ...prev, time: "Please use HH:MM AM/PM format" }));
    }
    
    if (field === 'duration' && value && !isValidDuration(value)) {
      setErrors(prev => ({ ...prev, duration: "Use format like '24hr 30m' or '2 hours'" }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, spreadsheet: file }));
      
      if (!isValidSpreadsheet(file)) {
        setErrors(prev => ({ ...prev, spreadsheet: "Only .xlsx or .xls files are allowed" }));
      } else {
        setErrors(prev => ({ ...prev, spreadsheet: "" }));
      }
    }
  };

  const handleLocationSelect = (
    coordinates: { x: number; y: number },
    zoom: number
  ) => {
    setFormData(prev => ({
      ...prev,
      location: coordinates,
      scale: zoom,
    }));
    setErrors(prev => ({ ...prev, location: "" }));
    setShowMap(false);
    
    // Show a success toast when location is selected
    toast.success("Location selected successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Improved error feedback with more specific information
      const errorFields = Object.keys(errors).filter(key => 
        errors[key as keyof typeof errors] !== ""
      );
      
      if (errorFields.length > 0) {
        toast.error(`Please correct the errors in: ${errorFields.join(', ')}`);
      } else {
        toast.error("Please fill in all required fields correctly");
      }
      
      // Fixed: Only scroll to first error if there are errors
      const firstErrorField = errorFields[0];
      if (firstErrorField) {
        // Using a valid selector by making sure we have a proper class name
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return;
    }

    try {
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
        success: async (response) => {
          // Call the excel processing API here
          if (formData.spreadsheet) {
            await processExcel(formData.spreadsheet);
          }
          const result = await response.json();
          const eventId = result.eventId + 1;
          const locationParam = formData.location ? 
          `?x=${formData.location.x}&y=${formData.location.y}&scale=${formData.scale}` : '';
          resetForm();
          
          router.push(`/placement/${eventId}${locationParam}`);
          return "Event created successfully!";
        },
        error: (error) => {
          console.error("Error creating event:", error);
          return "Failed to create event. Please try again.";
        },
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event. Please try again.");
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some(value => 
      value !== null && value !== "" && value !== 0
    )) {
      // Confirm before discarding changes
      if (confirm("Discard changes and return to home?")) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  };
  
  const processExcel = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/processExcel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process Excel file");
      }

      const data = await response.json();
      console.log("Excel processing result:", data);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Error processing Excel file. Please try again.");
    }
  };

  // Helper function to get input classes based on error state
  const getInputClasses = (field: keyof typeof errors) => {
    return `${errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-200"} h-11`;
  };

  return (
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
      <div className="bg-[#F7F9FB] max-w-4xl w-full md:w-[80%] lg:w-[60%] mx-auto p-8">
        <div>
          <div className="mb-3">
            <h1 className="text-2xl font-bold font-serif text-primary">Create Event</h1>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* EVENT NAME */}
              <div className="space-y-1">
                <label className="text-sm text-primary flex items-center">
                  Event Name*
                  {errors.eventName && (
                    <span className="ml-2 text-xs text-red-500">
                      (Required)
                    </span>
                  )}
                </label>
                <Input
                  name="eventName"
                  placeholder="e.g. JumboHack"
                  value={formData.eventName}
                  onChange={(e) => handleInputChange("eventName", e.target.value)}
                  className={getInputClasses("eventName")}
                  aria-invalid={errors.eventName ? "true" : "false"}
                />
                {errors.eventName && (
                  <p className="text-sm text-red-500">{errors.eventName}</p>
                )}
              </div>

              {/* DATE / TIME / DURATION with adjusted spacing */}
              <div className="grid grid-cols-3 gap-6">
                {/* DATE */}
                <div className="space-y-1">
                  <label className="text-sm text-primary flex items-center">
                    Date*
                    {errors.date && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="date"
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={getInputClasses("date")}
                    aria-invalid={errors.date ? "true" : "false"}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                {/* TIME */}
                <div className="space-y-1">
                  <label className="text-sm text-primary flex items-center">
                    Time*
                    {errors.time && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="time"
                    type="text"
                    placeholder="HH:MM AM/PM"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className={getInputClasses("time")}
                    aria-invalid={errors.time ? "true" : "false"}
                  />
                  {errors.time && (
                    <p className="text-sm text-red-500">{errors.time}</p>
                  )}
                </div>

                {/* DURATION */}
                <div className="space-y-1">
                  <label className="text-sm text-primary flex items-center">
                    Duration*
                    {errors.duration && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="duration"
                    type="text"
                    placeholder="e.g. 24hr 30m"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    className={getInputClasses("duration")}
                    aria-invalid={errors.duration ? "true" : "false"}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-500">{errors.duration}</p>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-sm text-primary flex items-center">
                  Description*
                  {errors.description && (
                    <span className="ml-2 text-xs text-red-500">
                      (Required)
                    </span>
                  )}
                </label>
                <Textarea
                  name="description"
                  placeholder="Add additional information about the event"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`min-h-[120px] ${errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                  aria-invalid={errors.description ? "true" : "false"}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} / 500 characters
                </p>
              </div>

              {/* SPREADSHEET */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-primary flex items-center">
                    Select Spreadsheet*
                    {errors.spreadsheet && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Tooltip />
                </div>
                <div className="flex gap-2">
                  <Input
                    name="spreadsheet"
                    type="text"
                    placeholder="Choose a spreadsheet file (.xlsx)"
                    value={formData.spreadsheet ? formData.spreadsheet.name : ""}
                    readOnly
                    className={`flex-grow h-11 ${errors.spreadsheet ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                    aria-invalid={errors.spreadsheet ? "true" : "false"}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 px-6 bg-[#2E73B5] text-[#fff] hover:bg-[#235d92]"
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
                <label className="text-sm text-primary flex items-center">
                  Location*
                  {errors.location && (
                    <span className="ml-2 text-xs text-red-500">
                      (Required)
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <Input
                    name="location"
                    type="text"
                    value={
                      formData.location
                        ? `${formData.location.x.toFixed(4)}, ${formData.location.y.toFixed(4)}`
                        : ""
                    }
                    readOnly
                    placeholder="Click 'Choose Location' to select"
                    className={`flex-grow h-11 ${errors.location ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                    aria-invalid={errors.location ? "true" : "false"}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 px-6 bg-[#2E73B5] text-[#fff] hover:bg-[#235d92]"
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
              <div className="flex justify-end gap-3 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-11 px-6" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-11 px-6 bg-[#2E73B5] hover:bg-[#235d92]"
                >
                  Create Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl h-auto shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Choose a General Location</CardTitle>
              <Button 
                variant="ghost" 
                onClick={() => setShowMap(false)} 
                className="text-2xl px-0 pb-3 pr-1"
                aria-label="Close map"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="h-[382px]">
              <MapboxMap 
                long={-71.120} 
                lat={42.4075} 
                scale={17.33} 
                onLocationSelect={handleLocationSelect} 
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}