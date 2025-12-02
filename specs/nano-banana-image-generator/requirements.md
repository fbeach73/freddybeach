# AI Image Generator - Nano Banana Pro Style Redesign

## Overview
Redesign the `/dashboard/ai-tools/image-generator` page to match the Nano Banana Pro UI/UX pattern with structured prompt building via searchable preset modals.

## Target Design

### Layout
3-column responsive layout:
1. **Left Column - Prompt Builder**: Scene Settings (4 dropdowns) + Subjects section
2. **Center Column - Preview & Generate**: Preset buttons, Editable Generated Prompt textarea, Generation Settings
3. **Right Column - Results**: Generated images display

### Reference Screenshots
- `/docs/technical/nano-banana/nanogenerate1.jpg` - Main layout
- `/docs/technical/nano-banana/nanogenerate2.jpg` - Lower section
- `/docs/technical/nano-banana/additionalRefinements/nanoStyle.jpg` - Style selector modal
- `/docs/technical/nano-banana/additionalRefinements/nanoLocation.jpg` - Location selector modal
- `/docs/technical/nano-banana/additionalRefinements/nanoLighting.jpg` - Lighting selector modal
- `/docs/technical/nano-banana/additionalRefinements/nanoCameras.jpg` - Camera selector modal

## Functional Requirements

### Scene Settings (Left Column)
- **Style Selector**: Modal with 58 presets, search functionality, custom value input
- **Location Selector**: Modal with 59 presets, search functionality, custom value input
- **Lighting Selector**: Modal with 30 presets, search functionality, custom value input
- **Camera/Composition Selector**: Modal with 32 presets, search functionality, custom value input

Each selector modal includes:
- Search input to filter presets
- Custom value input with "Use Custom" button
- 3-column grid of preset cards (name, description, prompt text preview)
- Single selection (radio-style)
- "No selection" and "Cancel" buttons

### Subjects Panel (Left Column)
- Repurpose existing Avatar system as "Subjects"
- "+ Add Subject" button
- Empty state: "No subjects added yet"
- List of selected subjects with remove option

### Preview & Generate (Center Column)
- "No Presets" / "Save Preset" buttons in header
- **Generated Prompt**: Editable textarea that auto-populates from scene selections
- User can manually edit the generated prompt
- **Generation Settings**:
  - Number of Images: 4 buttons (1, 2, 3, 4)
  - Resolution dropdown: 1K, 2K (default), 4K
  - Aspect Ratio dropdown: 1:1 (default), 16:9, 9:16, 4:3, 3:4, 21:9
- Generate button (or "Go to Profile" when no API key)

### Results Panel (Right Column)
- Header: "Results" with subtitle "Your generated images will appear here"
- Empty state: image icon + "No images yet" message
- Grid display of generated images
- Click image to open refinement modal

### Prompt Assembly Logic
Automatically combine selected scene settings into prompt:
```
{style.promptText}. {subject descriptions}. {location.promptText}. {lighting.promptText}. {camera.promptText}
```

## User Decisions Captured
1. **Avatars → Subjects**: Repurpose existing Avatar system as "Subjects" (simpler, less work)
2. **Editable Prompt**: Generated prompt builds from selections but user CAN edit it directly
3. **Refinement**: Keep refinement feature, move to dialog/modal triggered from image click

## Technical Constraints
- Must work with existing Gemini API integration (no backend changes)
- Must work with existing avatar/preset database schema
- Must maintain existing token tracking for free tier users
- Responsive design: stack columns on mobile
