'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const workflowSteps = [
  { label: 'Pick Topic', href: '/dashboard', icon: '📰' },
  { label: 'Write a Topic', href: '/dashboard/write', icon: '✏️' },
  { label: 'Content Specs', href: '/dashboard/specs', icon: '📋' },
  { label: 'Generate Draft', href: '/dashboard/generate', icon: '⚡' },
]

export default function Sidebar({ drafts = [], user }: { drafts?: any[], user?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    loadProfile()
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  function getStepStatus(href: string) {
    if (isActive(href)) return 'active'
    const order = ['/dashboard', '/dashboard/write', '/dashboard/specs', '/dashboard/generate']
    const currentIdx = order.findIndex(h => pathname.startsWith(h) || pathname === h)
    const stepIdx = order.indexOf(href)
    if (stepIdx < currentIdx) return 'done'
    return 'idle'
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoWrap}>
        <span style={styles.logo}>Fin<span style={styles.logoBlue}>sery</span></span>
        <span style={styles.logoTag}>Editorial</span>
      </div>

      {/* Workflow */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>WORKFLOW</div>
        {workflowSteps.map(step => {
          const status = getStepStatus(step.href)
          return (
            <Link key={step.href} href={step.href} style={{
              ...styles.navItem,
              ...(status === 'active' ? styles.navItemActive : {}),
            }}>
              <span style={{
                ...styles.stepDot,
                ...(status === 'active' ? styles.stepDotActive : {}),
                ...(status === 'done' ? styles.stepDotDone : {}),
              }}>
                {status === 'done' ? '✓' : status === 'active' ? '●' : '○'}
              </span>
              <span style={status === 'active' ? styles.navLabelActive : styles.navLabel}>
                {step.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Library */}
      <div style={{ ...styles.section, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={styles.sectionLabel}>LIBRARY</div>
        <div style={styles.libraryList}>
          {drafts.length === 0 && (
            <div style={styles.emptyLib}>No drafts yet</div>
          )}
          {drafts.map(draft => (
            <Link key={draft.id} href={`/dashboard/draft/${draft.id}`} style={{
              ...styles.libraryItem,
              ...(pathname === `/dashboard/draft/${draft.id}` ? styles.libraryItemActive : {})
            }}>
              <div style={styles.libTitle}>{draft.title?.slice(0, 32)}{draft.title?.length > 32 ? '…' : ''}</div>
              <div style={styles.libMeta}>
                <span style={{
                  ...styles.libBadge,
                  background: draft.content_specification === 'beginner' ? 'rgba(91,156,246,0.15)' : 'rgba(245,158,11,0.15)',
                  color: draft.content_specification === 'beginner' ? '#5b9cf6' : '#f59e0b',
                }}>
                  {draft.content_specification === 'beginner' ? 'Beginner' : 'Advanced'}
                </span>
                <span style={{
                  ...styles.libBadge,
                  background: draft.wp_pushed ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                  color: draft.wp_pushed ? '#10b981' : '#9ca3af',
                }}>
                  {draft.wp_pushed ? 'WP' : 'Draft'}
                </span>
                <span style={styles.libDate}>
                  {new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin link */}
      {profile?.role === 'admin' && (
        <Link href="/admin" style={{
          ...styles.navItem,
          ...(pathname.startsWith('/admin') ? styles.navItemActive : {}),
          margin: '0 0 4px',
        }}>
          <span style={styles.stepDot}>⚙</span>
          <span style={styles.navLabel}>Admin Panel</span>
        </Link>
      )}

      {/* User footer */}
      <div style={styles.userWrap}>
        <div style={styles.userAvatar}>
          {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{profile?.full_name || 'Editor'}</div>
          <div style={styles.userEmail}>{user?.email?.slice(0, 22)}{user?.email?.length > 22 ? '…' : ''}</div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">↩</button>
      </div>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '240px',
    minWidth: '240px',
    background: '#1a1f36',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    padding: '0 0 16px',
    borderRight: '1px solid #2e3555',
  },
  logoWrap: {
    padding: '20px 20px 16px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    borderBottom: '1px solid #2e3555',
    marginBottom: '8px',
  },
  logo: { fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  logoBlue: { color: '#7b8fe8' },
  logoTag: { fontSize: '10px', fontWeight: 600, color: '#6b7280', letterSpacing: '1.5px', textTransform: 'uppercase' },
  section: { padding: '12px 12px 4px' },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    color: '#4b5563',
    textTransform: 'uppercase',
    padding: '0 8px',
    marginBottom: '6px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '6px',
    transition: 'background 0.15s',
    margin: '1px 0',
  },
  navItemActive: { background: 'rgba(69,87,161,0.3)' },
  stepDot: { fontSize: '13px', color: '#4b5563', width: '16px', textAlign: 'center', flexShrink: 0 },
  stepDotActive: { color: '#7b8fe8' },
  stepDotDone: { color: '#10b981' },
  navLabel: { fontSize: '13px', color: '#9ca3af', fontWeight: 500 },
  navLabelActive: { fontSize: '13px', color: '#ffffff', fontWeight: 600 },
  libraryList: { overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 400px)' },
  emptyLib: { fontSize: '12px', color: '#4b5563', padding: '8px 10px', fontStyle: 'italic' },
  libraryItem: {
    display: 'block',
    padding: '8px 10px',
    borderRadius: '6px',
    marginBottom: '2px',
    transition: 'background 0.15s',
  },
  libraryItemActive: { background: 'rgba(69,87,161,0.2)' },
  libTitle: { fontSize: '12px', fontWeight: 500, color: '#d1d5db', marginBottom: '4px', lineHeight: 1.4 },
  libMeta: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' },
  libBadge: { fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px' },
  libDate: { fontSize: '10px', color: '#6b7280', marginLeft: 'auto' },
  userWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px 0',
    borderTop: '1px solid #2e3555',
    marginTop: 'auto',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#4557A1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: '12px', fontWeight: 600, color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: '16px', cursor: 'pointer', padding: '4px', flexShrink: 0 },
}
