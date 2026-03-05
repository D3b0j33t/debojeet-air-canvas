# Air Canvas — Advanced Improvements

Transform the existing gesture-based air drawing app into a **premium, polished, feature-rich** experience. The current app already converts 2D hand-drawn strokes into 3D balloon objects with multiplayer support. These improvements focus on visual richness, usability, and wow-factor.

## Proposed Changes

### 1. Ambient Particle System + Scene Atmosphere

#### [MODIFY] [scene3D.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/scene3D.ts)

- Add a floating **particle system** (500+ dust/sparkle particles drifting across the scene using `THREE.Points` + custom shader material)
- Create a procedural **gradient environment map** (`THREE.CubeTexture` from canvas) for realistic reflections on balloon surfaces
- Add a subtle **ground plane** with soft shadow reception (large transparent plane at y=-3)

#### [MODIFY] [balloonInflator.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/balloonInflator.ts)

- Upgrade balloon material: add **fresnel rim glow** (custom [onBeforeCompile](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/scene3D.ts#323-338) shader injection), increase envMap intensity, simulate **subsurface scattering** via tinted translucency
- Add a subtle **iridescent color shift** based on view angle

---

### 2. Velocity-Sensitive Brush Engine + Neon Trail

#### [MODIFY] [drawingCanvas.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/drawingCanvas.ts)

- Compute instantaneous velocity between points; map to **dynamic stroke width** (fast = thin, slow = thick)
- Add **neon glow trail** effect: render a blurred wider stroke behind the main stroke with reduced opacity
- Render stroke segments individually with per-point width rather than uniform `lineWidth`

#### [MODIFY] [constants.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/constants.ts)

- Add `STROKE.WIDTH_MIN`, `STROKE.WIDTH_MAX`, `STROKE.VELOCITY_SCALE` constants
- Add sound-related constants (`AUDIO.ENABLED_DEFAULT`)

---

### 3. Gesture Feedback HUD

#### [MODIFY] [index.html](file:///c:/Users/HP/Desktop/debojeet-air-canvas/index.html)

- Add **gesture badge** container (floating pill showing current gesture name + emoji)
- Add **palm-hold progress ring** SVG element (circular progress indicator around cursor area)
- Add **undo/redo buttons**, **screenshot button**, **sound toggle button**, **brush size slider** to UI
- Add **onboarding tooltip overlay** for first-time users (3-step walkthrough)
- Add **custom color picker** with hex input + hue slider

#### [MODIFY] [handVisualizer.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/handVisualizer.ts)

- Render a **circular progress arc** around the cursor during palm-hold-to-inflate
- Render **pinch strength indicator** (line between thumb and index with color gradient based on distance)
- Add distinct visual modes for each gesture state (different cursor styles)

---

### 4. Undo / Redo System

#### [NEW] [undoManager.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/undoManager.ts)

- Implement a generic action history stack with [UndoableAction](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/undoManager.ts#3-8) interface
- Support actions: [CreateBalloon](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/undoManager.ts#9-35), [RemoveBalloon](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/undoManager.ts#36-56), `ClearAll`
- Max history depth: 30 actions

#### [MODIFY] [main.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/main.ts)

- Integrate [UndoManager](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/undoManager.ts#57-117) — push actions on balloon create/remove
- Wire up Ctrl+Z / Ctrl+Y keyboard shortcuts
- Wire up undo/redo UI buttons

---

### 5. Screenshot & Export

#### [MODIFY] [main.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/main.ts)

- Add [takeScreenshot()](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/main.ts#852-894) method: render 3D scene to canvas, composite with drawing canvas, export as PNG via `canvas.toDataURL()` and trigger download
- Add screenshot button click handler

---

### 6. Sound Design

#### [NEW] [audioManager.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/audioManager.ts)

- Web Audio API–based sound engine with procedurally generated sounds (no external audio files needed):
  - **Draw**: soft sine-wave hum that follows finger movement frequency
  - **Inflate**: rising pitch whoosh (frequency sweep from 200→800Hz)
  - **Pop/Remove**: short noise burst with decay
  - **Grab**: soft click
  - **Swipe**: quick swoosh (filtered noise)
- Mute/unmute toggle with state persistence in `localStorage`

#### [MODIFY] [main.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/main.ts)

- Integrate [AudioManager](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/audioManager.ts#5-227) calls at appropriate gesture transition points

---

### 7. UI Polish & Onboarding

#### [MODIFY] [index.html](file:///c:/Users/HP/Desktop/debojeet-air-canvas/index.html)

- **Onboarding overlay**: 3-step modal walkthrough (Point→Draw, Palm→Inflate, Pinch→Grab) with illustrations, shown on first visit (tracked via `localStorage`)
- **Custom color picker**: replace simple swatches with expandable panel including hue slider + hex input
- **Loading progress**: convert spinner to progress bar with percentage text
- Improved responsive styles

#### [MODIFY] [main.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/main.ts)

- Wire up onboarding flow with localStorage check
- Wire up sound toggle button
- Wire up brush size slider

#### [MODIFY] [types.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/types.ts)

- Add [UndoableAction](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/undoManager.ts#3-8) types, `AudioState` interface
- Add [brushSize](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/drawingCanvas.ts#35-38) to [Stroke](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/types.ts#14-21) type

---

---

### 8. Gesture Smoothing & Accuracy

#### [MODIFY] [handTracking.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/handTracking.ts)
- Implement EMA (Exponential Moving Average) smoothing on raw landmarks before sending to callbacks.
- Reduces jitter significantly for drawing and pinch interactions.

#### [MODIFY] [gestureDetector.ts](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/gestureDetector.ts)
- Fix the [isFingerExtended](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/gestureDetector.ts#145-157) and [isThumbExtended](file:///c:/Users/HP/Desktop/debojeet-air-canvas/src/gestureDetector.ts#158-170) logic. A closed fist shouldn't accidentally trigger a point.
- Ensure state transition thresholds are stable.

---

## Verification Plan

### Automated Tests

- `npm run build` — must pass with zero errors (TypeScript compilation + Vite bundling)

### Manual Verification

The following should be tested by opening the deployed/local app in Chrome:

1. **Particle System**: On load, tiny sparkle particles should float across the 3D scene background
2. **Balloon Materials**: Created balloons should have visible reflections and a subtle rim glow
3. **Dynamic Stroke Width**: Drawing slowly produces thick lines; fast movement produces thin lines
4. **Neon Glow**: Active strokes should have a subtle outer glow while drawing
5. **Gesture Badge**: A floating pill in the UI should update to show the current gesture (DRAW / PINCH / PALM etc.)
6. **Palm Progress Ring**: When holding an open palm, a circular progress indicator should fill up around the cursor over 500ms
7. **Undo/Redo**: After creating a balloon, press Ctrl+Z — balloon should be removed. Press Ctrl+Y — balloon should reappear
8. **Screenshot**: Click the camera button — a PNG file should download containing the current scene
9. **Sound Effects**: Drawing, inflating, and popping balloons should produce subtle sounds. The mute button should toggle all sounds
10. **Onboarding**: Clear localStorage and reload — a 3-step walkthrough modal should appear. After dismissing, it should not appear again on reload
11. **Brush Size**: The brush size slider should change the stroke width in real-time
12. **Build**: `npm run build` should succeed with exit code 0
