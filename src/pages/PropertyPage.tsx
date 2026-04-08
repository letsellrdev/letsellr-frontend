import BackgroundDotPattern from "@/components/BackgroundDotPattern";
import { Footer } from "@/components/Footer";
import ImageGrid from "@/components/ImageGrid";
import Navbar from "@/components/Navbar";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { letsellr, sampleProperties } from "@/db";
import { cn } from "@/lib/utils";
import {
  AirVent,
  Camera,
  CheckCircle,
  Coffee,
  Droplet,
  MapPin,
  MessageSquare,
  ParkingCircle,
  Phone,
  Shirt,
  Star,
  WashingMachine,
  Wifi,
  CookingPot,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "@/lib/axios";
import ImageGallery from "@/components/Imageswiper";
import { useProperty } from "@/contexts/PropertyContext";
import { Helmet } from "react-helmet-async";
const iconMappings = [
  { keywords: ["wifi", "wi-fi"], icon: Wifi },
  { keywords: ["kettle", "coffee"], icon: Coffee },
  { keywords: ["washing machine", "laundry"], icon: WashingMachine },
  { keywords: ["iron", "ironbox"], icon: Shirt },
  { keywords: ["24 hours cctv", "cctv", "camera"], icon: Camera },
  { keywords: ["24 hours water", "water", "water purifier"], icon: Droplet },
  { keywords: ["ac", "air conditioner", "air conditioning"], icon: AirVent },
  { keywords: ["parking", "car parking", "bike parking"], icon: ParkingCircle },
  { keywords: ["kitchen", "cooking", "bike parking"], icon: CookingPot },
  { keywords: ["study", "study-room"], icon: GraduationCap },
];

const getAmenityIcon = (amenity: string) => {
  const normalized = amenity.toLowerCase().trim();
  for (const mapping of iconMappings) {
    if (mapping.keywords.some((k) => normalized.includes(k))) {
      return mapping.icon;
    }
  }
  return CheckCircle;
};

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

interface PropertyType {
  _id: string;
  name: string;
  description?: string;
}

// Skeleton Components
function ImageGridSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Mobile Swiper Skeleton */}
      <div className="md:hidden mb-8">
        <div className="rounded-xl overflow-hidden shadow-lg h-80 bg-gray-200" />
      </div>

      {/* Desktop Grid Skeleton */}
      <div className="hidden md:block mb-12">
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[550px] rounded-2xl overflow-hidden">
          <div className="col-span-2 row-span-2 bg-gray-200" />
          <div className="bg-gray-200" />
          <div className="bg-gray-200" />
          <div className="bg-gray-200" />
          <div className="bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function DescriptionSkeleton() {
  return (
    <div className="border rounded-md p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-3 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-48" />
      <div className="flex items-center gap-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

function AmenitiesSkeleton() {
  return (
    <div className="overflow-hidden rounded-sm w-full border p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-3 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-56" />
      <div className="grid md:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 md:p-3 bg-primary/5 rounded-xl border border-gray-200"
          >
            <div className="p-1.5 bg-gray-200 rounded-md h-8 w-8" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="overflow-hidden rounded-sm w-full border p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 bg-gray-200 rounded w-40" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 md:p-5 bg-white border border-gray-200 rounded-xl"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 w-4 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="sticky top-24 overflow-hidden rounded-sm w-full border p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-28" />
      <div className="h-9 bg-gray-200 rounded w-48" />
      <div className="flex items-center gap-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-gray-200"
          >
            <div className="h-6 w-6 bg-gray-200 rounded-md" />
            <div className="flex items-center justify-between w-full">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-14 bg-gray-200 rounded-xl w-full" />
    </div>
  );
}

export default function PropertyPage() {
  const { propertyId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const { setCurrentProduct } = useProperty();

  // State for selected vacancy and price options
  const [selectedVacancy, setSelectedVacancy] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<{
    type: string;
    amount: number;
  } | null>(null);

  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 5);

  const handleToggleReviews = () => {
    setShowAllReviews((prev) => !prev);
  };

  // Fetch property data
  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with your actual API endpoint
      // const response = await fetch(/api/properties/${propertyId});
      const response = await instance.get(`/property/${propertyId}`);
      // console.log(response.data.property)
      // const data = await response.json();
      const propertyData = response.data.property;
      setProduct(propertyData);
      // Set current product in context for FloatingContactIcons
      setCurrentProduct(propertyData);

      // Simulating API call
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, set null (replace with actual API response)
      // setProduct(sampleProperties[Number(propertyId)]);
      // setProduct(sampleProperties[Number(propertyId)]);
    } catch (error) {
      console.error("Error fetching property:", error);
      setProduct(null);
      setCurrentProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchreviews = async () => {
    try {
      const response = await instance.get(`/feedback/property/${propertyId}`);
      if (response.data && Array.isArray(response.data.data)) {
        setAllReviews(response.data.data);
      } else {
        setAllReviews([]);
      }
      console.log(response.data.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Fetch settings phone number
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
    fetchreviews();
    fetchPhoneNumber();
    instance.get("/category")
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      })
      .catch(() => { });

    // Cleanup: Clear current product when leaving the page
    return () => {
      setCurrentProduct(null);
    };
  }, []);

  // const handleToggleReviews = () => {
  //   setShowAllReviews(!showAllReviews);
  // }

  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const formatReviewDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // const getInitials = (name: string) => {
  //   return name
  //     .split(" ")
  //     .map((word) => word.charAt(0).toUpperCase())
  //     .slice(0, 2)
  //     .join("");
  // };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRating === 0) {
      setSubmitMessage("Please select a rating");
      return;
    }

    if (!reviewForm.name.trim()) {
      setSubmitMessage("Please enter your name");
      return;
    }

    if (!reviewForm.email.trim()) {
      setSubmitMessage("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewForm.email)) {
      setSubmitMessage("Please enter a valid email address");
      return;
    }

    if (!reviewForm.comment.trim()) {
      setSubmitMessage("Please write a review");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      const reviewData: any = {
        propertyId,
        rating: selectedRating,
        userName: reviewForm.name,
        email: reviewForm.email,
        comment: reviewForm.comment,
        timestamp: new Date().toISOString(),
      };
      const response = await instance.post("/feedback", { data: reviewData });
      console.log(response.data);
      // console.log("Review submitted:", reviewData);
      setSubmitMessage("Thank you for your review!");

      setSelectedRating(0);
      setReviewForm({
        name: "",
        email: "",
        comment: "",
      });

      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitMessage("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function ContactComp() {
    // Create WhatsApp message template with property details
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

      let message = `Hi, I'm interested in this property:

*${propertyName}*
${propertyCode ? `Property Code: ${propertyCode}\n` : ""}Location: ${location}
${propertyTypeCategory ? `Type: ${propertyTypeCategory}\n` : ""}`;

      // Add selected price option or default price
      if (selectedPrice) {
        message += `Price Option: ${selectedPrice.type} - ₹${selectedPrice.amount}/Month\n`;
      } else {
        message += `Price: ₹${price}/Month\n`;
      }

      // Add selected vacancy option if any
      if (selectedVacancy) {
        message += `Interested in: ${selectedVacancy}\n`;
      }

      message += `\nI would like to know more details. Please contact me.`;

      return encodeURIComponent(message);
    };

    const contactPhone = product?.contactNumber || phoneNumber;

    if (!contactPhone) {
      return (
        <div className="text-center text-muted-foreground">
          Contact information not available
        </div>
      );
    }

    return (
      <>
        <a
          href={`https://wa.me/91${contactPhone}?text=${getWhatsAppMessage()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md"
        >
          <MessageSquare className="w-5 h-5" />
          WhatsApp Chat
        </a>
        <a
          href={`tel:+91${contactPhone}`}
          className="flex items-center justify-center gap-3 w-full bg-primary/5 border border-primary/70 text-primary font-bold py-3 rounded-xl transition-all duration-200 shadow-md"
        >
          <Phone className="w-5 h-5" />
          Call Host Directly
        </a>
      </>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute hidden md:flex inset-0 z-0">
          <BackgroundDotPattern />
        </div>
        <Navbar />
        <div className="relative p-3 md:p-5 md:py-10 mx-auto max-w-7xl flex flex-col gap-5 z-10">
          {/* Title Skeleton */}
          <div className="h-8 md:h-10 bg-gray-200 rounded w-2/3 animate-pulse" />

          {/* Image Grid Skeleton */}
          <ImageGridSkeleton />

          <div className="grid grid-cols-10 gap-5">
            <div className="col-span-10 md:col-span-6 flex flex-col gap-4 md:gap-5">
              {/* Description Skeleton */}
              <DescriptionSkeleton />

              {/* Amenities Skeleton */}
              <AmenitiesSkeleton />

              {/* Map Skeleton */}
              <div className="overflow-hidden rounded-sm w-full border p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-3 animate-pulse">
                <div className="h-7 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-[300px] md:h-[450px] bg-gray-200 rounded" />
              </div>

              {/* Reviews Skeleton */}
              <ReviewsSkeleton />
            </div>

            {/* Sidebar Skeleton - Desktop */}
            <div className="relative hidden md:block col-span-4 h-full">
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

  // Error State - Property Not Found
  if (!product) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute hidden md:flex inset-0 z-0">
          <BackgroundDotPattern />
        </div>
        <Navbar />
        <div className="relative p-3 md:p-5 md:py-10 mx-auto max-w-7xl flex flex-col items-center justify-center gap-5 z-10 min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Property Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="rounded-2xl"
            >
              Go Back
            </Button>
          </div>
        </div>
        <Footer categories={categories} />
      </div>
    );
  }

  // Structured Data for Property
  const propertyStructuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    "name": product.title,
    "description": product.description,
    "image": product.images?.[0],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": typeof product.location === "string" ? product.location : product.location?.title || "Calicut",
      "addressRegion": "Kerala",
      "addressCountry": "IN"
    },
    "amenityFeature": product.amenity?.split(",").map((a: string) => ({
      "@type": "LocationFeatureSpecification",
      "name": a.trim(),
      "value": true
    })) || []
  } : null;

  // Main Content (when data is loaded)
  return (
    <div className="relative">
      <Helmet>
        <title>{`${product?.title} - Rentals in Calicut / Kozhikode | Letsellr`}</title>
        <meta name="description" content={product?.description?.substring(0, 160)} />
        <meta name="keywords" content={`${product?.title}, rentals in calicut, pgs in kozhikode, ${typeof product?.location === "string" ? product.location : product?.location?.title}, hostles in calicut`} />
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
      <div className="relative p-3 md:p-5 md:py-10 mx-auto max-w-7xl flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl md:text-4xl font-semibold">
            {product?.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Property Code Badge */}
            {product?.propertyCode && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300">
                Code: {product.propertyCode}
              </span>
            )}
            {/* Property Type Category Badge */}
            {product?.propertyTypeCategory && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {typeof product.propertyTypeCategory === "string"
                  ? product.propertyTypeCategory
                  : product.propertyTypeCategory.name}
              </span>
            )}
            <div className="flex items-center">
              <span
                className={`px-3 py-2 rounded-lg text-sm font-medium w-full text-center ${product.vacancyCount > 0
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
              >
                {product.vacancyCount > 0
                  ? `${product.vacancyCount} Vacancies Available`
                  : "No Vacancies Available"}
              </span>
            </div>
          </div>
        </div>

        <ImageGallery images={product?.images || []} />

        <div className="w-full mx-auto flex flex-col gap-8 md:gap-10">
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Description */}
            <div className="border rounded-md p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-2">
              <h1 className="text-xl md:text-3xl">About this Place</h1>
              <div className="text-md font-medium text-gray-900 flex items-center gap-2">
                Rating :
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3 text-accent",
                        i < product?.rating ? "fill-accent" : ""
                      )}
                    />
                  ))}
                </div>
              </div>
              <p>{product?.description}</p>
            </div>

            {/* Pricing & Availability Card - Mobile Only */}
            <div className="md:hidden overflow-hidden rounded-sm w-full border bg-white/5 backdrop-blur-sm flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Pricing & Availability</h2>

              {/* Price Options */}
              {product?.price?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-600">
                    Price Options
                  </p>
                  <div className="flex flex-col gap-2">
                    {product.price.map((priceOption, i) => {
                      const isSelected =
                        selectedPrice?.type === priceOption.type &&
                        selectedPrice?.amount === priceOption.amount;
                      return (
                        <button
                          key={priceOption._id || i}
                          type="button"
                          onClick={() =>
                            setSelectedPrice({
                              type: priceOption.type,
                              amount: priceOption.amount,
                            })
                          }
                          className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-primary/5 border-gray-200"
                            }`}
                        >
                          <div
                            className={`font-medium text-sm capitalize ${isSelected
                              ? "text-primary font-bold"
                              : "text-gray-700"
                              }`}
                          >
                            {isSelected && "✓ "}
                            {priceOption?.type}
                          </div>
                          <div
                            className={`font-bold text-lg ${isSelected ? "text-primary" : ""
                              }`}
                          >
                            ₹{priceOption?.amount}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Vacancies */}
              {product?.vacancies && product.vacancies.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-600">
                    Available Vacancies
                  </p>
                  <div className="flex flex-col gap-2">
                    {product.vacancies.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setSelectedVacancy(v.count > 0 ? v.type : "")
                        }
                        disabled={v.count === 0}
                        className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all duration-200 ${v.count === 0
                          ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
                          : selectedVacancy === v.type
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <span
                          className={`text-sm font-medium ${selectedVacancy === v.type
                            ? "text-primary font-bold"
                            : "text-gray-700"
                            }`}
                        >
                          {selectedVacancy === v.type && "✓ "}
                          {v.type}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md ${v.count > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {v.count > 0 ? `${v.count} left` : "Full"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Summary */}
              {(selectedPrice || selectedVacancy) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Your Selection:
                  </p>
                  <div className="text-sm text-green-700">
                    {selectedPrice && (
                      <p>
                        • {selectedPrice.type} - ₹{selectedPrice.amount}/Month
                      </p>
                    )}
                    {selectedVacancy && <p>• {selectedVacancy}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="overflow-hidden rounded-sm w-full border p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-3">
              <h1 className="text-xl md:text-3xl flex items-center gap-1">
                What this place offers
              </h1>
              <div className="grid md:grid-cols-2 gap-3">
                {product.amenity
                  ?.split(",")
                  ?.filter((e) => e?.trim())
                  ?.map((value, i) => {
                    const amenity = value?.trim();
                    const Icon = getAmenityIcon(amenity);

                    return (
                      <div
                        key={i}
                        className="group flex items-center gap-3 p-2 md:p-3 bg-primary/5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                      >
                        <div className="p-1.5 bg-gray-800 rounded-md group-hover:bg-gray-900 transition-all duration-300">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900 transition-colors duration-300">
                          {amenity}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="hidden md:flex flex-col overflow-hidden rounded-xl border sm:px-8  px-4 p-8 bg-white/5 backdrop-blur-sm gap-6 shadow-sm border-gray-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Pricing & Availability</h2>
                  <p className="text-sm text-muted-foreground italic">Select your preferred plan and check availability</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Starting From</p>
                  <h1 className="text-4xl font-extrabold text-primary flex items-end justify-end gap-1">
                    ₹{product?.price?.[0]?.amount || 0}
                    <span className="text-sm font-normal text-gray-400 mb-1.5">/mo</span>
                  </h1>
                </div>
              </div>

              <hr className="opacity-10" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Price Options */}
                {product?.price?.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Plan</p>
                    <div className="flex flex-col gap-3">
                      {product.price.map((priceOption, i) => {
                        const isSelected = selectedPrice?.type === priceOption.type && selectedPrice?.amount === priceOption.amount;
                        return (
                          <button
                            key={priceOption._id || i}
                            type="button"
                            onClick={() => setSelectedPrice({ type: priceOption.type, amount: priceOption.amount })}
                            className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${isSelected ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" : "bg-white border-gray-100 hover:border-primary/30"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full transition-colors ${isSelected ? "bg-primary" : "bg-gray-200"}`} />
                              <span className={`font-bold text-sm capitalize ${isSelected ? "text-primary" : "text-gray-600"}`}>{priceOption?.type}</span>
                            </div>
                            <span className={`font-extrabold ${isSelected ? "text-primary" : "text-gray-900"}`}>₹{priceOption?.amount}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {product?.vacancies && product.vacancies.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Availability</p>
                    <div className="flex flex-col gap-3">
                      {product.vacancies.map((v, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedVacancy(v.count > 0 ? v.type : "")}
                          disabled={v.count === 0}
                          className={`flex justify-between items-center p-4 rounded-xl border-2 transition-all duration-300 ${v.count === 0 ? "bg-gray-50 border-gray-100 opacity-50 grayscale" : selectedVacancy === v.type ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" : "bg-white border-gray-100 hover:border-primary/30"}`}
                        >
                          <span className={`font-bold text-sm ${selectedVacancy === v.type ? "text-primary" : "text-gray-600"}`}>{v.type}</span>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${v.count > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {v.count > 0 ? `${v.count} LEFT` : "FULL"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-center pb-10">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto px-12 py-7 text-lg rounded-2xl shadow-lg transition-all font-bold">
                      Contact Host & Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] flex flex-col gap-5">
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl font-bold">Contact now</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                      <ContactComp />
                    </div>
                    <DialogDescription className="text-center font-medium">
                      Contact the host and book your slot now
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Maps */}
            {product?.location?.googleMapUrl && (
              <div className="overflow-hidden rounded-sm w-full border p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-2 md:gap-3">
                <h1 className="text-xl md:text-3xl flex items-center gap-1">
                  Location
                </h1>
                <div>
                  <p className="flex items-center gap-1 font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />{" "}
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
                  height="450"
                  allowFullScreen
                  loading="lazy"
                  className="overflow-hidden rounded-sm h-[300px] md:h-[450px] border"
                />
              </div>
            )}

            {/* Reviews List Section */}
            <section className="overflow-hidden rounded-sm w-full border p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-3xl">Guest Reviews</h1>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <span className="text-lg font-semibold">
                    {calculateAverageRating(allReviews)}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({allReviews.length} reviews)
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {displayedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="group p-4 md:p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-3 mb-3">
                      {/* Left side: Avatar and reviewer info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-sm md:text-base">
                            {review.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-green-700 text-sm md:text-base">
                            {review.email}
                          </h3>
                          <span className="text-xs md:text-sm text-gray-500">
                            {formatReviewDate(review.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Right side: Rating stars */}
                      <div className="flex gap-0.5 mt-2 md:mt-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3 md:h-4 md:w-4 text-accent",
                              i < review.rating ? "fill-accent" : ""
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review comment */}
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>

              {allReviews.length > 5 && (
                <Button
                  variant="outline"
                  onClick={handleToggleReviews}
                  className="w-full md:w-auto py-6 hover:bg-primary/10 hover:text-black"
                >
                  {showAllReviews
                    ? "Show Less Reviews"
                    : `Show All ${allReviews.length} Reviews`}
                </Button>
              )}
            </section>

            {/* Rating section */}
            <section className="overflow-hidden rounded-sm w-full border p-4 md:p-6 bg-white/5 backdrop-blur-sm flex flex-col gap-4">
              <h1 className="text-xl md:text-3xl">Leave a Review</h1>

              {submitMessage && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-sm font-medium",
                    submitMessage.includes("Thank you")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  )}
                >
                  {submitMessage}
                </div>
              )}

              <form
                onSubmit={handleSubmitReview}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="group transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 text-accent cursor-pointer transition-all",
                            (hoverRating || selectedRating) >= star
                              ? "fill-accent"
                              : ""
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {selectedRating > 0 && (
                    <span className="text-xs text-gray-600">
                      You selected {selectedRating} star
                      {selectedRating > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={reviewForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Share your experience..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </section>
            </div>
          </div>

          {/* Contact Action */}
      </div>

      {/* Mobile Bottom Bar - Shows selection summary */}
      <div className="fixed bottom-0 z-10 md:hidden p-4 px-6 bg-white/70 backdrop-blur-md border-t w-full flex justify-between items-center gap-3">
        <div className="flex-1">
          {selectedPrice || selectedVacancy ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-600">Your Selection:</p>
              <div className="text-sm font-semibold text-primary">
                {selectedPrice && (
                  <p className="truncate">
                    {selectedPrice.type} - ₹{selectedPrice.amount}
                  </p>
                )}
                {selectedVacancy && (
                  <p className="text-xs text-gray-700 truncate">
                    {selectedVacancy}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-600">Starting Price</p>
              <h1 className="text-xl font-bold">
                ₹{product?.price?.[0]?.amount || 0}
                <span className="text-xs text-gray-500 font-normal">
                  / Month
                </span>
              </h1>
            </div>
          )}
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <Button className="py-6 px-6">Contact</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center">Contact now</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-2 p-4">
              <ContactComp />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Footer categories={categories} />
    </div>
  );
}
