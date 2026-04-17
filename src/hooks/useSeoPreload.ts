import { useEffect } from "react";

export function useSeoPreload() {
  useEffect(() => {
    // 1. Inject baseline SEO keywords if they don't exist
    if (!document.querySelector('meta[name="keywords"]')) {
      const meta = document.createElement("meta");
      meta.name = "keywords";
      meta.content = "calicut rental homes, kozhikode rent flat, nadakkavu rent house, beach road calicut apartments, mavoor road rent room, student room near calicut university, bachelors room calicut";
      document.head.appendChild(meta);
    }

    // 2. Preload API calls for critical data
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4500/letsellr";
    const apiEndPoints = [
      `${apiBase}/property/featured`,
      `${apiBase}/location/calicut`,
      `${apiBase}/property/latest`
    ];
    apiEndPoints.forEach(url => fetch(url).catch(() => {}));

    // 3. Preload important routes and top search keywords
    const routes = [
      "/search", 
      "/", 
      "/search?query=calicut+rental+homes",
      "/search?query=kozhikode+rent+flat"
    ];
    
    routes.forEach((route) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = route;
      document.head.appendChild(link);
    });
  }, []);
}