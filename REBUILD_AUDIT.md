# Rebuild Audit

## 1. Things That Are Working

- Static Vercel deployment, local Three.js renderer, OrbitControls, and mobile pixel-ratio tier work without a build step.
- The password gate, password `17042026`, progressive hints, scene unlock, music toggle, reset, fullscreen control, lantern raycasting, modal, progress, and final state are implemented.
- Personal photos and memory data are local; `assets/memories.js` already provides a data-driven memory surface.

## 2. Things That Are Visually Below The Required Bar

- The active island reads as a large procedural disc; its top, soil, and underside do not yet form an organic storybook silhouette.
- The tree is built from procedural primitives. Its trunk/canopy revisions improved structure but still read as technical geometry rather than a premium hero asset.
- The couple is made from cylinders/spheres. It does not meet the requested premium stylized-character quality or natural seated silhouette from multiple views.
- The garden is composed of many repeated mesh clusters and reads as scatter rather than authored environmental storytelling.
- Current material, moon, particles, and lanterns have individual improvements but not a unified cinematic art direction.

## 3. Things To Keep

- `index.html` bootstrapping, Three.js, OrbitControls, responsive renderer settings, password flow, data-driven memories, interaction state, audio element, and Vercel deployment.
- The personal photos and all seven-memory/final-story concepts.

## 4. Things To Rewrite

- Visual scene factories: island, tree, couple, vegetation, props, moon/sky, lantern presentation, and lighting.
- Scene initialization should become a visual-world factory separate from interaction and UI state.
- Lantern visual meshes should be separated from memory state so art can change without breaking raycasting.

## 5. Assets To Remove Or Retire

- The hidden legacy tree particle system and its generated branches after replacement verification.
- The current primitive couple factory after an asset-backed or deliberately stylized replacement exists.
- Repeated ad-hoc garden meshes that do not serve the composition.

## 6. Assets To Replace Or Add

- One cohesive stylized environment asset set or a deliberately authored procedural equivalent.
- A real low-poly/stylized couple GLB with a seated embrace pose, or a custom rigged model prepared outside this repository.
- A small set of authored props: picnic textile, mooncake box, tea set, and one rabbit.
- Reusable plant/flower/rock instances and a soft moon texture/shader.

## 7. Performance Issues

- `assets/script.js` is currently 1,185 lines and owns rendering, scene construction, animation, UI state, and interaction.
- Foliage, flowers, and rocks create many individual mesh objects instead of shared instanced geometry.
- Hidden legacy visual objects are still constructed.
- Per-frame particle and object loops are global and unprofiled.

## 8. UX Issues

- The password unlock is functional but the reveal fades the overlay rather than staging the requested sequential world reveal.
- Camera focus does not preserve the exact user camera position before a lantern focus.
- Memory card is functional but dark/glass-like rather than the requested warm cream handwritten note.

## 9. Art Direction Issues

- Primitive geometry mixes organic, low-poly, and soft-shape treatments without a single asset standard.
- The tree and couple do not meet the scene's premium focal-point requirements.
- Visual hierarchy must make couple, tree, moon, lanterns, garden, island, then sky readable in that order.

## 10. Recommended Architecture

- Keep the static deployment and Three.js runtime.
- Split `assets/script.js` into `world.js`, `characters.js`, `lanterns.js`, `experience.js`, and `ui.js` once the visual scene is rebuilt.
- Keep `assets/memories.js` as the content source.
- Use a `worldState` object to coordinate gate, reveal, exploration, final state, and camera restoration.
- Use shared geometry/materials or `THREE.InstancedMesh` for vegetation and background detail.
- Prefer GLB assets for the hero couple/tree if a compatible licensed asset is available; otherwise keep the procedural fallback explicitly stylized and lower scope expectations.

## Rebuild Decision

The interaction/story architecture should be preserved. The visual world should be rebuilt rather than patched further. The first implementation task is to isolate the existing visual factories from lantern/state logic so replacement assets do not alter the seven-memory story.