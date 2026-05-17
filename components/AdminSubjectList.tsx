'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type SubjectType = { id: number; subject_name: string; class_id: number }

export default function AdminSubjectList({
  classId,
  className,
  onSelectSubject,
  onBack,
}: {
  classId: number
  className: string
  onSelectSubject: (subject: SubjectType) => void
  onBack: () => void
}) {
  const [subjects, setSubjects] = useState<SubjectType[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const fetchSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').eq('class_id', classId).order('subject_name')
    if (data) setSubjects(data)
  }
  useEffect(() => { fetchSubjects() }, [classId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await supabase.from('subjects').update({ subject_name: subjectName }).eq('id', editingId)
      setMessage('Subject updated')
    } else {
      await supabase.from('subjects').insert([{ subject_name: subjectName, class_id: classId }])
      setMessage('Subject added')
    }
    resetForm()
    fetchSubjects()
  }
  const handleEdit = (sub: SubjectType) => { setSubjectName(sub.subject_name); setEditingId(sub.id) }
  const handleDelete = async (id: number) => { if (confirm('Delete subject? All its books will be deleted.')) { await supabase.from('subjects').delete().eq('id', id); fetchSubjects(); setMessage('Deleted') } }
  const resetForm = () => { setSubjectName(''); setEditingId(null); setTimeout(() => setMessage(''), 3000) }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">← Back to classes</button>
        <h2 className="text-xl font-semibold text-gray-800">{className} – Subjects</h2>
      </div>
      {message && <div className="mb-3 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Subject name" value={subjectName} onChange={e => setSubjectName(e.target.value)} className="border rounded px-3 py-2 flex-1" required />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <div key={sub.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">{sub.subject_name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(sub)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
            <button
              onClick={() => onSelectSubject(sub)}
              className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
            >
              Manage books →
            </button>
          </div>
        ))}
        {subjects.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No subjects yet. Add one above.</div>}
      </div>
    </div>
  )
}