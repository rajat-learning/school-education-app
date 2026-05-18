'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import TeacherClassList from '@/components/TeacherClassList';
import TeacherSubjectList from '@/components/TeacherSubjectList';

const MuiPdfViewer = dynamic(() => import('@/components/MuiPdfViewer'), { ssr: false });

type ClassType = { id: number; class_name: string; section: string | null };
type SubjectType = { id: number; subject_name: string; class_id: number };
type BookType = { id: number; title: string; pdf_url: string };

export default function TeacherPage() {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [viewerType, setViewerType] = useState<'mui' | 'simple'>('simple');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) window.location.href = '/login';
      else setLoading(false);
    };
    checkAuth();
  }, []);

  const handleSubjectSelect = async (subject: SubjectType) => {
    setSelectedSubject(subject);
    const { data } = await supabase
      .from('books')
      .select('id, title, pdf_url')
      .eq('subject_id', subject.id)
      .limit(1);
    setSelectedBook(data?.[0] || null);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
            {!selectedClass && <TeacherClassList onSelectClass={setSelectedClass} />}

            {selectedClass && !selectedSubject && (
              <TeacherSubjectList
                classId={selectedClass.id}
                className={`${selectedClass.class_name} ${selectedClass.section || ''}`}
                onSelectSubject={handleSubjectSelect}
                onBack={handleBackToClasses}
              />
            )}

            {selectedSubject && (
              <div>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <button
                    onClick={handleBackToSubjects}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    ← Back to subjects
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedSubject.subject_name} – {selectedClass?.class_name} {selectedClass?.section}
                  </h2>
                </div>

                {selectedBook ? (
                  <>
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setViewerType('simple')}
                        className={`px-3 py-1 rounded text-sm ${
                          viewerType === 'simple' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Opens in new tab
                      </button>
                      <button
                        onClick={() => setViewerType('mui')}
                        className={`px-3 py-1 rounded text-sm ${
                          viewerType === 'mui' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Embedded
                      </button>
                    </div>

                    {viewerType === 'simple' ? (
                      <div className="text-center py-12 border rounded-lg bg-gray-50">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedBook.title}</h3>
                        <p className="text-gray-500 mb-4">Click the button below to open the PDF in a new tab.</p>
                        <a
                          href={selectedBook.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          Open PDF ↗
                        </a>
                      </div>
                    ) : (
                      <MuiPdfViewer fileUrl={selectedBook.pdf_url} title={selectedBook.title} />
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">No PDF available for this subject.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}