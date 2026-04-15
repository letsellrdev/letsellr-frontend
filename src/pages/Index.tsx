import { SearchBar } from "@/components/SearchBar";
import { SkipperCard } from "@/components/ui/SkipperCard";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import instance from "@/lib/axios";
import { motion } from "framer-motion";
import { ReactLenis } from 'lenis/react';
import { useNavigate } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { ChevronDown, Clock8, Landmark } from "lucide-react";
import { SeoKeywordsSection } from "@/components/SeoKeywordsSection";

const Index = () => {
  const [propertyType, setPropertyType] = useState("rent");
  const [locationId, setLocationId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  useSeo({
    title: "Rental Homes, Flats & Rooms in Calicut/Kozhikode",
    description: "Best rental homes in Calicut (Kozhikode). Find flats, houses, rooms, and apartments for rent. Verified listings for students, families, and bachelors.",
  });
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [typeAvailability, setTypeAvailability] = useState<Record<string, boolean>>({
    rent: true,
    buy: false,
    lease: false,
  });
  const navigate = useNavigate();

  // Structured Data (JSON-LD) for Local Business
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Letsellr Calicut",
    "description": "Premium rental listings for PGs, hostels, and apartments in Calicut (Kozhikode). Verified properties for students and professionals.",
    "url": "https://letsellr.in",
    "logo": "https://letsellr.in/favicon.ico",
    "areaServed": "Calicut, Kozhikode, Kerala",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Calicut",
      "addressRegion": "Kerala",
      "addressCountry": "IN"
    }
  };

  const fetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const res = await instance.get("/category");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchTypeAvailability = async () => {
    try {
      const res = await instance.get("/property/counts-by-type");
      if (res.data.success) {
        const counts = res.data.data;
        setTypeAvailability({
          rent: counts.rent > 0,
          buy: counts.buy > 0,
          lease: counts.lease > 0,
        });
      }
    } catch (error) {
      console.error("Error fetching type availability:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCategories();
    fetchTypeAvailability();
  }, []);

  const scrollToSecondary = () => {
    const section = document.getElementById("categories-section");
    if (section) {
      const navbarHeight = 80; // Approximate height of sticky navbar
      const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      <div className="min-h-screen bg-background/80 selection:bg-primary/20">
        <Navbar />
        <main className="relative overflow-hidden">

          {/* 🚀 Hero Section — Full Screen Background */}
          <section className="hero-section relative flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/55" />
            {/* Primary color tint at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-5 text-center flex flex-col items-center gap-8 py-24 md:py-32">

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-8"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-white/70 tracking-wide uppercase mt-0.5">Properties Listed</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">12k+</p>
                  <p className="text-xs text-white/70 tracking-wide uppercase mt-0.5">Happy Residents</p>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                  Choose your next
                  <span className="italic text-primary-light"> home</span>
                </h1>
                <p className="text-base sm:text-lg text-white/75 max-w-lg mx-auto leading-relaxed">
                  Verified PGs, hostels &amp; apartments in Calicut — trusted by students and professionals.
                </p>
              </motion.div>

              {/* ── Glassmorphic Search Trigger (heroMode) ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="w-full max-w-2xl"
              >
                {/* Property type tabs */}
                <div className="flex justify-center gap-2 mb-3">
                  {["rent", "buy", "lease"].map((type) => {
                    const isAvailable = typeAvailability[type] || type === "rent";
                    return (
                      <button
                        key={type}
                        onClick={() => isAvailable && setPropertyType(type)}
                        className={`group relative px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200 flex items-center gap-1.5 ${propertyType === type
                            ? "bg-primary text-white shadow-lg shadow-primary/40"
                            : isAvailable
                              ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                              : "bg-white/10 text-white/40 cursor-not-allowed backdrop-blur-[2px]"
                          }`}
                      >
                        {type}
                        {!isAvailable && (
                          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-bold uppercase tracking-tighter">
                            <Clock8 className="w-3 h-3" />
                            Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Glass Search Trigger — opens full CommandDialog */}
                <SearchBar
                  heroMode
                  propertyType={propertyType}
                  onPropertyTypeChange={setPropertyType}
                  location={locationId}
                  onLocationChange={setLocationId}
                />

                <p className="text-white/75 text-sm pt-2 text-center mt-3">
                  <Landmark className="inline mb-1 w-4 h-4" /> explore latest listings with real-time updates and detailed property insights
                </p>
              </motion.div>

              {/* Scroll Down Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                onClick={scrollToSecondary}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer group"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                <div className="w-9 h-9 flex items-center justify-center rounded-full   5 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </div>
              </motion.button>
            </div>
          </section>

          {/* 📂 Categories Bento Section */}
          <section id="categories-section" className="pt-0 pb-12 px-6 relative overflow-hidden">
            {/* Subtle ambient background */}
            <div className="absolute inset-0 bg-gradient-soft pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative space-y-10">
              {/* ── Section Header ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
              >
                <div className="space-y-3 py-4">
                  {/* Label pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-medium tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Explore Properties
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                    Find by <span className="text-primary italic">Category</span>
                  </h2>
                  <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                    Handpicked selections of premium accommodations designed to fit every lifestyle.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="self-start md:self-auto px-5 py-2.5 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={() => navigate("/search")}

                >
                  View all →
                </motion.button>
              </motion.div>

              {/* ── Sticky Scroll Cards ── */}
              <SkipperCard
                categories={categories}
                propertyType={propertyType}
                locationId={locationId}
                isLoading={isCategoriesLoading}
              />
            </div>
          </section>
        </main>

        <SeoKeywordsSection />
        <TestimonialsSection />
        <FaqSection />
        <Footer categories={categories} />
      </div>
    </ReactLenis>
  );
};

export default Index;
