"use client";

import * as React from "react";
import { ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      className={`flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg overflow-hidden ${className}`}
    >
      {/* Control Section */}
      {controls && (
        <div className="flex items-center justify-between p-4 bg-muted">
          {controls}
        </div>
      )}

      {/* Progress Section */}
      {progressSection && (
        <div className="flex items-center justify-between p-4 bg-muted">
          {progressSection}
        </div>
      )}

      {/* Main Section */}
      <ScrollArea className="flex-grow p-4">{mainContent}</ScrollArea>
    </div>
  );
}
