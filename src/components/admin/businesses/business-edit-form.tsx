"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { categories } from "@/lib/data/categories";
import type { business, BusinessHours } from "@/lib/schema";
import type { InferSelectModel } from "drizzle-orm";
import { Loader2, Save } from "lucide-react";

type Business = InferSelectModel<typeof business>;

interface BusinessEditFormProps {
  business: Business;
  redirectTo?: string;
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

export function BusinessEditForm({ business, redirectTo = "/admin/businesses" }: BusinessEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update business");
      }

      toast.success("Business updated successfully");
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Failed to update business");
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
