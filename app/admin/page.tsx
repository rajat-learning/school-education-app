'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import AdminClassList from '@/components/AdminClassList';
import AdminSubjectList from '@/components/AdminSubjectList';
import AdminBookList from '@/components/AdminBookList';

type ClassType = { id: number; class_name: string; section: string | null };
type SubjectType = { id: number; subject_name: string; class_id: number };
type BookType = { id: number; title: string; pdf_url: string; file_name?: string };

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [books, setBooks] = useState<BookType[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) window.location.href = '/login';
      else setLoading(false);
    };
    checkAuth();
  }, []);

  // Fetch books when selectedSubject changes
  useEffect(() => {
    if (selectedSubject) {
      const fetchBooks = async () => {
        const { data } = await supabase
          .from('books')
          .select('id, title, pdf_url, file_name')
          .eq('subject_id', selectedSubject.id);
        if (data) setBooks(data);
      };
      fetchBooks();
    } else {
      setBooks([]);
    }
  }, [selectedSubject]);

  const handleSubjectSelect = (subject: SubjectType) => {
    setSelectedSubject(subject);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="admin" />
      <div className="flex-1 lg:ml-0">
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage classes, subjects and books</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            {!selectedClass && <AdminClassList onSelectClass={setSelectedClass} />}
            {selectedClass && !selectedSubject && (
              <AdminSubjectList
                classId={selectedClass.id}
                className={`${selectedClass.class_name} ${selectedClass.section || ''}`}
                onSelectSubject={handleSubjectSelect}
                onBack={handleBackToClasses}
              />
            )}
            {selectedSubject && (
              <AdminBookList
                subjectId={selectedSubject.id}
                subjectName={selectedSubject.subject_name}
                className={`${selectedClass!.class_name} ${selectedClass!.section || ''}`}
                books={books}
                onBooksChange={setBooks}
                onBack={handleBackToSubjects}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}