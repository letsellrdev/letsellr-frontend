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
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Rental Homes, Flats & Rooms in Calicut/Kozhikode`;
    document.title = fullTitle;

    // 2. Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = description || DEFAULT_DESCRIPTION;
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionContent);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = descriptionContent;
      document.head.appendChild(meta);
    }

    // 3. Update Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const keywordContent = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywordContent);
    } else {
      const meta = document.createElement("meta");
      meta.name = "keywords";
      meta.content = keywordContent;
      document.head.appendChild(meta);
    }

    // 4. Update OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", descriptionContent);

    if (ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", ogImage);
    }

    // 5. Canonical Link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }
  }, [title, description, keywords, ogImage, canonical]);
}
