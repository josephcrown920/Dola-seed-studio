const STORE_KEY = 'nexus_dola_comfy_workflows_v1'

function makeId(prefix = 'wf') {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export function createBlankWorkflow(name = 'New ComfyUI Workflow') {
  return {
    id: makeId(),
    name,
    description: 'Editable ComfyUI API-format workflow',
    source: 'native',
    format: 'api',
    version: 1,
    prompt: {},
    ui: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function parseComfyWorkflow(raw, name = 'Imported ComfyUI Workflow') {
  if (!raw || typeof raw !== 'object') throw new Error('Workflow JSON must be an object.')
  const apiPrompt = raw.prompt && typeof raw.prompt === 'object' ? raw.prompt : isApiPrompt(raw) ? raw : null
  const uiWorkflow = Array.isArray(raw.nodes) ? raw : null
  if (!apiPrompt && !uiWorkflow) throw new Error('Unsupported ComfyUI JSON. Import an API-format workflow or a standard ComfyUI workflow export.')
  return {
    id: makeId(),
    name: raw.name || name,
    description: raw.description || 'Imported from ComfyUI',
    source: 'comfyui',
    format: apiPrompt ? 'api' : 'ui',
    version: Number(raw.version || 1),
    prompt: apiPrompt || {},
    ui: uiWorkflow,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function isApiPrompt(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const values = Object.values(value)
  return values.length > 0 && values.every((node) => node && typeof node === 'object' && 'class_type' in node && 'inputs' in node)
}

export function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== 'object') return { ok: false, errors: ['Workflow is missing.'] }
  const errors = []
  if (!workflow.name?.trim()) errors.push('Workflow name is required.')
  if (workflow.format !== 'api') errors.push('This workflow is a ComfyUI editor-format import. Export it from ComfyUI as API format before running it.')
  if (!workflow.prompt || !isApiPrompt(workflow.prompt)) errors.push('No executable ComfyUI API graph was found.')
  return { ok: errors.length === 0, errors }
}

function walk(value, visitor) {
  if (Array.isArray(value)) return value.map((item) => walk(item, visitor))
  if (!value || typeof value !== 'object') return visitor(value)
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, walk(child, visitor)]))
}

export function applyWorkflowInputs(prompt, inputs = {}) {
  return walk(prompt, (value) => {
    if (typeof value !== 'string') return value
    return value.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const key = String(path).trim()
      return key in inputs ? String(inputs[key]) : '{{' + key + '}}'
    })
  })
}

export function loadStoredWorkflows() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredWorkflows(workflows) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORE_KEY, JSON.stringify(workflows))
}
