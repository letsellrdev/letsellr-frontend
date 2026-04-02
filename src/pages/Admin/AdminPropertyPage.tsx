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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { toast } from "sonner";

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

interface PropertyFormData extends Partial<Property> {
  newImages?: File[]; // 👈 for newly uploaded images
}
// Constants
// Note: categories are fetched from the API at runtime

const INITIAL_FORM_STATE: PropertyFormData = {
  title: "",
  description: "",
  images: [],
  category: { _id: "", name: "" },
  amenity: "",
  price: [{ type: "", amount: 0 }],
  location: "", // Location ID
  contactNumber: "",
  propertyType: "buy",
  status: "active",
  propertyTypeCategory: "",
  vacancyCount: 0,
  vacancies: [],
};

// Property Form Component
const PropertyForm = ({
  formData,
  onChange,
  onPriceChange,
  onAddPrice,
  onRemovePrice,
  onFileChange,
  onSubmit,
  onCancel,
  onRemoveImage,
  onRemoveNewImage,
  onVacancyChange,
  onAddVacancy,
  onRemoveVacancy,
  isSubmitting,
  isEditing,
  formErrors,
  titleRef,
  descriptionRef,
  categoryRef,
  priceRef,
  locationRef,
  amenityRef,
  contactRef,
  imagesRef,
  setFormData,
  notification,
  locations,
  propertyTypes,
  apiCategories,
}: {
  formData: PropertyFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onPriceChange: (
    index: number,
    field: keyof PriceOption,
    value: string | number
  ) => void;
  onAddPrice: () => void;
  onRemovePrice: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onFileChange: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onVacancyChange: (
    index: number,
    field: keyof Vacancy,
    value: string | number
  ) => void;
  onAddVacancy: () => void;
  onRemoveVacancy: (index: number) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  formErrors: { [key: string]: string };
  titleRef: React.RefObject<HTMLInputElement>;
  descriptionRef: React.RefObject<HTMLTextAreaElement>;
  categoryRef: React.RefObject<HTMLSelectElement>;
  priceRef: React.RefObject<HTMLDivElement>;
  locationRef: React.RefObject<HTMLSelectElement>;
  amenityRef: React.RefObject<HTMLInputElement>;
  contactRef: React.RefObject<HTMLInputElement>;
  imagesRef: React.RefObject<HTMLInputElement>;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  notification: string;
  locations: Location[];
  propertyTypes: PropertyType[];
  apiCategories: { _id: string; name: string }[];
}) => (
  <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
    {/* Property Code - Only show for editing existing properties */}
    {
      <div>
        <label className="block text-sm font-medium mb-2">Property Code</label>
        <Input
          name="propertyCode"
          value={formData.propertyCode}
          onChange={onChange}
          placeholder="4-5 digit code"
          className="rounded-xl"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can update this code. must be unique.
        </p>
      </div>
    }

    <div>
      <label className="block text-sm font-medium mb-2">Title *</label>
      <Input
        ref={titleRef}
        name="title"
        value={formData.title}
        onChange={onChange}
        placeholder="Property title"
        className="rounded-xl"
      />
      {formErrors.title && (
        <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Description *</label>
      <textarea
        ref={descriptionRef}
        name="description"
        value={formData.description}
        onChange={onChange}
        placeholder="Property description"
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {formErrors.description && (
        <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Category *</label>
      <select
        ref={categoryRef}
        name="category"
        value={formData.category?._id}
        onChange={(e) => {
          const selected = apiCategories.find((c) => c._id === e.target.value);
          setFormData({
            ...formData,
            category: selected || { _id: "", name: "" },
          });
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">Select category</option>
        {apiCategories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {formErrors.category && (
        <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
      )}
    </div>

    <div ref={priceRef}>
      <label className="block text-sm font-medium mb-2">Price Options *</label>
      {formData.price?.map((p, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          <Input
            placeholder="Type (e.g., Single Room)"
            value={p.type}
            onChange={(e) => onPriceChange(idx, "type", e.target.value)}
            className="rounded-xl flex-1"
          />
          <Input
            placeholder="Amount"
            type="number"
            value={p.amount === 0 ? "" : p.amount}
            onChange={(e) =>
              onPriceChange(
                idx,
                "amount",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="rounded-xl w-24"
          />

          {formData.price.length > 1 && (
            <Button
              variant="outline"
              className="px-2"
              onClick={() => onRemovePrice(idx)}
            >
              -
            </Button>
          )}
        </div>
      ))}
      {formErrors.price && (
        <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
      )}
      <Button variant="outline" size="sm" onClick={onAddPrice}>
        Add Price Option
      </Button>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Location *</label>
      <select
        ref={locationRef}
        name="location"
        value={
          typeof formData.location === "string"
            ? formData.location
            : (formData.location as Location)?._id || ""
        }
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">Select location</option>
        {locations.map((location) => (
          <option key={location._id} value={location._id}>
            {location.title}
          </option>
        ))}
      </select>
      {formErrors.location && (
        <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">
        Amenities (comma separated) *
      </label>
      <Input
        ref={amenityRef}
        name="amenity"
        value={formData.amenity}
        onChange={onChange}
        placeholder="WiFi, AC, Parking"
        className="rounded-xl"
      />
      {formErrors.amenity && (
        <p className="text-red-500 text-xs mt-1">{formErrors.amenity}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Contact Number *</label>
      <Input
        ref={contactRef}
        name="contactNumber"
        value={formData.contactNumber}
        onChange={onChange}
        placeholder="9876543210"
        className="rounded-xl"
      />
      {formErrors.contactNumber && (
        <p className="text-red-500 text-xs mt-1">{formErrors.contactNumber}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Vacancies</label>
      {formData.vacancies?.map((v, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          <Input
            placeholder="Type (e.g., Girls Room)"
            value={v.type}
            onChange={(e) => onVacancyChange(idx, "type", e.target.value)}
            className="rounded-xl flex-1"
          />
          <Input
            placeholder="Count"
            type="number"
            min="0"
            value={v.count === 0 ? "" : v.count}
            onChange={(e) =>
              onVacancyChange(
                idx,
                "count",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
            className="rounded-xl w-24"
          />
          <Button
            variant="outline"
            className="px-2"
            onClick={() => onRemoveVacancy(idx)}
          >
            -
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddVacancy}
        className="mb-2"
      >
        Add Vacancy Detail
      </Button>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">
          Total Vacancy Count:
        </label>
        <Input
          name="vacancyCount"
          type="number"
          min="0"
          value={formData.vacancyCount ?? 0}
          onChange={onChange}
          placeholder="Total vacancies"
          className="rounded-xl w-32"
          disabled={formData.vacancies && formData.vacancies.length > 0}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {formData.vacancies && formData.vacancies.length > 0
          ? "Total count is automatically calculated from details."
          : "Enter the total number of available vacancies."}
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Property Type *</label>
      <select
        name="propertyType"
        value={formData.propertyType}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="buy">Buy</option>
        <option value="rent">Rent</option>
        <option value="lease">Lease</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">
        Property Type Category
      </label>
      <select
        name="propertyTypeCategory"
        value={
          typeof formData.propertyTypeCategory === "string"
            ? formData.propertyTypeCategory
            : (formData.propertyTypeCategory as PropertyType)?._id || ""
        }
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">Select property type category</option>
        {propertyTypes.map((type) => (
          <option key={type._id} value={type._id}>
            {type.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      {/* <label className="block text-sm font-medium mb-2">Status *</label>
      <select
        name="status"
        value={formData.status || "active"}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      /> */}

      <label className="block text-sm font-medium mb-2">
        Property Images *
      </label>
      <input
        ref={imagesRef}
        type="file"
        name="newImages"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (!e.target.files) return;
          onFileChange(Array.from(e.target.files));
          e.target.value = "";
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {formErrors.images && (
        <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>
      )}

      {/* Already uploaded images */}
      {formData.images?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.images.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`existing-${index}`}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold hover:bg-red-600"
                onClick={() => onRemoveImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Newly selected images */}
      {formData.newImages?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.newImages.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`new-${index}`}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold hover:bg-red-600"
                onClick={() => onRemoveNewImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="flex-1 rounded-xl"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        className="flex-1 rounded-xl"
        disabled={isSubmitting}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
      </Button>
    </div>
  </div>
);

// Property Card Component
const PropertyCard = ({
  property,
  onEdit,
  onDelete,
}: {
  property: Property;
  onEdit: (property: Property, mobile?: boolean) => void;
  onDelete: (property: Property) => void;
}) => {
  // Safe access to first image
  const firstImage = property.images?.[0] || "/placeholder.jpg";
  // Safe access to first price
  const firstPrice = property.price?.[0]?.amount;

  return (
    <Card className="p-4 sm:p-5 border-border hover:shadow-lg transition-shadow relative flex flex-col justify-between">
      <div className="flex gap-3 sm:gap-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <img
            src={firstImage}
            alt={property.title || "Property Image"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">
                {property.title || "Untitled"}
              </h3>
            </div>
            {property.status && (
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${property.status === "active"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-600"
                  }`}
              >
                {property.status}
              </span>
            )}
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate font-medium">
                {typeof property.location === "string"
                  ? "No location"
                  : (property.location as Location)?.title || "No location"}
              </span>
              {typeof property.location !== "string" &&
                (property.location as Location)?.description && (
                  <p className="text-xs text-muted-foreground/70 line-clamp-1">
                    {(property.location as Location)?.description}
                  </p>
                )}
            </div>
            <div className="absolute top-4 right-4 flex flex-row-reverse items-center gap-2">
              {/* Property Type Category Badge */}
              {property.propertyTypeCategory &&
                typeof property.propertyTypeCategory !== "string" && (
                  <div className="">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {(property.propertyTypeCategory as PropertyType).name}
                    </span>
                  </div>
                )}
              {/* Vacancy Count Badge */}
              {property.vacancyCount !== undefined && (
                <div className="flex items-center">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${property.vacancyCount > 0
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                  >
                    {property.vacancyCount > 0
                      ? `${property.vacancyCount} Vacancies`
                      : "No Vacancies"}
                  </span>
                </div>
              )}
              {property.propertyCode && (
                <span className="text-xs text-gray-500 font-mono">
                  Code: {property.propertyCode}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
            {property.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{property.views}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-primary" />
              <span>{property.rating || 0}</span>
            </div>

            {/* Display prices */}
            {property.price && property.price.length > 0 && (
              <div className="flex flex-col gap-1 mb-3">
                {property.price?.slice(0, 2).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-primary font-semibold"
                  >
                    <span>{p.type || "Room"}:</span>
                    <span>₹{p.amount} /Month</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="hidden md:flex rounded-lg flex-1 hover:bg-primary/5 hover:text-primary hover:border-primary text-xs sm:text-sm"
          onClick={() => onEdit(property)}
        >
          <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="md:hidden flex-1 rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary text-xs sm:text-sm"
          onClick={() => onEdit(property, true)}
        >
          <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <Link to={`/property/${property._id}`} className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary text-xs sm:text-sm"
          >
            <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">View</span>
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-600 px-2 sm:px-3"
          onClick={() => onDelete(property)}
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </Card>
  );
};

// Main Admin Properties Page
const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] =
    useState<PropertyFormData>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [apiCategories, setApiCategories] = useState<{ _id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const itemsPerPage = 12;

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLSelectElement>(null);
  const amenityRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

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
    fetchLocations();
    fetchPropertyTypes();
    instance.get("/category").then((res) => setApiCategories(res.data.data || [])).catch(() => { });
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
      setPropertyTypes(res.data.data || []);
    } catch (error) {
      console.error("Error fetching property types:", error);
      setPropertyTypes([]);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setCurrentProperty(null);
  };

  const handleEdit = (property: Property, mobile = false) => {
    // Match the category from the live API categories list
    const category = apiCategories.find(
      (c) => c._id === property.category?._id
    ) || {
      _id: property.category?._id || "",
      name: property.category?.name || "",
    };

    setCurrentProperty(property);
    // Merge defaults so missing fields (gender, propertyType, status, etc.) get default values
    const merged: PropertyFormData = {
      ...INITIAL_FORM_STATE,
      ...property,
      category: property.category || INITIAL_FORM_STATE.category,
      location:
        typeof property.location === "string"
          ? property.location
          : (property.location as Location)?._id || "",
      propertyTypeCategory:
        typeof property.propertyTypeCategory === "string"
          ? property.propertyTypeCategory
          : (property.propertyTypeCategory as PropertyType)?._id || "",
      vacancies: property.vacancies || [],
    };
    setFormData(merged);
    setIsFormOpen(!mobile);
    setIsMobileFormOpen(mobile);
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.title?.trim()) errors.title = "Title is required";
    if (!formData.description?.trim())
      errors.description = "Description is required";
    if (!formData.category?._id) errors.category = "Category is required";
    if (
      !formData.price ||
      formData.price.length === 0 ||
      formData.price.every((p) => !p.amount)
    )
      errors.price = "At least one price is required";
    if (
      !formData.location ||
      (typeof formData.location === "string" && !formData.location.trim())
    )
      errors.location = "Location is required";
    if (!formData.amenity?.trim())
      errors.amenity = "At least one amenity is required";
    if (!formData.contactNumber?.trim())
      errors.contactNumber = "Contact number is required";
    if (
      (!formData.images || formData.images.length === 0) &&
      (!formData.newImages || formData.newImages.length === 0)
    ) {
      errors.images = "Please upload at least one image";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // returns true if valid
  };

  const handleFileChange = (files: File[]) => {
    setFormData((prev) => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...files],
    }));
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

      setNotification("Property deleted successfully!");
      toast.success("Property deleted successfully");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (files && name === "newImages") {
      // Convert FileList to File[]
      setFormData((prev) => ({
        ...prev,
        newImages: [...(prev.newImages || []), ...Array.from(files)],
      }));
    } else if (name === "category") {
      const category = apiCategories.find((c) => c._id === value);
      setFormData((prev) => ({
        ...prev,
        category: category || { _id: "", name: "" },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (
    index: number,
    field: keyof PriceOption,
    value: string | number
  ) => {
    const updatedPrices = [...(formData.price || [])];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    setFormData((prev) => ({ ...prev, price: updatedPrices }));
  };

  const addPriceOption = () => {
    setFormData((prev) => ({
      ...prev,
      price: [...(prev.price || []), { type: "", amount: 0 }],
    }));
  };

  const removePriceOption = (index: number) => {
    const updatedPrices = [...(formData.price || [])];
    updatedPrices.splice(index, 1);
    setFormData((prev) => ({ ...prev, price: updatedPrices }));
  };

  const handleRemoveNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages?.filter((_, i) => i !== index),
    }));
  };

  const handleVacancyChange = (
    index: number,
    field: keyof Vacancy,
    value: string | number
  ) => {
    const updatedVacancies = [...(formData.vacancies || [])];
    updatedVacancies[index] = { ...updatedVacancies[index], [field]: value };

    // Auto-calculate total vacancy count
    const totalCount = updatedVacancies.reduce(
      (sum, v) => sum + (Number(v.count) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      vacancies: updatedVacancies,
      vacancyCount: totalCount,
    }));
  };

  const addVacancy = () => {
    setFormData((prev) => ({
      ...prev,
      vacancies: [...(prev.vacancies || []), { type: "", count: 0 }],
    }));
  };

  const removeVacancy = (index: number) => {
    const updatedVacancies = [...(formData.vacancies || [])];
    updatedVacancies.splice(index, 1);

    // Recalculate total
    const totalCount = updatedVacancies.reduce(
      (sum, v) => sum + (Number(v.count) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      vacancies: updatedVacancies,
      vacancyCount:
        updatedVacancies.length > 0 ? totalCount : prev.vacancyCount, // Keep manual count if list becomes empty
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (formErrors.title && titleRef.current)
        titleRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (formErrors.description && descriptionRef.current)
        descriptionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (formErrors.category && categoryRef.current)
        categoryRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (formErrors.price && priceRef.current)
        priceRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (formErrors.location && locationRef.current)
        locationRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (formErrors.amenity && amenityRef.current)
        amenityRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (formErrors.contactNumber && contactRef.current)
        contactRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (formErrors.images && imagesRef.current)
        imagesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];

      // If new images are selected, upload them to S3 first
      if (formData.newImages && formData.newImages.length > 0) {
        const fileArray = formData.newImages; // already an array of Files

        // 1️⃣ Get signed URLs from backend
        const res = await instance.post("/property/upload-url", {
          files: fileArray.map((f) => ({ name: f.name, type: f.type })),
        });

        const signedUrls = res.data.urls; // Array of { uploadUrl, fileUrl, key }

        // 2️⃣ Upload files to S3 directly
        await Promise.all(
          fileArray.map((file, i) =>
            fetch(signedUrls[i].uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            })
          )
        );

        // 3️⃣ Extract actual file URLs
        imageUrls = signedUrls.map((item: any) => item.fileUrl);
      }

      // 4️⃣ Prepare payload
      const payload = {
        ...formData,
        category: formData.category?._id,
        price: formData.price?.filter((p) => p.amount > 0) || [],
        location:
          typeof formData.location === "string"
            ? formData.location
            : (formData.location as Location)?._id || "",
        propertyTypeCategory: (() => {
          const val =
            typeof formData.propertyTypeCategory === "string"
              ? formData.propertyTypeCategory
              : (formData.propertyTypeCategory as PropertyType)?._id || "";
          // Send undefined (omit) if empty so MongoDB doesn't try to cast "" to ObjectId
          return val.trim() ? val : undefined;
        })(),
        images: [...(formData.images || []), ...imageUrls], // merge old + new
      };

      let response;
      if (currentProperty) {
        await instance.put(`/property/${currentProperty._id}`, payload, {
          withCredentials: true,
        });
        // refetch all properties
        fetchProperties();
      } else {
        response = await instance.post("/property", payload, {
          withCredentials: true,
        });

        fetchProperties();
      }

      handleCloseForm();
    } catch (error) {
      console.error("Error saving property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsMobileFormOpen(false);
    setCurrentProperty(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg pointer-events-auto max-w-xs text-sm text-center animate-fade-in">
            {notification}
          </div>
        </div>
      )}

      {/* Header & Add Property */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Properties Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage all your property listings
          </p>
        </div>

        {/* Desktop Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild className="hidden md:flex">
            <Button
              className="rounded-xl bg-primary hover:bg-primary/90"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {currentProperty ? "Edit Property" : "Add New Property"}
              </DialogTitle>
            </DialogHeader>
            <PropertyForm
              formData={formData}
              onChange={handleInputChange}
              onPriceChange={handlePriceChange}
              onAddPrice={addPriceOption}
              onRemovePrice={removePriceOption}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              onRemoveImage={removeExistingImage}
              onRemoveNewImage={handleRemoveNewImage}
              onVacancyChange={handleVacancyChange}
              onAddVacancy={addVacancy}
              onRemoveVacancy={removeVacancy}
              isSubmitting={isSubmitting}
              isEditing={!!currentProperty}
              formErrors={formErrors}
              titleRef={titleRef}
              descriptionRef={descriptionRef}
              categoryRef={categoryRef}
              priceRef={priceRef}
              locationRef={locationRef}
              amenityRef={amenityRef}
              contactRef={contactRef}
              imagesRef={imagesRef}
              setFormData={setFormData}
              notification={notification || ""}
              locations={locations}
              propertyTypes={propertyTypes}
              apiCategories={apiCategories}
            />
          </DialogContent>
        </Dialog>

        {/* Mobile Drawer */}
        <Drawer open={isMobileFormOpen} onOpenChange={setIsMobileFormOpen}>
          <DrawerTrigger asChild className="md:hidden">
            <Button
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {currentProperty ? "Edit Property" : "Add New Property"}
              </DrawerTitle>
            </DrawerHeader>
            <PropertyForm
              formData={formData}
              setFormData={setFormData}
              onChange={handleInputChange}
              onPriceChange={handlePriceChange}
              onAddPrice={addPriceOption}
              onRemovePrice={removePriceOption}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              onRemoveImage={removeExistingImage}
              onRemoveNewImage={handleRemoveNewImage}
              onFileChange={handleFileChange}
              isSubmitting={isSubmitting}
              isEditing={!!currentProperty}
              formErrors={formErrors}
              titleRef={titleRef}
              descriptionRef={descriptionRef}
              categoryRef={categoryRef}
              priceRef={priceRef}
              locationRef={locationRef}
              amenityRef={amenityRef}
              contactRef={contactRef}
              imagesRef={imagesRef}
              notification={notification}
              locations={locations}
              propertyTypes={propertyTypes}
              onVacancyChange={handleVacancyChange}
              onAddVacancy={addVacancy}
              onRemoveVacancy={removeVacancy}
              apiCategories={apiCategories}
            />
          </DrawerContent>
        </Drawer>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by property code, title, or location..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to page 1 on search
          }}
          className="rounded-xl flex-1"
        />
        {searchQuery && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="rounded-xl"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center">
          <span className="text-muted-foreground">Total Properties</span>
          <span className="text-2xl font-bold">{totalProperties}</span>
        </Card>
        {/* <Card className="p-4 flex flex-col items-center">
          <span className="text-muted-foreground">Active</span>
          <span className="text-2xl font-bold">{stats.active}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center">
          <span className="text-muted-foreground">Inactive</span>
          <span className="text-2xl font-bold">{stats.inactive}</span>
        </Card> */}
      </div>

      {/* Property List */}
      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            ))}
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