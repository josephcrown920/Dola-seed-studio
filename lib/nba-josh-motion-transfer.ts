export const MOTION_TRANSFER_SKILL = {
  name: "nba-josh-motion-transfer",
  description: "Transfers dance/walk/performance motion from any reference video to NBA Josh, preserving exact choreography, camera movement, and timing.",
  referenceClip: {
    source: "Sidewalk walking rap performance (josifromdablock style)",
    duration: 20,
    camera: "Dolly tracking shot moving parallel to subject, foreground car parallax",
    choreography: [
      "0:00 - 0:02: Front-facing rap, hand gestures toward camera",
      "0:02 - 0:05: Car passes in foreground, subject continues performing",
      "0:05 - 0:08: Turn to side, walking motion, arm movements",
      "0:08 - 0:12: Dancing / bouncing side to side, hand gestures",
      "0:12 - 0:16: Car passes in foreground again, subject keeps walking",
      "0:16 - 0:20: Walking toward camera, confident swagger, ending pose"
    ],
    style: "Viral TikTok sidewalk rap walk, London terrace houses background, natural daylight, passing cars foreground parallax"
  },
  stages: [
    { id: "motion-analysis", description: "Extract exact pose, motion, camera movement from reference" },
    { id: "character-transfer", description: "Apply motion to NBA Josh character, preserve all movement" },
    { id: "scene-replacement", description: "Replace background with target location, preserve lighting" },
    { id: "lip-sync", description: "Sync mouth movements to hook audio" },
    { id: "final-composite", description: "Color grade, add text captions, final polish" }
  ] as const,
  failClosedRules: [
    "Must preserve 100% of the source motion timing",
    "Camera movement must match exactly (dolly speed, parallax)",
    "Character identity must match NBA Josh 100%",
    "No deformation or warping of character during motion transfer"
  ]
};

// 10 motion transfer variations (different locations + outfits)
export const MOTION_TRANSFER_VARIATIONS = [
  {
    id: 1,
    name: "Lekki Boardwalk",
    location: "Lekki Phase 1 beach boardwalk, sunset golden hour",
    outfit: "Vintage brown distressed leather trucker jacket + baggy jeans",
    background_detail: "Ocean in background, palm trees, people walking in distance"
  },
  {
    id: 2,
    name: "Ikoyi Luxury Street",
    location: "Ikoyi upscale residential street, golden hour",
    outfit: "Black puffer vest + leather pants + iced watch",
    background_detail: "Luxury SUVs parked, mansions with high walls, security gates"
  },
  {
    id: 3,
    name: "Surulere Night Strip",
    location: "Surulere street at night, neon signs",
    outfit: "Red/Black Zillman jersey + stacked jeans",
    background_detail: "Club neon signs, passing okadas, street food vendors"
  },
  {
    id: 4,
    name: "Victoria Island Business District",
    location: "VI downtown business district, daytime",
    outfit: "White 'Stay Cool' sleeveless tee + light jeans",
    background_detail: "Glass skyscrapers, corporate cars, business people walking"
  },
  {
    id: 5,
    name: "Badagry Coastal Road",
    location: "Badagry coastal road, sunset",
    outfit: "Shirtless + leather pants + gold watch",
    background_detail: "Coconut trees, ocean on one side, old colonial buildings"
  },
  {
    id: 6,
    name: "Yaba College Street",
    location: "Yaba student area, afternoon",
    outfit: "BAPE shark tee + distressed tan jeans + Air Force 1s",
    background_detail: "Students walking, streetwear shops, food stalls"
  },
  {
    id: 7,
    name: "Banana Island Estate",
    location: "Banana Island gated estate, golden hour",
    outfit: "Black ski mask graphic tee + matching shorts + backpack",
    background_detail: "Mansions, luxury cars, palm trees, security guards"
  },
  {
    id: 8,
    name: "Festac Retro Street",
    location: "Festac town residential street, retro 90s vibe",
    outfit: "Vintage brown leather jacket + baggy jeans + white sneakers",
    background_detail: "Old bungalows, vintage cars, retro street signs"
  },
  {
    id: 9,
    name: "Oniru Beach Road",
    location: "Oniru beach road, late afternoon",
    outfit: "White graphic sleeveless tee + denim shorts",
    background_detail: "Beach umbrellas, surfers, ocean breeze, palm trees swaying"
  },
  {
    id: 10,
    name: "Marina Downtown Night",
    location: "Marina downtown Lagos, night time city lights",
    outfit: "Black puffer vest + leather pants + full jewelry",
    background_detail: "Tall glass buildings with lights, traffic light trails, city skyline"
  }
];

// Generate motion transfer prompt
export function buildMotionTransferPrompt(variation: typeof MOTION_TRANSFER_VARIATIONS[0], referenceMotion: string = "sidewalk walking rap performance with car foreground parallax"): string {
  const char = "NBA Josh (black dreadlocks with bright red tips, full goatee, diamond stud in left ear, NBA JOSH old english tattoo on right bicep, rose tattoo on wrist, cloud tattoo sleeve on left arm, diamond NBA JOSH cuban link chain, fully iced watch)";
  
  return `
Motion transfer video. Transfer the EXACT motion, choreography, and camera movement from the reference video (${referenceMotion}) to ${char} wearing ${variation.outfit}.

He is walking along ${variation.location}. ${variation.background_detail}.

Camera: Dolly tracking shot moving parallel to the subject, matching exact camera speed and movement from the reference. Foreground passing cars create parallax effect, exactly like the reference.

Preserve 100% of the motion timing: hand gestures, walking rhythm, dance movements, turns, head nods. All body movement must match the reference perfectly.

Lighting matches the reference natural daylight style, adjusted to match ${variation.location} time of day.

Cinematic, realistic, 4K, 60fps, shallow depth of field, film grain, natural color grading.

IMPORTANT: The character identity must be 100% NBA Josh. All facial features, tattoos, jewelry, and outfit must match perfectly. The motion must be an exact transfer from the reference - no changes to the choreography or timing.
`;
}

// Generate caption style prompt (yellow text subtitles)
export function buildCaptionPrompt(): string {
  return `
Add yellow serif text subtitles at the bottom of the video, matching the reference style. Text matches the rap lyrics, appears synchronized with the audio. Classic TikTok/Reels subtitle style.
`;
}