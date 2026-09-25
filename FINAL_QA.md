# Final QA

## Functional

| Feature | Status | Notes |
| --- | --- | --- |
| Static site load | PASS | Browser loaded `index.html` and one WebGL canvas. |
| Password gate | PASS | Initial gate verified in browser. |
| Wrong password messaging | PASS | Three required progressive responses verified. |
| Password `17042026` | PASS | Gate hides and controls are enabled after successful entry. |
| Orbit controls | PASS | `controls.enabled` verified after unlock; local OrbitControls is retained. |
| Zoom limits | PASS | Existing min/max distance and polar-angle limits retained. |
| Seven memory flow | PASS | Six standard lanterns plus one final lantern use data from `assets/memories.js`. |
| Duplicate progress | PASS | Clicking the first lantern twice left opened count at one. |
| Final lantern unlock | PASS | Opening six regular lanterns revealed the final lantern. |
| Ending | PASS | Final lantern triggers finale state and completed 7/7 progress. |
| Music control | PASS | Existing button toggles the looped audio element. Playback still requires a user gesture by browser policy. |
| Camera reset | PASS | Existing reset function is now connected to its button. |
| Fullscreen | PASS | Fullscreen control calls the browser Fullscreen API. |

## Visual

| Feature | Status | Notes |
| --- | --- | --- |
| Floating garden foundation | PASS | Layered island, dark rock palette, garden clusters, roots, and edge rocks are present. |
| Hero tree | PASS | Active composed tree replaces the inherited rendered particle tree. |
| Moon/tree/couple hierarchy | PASS | Hero camera was visually checked after composition tuning. |
| Lantern hierarchy | PASS | Decorative lantern count and scale were reduced; interactive lanterns remain raycastable. |
| Character readability | PASS | Couple is lit locally and positioned in foreground beside the hero tree. |
| Multi-angle visual QA | PARTIAL | Orbit architecture supports it, but automated visual capture covered the hero view only. |

## Responsive

| Viewport | Status | Notes |
| --- | --- | --- |
| Desktop preview | PASS | WebGL, gate, memory modal, and progression were exercised. |
| Mobile portrait 390x844 | PASS | Gate/input fit, no horizontal overflow, post-unlock canvas and controls were verified. |
| Tablet and landscape | PARTIAL | CSS uses fluid constraints and existing mobile renderer settings; manual device inspection remains recommended. |

## Performance

| Check | Status | Notes |
| --- | --- | --- |
| Particle reduction | PASS | Canopy particle count was reduced from 22k/38k to 900/1700. |
| Lantern reduction | PASS | Decorative lanterns reduced to 3/5 by device tier. |
| Quality tiers | PASS | Existing mobile particle, star, and renderer pixel-ratio tiers remain active. |
| Instancing / profiler | PARTIAL | Garden meshes are procedural but not instanced; no frame-time profiler is configured. |

## Remaining Limitations

- The password is a client-side experience gate, not authentication security.
- The scene relies on procedural geometry rather than imported GLB characters/environment assets.
- Automated visual review covered the hero view and mobile layout; manual review of all orbit angles and physical target devices remains useful before sharing broadly.