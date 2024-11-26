import { Button } from "@/components/ui/button";
import { Icons } from "./icons";
import { PanelContext } from "../contexts/PanelContext";
import { MessageCircleQuestion } from "lucide-react";

interface HeaderProps {
  activeTab: "transcript" | "summarize" | "qa";
  setActiveTab: (tab: "transcript" | "summarize" | "qa") => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const { setIsOpen } = useContext(PanelContext);

  return (
    <div
      ref={dragHandleRef}
      className="flex flex-col border-b bg-white cursor-move select-none shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-gray-800">
          <div className="h-6 w-6 rounded bg-blue-500"></div>
          <h1 className="text-lg font-medium">Transcript & Summary</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:bg-gray-100 rounded-full"
          onClick={() => setIsOpen(false)}
        >
          <Icons.x className="h-5 w-5" />
        </Button>
      </div>

      {/* MUI-style tabs */}
      <div className="flex px-4">
        <button
          onClick={() => setActiveTab("transcript")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative
            ${
              activeTab === "transcript"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Icons.refresh className="h-4 w-4" />
            <span>Transcript</span>
          </div>
          {activeTab === "transcript" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("summarize")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative
            ${
              activeTab === "summarize"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Icons.target className="h-4 w-4" />
            <span>Summarize</span>
          </div>
          {activeTab === "summarize" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("qa")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative
            ${
              activeTab === "qa"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <MessageCircleQuestion className="h-4 w-4" />
            <span>Q&A</span>
          </div>
          {activeTab === "qa" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>
    </div>
  );
}
