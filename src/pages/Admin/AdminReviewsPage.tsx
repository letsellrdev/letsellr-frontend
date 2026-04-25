import { Star, Filter, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import instance from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { ReviewSkeleton } from "@/components/skeletons";
import AdminLoader from "@/components/AdminLoader";
import { toast } from "sonner";

const AdminReviewsPage = () => {
  const navigate = useNavigate();
  const [reviewcount, setreviewcount] = useState(0);
  const [reviews, setreviews] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const reviewfind = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/feedback");
      setreviews(response.data.data);
      setreviewcount(response.data.count);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reviewfind();
  }, []);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await instance.delete(`/feedback/${deletingId}`);
      setreviews((prev) => prev.filter((review) => review._id !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split?.(" ")
        ?.map((word) => word?.charAt?.(0)?.toUpperCase?.())
        ?.slice?.(0, 2)
        ?.join?.("") || "U"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "rejected":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };
  const showproperty = (id: string) => {
    navigate(`/property/${id}`);
  };

  if (isLoading) {
    return <AdminLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground">Total Reviews</p>
          <p className="text-2xl font-bold text-foreground mt-1">{reviewcount}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground">Avg. Rating</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {reviews.length > 0
              ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
              : "0.0"}
          </p>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews found.</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id} className="p-6 border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">{getInitials(review.userName)}</span>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{review.userName}</h3>
                      <p className="text-sm text-muted-foreground">{review.propertyName}</p>
                    </div>
                    {/* <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(review.status)}`}>{review.status}</span> */}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4 text-yellow-500", i < review.rating ? "fill-yellow-500" : "")} />
                    ))}
                  </div>

                  {/* Review Comment */}
                  <p className="text-sm text-foreground mb-3">{review.comment}</p>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground mb-4">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* {review.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )} */}
                    <Button
                      onClick={() => showproperty(review.propertyId)}
                      size="sm"
                      variant="outline"
                      className="rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Property
                    </Button>
                    <Button
                      onClick={() => handleDelete(String(review._id))}
                      size="sm"
                      variant="outline"
                      className="rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* Delete Alert */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this review?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReviewsPage;
