import React from 'react';


export default function Tooltip() {
  return (
    <div className="relative inline-block">
      {/* Group container to enable hover effect */}
      <div className="group">
        {/* The "?" icon */}
        <span className="cursor-pointer text-blue-500 rounded-full border border-blue-500 w-5 h-5 flex items-center justify-center">
          ?
        </span>
        {/* Tooltip popup */}
        <div className="opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-300 
                absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-4 pointer-events-none z-10 w-64">
            <p className="text-center">
            Upload a spreadsheet with the following columns: <br />
            <strong>Club Name</strong>, <strong>Category</strong>, <strong>Club Contact Email</strong> <br />
            With each row being a new club.
            </p>
        </div>
      </div>
    </div>
  );
};