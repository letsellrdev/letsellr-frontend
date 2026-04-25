import { MapPin, Edit, Trash2, Plus, Save, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useState, useEffect } from "react";
import instance from "@/lib/axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LocationSkeleton } from "@/components/skeletons";
import AdminLoader from "@/components/AdminLoader";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in some build environments
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Types
interface Location {
  _id: string;
  title: string;
  description: string;
  googleMapUrl: string;
  importantLocation: boolean;
  latitude: number | null;
  longitude: number | null;
}

interface LocationFormData extends Partial<Location> { }

const extractCoords = (url: string) => {
  if (!url) return null;
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)|ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = url.match(regex);
  if (match) {
    const lat = match[1] || match[3] || match[5];
    const lng = match[2] || match[4] || match[6];
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return null;
};

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const LocationPicker = ({ lat, lng, onPick }: { lat: number | null, lng: number | null, onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat && lng ? <Marker position={[lat, lng]} /> : null;
};

const AdminLocationPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    title: "",
    description: "",
    googleMapUrl: "",
    importantLocation: false,
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all locations
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/location");
      setLocations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "googleMapUrl") {
      const coords = extractCoords(value);
      if (coords) {
        setFormData(prev => ({ ...prev, googleMapUrl: value, latitude: coords.lat, longitude: coords.lng }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, importantLocation: checked }));
  };

  // Add new location
  const handleAddLocation = async () => {
    if (!formData.title || !formData.googleMapUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await instance.post("/location", formData);
      await fetchLocations();
      setIsAddDialogOpen(false);
      setFormData({ title: "", description: "", googleMapUrl: "", importantLocation: false, latitude: null, longitude: null });
      toast.success("Location added successfully");
    } catch (error: any) {
      console.error("Error adding location:", error);
      toast.error(error.response?.data?.message || "Failed to add location");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit location
  const handleEditLocation = async () => {
    if (!editingLocation || !formData.title || !formData.googleMapUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await instance.put(`/location/${editingLocation._id}`, formData);
      await fetchLocations();
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      setFormData({ title: "", description: "", googleMapUrl: "", importantLocation: false, latitude: null, longitude: null });
      toast.success("Location updated successfully");
    } catch (error: any) {
      console.error("Error updating location:", error);
      toast.error(error.response?.data?.message || "Failed to update location");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete location
  const handleDeleteLocation = async () => {
    if (!deleteLocationId) return;

    setIsSubmitting(true);
    try {
      await instance.delete(`/location/${deleteLocationId}`);
      await fetchLocations();
      setDeleteLocationId(null);
      toast.success("Location deleted successfully");
    } catch (error: any) {
      console.error("Error deleting location:", error);
      toast.error(error.response?.data?.message || "Failed to delete location. It may be associated with properties.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      title: location.title,
      description: location.description,
      googleMapUrl: location.googleMapUrl,
      importantLocation: location.importantLocation,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <AdminLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground mt-1">Manage property locations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Location Title *</Label>
                <Input id="title" name="title" placeholder="e.g., Mavoor road" value={formData.title || ""} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Add details about this location..."
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleMapUrl">Google Map URL (Optional auto-fill)</Label>
                <Input
                  id="googleMapUrl"
                  name="googleMapUrl"
                  placeholder="Paste Google Maps link to auto-detect coordinates..."
                  value={formData.googleMapUrl || ""}
                  onChange={handleInputChange}
                />
                {formData.googleMapUrl && (
                  <p className="text-[10px] mt-1">
                    {extractCoords(formData.googleMapUrl) ? (
                      <span className="text-green-600 font-medium">✨ Coordinates detected and applied</span>
                    ) : (
                      <span className="text-amber-600">⚠️ No coordinates found in this URL.</span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Pick Location on Map *</Label>
                <div className="h-[250px] w-full rounded-md border border-gray-200 overflow-hidden relative z-0">
                  <MapContainer
                    center={[formData.latitude || 20.5937, formData.longitude || 78.9629]}
                    zoom={formData.latitude ? 13 : 4}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {formData.latitude && formData.longitude && (
                      <ChangeView center={[formData.latitude, formData.longitude]} />
                    )}
                    <LocationPicker
                      lat={formData.latitude}
                      lng={formData.longitude}
                      onPick={(lat, lng) => setFormData(p => ({ ...p, latitude: lat, longitude: lng }))}
                    />
                  </MapContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude ?? ""}
                      onChange={(e) => setFormData(p => ({ ...p, latitude: parseFloat(e.target.value) || null }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude ?? ""}
                      onChange={(e) => setFormData(p => ({ ...p, longitude: parseFloat(e.target.value) || null }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="importantLocation" checked={formData.importantLocation || false} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="importantLocation" className="flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4" />
                  Mark as Important Location
                </Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLocation} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Location"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => <LocationSkeleton key={i} />)
        ) : locations.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No locations found. Add your first location!</p>
          </Card>
        ) : (
          locations.map((location) => (
            <Card key={location._id} className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{location.title}</h3>
                      {location.importantLocation && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    {location.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
                    )}
                    {(location.latitude && location.longitude) && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                          📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(location)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeleteLocationId(location._id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Location Title *</Label>
              <Input
                id="edit-title"
                name="title"
                placeholder="e.g., Mavoor road"
                value={formData.title || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                name="description"
                placeholder="Add details about this location..."
                value={formData.description || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-googleMapUrl">Google Map URL (Optional auto-fill)</Label>
              <Input
                id="edit-googleMapUrl"
                name="googleMapUrl"
                placeholder="Paste Google Maps link to auto-detect coordinates..."
                value={formData.googleMapUrl || ""}
                onChange={handleInputChange}
              />
              {formData.googleMapUrl && (
                <p className="text-[10px] mt-1">
                  {extractCoords(formData.googleMapUrl) ? (
                    <span className="text-green-600 font-medium">✨ Coordinates detected and applied</span>
                  ) : (
                    <span className="text-amber-600">⚠️ No coordinates found in this URL.</span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pick Location on Map *</Label>
              <div className="h-[250px] w-full rounded-md border border-gray-200 overflow-hidden relative z-0">
                <MapContainer
                  center={[formData.latitude || 20.5937, formData.longitude || 78.9629]}
                  zoom={formData.latitude ? 13 : 4}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {formData.latitude && formData.longitude && (
                    <ChangeView center={[formData.latitude, formData.longitude]} />
                  )}
                  <LocationPicker
                    lat={formData.latitude}
                    lng={formData.longitude}
                    onPick={(lat, lng) => setFormData(p => ({ ...p, latitude: lat, longitude: lng }))}
                  />
                </MapContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-latitude" className="text-xs">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={formData.latitude ?? ""}
                    onChange={(e) => setFormData(p => ({ ...p, latitude: parseFloat(e.target.value) || null }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-longitude" className="text-xs">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={formData.longitude ?? ""}
                    onChange={(e) => setFormData(p => ({ ...p, longitude: parseFloat(e.target.value) || null }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="edit-importantLocation" checked={formData.importantLocation || false} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="edit-importantLocation" className="flex items-center gap-2 cursor-pointer">
                <Star className="h-4 w-4" />
                Mark as Important Location
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLocation} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLocationId} onOpenChange={() => setDeleteLocationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This location will be permanently deleted if it's not associated with any properties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocation} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLocationPage;
