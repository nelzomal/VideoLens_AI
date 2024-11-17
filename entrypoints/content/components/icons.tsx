import {
  RefreshCw,
  Target,
  Copy,
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  refresh: RefreshCw,
  target: Target,
  copy: Copy,
  chevronDown: ChevronDown,
  x: X,
} as const;

export type IconKeys = keyof typeof Icons;
