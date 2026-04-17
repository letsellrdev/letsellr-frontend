import { MapPin, Search, Building2, Clock, LayoutGrid, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCallback, useEffect, useState } from "react";
import instance from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getDistanceKM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationItem {
  _id: string;
  title: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  propertyCount?: number;
}

interface PropertySuggestion {
  _id: string;
  title: string;
  locationTitle?: string;
  price?: number;
  propertyType?: string;
}

interface NearbyLocation extends LocationItem {
  distance: number;
  isGoogle?: boolean;
  googlePlaceId?: string;
}

interface SearchBarProps {
  propertyType: string;
  onPropertyTypeChange: (type: string) => void;
  location: string;
  onLocationChange: (locationId: string) => void;
  heroMode?: boolean;
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { type: "rent", label: "Rent", active: true },
  { type: "buy", label: "Buy", active: false },
  { type: "lease", label: "Lease", active: false },
] as const;

// ─── SearchBar ────────────────────────────────────────────────────────────────
export const SearchBar = ({
  propertyType,
  onPropertyTypeChange,
  location,
  onLocationChange,
  heroMode = false,
}: SearchBarProps) => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocationName, setSelectedLocationName] = useState("");

  const [query, setQuery] = useState("");

  // Suggestions
  const [locSuggestions, setLocSuggestions] = useState<LocationItem[]>([]);
  const [nearbySuggestions] = useState<NearbyLocation[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [propSuggestions, setPropSuggestions] = useState<PropertySuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [googleLocSuggestions, setGoogleLocSuggestions] = useState<NearbyLocation[]>([]);

  // Filtered categories based on query in step 2
  const filteredCategories = step === 2 && query.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : categories;

  // ─── Priorities ────────────────────────────────────────────────────────────
  const PRIORITIZED_LOCATIONS = [
    "calicut town",
    "thondayad",
    "palazhi",
    "mankave",
    "nadakkave",
  ];

  // ── Fetch locations on mount ───────────────────────────────────────────────
  useEffect(() => {
    instance
      .get("/location")
      .then((res) => {
        const data: LocationItem[] = res.data.data || [];

        // Sort locations based on priorities
        const sortedData = [...data].sort((a, b) => {
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();

          const indexA = PRIORITIZED_LOCATIONS.indexOf(titleA);
          const indexB = PRIORITIZED_LOCATIONS.indexOf(titleB);

          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;

          return titleA.localeCompare(titleB);
        });

        setLocations(sortedData);
        // Default suggestions when opening step 1
        setLocSuggestions(sortedData.slice(0, 5));
      })
      .catch(() => setLocations([]));
  }, []);

  // ── Sync if external location cleared ─────────────────────────────────────
  useEffect(() => {
    if (!location) {
      setSelectedLocationId("");
      setSelectedLocationName("");
      setStep(1);
      setCategories([]);
      setLocSuggestions(locations.slice(0, 5));
    }
  }, [location, locations]);

  // Handle global keyboard shortcut (⌘/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // ── Geolocation ────────────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsLocating(false);
        // Fetch nearby locations from our backend
        instance.get(`/location/google/nearby?lat=${coords.lat}&lng=${coords.lng}`)
          .then(res => {
            if (res.data.success) {
              const formatted: NearbyLocation[] = res.data.data.map((p: any) => {
                const pLat = p.geometry.location.lat;
                const pLng = p.geometry.location.lng;
                // Calculate distance manually on frontend for accuracy
                const dist = getDistanceKM(coords.lat, coords.lng, pLat, pLng);
                
                return {
                  _id: p.place_id,
                  title: p.name,
                  distance: dist,
                  isGoogle: true,
                  googlePlaceId: p.place_id
                };
              });
              setGoogleLocSuggestions(formatted.sort((a, b) => a.distance - b.distance));

            }
          })
          .catch(() => {});
      },
      () => {
        setIsLocating(false);
      }
    );
  }, []);

  useEffect(() => {
    if (open && step === 1 && !userCoords) {
      requestLocation();
    }
  }, [open, step, userCoords, requestLocation]);

  // Handle backspace to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we are in step 2, the search input is focused, the query is empty, and user presses Backspace
      if (open && step === 2 && e.key === "Backspace" && query === "") {
        e.preventDefault();
        setStep(1);
        setSelectedLocationId("");
        setSelectedLocationName("");
        onLocationChange("");
        setCategories([]);
        // Keep property results or clear them if you prefer.
        setLocSuggestions(locations.slice(0, 5));
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, step, query, locations, onLocationChange]);

  // ── Main search function ───────────────────────────────────────────────────
  const runSearch = useCallback(
    async (q: string, currentStep: number, locId: string) => {
      const trimmed = q.trim();

      // In step 1 — filter locations locally
      if (currentStep === 1) {
        const matchedLocs = trimmed
          ? locations.filter((l) =>
            l.title.toLowerCase().includes(trimmed.toLowerCase())
          )
          : locations; // Show all (up to 5) when empty
        setLocSuggestions(matchedLocs.slice(0, 5));

        // Fetch Google Autocomplete if typing and few local results
        if (trimmed.length > 2) {
          instance.get(`/location/google/autocomplete?query=${trimmed}`)
            .then(res => {
              if (res.data.success) {
                const googleResults: NearbyLocation[] = res.data.predictions.map((p: any) => ({
                  _id: p.place_id,
                  title: p.structured_formatting?.main_text || p.description,
                  distance: 0,
                  isGoogle: true,
                  googlePlaceId: p.place_id
                }));
                setGoogleLocSuggestions(googleResults);
              }
            })
            .catch(() => {});
        } else if (!trimmed) {
          // If empty query, keep the ones from nearby search (if any)
          // or reset if you prefer.
        }
      } else {
        setLocSuggestions([]);
        setGoogleLocSuggestions([]);
      }

      // Always fetch properties when there's a query
      if (trimmed.length >= 1) {
        setIsFetching(true);
        try {
          const params = new URLSearchParams({
            query: trimmed,
            limit: "10",
          });
          if (locId) params.append("locationId", locId);
          const res = await instance.get(`/property?${params.toString()}`);
          const props: any[] = res.data.properties || [];
          setPropSuggestions(
            props.map((p) => ({
              _id: p._id,
              title: p.title ?? "",
              locationTitle:
                typeof p.location === "object"
                  ? p.location?.title
                  : locations.find((l) => l._id === p.location)?.title ?? "",
              price: p.price?.[0]?.amount,
              propertyType: p.propertyType,
            }))
          );
        } catch {
          setPropSuggestions([]);
        } finally {
          setIsFetching(false);
        }
      } else {
        setPropSuggestions([]);
      }
    },
    [locations]
  );

  // ── Fetch categories for selected location ─────────────────────────────────
  const fetchCategoriesForLocation = async (locId: string) => {
    setIsFetchingCategories(true);
    setCategories([]);
    try {
      const res = await instance.get(`/category?locationId=${locId}`);
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    } finally {
      setIsFetchingCategories(false);
    }
  };

  // ── Selection: Location → advance to step 2 ────────────────────────────────
  const selectLocation = async (loc: LocationItem | NearbyLocation) => {
    let finalId = loc._id;
    let finalTitle = loc.title;

    // IF it's a google result, integrate it first
    if ("isGoogle" in loc && loc.isGoogle) {
      setIsFetchingCategories(true);
      try {
        const res = await instance.post("/location/integrate", {
          placeId: loc.googlePlaceId,
          title: loc.title
        });
        finalId = res.data.data._id;
        finalTitle = res.data.data.title;
      } catch (err) {
        console.error("Integration failed", err);
        setIsFetchingCategories(false);
        return;
      }
    }

    setSelectedLocationId(finalId);
    setSelectedLocationName(finalTitle);
    onLocationChange(finalId);
    setQuery("");
    setLocSuggestions([]);
    setGoogleLocSuggestions([]);
    setPropSuggestions([]);
    setStep(2);
    fetchCategoriesForLocation(finalId);
  };

  // ── Selection: Category → navigate ────────────────────────────────────────
  const selectCategory = (cat: CategoryItem) => {
    const params = new URLSearchParams({ propertyType: propertyType || "rent" });
    if (selectedLocationId) params.set("locationId", selectedLocationId);
    params.set("category", cat._id);
    setOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  // ── Selection: Property → detail page ─────────────────────────────────────
  const selectProperty = (p: PropertySuggestion) => {
    setOpen(false);
    navigate(`/property/${p._id}`);
  };

  // ── General search ─────────────────────────────────────────────────────────
  const handleSearch = () => {
    const params = new URLSearchParams({ propertyType: propertyType || "rent" });
    if (query.trim()) params.set("query", query.trim());
    if (selectedLocationId) params.set("locationId", selectedLocationId);
    setOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className={heroMode ? "w-full" : "w-full max-w-3xl mx-auto px-4 pt-6 flex flex-col gap-4"}>
      {/* ── Property Type Tabs (only in normal mode) ── */}
      {!heroMode && (
        <div className="flex w-full justify-center gap-2 md:gap-3">
          {TABS.map(({ type, label, active }) =>
            active ? (
              <Button
                key={type}
                size="sm"
                variant={propertyType === type ? "default" : "outline"}
                className="rounded-[10px] h-8 md:h-9 px-4 md:px-6 text-xs md:text-sm capitalize transition-all"
                onClick={() => onPropertyTypeChange(type)}
              >
                {label}
              </Button>
            ) : (
              <div key={type} className="relative group">
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="rounded-[10px] h-8 md:h-9 px-3 md:px-5 text-xs md:text-sm capitalize opacity-50 cursor-not-allowed gap-1.5"
                >
                  {label}
                  <span className="inline-flex items-center gap-0.5 bg-amber-100/50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide leading-none">
                    <Clock className="w-2.5 h-2.5" />
                    Soon
                  </span>
                </Button>
              </div>
            )
          )}
        </div>
      )}

      {/* ── Hero Mode Glassmorphic Trigger ── */}
      {heroMode ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full group flex items-center gap-0 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/35 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 overflow-hidden active:scale-[0.99]"
        >
          {/* Query segment */}
          <div className="flex-1 flex items-center gap-3 px-5 py-4 border-r border-white/15">
            <Search className="w-4 h-4 text-white/70 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-medium">
                {step === 2 ? "Now browse" : "What"}
              </p>
              <p className="text-sm text-white/90 font-medium truncate">
                {step === 2
                  ? "Pick a category below"
                  : "Properties, landmarks..."}
              </p>
            </div>
          </div>

          {/* Location segment */}


          {/* Search button */}
          <div className="shrink-0 m-2">
            <div className="bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-200">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </div>
          </div>
        </button>
      ) : (
        /* ── Normal Mode Trigger ── */
        <div className="relative group max-w-2xl mx-auto w-full px-2">
          {/* Subtle background glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-[2rem] blur-sm opacity-0 group-hover:opacity-100 transition duration-500 cursor-pointer" />

          <button
            onClick={() => setOpen(true)}
            className="relative w-full bg-gradient-soft hover:bg-gray-200/60 dark:hover:bg-secondary/30 backdrop-blur-sm border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 rounded-[1.5rem] p-2 pl-4 md:p-3 md:pl-6 flex items-center justify-between gap-4 transition-all duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-[0.985]"
          >
            {/* Left Side: Icon + Text */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="shrink-0 flex items-center justify-center">
                <Search className="h-4.5 w-4.5 group-hover:text-primary transition-all duration-300" />
              </div>

              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm md:text-base font-semibold text-foreground/80 group-hover:text-foreground transition-colors truncate">
                  {step === 2 && selectedLocationName ? (
                    <span className="flex items-center gap-1.5">
                      Searching in <span className="text-primary">{selectedLocationName}</span>
                    </span>
                  ) : (
                    null
                  )}
                </span>
                <span className="text-[11px] text-gray-500 text-medium md:text-[14px] truncate transition-colors ">
                  {step === 2
                    ? "Browse categories"
                    : "Search landmark or properties"}
                </span>
              </div>
            </div>

            {/* Right Side: Desktop Shortcuts & Mobile Indicator */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Desktop Shortcuts */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-9 w-9 bg-primary/90 rounded-full flex items-center justify-center shadow-md shadow-primary/10 group-hover:bg-primary transition-colors">
                  <CornerDownLeft className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Mobile Indicator */}
              <div className="sm:hidden h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-sm:h-screen max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 [&>button]:hidden max-w-2xl border border-border/60 shadow-2xl rounded-2xl bg-background sm:bg-background/95 sm:backdrop-blur-xl transition-all duration-300">
          <Command
            shouldFilter={false} // Disable internal filtering, we filter/sort locally + API
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 sm:[&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-4 sm:[&_[cmdk-item]]:px-2 sm:[&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 bg-transparent"
          >
            <CommandInput
              value={query}
              onValueChange={(val) => {
                setQuery(val);
                runSearch(val, step, selectedLocationId);
              }}
              onBack={step === 2 ? () => {
                setStep(1);
                setSelectedLocationId("");
                setSelectedLocationName("");
                onLocationChange("");
                setCategories([]);
                setLocSuggestions(locations.slice(0, 5));
              } : undefined}
              onClose={() => setOpen(false)}
              placeholder={
                step === 1
                  ? "Search city..."
                  : "Search properties..."
              }
              className="border-0 focus:ring-0 text-base h-11"
              wrapperPrefix={
                <AnimatePresence>
                  {step === 2 && selectedLocationName && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, width: 0 }}
                      animate={{ opacity: 1, scale: 1, width: "auto" }}
                      exit={{ opacity: 0, scale: 0.9, width: 0 }}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ml-2 mr-3 overflow-hidden"
                    >
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="whitespace-nowrap">{selectedLocationName}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              }
            />

            <CommandList className="max-h-[calc(100vh-140px)] sm:max-h-[400px]">
              {(isFetching || isFetchingCategories) && (
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  {isFetchingCategories ? "Loading categories..." : "Searching properties..."}
                </div>
              )}

              {/* No Results Empty State */}
              {!isFetching && !isFetchingCategories && locSuggestions.length === 0 && googleLocSuggestions.length === 0 && filteredCategories.length === 0 && propSuggestions.length === 0 && query.trim() !== "" && (
                <CommandEmpty>No results found for &quot;{query}&quot;.</CommandEmpty>
              )}

              {/* ── STEP 1: Geolocation / Nearby ── */}
              {step === 1 && !query && googleLocSuggestions.length > 0 && (
                <CommandGroup heading="Nearby Areas">
                  {googleLocSuggestions.map((loc) => (
                    <CommandItem
                      key={loc._id}
                      value={loc._id}
                      onSelect={() => selectLocation(loc)}
                      className="cursor-pointer"
                    >
                      <div className="bg-primary/10 p-1.5 rounded-md mr-3">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{loc.title}</span>
                        <span className="text-[10px] text-muted-foreground">{loc.distance.toFixed(1)} km away</span>
                      </div>

                      <CornerDownLeft className="w-3.5 h-3.5 opacity-40 ml-auto" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* ── STEP 1: Search results (Local + Google) ── */}
              {step === 1 && (locSuggestions.length > 0 || (query && googleLocSuggestions.length > 0)) && (
                <CommandGroup heading={query ? "Search Results" : "Locations"}>
                  {locSuggestions.map((loc) => (
                    <CommandItem
                      key={loc._id}
                      value={loc._id}
                      onSelect={() => selectLocation(loc)}
                      className="cursor-pointer"
                    >
                      <div className="bg-muted/50 p-1.5 rounded-md mr-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium flex-1">{loc.title}</span>
                      <CornerDownLeft className="w-3.5 h-3.5 opacity-40 ml-auto" />
                    </CommandItem>
                  ))}
                  {query && googleLocSuggestions.map((loc) => (
                    <CommandItem
                      key={loc._id}
                      value={loc._id}
                      onSelect={() => selectLocation(loc)}
                      className="cursor-pointer"
                    >
                      <div className="bg-primary/5 p-1.5 rounded-md mr-3 border border-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{loc.title}</span>
                        <span className="text-[9px] text-primary/70 font-semibold uppercase tracking-wider">New Area</span>
                      </div>
                      <CornerDownLeft className="w-3.5 h-3.5 opacity-40 ml-auto" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* ── STEP 2: Categories ── */}
              {step === 2 && !isFetchingCategories && (
                filteredCategories.length > 0 ? (
                  <CommandGroup heading={`${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} Categories`}>
                    {filteredCategories.map((cat) => (
                      <CommandItem
                        key={cat._id}
                        value={cat._id}
                        onSelect={() => selectCategory(cat)}
                        className="cursor-pointer"
                      >
                        <div className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
                          <LayoutGrid className="h-4 w-4" />
                        </div>
                        <span className="font-medium flex-1">{cat.name}</span>
                        {cat.propertyCount !== undefined && (
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/50">
                            {cat.propertyCount} listings
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  !isFetching && categories.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No categories found for this location.
                    </div>
                  )
                )
              )}

              {/* ── Grouped Properties ── */}
              {["rent", "buy", "lease"].map((type) => {
                const groupedProps = propSuggestions.filter(p => (p.propertyType ?? "rent").toLowerCase() === type);
                if (groupedProps.length === 0) return null;
                return (
                  <CommandGroup key={type} heading={`Properties for ${type.charAt(0).toUpperCase() + type.slice(1)}`}>
                    {groupedProps.map((p) => (
                      <CommandItem
                        key={p._id}
                        value={p._id}
                        onSelect={() => selectProperty(p)}
                        className="cursor-pointer"
                      >
                        <div className="bg-muted/50 p-1.5 rounded-md mr-3 overflow-hidden shrink-0">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col min-w-0 pr-4 flex-1">
                          <span className="font-medium truncate">{p.title}</span>
                          {p.locationTitle && (
                            <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {p.locationTitle}
                            </span>
                          )}
                        </div>
                        {p.price && (
                          <div className="font-semibold text-primary text-sm shrink-0 whitespace-nowrap ml-auto bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                            ₹{p.price.toLocaleString("en-IN")}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}

              {/* View all fallback */}
              {query.trim() && (
                <CommandGroup>
                  <CommandItem value="view-all" onSelect={() => handleSearch()} className="cursor-pointer text-primary">
                    <Search className=" h-4 w-4" />
                    <span className="font-medium">View all results for &quot;{query}&quot;</span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>

            {/* ── Command Footer / Shortcuts ── */}
            <div className="hidden sm:flex border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground items-center justify-between pointer-events-none">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-background border border-border/80 shadow-sm px-1.5 py-0.5 rounded font-sans text-[10px] uppercase font-semibold text-foreground">↑</kbd>
                  <kbd className="bg-background border border-border/80 shadow-sm px-1.5 py-0.5 rounded font-sans text-[10px] uppercase font-semibold text-foreground">↓</kbd>
                  <span className="opacity-80">Navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-background border border-border/80 shadow-sm px-1.5 py-0.5 rounded font-sans text-[10px] uppercase font-semibold text-foreground">↵</kbd>
                  <span className="opacity-80">Select</span>
                </span>
                {step === 2 && (
                  <span className="flex items-center gap-1.5">
                    <kbd className="bg-background border border-border/80 shadow-sm px-1.5 py-0.5 rounded font-sans text-[10px] uppercase font-semibold text-foreground">⌫</kbd>
                    <span className="opacity-80">Go back</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-background border border-border/80 shadow-sm px-1.5 py-0.5 rounded font-sans text-[10px] uppercase font-semibold text-foreground">esc</kbd>
                  <span className="opacity-80">Close</span>
                </span>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
};