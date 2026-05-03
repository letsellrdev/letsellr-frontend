import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImageSrc = (imgObj: any) => {
  if (!imgObj) return "/placeholder.jpg";
  let url = typeof imgObj === 'string' ? imgObj : imgObj.url || imgObj.image || imgObj.fileUrl;
  if (!url) return "/placeholder.jpg";
  
  if (url.includes('amazonaws.com')) {
    try {
      const parsed = new URL(url);
      return `https://ik.imagekit.io/assets01${parsed.pathname}`;
    } catch (e) {
      return url;
    }
  }
  return url;
};
