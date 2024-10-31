"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlignJustify, Search, Settings } from "lucide-react";

// This is mock data for the transcript. In a real application, you'd fetch this from your backend.
const mockTranscript = [
  { time: "0:00", text: "Welcome to this video about React development." },
  { time: "0:05", text: "Today, we'll be discussing component architecture." },
  {
    time: "0:10",
    text: "Components are the building blocks of React applications.",
  },
  // ... more transcript entries
];

export default function TranscriptPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredTranscript = mockTranscript.filter((entry) =>
    entry.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col h-screen bg-background text-foreground transition-all duration-300 ease-in-out ${
        isExpanded ? "w-80" : "w-12"
      }`}
    >
      <header className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        {isExpanded && (
          <>
            <h1 className="text-lg font-semibold">Video Transcript</h1>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </>
        )}
      </header>

      {isExpanded && (
        <>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <ScrollArea className="flex-grow">
            <ul className="space-y-4 p-4">
              {filteredTranscript.map((entry, index) => (
                <li key={index} className="flex">
                  <span className="w-12 flex-shrink-0 text-muted-foreground">
                    {entry.time}
                  </span>
                  <p>{entry.text}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
