import {
  MapPin,
  Eye,
  Star,
  Edit,
  Trash2,
  Plus,
  Save,
  LinkIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  MoreVertical,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import instance from "@/lib/axios";
import { PropertyCardSkeleton } from "@/components/skeletons";
import { toast } from "@/components/ui/sonner";
import AdminLoader from "@/components/AdminLoader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
interface PriceOption {
  type: string;
  amount: number;
}

interface Vacancy {
  type: string;
  count: number;
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

interface Property {
  _id: string;
  propertyCode?: string;
  title: string;
  description: string;
  images: string[];
  category: { _id: string; name: string };
  amenity: string;
  location: Location | string; // Can be populated object or just ID
  price: PriceOption[];
  rating?: number;
  contactNumber?: string;
  status?: string;
  views?: number;
  propertyType?: "buy" | "rent" | "lease";
  propertyTypeCategory?: PropertyType | string; // Can be populated object or just ID
  vacancyCount?: number;
  vacancies?: Vacancy[];
}



// Property Card Component
const PropertyCard = ({
  property,
  onDelete,
}: {
  property: Property;
  onDelete: (property: Property) => void;
}) => {
  const firstImage = property.images?.[0] || "/placeholder.jpg";
  
  return (
    <Card className="p-4 sm:p-5 border-border hover:shadow-lg transition-shadow flex flex-col gap-4 overflow-hidden">
      {/* Top Section: Image + Primary Info */}
      <div className="flex gap-4 items-start">
        {/* Image Container - Larger on Mobile, Standard on Desktop */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
          <img
            src={firstImage}
            alt={property.title || "Property Image"}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Primary Content Container */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Title & Status Row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight truncate">
              {property.title || "Untitled"}
            </h3>
            {property.status && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                  property.status === "active"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {property.status}
              </span>
            )}
          </div>

          {/* Metadata Badges Row (Replaces Absolute Positioning) */}
          <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
            {property.propertyCode && (
              <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                #{property.propertyCode}
              </span>
            )}
            {property.propertyTypeCategory && typeof property.propertyTypeCategory !== "string" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {(property.propertyTypeCategory as PropertyType).name}
              </span>
            )}
            {property.vacancyCount !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                  property.vacancyCount > 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {property.vacancyCount > 0
                  ? `${property.vacancyCount} Vacancies`
                  : "No Vacancy"}
              </span>
            )}
          </div>

          {/* Location Row */}
          <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate">
              {typeof property.location === "string"
                ? "No location"
                : (property.location as Location)?.title || "No location"}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Stats & Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-gray-50 bg-gray-50/30 -mx-4 sm:-mx-5 px-4 sm:px-5">
        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-blue-500" />
            <span>{property.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>{property.rating || 0} rating</span>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col gap-1">
          {property.price && property.price.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {property.price.slice(0, 2).map((p, idx) => (
                <div key={idx} className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span className="text-gray-400 font-normal uppercase text-[9px] tracking-tight">{p.type}:</span>
                  <span className="text-primary">₹{p.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">No pricing set</span>
          )}
        </div>
      </div>

      {/* Bottom Section: Actions */}
      <div className="flex gap-2 pt-1">
        <Link to={`/admin/properties/edit/${property._id}`} className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-xl h-9 text-xs sm:text-sm border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </Link>
        <Link to={`/property/${property._id}`} className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-xl h-9 text-xs sm:text-sm border-gray-200 hover:bg-primary transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl h-9 w-9 p-0 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
          onClick={() => onDelete(property)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

// Main Admin Properties Page
const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"grid" | "table">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const itemsPerPage = 12;


  // Simple in-memory cache for search results (cleared on page refresh)
  const searchCacheRef = useState(
    () =>
      new Map<
        string,
        { properties: Property[]; totalPages: number; totalProperties: number }
      >()
  )[0];

  // Fetch properties, locations, and property types
  useEffect(() => {
  }, []);

  // Fetch properties when page or search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [currentPage, searchQuery]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      if (searchQuery) params.append("query", searchQuery);

      // Create cache key from search parameters
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

      const res = await instance.get(`/property?${params.toString()}`, {
        withCredentials: true,
      });
      const data = Array.isArray(res.data.properties)
        ? res.data.properties
        : [];
      const fetchedTotalPages = res.data.totalpages || 1;
      const fetchedTotalProperties = res.data.totalproperty || 0;

      // Update state
      setProperties(data);
      setTotalPages(fetchedTotalPages);
      setTotalProperties(fetchedTotalProperties);

      // Save to cache
      searchCacheRef.set(cacheKey, {
        properties: data,
        totalPages: fetchedTotalPages,
        totalProperties: fetchedTotalProperties,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch properties");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };




  const handleDelete = (property: Property) => {
    setCurrentProperty(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentProperty) return;
    setIsSubmitting(true);

    try {
      await instance.delete(`/property/${currentProperty._id}`, {
        withCredentials: true,
      });

      // Remove from frontend state
      setProperties((prev) =>
        prev.filter((p) => p._id !== currentProperty._id)
      );
      setDeleteDialogOpen(false);
      setCurrentProperty(null);
      fetchProperties(); // Refetch to update pagination

      toast.success("Property deleted successfully");
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return <AdminLoader />;
  }

  return (
    <div className="space-y-6">

      {/* Header Section */}
      {/* Unified Control Header */}
      <div className=" p-4 sm:p-6 rounded-1xl border-1 border-gray-400  flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Title & Stats Summary */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Property Management</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary rounded-full font-medium">
              {totalProperties} Properties
            </span>
          </div>
        </div>

          <Link to="/admin/properties/add" className="hidden md:flex">
              <Button
                className="rounded-xl h-11 px-5 bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 font-bold"
              >
                <Plus className="h-5 w-5 mr-1" />
                Post Listing
              </Button>
            </Link>

            {/* Mobile Add Button */}
            <Link to="/admin/properties/add" className="md:hidden flex-1 flex">
              <Button
                className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-bold"
              >
                <Plus className="h-5 w-5 mr-1" />
                New Property
              </Button>
            </Link>

        {/* Action Toolbar */}
   
      </div>

         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 xl:justify-between">
          {/* Search Integrated */}
          <div className="relative group flex-1 max-w-md">
            <Input
              placeholder="search by title or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-11 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all"
            />
            <Search className="h-4.5 w-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as "grid" | "table")} className="hidden sm:block">
              <TabsList className="rounded-xl h-11 bg-gray-50/50 p-1 border border-gray-100">
                <TabsTrigger value="grid" className="rounded-lg px-4 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg px-4 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <List className="h-4 w-4 mr-2" />
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>

          </div>
        </div>

      {/* Property Display Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : currentView === "grid" ? (
        /* GRID VIEW */
        properties.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No properties found</h3>
            <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-1">
              We couldn't find any properties matching your search criteria.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="mt-6 rounded-xl border-gray-200 hover:bg-primary hover:text-white"
            >
              Clear all filters
            </Button>
          </div>
        )
      ) : (
        /* TABLE / MANAGEMENT VIEW */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {properties.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Property Detail</TableHead>
                        <TableHead className="hidden lg:table-cell">Location</TableHead>
                        <TableHead className="text-center">Stats</TableHead>
                        <TableHead>Price Info</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property._id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell>
                            <img
                              src={property.images?.[0] || "/placeholder.jpg"}
                              className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100"
                              alt=""
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-gray-900 line-clamp-1">{property.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded">#{property.propertyCode}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                              <span className="truncate max-w-[150px]">
                                {typeof property.location === "string" ? property.location : property.location?.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground font-medium">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5 text-blue-500" />
                                <span>{property.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                <span>{property.rating || 0}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              {property.price?.slice(0, 1).map((p, idx) => (
                                <span key={idx} className="text-xs font-bold text-gray-900 whitespace-nowrap">
                                  ₹{p.amount} <span className="text-[9px] text-gray-400 font-normal uppercase">{p.type}</span>
                                </span>
                              ))}
                              {property.price?.length > 1 && (
                                <span className="text-[9px] text-primary font-bold">+{property.price.length - 1} MORE</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100 p-1">
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2">
                                  <Link to={`/property/${property._id}`} className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" /> View Live Listing
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2 flex items-center gap-2">
                                  <Link to={`/admin/properties/edit/${property._id}`}>
                                    <Edit className="h-4 w-4" /> Edit Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(property)} className="rounded-lg cursor-pointer py-2 flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                                  <Trash2 className="h-4 w-4" /> Delete Property
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Management List View - Optimizes readability for small screens */}
              <div className="md:hidden divide-y divide-gray-50">
                {properties.map((property) => (
                  <div key={property._id} className="p-4 flex flex-col gap-3 active:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      <img
                        src={property.images?.[0] || "/placeholder.jpg"}
                        className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">
                            {property.title}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="h-8 w-8 p-0 rounded-lg flex-shrink-0 border-gray-100">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-2xl border-gray-100 p-1.5">
                              <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                                <Link to={`/property/${property._id}`} className="flex items-center gap-3">
                                  <Eye className="h-5 w-5 text-blue-500" /> View Live
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                                <Link to={`/admin/properties/edit/${property._id}`} className="flex items-center gap-3">
                                  <Edit className="h-5 w-5 text-amber-500" /> Edit Property
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(property)} className="rounded-xl py-3 cursor-pointer flex items-center gap-3 text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash2 className="h-5 w-5" /> Delete Property
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-gray-400">#{property.propertyCode}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            property.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {property.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-muted-foreground font-medium">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-blue-400" />
                          <span>{property.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span>{property.rating || 0}</span>
                        </div>
                      </div>
                      <div className="font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                        ₹{property.price?.[0]?.amount}<span className="text-[9px] font-normal text-gray-400 ml-0.5">/mo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No properties found</h3>
              <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-1">
                We couldn't find any properties matching your search criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="mt-6 rounded-xl border-gray-200 hover:bg-gray-50"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Optimized Smart Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <div className="text-xs text-muted-foreground font-medium sm:order-last">
            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl h-9 px-3 gap-1 border-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <Button key={1} variant="ghost" size="sm" onClick={() => handlePageChange(1)} className="h-9 w-9 rounded-xl hidden xs:flex">1</Button>
                  );
                  if (startPage > 2) pages.push(<span key="d1" className="px-1 text-gray-300">...</span>);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                      className={`h-9 w-9 rounded-xl font-bold ${currentPage === i ? "shadow-md shadow-primary/20" : "text-muted-foreground"}`}
                    >
                      {i}
                    </Button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) pages.push(<span key="d2" className="px-1 text-gray-300">...</span>);
                  pages.push(
                    <Button key={totalPages} variant="ghost" size="sm" onClick={() => handlePageChange(totalPages)} className="h-9 w-9 rounded-xl hidden xs:flex">{totalPages}</Button>
                  );
                }
                return pages;
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl h-9 px-3 gap-1 border-gray-200"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Alert */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this property?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPropertiesPage;