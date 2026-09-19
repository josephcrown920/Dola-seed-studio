import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { model, prompt } = await request.json()

    if (!model || !prompt) {
      return NextResponse.json(
        { error: { message: 'Both model and prompt are required.' } },
        { status: 400 }
      )
    }

    if (!process.env.BYTEPLUS_ACCESS_KEY || !process.env.BYTEPLUS_SECRET_KEY) {
      return NextResponse.json(
        { error: { message: 'ModelArk is not configured. Add BYTEPLUS_ACCESS_KEY and BYTEPLUS_SECRET_KEY as server secrets.' } },
        { status: 503 }
      )
    }

    const response = await fetch('https://api.byteplus.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Keep both credentials on the server; never expose them to the browser.
        'Authorization': `Bearer ${process.env.BYTEPLUS_ACCESS_KEY}:${process.env.BYTEPLUS_SECRET_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message || 'ModelArk request failed.' } },
      { status: 500 }
    )
  }
}