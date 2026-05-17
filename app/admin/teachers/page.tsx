'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Sidebar from '@/components/Sidebar'
import TeacherManager from '@/components/TeacherManager'

export default function AdminTeachersPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile?.role !== 'admin') {
        window.location.href = '/unauthorized'
        return
      }
      setLoading(false)
    }
    checkAdmin()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="admin" />
      <div className="flex-1 lg:ml-0">
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Teacher Management</h1>
            <p className="text-gray-500 mt-1">Add, update or remove teacher accounts</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <TeacherManager />
          </div>
        </div>
      </div>
    </div>
  )
}