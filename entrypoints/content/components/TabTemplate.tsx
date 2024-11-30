"use client";

import * as React from "react";

interface TabWithSectionsProps {
  controls?: React.ReactNode;
  progressSection?: React.ReactNode;
  mainContent: React.ReactNode;
  className?: string;
}

export function TabTemplate({
  controls,
  progressSection,
  mainContent,
  className = "",
}: TabWithSectionsProps) {
  return (
    <div
      className={`flex flex-col h-full w-full mx-auto overflow-hidden bg-white ${className}`}
    >
      {/* Control Section */}
      {controls && (
        <div className="flex-none flex items-center justify-between p-4 bg-gray-50 border-b">
          {controls}
        </div>
      )}

      {/* Progress Section */}
      {progressSection && (
        <div className="flex-none flex items-center justify-between bg-gray-50 border-b">
          {progressSection}
        </div>
      )}

      {/* Main Section */}
      <div className="flex-1 overflow-hidden bg-white">{mainContent}</div>
    </div>
  );
}
