# Implementation Plan

## PHASE 1 - Visual foundation

- Rebuild the floating island as layered garden surface, soil/cliff, and rocky underside.
- Establish the navy, cream, amber, muted-green, dusty-pink palette and baseline lighting.
- Verify hero composition, no clipping, and clear visual hierarchy.

## PHASE 2 - Environment

- Build the landmark tree, clustered grass/flowers/bushes/rocks, roots, moon, lantern depth, fireflies, and small picnic props.
- Validate front, back, left, right, high, and low camera views.

## PHASE 3 - Characters

- Replace or refine the couple through a dedicated character factory.
- Verify readable seated embrace, moon-facing heads/eyes, natural limbs, and multi-angle silhouette.

## PHASE 4 - Camera

- Tune orbit, zoom, mobile gestures, target, damping, and constraints.
- Validate hero, close, and wide compositions without clipping or inversion.

## PHASE 5 - Intro + password

- Add a dark intro gate, password `17042026`, progressive incorrect-password hints, cinematic reveal, and interaction lock/unlock.

## PHASE 6 - 7 lantern memories

- Move memory data to a dedicated module.
- Keep seven unique interactive lanterns, prevent duplicate progress, preserve/restores camera state, and validate desktop/mobile interaction.

## PHASE 7 - Ending

- Promote the seventh/final lantern after the prerequisite memories.
- Implement pacing, final message, subtle scene enhancement, and a stable 7/7 end state.

## PHASE 8 - Polish

- Add restrained idle animation, fireflies, petals, dust, UI polish, fullscreen, audio cues, typography, and smooth transitions.

## PHASE 9 - Performance

- Profile object counts and update loops.
- Introduce shared geometry/materials or instancing, quality tiers, and remove superseded visual objects.

## PHASE 10 - Final QA

- Run functional, visual, character, camera, and responsive checks.
- Record evidence in `FINAL_QA.md`; unresolved items remain explicitly marked rather than passed.