'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updated, setUpdated] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/rss')
      .then(r => r.json())
      .then(d => {
        setItems(d.items || [])
        setFiltered(d.items || [])
        setUpdated(d.updated ? new Date(d.updated).toLocaleTimeString() : '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(items); return }
    setFiltered(items.filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, items])

  function handleSelect(item: any) {
    localStorage.setItem('finsery_topic', JSON.stringify({ title: item.title, source_url: item.link }))
    router.push('/dashboard/specs')
  }

  const stats = {
    total: items.length,
    categories: [...new Set(items.map(i => i.category))].length,
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Trending Topics</h1>
          <p style={s.sub}>US News Money{updated && ` — updated at ${updated}`}</p>
        </div>
        <button style={s.syncBtn} onClick={() => { setLoading(true); fetch('/api/rss').then(r => r.json()).then(d => { setItems(d.items || []); setFiltered(d.items || []); setLoading(false) }) }}>
          ↻ Sync Now
        </button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: "TODAY'S TOPICS", value: stats.total },
          { label: 'CATEGORIES', value: stats.categories },
          { label: 'SOURCE', value: 'US News' },
          { label: 'LAST UPDATED', value: updated || '—' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statLabel}>{stat.label}</div>
            <div style={s.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search + write own */}
      <div style={s.toolbar}>
        <input
          style={s.search}
          placeholder="Search topics…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button style={s.writeBtn} onClick={() => router.push('/dashboard/write')}>
          ✏️ Write Your Own Topic →
        </button>
      </div>

      {/* Topic list */}
      {loading ? (
        <div style={s.loading}><div style={s.spinner}/><span>Loading topics…</span></div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>No topics found</div>
      ) : (
        <div style={s.list}>
          {filtered.map((item, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardLeft}>
                <div style={s.cardScore}>{item.id}</div>
              </div>
              <div style={s.cardBody}>
                <div style={s.cardTitle}>{item.title}</div>
                {item.description && <div style={s.cardDesc}>{item.description}</div>}
                <div style={s.cardMeta}>
                  <span style={s.catBadge}>{item.category}</span>
                  {item.pubDate && <span style={s.dateText}>{new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
              </div>
              <div style={s.cardRight}>
                <span style={s.sourceBadge}>{item.source}</span>
                <button style={s.selectBtn} onClick={() => handleSelect(item)}>
                  Select →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '36px 40px', maxWidth: '1000px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  title: { fontSize: '32px', fontWeight: 700, color: '#1a1f36', marginBottom: '4px' },
  sub: { fontSize: '14px', color: '#6b7280' },
  syncBtn: { background: '#fff', border: '1.5px solid #e2e6f0', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, color: '#4557A1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '10px', padding: '20px 22px' },
  statLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 700, color: '#1a1f36' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' },
  search: { flex: 1, maxWidth: '360px', padding: '10px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' },
  writeBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' },
  loading: { display: 'flex', alignItems: 'center', gap: '12px', padding: '60px 0', color: '#9ca3af', fontSize: '14px' },
  spinner: { width: '20px', height: '20px', border: '2px solid #e2e6f0', borderTopColor: '#4557A1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  empty: { padding: '60px 0', textAlign: 'center', color: '#9ca3af', fontSize: '14px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '10px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px', transition: 'box-shadow 0.15s' },
  cardLeft: { flexShrink: 0 },
  cardScore: { width: '32px', height: '32px', background: '#4557A1', color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: '16px', fontWeight: 600, color: '#1a1f36', marginBottom: '6px', lineHeight: 1.4 },
  cardDesc: { fontSize: '13px', color: '#6b7280', marginBottom: '10px', lineHeight: 1.5 },
  cardMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  catBadge: { fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: '#f4f6fb', color: '#6b7280', border: '1px solid #e2e6f0' },
  dateText: { fontSize: '12px', color: '#9ca3af' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 },
  sourceBadge: { fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: '#4557A1', color: '#fff' },
  selectBtn: { background: '#fff', border: '1.5px solid #4557A1', color: '#4557A1', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
}
