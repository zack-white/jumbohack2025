"use client";

import React from "react";

export default function BugReportForm() {
    return (
        <div className="bg-categoryBg p-8 rounded shadow-md mx-auto w-full text-left">
            {/* Title */}
            <h1 className="text-2xl text-gray-900 md:text-3xl font-bold font-serif">Bug Report</h1>

            {/* Horizontal divider */}
            <hr className="my-4 border-gray-300" />

            {/* Reason */}
            <p className="text-gray-700">Reason for reporting this bug?</p>
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
        </div>
    );
}