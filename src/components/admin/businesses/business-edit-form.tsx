"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { categories } from "@/lib/data/categories";
import type { business, BusinessHours, BusinessBadge } from "@/lib/schema";
import type { InferSelectModel } from "drizzle-orm";
import { Loader2, Save, Star, Sparkles, Upload, X } from "lucide-react";

const AVAILABLE_BADGES: { value: BusinessBadge; label: string; description: string }[] = [
  { value: "new", label: "New", description: "Recently added business" },
  { value: "featured", label: "Featured", description: "Highlighted listing" },
  { value: "favourite", label: "Favourite", description: "Community favourite" },
  { value: "popular", label: "Popular", description: "High traffic listing" },
  { value: "verified", label: "Verified", description: "Verified business info" },
  { value: "top-rated", label: "Top Rated", description: "Excellent reviews" },
];

type Business = InferSelectModel<typeof business>;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface BusinessEditFormProps {
  business: Business;
  redirectTo?: string;
  isAdmin?: boolean;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function BusinessEditForm({ business, redirectTo = "/admin/businesses", isAdmin = true }: BusinessEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string | null>(business.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = useCallback((file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Accepted: JPG, PNG, WebP");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("File too large. Maximum size is 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleImageRemove = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Form state
  const [name, setName] = useState(business.name);
  const [description, setDescription] = useState(business.description || "");
  const [phone, setPhone] = useState(business.phone || "");
  const [email, setEmail] = useState(business.email || "");
  const [website, setWebsite] = useState(business.website || "");
  const [address, setAddress] = useState(business.address || "");
  const [city, setCity] = useState(business.city || "Fredericton");
  const [province, setProvince] = useState(business.province || "NB");
  const [postalCode, setPostalCode] = useState(business.postalCode || "");
  const [categoryId, setCategoryId] = useState(business.categoryId || "");
  const [hours, setHours] = useState<BusinessHours[]>(
    business.hours || DAYS.map((_, i) => ({ day: i, open: "09:00", close: "17:00" }))
  );
  const [isFeatured, setIsFeatured] = useState(business.isFeatured);
  const [displayOrder, setDisplayOrder] = useState(business.displayOrder);
  const [badges, setBadges] = useState<BusinessBadge[]>(
    (business.badges as BusinessBadge[]) || []
  );

  const toggleBadge = (badge: BusinessBadge) => {
    setBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((b) => b !== badge)
        : [...prev, badge]
    );
  };

  const handleHoursChange = (
    dayIndex: number,
    field: "open" | "close",
    value: string
  ) => {
    setHours((prev) => {
      const existing = prev.find((h) => h.day === dayIndex);
      if (existing) {
        return prev.map((h) =>
          h.day === dayIndex ? { ...h, [field]: value } : h
        );
      }
      return [...prev, { day: dayIndex, open: "09:00", close: "17:00", [field]: value }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Upload new image if one was selected
      let resolvedImageUrl = imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const imgRes = await fetch("/api/businesses/image", {
          method: "POST",
          body: formData,
        });
        if (!imgRes.ok) {
          const imgData = await imgRes.json();
          throw new Error(imgData.error || "Failed to upload image");
        }
        const imgData = await imgRes.json();
        resolvedImageUrl = imgData.url;
      }

      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          phone,
          email,
          website,
          address,
          city,
          province,
          postalCode,
          categoryId,
          hours,
          isFeatured,
          displayOrder,
          badges,
          imageUrl: resolvedImageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update business");
      }

      toast.success("Business updated successfully");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update business");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the business..."
          />
        </div>
      </div>

      {/* Featured & Badges - Admin only */}
      {isAdmin && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Featured & Badges
          </h3>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Label htmlFor="featured" className="font-medium">
                  Featured Business
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Show this business in the featured carousel on the homepage
              </p>
            </div>
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </div>

          {/* Display Order */}
          {isFeatured && (
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                min={0}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first (0 = highest priority)
              </p>
            </div>
          )}

          {/* Badges */}
          <div className="space-y-3">
            <Label>Badges</Label>
            <p className="text-sm text-muted-foreground">
              Select badges to display on this business listing
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AVAILABLE_BADGES.map((badge) => (
                <div
                  key={badge.value}
                  className="flex items-start space-x-3 rounded-lg border p-3"
                >
                  <Checkbox
                    id={`badge-${badge.value}`}
                    checked={badges.includes(badge.value)}
                    onCheckedChange={() => toggleBadge(badge.value)}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor={`badge-${badge.value}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {badge.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Image */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Featured Image</h3>
          <p className="text-sm text-muted-foreground">
            Upload a photo of your business. Images are auto-optimized to WebP.
          </p>
        </div>
        {imagePreview || imageUrl ? (
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview || imageUrl || ""}
                alt="Business preview"
                className="h-full w-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-7 w-7"
              onClick={handleImageRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleImageFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  Drop an image here or click to browse
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  JPG, PNG, or WebP up to 5MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(506) 555-0123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@business.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="E3B 1A1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Business Hours</h3>
        <div className="space-y-3">
          {DAYS.map((day, index) => {
            const dayHours = hours.find((h) => h.day === index);
            return (
              <div
                key={day}
                className="grid grid-cols-3 gap-4 items-center"
              >
                <Label className="font-normal">{day}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={dayHours?.open || "09:00"}
                    onChange={(e) =>
                      handleHoursChange(index, "open", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={dayHours?.close || "17:00"}
                    onChange={(e) =>
                      handleHoursChange(index, "close", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(redirectTo)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
