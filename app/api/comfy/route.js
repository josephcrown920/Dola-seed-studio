import { NextResponse } from 'next/server'

const DEFAULT_COMFY = process.env.COMFYUI_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8188'
const WAIT_MS = Number(process.env.COMFYUI_POLL_MS || 1000)
const TIMEOUT_MS = Number(process.env.COMFYUI_TIMEOUT_MS || 300000)

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

async function comfy(path, init = {}) {
  const response = await fetch(DEFAULT_COMFY + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  })
  const text = await response.text()
  let data = null
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  if (!response.ok) throw new Error(data?.error?.message || data?.error || data?.raw || 'ComfyUI request failed (' + response.status + ')')
  return data
}

export async function GET() {
  try {
    const data = await comfy('/system_stats', { method: 'GET' })
    return json({ ok: true, data, baseUrl: DEFAULT_COMFY })
  } catch (error) {
    return json({ ok: false, error: error?.message || 'ComfyUI is unavailable.', baseUrl: DEFAULT_COMFY }, 503)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const workflow = body.workflow || body.prompt
    if (!workflow || typeof workflow !== 'object') return json({ error: { message: 'workflow.prompt is required.' } }, 400)
    const clientId = body.clientId || crypto.randomUUID()
    const queued = await comfy('/prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    })
    const promptId = queued.prompt_id
    if (!promptId || body.wait === false) return json({ ok: true, promptId, queued, clientId })

    const started = Date.now()
    while (Date.now() - started < TIMEOUT_MS) {
      await new Promise((resolve) => setTimeout(resolve, WAIT_MS))
      const history = await comfy('/history/' + encodeURIComponent(promptId), { method: 'GET' })
      const entry = history?.[promptId]
      if (!entry) continue
      if (entry.status?.status_str === 'error') return json({ ok: false, promptId, history: entry }, 500)
      if (entry.status?.completed || entry.outputs) return json({ ok: true, promptId, outputs: entry.outputs || {}, history: entry })
    }
    return json({ ok: false, promptId, error: 'ComfyUI job timed out while waiting for history.' }, 504)
  } catch (error) {
    return json({ ok: false, error: error?.message || 'ComfyUI execution failed.' }, 500)
  }
}
