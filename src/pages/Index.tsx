import { SearchBar } from "@/components/SearchBar";
import { CategoryCard, CategoryCardBig } from "@/components/CategoryCard";
import { StatsSection } from "@/components/StatsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import instance from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import heroVideo from "@/assets/hero.webm";

// Note: In a real app, I'd fetch a specific JSON or use a local one.

const Index = () => {
  const [propertyType, setPropertyType] = useState("rent");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLocations();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await instance.get("/category");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await instance.get("/location/important");
      setLocations(res.data.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    }
  };

  return (
    <div className="min-h-screen bg-background/80 selection:bg-primary/20">
      <Navbar />
      <main className="relative overflow-hidden">
        {/* ✨ Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-background/50">
          <motion.div
            className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[80px] will-change-transform"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.4, 0.3],
              x: [0, 15, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ transform: "translateZ(0)" }}
          />
          <motion.div
            className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[64px] will-change-transform"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.35, 0.2],
              y: [0, 25, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 1 }}
            style={{ transform: "translateZ(0)" }}
          />
        </div>

        {/* 🚀 Hero Section */}
        <section className="relative pb-24 md:pt-16 md:pb-32 px-6 md:px-12 lg:px-16">
          <div className="max-w-[1440px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-7 min-w-0"
            >

              <div className="space-y-4 pt-10 sm:pt-16 md:pt-0">
                <h1 className="text-5xl md:text-7xl lg:text-[3.5rem] xl:text-[4rem] 2xl:text-[4.5rem] lg:whitespace-nowrap font-bold tracking-tight text-foreground leading-[1.1]">
                  Choose your next <span className="text-primary italic">home</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Discover quality PGs, apartments, and hostels tailored for students and professionals. Your next chapter starts here.
                </p>
              </div>

              {/* Advanced Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative z-20"
              >
                <div className="w-full">
                  <SearchBar
                    propertyType={propertyType}
                    onPropertyTypeChange={setPropertyType}
                    location={locationId}
                    onLocationChange={setLocationId}
                  />
                </div>
              </motion.div>

              {/* Stats / Trust */}
              <div className="flex flex-wrap gap-8 items-center pl-12 pt-4">
                <div className="space-y-1">
                  <h4 className="text-2xl font-bold">500+</h4>
                  <p className="text-sm text-muted-foreground">Properties Listed</p>
                </div>
                <div className="w-[1px] h-10 bg-border hidden sm:block" />
                <div className="space-y-1">
                  <h4 className="text-2xl font-bold">12k+</h4>
                  <p className="text-sm text-muted-foreground">Happy Residents</p>
                </div>
              </div>
            </motion.div>

            {/* Right Illustration (Minimal Animated Video) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 max-h-[500px] overflow-hidden flex items-center justify-center rounded-[1rem]">
                <video
                  src={heroVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Backglow - matching primary color */}
              <div className="absolute inset-0 bg-primary/20 blur-[80px] -z-10 rounded-full scale-95 shadow-[0_0_100px_rgba(var(--primary),0.2)]" />
            </motion.div>

          </div>
        </section>

        {/* 📂 Categories Bento Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          {/* Subtle ambient background */}
          <div className="absolute inset-0 bg-gradient-soft pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative space-y-10">
            {/* ── Section Header ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div className="space-y-3">
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
              >
                View all →
              </motion.button>
            </motion.div>

            {/* ── Bento Grid ── */}
            <AnimatePresence mode="wait">
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    }
                  }
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="category-bento-grid"
              >
                {/* Hero card — spans 2 rows on md+ */}
                {categories.length > 0 && (
                  <motion.div
                    className="category-bento-grid-hero"
                    variants={{
                      hidden: { opacity: 0, scale: 0.96, y: 20 },
                      show: { 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                      }
                    }}
                  >
                    <CategoryCardBig
                      {...categories[0]}
                      title={categories[0].name}
                      count={`${categories[0].propertyCount || 0}+`}
                      propertyType={propertyType}
                      location={locationId}
                      locationId={locationId}
                    />
                  </motion.div>
                )}
                
                {/* Remaining cards */}
                {categories.slice(1).map((category) => (
                  <motion.div
                    key={category._id}
                    className="category-bento-grid-small"
                    variants={{
                      hidden: { opacity: 0, scale: 0.94, y: 15 },
                      show: { 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                      }
                    }}
                  >
                    <CategoryCard
                      {...category}
                      title={category.name}
                      count={`${category.propertyCount || 0}+`}
                      propertyType={propertyType}
                      location={locationId}
                      locationId={locationId}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <StatsSection />
      <TestimonialsSection />
      <FaqSection />
      <Footer categories={categories} />
    </div>
  );
};

export default Index;
