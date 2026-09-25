'use client'

const MODELARK_MODELS = {
  chat: [
    { id: 'dola-seed-2-1-turbo-260628', name: 'Dola Seed 2.1 Turbo', desc: 'All-purpose flagship' },
    { id: 'seed-2-0-lite-260428', name: 'Seed 2.0 Lite', desc: 'Fast lightweight' },
    { id: 'seed-2-0-mini-260428', name: 'Seed 2.0 Mini', desc: 'Ultra low power' },
    { id: 'glm-5-3-flash-260828', name: 'GLM 5.3 Flash', desc: 'Multimodal reasoning + tool use' },
    { id: 'glm-5-2-260617', name: 'GLM 5.2', desc: 'Long-context reasoning' },
    { id: 'doubao-pro-32k', name: 'Doubao Pro 32k', desc: 'Long context' },
    { id: 'deepseek-v4-1-flash-260910', name: 'DeepSeek V4.1 Flash', desc: 'Visual understanding + reasoning' },
    { id: 'deepseek-v4-pro-ga-260813', name: 'DeepSeek V4 Pro', desc: 'Deep reasoning + structured output' }
  ],
  image: [
    { id: 'dola-seedream-5-0-pro-260628', name: 'Seedream 5.0 Pro', desc: 'Professional quality' },
    { id: 'seed-5-0-lite-260128', name: 'Seedream 5.0 Lite', desc: 'Fast generation' },
    { id: 'dola-seedream-5-0-pro-260628', name: 'Seedream 5.0 Pro Max', desc: '4K ultra high quality' },
    { id: 'flux-1-dev', name: 'FLUX.1 Dev', desc: 'Open state-of-the-art' }
  ],
  video: [
    { id: 'dreamina-seedance-2-5-260628', name: 'Seedance 2.5', desc: 'Flagship video generation' },
    { id: 'dreamina-seedance-2-0-260128', name: 'Seedance 2.0', desc: 'Stable standard' }
  ],
  code: [
    { id: 'glm-5-2-260617', name: 'GLM 5.2', desc: 'Agentic coding' },
    { id: 'glm-5-3-flash-260828', name: 'GLM 5.3 Flash', desc: 'Multimodal tool use' },
    { id: 'code-lama-70b', name: 'Code Llama 70B', desc: 'Open code model' },
    { id: 'deepseek-v4-pro-ga-260813', name: 'DeepSeek V4 Pro', desc: 'Deep reasoning' },
    { id: 'deepseek-v4-1-flash-260910', name: 'DeepSeek V4.1 Flash', desc: 'Visual reasoning' }
  ]
}

export default function ModelSelector({ type, selected, onSelect }) {
  const models = MODELARK_MODELS[type] || MODELARK_MODELS.chat

  return (
    <select value={selected} onChange={event => onSelect(event.target.value)}>
      {models.map(model => (
        <option key={model.id} value={model.id}>
          {model.name} — {model.desc}
        </option>
      ))}
    </select>
  )
}