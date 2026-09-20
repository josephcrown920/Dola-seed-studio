import { NextResponse } from 'next/server'
import { callAuroraDirector } from '../../../lib/aurora-director'

export async function POST(request) {
  try {
    const body = await request.json()
    const instruction = String(body?.instruction || '').trim()
    const code = String(body?.code || '')
    const filePath = String(body?.filePath || '').trim()
    const mode = String(body?.mode || 'review').trim()

    if (!instruction) {
      return NextResponse.json({ error: { message: 'Coding instruction is required.' } }, { status: 400 })
    }

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
    return NextResponse.json(
      { error: { message: error?.message || 'Aurora coding request failed.' } },
      { status: 500 }
    )
  }
}
