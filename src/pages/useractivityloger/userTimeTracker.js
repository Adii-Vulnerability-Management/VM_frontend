import { useEffect } from "react";

export default function useTimeTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const startTime = Date.now();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const elapsed = Date.now() - startTime;
        console.debug(`User was active for ${elapsed}ms before hiding the page.`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
