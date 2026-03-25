import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { title, intent, primary_keyword } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const prompt = `You are an expert US personal finance content strategist.

Given the following article details, suggest ONE clear and specific content angle in a single sentence (max 20 words). The angle must describe the unique approach, perspective, or framing of the article — not just repeat the title.

Title: ${title}
Primary Keyword: ${primary_keyword || ''}
Intent: ${intent || 'Informational'}

Reply with ONLY the angle sentence. No explanation, no quotes, no punctuation at the end beyond the sentence itself.`

    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-3-235b-a22b-instruct-2507',
        max_tokens: 60,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Cerebras error: ${err}` }, { status: 500 })
    }

    const data = await res.json()
    const angle = data.choices?.[0]?.message?.content?.trim() || ''
    return NextResponse.json({ angle })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}