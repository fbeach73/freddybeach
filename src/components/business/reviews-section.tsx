"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  ownerResponse: string | null;
  ownerRespondedAt: Date | null;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  };
}

interface ReviewsSectionProps {
  businessId: string;
  businessName: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  userHasReviewed: boolean;
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-1 focus:outline-none"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= (hoverValue || value)
                ? "fill-nb-yellow text-nb-yellow"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b-2 border-nb-border/10 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 border-2 border-nb-border">
          <AvatarImage src={review.user.image || undefined} />
          <AvatarFallback className="font-bold text-sm">
            {review.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{review.user.name}</p>
              <div className="flex items-center gap-2">
                <RatingStars rating={review.rating} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          {review.title && (
            <h4 className="mt-2 font-bold">{review.title}</h4>
          )}
          <p className="mt-2 text-muted-foreground">{review.content}</p>

          {/* Owner Response */}
          {review.ownerResponse && (
            <div className="mt-4 p-4 bg-nb-yellow/10 border-2 border-nb-border/20">
              <div className="flex items-center gap-2 text-sm font-bold uppercase">
                <MessageSquare className="h-4 w-4" />
                Response from owner
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {review.ownerResponse}
              </p>
              {review.ownerRespondedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.ownerRespondedAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReviewsSection({
  businessId,
  businessName,
  reviews,
  averageRating,
  totalReviews,
  userHasReviewed,
}: ReviewsSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (content.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          rating,
          title: title.trim() || null,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setShowForm(false);
      setRating(0);
      setTitle("");
      setContent("");
      // Reload to show new review
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nb-card bg-card">
      <div className="h-2 bg-nb-yellow border-b-2 border-nb-border" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center bg-nb-yellow border-2 border-nb-border">
                <Star className="h-4 w-4 text-black fill-black" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight">Reviews</h3>
            </div>
            <div className="mt-2 flex items-center gap-2 ml-12">
              <RatingStars rating={averageRating} size="sm" showValue />
              <span className="text-sm text-muted-foreground font-bold">
                ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
          {session && !userHasReviewed && !showForm && !success && (
            <Button
              onClick={() => setShowForm(true)}
              className="nb-btn bg-nb-blue text-black hover:bg-nb-blue"
            >
              Write a Review
            </Button>
          )}
          {!session && (
            <AuthDialog>
              <Button className="nb-btn bg-nb-blue text-black hover:bg-nb-blue">
                Sign in to Review
              </Button>
            </AuthDialog>
          )}
        </div>

        <div className="border-b-2 border-nb-border/10 mb-5" />

        <div className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-nb-green/20 border-2 border-nb-border font-bold text-sm">
              Thank you! Your review has been submitted.
            </div>
          )}

          {/* Review Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 border-b-2 border-nb-border/10 pb-6">
              <div>
                <Label className="mb-2 block font-bold uppercase text-sm">Your Rating</Label>
                <StarRatingInput value={rating} onChange={setRating} />
              </div>
              <div>
                <Label htmlFor="review-title" className="font-bold uppercase text-sm">Title (optional)</Label>
                <Input
                  id="review-title"
                  placeholder="Summarize your experience"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="rounded-none border-2 border-nb-border mt-1"
                />
              </div>
              <div>
                <Label htmlFor="review-content" className="font-bold uppercase text-sm">Your Review</Label>
                <Textarea
                  id="review-content"
                  placeholder={`Share your experience with ${businessName}...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                  minLength={10}
                  className="rounded-none border-2 border-nb-border mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum 10 characters
                </p>
              </div>

              {error && (
                <div className="nb-error-box">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="nb-btn bg-nb-green text-black hover:bg-nb-green"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="nb-btn bg-card text-foreground hover:bg-card"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Already Reviewed Message */}
          {userHasReviewed && !success && (
            <div className="p-4 bg-nb-blue/10 border-2 border-nb-border/20 text-center text-sm text-muted-foreground font-bold">
              You have already reviewed this business.
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex h-16 w-16 mx-auto items-center justify-center bg-nb-yellow/20 border-2 border-nb-border/20">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-3 font-bold text-muted-foreground">
                No reviews yet. Be the first to review {businessName}!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
