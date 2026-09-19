'use client'

const MODELARK_MODELS = {
  chat: [
    { id: 'dola-seed-2.1-pro', name: 'Dola Seed 2.1 Pro', desc: 'All-purpose flagship' },
    { id: 'dola-seed-2.1-lite', name: 'Dola Seed 2.1 Lite', desc: 'Fast lightweight' },
    { id: 'dola-seed-2.1-mini', name: 'Dola Seed 2.1 Mini', desc: 'Ultra low power' },
    { id: 'glm-5.1', name: 'GLM-5.1', desc: 'High-end reasoning' },
    { id: 'doubao-pro-32k', name: 'Doubao Pro 32k', desc: 'Long context' },
    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', desc: 'Code specialized' }
  ],
  image: [
    { id: 'seedream-5.0-pro', name: 'Seedream 5.0 Pro', desc: 'Professional quality' },
    { id: 'seedream-5.0-lite', name: 'Seedream 5.0 Lite', desc: 'Fast generation' },
    { id: 'seedream-5.0-pro-max', name: 'Seedream 5.0 Pro Max', desc: '4K ultra high quality' },
    { id: 'flux-1-dev', name: 'FLUX.1 Dev', desc: 'Open state-of-the-art' }
  ],
  video: [
    { id: 'seedance-2.1', name: 'Seedance 2.1', desc: 'Flagship video generation' },
    { id: 'seedance-2.0', name: 'Seedance 2.0', desc: 'Stable standard' }
  ],
  code: [
    { id: 'glm-5.1', name: 'GLM-5.1', desc: 'Best for code' },
    { id: 'code-lama-70b', name: 'Code Llama 70B', desc: 'Open code model' },
    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', desc: 'Code specialized' }
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