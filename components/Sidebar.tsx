'use client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

const navItems = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: '🏠', basePath: '/admin', tab: null },
     { name: 'Teachers', href: '/admin/teachers', icon: '👩‍🏫', basePath: '/admin/teachers', tab: null },
  ],
  teacher: [
    { name: 'Dashboard', href: '/teacher', icon: '🏠', basePath: '/teacher', tab: null },
  ]
}

export default function Sidebar({ role }: { role: 'admin' | 'teacher' }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const currentTab = searchParams.get('tab')

  const isActive = (item: any) => {
    if (item.tab === null) return pathname === item.basePath
    return pathname === item.basePath && currentTab === item.tab
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const items = navItems[role]

  return (
    <>
      {/* Mobile menu button – top right */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar (slide‑in from left) */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-800">School<span className="text-indigo-600">Portal</span></h2>
            <p className="text-xs text-gray-500 mt-1 capitalize">{role} Panel</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item)
                    ? 'bg-indigo-50 text-indigo-800 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 rounded-lg transition"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay – closes sidebar when tapped */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}