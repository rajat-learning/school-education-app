# School Education Portal

A modern, full‑stack school management system built with **Next.js 15 (App Router)**, **Supabase** (auth, database, storage), and **Tailwind CSS**.  
Admins can manage classes, subjects, books (PDFs), and teacher accounts. Teachers can browse their teaching materials and view PDFs.

## ✨ Features

### Admin
- ✅ Manage classes (create, edit, delete)
- ✅ Manage subjects (create, edit, delete) – bound to a class
- ✅ Manage books (upload PDF, edit, delete) – bound to a subject
- ✅ Manage teacher accounts (add, delete, reset password hint)
- ✅ Clean, hierarchical UI (classes → subjects → books)

### Teacher
- ✅ Browse classes (read‑only)
- ✅ View subjects per class
- ✅ Open PDFs (in‑browser iframe)
- ✅ Responsive sidebar navigation

### General
- 🔐 Authentication via Supabase Auth (email/password)
- 🍪 Session stored in HTTP‑only cookies (persists across refresh)
- 📁 PDF files stored in Supabase Storage (public bucket)
- 📱 Fully responsive (mobile hamburger menu)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Supabase Auth + `@supabase/ssr` (cookie‑based)
- **Database**: Supabase PostgreSQL (Row Level Security disabled for simplicity)
- **Storage**: Supabase Storage (public `books` bucket)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📁 Project Structure
school-app/
├── app/
│ ├── layout.tsx
│ ├── login/
│ │ └── page.tsx
│ ├── admin/
│ │ ├── page.tsx
│ │ └── teachers/
│ │ └── page.tsx
│ ├── teacher/
│ │ └── page.tsx
│ └── unauthorized/
│ └── page.tsx
├── components/
│ ├── Sidebar.tsx
│ ├── AdminClassList.tsx
│ ├── AdminSubjectList.tsx
│ ├── AdminBookList.tsx
│ ├── TeacherManager.tsx
│ ├── TeacherClassList.tsx
│ ├── TeacherSubjectList.tsx
├── lib/
│ ├── supabaseClient.ts (client‑side)
│ └── supabaseServer.ts (server‑side & admin)
├── public/
├── .env.local
├── tailwind.config.js
├── next.config.js
└── package.json

text

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/school-education-app.git
cd school-education-app
2. Install dependencies
bash
npm install
# or
yarn install
3. Set up Supabase
Create a Supabase project.

Run the following SQL in the Supabase SQL editor to create the tables and disable RLS (recommended for a simple school app, but you can add policies later):

sql
-- Create tables
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'teacher')) NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  class_name TEXT NOT NULL,
  section TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  subject_name TEXT NOT NULL,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  class_id INTEGER REFERENCES classes(id),
  subject_id INTEGER REFERENCES subjects(id),
  pdf_url TEXT NOT NULL,
  file_name TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS (simplest for demo)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
Create a storage bucket named books and set it to public (so PDFs are accessible).

4. Environment variables
Create a .env.local file in the root:

env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
The service role key is only used on the server (e.g., for updating teacher passwords). It’s safe as long as you never expose it to the client.

5. Run the development server
bash
npm run dev
Open http://localhost:3000 with your browser.

👤 Creating the first admin
Go to Supabase Dashboard → Authentication → Users → Add a new user (email/password).

Copy the user’s UUID.

Run in SQL editor:

sql
INSERT INTO user_profiles (id, email, role, full_name)
VALUES ('user-uuid', 'admin@school.com', 'admin', 'System Admin');
Now you can log in with that email.

📦 Building for production
bash
npm run build
npm start
🧪 Testing teacher access
Create a teacher user in Supabase Auth.

Insert a corresponding row in user_profiles with role = 'teacher'.

Log in with the teacher account – you will see the teacher dashboard.

📄 PDF handling
PDFs are uploaded to the books Supabase Storage bucket.

The bucket must be public (or use signed URLs – not implemented in this version).

Teachers view PDFs via an <iframe> that uses the browser’s native PDF viewer.

🗑️ Cleaning up old files (if migrating from Vite React)
If you previously had a Vite + React version of this app, you can safely delete:

src/ folder (the old React source)

index.html, vite.config.js, postcss.config.js (unless you still need them for other projects)

Any old components (e.g., ClassManager.jsx, SubjectManager.jsx – they are replaced by the .tsx files in components/)

🤝 Contributing
Feel free to open issues or pull requests. For major changes, please discuss first.

📄 License
MIT

text

---

