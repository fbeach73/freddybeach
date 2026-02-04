"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { categories } from "@/lib/data/categories";
import type { BusinessHours } from "@/lib/schema";
import { Loader2, Send, Info, CheckCircle2, ArrowLeft, Upload, X } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_HOURS: BusinessHours[] = DAYS.map((_, i) => ({
  day: i,
  open: "09:00",
  close: "17:00",
}));

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function BusinessCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Fredericton");
  const [province, setProvince] = useState("NB");
  const [postalCode, setPostalCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [hours, setHours] = useState<BusinessHours[]>(DEFAULT_HOURS);

  // Image upload state
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      return [
        ...prev,
        { day: dayIndex, open: "09:00", close: "17:00", [field]: value },
      ];
    });
  };

  const handleClosedToggle = (dayIndex: number, closed: boolean) => {
    setHours((prev) =>
      prev.map((h) => (h.day === dayIndex ? { ...h, closed } : h))
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Business name is required";
    }
    if (!categoryId) {
      newErrors.categoryId = "Please select a category";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!address.trim()) {
      newErrors.address = "Street address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image first if one was selected
      let imageUrl: string | undefined;
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
        imageUrl = imgData.url;
      }

      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          description: description.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          website: website.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          province: province.trim(),
          postalCode: postalCode.trim() || undefined,
          hours,
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit business");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit business"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-950/40">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Business Submitted!</h2>
          <p className="max-w-md text-muted-foreground">
            Your listing for <span className="font-medium text-foreground">{name}</span> has
            been submitted and is now under review by our team.
          </p>
        </div>
        <Alert className="max-w-lg text-left">
          <Info className="h-4 w-4" />
          <AlertTitle>What happens next?</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>Our team will review your listing within 1-2 business days</li>
              <li>You&apos;ll be notified once your listing is approved</li>
              <li>Once approved, your business will appear in the directory</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/my-businesses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Businesses
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Info Banner */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Review Process</AlertTitle>
        <AlertDescription>
          Your business listing will be reviewed by our team before it appears
          in the directory. This typically takes 1-2 business days. We&apos;ll
          notify you once your listing is approved.
        </AlertDescription>
      </Alert>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Your Business Name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value);
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
            >
              <SelectTrigger
                className={errors.categoryId ? "border-destructive" : ""}
              >
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
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: "" }));
            }}
            rows={4}
            placeholder="Tell customers about your business, what you offer, and what makes you unique..."
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              placeholder="(506) 555-0123"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
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
            <Label htmlFor="address">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address)
                  setErrors((prev) => ({ ...prev, address: "" }));
              }}
              placeholder="123 Main Street"
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
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

      {/* Featured Image */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Featured Image</h3>
          <p className="text-sm text-muted-foreground">
            Upload a photo of your business. Images are auto-optimized to WebP.
          </p>
        </div>
        {imagePreview ? (
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
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

      {/* Business Hours */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Business Hours</h3>
          <p className="text-sm text-muted-foreground">
            Set your regular operating hours for each day of the week
          </p>
        </div>
        <div className="space-y-3">
          {DAYS.map((day, index) => {
            const dayHours = hours.find((h) => h.day === index);
            const isClosed = dayHours?.closed === true;
            return (
              <div key={day} className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-3 sm:gap-4">
                <Label className="font-normal">{day}</Label>
                <Button
                  type="button"
                  variant={isClosed ? "destructive" : "outline"}
                  size="sm"
                  className="text-xs w-[70px]"
                  onClick={() => handleClosedToggle(index, !isClosed)}
                >
                  {isClosed ? "Closed" : "Open"}
                </Button>
                {isClosed ? (
                  <span className="col-span-2 text-sm text-muted-foreground">
                    Closed all day
                  </span>
                ) : (
                  <>
                    <Input
                      type="time"
                      value={dayHours?.open || "09:00"}
                      onChange={(e) =>
                        handleHoursChange(index, "open", e.target.value)
                      }
                      className="w-full"
                    />
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
                  </>
                )}
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
          onClick={() => router.push("/dashboard/my-businesses")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
