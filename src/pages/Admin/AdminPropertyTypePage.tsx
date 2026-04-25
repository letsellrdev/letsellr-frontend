import { Tag, Edit, Trash2, Plus, Save } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { LocationSkeleton } from "@/components/skeletons";
import AdminLoader from "@/components/AdminLoader";
import { toast } from "sonner";

// Types
interface PropertyType {
  _id: string;
  name: string;
  description?: string;
}

interface PropertyTypeFormData extends Partial<PropertyType> { }

const AdminPropertyTypePage = () => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletePropertyTypeId, setDeletePropertyTypeId] = useState<string | null>(null);
  const [editingPropertyType, setEditingPropertyType] = useState<PropertyType | null>(null);
  const [formData, setFormData] = useState<PropertyTypeFormData>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all property types
  const fetchPropertyTypes = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/propertytype");
      setPropertyTypes(response.data.data || []);
    } catch (error) {
      console.error("Error fetching property types:", error);
      toast.error("Failed to fetch property types");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add new property type
  const handleAddPropertyType = async () => {
    if (!formData.name) {
      toast.error("Please enter a property type name");
      return;
    }

    setIsSubmitting(true);
    try {
      await instance.post("/propertytype", formData);
      await fetchPropertyTypes();
      setIsAddDialogOpen(false);
      setFormData({ name: "", description: "" });
      toast.success("Property type added successfully");
    } catch (error: any) {
      console.error("Error adding property type:", error);
      toast.error(error.response?.data?.message || "Failed to add property type");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit property type
  const handleEditPropertyType = async () => {
    if (!editingPropertyType || !formData.name) {
      toast.error("Please enter a property type name");
      return;
    }

    setIsSubmitting(true);
    try {
      await instance.put(`/propertytype/${editingPropertyType._id}`, formData);
      await fetchPropertyTypes();
      setIsEditDialogOpen(false);
      setEditingPropertyType(null);
      setFormData({ name: "", description: "" });
      toast.success("Property type updated successfully");
    } catch (error: any) {
      console.error("Error updating property type:", error);
      toast.error(error.response?.data?.message || "Failed to update property type");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete property type
  const handleDeletePropertyType = async () => {
    if (!deletePropertyTypeId) return;

    setIsSubmitting(true);
    try {
      await instance.delete(`/propertytype/${deletePropertyTypeId}`);
      await fetchPropertyTypes();
      setDeletePropertyTypeId(null);
      toast.success("Property type deleted successfully");
    } catch (error: any) {
      console.error("Error deleting property type:", error);
      toast.error(error.response?.data?.message || "Failed to delete property type. It may be associated with properties.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (propertyType: PropertyType) => {
    setEditingPropertyType(propertyType);
    setFormData({
      name: propertyType.name,
      description: propertyType.description || "",
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
          <h1 className="text-3xl font-bold">Property Types</h1>
          <p className="text-muted-foreground mt-1">Manage property type categories (Family, Bachelors, etc.)</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Property Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Property Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Type Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Family, Bachelors, Girls, Boys, All"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Add details about this property type..."
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPropertyType} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Property Type"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Property Types Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => <LocationSkeleton key={i} />)
        ) : propertyTypes.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No property types found. Add your first property type!</p>
          </Card>
        ) : (
          propertyTypes.map((propertyType) => (
            <Card key={propertyType._id} className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{propertyType.name}</h3>
                    {propertyType.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{propertyType.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(propertyType)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeletePropertyTypeId(propertyType._id)}>
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
            <DialogTitle>Edit Property Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Property Type Name *</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="e.g., Family, Bachelors, Girls, Boys, All"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                name="description"
                placeholder="Add details about this property type..."
                value={formData.description || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPropertyType} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Property Type"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePropertyTypeId} onOpenChange={() => setDeletePropertyTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This property type will be permanently deleted if it's not associated with any properties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePropertyType} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPropertyTypePage;
