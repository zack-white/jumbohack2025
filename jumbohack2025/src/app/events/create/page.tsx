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
import * as XLSX from 'xlsx'; // Add XLSX import for client-side validation

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
  const [emailingEnabled, setEmailingEnabled] = useState(true); // New state for email toggle
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
    emailingEnabled: true, // New field
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
    spreadsheetFormat: "", // New error for spreadsheet format
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [spreadsheetColumns, setSpreadsheetColumns] = useState<string[]>([]); // Track detected columns

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

  // Helper function to validate spreadsheet format
  const validateSpreadsheetFormat = (columns: string[], emailingEnabled: boolean) => {
    const normalizedColumns = columns.map(col => col.toLowerCase().trim());
    
    if (emailingEnabled) {
      // When emailing is enabled: Name, Category, Contact are required
      const requiredColumns = ['name', 'category', 'contact'];
      const missingColumns = requiredColumns.filter(required => 
        !normalizedColumns.some(col => col.includes(required))
      );
      
      if (missingColumns.length > 0) {
        return `Missing required columns: ${missingColumns.map(col => col.charAt(0).toUpperCase() + col.slice(1)).join(', ')}. Required: Name, Category, Contact.`;
      }
    } else {
      // When emailing is disabled: Name, Category, Description are required
      const requiredColumns = ['name', 'category', 'description'];
      const missingColumns = requiredColumns.filter(required => 
        !normalizedColumns.some(col => col.includes(required))
      );
      
      if (missingColumns.length > 0) {
        return `Missing required columns: ${missingColumns.map(col => col.charAt(0).toUpperCase() + col.slice(1)).join(', ')}. Required: Name, Category, Description. Contact is optional.`;
      }
    }
    
    return null; // No errors
  };

  // Helper function to read and validate Excel file
  const validateExcelFile = async (file: File, emailingEnabled: boolean) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      if (jsonData.length === 0) {
        return { error: "Spreadsheet appears to be empty", columns: [] };
      }
      
      const headers = jsonData[0] as string[];
      const columns = headers.filter(header => header && header.toString().trim() !== '');
      
      // More sophisticated validation that checks actual data
      if (emailingEnabled) {
        // When emailing enabled: need name, category, contact columns with data
        const formatError = validateSpreadsheetFormat(columns, emailingEnabled);
        if (formatError) {
          return { error: formatError, columns };
        }
        
        // Also check if contact column has data in the rows
        if (jsonData.length > 1) {
          const sampleRows = jsonData.slice(1, Math.min(4, jsonData.length)); // Check first 3 data rows
          const contactColumnIndex = headers.findIndex(h => 
            h && h.toLowerCase().includes('contact')
          );
          
          if (contactColumnIndex >= 0) {
            const hasEmptyContacts = sampleRows.some(row => {
              const contactValue = (row as string[])[contactColumnIndex];
              return !contactValue || contactValue.toString().trim() === '';
            });
            
            if (hasEmptyContacts) {
              return { 
                error: "Contact information is required for all organizations when emailing is enabled. Some rows have empty contact fields.", 
                columns 
              };
            }
          }
        }
      } else {
        // When emailing disabled: need name, category, description
        const formatError = validateSpreadsheetFormat(columns, emailingEnabled);
        if (formatError) {
          return { error: formatError, columns };
        }
        
        // Check if description column has data
        if (jsonData.length > 1) {
          const sampleRows = jsonData.slice(1, Math.min(4, jsonData.length));
          const descriptionColumnIndex = headers.findIndex(h => 
            h && h.toLowerCase().includes('description')
          );
          
          if (descriptionColumnIndex >= 0) {
            const hasEmptyDescriptions = sampleRows.some(row => {
              const descValue = (row as string[])[descriptionColumnIndex];
              return !descValue || descValue.toString().trim() === '';
            });
            
            if (hasEmptyDescriptions) {
              return { 
                error: "Descriptions are required for all organizations when emailing is disabled. Some rows have empty description fields.", 
                columns 
              };
            }
          }
        }
      }
      
      return { error: null, columns };
    } catch (error) {
      return { 
        error: "Unable to read spreadsheet file. Please ensure it's a valid .xlsx or .xls file.", 
        columns: [] 
      };
    }
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
      spreadsheetFormat: "", // Include the new error field
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
    } else if (errors.spreadsheetFormat) {
      // If there's a format error from file validation, block submission
      newErrors.spreadsheetFormat = errors.spreadsheetFormat;
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

  // Function to re-validate spreadsheet when email toggle changes
  const revalidateSpreadsheet = async (newEmailingEnabled: boolean) => {
    if (formData.spreadsheet && spreadsheetColumns.length > 0) {
      const formatError = validateSpreadsheetFormat(spreadsheetColumns, newEmailingEnabled);
      
      if (formatError) {
        setErrors(prev => ({ ...prev, spreadsheetFormat: formatError }));
      } else {
        setErrors(prev => ({ ...prev, spreadsheetFormat: "" }));
        toast.success("Spreadsheet format is valid for current settings!");
      }
    }
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
      emailingEnabled: true,
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
      spreadsheetFormat: "", // Include the new error field
      location: "",
    });
    setSpreadsheetColumns([]); // Clear detected columns
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, spreadsheet: file }));
      
      // Clear previous errors
      setErrors(prev => ({ ...prev, spreadsheet: "", spreadsheetFormat: "" }));
      
      if (!isValidSpreadsheet(file)) {
        setErrors(prev => ({ ...prev, spreadsheet: "Only .xlsx or .xls files are allowed" }));
        setSpreadsheetColumns([]);
        return;
      }

      // Validate spreadsheet format
      const validation = await validateExcelFile(file, emailingEnabled);
      setSpreadsheetColumns(validation.columns);
      
      if (validation.error) {
        setErrors(prev => ({ ...prev, spreadsheetFormat: validation.error }));
      } else {
        // Clear any previous format errors
        setErrors(prev => ({ ...prev, spreadsheetFormat: "" }));
        toast.success("Spreadsheet format validated successfully!");
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

    setIsLoading(true);

    try {
      // FIRST: Process and validate the Excel file before creating the event
      if (formData.spreadsheet) {
        console.log("Processing Excel file before creating event...");
        
        const excelFormData = new FormData();
        excelFormData.append("file", formData.spreadsheet);
        excelFormData.append("timedTable", timedTables ? "true" : "false");
        excelFormData.append("fallbackStartTime", formData.startTime + " " + startTimeOfDay);
        excelFormData.append("fallbackEndTime", formData.endTime + " " + endTimeOfDay);
        excelFormData.append("emailingEnabled", emailingEnabled.toString());
        excelFormData.append("validateOnly", "true"); // Add flag to only validate, not insert

        const excelResponse = await fetch("/api/processExcel", {
          method: "POST",
          body: excelFormData,
        });

        if (!excelResponse.ok) {
          const excelError = await excelResponse.json();
          console.error("Excel validation failed:", excelError);
          
          // Show specific error message from Excel processing
          toast.error(excelError.message || "Spreadsheet validation failed");
          
          // Set the spreadsheet format error to show on the form
          setErrors(prev => ({ 
            ...prev, 
            spreadsheetFormat: excelError.message || "Spreadsheet format is invalid"
          }));
          
          setIsLoading(false); // Reset loading state on error
          return; // Stop here - don't create event
        }

        console.log("Excel file validated successfully");
      }

      // SECOND: Create the event only after Excel validation passes
      const eventResponse = await fetch("/api/event", {
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
          timedTables: timedTables,
          emailingEnabled: emailingEnabled,
        }),
      });

      if (!eventResponse.ok) {
        throw new Error("Failed to create event");
      }

      const eventResult = await eventResponse.json();
      const eventId = eventResult.eventId + 1;

      console.log("Event created successfully with ID:", eventId);

      // THIRD: Now process Excel file for real (insert data)
      if (formData.spreadsheet) {
        const finalExcelFormData = new FormData();
        finalExcelFormData.append("file", formData.spreadsheet);
        finalExcelFormData.append("timedTable", timedTables ? "true" : "false");
        finalExcelFormData.append("fallbackStartTime", formData.startTime + " " + startTimeOfDay);
        finalExcelFormData.append("fallbackEndTime", formData.endTime + " " + endTimeOfDay);
        finalExcelFormData.append("emailingEnabled", emailingEnabled.toString());
        finalExcelFormData.append("eventId", eventId.toString()); // Pass the actual event ID

        const finalExcelResponse = await fetch("/api/processExcel", {
          method: "POST",
          body: finalExcelFormData,
        });

        if (!finalExcelResponse.ok) {
          // This shouldn't happen since we validated earlier, but handle it
          console.error("Excel processing failed after event creation");
          toast.error("Event created but spreadsheet processing failed. Please contact support.");
          setIsLoading(false);
          return;
        }

        console.log("Excel file processed and data inserted successfully");
      }

      // SUCCESS: Everything worked
      toast.success("Event and spreadsheet processed successfully!");
      
      const locationParam = formData.location ? 
        `?x=${formData.location.x}&y=${formData.location.y}&scale=${formData.scale}` : '';
      
      resetForm();
      setIsLoading(false);
      router.push(`/placement/${eventId}${locationParam}`);

    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create event. Please try again.");
      setIsLoading(false);
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

  // Helper function to get input classes based on error state
  const getInputClasses = (field: keyof typeof errors) => {
    return `${errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-200"} h-11`;
  };

  // Helper function for spreadsheet input classes (checks both spreadsheet and format errors)
  const getSpreadsheetInputClasses = () => {
    return `flex-grow h-11 ${(errors.spreadsheet || errors.spreadsheetFormat) ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`;
  };

  return (
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
      <div className="bg-[#F7F9FB] max-w-4xl w-full md:w-[80%] lg:w-[60%] mx-auto p-8">
        <div>
          <div className="mb-3">
            <h1 className="text-2xl font-bold font-serif text-primary">Create Event</h1>
          </div>
          <hr style={{ width: "100%", borderTop: "1px solid #ccc", marginBottom: "1rem"}} />
          <div>
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Event Title */}
              <div className="mb-3">
                <h2 className="text-lg font-bold font-serif text-primary">Event Information</h2>
              </div>
              {/* EVENT NAME */}
              <div className="space-y-1 mt-3">
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
                <div className="space-y-1 mt-3">
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
                <div className="space-y-1  mt-3">
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
                <div className="space-y-1 mt-3 mb-3">
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
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold font-serif text-primary">Contact Information</h2>
                  <Tooltip text="All contact information inputted will be displayed publicly." />
                </div>
              </div>
              
              {/* ORGANIZATION NAME */}
              <div className="space-y-1 mt-3">
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
                <div className="space-y-1 mt-3"> 
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
                <div className="space-y-1 mt-3"> 
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
                <div className="space-y-1 mt-3"> 
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
                <div className="space-y-1 mt-3 mb-3"> 
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
              <div className="space-y-1 mt-3">
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
                <div className="space-y-1 mt-3"> 
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
                <div className="space-y-1 mt-3"> 
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
                <div className="space-y-1 mt-3"> 
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
              <div className="mb-3 flex flex-col gap-4">
                <h2 className="font-bold font-serif">Table and Location Information</h2>
                
                {/* Mobile-first toggle section */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 sm:justify-end">
                  {/* Email Organizations Toggle */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 sm:items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-serif font-medium">Email Organizations</span>
                      <div className="relative group">
                        {/* Question mark tooltip */}
                        <span className="cursor-pointer text-blue-500 rounded-full border border-blue-500 w-5 h-5 flex items-center justify-center text-xs">
                          ?
                        </span>
                        <div className="opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-300 
                                absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-2 px-3 pointer-events-none z-10 w-72 sm:w-80">
                          <p className="text-center">
                            When enabled, organizations will be emailed to confirm attendance and provide their own descriptions. <br></br>
                            When disabled, contact information becomes optional and descriptions must be included in the spreadsheet.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const newEmailingEnabled = !emailingEnabled;
                        setEmailingEnabled(newEmailingEnabled);
                        setFormData(prev => ({ ...prev, emailingEnabled: newEmailingEnabled }));
                        // Re-validate spreadsheet with new setting
                        await revalidateSpreadsheet(newEmailingEnabled);
                      }}
                      className={`relative w-16 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                        emailingEnabled ? "bg-[#2E73B5]" : "bg-gray-400"
                      } sm:w-[4rem] sm:h-[1.8rem]`}
                    >
                      <span
                        className={`absolute left-2 text-xs text-white font-bold transition-all duration-300 ${
                          emailingEnabled ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        ON
                      </span>
                      <span
                        className={`absolute right-2 text-xs text-white font-bold transition-all duration-300 ${
                          emailingEnabled ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        OFF
                      </span>
                      <span
                        className={`h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          emailingEnabled ? "translate-x-8" : "translate-x-0"
                        } sm:h-6 sm:w-6`}
                      />
                    </button>
                  </div>

                  {/* Timed Tables Toggle */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 sm:items-center">
                    <span className="text-sm font-serif font-medium">Timed Tables</span>
                    <button
                      type="button" // To prevent form thinking this is a submit
                      onClick={() => setTimedTables(!timedTables)}
                      className={`relative w-16 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                        timedTables ? "bg-[#2E73B5]" : "bg-gray-400"
                      } sm:w-[4rem] sm:h-[1.8rem]`}
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
                        className={`h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          timedTables ? "translate-x-8" : "translate-x-0"
                        } sm:h-6 sm:w-6`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6" style={{marginBottom: "2rem"}}>
                {/* SPREADSHEET */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-primary flex items-center">
                      Select Spreadsheet*
                      {errors.spreadsheet && (
                        <span className="ml-2 text-xs text-red-500">
                          (Required)
                        </span>
                      )}
                    </label>
                    <Tooltip 
                      text={emailingEnabled 
                        ? "Upload a spreadsheet with the following columns:<br/><strong>Name</strong>, <strong>Category</strong>, <strong>Contact Email</strong><br/>Organizations will be emailed to confirm attendance and provide descriptions. Each new row should represent a new table."
                        : "Upload a spreadsheet with the following columns:<br/><strong>Name</strong>, <strong>Category</strong>, <strong>Contact Email (optional)</strong>, <strong>Description</strong><br/>No emails will be sent - descriptions must be provided in the spreadsheet. Each new row should represent a new table."
                      }
                    />
                  </div>
                  <div className="flex gap-2 relative">
                    <Input
                      name="spreadsheet"
                      type="text"
                      placeholder="Choose a spreadsheet file (.xlsx)"
                      value={formData.spreadsheet ? formData.spreadsheet.name : ""}
                      readOnly
                      className={getSpreadsheetInputClasses()}
                      aria-invalid={(errors.spreadsheet || errors.spreadsheetFormat) ? "true" : "false"}
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
                  {errors.spreadsheetFormat && (
                    <p className="text-sm text-red-500">{errors.spreadsheetFormat}</p>
                  )}
                  {!errors.spreadsheet && !errors.spreadsheetFormat && formData.spreadsheet && spreadsheetColumns.length > 0 && (
                    <p className="text-sm text-green-600">
                      ✓ Detected columns: {spreadsheetColumns.join(', ')}
                    </p>
                  )}
                </div>

                {/* LOCATION */}
                <div className="space-y-1 mt-3 relative">
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
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-7 px-3 bg-[#2E73B5] text-xs text-[#fff] hover:bg-[#235d92] whitespace-nowrap"
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
                <div className="flex flex-col items-start">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 px-6 bg-[#2E73B5] hover:bg-[#235d92]"
                  >
                    Create Event
                  </Button>
                  {isLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading...</p>
                  )}
                </div>
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