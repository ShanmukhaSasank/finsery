import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { draft_id, title, content, category, tags } = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const WP_URL = process.env.WP_URL
    const WP_USERNAME = process.env.WP_USERNAME
    const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD

    const credentials = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')

    // Create WP post
    const wpRes = await fetch(`${WP_URL}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        title,
        content,
        status: 'draft',
        tags: [],
      }),
    })

    if (!wpRes.ok) {
      const err = await wpRes.text()
      return NextResponse.json({ error: `WordPress error: ${err}` }, { status: 500 })
    }

    const wpPost = await wpRes.json()
    const wp_draft_link = `${WP_URL}/wp-admin/post.php?post=${wpPost.id}&action=edit`

    // Update draft in Supabase
    await supabase.from('drafts').update({
      wp_pushed: true,
      wp_draft_link,
      wp_post_id: wpPost.id,
    }).eq('id', draft_id)

    return NextResponse.json({ success: true, wp_draft_link, wp_post_id: wpPost.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
