'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type ClassType = { id: number; class_name: string; section: string | null }

export default function AdminClassList({ onSelectClass }: { onSelectClass: (cls: ClassType) => void }) {
  const [classes, setClasses] = useState<ClassType[]>([])
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*').order('class_name')
    if (data) setClasses(data)
  }
  useEffect(() => { fetchClasses() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await supabase.from('classes').update({ class_name: className, section }).eq('id', editingId)
      setMessage('Class updated')
    } else {
      await supabase.from('classes').insert([{ class_name: className, section }])
      setMessage('Class added')
    }
    resetForm()
    fetchClasses()
  }
  const handleEdit = (c: ClassType) => { setClassName(c.class_name); setSection(c.section || ''); setEditingId(c.id) }
  const handleDelete = async (id: number) => { if (confirm('Delete class? All subjects & books will be deleted.')) { await supabase.from('classes').delete().eq('id', id); fetchClasses(); setMessage('Deleted') } }
  const resetForm = () => { setClassName(''); setSection(''); setEditingId(null); setTimeout(() => setMessage(''), 3000) }

  return (
    <div>
      <h2 className="text-2xl text-black font-bold mb-4">📚 Manage Classes</h2>
      {message && <div className="mb-3 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Class Name (e.g., Class 10)" value={className} onChange={e => setClassName(e.target.value)} className="border text-gray-900 rounded px-3 py-2 flex-1" required />
        <input type="text" placeholder="Section (e.g., A)" value={section} onChange={e => setSection(e.target.value)} className="border text-gray-900 rounded px-3 py-2 w-28" />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-black text-lg">{cls.class_name}</h3>
                {cls.section && <p className="text-gray-500">Section {cls.section}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cls)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
            <button
              onClick={() => onSelectClass(cls)}
              className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
            >
              Manage subjects →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}