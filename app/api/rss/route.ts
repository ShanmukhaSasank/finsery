import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const RSS_URL = 'https://www.usnews.com/rss/money'
    const res = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FinseryBot/1.0)' },
      next: { revalidate: 1800 } // cache 30 mins
    })
    const xml = await res.text()

    // Parse RSS manually
    const items: any[] = []
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    itemMatches.slice(0, 30).forEach((item, i) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
        || item.match(/<guid>(.*?)<\/guid>/)?.[1] || ''
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        || item.match(/<description>(.*?)<\/description>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const category = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1]
        || item.match(/<category>(.*?)<\/category>/)?.[1] || 'Finance'

      if (title) {
        items.push({
          id: i + 1,
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
          link: link.trim(),
          description: description.replace(/<[^>]+>/g, '').slice(0, 120).trim(),
          pubDate,
          category: category.trim(),
          source: 'US News',
        })
      }
    })

    return NextResponse.json({ items, updated: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, items: [] }, { status: 500 })
  }
}
