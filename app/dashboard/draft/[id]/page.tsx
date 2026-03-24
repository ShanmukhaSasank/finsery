'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function DraftViewerPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [draft, setDraft] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [pushed, setPushed] = useState(false)
  const [wpLink, setWpLink] = useState('')
  const [toast, setToast] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setDraft(data)
        setPushed(data.wp_pushed)
        setWpLink(data.wp_draft_link || '')
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleSave() {
    if (!editorRef.current) return
    setSaving(true)
    const edited = editorRef.current.innerHTML
    await supabase.from('drafts').update({ edited_content: edited }).eq('id', params.id)
    setSaving(false)
    showToast('✓ Changes saved')
  }

  async function handlePushToWP() {
    if (!editorRef.current) return
    setPushing(true)
    const content = editorRef.current.innerHTML
    const res = await fetch('/api/push-to-wp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draft_id: params.id,
        title: draft.title,
        content,
        category: draft.category,
        tags: draft.tags,
      }),
    })
    const data = await res.json()
    setPushing(false)
    if (data.error) { showToast(`❌ ${data.error}`); return }
    setPushed(true)
    setWpLink(data.wp_draft_link)
    showToast('✅ Pushed to WordPress!')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e2e6f0', borderTopColor: '#4557A1', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        Loading draft…
      </div>
    </div>
  )

  if (!draft) return (
    <div style={{ padding: '40px', color: '#ef4444' }}>Draft not found.</div>
  )

  return (
    <div style={s.page}>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <button style={s.backBtn} onClick={() => router.push('/dashboard')}>← Dashboard</button>
        <div style={s.toolbarMeta}>
          <span style={s.contentId}>{draft.content_id}</span>
          <span style={{ ...s.specBadge, background: draft.content_specification === 'beginner' ? 'rgba(91,156,246,0.12)' : 'rgba(245,158,11,0.12)', color: draft.content_specification === 'beginner' ? '#5b9cf6' : '#f59e0b' }}>
            {draft.content_specification === 'beginner' ? 'Beginner' : 'Advanced'}
          </span>
          <span style={s.intentBadge}>{draft.intent}</span>
        </div>
        <div style={s.toolbarActions}>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
          {pushed ? (
            <a href={wpLink} target="_blank" style={s.wpLinkBtn}>Open in WordPress ↗</a>
          ) : (
            <button style={s.pushBtn} onClick={handlePushToWP} disabled={pushing}>
              {pushing ? 'Pushing…' : '🚀 Push to WordPress'}
            </button>
          )}
        </div>
      </div>

      <div style={s.body}>
        {/* Article meta */}
        <div style={s.meta}>
          <h1 style={s.articleTitle}>{draft.title}</h1>
          <div style={s.metaRow}>
            <span style={s.metaItem}>🔑 {draft.primary_keyword}</span>
            <span style={s.metaItem}>📁 {draft.category}</span>
            <span style={s.metaItem}>🎯 {draft.tone}</span>
            <span style={s.metaItem}>📝 {draft.word_count?.toLocaleString()} words</span>
          </div>
        </div>

        {/* Edit hint */}
        <div style={s.editHint}>
          <span>✏️</span>
          <span>Click anywhere in the article below to edit the content directly.</span>
        </div>

        {/* Editable content */}
        <div style={s.editorWrap}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: draft.edited_content || draft.content || '' }}
            style={s.editor}
            onInput={() => {}}
          />
        </div>

        {/* Bottom actions */}
        <div style={s.bottomBar}>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
          {pushed ? (
            <div style={s.pushedInfo}>
              <span style={s.pushedBadge}>✅ Pushed to WordPress</span>
              <a href={wpLink} target="_blank" style={s.wpLinkBtn}>Open Draft ↗</a>
            </div>
          ) : (
            <button style={s.pushBtn} onClick={handlePushToWP} disabled={pushing}>
              {pushing ? '⏳ Pushing to WordPress…' : '🚀 Push to WordPress'}
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f6fb' },
  toolbar: { background: '#fff', borderBottom: '1px solid #e2e6f0', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: '4px 0' },
  toolbarMeta: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 },
  contentId: { fontFamily: 'monospace', fontSize: '12px', color: '#4557A1', background: 'rgba(69,87,161,0.08)', padding: '3px 10px', borderRadius: '10px', fontWeight: 600 },
  specBadge: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px' },
  intentBadge: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', background: '#f4f6fb', color: '#6b7280' },
  toolbarActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  saveBtn: { background: '#fff', border: '1.5px solid #e2e6f0', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' },
  pushBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  wpLinkBtn: { background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  body: { flex: 1, maxWidth: '860px', margin: '0 auto', padding: '32px 24px', width: '100%' },
  meta: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '12px', padding: '24px 28px', marginBottom: '16px' },
  articleTitle: { fontSize: '26px', fontWeight: 700, color: '#1a1f36', marginBottom: '12px', lineHeight: 1.3 },
  metaRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  metaItem: { fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' },
  editHint: { display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(69,87,161,0.06)', border: '1px solid rgba(69,87,161,0.12)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#4557A1' },
  editorWrap: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' },
  editor: {
    padding: '32px 36px',
    outline: 'none',
    minHeight: '400px',
    lineHeight: 1.8,
    fontSize: '15px',
    color: '#1a1f36',
  },
  bottomBar: { display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '40px' },
  pushedInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  pushedBadge: { fontSize: '13px', fontWeight: 600, color: '#10b981' },
  toast: { position: 'fixed', bottom: '24px', right: '24px', background: '#1a1f36', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, zIndex: 999, borderLeft: '3px solid #4557A1', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
}
