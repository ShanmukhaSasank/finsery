import { NextResponse } from 'next/server'

async function fetchRSS(url: string): Promise<string> {
  // Try direct fetch first
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
  }

  try {
    const res = await fetch(url, { headers, next: { revalidate: 1800 } })
    if (res.ok) {
      const text = await res.text()
      if (text.includes('<item>') || text.includes('<entry>')) return text
    }
  } catch (e) {}

  // Fallback: use rss2json public API
  const fallbackUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=&count=30`
  const fallbackRes = await fetch(fallbackUrl, { next: { revalidate: 1800 } })
  if (fallbackRes.ok) {
    const json = await fallbackRes.json()
    if (json.status === 'ok' && json.items?.length) {
      // Convert rss2json format to XML-like parsed items
      return JSON.stringify({ rss2json: true, items: json.items, feed: json.feed })
    }
  }

  throw new Error('Could not fetch RSS feed from any source')
}

function parseXML(xml: string) {
  const items: any[] = []
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

  itemMatches.slice(0, 30).forEach((item, i) => {
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link = item.match(/<link>(.*?)<\/link>/)?.[1]
      || item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || ''
    const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
      || item.match(/<description>(.*?)<\/description>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const category = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1]
      || item.match(/<category>(.*?)<\/category>/)?.[1] || 'Finance'

    if (title) {
      items.push({
        id: i + 1,
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").trim(),
        link: link.trim(),
        description: description.replace(/<[^>]+>/g, '').slice(0, 150).trim(),
        pubDate,
        category: category.trim(),
        source: 'US News',
      })
    }
  })
  return items
}

export async function GET() {
  try {
    const RSS_URL = 'https://www.usnews.com/rss/money'
    const raw = await fetchRSS(RSS_URL)

    let items: any[] = []

    // Check if it's rss2json format
    if (raw.startsWith('{') && raw.includes('rss2json')) {
      const json = JSON.parse(raw)
      items = json.items.map((item: any, i: number) => ({
        id: i + 1,
        title: item.title?.trim() || '',
        link: item.link || '',
        description: item.description?.replace(/<[^>]+>/g, '').slice(0, 150).trim() || '',
        pubDate: item.pubDate || '',
        category: item.categories?.[0] || 'Finance',
        source: 'US News',
      })).filter((i: any) => i.title)
    } else {
      items = parseXML(raw)
    }

    return NextResponse.json({ items, updated: new Date().toISOString() })
  } catch (e: any) {
    console.error('RSS fetch error:', e.message)
    return NextResponse.json({ error: e.message, items: [] }, { status: 500 })
  }
}