import { useRef, useEffect } from "react";

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
  const dragStartPosRef = useRef<Omit<Position, "width">>({ x: 0, y: 0 });

  // Helper function to constrain position within viewport
  const constrainPosition = (x: number, y: number) => {
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 40;

    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    };
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleDragStart = (e: MouseEvent) => {
      const header = element.querySelector(dragHandleSelector);
      const path = e.composedPath();
      const isHeaderInPath = path.some((element) => element === header);

      if (!isHeaderInPath) return;

      e.preventDefault();
      isDraggingRef.current = true;
      dragStartPosRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };

      document.body.style.cursor = "grabbing";
    };

    const handleDrag = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const newX = e.clientX - dragStartPosRef.current.x;
      const newY = e.clientY - dragStartPosRef.current.y;

      const { x: constrainedX, y: constrainedY } = constrainPosition(
        newX,
        newY
      );

      setPosition({
        x: constrainedX,
        y: constrainedY,
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
