import { useSideNavStore } from "@/store/store";
import { useEffect, useState } from "react";

export const useSidebarMediaQuery = (minWidth: string) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { sidebarOpen, setSidebarOpen } = useSideNavStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia(minWidth);
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsSmallScreen(!e.matches);
      if (e.matches) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    setIsSmallScreen(!mediaQuery.matches);
    setSidebarOpen(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, [minWidth, setSidebarOpen]);

  return { isSmallScreen, sidebarOpen, setSidebarOpen };
};
