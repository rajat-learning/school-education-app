'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import TeacherClassList from '@/components/TeacherClassList';
import TeacherSubjectList from '@/components/TeacherSubjectList';

// Dynamically import the PDF viewer (client‑side only)
const MuiPdfViewer = dynamic(() => import('@/components/MuiPdfViewer'), {
  ssr: false,
});

type ClassType = { id: number; class_name: string; section: string | null };
type SubjectType = { id: number; subject_name: string; class_id: number };
type BookType = { id: number; title: string; pdf_url: string };

export default function TeacherPage() {
  const [role, setRole] = useState<'admin' | 'teacher'>('teacher');
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(
    null
  );
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role === 'admin') setRole('admin');
        else setRole('teacher');
      }
      setLoading(false);
    };
    getUserRole();
  }, []);

  const handleSubjectSelect = async (subject: SubjectType) => {
    setSelectedSubject(subject);
    // Automatically pick the first book for this subject (or let the user choose)
    const { data } = await supabase
      .from('books')
      .select('id, title, pdf_url')
      .eq('subject_id', subject.id)
      .limit(1);
    if (data && data.length > 0) {
      setSelectedBook(data[0]);
    } else {
      setSelectedBook(null);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedBook(null);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedBook(null);
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="teacher" />
      <div className="flex-1 lg:ml-0">
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-500 mt-1">Browse teaching materials</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            {!selectedClass && (
              <TeacherClassList onSelectClass={setSelectedClass} />
            )}

            {selectedClass && !selectedSubject && (
              <TeacherSubjectList
                classId={selectedClass.id}
                className={`${selectedClass.class_name} ${
                  selectedClass.section || ''
                }`}
                onSelectSubject={handleSubjectSelect}
                onBack={handleBackToClasses}
              />
            )}

            {selectedSubject && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={handleBackToSubjects}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    ← Back to subjects
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedSubject.subject_name} –{' '}
                    {selectedClass?.class_name} {selectedClass?.section}
                  </h2>
                </div>
                {selectedBook ? (
                  <MuiPdfViewer fileUrl={selectedBook.pdf_url} title={selectedBook.title} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No PDF available for this subject.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}