import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt } from '@/lib/prompt-builder'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const prompt = buildPrompt(data)

    // Call Cerebras API
    const cerebrasRes = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-3-235b-a22b-instruct-2507',
        max_tokens: 8192,
        messages: [
          {
            role: 'system',
            content: 'You are an expert US personal finance content writer. You write high-quality, SEO-optimized articles strictly following all provided instructions. You never use em dashes. You always return clean HTML only.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    })

    if (!cerebrasRes.ok) {
      const err = await cerebrasRes.text()
      return NextResponse.json({ error: `Cerebras error: ${err}` }, { status: 500 })
    }

    const cerebrasData = await cerebrasRes.json()
    const content = cerebrasData.choices?.[0]?.message?.content || ''

    // Generate content_id
    const now = new Date()
    const yy = String(now.getFullYear()).slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const rnd = Math.floor(1000 + Math.random() * 9000)
    const content_id = `FNS-${yy}${mm}-${rnd}`

    // Save to Supabase
    const { data: draft, error: dbErr } = await supabase.from('drafts').insert({
      content_id,
      title: data.title,
      primary_keyword: data.primary_keyword,
      intent: data.intent,
      angle: data.angle,
      finsery_pro_tip: data.finsery_pro_tip,
      content_specification: data.content_specification,
      key_takeaway: data.key_takeaway,
      story_hook: data.story_hook,
      accordion: data.accordion,
      reference_links: data.reference_links,
      avoid: data.avoid,
      brand_mention: data.brand_mention,
      tone: data.tone,
      target_audience: data.target_audience,
      word_count: data.word_count,
      category: data.category,
      tags: data.tags,
      content,
      edited_content: content,
      wp_pushed: false,
      user_id: session.user.id,
    }).select().single()

    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

    return NextResponse.json({ success: true, draft_id: draft.id, content_id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
