import { useEffect } from "react";

export function useSeoPreload() {
  useEffect(() => {
    // Preload API calls
    fetch("/letseller/property/featured");
    fetch("/letseller/location/calicut");
    fetch("/letseller/property/latest");

    // Preload important routes
    const routes = ["/search", "/property/6965ea93b0f0b21420fdb569","/","/property/696e296db0f0b21420fe1419"];
    routes.forEach((route) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = route;
      document.head.appendChild(link);
    });
  }, []);
}