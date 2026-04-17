import { useEffect } from "react";

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const DEFAULT_KEYWORDS = "calicut rental homes, kozhikode rent flat, nadakkavu rent house, beach road calicut apartments, mavoor road rent room, student room near calicut university, bachelors room calicut";
const DEFAULT_DESCRIPTION = "Verified rental properties in Calicut/Kozhikode. Find PGs, hostels, and apartments for rent.";
const SITE_NAME = "Letsellr";

export function useSeo({
  title,
  description,
  keywords,
  ogImage,
  canonical
}: SeoProps = {}) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`) : `${SITE_NAME} - Rental Homes, Flats & Rooms in Calicut/Kozhikode`;
    document.title = fullTitle;

    // 2. Update Meta Description
    const descriptionContent = description || DEFAULT_DESCRIPTION;
    updateMetaTag("name", "description", descriptionContent);

    // 3. Update Keywords
    const keywordContent = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;
    updateMetaTag("name", "keywords", keywordContent);

    // 4. Update OpenGraph Tags
    updateMetaTag("property", "og:title", fullTitle);
    updateMetaTag("property", "og:description", descriptionContent);
    updateMetaTag("property", "og:type", "website");
    
    if (ogImage) {
      updateMetaTag("property", "og:image", ogImage);
    }

    // Twitter Card Tags
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", fullTitle);
    updateMetaTag("name", "twitter:description", descriptionContent);
    if (ogImage) updateMetaTag("name", "twitter:image", ogImage);

    // 5. Canonical Link
    const currentUrl = window.location.origin + window.location.pathname;
    const finalCanonical = canonical || currentUrl;
    
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", finalCanonical);
  }, [title, description, keywords, ogImage, canonical]);
}

function updateMetaTag(attr: "name" | "property", value: string, content: string) {
  let element = document.querySelector(`meta[${attr}="${value}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, value);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}
