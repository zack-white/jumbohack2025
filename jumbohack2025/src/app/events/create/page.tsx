"use client";

import { useState } from "react";
import MapboxMap from "@/app/map/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ChevronDown } from "lucide-react";
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
  const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];  
  const times = ["AM", "PM"];
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0];
  const [showMap, setShowMap] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [startTimeOfDay, setStartTimeOfDay] = useState("");
  const [endTimeOfDay, setEndTimeOfDay] = useState("");
  const [timedTables, setTimedTables] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    timedTables: false,
    eventImage: null as File | null,
    spreadsheet: null as File | null,
    location: null as { x: number; y: number } | null,
    scale: 0,
  });

  const [errors, setErrors] = useState({
    eventName: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    timedTables: "",
    eventImage: "",
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

  // Helper function to validate start time format (H:MM or HH:MM)
  const isValidStartTime = (timeStr: string) => {
    const regex = /^(?:[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeStr);
  };

  // Helper function to validate end time format (H:MM or HH:MM)
  const isValidEndTime = (timeStr: string) => {
    const regex = /^(?:[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeStr);
  };

  // Helper function to validate email format
  const isValidEmail = (email: string): boolean => {
    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Helper function to validate phone number format
  const isValidPhoneNumber = (phone: string): boolean => {
    // Allow digits, optional spaces, dashes, parentheses, and optional leading +
    const phoneRegex = /^\+?[\d\s\-().]{7,}$/;
    return phoneRegex.test(phone);
  }

  // Helper function for validating zip code
  const isValidZipCode = (zip: string): boolean => {
    // Matches 5-digit or 5+4 ZIP code formats like 12345 or 12345-6789
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  }

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
      startTime: "",
      endTime: "",
      description: "",
      organizationName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      timedTables: "",
      eventImage: "",
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

    // Start time validation
    if (!formData.startTime.trim()) {
      newErrors.startTime = "Start time is required";
      isValid = false;
    } else if (!isValidStartTime(formData.startTime) || startTimeOfDay === "") {
      newErrors.startTime = "Please use HH:MM format and choose a time of day";
      isValid = false;
    }

    // End time validation
    if (!formData.endTime.trim()) {
      newErrors.endTime = "End time is required";
      isValid = false;
    } else if (!isValidEndTime(formData.endTime) || endTimeOfDay === "") {
      newErrors.endTime = "Please use HH:MM format and choose a time of day";
      isValid = false;
    }

    // // Duration validation
    // if (!formData.duration.trim()) {
    //   newErrors.duration = "Duration is required";
    //   isValid = false;
    // } else if (!isValidDuration(formData.duration)) {
    //   newErrors.duration = "Use format like '24hr 30m' or '2 hours'";
    //   isValid = false;
    // }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    // Organization name validation
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
      isValid = false;
    } else if (formData.organizationName.length >= 100) {
      newErrors.organizationName = "Organization name must be less than 100 characters";
      isValid = false;
    }

    // Representative first name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Representative first name is required";
      isValid = false;
    } else if (formData.firstName.length >= 100) {
      newErrors.firstName = "Representative first name must be less than 100 characters";
      isValid = false;
    }

    // Representative last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Representative last name is required";
      isValid = false;
    } else if (formData.lastName.length >= 100) {
      newErrors.lastName = "Representative last name must be less than 100 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email must be in the form example@gmail.com";
      isValid = false;
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be in the form (XXX)-XXX-XXXX";
      isValid = false;
    }

    // Zip code validation
    if (formData.zipCode != "" && !isValidZipCode(formData.zipCode)) {
      newErrors.zipCode = "ZIP code must be in the form XXXXX or XXXXX-XXXX";
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
      startTime: "",
      endTime: "",
      description: "",
      organizationName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      timedTables: false,
      eventImage: null,
      spreadsheet: null,
      location: null,
      scale: 0,
    });
    setErrors({
      eventName: "",
      date: "",
      startTime: "",
      endTime: "",
      description: "",
      organizationName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      timedTables: "",
      eventImage: "",
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

    if (field === 'startTime' && value && !isValidStartTime(value)) {
      setErrors(prev => ({ ...prev, startTime: "Please use HH:MM AM/PM format" }));
    }

    if (field === 'endTime' && value && !isValidEndTime(value)) {
      setErrors(prev => ({ ...prev, endTime: "Please use HH:MM AM/PM format" }));
    }

    if (field === 'email' && value && !isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: "Email must be in the form example@gmail.com" }));
    }

    if (field === 'phoneNumber' && value && !isValidPhoneNumber(value)) {
      setErrors(prev => ({ ...prev, phoneNumber: "Phone number must be in the form (XXX)-XXX-XXXX" }));
    }

    if (field === 'zipCode' && value && !isValidZipCode(value)) {
      setErrors(prev => ({ ...prev, zipCode: "ZIP code must be in the form XXXXX or XXXXX-XXXX" }));
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
          startTime: formData.startTime + " " + startTimeOfDay,
          endTime: formData.endTime + " " + endTimeOfDay,
          description: formData.description,
          organizationName: formData.organizationName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          state: selectedState,
          zipCode: formData.zipCode,
          location: formData.location,
          scale: formData.scale,
          creator: userEmail?.emailAddress,
          timedTables: timedTables
        }),
      });

      toast.promise(promise, {
        loading: "Creating event...",
        success: async (response) => {
          // Call the excel processing API here
          if (formData.spreadsheet) {
            if (timedTables) {
              await processExcelTimed(formData.spreadsheet);
            } else {
              await processExcel(formData.spreadsheet);
            }
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
  
  // Function to process Excel file WITHOUT timed tables
  const processExcel = async (file: File) => {
    const parserData = new FormData();
    parserData.append("file", file);
    parserData.append("timedTable", timedTables ? "true" : "false");
    parserData.append("fallbackStartTime", formData.startTime);
    parserData.append("fallbackEndTime", formData.endTime);

    try {
      const response = await fetch("/api/processExcel", {
        method: "POST",
        body: parserData,
      });

      if (!response.ok) {
        throw new Error("Failed to process Excel file");
      }

      await response.json();
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Error processing Excel file. Please try again.");
    }
  };

  // Function to process Excel file WITH timed tables
  const processExcelTimed = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/processExcelTimed", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process Excel file");
      }

      await response.json();
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
            <hr className="my-4 border-t border-gray-300" />
          </div>
          <hr style={{ width: "100%", borderTop: "1px solid #ccc", marginBottom: "1rem"}} />
          <div className="mb-3">
            <h1 className="text-l font-bold font-serif text-primary">Event Information</h1>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Event Title */}
              <div className="mb-3">
                <h2 className="text-lg font-bold font-serif text-primary">Event Information</h2>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* START TIME */}
                <div className="space-y-1">
                  <label className="text-sm text-primary flex items-center">
                    Start Time*
                    {errors.startTime && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <div className="flex flex-row gap-2">
                    <Input
                      name="time"
                      type="text"
                      placeholder="HH:MM"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      className={`${getInputClasses("startTime")} basis-2/3`}
                      aria-invalid={errors.startTime ? "true" : "false"}
                    />
                    <div className="basis-1/3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <div className="relative">
                          <Button
                            variant="dropdown"
                            className={`${getInputClasses("startTime")} flex items-center`}
                          >
                            {startTimeOfDay === "" ? <div className="text-[#747474]">AM</div> : startTimeOfDay}
                          </Button>
                        </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                          <DropdownMenuLabel>Select a Time</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={startTimeOfDay}
                            onValueChange={setStartTimeOfDay}
                          >
                              {times.map((abbr) => (
                              <DropdownMenuRadioItem key={abbr} value={abbr}>
                                {abbr}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {errors.startTime && (
                    <p className="text-sm text-red-500">{errors.startTime}</p>
                  )}
                </div>

                {/* END TIME */}
                <div className="space-y-1">
                  <label className="text-sm text-primary flex items-center">
                    End Time*
                    {errors.endTime && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <div className="flex flex-row gap-2">
                    <Input
                      name="time"
                      type="text"
                      placeholder="HH:MM"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      className={`${getInputClasses("endTime")} basis-2/3`}
                      aria-invalid={errors.endTime ? "true" : "false"}
                    />
                    <div className="basis-1/3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <div className="relative">
                          <Button
                            variant="dropdown"
                            className={`${getInputClasses("endTime")} flex items-center`}
                          >
                            {endTimeOfDay === "" ? <div className="text-[#747474]">AM</div> : endTimeOfDay}
                          </Button>
                        </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                          <DropdownMenuLabel>Select a Time</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={endTimeOfDay}
                            onValueChange={setEndTimeOfDay}
                          >
                            {times.map((abbr) => (
                              <DropdownMenuRadioItem key={abbr} value={abbr}>
                                {abbr}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {errors.endTime && (
                    <p className="text-sm text-red-500">{errors.endTime}</p>
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

              {/* Table and Location Title */}
              <div className="pt-4 mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold font-serif text-primary">Table and Location Information</h2>
                  {/* Timed Table Toggle */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-serif font-medium">Toggle Timed Tables</span>

                    <button
                      type="button" // To prevent form thinking this is a submit
                      onClick={() => setTimedTables(!timedTables)}
                      className={`relative w-[4rem] h-[1.8rem] flex items-center rounded-full p-1 transition-colors duration-300 ${
                        timedTables ? "bg-[#2E73B5]" : "bg-gray-400"
                      }`}
                    >
                      <span
                        className={`absolute left-2 text-xs text-white font-bold transition-all duration-300 ${
                          timedTables ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        ON
                      </span>
                      <span
                        className={`absolute right-2 text-xs text-white font-bold transition-all duration-300 ${
                          timedTables ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        OFF
                      </span>
                      <span
                        className={`h-6 w-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          timedTables ? "translate-x-8" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
              </div>

              {/* SPREADSHEET */}
              <div className="space-y-1">
                <div className="flex items-between gap-3">
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
              
              {/* ORGANIZATION NAME */}
              <div className="space-y-1">
                <label className="text-sm text-primary flex items-center">
                  Organization Name*
                  {errors.organizationName && (
                    <span className="ml-2 text-xs text-red-500">
                      (Required)
                    </span>
                  )}
                </label>
                <Input
                  name="organizationName"
                  placeholder="e.g. JumboCode"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange("organizationName", e.target.value)}
                  className={getInputClasses("organizationName")}
                  aria-invalid={errors.organizationName ? "true" : "false"}
                />
                {errors.organizationName && (
                  <p className="text-sm text-red-500">{errors.organizationName}</p>
                )}
              </div>

              {/* REPRESENTATIVE NAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1"> 
                  <label className="text-sm text-primary flex items-center">
                    Representative First Name*
                    {errors.firstName && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="firstName"
                    type="text"
                    placeholder=""
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={getInputClasses("firstName")}
                    aria-invalid={errors.firstName ? "true" : "false"}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-1"> 
                  <label className="text-sm text-primary flex items-center">
                    Representative Last Name*
                    {errors.lastName && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="lastName"
                    type="text"
                    placeholder=""
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={getInputClasses("lastName")}
                    aria-invalid={errors.lastName ? "true" : "false"}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* CONTACT INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EMAIL */}
                <div className="space-y-1"> 
                  <label className="text-sm text-primary flex items-center">
                    Email*
                    {errors.email && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="email"
                    type="text"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={getInputClasses("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                {/* PHONE NUMBER */}
                <div className="space-y-1"> 
                  <label className="text-sm text-primary flex items-center">
                    Phone Number*
                    {errors.phoneNumber && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="phoneNumber"
                    type="text"
                    placeholder="(XXX)-XXX-XXXX"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className={getInputClasses("phoneNumber")}
                    aria-invalid={errors.phoneNumber ? "true" : "false"}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* LOCATION INFO */}

              {/* ADDRESS */}
              <div className="space-y-1">
                <label className="text-sm text-primary flex items-center">
                  Address
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={getInputClasses("address")}
                  aria-invalid={errors.address ? "true" : "false"}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{marginBottom: "2rem"}}>
                {/* CITY */}
                <div className="space-y-1"> 
                  <label className="text-sm text-primary flex items-center">
                    City
                  </label>
                  <Input
                    name="city"
                    type="text"
                    placeholder=""
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={getInputClasses("city")}
                    aria-invalid={errors.city ? "true" : "false"}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                {/* STATE */}
                <div className="space-y-1"> 
                  <label className="text-sm text-primary flex items-center">
                    State
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <div className="relative">
                      <Button
                        variant="dropdown"
                        className={`${getInputClasses("state")} flex items-center`}
                      >
                        {selectedState}
                      </Button>
                      <ChevronDown className="w-4 h-4 ml-auto opacity-70 absolute right-2 top-1/2 transform -translate-y-1/2" />
                    </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-60 overflow-y-auto">
                      <DropdownMenuLabel>Select a State</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={selectedState} onValueChange={setSelectedState}>
                        {usStates.map((abbr) => (
                          <DropdownMenuRadioItem key={abbr} value={abbr}>
                            {abbr}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
                {/* ZIP CODE */}
                <div className="space-y-1"> 
                  <label className="text-sm text-primary flex items-center">
                    ZIP Code
                  </label>
                  <Input
                    name="zipCode"
                    type="text"
                    placeholder=""
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    className={getInputClasses("zipCode")}
                    aria-invalid={errors.zipCode ? "true" : "false"}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>
              </div>
              
              {/* TABLE AND LOCATION INFORMATION SECTION */}
              <div className="mb-3 flex flex-col gap-2 sm:flex-row justify-between">
                <h1 className="text-l font-bold font-serif text-primary">Table and Location Information</h1>
                <div className="sm:self-end flex flex-row items-center gap-2">
                  <h2 className="text-xs font-bold font-serif text-primary">Toggle Timed Tables</h2>
                  <Switch checked={timedTables} onCheckedChange={setTimedTables} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{marginBottom: "2rem"}}>
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
                  <div className="flex gap-2 relative">
                    <Input
                      name="spreadsheet"
                      type="text"
                      placeholder="Choose a spreadsheet file (.xlsx)"
                      value={formData.spreadsheet ? formData.spreadsheet.name : ""}
                      readOnly
                      className={`flex-grow h-11 ${errors.spreadsheet ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                      aria-invalid={errors.spreadsheet ? "true" : "false"}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-7 px-3 bg-[#2E73B5] text-xs text-[#fff] hover:bg-[#235d92]"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        Upload
                      </Button>
                    </div>
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
                <div className="space-y-1 relative">
                  <label className="text-sm text-primary flex items-center">
                    Location*
                    {errors.location && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2 relative">
                    <Input
                      name="location"
                      type="text"
                      value={
                        formData.location
                          ? `${formData.location.x.toFixed(4)}, ${formData.location.y.toFixed(4)}`
                          : ""
                      }
                      readOnly
                      className={`flex-grow h-11 ${errors.location ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                      aria-invalid={errors.location ? "true" : "false"}
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-7 px-3 bg-[#2E73B5] text-xs text-[#fff] hover:bg-[#235d92]"
                        onClick={() => setShowMap(true)}
                      >
                        Choose Location
                      </Button>
                    </div>
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* UPLOAD EVENT IMAGE WILL GO HERE */}

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