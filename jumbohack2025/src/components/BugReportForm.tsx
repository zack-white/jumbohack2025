"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";

export default function BugReportForm() {
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
                    <button key={index} className="bg-white text-[#2971AC] border border-[#2971AC] px-6 py-3 font-medium">
                        {label}
                    </button>
                ))}
            </div>

            {/* Description */}
            <p className="text-gray-700 text-lg mt-10">Help us understand the issue</p>
            <Textarea
                name="description"
                placeholder="Please provide a detailed description of the bug. How to reproduce the bug, expected behavior, and actual behavior. Include any other relevant information or information."
                className="mt-4 h-32 min-h-[120px] border-gray-200"
                // onChange={(e) => handleInputChange("description", e.target.value)}
                // aria-invalid={errors.description ? "true" : "false"}
            />

            {/* Bug Priority */}
            <p className="text-gray-700 text-lg mt-10">Bug Priority</p>
            <p className="text-gray-500 text-sm mt-2">Choose the priority level of this bug: High/Medium/Low. Priority indicates the impact of the bug on users’ experience or system functionality.</p>
            <div className="flex flex-wrap gap-2">
                <button className="bg-white text-black border border-[#B01C1C] px-6 py-3 font-medium mt-4">
                    High Priority
                </button>
                <button className="bg-white text-black border border-[#D47720] px-6 py-3 font-medium mt-4">
                    Medium Priority
                </button>
                <button className="bg-white text-black border border-[#109027] px-6 py-3 font-medium mt-4">
                    Low Priority
                </button>
            </div>

            {/* Files */}


            {/* Additional Info */}
            <p className="text-gray-700 text-lg mt-10">Additional Information</p>
            <Textarea
                name="description"
                placeholder="Anything else you would like to mention, not listed above?"
                className="mt-4 h-32 min-h-[120px] border-gray-200"
                // onChange={(e) => handleInputChange("description", e.target.value)}
                // aria-invalid={errors.description ? "true" : "false"}
            />

            {/* Submit */}
            <div className="flex justify-end mt-6">
                <button className="bg-white text-slate-900 px-6 py-3 font-medium border border-[#2971AC] mr-3">
                    Cancel
                </button>
                <button className="bg-[#2971AC] text-white px-6 py-3 font-medium">
                    Submit Report
                </button>
            </div>
        </div>
    );
}