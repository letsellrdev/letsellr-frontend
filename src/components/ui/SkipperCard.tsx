import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  propertyCount?: number;
  value?: string;
}

interface SkipperCardProps {
  categories: Category[];
  propertyType?: string;
  locationId?: string;
}

/* ─── helpers ─── */
function buildSearchUrl(
  category: Category,
  propertyType?: string,
  locationId?: string
): string {
  const categoryValue = category.value || category.name?.toLowerCase();
  const params = new URLSearchParams();
  params.append("category", categoryValue);
  if (propertyType) params.append("property_type", propertyType);
  if (locationId) params.append("locationId", locationId);
  return `/search/?${params.toString()}`;
}

/* ─── Individual Card ─── */
const CategoryCard = ({
  category,
  propertyType,
  locationId,
  className = "",
}: {
  category: Category;
  propertyType?: string;
  locationId?: string;
  className?: string;
}) => {
  const count = category.propertyCount || 0;

  return (
    <Link
      to={buildSearchUrl(category, propertyType, locationId)}
      className={`relative block overflow-hidden rounded-2xl md:rounded-3xl group ${className}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full bg-muted/30">
        <img
          src={category.image || "/images/category-card-hotel.png"}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Badge */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
        <div className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              count > 0 ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider">
            {count > 0 ? `${count}+ Available` : "Coming Soon"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-white text-base md:text-lg lg:text-xl font-bold tracking-tight leading-tight">
            {category.name}
          </h3>
          <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 text-black flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300">
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─── Main Component ─── */
const SkipperCard = ({
  categories,
  propertyType,
  locationId,
}: SkipperCardProps) => {
  const mobileWrapperRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => {
      const track = mobileTrackRef.current;
      const wrapper = mobileWrapperRef.current;
      if (!track || !wrapper) return;

      // Calculate how far the track needs to slide
      const scrollAmount = track.scrollWidth - wrapper.offsetWidth;

      // Animate cards in on load
      const cards = track.querySelectorAll(".gsap-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        }
      );

      // Horizontal scroll on vertical scroll
      const tween = gsap.to(track, {
        x: -scrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 15%",
          end: `+=${scrollAmount * 1.2}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });

    return () => mm.revert();
  }, [categories]);

  if (!categories || categories.length === 0) return null;

  const cards = categories.slice(0, 5);

  return (
    <div className="w-full">
      {/* ═══════════════════════════════════════════
          📱 Mobile: GSAP Horizontal Scroll
         ═══════════════════════════════════════════ */}
      <div ref={mobileWrapperRef} className="md:hidden overflow-hidden">
        <div
          ref={mobileTrackRef}
          className="flex gap-4 pl-1 pr-8"
          style={{ width: "max-content" }}
        >
          {cards.map((category) => (
            <div key={category._id} className="gsap-card flex-shrink-0 w-[72vw] max-w-[300px]">
              <CategoryCard
                category={category}
                propertyType={propertyType}
                locationId={locationId}
                className="h-[260px] shadow-xl"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          🖥️ Desktop: Bento Grid — All cards in one view
          Layout: [ Hero (2 rows) ] [ sm ] [ sm ]
                                    [ sm ] [ sm ]
         ═══════════════════════════════════════════ */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr] gap-3 lg:gap-4 bento-section">
        {/* Hero card — tall, left column, spans 2 rows */}
        {cards[0] && (
          <CategoryCard
            category={cards[0]}
            propertyType={propertyType}
            locationId={locationId}
            className="row-span-2 h-full min-h-[420px] lg:min-h-[480px]"
          />
        )}

        {/* Top-right pair */}
        {cards[1] && (
          <CategoryCard
            category={cards[1]}
            propertyType={propertyType}
            locationId={locationId}
            className="h-[200px] lg:h-[230px]"
          />
        )}
        {cards[2] && (
          <CategoryCard
            category={cards[2]}
            propertyType={propertyType}
            locationId={locationId}
            className="h-[200px] lg:h-[230px]"
          />
        )}

        {/* Bottom-right pair */}
        {cards[3] && (
          <CategoryCard
            category={cards[3]}
            propertyType={propertyType}
            locationId={locationId}
            className="h-[200px] lg:h-[230px]"
          />
        )}
        {cards[4] && (
          <CategoryCard
            category={cards[4]}
            propertyType={propertyType}
            locationId={locationId}
            className="h-[200px] lg:h-[230px]"
          />
        )}
      </div>
    </div>
  );
};

export { SkipperCard };