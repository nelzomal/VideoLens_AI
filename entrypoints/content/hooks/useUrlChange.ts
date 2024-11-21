import { useEffect, useRef } from "react";

export function useUrlChange(callback: () => void) {
  const lastUrl = useRef(window.location.href);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl.current) {
        lastUrl.current = window.location.href;
        callback();
      }
    });

    observer.observe(document, { subtree: true, childList: true });

    return () => observer.disconnect();
  }, [callback]);
}
