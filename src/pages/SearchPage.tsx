import BackgroundDotPattern from "@/components/BackgroundDotPattern";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import instance from "@/lib/axios";
import {
  Search,
  MapPin,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SyncLoader } from "react-spinners";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Helmet } from "react-helmet-async";
interface Suggestion {
  _id: string;
  title: string;
  locationTitle?: string;
}

/* ─── Self-contained search input with live auto-suggestions ─────────────── */
/* ─── Self-contained search input with mobile Drawer and Desktop Autocomplete ─── */
function SearchAutocomplete({
  value,
  onChange,
  placeholder = "Search properties...",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  selectedLocationId?: string;
  locations?: { _id: string; title: string }[];
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-gray-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm hover:shadow-md bg-white text-base"
            autoComplete="off"
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 backdrop-blur-sm p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Location {
  _id: string;
  title: string;
  description?: string;
  googleMapUrl: string;
  importantLocation?: boolean;
}

interface PropertyType {
  _id: string;
  name: string;
  description?: string;
}

// Skeleton loader component matching PropertyCard design
function PropertyCardSkeleton() {
  return (
    <div className="md:max-w-96 bg-primary/ border border-primary/20 overflow-hidden rounded-md bg-white/5 backdrop-blur-sm animate-pulse">
      <div className="group relative grid-cols-5 grid sm:grid-cols-1">
        {/* Image Skeleton */}
        <div className="col-span-2 h-full md:max-h-52 aspect-square w-full bg-gray-200 lg:aspect-auto lg:h-72" />

        {/* Content Skeleton */}
        <div className="col-span-3 p-5 flex flex-col gap-2">
          {/* Price and Rating Row */}
          <div className="flex flex-col md:flex-row md:justify-between gap-2">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 w-3 bg-gray-200 rounded" />
              ))}
            </div>
          </div>

          {/* Title Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-3/4" />

          {/* Location Skeleton */}
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>

          {/* Amenities Skeleton - Desktop Only */}
          <div className="sm:flex flex-wrap gap-1 hidden">
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State - Initialize with locationId if available
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get("locationId") || searchParams.get("location") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedPropertyType, setSelectedPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );
  const [selectedPropertyTypeCategory, setSelectedPropertyTypeCategory] =
    useState(searchParams.get("propertyTypeCategory") || "");
  const [minPrice, setMinPrice] = useState<string>(
    searchParams.get("minPrice") || ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    searchParams.get("maxPrice") || ""
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<PropertyType[]>([]);
  const [tenantTypes, setTenantTypes] = useState<PropertyType[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Simple in-memory cache for search results (cleared on page refresh)
  const searchCacheRef = useState(
    () => new Map<string, { properties: any[]; totalPages: number; totalProperties: number }>()
  )[0];

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      const res = await instance.get("/location");
      setLocations(res.data.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const res = await instance.get("/propertytype");
      const allTypes: PropertyType[] = res.data.data || [];

      // Separate types based on name
      const transactionNames = ["rent", "buy", "lease"];
      const txTypes = allTypes.filter((type) =>
        transactionNames.includes(type.name.toLowerCase())
      );
      const ttTypes = allTypes.filter(
        (type) => !transactionNames.includes(type.name.toLowerCase())
      );

      setTransactionTypes(txTypes);
      setTenantTypes(ttTypes);
    } catch (error) {
      console.error("Error fetching property types:", error);
      setTransactionTypes([]);
      setTenantTypes([]);
    }
  };

  console.log(categories)

  // Fetch properties from API
  const fetchProperties = async () => {
    try {
      // Build query params for API
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (selectedLocation) params.append("locationId", selectedLocation);
      if (selectedCategory) params.append("category", selectedCategory);
      if (sortBy) params.append("sort", sortBy);
      if (selectedPropertyType) {
        params.append("propertyType", selectedPropertyType.toLowerCase());
      }
      if (selectedPropertyTypeCategory)
        params.append("propertyTypeCategory", selectedPropertyTypeCategory);
      // Normalize price filters
      const minV = Number(minPrice);
      const maxV = Number(maxPrice);
      const hasMin = !Number.isNaN(minV) && minPrice !== "";
      const hasMax = !Number.isNaN(maxV) && maxPrice !== "";
      if (hasMin && hasMax) {
        if (minV <= maxV) {
          params.append("minPrice", String(minV));
          params.append("maxPrice", String(maxV));
        }
      } else if (hasMin) {
        params.append("minPrice", String(minV));
      } else if (hasMax) {
        params.append("maxPrice", String(maxV));
      }

      // Pagination params
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      // Create cache key from all search parameters
      const cacheKey = params.toString();

      // Check cache first
      const cached = searchCacheRef.get(cacheKey);
      if (cached) {
        // Use cached results for instant display
        setProperties(cached.properties);
        setTotalPages(cached.totalPages);
        setTotalProperties(cached.totalProperties);
        return;
      }

      setIsLoading(true);

      const response = await instance.get(`/property?${params.toString()}`);

      // Defensive check for response data
      const responseData = response.data || {};
      const fetchedProperties = responseData.properties || (Array.isArray(responseData.data) ? responseData.data : []);
      const fetchedTotalPages = responseData.totalpages || 1;
      const totalProps = responseData.totalproperty ?? fetchedProperties.length;

      setProperties(fetchedProperties);
      setTotalProperties(totalProps);
      setTotalPages(fetchedTotalPages);

      // Save to cache
      searchCacheRef.set(cacheKey, {
        properties: fetchedProperties,
        totalPages: fetchedTotalPages,
        totalProperties: totalProps,
      });

      // Simulating API call with timeout
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, set empty array (replace with actual API response)
      // setProperties(sampleProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };



  // Initialize from URL params only once when locations & categories are loaded
  useEffect(() => {
    if (locations.length > 0 && categories.length > 0 && !isInitialized) {
      const locationId = searchParams.get("locationId") || "";
      const locationName = searchParams.get("location") || "";
      const catParam = searchParams.get("category") || "";

      // 1. Handle Location
      if (locationId) {
        setSelectedLocation(locationId);
      } else if (locationName) {
        const matchedLocation = locations.find(
          (loc) => loc.title.toLowerCase() === locationName.toLowerCase()
        );
        if (matchedLocation) {
          setSelectedLocation(matchedLocation._id);
        }
      }

      // 2. Handle Category (map name/slug to ID)
      if (catParam) {
        const matchedCat = categories.find(
          (c) => 
            c._id === catParam || 
            c.name.toLowerCase() === catParam.toLowerCase() ||
            (c as any).value?.toLowerCase() === catParam.toLowerCase()
        );
        if (matchedCat) {
          setSelectedCategory(matchedCat._id);
        }
      }

      setIsInitialized(true);
    }
  }, [locations, categories, searchParams, isInitialized]);

  // Sync URL params on filter changes (only after initialization)
  useEffect(() => {
    if (!isInitialized) return; // Don't sync until initialized

    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (selectedLocation) params.set("locationId", selectedLocation);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedPropertyType) {
      params.set("propertyType", selectedPropertyType);
    }
    if (selectedPropertyTypeCategory)
      params.set("propertyTypeCategory", selectedPropertyTypeCategory);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortBy) params.set("sort", sortBy);

    // Sync page to URL
    if (currentPage > 1) params.set("page", currentPage.toString());

    const next = params.toString();
    const current = searchParams.toString();

    // Only update if there's an actual difference
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [
    isInitialized,
    searchQuery,
    selectedLocation,
    selectedCategory,
    selectedPropertyType,
    selectedPropertyTypeCategory,
    minPrice,
    maxPrice,
    sortBy,
    currentPage,
  ]);

  // Fetch properties when filters change
  useEffect(() => {
    if (isInitialized) {
      fetchProperties();
    }
  }, [
    isInitialized,
    searchQuery,
    selectedLocation,
    selectedCategory,
    selectedPropertyType,
    selectedPropertyTypeCategory,
    minPrice,
    maxPrice,
    sortBy,
    currentPage,
  ]);

  // Reset page when filters change (except page itself)
  useEffect(() => {
    if (isInitialized) {
      setCurrentPage(1);
    }
  }, [
    searchQuery,
    selectedLocation,
    selectedCategory,
    selectedPropertyType,
    selectedPropertyTypeCategory,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedCategory("");
    setSelectedPropertyType("");
    setSelectedPropertyTypeCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedLocation ||
    selectedCategory ||
    selectedPropertyType ||
    selectedPropertyTypeCategory ||
    minPrice ||
    maxPrice
  );
  const activeFilterCount = [
    searchQuery,
    selectedLocation,
    selectedCategory,
    selectedPropertyType,
    selectedPropertyTypeCategory,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchLocations();
    fetchPropertyTypes();
    instance.get("/category").then((res) => {
      const cats = res.data.data || [];
      setCategories(cats);
    }).catch((err) => {
      console.error("Error fetching categories:", err);
    });
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="absolute hidden md:flex inset-0 z-0">
        <BackgroundDotPattern />
      </div>

      <Navbar />

      <section className="max-w-7xl mx-auto py-7 px-5 flex flex-col gap-5 relative z-10">
    
        <Helmet>
          <title>Property Listings in Calicut | Letsellr</title>
          <meta
            name="description"
            content="Search rental homes, flats, rooms and PG in Calicut."
          />
        </Helmet>

        {/* Search and Filter Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm">
          {/* Desktop Filters */}
          <div className="hidden md:flex flex-col gap-3">
            {/* Row 1: Search + Location + Price + Clear */}
            <div className="flex gap-2 items-center">
              {/* Search */}
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for PG, Hostels, Apartments..."
                className="flex-1"
                selectedLocationId={selectedLocation}
                locations={locations}
              />

              {/* Location Select */}
              <div className="relative group shrink-0">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <Select
                  value={selectedLocation || "all-locations"}
                  onValueChange={(val) => setSelectedLocation(val === "all-locations" ? "" : val)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-44 h-14 pl-9 rounded-2xl border-gray-200 focus:ring-primary/20 bg-white text-sm">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all-locations">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc._id} value={loc._id}>
                        {loc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price */}
              <Input
                type="number"
                min={0}
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 h-14 rounded-2xl border-gray-200 text-sm"
              />
              {/* Max Price */}
              <Input
                type="number"
                min={0}
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 h-14 rounded-2xl border-gray-200 text-sm"
              />

              {/* Clear Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  disabled={isLoading}
                  className="h-14 w-14 rounded-2xl hover:bg-red-50 hover:text-red-600 shrink-0"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Row 2: Category pills + Tenant type + Category dropdown */}
            <h1 className="ml-2 text-sm font-semibold text-gray-900">Looking for</h1>
            <div className="flex items-center gap-3 flex-wrap max-w-full">
              {/* All Categories dropdown - compact width */}
              <div className="w-[140px] shrink-0">
                <Select
                  value={selectedCategory || "all-categories"}
                  onValueChange={(val) => setSelectedCategory(val === "all-categories" ? "" : val)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-8 px-3 rounded-full border border-gray-200 bg-white text-xs focus:ring-0 focus:ring-offset-0 focus:border-primary w-full">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    <SelectItem value="all-categories">Any</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Type pills - Improved layout to prevent scroll-x */}
              <div className="flex items-center gap-2 flex-wrap">
                {transactionTypes.map((tx) => (
                  <div key={tx._id} className="flex gap-1.5 items-center flex-wrap">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 ml-1">
                      {tx.name}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {categories.map((category) => {
                        const isActive =
                          selectedPropertyType.toLowerCase() === tx.name.toLowerCase() &&
                          selectedCategory === category._id;
                        return (
                          <button
                            key={`${tx._id}-${category._id}`}
                            onClick={() => {
                              if (isActive) {
                                setSelectedPropertyType("");
                                setSelectedCategory("");
                              } else {
                                setSelectedPropertyType(tx.name.toLowerCase());
                                setSelectedCategory(category._id);
                              }
                            }}
                            disabled={isLoading}
                            className={`h-7 px-3 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${isActive
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary"
                              }`}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px h-5 bg-gray-200 shrink-0 mx-1" />

              {/* Tenant Type chips */}
              <div className="flex gap-1.5 flex-wrap">
                {tenantTypes.map((type) => (
                  <button
                    key={type._id}
                    onClick={() =>
                      setSelectedPropertyTypeCategory(
                        selectedPropertyTypeCategory === type._id ? "" : type._id
                      )
                    }
                    disabled={isLoading}
                    className={`h-7 px-3 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${selectedPropertyTypeCategory === type._id
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary"
                      }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="md:hidden flex flex-col gap-3">
            {/* Search Input with auto-suggestions (mobile) */}
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search properties..."
              selectedLocationId={selectedLocation}
              locations={locations}
            />

            {/* Drawer Based Filters */}
            <Drawer open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <DrawerTrigger asChild>
                <button
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 h-12 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">
                    {hasActiveFilters
                      ? `Filters (${activeFilterCount})`
                      : "Show Filters"}
                  </span>
                </button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="text-xl font-bold">Filters</DrawerTitle>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                      >
                        Reset All
                      </Button>
                    )}
                  </div>
                  <DrawerDescription>
                    Refine your search results
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 py-6 overflow-y-auto flex flex-col gap-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Location
                    </label>
                    <div className="relative group">
                      <Select
                        value={selectedLocation || "all-locations"}
                        onValueChange={(val) => setSelectedLocation(val === "all-locations" ? "" : val)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-full h-12 rounded-2xl border-gray-200 bg-white focus:ring-primary/20">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg">
                          <SelectItem value="all-locations">All Locations</SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc._id} value={loc._id}>
                              {loc.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      Category
                    </label>
                    <div className="relative group">
                      <Select
                        value={selectedCategory || "all-categories"}
                        onValueChange={(val) => setSelectedCategory(val === "all-categories" ? "" : val)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-full h-12 rounded-2xl border-gray-200 bg-white focus:ring-primary/20">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg">
                          <SelectItem value="all-categories">Any</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Property Type Grouped Categories */}
                  <div className="flex flex-col gap-5">
                    {transactionTypes.map((tx) => (
                      <div key={tx._id} className="flex flex-col gap-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {tx.name}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {categories.map((category) => {
                            const isActive =
                              selectedPropertyType.toLowerCase() === tx.name.toLowerCase() &&
                              selectedCategory === category._id;
                            return (
                              <Button
                                key={`${tx._id}-${category._id}`}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                className={`rounded-full h-9 px-4 text-xs transition-all ${
                                  isActive ? "bg-primary text-white" : ""
                                }`}
                                onClick={() => {
                                  if (isActive) {
                                    setSelectedPropertyType("");
                                    setSelectedCategory("");
                                  } else {
                                    setSelectedPropertyType(tx.name.toLowerCase());
                                    setSelectedCategory(category._id);
                                  }
                                }}
                              >
                                {category.name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tenant Type Category */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Tenant Type (For)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {tenantTypes.map((type) => (
                        <Button
                          key={type._id}
                          type="button"
                          variant={
                            selectedPropertyTypeCategory === type._id
                              ? "default"
                              : "outline"
                          }
                          disabled={isLoading}
                          onClick={() =>
                            setSelectedPropertyTypeCategory(
                              selectedPropertyTypeCategory === type._id
                                ? ""
                                : type._id
                            )
                          }
                          className="h-10 rounded-full px-5 text-xs"
                        >
                          {type.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="rounded-2xl border-gray-200 pl-7 h-12"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="rounded-2xl border-gray-200 pl-7 h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DrawerFooter className="border-t bg-white p-4">
                  <DrawerClose asChild>
                    <Button className="w-full h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
                      Show Results ({totalProperties})
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>



        {/* Loading State */}
        {isLoading || !isInitialized ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 w-full">
            <SyncLoader color="#328378" size={12} margin={3} />
            <p className="text-muted-foreground animate-pulse text-sm">Searching properties...</p>
          </div>
        ) : (
          <>
            {/* Results Count & Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600 bg-gray-50 px-2 py-1 rounded-xl border border-gray-100 flex items-center gap-2">
                Found{" "}
                <span className="font-bold text-primary text-sm">
                  {totalProperties}
                </span>{" "}
                {totalProperties === 1 ? "property" : "properties"}
              </p>

              <div className="flex items-center gap-2 group">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Sort by</span>
                <Select
                  value={sortBy || "newest"}
                  onValueChange={(val) => setSortBy(val === "newest" ? "" : val)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-10 w-[180px] rounded-xl border-gray-200 focus:ring-primary/20 bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="asc">Price: Low to High</SelectItem>
                    <SelectItem value="des">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Grid or Empty State */}
            {properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-4 md:gap-5">
                  {properties.map((property) => (
                    <Link key={property._id} to={`/property/${property._id}`}>
                      <PropertyCard {...property} />
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pb-10">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-10 w-10 rounded-full border-gray-200 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {(() => {
                          const range = [];
                          const delta = 1; // Number of pages to show around current page

                          for (let i = 1; i <= totalPages; i++) {
                            if (
                              i === 1 ||
                              i === totalPages ||
                              (i >= currentPage - delta && i <= currentPage + delta)
                            ) {
                              range.push(i);
                            }
                          }

                          const rangeWithDots = [];
                          let l;

                          for (let i of range) {
                            if (l) {
                              if (i - l === 2) {
                                rangeWithDots.push(l + 1);
                              } else if (i - l !== 1) {
                                rangeWithDots.push("...");
                              }
                            }
                            rangeWithDots.push(i);
                            l = i;
                          }

                          return rangeWithDots.map((page, index) => {
                            if (page === "...") {
                              return (
                                <span key={`dots-${index}`} className="w-8 text-center text-muted-foreground font-medium">
                                  ...
                                </span>
                              );
                            }
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handlePageChange(Number(page))}
                                className={`h-10 w-10 rounded-full transition-all ${currentPage === page
                                    ? "pointer-events-none shadow-md shadow-primary/20"
                                    : "hover:bg-primary/5 hover:text-primary"
                                  }`}
                              >
                                {page}
                              </Button>
                            );
                          });
                        })()}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 rounded-full border-gray-200 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground font-medium sm:ml-2">
                      Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="rounded-2xl">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <Footer categories={categories} />

      {/* Floating Sticky Filter Button (Mobile only) */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <Drawer open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <DrawerTrigger asChild>
            <Button
              className="h-12 px-6 rounded-full shadow-2xl pointer-events-auto bg-primary text-white flex items-center gap-2 border border-white/20 scale-100 active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
            >
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center bg-white text-primary rounded-full min-w-[20px] h-5 px-1 text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>
        </Drawer>
      </div>
    </div>
  );
}