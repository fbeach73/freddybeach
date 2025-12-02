# Implementation Plan: Nano Banana Pro Style Image Generator

## Files Overview

### New Files to Create
| File | Purpose |
|------|---------|
| `src/lib/data/scene-presets.ts` | Preset data arrays for all 4 scene settings |
| `src/components/generate/scene-selector-modal.tsx` | Reusable modal: search + cards + custom input |
| `src/components/generate/scene-settings.tsx` | 4 dropdown triggers for Style/Location/Lighting/Camera |
| `src/components/generate/subjects-panel.tsx` | "Subjects" section (repurposed avatars) |
| `src/components/generate/preview-generate.tsx` | Center column: presets, prompt textarea, gen settings |
| `src/components/generate/results-panel.tsx` | Right column: generated images grid |

### Files to Modify
| File | Change |
|------|--------|
| `src/app/dashboard/ai-tools/image-generator/page.tsx` | Convert to 3-column grid layout |
| `src/lib/types/image-generation.ts` | Add ScenePreset, SceneSettings types |
| `src/components/generate/generation-output.tsx` | Simplify for results column use |

---

## Phase 1: Data & Types

### Tasks
- [x] Create `src/lib/data/scene-presets.ts` with preset arrays:
  - [x] Style presets (~20 for MVP): Photorealistic, Hyperrealistic, Raw Photography, Film Photography, 3D Animation, 3D Render, Cinematic, Watercolor, Oil Painting, Pencil Sketch, etc.
  - [x] Location presets (~20 for MVP): Urban City, Forest, Beach, Mountain, Studio, Rooftop, Subway, Cafe, Library, Desert, etc.
  - [x] Lighting presets (~15 for MVP): Golden Hour, Natural Light, Overcast, Blue Hour, Studio Lighting, Neon, Candlelight, etc.
  - [x] Camera presets (~15 for MVP): Close-up, Medium Shot, Wide Shot, Extreme Close-up, Low Angle, High Angle, Dutch Angle, etc.

- [x] Update `src/lib/types/image-generation.ts`:
  - [x] Add `ScenePreset` type: `{ id: string, name: string, description: string, promptText: string }`
  - [x] Add `SceneSettings` type: `{ style?: ScenePreset | string, location?: ScenePreset | string, lighting?: ScenePreset | string, camera?: ScenePreset | string }`
  - [x] Update `GenerationSettings` to include optional `sceneSettings`

---

## Phase 2: Scene Selector Modal Component

### Tasks
- [x] Create `src/components/generate/scene-selector-modal.tsx`:
  - [x] Props: `open`, `onOpenChange`, `title`, `presets`, `value`, `onSelect`
  - [x] Search input at top to filter presets by name/description
  - [x] "Custom Value" section with text input and "Use Custom" button
  - [x] Display count: "X presets available"
  - [x] 3-column grid of preset cards
  - [x] Each card shows: name (bold), description, code preview (monospace)
  - [x] Radio/checkbox indicator on each card for selection state
  - [x] Footer with "No selection" button and "Cancel" button
  - [x] Selected preset highlighted with border/background

---

## Phase 3: Left Column - Scene Settings

### Tasks
- [x] Create `src/components/generate/scene-settings.tsx`:
  - [x] "SCENE SETTINGS" header
  - [x] 4 selector buttons/dropdowns:
    - [x] Style - "Select or type style..."
    - [x] Location - "Select or type location..."
    - [x] Lighting - "Select or type lighting..."
    - [x] Camera / Composition - "Select or type camera angle..."
  - [x] Each button opens SceneSelectorModal with appropriate presets
  - [x] Display selected value name in button, or placeholder if none
  - [x] Arrow icon on right side of each button

---

## Phase 4: Left Column - Subjects Panel

### Tasks
- [x] Create `src/components/generate/subjects-panel.tsx`:
  - [x] "Subjects" header with "+ Add Subject" button on right
  - [x] Empty state: dashed border box with "No subjects added yet" and "+ Add Your First Subject" button
  - [x] When subjects exist: list of subject cards with name, type badge, remove button
  - [x] Integrate with existing `useAvatars` hook
  - [x] "+ Add Subject" opens existing avatar creation dialog

---

## Phase 5: Center Column - Preview & Generate

### Tasks
- [x] Create `src/components/generate/preview-generate.tsx`:
  - [x] "Preview & Generate" header
  - [x] "Review your prompt and generate images" subtitle
  - [x] Preset buttons row: "No Presets" (folder icon) | "Save Preset" (save icon)
  - [x] "Generated Prompt" label
  - [x] Editable textarea (auto-populated from scene settings)
  - [x] "GENERATION SETTINGS" section header
  - [x] Number of Images: 4 toggle buttons (1, 2, 3, 4)
  - [x] Resolution: Select dropdown (1K, 2K, 4K)
  - [x] Aspect Ratio: Select dropdown (1:1, 16:9, 9:16, 4:3, 3:4, 21:9)
  - [x] Conditional render:
    - [x] If no API key: message + "Go to Profile" button
    - [x] If has API key: Generate button with loading state

---

## Phase 6: Right Column - Results Panel

### Tasks
- [x] Create `src/components/generate/results-panel.tsx`:
  - [x] "Results" header
  - [x] "Your generated images will appear here" subtitle
  - [x] Empty state: centered image icon + "No images yet" + "Build your prompt and generate images"
  - [x] When images exist: responsive grid of image cards
  - [x] Each image card: thumbnail, hover overlay with actions
  - [x] Click image to open detail/refinement modal
  - [x] Integrate with existing generation output logic

---

## Phase 7: Page Layout Restructure

### Tasks
- [x] Update `src/app/dashboard/ai-tools/image-generator/page.tsx`:
  - [x] Remove existing tab navigation structure
  - [x] Create 3-column responsive grid: `grid-cols-1 lg:grid-cols-[320px_1fr_320px]`
  - [x] Left column: Card with SceneSettings + SubjectsPanel
  - [x] Center column: Card with PreviewGenerate
  - [x] Right column: Card with ResultsPanel
  - [x] Add gap between columns
  - [x] Mobile: single column stack

---

## Phase 8: Prompt Assembly & State Management

### Tasks
- [x] Create `assemblePrompt()` utility function:
  - [x] Input: SceneSettings + Subjects array
  - [x] Output: formatted prompt string
  - [x] Pattern: "{style}. {subject descriptions}. in {location}. {lighting}. {camera}."
  - [x] Handle missing/empty values gracefully

- [x] Wire up state management in page.tsx:
  - [x] `sceneSettings` state for 4 scene selections
  - [x] `assembledPrompt` state (auto-updates from scene settings)
  - [x] `editedPrompt` state (tracks user edits)
  - [x] `useEffect` to reassemble prompt when scene settings change
  - [x] Preserve user edits flag (don't overwrite if user has edited)

- [x] Connect to existing systems:
  - [x] `useGeneration` hook for image generation
  - [x] `usePresets` hook for preset save/load (extend to include scene settings)
  - [x] `useAvatars` hook for subjects

---

## Phase 9: Polish & Refinements

### Tasks
- [x] Style matching:
  - [x] Dark card backgrounds matching screenshots
  - [x] Proper spacing and typography
  - [x] Border colors and hover states
  - [x] Button styling consistency

- [x] Mobile responsiveness:
  - [x] Test column stacking on mobile
  - [x] Adjust modal sizes for mobile
  - [x] Touch-friendly button sizes

- [x] Loading states:
  - [x] Skeleton loaders for images
  - [x] Generate button loading spinner
  - [x] Preset loading states

- [x] Error handling:
  - [x] Generation error display
  - [x] API key missing state
  - [x] Network error handling

---

## Component Tree (Final Structure)

```
ImageGeneratorPage
├── PromptBuilderColumn (left card)
│   ├── SceneSettings
│   │   ├── StyleSelector → SceneSelectorModal
│   │   ├── LocationSelector → SceneSelectorModal
│   │   ├── LightingSelector → SceneSelectorModal
│   │   └── CameraSelector → SceneSelectorModal
│   └── SubjectsPanel
│       └── (uses existing avatar system)
├── PreviewGenerateColumn (center card)
│   ├── PresetButtons (No Presets / Save Preset)
│   ├── PromptTextarea (editable)
│   └── GenerationSettings
│       ├── ImageCountButtons (1-4)
│       ├── ResolutionSelect
│       ├── AspectRatioSelect
│       └── GenerateButton / GoToProfileButton
└── ResultsColumn (right card)
    ├── EmptyState OR ImageGrid
    └── RefinementModal (opened on image click)
```

---

## Dependencies

### shadcn/ui Components (already installed)
- Button, Card, Dialog, Select, Input, Textarea, Badge, Skeleton

### May Need to Add
- [ ] Check if Command component needed for search (or use filtered list)
- [ ] RadioGroup may help for preset selection
