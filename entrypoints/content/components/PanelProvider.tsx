import { useState, useEffect, ReactNode, RefObject, FC, useRef } from "react";
import { PanelContext } from "../contexts/PanelContext";
import { useDraggable } from "../hooks/useDraggable";
import "../styles/panel.css";

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PanelProviderProps {
  children: ReactNode;
  containerRef: RefObject<HTMLElement>;
  appRef: RefObject<HTMLDivElement>;
}

const getScrollbarWidth = () => {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
};

const PANEL_POSITION_KEY = "panel-position";

const savePosition = async (position: Position) => {
  try {
    const tab = await browser.tabs.getCurrent();
    const tabId = tab?.id || "default";
    localStorage.setItem(
      `${PANEL_POSITION_KEY}-${tabId}`,
      JSON.stringify(position)
    );
  } catch (e) {
    console.error("Failed to save panel position:", e);
  }
};

const loadPosition = async (): Promise<Position | null> => {
  try {
    const tab = await browser.tabs.getCurrent();
    const tabId = tab?.id || "default";
    const saved = localStorage.getItem(`${PANEL_POSITION_KEY}-${tabId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Failed to load panel position:", e);
    return null;
  }
};

export const PanelProvider: FC<PanelProviderProps> = ({
  children,
  containerRef,
  appRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>(() => ({
    x: window.innerWidth - 320 - getScrollbarWidth(),
    y: 0,
    width: 320,
    height: window.innerHeight * 0.8,
  }));

  const isResizing = useRef(false);
  const resizeEdgeRef = useRef<
    "left" | "right" | "top" | "bottom" | "corner" | null
  >(null);

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
      right: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 100000;
      pointer-events: none;
    `;

    if (!isResizing.current) {
      updateAppStyles(position.x, position.y);
    }
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

  const constrainPosition = (y: number, height: number) => {
    const maxY = window.innerHeight - height;
    return Math.min(Math.max(0, y), maxY);
  };

  const updateAppStyles = (x: number, y: number) => {
    if (!appRef.current) return;

    const right =
      window.innerWidth - getScrollbarWidth() - (x + position.width);
    appRef.current.style.cssText = `
      position: fixed;
      right: ${right}px;
      top: ${y}px;
      height: ${position.height}px;
      width: ${position.width}px;
      z-index: 100000;
      pointer-events: auto;
    `;
  };

  useEffect(() => {
    updateAppStyles(position.x, position.y);
  }, [position]);

  useEffect(() => {
    loadPosition().then((savedPosition) => {
      if (savedPosition) {
        setPosition(savedPosition);
      }
    });
  }, []);

  useEffect(() => {
    savePosition(position);
  }, [position]);

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing.current || !resizeEdgeRef.current) return;

      switch (resizeEdgeRef.current) {
        case "left": {
          const rightEdge = position.x + position.width;
          const newWidth = Math.max(280, rightEdge - e.clientX);
          setPosition((prev) => ({
            ...prev,
            x: rightEdge - newWidth,
            width: newWidth,
          }));
          break;
        }
        case "right": {
          const newWidth = Math.max(280, e.clientX - position.x);
          setPosition((prev) => ({
            ...prev,
            width: newWidth,
          }));
          break;
        }
        case "top": {
          const bottomEdge = position.y + position.height;
          const newY = Math.max(0, e.clientY);
          const newHeight = Math.max(200, bottomEdge - newY);

          if (newY >= 0 && newHeight >= 200) {
            setPosition((prev) => ({
              ...prev,
              y: newY,
              height: newHeight,
            }));
          }
          break;
        }
        case "bottom": {
          const newHeight = Math.max(200, e.clientY - position.y);
          setPosition((prev) => ({
            ...prev,
            height: Math.min(newHeight, window.innerHeight - position.y),
          }));
          break;
        }
        case "corner": {
          const newWidth = Math.max(280, e.clientX - position.x);
          const newHeight = Math.max(200, e.clientY - position.y);

          setPosition((prev) => ({
            ...prev,
            width: Math.min(newWidth, window.innerWidth - position.x),
            height: Math.min(newHeight, window.innerHeight - position.y),
          }));
          break;
        }
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      resizeEdgeRef.current = null;
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position]);

  if (!isOpen) {
    return null;
  }

  return (
    <PanelContext.Provider value={{ isOpen, setIsOpen }}>
      <div
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          width: position.width,
          height: position.height,
          pointerEvents: "auto",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
        <div
          className="resize-handle left"
          onMouseDown={(e) => {
            e.stopPropagation();
            isResizing.current = true;
            resizeEdgeRef.current = "left";
          }}
        />
        <div
          className="resize-handle right"
          onMouseDown={(e) => {
            e.stopPropagation();
            isResizing.current = true;
            resizeEdgeRef.current = "right";
          }}
        />
        <div
          className="resize-handle top"
          onMouseDown={(e) => {
            e.stopPropagation();
            isResizing.current = true;
            resizeEdgeRef.current = "top";
          }}
        />
        <div
          className="resize-handle bottom"
          onMouseDown={(e) => {
            e.stopPropagation();
            isResizing.current = true;
            resizeEdgeRef.current = "bottom";
          }}
        />
        <div
          className="resize-handle corner"
          onMouseDown={(e) => {
            e.stopPropagation();
            isResizing.current = true;
            resizeEdgeRef.current = "corner";
          }}
        >
          <div className="resize-icon" />
        </div>
      </div>
    </PanelContext.Provider>
  );
};
