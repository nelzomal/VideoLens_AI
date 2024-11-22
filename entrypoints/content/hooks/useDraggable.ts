import { useRef, useEffect } from "react";

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseDraggableProps {
  position: Position;
  setPosition: (position: Position) => void;
  elementRef: React.RefObject<HTMLElement>;
  dragHandleSelector: string;
}

export const useDraggable = ({
  position,
  setPosition,
  elementRef,
  dragHandleSelector,
}: UseDraggableProps) => {
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef<Position>({ x: 0, y: 0, width: 0, height: 0 });
  const previousWindowWidth = useRef(window.innerWidth);

  // Helper function to constrain position within viewport
  const constrainPosition = (x: number, y: number) => {
    const viewportWidth = window.innerWidth;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Ensure panel stays within viewport bounds
    const maxX = viewportWidth - position.width - scrollbarWidth;
    const maxY = window.innerHeight - position.height;

    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
      width: position.width,
      height: position.height,
    };
  };

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Calculate distance from right edge
      const distanceFromRight =
        previousWindowWidth.current - (position.x + position.width);

      let newX;
      if (distanceFromRight <= 20) {
        // If panel was near right edge, keep it there
        newX = viewportWidth - position.width - scrollbarWidth;
      } else {
        // Otherwise maintain relative position from left
        newX = position.x;
      }

      const { x, y, width, height } = constrainPosition(newX, position.y);
      if (x !== position.x || y !== position.y) {
        setPosition({ x, y, width, height });
      }

      previousWindowWidth.current = viewportWidth;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleDragStart = (e: MouseEvent) => {
      const header = element.querySelector(dragHandleSelector);
      const path = e.composedPath();
      const isHeaderInPath = path.some((element) => element === header);

      const isResizeHandle = (e.target as HTMLElement)?.classList.contains(
        "resize-handle"
      );
      if (!isHeaderInPath || isResizeHandle) return;

      e.preventDefault();
      isDraggingRef.current = true;
      dragStartPosRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
        width: position.width,
        height: position.height,
      };

      document.body.style.cursor = "grabbing";
    };

    const handleDrag = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const newX = e.clientX - dragStartPosRef.current.x;
      const newY = e.clientY - dragStartPosRef.current.y;

      const {
        x: constrainedX,
        y: constrainedY,
        width,
        height,
      } = constrainPosition(newX, newY);

      setPosition({
        x: constrainedX,
        y: constrainedY,
        width,
        height,
      });
    };

    const handleDragEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = "";
    };

    element.addEventListener("mousedown", handleDragStart);
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);

    return () => {
      element.removeEventListener("mousedown", handleDragStart);
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [position, dragHandleSelector]);
};
