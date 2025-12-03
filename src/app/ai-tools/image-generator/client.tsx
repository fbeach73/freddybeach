"use client";

import { ImageGeneratorPage } from "@/components/generate/image-generator-page";
import type { UserTierData } from "@/components/generate";

interface ImageGeneratorClientProps {
  backLink: string;
  backLinkText: string;
  containerClassName?: string;
  tabsListClassName?: string;
  upgradeLink?: string;
  userTierData?: UserTierData;
}

export function ImageGeneratorClient(props: ImageGeneratorClientProps) {
  return <ImageGeneratorPage {...props} />;
}
