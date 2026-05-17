'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type SubjectType = { id: number; subject_name: string; class_id: number }

export default function TeacherSubjectList({
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', classId)
        .order('subject_name')
      if (data) setSubjects(data)
      setLoading(false)
    }
    fetchSubjects()
  }, [classId])

  if (loading) return <div className="text-center py-8">Loading subjects...</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← Back to classes
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{className} – Subjects</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSelectSubject(sub)}
            className="text-left p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white hover:bg-indigo-50 group"
          >
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-700">
              {sub.subject_name}
            </h3>
            <span className="text-sm text-indigo-600 mt-2 inline-block">Open PDF →</span>
          </button>
        ))}
      </div>
      {subjects.length === 0 && (
        <div className="text-center py-8 text-gray-500">No subjects found for this class.</div>
      )}
    </div>
  )
}