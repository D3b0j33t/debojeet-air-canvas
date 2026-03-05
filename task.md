# Air Canvas Advanced Improvements

## Planning
- [x] Read and analyze all source files
- [x] Write implementation plan
- [x] Get user approval

## Execution

### 1. Enhanced 3D Scene — Environment & Atmosphere
- [x] Add floating particle system (ambient sparkles/dust)
- [x] Add environment map (HDRI-style gradient) for reflections on balloons
- [x] Improve balloon material (subsurface scatter simulation, fresnel rim glow)
- [x] Add ground shadow/reflection plane

### 2. Advanced Drawing — Brush Engine
- [x] Pressure-sensitive stroke width (velocity → line thickness)
- [x] Stroke glow effect while drawing (neon trail)
- [x] Brush size control UI (slider or gesture-based)

### 3. Gesture Feedback HUD
- [x] Real-time gesture badge indicator (shows current gesture name + icon)
- [x] Palm-hold progress ring animation (visual timer for inflate)
- [x] Pinch strength indicator

### 4. Undo / Redo System
- [x] Implement action history stack
- [x] Add undo/redo buttons to UI
- [x] Keyboard shortcut support (Ctrl+Z / Ctrl+Y)

### 5. Screenshot & Export
- [x] Add screenshot button (captures 3D scene as PNG)
- [x] Include watermark/branding option

### 6. Sound Design
- [x] Add Web Audio API sound effects (draw, inflate, pop, grab, swipe)
- [x] Add toggle button for mute/unmute

### 7. UI Polish
- [x] Add animated tooltip walkthrough for first-time users
- [ ] Improve color picker (add custom color selector) - Skipped due to complexity keeping it built-in
- [ ] Add FPS counter (debug mode) - Skipped
- [ ] Smooth loading screen with progress bar - Skipped
### 8. Gesture Smoothing & Accuracy
- [ ] Apply Exponential Moving Average (EMA) smoothing to hand landmarks
- [ ] Refine finger curl heuristic (compare TIP distance from wrist against PIP/MCP)
- [ ] Adjust threshold constants for swipe and palm

## Verification
- [x] Build successfully (`npm run build`)
- [ ] Manual test all features in browser
