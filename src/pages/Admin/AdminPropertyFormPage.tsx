import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import instance from "@/lib/axios";
import axios from "axios";

// Copy types needed locally
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
}
interface PropertyType {
  _id: string;
  name: string;
}
interface Category {
  _id: string;
  name: string;
}
interface PropertyFormData {
  title: string;
  description: string;
  images: string[];
  newImages?: File[];
  category: { _id: string; name: string };
  amenity: string;
  price: PriceOption[];
  location: string;
  contactNumber: string;
  propertyType: "buy" | "rent" | "lease";
  status: string;
  propertyTypeCategory: string;
  propertyCode?: string;
  vacancyCount: number;
  vacancies: Vacancy[];
}

const INITIAL_FORM_STATE: PropertyFormData = {
  title: "",
  description: "",
  images: [],
  category: { _id: "", name: "" },
  amenity: "",
  price: [{ type: "", amount: 0 }],
  location: "",
  contactNumber: "",
  propertyType: "buy",
  status: "active",
  propertyTypeCategory: "",
  vacancyCount: 0,
  vacancies: [],
};

const FilePreview = ({ file }: { file: File }) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return <div className="w-full h-full bg-muted animate-pulse" />;

  return (
    <img
      src={url}
      alt="Property Preview"
      className="w-full h-full object-cover transition-opacity duration-300"
      onLoad={(e) => {
        (e.target as HTMLImageElement).style.opacity = "1";
      }}
      style={{ opacity: 0 }}
    />
  );
};

const AdminPropertyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [locations, setLocations] = useState<Location[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  // Initial Fetch
  useEffect(() => {
    fetchDropdownData();
    if (isEditing) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [locRes, typeRes, catRes] = await Promise.all([
        instance.get("/location"),
        instance.get("/propertytype"),
        instance.get("/category"),
      ]);
      setLocations(locRes.data.data || []);
      setPropertyTypes(typeRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load options");
    }
  };

  const fetchPropertyDetails = async () => {
    try {
      const res = await instance.get(`/property/${id}`);
      const prop = res.data.property;
      if (prop) {
        setFormData({
          title: prop.title || "",
          description: prop.description || "",
          images: prop.images || [],
          category: prop.category || { _id: "", name: "" },
          amenity: prop.amenity || "",
          price: prop.price?.length > 0 ? prop.price : [{ type: "", amount: 0 }],
          location: typeof prop.location === "string" ? prop.location : prop.location?._id || "",
          contactNumber: prop.contactNumber || "",
          propertyType: prop.propertyType || "buy",
          status: prop.status || "active",
          propertyTypeCategory: typeof prop.propertyTypeCategory === "string" ? prop.propertyTypeCategory : prop.propertyTypeCategory?._id || "",
          propertyCode: prop.propertyCode || "",
          vacancyCount: prop.vacancyCount || 0,
          vacancies: prop.vacancies || [],
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load property details");
      navigate("/admin/properties");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  // Pricing Handlers
  const handlePriceChange = (index: number, field: keyof PriceOption, value: string | number) => {
    const updatedPrices = [...formData.price];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    setFormData({ ...formData, price: updatedPrices });
    setFormErrors({ ...formErrors, price: "" });
  };
  const addPriceOption = () => setFormData({ ...formData, price: [...formData.price, { type: "", amount: 0 }] });
  const removePriceOption = (index: number) => {
    const newPrices = formData.price.filter((_, i) => i !== index);
    setFormData({ ...formData, price: newPrices.length > 0 ? newPrices : [{ type: "", amount: 0 }] });
  };

  // Vacancy Handlers
  const handleVacancyChange = (index: number, field: keyof Vacancy, value: string | number) => {
    const updatedVacancies = [...(formData.vacancies || [])];
    updatedVacancies[index] = { ...updatedVacancies[index], [field]: value };
    setFormData({ ...formData, vacancies: updatedVacancies });
  };
  const addVacancy = () => setFormData({ ...formData, vacancies: [...(formData.vacancies || []), { type: "", count: 0 }] });
  const removeVacancy = (index: number) => setFormData({ ...formData, vacancies: (formData.vacancies || []).filter((_, i) => i !== index) });

  // Image Handlers
  const addWatermark = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) return resolve(file); // Skip non-images
      
      const img = new window.Image();
      const watermark = new window.Image();
      let imgLoaded = false;
      let wmLoaded = false;

      const tryDraw = () => {
        if (!imgLoaded || !wmLoaded) return;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Watermark scale: 25% of image width
        const scale = (img.width * 0.25) / watermark.width;
        const wmWidth = watermark.width * scale;
        const wmHeight = watermark.height * scale;

        // Bottom right with 5% layout margin
        const marginX = img.width * 0.05;
        const marginY = img.height * 0.05;
        const x = img.width - wmWidth - marginX;
        const y = img.height - wmHeight - marginY;

        ctx.globalAlpha = 0.8;
        ctx.drawImage(watermark, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              URL.revokeObjectURL(img.src);
              return resolve(file);
            }
            const watermarkedFile = new File([blob], file.name, {
              type: file.type || "image/jpeg",
              lastModified: Date.now(),
            });
            URL.revokeObjectURL(img.src);
            resolve(watermarkedFile);
          },
          file.type || "image/jpeg",
          0.92
        );
      };

      img.onload = () => { 
        imgLoaded = true; 
        tryDraw(); 
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(file);
      };
      
      watermark.onload = () => { 
        wmLoaded = true; 
        tryDraw(); 
      };
      watermark.onerror = () => {
        wmLoaded = true; // Still try to draw even if watermark fails (it will just be the original)
        tryDraw();
      };

      img.src = URL.createObjectURL(file);
      watermark.src = "/letsellr-watermark.png";
      
      // Safety timeout for processing
      setTimeout(() => {
        if (!imgLoaded) {
          URL.revokeObjectURL(img.src);
          resolve(file);
        }
      }, 5000);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const toastId = toast.loading("Processing images and applying watermark...");
      
      try {
        const watermarkedFiles = await Promise.all(
          newFiles.map(file => addWatermark(file))
        );
        
        setFormData(prev => ({ 
          ...prev, 
          newImages: [...(prev.newImages || []), ...watermarkedFiles] 
        }));
        
        toast.success("Images processed successfully!", { id: toastId });
      } catch (error) {
        console.error("Watermark processing failed:", error);
        toast.error("Some images failed to process, using originals instead.", { id: toastId });
        
        // Fallback to originals if watermark fails completely
        setFormData(prev => ({
          ...prev,
          newImages: [...(prev.newImages || []), ...newFiles]
        }));
      }
    }
  };
  const removeExistingImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };
  const removeNewImage = (index: number) => {
    setFormData({ ...formData, newImages: (formData.newImages || []).filter((_, i) => i !== index) });
  };

  // Submit Logic
  const handleSubmit = async () => {
    // Validation
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.category._id) errors.category = "Category is required";
    if (!formData.price[0] || formData.price[0].amount <= 0) errors.price = "At least one valid price is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields");
      if (errors.title) titleRef.current?.focus();
      else if (errors.description) descriptionRef.current?.focus();
      else if (errors.category) categoryRef.current?.focus();
      else if (errors.price) priceRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Request Presigned URLs
      let imageUrls: string[] = [];
      if (formData.newImages && formData.newImages.length > 0) {
        toast.info(`Preparing ${formData.newImages.length} images for upload...`);
        
        try {
          const filesData = formData.newImages.map(file => ({
            name: file.name,
            type: file.type
          }));

          const urlResponse = await instance.post("/property/upload-url", { files: filesData });
          const { urls } = urlResponse.data;

          // Step 2: Upload directly to S3
          const uploadPromises = formData.newImages.map(async (file, index) => {
            const { uploadUrl, fileUrl } = urls[index];
            
            // Use a clean axios instance for external PUT to avoid instance headers/baseURL
            await axios.put(uploadUrl, file, {
              headers: { "Content-Type": file.type }
            });
            
            return fileUrl;
          });

          imageUrls = await Promise.all(uploadPromises);
          toast.success("Images uploaded successfully!");
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error("Failed to upload images. Check S3 credentials.");
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        ...formData,
        category: formData.category?._id,
        price: formData.price?.filter((p) => p.amount > 0) || [],
        location: formData.location || "",
        propertyTypeCategory: formData.propertyTypeCategory || undefined,
        images: [...(formData.images || []), ...imageUrls],
      };

      if (isEditing) {
        await instance.put(`/property/${id}`, payload, { withCredentials: true });
        toast.success("Property updated successfully!");
      } else {
        await instance.post("/property", payload, { withCredentials: true });
        toast.success("Property added successfully!");
      }
      
      // Go back to the properties table
      navigate("/admin/properties");
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Failed to save property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20 text-muted-foreground">Loading property details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-6 relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/properties")} className="rounded-xl h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEditing ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? `Editing code: ${formData.propertyCode || 'N/A'}` : "Fill out the details below to create a listing."}
            </p>
          </div>
        </div>
        
        {/* Desktop Action Buttons */}
        <div className="hidden md:flex gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/properties")} className="rounded-xl h-10 px-5">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl h-10 px-5 shadow-md shadow-primary/20">
            {isSubmitting ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Property</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          {/* Basic Details Card */}
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4 border-b border-gray-50">
              <CardTitle className="text-lg">Basic Details</CardTitle>
              <CardDescription>The core identifying information of the property.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 mb-1.5 flex items-center justify-between">
                  Property Code
                  {!isEditing && <span className="text-[10px] lowercase font-normal text-muted-foreground">(Auto-generated if empty)</span>}
                </label>
                <Input 
                  name="propertyCode" 
                  value={formData.propertyCode || ""} 
                  onChange={handleInputChange} 
                  placeholder={isEditing ? "4-5 digit code" : "Optional: e.g. 1024"} 
                  className="rounded-xl h-11" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Title <span className="text-red-500">*</span></label>
                <Input ref={titleRef} name="title" value={formData.title} onChange={handleInputChange} placeholder="E.g., Luxury Skyline Apartment" className={`rounded-xl h-11 ${formErrors.title ? "border-red-500" : ""}`} />
                {formErrors.title && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea ref={descriptionRef} name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the property..." rows={4} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${formErrors.description ? "border-red-500" : "border-gray-200"}`} />
                {formErrors.description && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Options Card */}
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pricing</CardTitle>
                <CardDescription>Add various pricing tiers.</CardDescription>
              </div>
              <Button type="button" onClick={addPriceOption} variant="outline" size="sm" className="rounded-lg h-8">
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4" ref={priceRef}>
              {formData.price.map((p, idx) => (
                <div key={idx} className="flex gap-3 items-center group">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Option Type</label>
                    <Input placeholder="E.g., Single Room or 1 Year Lease" value={p.type} onChange={(e) => handlePriceChange(idx, "type", e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="w-1/3 min-w-[120px]">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Amount (₹)</label>
                    <Input placeholder="Price" type="number" value={p.amount || ""} onChange={(e) => handlePriceChange(idx, "amount", e.target.value)} className="rounded-xl h-11" />
                  </div>
                  {formData.price.length > 1 && (
                    <Button variant="ghost" onClick={() => removePriceOption(idx)} className="h-11 w-11 p-0 mt-5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              {formErrors.price && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.price}</p>}
            </CardContent>
          </Card>

           {/* Media Card */}
           <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4 border-b border-gray-50">
              <CardTitle className="text-lg">Media & Images</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {/* Existing Images */}
                {formData.images.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-gray-100">
                    <img src={url} alt="Property" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <button onClick={() => removeExistingImage(idx)} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                
                {/* New Image Previews */}
                {(formData.newImages || []).map((file, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-primary/20">
                    <FilePreview file={file} />
                    <button onClick={() => removeNewImage(idx)} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors z-10">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-[10px] text-white truncate z-10">
                      {file.name}
                    </div>
                  </div>
                ))}
                
                {/* Upload Trigger */}
                <label className="border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-xs text-center text-gray-500 font-medium px-2">Upload Files</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Attributes */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4 border-b border-gray-50">
              <CardTitle className="text-lg">Categorization</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Platform Category <span className="text-red-500">*</span></label>
                <select
                  ref={categoryRef}
                  name="category"
                  value={formData.category?._id}
                  onChange={(e) => {
                    const selected = categories.find((c) => c._id === e.target.value);
                    setFormData({ ...formData, category: selected || { _id: "", name: "" } });
                    setFormErrors({ ...formErrors, category: "" });
                  }}
                  className={`w-full px-4 h-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white ${formErrors.category ? "border-red-500" : "border-gray-200"}`}
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {formErrors.category && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.category}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Property Type</label>
                <select
                  name="propertyTypeCategory"
                  value={formData.propertyTypeCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 h-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                  <option value="">Select type...</option>
                  {propertyTypes.map((type) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Action Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 h-11 border border-gray-200 rounded-xl text-sm capitalize focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="lease">Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 h-11 border border-gray-200 rounded-xl text-sm capitalize focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                  <option value="sold">Sold / Unavailable</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4 border-b border-gray-50">
              <CardTitle className="text-lg">Location & Comm.</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Location Area</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 h-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                  <option value="">Select location...</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>{loc.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Contact Number</label>
                <Input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+91..." className="rounded-xl h-11" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Amenities (Comma separated)</label>
                <Input name="amenity" value={formData.amenity} onChange={handleInputChange} placeholder="Wifi, Pool, Gym..." className="rounded-xl h-11" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Vacancies</CardTitle>
              <Button type="button" onClick={addVacancy} variant="outline" size="sm" className="rounded-lg h-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">Total Basic Vacancies</label>
                <Input type="number" name="vacancyCount" value={formData.vacancyCount} onChange={handleInputChange} placeholder="0" className="rounded-xl h-11" />
              </div>
              
              {formData.vacancies && formData.vacancies.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Specific Vacancies</label>
                  {formData.vacancies.map((v, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input placeholder="Type (e.g. Single)" value={v.type} onChange={(e) => handleVacancyChange(idx, "type", e.target.value)} className="rounded-xl h-9" />
                      <Input placeholder="Qty" type="number" value={v.count || ""} onChange={(e) => handleVacancyChange(idx, "count", e.target.value)} className="rounded-xl w-24 h-9" />
                      <button type="button" onClick={() => removeVacancy(idx)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 flex gap-3 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]">
        <Button variant="outline" onClick={() => navigate("/admin/properties")} className="rounded-xl h-12 flex-1 font-bold bg-white">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl h-12 flex-1 shadow-lg shadow-primary/20 font-bold">
          {isSubmitting ? "Saving..." : "Save Listing"}
        </Button>
      </div>
    </div>
  );
};

export default AdminPropertyFormPage;
