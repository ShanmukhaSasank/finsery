'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WriteTopicPage() {
  const [title, setTitle] = useState('')
  const [keyword, setKeyword] = useState('')
  const router = useRouter()

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    localStorage.setItem('finsery_topic', JSON.stringify({
      title: title.trim(),
      primary_keyword: keyword.trim(),
      source_url: ''
    }))
    router.push('/dashboard/specs')
  }

  return (
    <div style={s.page}>
      <div style={s.back} onClick={() => router.push('/dashboard')}>← Back to Topics</div>

      <h1 style={s.title}>Write Your Own Topic</h1>
      <p style={s.sub}>Enter the article title and primary keyword to get started.</p>

      <div style={s.card}>
        <form onSubmit={handleContinue} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Article Title <span style={s.req}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Best High-Yield Savings Accounts in 2025"
              required
              style={s.input}
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Primary Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. high yield savings account"
              style={s.input}
            />
            <span style={s.hint}>You can also set this on the next page</span>
          </div>
          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={() => router.push('/dashboard')}>
              Cancel
            </button>
            <button type="submit" style={s.continueBtn} disabled={!title.trim()}>
              Continue to Content Specs →
            </button>
          </div>
        </form>
      </div>

      {/* Tip */}
      <div style={s.tip}>
        <span style={s.tipIcon}>💡</span>
        <span style={s.tipText}>
          Not sure what to write? Go back and pick a trending topic from our RSS feed instead.
        </span>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '36px 40px', maxWidth: '640px' },
  back: { fontSize: '13px', color: '#6b7280', cursor: 'pointer', marginBottom: '28px', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  title: { fontSize: '32px', fontWeight: 700, color: '#1a1f36', marginBottom: '6px' },
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  card: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '12px', padding: '36px' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
  req: { color: '#4557A1' },
  input: { padding: '12px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', color: '#1a1f36', outline: 'none', transition: 'border-color 0.2s' },
  hint: { fontSize: '12px', color: '#9ca3af' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { background: '#fff', border: '1.5px solid #e2e6f0', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 500, color: '#6b7280', cursor: 'pointer' },
  continueBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: 1, transition: 'opacity 0.2s' },
  tip: { display: 'flex', gap: '10px', background: 'rgba(69,87,161,0.06)', border: '1px solid rgba(69,87,161,0.15)', borderRadius: '10px', padding: '14px 16px', marginTop: '20px' },
  tipIcon: { fontSize: '16px', flexShrink: 0 },
  tipText: { fontSize: '13px', color: '#4557A1', lineHeight: 1.5 },
}
