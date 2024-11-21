import { ScrollArea } from "@/components/ui/scroll-area";
import { ReactNode } from "react";

interface ScrollContentProps {
  children: ReactNode;
  className?: string;
}

export const ScrollContent = ({
  children,
  className = "",
}: ScrollContentProps) => (
  <ScrollArea className={`flex-grow mb-4 ${className}`}>{children}</ScrollArea>
);
