import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createServerSupabaseClient() 
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Fetch user role from user_profiles using the server client
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin')
  if (profile?.role === 'teacher') redirect('/teacher')
  redirect('/unauthorized')
}