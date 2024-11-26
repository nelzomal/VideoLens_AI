import { useEffect, useRef } from "react";

export function useScrollToBottom(deps: any[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(false);

  useEffect(() => {
    const checkIfNearBottom = () => {
      const container = scrollRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPosition = scrollTop + clientHeight;
      const threshold = 100; // pixels from bottom
      isNearBottomRef.current = scrollHeight - scrollPosition < threshold;
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkIfNearBottom);
      checkIfNearBottom();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkIfNearBottom);
      }
    };
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, deps);

  return scrollRef;
}
