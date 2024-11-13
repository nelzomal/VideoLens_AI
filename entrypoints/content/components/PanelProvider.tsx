import React, { useState, useRef, useEffect } from "react";
import { PanelContext } from "../contexts/PanelContext";
import { useDraggable } from "../hooks/useDraggable";

interface PanelProviderProps {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLElement>;
  appRef: React.RefObject<HTMLDivElement>;
}

export const PanelProvider: React.FC<PanelProviderProps> = ({
  children,
  containerRef,
  appRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>(() => ({
    x: window.innerWidth - 320,
    y: 0,
    width: 320,
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
    containerRef.current!.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 100000;
    `;

    updateAppStyles(position.x, position.y);
  }, [isOpen]);

  useEffect(() => {
    const messageListener = (message: { action: string }) => {
      console.log("messageListener", message);
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
      setPosition({
        x: window.innerWidth - 320,
        y: 0,
        width: 320,
      });
    }
  }, [isOpen]);

  const updateAppStyles = (x: number, y: number) => {
    if (!appRef.current) return;

    const currentStyles = appRef.current.style.cssText
      .split(";")
      .filter((style) => !style.includes("left") && !style.includes("top"))
      .join(";");

    appRef.current.style.cssText = `
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
