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
  Building2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

interface Suggestion {
  _id: string;
  title: string;
  locationTitle?: string;
}

/* ─── Self-contained search input with live auto-suggestions ─────────────── */
function SearchAutocomplete({
  value,
  onChange,
  placeholder = "Search properties…",
  className = "",
  selectedLocationId = "",
  locations = [] as { _id: string; title: string }[],
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  selectedLocationId?: string;
  locations?: { _id: string; title: string }[];
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q || q.length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ query: q, limit: "8" });
        if (selectedLocationId) params.append("locationId", selectedLocationId);
        const res = await instance.get(`/property?${params.toString()}`);
        const props: any[] = res.data.properties || [];
        const mapped: Suggestion[] = props.map((p) => ({
          _id: p._id,
          title: p.title ?? p.name ?? "",
          locationTitle:
            p.location?.title ??
            p.locationId?.title ??
            locations.find(
              (l) => l._id === (p.location ?? p.locationId)
            )?.title ??
            "",
        }));
        setSuggestions(mapped);
        setOpen(mapped.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [selectedLocationId, locations]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    setHighlighted(-1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchSuggestions(v), 300);
  };

  const select = (s: Suggestion) => {
    onChange(s.title);
    setSuggestions([]);
    setOpen(false);
    setHighlighted(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      select(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        className={`pl-12 h-14 rounded-2xl border-gray-200`}
        autoComplete="off"
      />
      {open && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Searching…
            </div>
          ) : (
            suggestions.map((s, idx) => (
              <button
                key={s._id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(s); }}
                onMouseEnter={() => setHighlighted(idx)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${highlighted === idx
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-50 text-gray-800"
                  }`}
              >
                <Building2 className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="flex-1 font-medium truncate">{s.title}</span>
                {s.locationTitle && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                    <MapPin className="w-3 h-3" />
                    {s.locationTitle}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Simple in-memory cache for search results (cleared on page refresh)
  const searchCacheRef = useState(
    () => new Map<string, { properties: any[]; totalPages: number }>()
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

  // Fetch properties from API
  const fetchProperties = async () => {
    try {
      // Build query params for API
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (selectedLocation) params.append("locationId", selectedLocation);
      if (selectedCategory) params.append("category", selectedCategory);
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
        return;
      }

      setIsLoading(true);

      const response = await instance.get(`/property?${params.toString()}`);
      const fetchedProperties = response.data.properties;
      const fetchedTotalPages = response.data.totalpages || 1;

      // Update state
      setProperties(fetchedProperties);
      setTotalPages(fetchedTotalPages);

      // Save to cache
      searchCacheRef.set(cacheKey, {
        properties: fetchedProperties,
        totalPages: fetchedTotalPages,
      });

      console.log(response.data.properties);

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

  console.log(properties)

  // Initialize from URL params only once when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !isInitialized) {
      const locationId = searchParams.get("locationId") || "";
      const locationName = searchParams.get("location") || "";

      // If locationId is provided, use it directly
      if (locationId) {
        setSelectedLocation(locationId);
      }
      // If only location name is provided, try to find matching location ID
      else if (locationName) {
        const matchedLocation = locations.find(
          (loc) => loc.title.toLowerCase() === locationName.toLowerCase()
        );
        if (matchedLocation) {
          setSelectedLocation(matchedLocation._id);
        }
      }

      setIsInitialized(true);
    }
  }, [locations, searchParams, isInitialized]);

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
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedCategory("");
    setSelectedPropertyType("");
    setSelectedPropertyTypeCategory("");
    setMinPrice("");
    setMaxPrice("");
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
    instance.get("/category").then((res) => setCategories(res.data.data || [])).catch(() => { });
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="absolute hidden md:flex inset-0 z-0">
        <BackgroundDotPattern />
      </div>

      <Navbar />

      <section className="max-w-7xl mx-auto py-7 px-5 flex flex-col gap-5 relative z-10">
        {/* Search and Filter Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
          {/* Desktop Filters */}
          <div className="hidden md:flex flex-col gap-4">
            {/* Top row: Search + Location */}
            <div className="flex gap-3">
              {/* Search Input with auto-suggestions */}
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for PG, Hostels, Apartments..."
                className="flex-1"
                selectedLocationId={selectedLocation}
                locations={locations}
              />

              {/* Location Select */}
              <div className="w-64 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row: Other filters + Search button */}
            <div className="flex gap-3 items-center flex-wrap">
              {/* Categories Grouped by Transaction Type */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-4 items-center">
                  {transactionTypes.map((tx) => (
                    <div key={tx._id} className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">
                        {tx.name}
                      </span>
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
                              className="rounded-full h-8 px-3"
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

                  {/* General Category Selection (when no transaction type is selected or for all) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">
                      All Categories
                    </span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                      }}
                      className="h-8 px-2 rounded-full border border-gray-200 bg-white text-xs focus:outline-none"
                    >
                      <option value="">Any</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tenant Type Chips (Male, Female, etc.) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-500 mr-1">For:</span>
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
                    className="h-8 rounded-full px-4 text-xs"
                  >
                    {type.name}
                  </Button>
                ))}
              </div>

              {/* Price Min/Max */}
              <div className="w-40">
                <Input
                  type="number"
                  min={0}
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-14 rounded-2xl border-gray-200"
                />
              </div>
              <div className="w-40">
                <Input
                  type="number"
                  min={0}
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-14 rounded-2xl border-gray-200"
                />
              </div>

              {/* Clear Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  disabled={isLoading}
                  className="h-14 w-14 rounded-2xl hover:bg-red-50 hover:text-red-600"
                  title="Clear all filters"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}

              {/* Search Button removed: auto-fetch on change */}
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

            {/* Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
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

            {/* Mobile Filter Panel */}
            {showMobileFilters && (
              <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    >
                      <option value="">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Property Type Grouped Categories */}
                <div className="flex flex-col gap-4">
                  {transactionTypes.map((tx) => (
                    <div key={tx._id} className="flex flex-col gap-2">
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
                              className="rounded-full h-8 px-3 text-xs"
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
                  <label className="block text-sm font-medium mb-2">
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
                        className="h-9 rounded-full px-4 text-xs"
                      >
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="rounded-2xl border-gray-200"
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="rounded-2xl border-gray-200"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={isLoading}
                    className="w-full rounded-2xl text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  {/* Search button removed on mobile: auto-fetch on change */}
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Loading State */}
        {isLoading ? (
          <>
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-gray-600">
              Found{" "}
              <span className="font-semibold text-gray-900">
                {properties.length}
              </span>{" "}
              {properties.length === 1 ? "property" : "properties"}
            </p>

            {/* Property Grid or Empty State */}
            {properties.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {properties.map((property) => (
                    <Link key={property._id} to={`/property/${property._id}`}>
                      <PropertyCard {...property} />
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-10 w-10 rounded-full"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`h-10 w-10 rounded-full ${currentPage === page ? "pointer-events-none" : ""
                              }`}
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-10 w-10 rounded-full"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
    </div>
  );
}
