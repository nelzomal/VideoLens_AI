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

const savePosition = (position: Position) => {
  try {
    const urlKey = window.location.href;
    const key = `${PANEL_POSITION_KEY}-${btoa(urlKey)}`;
    localStorage.setItem(key, JSON.stringify(position));
  } catch (e) {
    console.error("Failed to save panel position:", e);
  }
};

const loadPosition = (): Position | null => {
  try {
    const urlKey = window.location.href;
    const key = `${PANEL_POSITION_KEY}-${btoa(urlKey)}`;
    const saved = localStorage.getItem(key);
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
  const [position, setPosition] = useState<Position>(() => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const preferredHeight = viewportHeight * 0.8;
    const height = Math.min(preferredHeight, viewportHeight);
    return {
      x: window.innerWidth - 320 - getScrollbarWidth(),
      y: 0,
      width: 320,
      height,
    };
  });

  const isResizing = useRef(false);
  const resizeEdgeRef = useRef<
    "left" | "right" | "top" | "bottom" | "corner" | null
  >(null);

  const [userSetHeight, setUserSetHeight] = useState<number | null>(null);

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
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    if (height <= viewportHeight) {
      return 0;
    }
    return Math.min(0, viewportHeight - height);
  };

  const updateAppStyles = (x: number, y: number) => {
    if (!appRef.current) return;

    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const viewportRight = Math.min(
      window.innerWidth - getScrollbarWidth() - (x + position.width),
      window.innerWidth - getScrollbarWidth()
    );

    const adjustedHeight = Math.min(position.height, viewportHeight);

    appRef.current.style.cssText = `
      position: fixed;
      right: ${viewportRight}px;
      top: 0px;
      height: ${adjustedHeight}px;
      width: ${position.width}px;
      z-index: 100000;
      pointer-events: auto;
      overflow-y: auto;
    `;
  };

  useEffect(() => {
    updateAppStyles(position.x, position.y);
  }, [position]);

  useEffect(() => {
    const savedPosition = loadPosition();
    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

  useEffect(() => {
    savePosition(position);
  }, [position]);

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing.current || !resizeEdgeRef.current) return;

      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;

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
          const newY = constrainPosition(e.clientY, bottomEdge - e.clientY);
          const newHeight = Math.max(200, bottomEdge - newY);

          if (newHeight >= 200) {
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
          setUserSetHeight(newHeight);
          setPosition((prev) => ({
            ...prev,
            y:
              newHeight <= viewportHeight
                ? 0
                : Math.min(0, viewportHeight - newHeight),
            height: newHeight,
          }));
          break;
        }
        case "corner": {
          const newWidth = Math.max(280, e.clientX - position.x);
          const newHeight = Math.max(200, e.clientY - position.y);
          setUserSetHeight(newHeight);
          setPosition((prev) => ({
            ...prev,
            width: Math.min(newWidth, window.innerWidth - position.x),
            y:
              newHeight <= viewportHeight
                ? 0
                : Math.min(0, viewportHeight - newHeight),
            height: newHeight,
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

  useEffect(() => {
    const handleWindowResize = () => {
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;
      const viewportWidth = window.innerWidth;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      setPosition((prev) => {
        const targetHeight = userSetHeight || viewportHeight * 0.8;

        const maxX = viewportWidth - prev.width - scrollbarWidth;
        const newX = Math.min(Math.max(0, prev.x), maxX);

        return {
          ...prev,
          x: newX,
          y: 0,
          height: userSetHeight
            ? Math.min(userSetHeight, viewportHeight)
            : Math.min(targetHeight, viewportHeight),
        };
      });
    };

    window.visualViewport?.addEventListener("resize", handleWindowResize);
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [userSetHeight]);

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
