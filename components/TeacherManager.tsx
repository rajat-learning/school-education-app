'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type TeacherType = { id: string; email: string; full_name: string; role: string }

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<TeacherType[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const fetchTeachers = async () => {
    const { data } = await supabase.from('user_profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false })
    if (data) setTeachers(data)
  }
  useEffect(() => { fetchTeachers() }, [])

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      await supabase.from('user_profiles').insert([{ id: authData.user?.id, email, full_name: fullName, role: 'teacher' }])
      setMessage('Teacher added successfully')
      setFullName(''); setEmail(''); setPassword('')
      fetchTeachers()
    } catch (err: any) { setMessage('Error: ' + err.message) }
  }

  const handleDelete = async (teacherId: string, teacherEmail: string) => {
    if (!confirm(`Delete ${teacherEmail}? This will remove the profile. The auth user remains.`)) return
    await supabase.from('user_profiles').delete().eq('id', teacherId)
    setMessage(`Teacher ${teacherEmail} removed from app.`)
    fetchTeachers()
  }

  const handleUpdatePassword = async (teacherId: string, teacherEmail: string) => {
    const newPassword = prompt(`Enter new password for ${teacherEmail}`)
    if (!newPassword) return
    // Update auth user password (requires admin privileges – use supabaseAdmin on server, but for simplicity we'll note it)
    // In client, you cannot update another user's password. For demo, show alert.
    alert('Password update requires server action. Implement via API route using service role.')
  }

  return (
    <div>
      <h2 className="text-2xl text-black font-bold mb-4">👩‍🏫 Manage Teachers</h2>
      {message && <div className="mb-3 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
      <form onSubmit={handleAddTeacher} className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="border rounded px-3 py-2 flex-1" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 w-64" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-3 py-2 w-40" required />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Add Teacher</button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr><th className="p-2 text-black">Name</th><th>Email</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id} className="border-b">
                <td className="p-2 text-black">{t.full_name}</td>
                <td className="p-2 text-black">{t.email}</td>
                <td>
                  <button onClick={() => handleUpdatePassword(t.id, t.email)} className="text-indigo-600 mr-2">Reset Password</button>
                  <button onClick={() => handleDelete(t.id, t.email)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}