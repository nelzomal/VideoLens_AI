import { useState, useEffect, ReactNode, RefObject, FC } from "react";
import { PanelContext } from "../contexts/PanelContext";
import { useDraggable } from "../hooks/useDraggable";

interface PanelProviderProps {
  children: ReactNode;
  containerRef: RefObject<HTMLElement>;
  appRef: RefObject<HTMLDivElement>;
}

export const PanelProvider: FC<PanelProviderProps> = ({
  children,
  containerRef,
  appRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>(() => ({
    x: window.innerWidth - 320,
    y: 0,
  }));

  useDraggable({
    position,
    setPosition,
    elementRef: appRef,
    dragHandleSelector: ".cursor-move",
  });

  useEffect(() => {
    if (!isOpen) {
      containerRef.current!.style.display = "none";
      return;
    }

    containerRef.current!.style.display = "block";
    updateAppStyles(position.x, position.y);
  }, [isOpen]);

  useEffect(() => {
    const messageListener = (message: { action: string }) => {
      if (message.action === "TOGGLE_PANEL") {
        setIsOpen((prev) => !prev);
      }
    };

    browser.runtime.onMessage.addListener(messageListener);
    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPosition({ x: window.innerWidth - 320, y: 0 });
    }
  }, [isOpen]);

  const updateAppStyles = (x: number, y: number) => {
    if (!containerRef.current) return;

    const currentStyles = containerRef.current.style.cssText
      .split(";")
      .filter((style) => !style.includes("left") && !style.includes("top"))
      .join(";");

    containerRef.current.style.cssText = `
      ${currentStyles};
      left: ${x}px;
      top: ${y}px;
    `;
  };

  useEffect(() => {
    updateAppStyles(position.x, position.y);
  }, [position]);

  if (!isOpen) {
    return null;
  }

  return (
    <PanelContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </PanelContext.Provider>
  );
};
