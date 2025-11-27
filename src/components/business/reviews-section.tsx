"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                ? "fill-yellow-400 text-yellow-400"
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
    <div className="border-b pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.user.image || undefined} />
          <AvatarFallback>
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
              <p className="font-medium">{review.user.name}</p>
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
            <h4 className="mt-2 font-medium">{review.title}</h4>
          )}
          <p className="mt-2 text-muted-foreground">{review.content}</p>

          {/* Owner Response */}
          {review.ownerResponse && (
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
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
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reviews</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <RatingStars rating={averageRating} size="sm" showValue />
              <span className="text-sm text-muted-foreground">
                ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
          {session && !userHasReviewed && !showForm && !success && (
            <Button onClick={() => setShowForm(true)}>Write a Review</Button>
          )}
          {!session && (
            <AuthDialog>
              <Button>Sign in to Review</Button>
            </AuthDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Thank you! Your review has been submitted.
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6">
            <div>
              <Label className="mb-2 block">Your Rating</Label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <Label htmlFor="review-title">Title (optional)</Label>
              <Input
                id="review-title"
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="review-content">Your Review</Label>
              <Textarea
                id="review-content"
                placeholder={`Share your experience with ${businessName}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
                minLength={10}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Minimum 10 characters
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Already Reviewed Message */}
        {userHasReviewed && !success && (
          <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
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
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>No reviews yet. Be the first to review {businessName}!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
