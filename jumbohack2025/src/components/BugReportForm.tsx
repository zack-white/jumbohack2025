"use client";

import React from "react";
import { useState, DragEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

type UploadedFile = File;

export default function BugReportForm() {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<string | null>(null);
    const [file, setFile] = useState<UploadedFile | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState("");
    const maxSize = 50 * 1024 * 1024; // 50 MB

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
      
        const uploaded = fileList[0];
        const isValidType = ["image/jpeg", "image/png"].includes(uploaded.type);
        const isValidSize = uploaded.size <= maxSize;
      
        if (!isValidType) {
          alert("Only JPEG and PNG files are allowed.");
          return;
        }
      
        if (!isValidSize) {
          alert("File must be less than 50MB.");
          return;
        }
      
        setFile(uploaded);
    };
      
    
    const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files);
    };

    const handleCancel = () => {
        window.location.href = "/";
    };

    const handleSubmit = async () => {
        const formData = new FormData();
      
        formData.append("selectedReason", selectedReason || "");
        formData.append("description", description);
        formData.append("priority", priority || "");
        formData.append("additionalInfo", additionalInfo);
      
        if (file) {
            formData.append("file", file);
        }
      
        const response = await fetch("/api/bug-report", {
          method: "POST",
          body: formData,
        });
      
        const data = await response.json();
        if (response.ok) {
          alert("Bug report sent!");
        } else {
          alert("Failed to send: " + data.error);
        }
      };

    return (
        <div className="bg-categoryBg p-12 shadow-md mx-auto w-full text-left">
            {/* Title */}
            <h1 className="text-2xl text-gray-900 md:text-3xl font-bold font-serif">Bug Report</h1>

            {/* Horizontal divider */}
            <hr className="my-4 border-gray-300" />

            {/* Reason */}
            <p className="text-gray-700 text-lg">Reason for reporting this bug?</p>
            <div className="flex flex-wrap gap-2 mt-4">
                {[
                    "Functionality Issue",
                    "Visual/Aesthetic Issue",
                    "Performance Issue",
                    "Security Issue",
                    "Data/Content Issue",
                    "Crash/Error Issue",
                    "Usability/UX Issue",
                    "Other"
                ].map((label, index) => (
                    <button 
                        key={index} 
                        onClick={() => setSelectedReason(selectedReason === label ? null : label)}
                        className={`px-6 py-3 font-medium border border-[#2971AC] ${
                            selectedReason === label
                                ? "bg-[#2971AC] text-white"
                                : "bg-white hover:bg-[#B2DFFF] text-[#2971AC]"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Description */}
            <p className="text-gray-700 text-lg mt-10">Help us understand the issue</p>
            <Textarea
                name="description"
                placeholder="Please provide a detailed description..."
                className="mt-4 h-32 min-h-[120px] border-gray-200"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            {/* Bug Priority */}
            <p className="text-gray-700 text-lg mt-10">Bug Priority</p>
            <p className="text-gray-500 text-sm mt-2">Choose the priority level of this bug: High/Medium/Low. Priority indicates the impact of the bug on users’ experience or system functionality.</p>
            <div className="flex flex-wrap gap-2 mt-4">
                <button
                    onClick={() => setPriority(priority === "High" ? null : "High")}
                    className={`px-6 py-3 font-medium border ${
                        priority === "High" ? "bg-[#B01C1C] text-white" : "bg-white hover:bg-[#F4B3B3] text-black"
                    } border-[#B01C1C]`}
                >
                    High Priority
                </button>
                <button
                    onClick={() => setPriority(priority === "Medium" ? null : "Medium")}
                    className={`px-6 py-3 font-medium border ${
                        priority === "Medium" ? "bg-[#D47720] text-white" : "bg-white hover:bg-[#F8D3A3] text-black"
                    } border-[#D47720]`}
                >
                    Medium Priority
                </button>
                <button
                    onClick={() => setPriority(priority === "Low" ? null : "Low")}
                    className={`px-6 py-3 font-medium border ${
                        priority === "Low" ? "bg-[#109027] text-white" : "bg-white hover:bg-[#A7E3B1] text-black"
                    } border-[#109027]`}
                >
                    Low Priority
                </button>
            </div>

            {/* Files */}
            <p className="text-gray-700 text-lg mt-10">Attach Files</p>
            <p className="text-gray-500 text-sm mt-2">Upload screenshots, recordings, or relevant files that illustrate the bug you are reporting.</p>
            <div className="flex gap-4 w-full">
                {/* Upload Box */}
                <div
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 mt-4 p-6 text-center bg-white"
                >
                    {!file ? (
                    <>
                        <p className="text-gray-700 font-medium">
                        Choose a file or drag & drop here
                        </p>
                        <p className="text-sm text-gray-500 mt-1 mb-2">JPEG and PNG, up to 50MB</p>
                        <label className="mt-3 inline-block">
                        <input
                            type="file"
                            accept=".jpeg,.jpg,.png"
                            className="hidden"
                            onChange={onChange}
                        />
                        <span className="bg-[#2971AC] text-white px-4 py-2 cursor-pointer">
                            Browse Files
                        </span>
                        </label>
                        <p className="text-sm text-gray-500 mt-4">Maximum of 1 photo</p>
                    </>
                    ) : (
                    <p className="text-gray-500">File already uploaded.</p>
                    )}
                </div>

                {/* Uploaded File Display */}
                {file && (
                    <div className="flex items-center justify-between w-1/2 px-4 py-3 bg-white border mt-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-10 bg-gray-100 rounded">
                        <span className="text-xs font-bold">PNG</span>
                        </div>
                        <div>
                        <p className="font-semibold text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(0)}kb of {(maxSize / 1024).toFixed(0)}kb
                        </p>
                        </div>
                    </div>
                    <button
                        className="text-gray-600 hover:text-black"
                        onClick={() => setFile(null)}
                    >
                        ×
                    </button>
                    </div>
                )}
                </div>

            {/* Additional Info */}
            <p className="text-gray-700 text-lg mt-10">Additional Information</p>
            <Textarea
                name="additionalInfo"
                placeholder="Anything else you'd like to mention?"
                className="mt-4 h-32 min-h-[120px] border-gray-200"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
            />

            {/* Submit */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleCancel}
                    className="bg-white text-slate-900 px-6 py-3 font-medium border border-[#2971AC] mr-3"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit}
                    className="bg-[#2971AC] text-white px-6 py-3 font-medium">
                    Submit Report
                </button>
            </div>
        </div>
    );
}