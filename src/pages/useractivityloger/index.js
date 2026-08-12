import { useEffect } from "react";

export default function useActivityLogger() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackActivity = () => {
      // Placeholder activity logger.
      // Replace with real logging logic if needed.
      console.debug("Activity logger initialized");
    };

    trackActivity();
  }, []);
}
