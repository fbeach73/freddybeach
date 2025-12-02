/**
 * Scene Presets for AI Image Generation
 *
 * Provides preset options for Style, Location, Lighting, and Camera settings
 * to help users build comprehensive image generation prompts.
 */

import type { ScenePreset, SceneCategory } from "@/lib/types/image-generation";

// ============================================================================
// STYLE PRESETS (~20 for MVP)
// ============================================================================

export const stylePresets: ScenePreset[] = [
  {
    id: "style-photorealistic",
    name: "Photorealistic",
    description: "Ultra-realistic photography with fine details",
    promptText: "photorealistic, ultra-detailed, high resolution photography",
  },
  {
    id: "style-hyperrealistic",
    name: "Hyperrealistic",
    description: "Beyond real - enhanced details and clarity",
    promptText: "hyperrealistic, extremely detailed, sharp focus, 8K resolution",
  },
  {
    id: "style-raw-photography",
    name: "Raw Photography",
    description: "Unprocessed, natural photographic look",
    promptText: "raw photography, unedited, natural colors, authentic",
  },
  {
    id: "style-film-photography",
    name: "Film Photography",
    description: "Classic analog film aesthetic",
    promptText: "film photography, 35mm film, grain texture, vintage colors",
  },
  {
    id: "style-3d-animation",
    name: "3D Animation",
    description: "Pixar/Disney-style animated look",
    promptText: "3D animation style, Pixar-like, smooth rendering, cartoon",
  },
  {
    id: "style-3d-render",
    name: "3D Render",
    description: "Clean professional 3D rendering",
    promptText: "3D render, octane render, professional lighting, CGI quality",
  },
  {
    id: "style-cinematic",
    name: "Cinematic",
    description: "Movie-like dramatic visuals",
    promptText: "cinematic, film grain, dramatic lighting, movie still, anamorphic",
  },
  {
    id: "style-watercolor",
    name: "Watercolor",
    description: "Soft watercolor painting style",
    promptText: "watercolor painting, soft edges, flowing colors, artistic",
  },
  {
    id: "style-oil-painting",
    name: "Oil Painting",
    description: "Classic oil painting technique",
    promptText: "oil painting, brush strokes, rich colors, traditional art",
  },
  {
    id: "style-pencil-sketch",
    name: "Pencil Sketch",
    description: "Hand-drawn pencil illustration",
    promptText: "pencil sketch, hand-drawn, graphite, detailed linework",
  },
  {
    id: "style-digital-art",
    name: "Digital Art",
    description: "Modern digital illustration style",
    promptText: "digital art, digital painting, vibrant colors, detailed illustration",
  },
  {
    id: "style-anime",
    name: "Anime",
    description: "Japanese anime/manga style",
    promptText: "anime style, manga, Japanese animation, cel shaded",
  },
  {
    id: "style-comic-book",
    name: "Comic Book",
    description: "Bold comic book illustration",
    promptText: "comic book style, bold lines, halftone dots, dynamic composition",
  },
  {
    id: "style-minimalist",
    name: "Minimalist",
    description: "Clean, simple aesthetic",
    promptText: "minimalist, simple, clean lines, sparse composition",
  },
  {
    id: "style-surrealist",
    name: "Surrealist",
    description: "Dreamlike surreal imagery",
    promptText: "surrealist, dreamlike, abstract, Salvador Dali inspired",
  },
  {
    id: "style-pop-art",
    name: "Pop Art",
    description: "Bold pop art aesthetic",
    promptText: "pop art, bold colors, Andy Warhol style, graphic",
  },
  {
    id: "style-vintage-retro",
    name: "Vintage Retro",
    description: "Nostalgic vintage appearance",
    promptText: "vintage, retro, faded colors, nostalgic, aged photograph",
  },
  {
    id: "style-noir",
    name: "Film Noir",
    description: "Dark dramatic noir style",
    promptText: "film noir, black and white, high contrast, dramatic shadows",
  },
  {
    id: "style-cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic neon cyberpunk aesthetic",
    promptText: "cyberpunk, neon lights, futuristic, dystopian, blade runner style",
  },
  {
    id: "style-fantasy",
    name: "Fantasy Art",
    description: "Epic fantasy illustration",
    promptText: "fantasy art, magical, epic, detailed illustration, concept art",
  },
];

// ============================================================================
// LOCATION PRESETS (~20 for MVP)
// ============================================================================

export const locationPresets: ScenePreset[] = [
  {
    id: "loc-urban-city",
    name: "Urban City",
    description: "Modern city streets and buildings",
    promptText: "in an urban city environment, modern buildings, city streets",
  },
  {
    id: "loc-forest",
    name: "Forest",
    description: "Dense woodland setting",
    promptText: "in a lush forest, trees, natural environment, woodland",
  },
  {
    id: "loc-beach",
    name: "Beach",
    description: "Coastal sandy beach",
    promptText: "on a beach, sandy shore, ocean waves, coastal setting",
  },
  {
    id: "loc-mountain",
    name: "Mountain",
    description: "High altitude mountain scenery",
    promptText: "in the mountains, peaks, alpine landscape, high altitude",
  },
  {
    id: "loc-studio",
    name: "Studio",
    description: "Professional photo studio",
    promptText: "in a professional photography studio, clean backdrop, controlled lighting",
  },
  {
    id: "loc-rooftop",
    name: "Rooftop",
    description: "Urban rooftop setting",
    promptText: "on a rooftop, city skyline background, urban elevation",
  },
  {
    id: "loc-subway",
    name: "Subway",
    description: "Underground metro station",
    promptText: "in a subway station, underground, metro platform, urban transit",
  },
  {
    id: "loc-cafe",
    name: "Cafe",
    description: "Cozy coffee shop interior",
    promptText: "in a cozy cafe, coffee shop interior, warm ambiance",
  },
  {
    id: "loc-library",
    name: "Library",
    description: "Book-filled library space",
    promptText: "in a library, bookshelves, quiet reading space, academic",
  },
  {
    id: "loc-desert",
    name: "Desert",
    description: "Arid desert landscape",
    promptText: "in a desert, sand dunes, arid landscape, barren terrain",
  },
  {
    id: "loc-underwater",
    name: "Underwater",
    description: "Beneath the ocean surface",
    promptText: "underwater, ocean depths, marine environment, aquatic",
  },
  {
    id: "loc-space",
    name: "Space",
    description: "Outer space environment",
    promptText: "in outer space, stars, nebula, cosmic environment",
  },
  {
    id: "loc-garden",
    name: "Garden",
    description: "Beautiful garden setting",
    promptText: "in a garden, flowers, plants, natural beauty, botanical",
  },
  {
    id: "loc-industrial",
    name: "Industrial",
    description: "Factory or warehouse setting",
    promptText: "in an industrial setting, factory, warehouse, machinery",
  },
  {
    id: "loc-mansion",
    name: "Mansion",
    description: "Luxurious mansion interior",
    promptText: "in a luxurious mansion, grand interior, elegant architecture",
  },
  {
    id: "loc-countryside",
    name: "Countryside",
    description: "Rural pastoral landscape",
    promptText: "in the countryside, rural landscape, fields, pastoral setting",
  },
  {
    id: "loc-nightclub",
    name: "Nightclub",
    description: "Vibrant nightclub scene",
    promptText: "in a nightclub, dance floor, party lights, nightlife",
  },
  {
    id: "loc-office",
    name: "Office",
    description: "Modern office workspace",
    promptText: "in a modern office, workspace, professional environment",
  },
  {
    id: "loc-castle",
    name: "Castle",
    description: "Medieval castle setting",
    promptText: "in a medieval castle, stone walls, gothic architecture, historical",
  },
  {
    id: "loc-futuristic-city",
    name: "Futuristic City",
    description: "Sci-fi cityscape",
    promptText: "in a futuristic city, sci-fi architecture, advanced technology, neon lights",
  },
];

// ============================================================================
// LIGHTING PRESETS (~15 for MVP)
// ============================================================================

export const lightingPresets: ScenePreset[] = [
  {
    id: "light-golden-hour",
    name: "Golden Hour",
    description: "Warm sunset/sunrise glow",
    promptText: "golden hour lighting, warm sunlight, soft shadows, magic hour",
  },
  {
    id: "light-natural",
    name: "Natural Light",
    description: "Soft natural daylight",
    promptText: "natural lighting, soft daylight, even illumination",
  },
  {
    id: "light-overcast",
    name: "Overcast",
    description: "Soft diffused cloudy light",
    promptText: "overcast lighting, soft diffused light, cloudy day, no harsh shadows",
  },
  {
    id: "light-blue-hour",
    name: "Blue Hour",
    description: "Cool twilight ambiance",
    promptText: "blue hour, twilight, cool tones, dusk lighting",
  },
  {
    id: "light-studio",
    name: "Studio Lighting",
    description: "Professional three-point setup",
    promptText: "professional studio lighting, three-point lighting, even exposure",
  },
  {
    id: "light-neon",
    name: "Neon",
    description: "Colorful neon glow",
    promptText: "neon lighting, colorful glow, vibrant colors, night atmosphere",
  },
  {
    id: "light-candlelight",
    name: "Candlelight",
    description: "Warm intimate candle glow",
    promptText: "candlelight, warm glow, intimate lighting, soft flames",
  },
  {
    id: "light-dramatic",
    name: "Dramatic",
    description: "High contrast dramatic shadows",
    promptText: "dramatic lighting, high contrast, deep shadows, spotlight effect",
  },
  {
    id: "light-backlit",
    name: "Backlit",
    description: "Subject lit from behind",
    promptText: "backlit, rim lighting, silhouette edges, glowing outline",
  },
  {
    id: "light-moonlight",
    name: "Moonlight",
    description: "Cool nocturnal illumination",
    promptText: "moonlight, night scene, cool blue tones, lunar glow",
  },
  {
    id: "light-harsh-sun",
    name: "Harsh Sunlight",
    description: "Strong midday sun",
    promptText: "harsh sunlight, strong shadows, high noon, intense brightness",
  },
  {
    id: "light-foggy",
    name: "Foggy/Misty",
    description: "Atmospheric fog diffusion",
    promptText: "foggy atmosphere, misty, diffused light, atmospheric haze",
  },
  {
    id: "light-volumetric",
    name: "Volumetric",
    description: "God rays and light beams",
    promptText: "volumetric lighting, god rays, light beams, atmospheric dust",
  },
  {
    id: "light-ring-light",
    name: "Ring Light",
    description: "Even frontal ring illumination",
    promptText: "ring light, even frontal lighting, catch lights in eyes",
  },
  {
    id: "light-noir",
    name: "Film Noir",
    description: "Classic noir lighting style",
    promptText: "film noir lighting, venetian blind shadows, chiaroscuro, moody",
  },
];

// ============================================================================
// CAMERA/COMPOSITION PRESETS (~15 for MVP)
// ============================================================================

export const cameraPresets: ScenePreset[] = [
  {
    id: "cam-close-up",
    name: "Close-up",
    description: "Tight framing on subject",
    promptText: "close-up shot, tight framing, detailed view",
  },
  {
    id: "cam-medium-shot",
    name: "Medium Shot",
    description: "Waist-up framing",
    promptText: "medium shot, waist-up framing, balanced composition",
  },
  {
    id: "cam-wide-shot",
    name: "Wide Shot",
    description: "Full environment visible",
    promptText: "wide shot, full body, environment visible, establishing shot",
  },
  {
    id: "cam-extreme-close-up",
    name: "Extreme Close-up",
    description: "Macro detail focus",
    promptText: "extreme close-up, macro detail, intimate framing",
  },
  {
    id: "cam-low-angle",
    name: "Low Angle",
    description: "Camera looking upward",
    promptText: "low angle shot, looking up, heroic perspective, imposing",
  },
  {
    id: "cam-high-angle",
    name: "High Angle",
    description: "Camera looking downward",
    promptText: "high angle shot, looking down, bird's eye tendency",
  },
  {
    id: "cam-dutch-angle",
    name: "Dutch Angle",
    description: "Tilted dramatic framing",
    promptText: "dutch angle, tilted frame, dynamic tension, dramatic",
  },
  {
    id: "cam-portrait",
    name: "Portrait",
    description: "Classic portrait framing",
    promptText: "portrait composition, head and shoulders, flattering angle",
  },
  {
    id: "cam-birds-eye",
    name: "Bird's Eye View",
    description: "Directly overhead angle",
    promptText: "bird's eye view, overhead shot, top-down perspective",
  },
  {
    id: "cam-worms-eye",
    name: "Worm's Eye View",
    description: "Ground-level looking up",
    promptText: "worm's eye view, ground level, extreme low angle",
  },
  {
    id: "cam-pov",
    name: "POV (First Person)",
    description: "Viewer's perspective",
    promptText: "POV shot, first-person perspective, subjective view",
  },
  {
    id: "cam-over-shoulder",
    name: "Over the Shoulder",
    description: "Behind subject looking forward",
    promptText: "over-the-shoulder shot, behind subject, conversational framing",
  },
  {
    id: "cam-full-body",
    name: "Full Body",
    description: "Complete figure visible",
    promptText: "full body shot, entire figure visible, head to toe",
  },
  {
    id: "cam-bokeh",
    name: "Shallow DOF / Bokeh",
    description: "Blurred background effect",
    promptText: "shallow depth of field, bokeh background, f/1.4 aperture, blurred background",
  },
  {
    id: "cam-symmetrical",
    name: "Symmetrical",
    description: "Centered balanced composition",
    promptText: "symmetrical composition, centered framing, balanced, Wes Anderson style",
  },
];

// ============================================================================
// CATEGORY METADATA
// ============================================================================

export const sceneCategories: Record<SceneCategory, { label: string; description: string; presets: ScenePreset[] }> = {
  style: {
    label: "Style",
    description: "Visual style and artistic approach",
    presets: stylePresets,
  },
  location: {
    label: "Location",
    description: "Setting and environment",
    presets: locationPresets,
  },
  lighting: {
    label: "Lighting",
    description: "Lighting conditions and mood",
    presets: lightingPresets,
  },
  camera: {
    label: "Camera / Composition",
    description: "Camera angle and framing",
    presets: cameraPresets,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all presets for a specific category
 */
export function getPresetsForCategory(category: SceneCategory): ScenePreset[] {
  return sceneCategories[category].presets;
}

/**
 * Find a preset by ID across all categories
 */
export function findPresetById(id: string): ScenePreset | undefined {
  for (const category of Object.values(sceneCategories)) {
    const found = category.presets.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}

/**
 * Search presets by name or description
 */
export function searchPresets(query: string, category?: SceneCategory): ScenePreset[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const presetsToSearch = category
    ? sceneCategories[category].presets
    : [...stylePresets, ...locationPresets, ...lightingPresets, ...cameraPresets];

  return presetsToSearch.filter(
    (preset) =>
      preset.name.toLowerCase().includes(normalizedQuery) ||
      preset.description.toLowerCase().includes(normalizedQuery)
  );
}
