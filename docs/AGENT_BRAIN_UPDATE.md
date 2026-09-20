# Agent Brain Update — Video Reference / AI Editing

This project must understand video creation as a pipeline rather than a single generation call.

## Permanent mental model

REFERENCE VIDEO
→ VIDEO UNDERSTANDING
→ SHOT DETECTION
→ EFFECT/EDIT CLASSIFICATION
→ MODEL CAPABILITY ROUTING
→ GENERATION / EDITING / COMPOSITING
→ TIMELINE ASSEMBLY
→ VALIDATION
→ EXPORT

## Key distinction

Generative video models create or transform visual material.

The editor/compositor controls:
- exact timing
- cuts
- masks
- subject duplication
- transforms
- layer order
- typography
- captions
- beat synchronization
- deterministic transitions
- audio placement
- final render

Never ask a generative model to perform an operation that requires exact deterministic control unless there is a specific reason.

## Reference understanding

A reference video can communicate:
- camera movement
- framing
- subject motion
- choreography
- pose
- scene structure
- transition style
- match cuts
- editing rhythm
- visual style
- lighting
- environment
- compositing language

The agent must distinguish between visual content that should be recreated and editing structure that should be transferred.

## Supported creative patterns to recognize

1. Match cut
2. Jump cut
3. Whip transition
4. Speed ramp
5. Beat cut
6. Subject duplication
7. Cutout collage
8. Person replacement
9. Outfit replacement
10. Scene/location replacement
11. Object replacement
12. Product reveal
13. Motion typography
14. Hand-drawn/animated overlays
15. Mixed-media compositing
16. Camera-motion recreation
17. Style transfer
18. Multi-shot music-video assembly

## Agent decision rule

For every requested effect ask internally:

“Is this generation, transformation, or editing?”

Then route accordingly.

Generation:
create new pixels/video.

Transformation:
change a supplied visual while preserving requested motion/identity/structure.

Editing:
arrange, mask, cut, transform, synchronize or composite existing/generated assets.

Many real-world AI edits require all three.

## User workflow

The user should be able to say:

“Analyze this reference and apply the editing style to my footage.”

The agent should automatically:
1. analyze the reference
2. identify shots/effects
3. identify required assets
4. ask only for genuinely missing assets
5. create prompts
6. select compatible models
7. generate/edit each shot
8. assemble the timeline
9. show the user what was changed
10. preserve editable control

## Do not regress existing capabilities

Dola Seed Studio already positions Dola Seed as a multimodal assistant and includes video input, image/video analysis, agent workflows, a video editor and a 4-track timeline. Preserve these capabilities while extending reference-video intelligence.

Aurora is the visual studio/editor and should remain focused on a polished creative UI and an editable workflow. Do not replace working UI with a backend-only implementation.

## Persistent project memory

For every reference project, persist:
- reference asset IDs
- analysis
- shot list
- effect classifications
- prompts
- model/provider
- generation settings
- masks
- layer graph
- timeline operations
- generated asset IDs
- user overrides
- validation results

This allows the agent to continue editing without re-analyzing everything.

## Quality gate

Before declaring a recreation complete, compare:
- subject identity
- pose/action
- camera/framing
- scene composition
- transition timing
- layer placement
- typography
- color/lighting
- audio/beat timing
- output aspect ratio

Return a list of mismatches and provide a targeted correction rather than regenerating the entire project unnecessarily.
