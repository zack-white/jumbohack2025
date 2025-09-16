"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MapboxMap from "@/app/map/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Tooltip from "@/components/tooltip";

type EventFormProps = {
  initialValues?: Partial<typeof defaultFormData>;
  onSubmit: (values: typeof defaultFormData) => Promise<void>;
  submitLabel?: string;
};

const defaultFormData = {
  name: "",
  date: "",
  start_time: "",
  end_time: "",
  description: "",
  organizationname: "",
  firstname: "",
  lastname: "",
  email: "",
  phonenumber: "",
  address: "",
  city: "",
  state: "",
  zipcode: "",
  timedTables: false,
  emailingEnabled: true,
  eventImage: null as File | null,
  spreadsheet: null as File | null,
  location: null as { x: number; y: number } | null,
  scale: 0,
};

export default function EventForm({
  initialValues = {},
  onSubmit,
  submitLabel = "Save Event",
}: EventFormProps) {
  const router = useRouter();
    const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];  

  // form state
  const [formData, setFormData] = useState({ ...defaultFormData, ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // extra states that were missing
  const [timedTables, setTimedTables] = useState(false);
  const [emailingEnabled, setEmailingEnabled] = useState(true);
  const [selectedState, setSelectedState] = useState("");
  const [spreadsheetColumns, setSpreadsheetColumns] = useState<string[]>([]);
  const [start_timeOfDay, setstart_timeOfDay] = useState("AM");
  const [end_timeOfDay, setend_timeOfDay] = useState("PM");
  const times = ["AM", "PM"];

    // useEffect(() => {
    // setFormData({ ...defaultFormData, ...initialValues });
    // }, [initialValues]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    handleChange(field, value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange("spreadsheet", file);
      setSpreadsheetColumns(["col1", "col2"]); // fake parse
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.date) newErrors.date = "Required";
    if (!formData.start_time) newErrors.start_time = "Required";
    if (!formData.end_time) newErrors.end_time = "Required";
    if (!formData.description) newErrors.description = "Required";
    if (!formData.organizationname) newErrors.organizationname = "Required";
    if (!formData.firstname) newErrors.firstname = "Required";
    if (!formData.lastname) newErrors.lastname = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.phonenumber) newErrors.phonenumber = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const resetForm = () => {
    setFormData(defaultFormData);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit(formData);
      toast.success("Success!");
      resetForm();
    } catch (err) {
      toast.error("Failed to submit");
    } finally {
      setIsLoading(false);
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

  const handleCancel = () => router.push("/");

  const getInputClasses = (field: keyof typeof errors) =>
    `${errors[field] ? "border-red-500" : "border-gray-200"} h-11`;

  const getSpreadsheetInputClasses = () =>
    `flex-grow h-11 ${
      errors.spreadsheet || errors.spreadsheetFormat
        ? "border-red-500"
        : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Example: Event Name */}
      <div>
        <label className="text-sm">Event Name*</label>
        <Input
          name="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
                    {errors.start_time && (
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
                      value={formData.start_time}
                      onChange={(e) => handleInputChange("start_time", e.target.value)}
                      className={`${getInputClasses("start_time")} basis-2/3`}
                      aria-invalid={errors.start_time ? "true" : "false"}
                    />
                    <div className="basis-1/3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <div className="relative">
                          <Button
                            variant="dropdown"
                            className={`${getInputClasses("start_time")} flex items-center`}
                          >
                            {start_timeOfDay === "" ? <div className="text-[#747474]">AM</div> : start_timeOfDay}
                          </Button>
                        </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                          <DropdownMenuLabel>Select a Time</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={start_timeOfDay}
                            onValueChange={setstart_timeOfDay}
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
                  {errors.start_time && (
                    <p className="text-sm text-red-500">{errors.start_time}</p>
                  )}
                </div>

                {/* END TIME */}
                <div className="space-y-1 mt-3 mb-3">
                  <label className="text-sm text-primary flex items-center">
                    End Time*
                    {errors.end_time && (
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
                      value={formData.end_time}
                      onChange={(e) => handleInputChange("end_time", e.target.value)}
                      className={`${getInputClasses("end_time")} basis-2/3`}
                      aria-invalid={errors.end_time ? "true" : "false"}
                    />
                    <div className="basis-1/3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <div className="relative">
                          <Button
                            variant="dropdown"
                            className={`${getInputClasses("end_time")} flex items-center`}
                          >
                            {end_timeOfDay === "" ? <div className="text-[#747474]">AM</div> : end_timeOfDay}
                          </Button>
                        </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                          <DropdownMenuLabel>Select a Time</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={end_timeOfDay}
                            onValueChange={setend_timeOfDay}
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
                  {errors.end_time && (
                    <p className="text-sm text-red-500">{errors.end_time}</p>
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
                <h2 className="text-lg font-bold font-serif text-primary">Contact Information</h2>
              </div>
              
              {/* ORGANIZATION NAME */}
              <div className="space-y-1 mt-3">
                <label className="text-sm text-primary flex items-center">
                  Organization Name*
                  {errors.organizationname && (
                    <span className="ml-2 text-xs text-red-500">
                      (Required)
                    </span>
                  )}
                </label>
                <Input
                  name="organizationname"
                  placeholder="e.g. JumboCode"
                  value={formData.organizationname}
                  onChange={(e) => handleInputChange("organizationname", e.target.value)}
                  className={getInputClasses("organizationname")}
                  aria-invalid={errors.organizationname ? "true" : "false"}
                />
                {errors.organizationname && (
                  <p className="text-sm text-red-500">{errors.organizationname}</p>
                )}
              </div>

              {/* REPRESENTATIVE NAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 mt-3"> 
                  <label className="text-sm text-primary flex items-center">
                    Representative First Name*
                    {errors.firstname && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="firstname"
                    type="text"
                    placeholder=""
                    value={formData.firstname}
                    onChange={(e) => handleInputChange("firstname", e.target.value)}
                    className={getInputClasses("firstname")}
                    aria-invalid={errors.firstname ? "true" : "false"}
                  />
                  {errors.firstname && (
                    <p className="text-sm text-red-500">{errors.firstname}</p>
                  )}
                </div>
                <div className="space-y-1 mt-3"> 
                  <label className="text-sm text-primary flex items-center">
                    Representative Last Name*
                    {errors.lastname && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="lastname"
                    type="text"
                    placeholder=""
                    value={formData.lastname}
                    onChange={(e) => handleInputChange("lastname", e.target.value)}
                    className={getInputClasses("lastname")}
                    aria-invalid={errors.lastname ? "true" : "false"}
                  />
                  {errors.lastname && (
                    <p className="text-sm text-red-500">{errors.lastname}</p>
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
                    {errors.phonenumber && (
                      <span className="ml-2 text-xs text-red-500">
                        (Required)
                      </span>
                    )}
                  </label>
                  <Input
                    name="phonenumber"
                    type="text"
                    placeholder="(XXX)-XXX-XXXX"
                    value={formData.phonenumber}
                    onChange={(e) => handleInputChange("phonenumber", e.target.value)}
                    className={getInputClasses("phonenumber")}
                    aria-invalid={errors.phonenumber ? "true" : "false"}
                  />
                  {errors.phonenumber && (
                    <p className="text-sm text-red-500">{errors.phonenumber}</p>
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
                    name="zipcode"
                    type="text"
                    placeholder=""
                    value={formData.zipcode}
                    onChange={(e) => handleInputChange("zipcode", e.target.value)}
                    className={getInputClasses("zipcode")}
                    aria-invalid={errors.zipcode ? "true" : "false"}
                  />
                  {errors.zipcode && (
                    <p className="text-sm text-red-500">{errors.zipcode}</p>
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
                            When enabled, organizations will be emailed to confirm attendance and provide their own descriptions. 
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
                    <Tooltip emailingEnabled={emailingEnabled} />
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
                  <Button type="submit" disabled={isLoading} className="bg-[#2E73B5] text-white">
                    {submitLabel}
                </Button>
                  {isLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading...</p>
                  )}
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
    </form>
  );
}
