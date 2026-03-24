import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Load library drafts
  const { data: drafts } = await supabase
    .from('drafts')
    .select('id, title, content_specification, wp_pushed, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar drafts={drafts || []} user={session.user} />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f4f6fb' }}>
        {children}
      </main>
    </div>
  )
}
