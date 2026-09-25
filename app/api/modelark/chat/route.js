import { NextResponse } from 'next/server'

const ARK_BASE = process.env.ARK_BASE_URL?.replace(/\/$/, '') || 'https://ark.ap-southeast.bytepluses.com/api/v3'
const DEFAULT_MODEL = process.env.MODELARK_TEXT_MODEL || 'dola-seed-2-1-turbo-260628'

function getKey() {
  return process.env.MODELARK_API_KEY || process.env.ARK_API_KEY || process.env.BYTEPLUS_ACCESS_KEY || ''
}

export async function POST(request) {
  try {
    const body = await request.json()
    const model = body.model || DEFAULT_MODEL
    const prompt = body.prompt
    const content = body.content || prompt

    if (!model || !content) {
      return NextResponse.json({ error: { message: 'Model and prompt/content are required.' } }, { status: 400 })
    }

    const key = getKey()
    if (!key) {
      return NextResponse.json(
        { error: { message: 'ModelArk is not configured. Set MODELARK_API_KEY or ARK_API_KEY as a server secret.' } },
        { status: 503 }
      )
    }

    const response = await fetch(ARK_BASE + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content }]
      })
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: { message: error?.message || 'ModelArk request failed.' } },
      { status: 500 }
    )
  }
}
