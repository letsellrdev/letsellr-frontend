import { MessageSquare, Edit, Trash2, Plus, Save, Star } from "lucide-react";
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
import { toast } from "sonner";
import { LocationSkeleton } from "@/components/skeletons";
import AdminLoader from "@/components/AdminLoader";

// Types
interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
}

const AdminTestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTestimonialId, setDeleteTestimonialId] = useState<string | null>(
    null
  );
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: "",
    role: "",
    content: "",
    rating: 5,
    initials: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all testimonials
  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/testimonial");
      setTestimonials(response.data.data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) || 0 : value,
    }));
  };

  // Add new testimonial
  const handleAddTestimonial = async () => {
    if (!formData.name || !formData.role || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto-generate initials if empty
      const initials =
        formData.initials ||
        formData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);

      await instance.post("/testimonial", { ...formData, initials });
      await fetchTestimonials();
      setIsAddDialogOpen(false);
      setFormData({ name: "", role: "", content: "", rating: 5, initials: "" });
      toast.success("Testimonial added successfully");
    } catch (error: any) {
      console.error("Error adding testimonial:", error);
      toast.error(error.response?.data?.message || "Failed to add testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit testimonial
  const handleEditTestimonial = async () => {
    if (
      !editingTestimonial ||
      !formData.name ||
      !formData.role ||
      !formData.content
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await instance.put(`/testimonial/${editingTestimonial._id}`, formData);
      await fetchTestimonials();
      setIsEditDialogOpen(false);
      setEditingTestimonial(null);
      setFormData({ name: "", role: "", content: "", rating: 5, initials: "" });
      toast.success("Testimonial updated successfully");
    } catch (error: any) {
      console.error("Error updating testimonial:", error);
      toast.error(
        error.response?.data?.message || "Failed to update testimonial"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete testimonial
  const handleDeleteTestimonial = async () => {
    if (!deleteTestimonialId) return;

    setIsSubmitting(true);
    try {
      await instance.delete(`/testimonial/${deleteTestimonialId}`);
      await fetchTestimonials();
      setDeleteTestimonialId(null);
      toast.success("Testimonial deleted successfully");
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete testimonial"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      rating: testimonial.rating,
      initials: testimonial.initials,
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
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage user testimonials</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Priya Sharma"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  name="role"
                  placeholder="e.g., Software Engineer"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <textarea
                  id="content"
                  name="content"
                  placeholder="Testimonial content..."
                  value={formData.content || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating || 5}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initials">Initials (Optional)</Label>
                  <Input
                    id="initials"
                    name="initials"
                    placeholder="PS"
                    value={formData.initials || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTestimonial} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Testimonial"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Testimonials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <LocationSkeleton key={i} />)
        ) : testimonials.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No testimonials found. Create one!
              </p>
            </Card>
          </div>
        ) : (
          testimonials.map((item) => (
            <Card key={item._id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTestimonialId(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm italic text-muted-foreground line-clamp-3">
                "{item.content}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {item.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.role}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="e.g., Priya Sharma"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Input
                id="edit-role"
                name="role"
                placeholder="e.g., Software Engineer"
                value={formData.role || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <textarea
                id="edit-content"
                name="content"
                placeholder="Testimonial content..."
                value={formData.content || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rating">Rating (1-5)</Label>
                <Input
                  id="edit-rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating || 5}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-initials">Initials (Optional)</Label>
                <Input
                  id="edit-initials"
                  name="initials"
                  placeholder="PS"
                  value={formData.initials || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTestimonial} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Testimonial"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTestimonialId}
        onOpenChange={() => setDeleteTestimonialId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This testimonial will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTestimonial}
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

export default AdminTestimonialsPage;
