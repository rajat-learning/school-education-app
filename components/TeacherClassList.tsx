'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type ClassType = { id: number; class_name: string; section: string | null }

export default function TeacherClassList({ onSelectClass }: { onSelectClass: (cls: ClassType) => void }) {
  const [classes, setClasses] = useState<ClassType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from('classes').select('*').order('class_name')
      if (data) setClasses(data)
      setLoading(false)
    }
    fetchClasses()
  }, [])

  if (loading) return <div className="text-center py-8">Loading classes...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📚 Select a Class</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelectClass(cls)}
            className="text-left p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white hover:bg-indigo-50 group"
          >
            <h3 className="font-bold text-lg text-black group-hover:text-indigo-700">
              {cls.class_name}
            </h3>
            {cls.section && <p className="text-gray-500">Section {cls.section}</p>}
            <span className="text-sm text-indigo-600 mt-2 inline-block">View subjects →</span>
          </button>
        ))}
      </div>
    </div>
  )
}