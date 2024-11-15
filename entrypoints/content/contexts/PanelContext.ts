import { createContext } from "react";

interface PanelContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const PanelContext = createContext<PanelContextType>({
  isOpen: true,
  setIsOpen: () => {},
});
