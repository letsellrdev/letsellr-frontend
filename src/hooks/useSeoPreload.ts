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

    // 2. Preload API calls and routes with a delay to prioritize initial landing page render
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4500/letsellr";
    const apiEndPoints = [
      `${apiBase}/property/featured`,
      `${apiBase}/location/important`,
      `${apiBase}/property/latest`
    ];

    const routes = ["/search", "/"];

    // Use requestIdleCallback to run preloading when the browser is idle
    const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 2000));

    idleCallback(() => {
      // Preload APIs
      apiEndPoints.forEach(url => {
        fetch(url, { priority: 'low' } as any).catch(() => {});
      });

      // Preload Routes
      routes.forEach((route) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = route;
        document.head.appendChild(link);
      });
    });
  }, []);
}