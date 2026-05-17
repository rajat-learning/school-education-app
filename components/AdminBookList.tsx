'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type BookType = { id: number; title: string; pdf_url: string; file_name?: string };

export default function AdminBookList({
  subjectId,
  subjectName,
  className,
  books,
  onBooksChange,
  onBack,
}: {
  subjectId: number;
  subjectName: string;
  className: string;
  books: BookType[];
  onBooksChange: (books: BookType[]) => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const uploadPDF = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from('books').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('books').getPublicUrl(fileName);
    return publicUrl;
  };

  const refreshBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, pdf_url, file_name')
      .eq('subject_id', subjectId);
    if (data) onBooksChange(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let pdfUrl = undefined;
      if (pdfFile) pdfUrl = await uploadPDF(pdfFile);
      if (editingId) {
        const updateData: any = { title };
        if (pdfUrl) updateData.pdf_url = pdfUrl;
        await supabase.from('books').update(updateData).eq('id', editingId);
        setMessage('Book updated');
      } else {
        if (!pdfUrl) throw new Error('PDF file is required');
        await supabase.from('books').insert([{ title, subject_id: subjectId, pdf_url: pdfUrl, file_name: pdfFile?.name }]);
        setMessage('Book added');
      }
      resetForm();
      await refreshBooks();
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: BookType) => {
    setTitle(book.title);
    setEditingId(book.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this book?')) {
      await supabase.from('books').delete().eq('id', id);
      await refreshBooks();
      setMessage('Book deleted');
    }
  };

  const resetForm = () => {
    setTitle('');
    setPdfFile(null);
    setEditingId(null);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          ← Back to subjects
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {subjectName} – {className}
        </h2>
      </div>
      {message && (
        <div className={`mb-3 p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input type="text" placeholder="Book Title" value={title} onChange={e => setTitle(e.target.value)} className="border rounded text-gray-800 px-3 py-2" required />
        <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="border rounded text-gray-800 px-3 py-2" required={!editingId} />
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? 'Uploading...' : editingId ? 'Update' : 'Add Book'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {books.map((book) => (
          <div key={book.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-black">{book.title}</h3>
                <a href={book.pdf_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm">Open PDF ↗</a>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(book)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {books.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No books yet. Add one above.</div>}
      </div>
    </div>
  );
}