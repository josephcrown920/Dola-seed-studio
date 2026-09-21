import { NextResponse } from 'next/server'
import { callAuroraDirector } from '../../../lib/aurora-director'

const MAX_BODY_BYTES = 512 * 1024
const MAX_INSTRUCTION_CHARS = 12000
const MAX_CODE_CHARS = 50000
const MAX_FILE_PATH_CHARS = 500
const ALLOWED_MODES = new Set(['plan', 'edit', 'review', 'debug'])

function isAuthorized(request) {
  const expected = process.env.AURORA_CODING_ACCESS_TOKEN?.trim() || ''
  const header = request.headers.get('authorization') || ''
  if (!expected || !header.startsWith('Bearer ')) return false
  const supplied = header.slice(7).trim()
  return supplied.length > 0 && supplied === expected
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: { message: 'Unauthorized.' } }, { status: 401 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: { message: 'Request body is too large.' } }, { status: 413 })
  }

  try {
    const body = await request.json()
    const instruction = String(body?.instruction || '').trim()
    const code = String(body?.code || '')
    const filePath = String(body?.filePath || '').trim()
    const mode = String(body?.mode || 'review').trim().toLowerCase()

    if (!instruction) return NextResponse.json({ error: { message: 'Coding instruction is required.' } }, { status: 400 })
    if (instruction.length > MAX_INSTRUCTION_CHARS) return NextResponse.json({ error: { message: 'Coding instruction is too long.' } }, { status: 413 })
    if (code.length > MAX_CODE_CHARS) return NextResponse.json({ error: { message: 'Code context is too large.' } }, { status: 413 })
    if (filePath.length > MAX_FILE_PATH_CHARS) return NextResponse.json({ error: { message: 'File path is too long.' } }, { status: 413 })
    if (!ALLOWED_MODES.has(mode)) return NextResponse.json({ error: { message: 'Unsupported coding mode.' } }, { status: 400 })

    const context = {
      product: 'Dola Seed Studio — Codex Aurora editor',
      mode,
      filePath: filePath || undefined,
      code: code || undefined,
      constraints: [
        'Do not expose secrets or credentials.',
        'Do not perform destructive operations without explicit approval.',
        'Do not execute arbitrary shell commands from the browser.',
        'Return proposed edits as reviewable text/diffs when applicable.',
        'Preserve existing ModelArk, Aurora MCP, and Dola Seed integrations.'
      ]
    }

    const result = await callAuroraDirector({ instruction, context })
    return NextResponse.json({ ok: true, mode, result })
  } catch (error) {
    console.error('Aurora coding request failed', error)
    return NextResponse.json({ error: { message: 'Aurora coding request failed.' } }, { status: 500 })
  }
}
