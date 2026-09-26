export const MODELARK_VISION_MODELS={
  deepseek:"deepseek-v4-1-flash-260910",
  glm:"glm-5-3-flash-260828",
  director:"dola-seed-2-1-turbo-260628",
};

export const MULTIMODAL_SKILLS=[
  {id:"vision-review",label:"Vision review",prompt:"Inspect supplied image/video evidence. Separate observations from inference. Identify subjects, actions, composition, camera, lighting, wardrobe, props, text, continuity and edit opportunities."},
  {id:"character-continuity",label:"Character continuity",prompt:"Track every character by stable ID and lock appearance, wardrobe, blocking, gaze, screen direction, props and relationships across shots."},
  {id:"multi-character-scene",label:"Multi-character scene planner",prompt:"Build a character map, staging plan, camera coverage and interaction beats for scenes with multiple characters."},
  {id:"image-creation",label:"Image creation",prompt:"Create production-ready prompts for character sheets, locations, keyframes, style frames, props and reference-conditioned images."},
  {id:"video-creation",label:"Video creation",prompt:"Create shot-level prompts for text-to-video, image-to-video, reference-to-video, extension and targeted video editing."},
  {id:"layered-edit",label:"Layered editor",prompt:"Translate natural-language changes into reversible edits over video, dialogue, music, SFX, captions, overlays, masks and transforms."},
  {id:"multi-agent",label:"Multi-agent production",prompt:"Delegate to director, vision, character continuity, world continuity, storyboard, workflow, editor, audio and QA roles, then reconcile their outputs before editing."},
  {id:"comfyui-workflow",label:"ComfyUI workflow agent",prompt:"Select a saved ComfyUI workflow, map project inputs to its parameters, execute it, inspect outputs, and feed the result back into the project without flattening the timeline."},
];

export async function analyzeMultimodal({model=MODELARK_VISION_MODELS.deepseek,instruction,inputs=[]}){
  const content=[{type:"text",text:instruction},...inputs];
  const response=await fetch("/api/modelark/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model,content}),
  });
  if(!response.ok) throw new Error("ModelArk multimodal analysis failed.");
  return response.json();
}

export function createMultiAgentPlan(brief){
  return [
    {role:"director",model:MODELARK_VISION_MODELS.director,task:"Define intent and acceptance criteria."},
    {role:"vision",model:MODELARK_VISION_MODELS.deepseek,task:"Analyze visual evidence and scene structure."},
    {role:"character-continuity",model:MODELARK_VISION_MODELS.glm,task:"Lock character identity and blocking."},
    {role:"world-continuity",model:MODELARK_VISION_MODELS.glm,task:"Lock location, props, lighting and camera language."},
    {role:"storyboard",model:MODELARK_VISION_MODELS.director,task:"Produce shot list and image/video generation prompts."},
    {role:"comfyui-workflow",model:MODELARK_VISION_MODELS.director,task:"Select and execute the best saved ComfyUI workflow for the shot."},
    {role:"editor",model:MODELARK_VISION_MODELS.director,task:"Map edits to layered timeline ranges."},
    {role:"audio",model:MODELARK_VISION_MODELS.glm,task:"Plan dialogue, music and SFX tracks."},
    {role:"qa",model:MODELARK_VISION_MODELS.deepseek,task:"Inspect the result and request targeted repairs only."},
  ].map((agent)=>({...agent,brief}));
}
