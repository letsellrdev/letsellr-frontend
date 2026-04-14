import BackgroundDotPattern from "@/components/BackgroundDotPattern";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MapPin, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "@/lib/axios";
import ImageGallery from "@/components/Imageswiper";
import { useProperty } from "@/contexts/PropertyContext";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Modular components
import { PropertyHeader } from "@/components/property/PropertyHeader";
import { AmenitySection } from "@/components/property/AmenitySection";
import { BookingCard } from "@/components/property/BookingCard";
import { ReviewSection } from "@/components/property/ReviewSection";
import PropertyCard from "@/components/PropertyCard";
import {
  ImageGridSkeleton,
  DescriptionSkeleton,
  AmenitiesSkeleton,
  SidebarSkeleton,
} from "@/components/property/PropertySkeletons";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// ── Local skeleton for reviews (not in PropertySkeletons yet) ──────────────────
function ReviewsSkeleton() {
  return (
    <div className="rounded-xl border p-4 md:p-6 bg-white flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-7 bg-gray-200 rounded w-40" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-5 border border-gray-100 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Interfaces ─────────────────────────────────────────────────────────────────
interface Review {
  propertyId: string | number;
  id: number;
  name: string;
  rating: number;
  email: string;
  comment: string;
  date: string;
  timestamp: string;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PropertyPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review state
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: "", email: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Contact state
  const [phoneNumber, setPhoneNumber] = useState("");

  // Categories for footer
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  // Related properties state
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);

  // Booking selection state (shared between sidebar & mobile bar)
  const [selectedVacancy, setSelectedVacancy] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<{ type: string; amount: number } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { setCurrentProduct } = useProperty();

  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 5);

  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating(allReviews);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get(`/property/${propertyId}`);
      const propertyData = response.data.property;
      setProduct(propertyData);
      setCurrentProduct(propertyData);
      
      // Fetch related properties if location exists
      const locId = typeof propertyData.location === 'object' ? propertyData.location?._id : propertyData.location;
      if (locId) {
        fetchRelatedProperties(locId);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setProduct(null);
      setCurrentProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedProperties = async (locId: string) => {
    setIsRelatedLoading(true);
    try {
      const response = await instance.get(`/property?locationId=${locId}&limit=5`);
      const allProps = response.data.properties || [];
      // Filter out current property
      setRelatedProperties(allProps.filter((p: any) => p._id !== propertyId));
    } catch (error) {
      console.error("Error fetching related properties:", error);
      setRelatedProperties([]);
    } finally {
      setIsRelatedLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await instance.get(`/feedback/property/${propertyId}`);
      if (response.data && Array.isArray(response.data.data)) {
        setAllReviews(response.data.data);
      } else {
        setAllReviews([]);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchPhoneNumber = async () => {
    try {
      const response = await instance.get("/settings/default_phone_number");
      if (response.data.success) {
        setPhoneNumber(response.data.data.value || "");
      }
    } catch (error) {
      console.error("Error fetching phone number:", error);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchProperty();
    fetchReviews();
    fetchPhoneNumber();
    instance
      .get("/category")
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) setCategories(res.data.data);
      })
      .catch(() => {});

    return () => { setCurrentProduct(null); };
  }, [propertyId]);

  // ── Review handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating === 0) { setSubmitMessage("Please select a rating"); return; }
    if (!reviewForm.name.trim()) { setSubmitMessage("Please enter your name"); return; }
    if (!reviewForm.email.trim()) { setSubmitMessage("Please enter your email"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewForm.email)) { setSubmitMessage("Please enter a valid email address"); return; }
    if (!reviewForm.comment.trim()) { setSubmitMessage("Please write a review"); return; }

    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      const reviewData: any = {
        propertyId,
        rating: selectedRating,
        userName: reviewForm.name,
        email: reviewForm.email,
        comment: reviewForm.comment,
        timestamp: new Date().toISOString(),
      };
      await instance.post("/feedback", { data: reviewData });
      setSubmitMessage("Thank you for your review!");
      setSelectedRating(0);
      setReviewForm({ name: "", email: "", comment: "" });
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitMessage("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── WhatsApp message builder (shared by sidebar & mobile drawer) ────────────
  const getWhatsAppMessage = () => {
    const propertyName = product?.title || "Property";
    const propertyCode = product?.propertyCode || "";
    const location =
      typeof product?.location === "string"
        ? product?.location
        : product?.location?.title || "Location";
    const price = product?.price?.[0]?.amount || "N/A";
    const propertyTypeCategory =
      typeof product?.propertyTypeCategory === "string"
        ? product?.propertyTypeCategory
        : product?.propertyTypeCategory?.name || "";

    let message = `Hi, I'm interested in this property:\n\n*${propertyName}*\n${
      propertyCode ? `Property Code: ${propertyCode}\n` : ""
    }Location: ${location}\n${
      propertyTypeCategory ? `Type: ${propertyTypeCategory}\n` : ""
    }`;

    if (selectedPrice) {
      message += `Price Option: ${selectedPrice.type} - ₹${selectedPrice.amount}/Month\n`;
    } else {
      message += `Price: ₹${price}/Month\n`;
    }
    if (selectedVacancy) message += `Interested in: ${selectedVacancy}\n`;
    message += `\nI would like to know more details. Please contact me.`;
    return encodeURIComponent(message);
  };

  const contactPhone = product?.contactNumber || phoneNumber;

  // ── Structured Data ──────────────────────────────────────────────────────────
  const propertyStructuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Accommodation",
        name: product.title,
        description: product.description,
        image: product.images?.[0],
        address: {
          "@type": "PostalAddress",
          addressLocality:
            typeof product.location === "string"
              ? product.location
              : product.location?.title || "Calicut",
          addressRegion: "Kerala",
          addressCountry: "IN",
        },
        amenityFeature:
          product.amenity
            ?.split(",")
            .map((a: string) => ({
              "@type": "LocationFeatureSpecification",
              name: a.trim(),
              value: true,
            })) || [],
      }
    : null;

  // ── Loading State ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute hidden md:flex inset-0 z-0">
          <BackgroundDotPattern />
        </div>
        <Navbar />
        <div className="relative p-3 md:p-5 md:py-10 mx-auto max-w-7xl flex flex-col gap-6 z-10">
          {/* Title Skeleton */}
          <div className="space-y-3">
            <div className="h-8 md:h-10 bg-gray-200 rounded-xl w-2/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
            </div>
          </div>

          <ImageGridSkeleton />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 md:gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-5">
              <DescriptionSkeleton />
              <AmenitiesSkeleton />
              {/* Map Skeleton */}
              <div className="rounded-xl border p-4 md:p-6 bg-white flex flex-col gap-3 animate-pulse">
                <div className="h-7 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-[300px] md:h-[400px] bg-gray-200 rounded-xl" />
              </div>
              <ReviewsSkeleton />
            </div>
            {/* Right sidebar */}
            <div className="hidden md:block">
              <SidebarSkeleton />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar Skeleton */}
        <div className="fixed bottom-0 z-10 md:hidden p-4 px-6 bg-white/70 backdrop-blur-md border-t w-full flex justify-between items-center animate-pulse">
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-32" />
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-32" />
        </div>

        <Footer categories={categories} />
      </div>
    );
  }

  // ── Error / Not Found ─────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute hidden md:flex inset-0 z-0">
          <BackgroundDotPattern />
        </div>
        <Navbar />
        <div className="relative p-3 md:p-5 md:py-10 mx-auto max-w-7xl flex flex-col items-center justify-center gap-5 z-10 min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()} className="rounded-2xl">
              Go Back
            </Button>
          </div>
        </div>
        <Footer categories={categories} />
      </div>
    );
  }

  // ── Main Content ──────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <Helmet>
        <title>{`${product?.title} - Rentals in Calicut / Kozhikode | Letsellr`}</title>
        <meta name="description" content={product?.description?.substring(0, 160)} />
        <meta
          name="keywords"
          content={`${product?.title}, rentals in calicut, pgs in kozhikode, ${
            typeof product?.location === "string"
              ? product.location
              : product?.location?.title
          }, hostels in calicut`}
        />
        {propertyStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(propertyStructuredData)}
          </script>
        )}
      </Helmet>

      <div className="absolute hidden md:flex inset-0 z-0">
        <BackgroundDotPattern />
      </div>

      <Navbar />

      <div className="relative p-3 md:p-5 md:py-10 mx-auto max-w-7xl flex flex-col gap-6 z-10">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <PropertyHeader
          product={product}
          averageRating={averageRating}
          reviewCount={allReviews.length}
        />

        {/* ── Image Gallery ───────────────────────────────────────────────── */}
        <ImageGallery images={product?.images || []} />

        {/* ── Tabbed Content ────────────────────────────────────────────────── */}
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <div className="sticky top-16 md:top-20 z-40 bg-white/60 backdrop-blur-xl border-b border-gray-100 -mx-5 px-6 pt-2 mb-8 mt-2">
            <TabsList className="bg-transparent h-auto p-0 flex gap-6 md:gap-8 justify-start">
              {["overview", "location", "review"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="relative px-1 pb-3 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-sm md:text-base text-gray-500 data-[state=active]:text-primary transition-colors cursor-pointer"
                >
                  <span className="relative z-10 capitalize">
                    {tab === "review" ? "Reviews" : tab}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
            >
              {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
              <TabsContent value="overview" className="mt-0 focus-visible:ring-0">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 md:gap-10 items-start">
                  <div className="flex flex-col gap-8">
                    {/* Description */}
                    <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
                      <h2 className="text-xl md:text-2xl font-bold">About this Place</h2>
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        {product?.description}
                      </p>
                    </section>

                    {/* Amenities */}
                    {product?.amenity && (
                      <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-sm">
                        <h2 className="text-xl md:text-2xl font-bold">What this place offers</h2>
                        <AmenitySection amenities={product.amenity} />
                      </section>
                    )}
                  </div>

                  {/* Sidebar (Desktop Sidebar stays for Overview) */}
                  <div className="hidden md:block">
                    <BookingCard
                      product={product}
                      selectedPrice={selectedPrice}
                      setSelectedPrice={setSelectedPrice}
                      selectedVacancy={selectedVacancy}
                      setSelectedVacancy={setSelectedVacancy}
                      getWhatsAppMessage={getWhatsAppMessage}
                    />
                  </div>

                  {/* Mobile Pricing & Availability (Combined) */}
                  <div className="md:hidden">
                    {(product?.price?.length > 0) && (
                      <section className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-lg font-bold">Pricing & Availability</h2>
                          <p className="text-xs text-gray-500">Select a plan to see contact options</p>
                        </div>

                        <div className="flex flex-col gap-3">
                          {product.price.map((priceOption: any, i: number) => {
                            const isSelected =
                              selectedPrice?.type === priceOption.type &&
                              selectedPrice?.amount === priceOption.amount;
                            
                            // Find matching vacancy for this type if available
                            const vacancy = product?.vacancies?.find(
                              (v: any) =>
                                v.type?.toLowerCase().includes(priceOption.type?.toLowerCase()) ||
                                priceOption.type?.toLowerCase().includes(v.type?.toLowerCase())
                            );
                            const isFull = vacancy && vacancy.count === 0;

                            return (
                              <button
                                key={priceOption._id || i}
                                type="button"
                                onClick={() => {
                                  if (!isFull) {
                                    setSelectedPrice({ type: priceOption.type, amount: priceOption.amount });
                                    // Only auto-set vacancy if exact type match — no substring guessing
                                    const exactVacancy = product?.vacancies?.find(
                                      (v: any) => v.type?.toLowerCase() === priceOption.type?.toLowerCase()
                                    );
                                    if (exactVacancy && exactVacancy.count > 0) setSelectedVacancy(exactVacancy.type);
                                  }
                                }}
                                disabled={isFull}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                                  isFull
                                    ? "bg-gray-50 border-transparent opacity-60 grayscale cursor-not-allowed"
                                    : isSelected
                                    ? "bg-primary/5 border-primary shadow-sm"
                                    : "bg-gray-50 border-transparent hover:border-gray-200"
                                }`}
                              >
                                <div className="flex flex-col items-start gap-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full transition-colors ${
                                        isFull ? "bg-gray-400" : isSelected ? "bg-primary" : "bg-gray-300"
                                      }`}
                                    />
                                    <span
                                      className={`font-bold text-sm capitalize ${
                                        isSelected ? "text-primary" : "text-gray-700"
                                      }`}
                                    >
                                      {priceOption?.type}
                                    </span>
                                  </div>
                                  {vacancy && (
                                    <span className={`text-[10px] font-bold ml-4 ${
                                      isFull ? "text-red-500" : vacancy.count < 3 ? "text-orange-500" : "text-green-600"
                                    }`}>
                                      {isFull ? "Sold Out" : `${vacancy.count} Rooms Left`}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`block font-black text-lg ${
                                      isSelected ? "text-primary" : "text-gray-900"
                                    }`}
                                  >
                                    ₹{priceOption?.amount}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium">/ month</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {/* Related Properties Section */}
                {relatedProperties.length > 0 && (
                  <div className="mt-16 mb-12 flex flex-col gap-10">
                    <div className="flex flex-col gap-2 items-center text-center">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Similar properties in <span className="text-primary">{typeof product?.location === 'object' ? product?.location?.title : product?.location}</span>
                      </h2>
                      <div className="h-1 w-16 bg-primary/60 rounded-full">
                      </div>
                    </div>
                    
                    <div className="relative px-12 md:px-0">
                      <Carousel
                        opts={{
                          align: "start",
                          loop: true,
                        }}
                        className="w-full"
                      >
                        <CarouselContent>
                          {relatedProperties.map((p) => (
                            <CarouselItem key={p._id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                              <div className="p-1 h-full cursor-pointer" onClick={() => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                navigate(`/property/${p._id}`);
                              }}>
                                <PropertyCard {...p} />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <div className="hidden md:block">
                          <CarouselPrevious className="-left-12 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all" />
                          <CarouselNext className="-right-12 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all" />
                        </div>
                        {/* Mobile controls */}
                        <div className="flex md:hidden justify-center gap-4 mt-8">
                           <CarouselPrevious className="static translate-y-0" />
                           <CarouselNext className="static translate-y-0" />
                        </div>
                      </Carousel>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── LOCATION TAB ────────────────────────────────────────────── */}
              <TabsContent value="location" className="mt-0 focus-visible:ring-0">
                 {product?.location?.googleMapUrl && (
                  <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm overflow-hidden">
                    <h2 className="text-xl md:text-2xl font-bold">Location</h2>
                    <div>
                      <p className="flex items-center gap-1.5 font-medium text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        {product?.location?.title}
                      </p>
                      {product?.location?.description && (
                        <p className="text-sm text-muted-foreground mt-1 ml-5">
                          {product?.location?.description}
                        </p>
                      )}
                    </div>
                    <iframe
                      src={product?.location?.googleMapUrl}
                      width="100%"
                      height="400"
                      allowFullScreen
                      loading="lazy"
                      className="rounded-2xl h-[350px] md:h-[500px] border border-gray-100"
                    />
                  </section>
                )}
              </TabsContent>

              {/* ── REVIEWS TAB ─────────────────────────────────────────────── */}
              <TabsContent value="review" className="mt-0 focus-visible:ring-0">
                <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
                  <ReviewSection
                    allReviews={allReviews}
                    displayedReviews={displayedReviews}
                    showAllReviews={showAllReviews}
                    onToggleReviews={() => setShowAllReviews((prev) => !prev)}
                    submitMessage={submitMessage}
                    selectedRating={selectedRating}
                    setSelectedRating={setSelectedRating}
                    hoverRating={hoverRating}
                    setHoverRating={setHoverRating}
                    reviewForm={reviewForm}
                    onInputChange={handleInputChange}
                    onSubmitReview={handleSubmitReview}
                    isSubmitting={isSubmitting}
                    averageRating={averageRating}
                  />
                </section>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>


      {/* ── Mobile Bottom Bar ───────────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-10 md:hidden px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex-1 min-w-0 overflow-hidden">
          {selectedPrice ? (
            <div className="flex flex-col gap-0"> 
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Selected</p>
              <p className="text-sm font-extrabold text-gray-900 truncate">
                {selectedPrice.type}
                <span className="font-bold text-primary ml-1">₹{selectedPrice.amount}<span className="text-[10px] text-gray-400 font-normal">/mo</span></span>
              </p>
              {selectedVacancy && (
                <p className="text-[10px] text-gray-500 truncate">{selectedVacancy}</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Starting from</p>
              <p className="text-base font-extrabold text-gray-900 leading-none">
                ₹{product?.price?.[0]?.amount || 0}
                <span className="text-[10px] text-gray-400 font-normal ml-1">/mo</span>
              </p>
            </div>
          )}
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <Button className="py-6 px-6 rounded-2xl font-bold shadow-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white">
              <MessageSquare className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </DrawerTrigger>
          <DrawerContent className="pb-4">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader className="py-4">
                <DrawerTitle className="text-center text-base font-bold">Contact via WhatsApp</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 px-5">
                {(selectedPrice || selectedVacancy) && (
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-0.5">
                    <p className="font-bold text-gray-700">Your selection:</p>
                    {selectedPrice && <p>· {selectedPrice.type} — ₹{selectedPrice.amount}/mo</p>}
                    {selectedVacancy && <p>· {selectedVacancy} Room</p>}
                  </div>
                )}
                {contactPhone ? (
                  <a
                    href={`https://wa.me/91${contactPhone.replace(/\s+/g, "")}?text=${getWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-sm text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open WhatsApp
                  </a>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">Contact info unavailable</p>
                )}
                <p className="text-[9px] text-center text-muted-foreground font-medium uppercase tracking-tighter opacity-80">
                  * Pre-filled with your selection
                </p>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Footer categories={categories} />
    </div>
  );
}
