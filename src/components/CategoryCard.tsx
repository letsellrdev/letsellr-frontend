import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

interface CategoryCardProps {
  title: string;
  description: string;
  image?: string;
  count: string;
  action?: string;
  value?: string;
  name?: string;
  onClick?: () => void;
  propertyType?: string;
  location?: string;
  locationId?: string;
  /** Optional icon character/emoji to display */
  icon?: string;
  /** Controls visual weight in bento grid */
  size?: "hero" | "default";
}

/* ─── helpers ─── */
function buildSearchUrl(
  value: string | undefined,
  name: string | undefined,
  title: string,
  propertyType: string | undefined,
  locationId: string | undefined,
  location: string | undefined
): string {
  const categoryValue = value || name?.toLowerCase() || title.toLowerCase();
  const params = new URLSearchParams();
  params.append("category", categoryValue);
  if (propertyType) params.append("property_type", propertyType);
  if (locationId) params.append("locationId", locationId);
  else if (location) params.append("location", location);
  return `/search/?${params.toString()}`;
}

/* ─── shared inner card ─── */
function CardContent({
  title,
  description,
  image,
  count,
  size = "default",
}: Pick<CategoryCardProps, "title" | "description" | "image" | "count" | "size">) {
  const isHero = size === "hero";
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`category-bento-card group ${isHero ? "category-bento-hero" : "category-bento-default"}`}>
      {/* Background image with gradient overlay & shimmer loading state */}
      <div 
        className={`category-bento-bg transition-colors duration-500 ${!isLoaded ? "shimmer bg-muted/30" : ""}`} 
        style={{ transform: "translateZ(0)" }}
      >
        <motion.img
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onLoad={() => setIsLoaded(true)}
          src={image || (isHero ? "/images/category-card-big.png" : "/images/category-card-hotel.png")}
          alt={title}
          loading="lazy"
          decoding="async"
          className="category-bento-img group-hover:scale-110 !transition-transform duration-700 ease-out will-change-transform"
        />
        <div className="category-bento-overlay" />
      </div>

      {/* Glass pill — availability badge (top‑right) */}
      <div className="category-bento-badge">
        {count === "0" || count === "0+" ? (
          <span className="text-[11px] font-medium tracking-wide text-dark/70">Coming Soon</span>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide text-dark/90">
              {count} available
            </span>
          </>
        )}
      </div>

      {/* Bottom glass content bar */}
      <div className="category-bento-footer">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-foreground leading-tight truncate ${isHero ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>
            {title}
          </h3>
          <p className={`text-muted-foreground leading-snug mt-1 line-clamp-2 ${isHero ? "text-sm" : "text-xs"}`}>
            {description}
          </p>
        </div>

        {/* Arrow icon */}
        <div className="category-bento-arrow">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* ─── CategoryCardBig (hero slot) ─── */
export const CategoryCardBig = ({
  title, description, image, count, action,
  value, name, onClick, propertyType, location, locationId,
}: CategoryCardProps) => {
  const searchUrl = buildSearchUrl(value, name, title, propertyType, locationId, location);

  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full h-full cursor-pointer"
        onClick={onClick}
      >
        <CardContent title={title} description={description} image={image} count={count} size="hero" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full h-full"
    >
      <Link to={action || searchUrl} className="block h-full">
        <CardContent title={title} description={description} image={image} count={count} size="hero" />
      </Link>
    </motion.div>
  );
};

/* ─── CategoryCard (regular bento slot) ─── */
export const CategoryCard = ({
  title, description, image, count, action,
  value, name, onClick, propertyType, location, locationId,
}: CategoryCardProps) => {
  const searchUrl = buildSearchUrl(value, name, title, propertyType, locationId, location);

  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full h-full cursor-pointer"
        onClick={onClick}
      >
        <CardContent title={title} description={description} image={image} count={count} size="default" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full h-full"
    >
      <Link to={action || searchUrl} className="block h-full">
        <CardContent title={title} description={description} image={image} count={count} size="default" />
      </Link>
    </motion.div>
  );
};
