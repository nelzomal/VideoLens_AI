import {
  RefreshCw,
  Target,
  Copy,
  ChevronDown,
  X,
  MessageCircleQuestion,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  refresh: RefreshCw,
  target: Target,
  copy: Copy,
  chevronDown: ChevronDown,
  x: X,
  qa: MessageCircleQuestion,
} as const;

export type IconKeys = keyof typeof Icons;
