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
}

interface SearchBarProps {
  propertyType: string;
  onPropertyTypeChange: (type: string) => void;
  location: string;
  onLocationChange: (locationId: string) => void;
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

  // Filtered categories based on query in step 2
  console.log(categories)
  const filteredCategories = step === 2 && query.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : categories;

  // ── Fetch locations on mount ───────────────────────────────────────────────
  useEffect(() => {
    instance
      .get("/location")
      .then((res) => {
        const data = res.data.data || [];
        setLocations(data);
        // Default suggestions when opening step 1
        setLocSuggestions(data.slice(0, 5));
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
      } else {
        setLocSuggestions([]);
      }

      // Hide nearby if typing
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
  const selectLocation = (loc: LocationItem) => {
    setSelectedLocationId(loc._id);
    setSelectedLocationName(loc.title);
    onLocationChange(loc._id);
    setQuery("");
    setLocSuggestions([]);
    setPropSuggestions([]);
    setStep(2);
    fetchCategoriesForLocation(loc._id);
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
    const params = new URLSearchParams({ propertyType: "rent" });
    if (query.trim()) params.set("query", query.trim());
    if (selectedLocationId) params.set("locationId", selectedLocationId);
    setOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-6 flex flex-col gap-4">
      {/* ── Property Type Tabs ── */}
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

      {/* ── Search Bar Trigger ── */}
      <div className="relative group perspective">
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-card hover:bg-card/90 border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-3 pl-4 flex items-center gap-3 transition-all duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="bg-primary/5 p-2 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Search className="h-4 w-4 text-primary" />
          </div>

          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground">
              {step === 2 && selectedLocationName ? `Searching in ${selectedLocationName}...` : "Find your next home..."}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full flex items-center gap-1.5">
              {step === 2 ? "Search for categories or properties" : "Search locations, builders, or properties"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-secondary/60 px-2 py-1.5 rounded-lg border border-border/50 shrink-0">
            <kbd className="font-sans text-[10px] font-medium text-muted-foreground">⌘</kbd>
            <kbd className="font-sans text-[10px] font-medium text-muted-foreground">K</kbd>
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-sm:h-screen max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 [&>button]:hidden max-w-2xl border border-border/60 shadow-2xl rounded-2xl bg-background sm:bg-background/95 sm:backdrop-blur-xl transition-all duration-300">
          <Command
            shouldFilter={false} // Disable internal filtering, we filter/sort locally + API
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 sm:[&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-4 sm:[&_[cmdk-item]]:px-2 sm:[&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 bg-transparent"
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
                  ? "Search city or area..."
                  : "Search categories or properties..."
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
              {!isFetching && !isFetchingCategories && locSuggestions.length === 0 && filteredCategories.length === 0 && propSuggestions.length === 0 && query.trim() !== "" && (
                <CommandEmpty>No results found for &quot;{query}&quot;.</CommandEmpty>
              )}

              {/* ── STEP 1: Locations ── */}
              {step === 1 && locSuggestions.length > 0 && (
                <CommandGroup heading="Locations">
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
                    <Search className="mr-3 h-4 w-4" />
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