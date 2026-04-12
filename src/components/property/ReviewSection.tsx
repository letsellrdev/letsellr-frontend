import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface Review {
  id: number;
  email: string;
  comment: string;
  rating: number;
  timestamp: string;
}

interface ReviewSectionProps {
  allReviews: Review[];
  displayedReviews: Review[];
  showAllReviews: boolean;
  onToggleReviews: () => void;
  submitMessage: string;
  selectedRating: number;
  setSelectedRating: (r: number) => void;
  hoverRating: number;
  setHoverRating: (r: number) => void;
  reviewForm: { name: string; email: string; comment: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmitReview: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  averageRating: string;
}

export function ReviewSection({
  allReviews,
  displayedReviews,
  showAllReviews,
  onToggleReviews,
  submitMessage,
  selectedRating,
  setSelectedRating,
  hoverRating,
  setHoverRating,
  reviewForm,
  onInputChange,
  onSubmitReview,
  isSubmitting,
  averageRating,
}: ReviewSectionProps) {
  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="flex flex-col gap-10">
      {/* ── Reviews List ── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl md:text-2xl font-bold">Guest Reviews</h2>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span className="text-lg font-bold">{averageRating}</span>
            <span className="text-sm text-muted-foreground">
              ({allReviews.length} reviews)
            </span>
          </div>
        </div>

        {displayedReviews.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No reviews yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReviews.map((review) => (
              <div
                key={review.id}
                className="p-5 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {review.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate max-w-[150px]">
                        {review.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < review.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-200 fill-gray-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        )}

        {allReviews.length > 5 && (
          <Button
            variant="outline"
            onClick={onToggleReviews}
            className="w-full rounded-2xl py-6"
          >
            {showAllReviews
              ? "Show Less"
              : `Show All ${allReviews.length} Reviews`}
          </Button>
        )}
      </section>

      {/* ── Leave a Review Form ── */}
      <section className="bg-gray-50/80 border border-gray-100 rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold">Leave a Review</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Share your experience with future guests.
          </p>
        </div>

        {submitMessage && (
          <div
            className={cn(
              "p-4 rounded-2xl text-sm font-semibold border",
              submitMessage.includes("Thank you")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            {submitMessage}
          </div>
        )}

        <form onSubmit={onSubmitReview} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Your Rating *
            </span>
            <div className="flex gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || selectedRating) >= star
                        ? "text-amber-500 fill-amber-500"
                        : "text-gray-200"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={reviewForm.name}
                onChange={onInputChange}
                placeholder="John Doe"
                disabled={isSubmitting}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm bg-white"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={reviewForm.email}
                onChange={onInputChange}
                placeholder="john@example.com"
                disabled={isSubmitting}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm bg-white"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label
              htmlFor="comment"
              className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
            >
              Your Experience *
            </label>
            <textarea
              id="comment"
              name="comment"
              value={reviewForm.comment}
              onChange={onInputChange}
              placeholder="What did you like about this place?"
              disabled={isSubmitting}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm bg-white resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto px-10 py-6 rounded-2xl font-bold shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Post Review"}
          </Button>
        </form>
      </section>
    </div>
  );
}
