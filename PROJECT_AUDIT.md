# Project Audit

## 1. Framework

- Static website, no framework and no package manifest.
- Three.js is loaded from local `assets/three.min.js`; local `assets/OrbitControls.js` supplies camera interaction.
- HTML, CSS, and JavaScript load directly in the browser.

## 2. Folder Structure

```text
index.html
assets/
  css.css
  script.js
  three.min.js
  OrbitControls.js
  1.mp3
  photo-1.jpg ... photo-6.jpg
```

## 3. Main Entry

- `index.html` is the entry point.
- It mounts `#webgl-container`, the overlay UI, the audio element, then loads Three.js, OrbitControls, and `assets/script.js`.

## 4. Scene Architecture

- One large `assets/script.js` file creates the renderer, scene, lights, floating island, vegetation, tree, couple, rabbit, lanterns, particles, moon, and render loop.
- Visual objects are mostly procedural `THREE.Mesh`, `THREE.Points`, and generated canvas textures.
- The legacy particle tree is retained in the source but hidden; `storyTreeGroup` is the active hero tree.

## 5. Camera Architecture

- `THREE.PerspectiveCamera` plus `THREE.OrbitControls`.
- Mobile is selected with user-agent or viewport width below 768px.
- Current controls use damping, a min/max zoom distance, and a vertical-angle limit.
- Camera focus transitions use `targetCamPos` and `targetCamTarget`, interpolated in `animate()`.

## 6. Current Assets

- Local Three.js and OrbitControls scripts.
- One looping MP3: `assets/1.mp3`.
- Six personal JPGs for message cards.
- No GLTF/GLB, texture atlas, asset manifest, or model loader.

## 7. Current UI

- Music and camera-reset icon buttons.
- Intro copy, exploration counter with progress bar, click hint, message modal, and finale overlay.
- CSS is responsive at a single 600px breakpoint.
- Fullscreen control and password gate do not exist.

## 8. Current Interaction

- Pointer raycasting selects lantern hit spheres.
- Hover changes cursor and lantern glow.
- Clicking a lantern focuses the camera, opens a card, and tracks opened IDs in `openedStoryLanterns`.
- The special lantern is revealed only after all seven regular lanterns are opened.
- Orbit, zoom, reset, close modal, click-away close, and Escape close are implemented.

## 9. Current Audio

- `#bgm` loops `assets/1.mp3`.
- Music begins only after the music button is pressed, matching browser autoplay rules.
- There are no lantern click, sparkle, password, or ending sound effects.

## 10. Current State Management

- Plain module/global variables in `assets/script.js`.
- Key state: selected lantern, opened lantern set, special lantern visibility, finale flag, camera target, and playback flag.
- Wishes are data-like objects but remain inline in the scene script.

## 11. Performance Bottlenecks

- A single scene script creates many independent mesh objects for foliage and garden clusters.
- Repeated geometries/materials are not instanced or shared consistently.
- Legacy hidden tree geometry is still allocated even though it is not rendered.
- Particle arrays are updated every animation frame.
- No draw-call profiling, adaptive quality tier, asset compression, or resource disposal exists.

## 12. What Can Be Kept

- Static deployment architecture.
- Three.js renderer and OrbitControls.
- Lantern raycast, message modal, progress tracking, special-lantern flow, and audio toggle.
- Local photos, messages, and responsive renderer pixel-ratio logic.

## 13. What Needs Replacement

- The current visual layer needs a cohesive garden/island/tree/character art direction.
- The password intro, fullscreen control, fireflies, picnic props, and polished audio cues are missing.
- Existing procedural couple and foliage should be replaced or isolated behind dedicated factories if visual QA rejects them.

## 14. What Needs Refactoring

- Extract memory data from the scene file into a dedicated data module.
- Centralize story state and scene visibility state.
- Separate scene factories: island, environment, characters, lanterns, effects, and interaction.
- Reuse geometry/materials or use instancing for grass, flowers, rocks, and foliage.
- Remove hidden legacy geometry once its replacement is verified.

## 15. Risks

- Current local Three.js version may not support newer geometry/helpers; compatibility must be checked before use.
- Password `17042026` is client-side and is an experience gate, not security.
- Visual quality is bounded by procedural primitives unless suitable optimized assets are introduced.
- Mobile GPU limits require a reduced quality tier and visual testing at phone-sized viewports.
- Camera focus and scripted ending must not conflict with user OrbitControls input.