'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [editors, setEditors] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [toast, setToast] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard'); return }
      setIsAdmin(true)

      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setEditors(profiles || [])

      // Draft counts per user
      const { data: drafts } = await supabase.from('drafts').select('user_id')
      const counts: Record<string, number> = {}
      drafts?.forEach(d => { counts[d.user_id] = (counts[d.user_id] || 0) + 1 })
      setStats(Object.entries(counts).map(([id, count]) => ({ id, count })))
      setLoading(false)
    }
    load()
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    setInviting(true)
    const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail)
    setInviting(false)
    if (error) showToast(`❌ ${error.message}`)
    else { showToast('✅ Invite sent!'); setInviteEmail('') }
  }

  async function toggleRole(editor: any) {
    const newRole = editor.role === 'admin' ? 'editor' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', editor.id)
    setEditors(eds => eds.map(e => e.id === editor.id ? { ...e, role: newRole } : e))
    showToast(`✓ ${editor.full_name} is now ${newRole}`)
  }

  async function deactivate(editor: any) {
    if (!confirm(`Deactivate ${editor.full_name}?`)) return
    await supabase.from('profiles').update({ active: false }).eq('id', editor.id)
    setEditors(eds => eds.map(e => e.id === editor.id ? { ...e, active: false } : e))
    showToast(`✓ ${editor.full_name} deactivated`)
  }

  function getDraftCount(userId: string) {
    return stats.find(s => s.id === userId)?.count || 0
  }

  if (loading || !isAdmin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af' }}>Loading…</div>
  )

  return (
    <div style={s.page}>
      <h1 style={s.title}>Admin Panel</h1>
      <p style={s.sub}>Manage editors and monitor activity.</p>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Editors', value: editors.length },
          { label: 'Active', value: editors.filter(e => e.active !== false).length },
          { label: 'Admins', value: editors.filter(e => e.role === 'admin').length },
          { label: 'Total Drafts', value: stats.reduce((a, s) => a + s.count, 0) },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statLabel}>{stat.label}</div>
            <div style={s.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Invite */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Invite Editor</h2>
        <form onSubmit={handleInvite} style={s.inviteForm}>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="editor@finsery.com"
            style={s.input}
            required
          />
          <button type="submit" disabled={inviting} style={s.inviteBtn}>
            {inviting ? 'Sending…' : '+ Invite'}
          </button>
        </form>
      </div>

      {/* Editors table */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>All Editors</h2>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Drafts</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {editors.map(editor => (
              <tr key={editor.id} style={s.tr}>
                <td style={s.td}>
                  <div style={s.editorAvatar}>
                    {(editor.full_name || editor.email || 'U')[0].toUpperCase()}
                  </div>
                  <span style={s.editorName}>{editor.full_name || '—'}</span>
                </td>
                <td style={s.td}><span style={s.emailText}>{editor.email}</span></td>
                <td style={s.td}>
                  <span style={{ ...s.roleBadge, background: editor.role === 'admin' ? 'rgba(69,87,161,0.1)' : '#f4f6fb', color: editor.role === 'admin' ? '#4557A1' : '#6b7280' }}>
                    {editor.role || 'editor'}
                  </span>
                </td>
                <td style={s.td}><span style={s.draftCount}>{getDraftCount(editor.id)}</span></td>
                <td style={s.td}>
                  <span style={{ ...s.statusBadge, background: editor.active === false ? '#fef2f2' : '#f0fdf4', color: editor.active === false ? '#ef4444' : '#10b981' }}>
                    {editor.active === false ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.actionBtn} onClick={() => toggleRole(editor)}>
                      {editor.role === 'admin' ? 'Make Editor' : 'Make Admin'}
                    </button>
                    {editor.active !== false && (
                      <button style={{ ...s.actionBtn, color: '#ef4444', borderColor: '#fecaca' }} onClick={() => deactivate(editor)}>
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '36px 40px', maxWidth: '1000px' },
  title: { fontSize: '32px', fontWeight: 700, color: '#1a1f36', marginBottom: '6px' },
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '10px', padding: '20px 22px' },
  statLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 700, color: '#1a1f36' },
  card: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#1a1f36', marginBottom: '16px' },
  inviteForm: { display: 'flex', gap: '12px' },
  input: { flex: 1, maxWidth: '360px', padding: '10px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  inviteBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { borderBottom: '1px solid #e2e6f0' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9ca3af' },
  tr: { borderBottom: '1px solid #f4f6fb' },
  td: { padding: '14px', fontSize: '13px', color: '#374151', verticalAlign: 'middle' },
  editorAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#4557A1', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, marginRight: '8px' },
  editorName: { fontWeight: 600, color: '#1a1f36' },
  emailText: { color: '#6b7280' },
  roleBadge: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px' },
  draftCount: { fontWeight: 700, color: '#4557A1' },
  statusBadge: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px' },
  actions: { display: 'flex', gap: '8px' },
  actionBtn: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' },
  toast: { position: 'fixed', bottom: '24px', right: '24px', background: '#1a1f36', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, zIndex: 999, borderLeft: '3px solid #4557A1' },
}
