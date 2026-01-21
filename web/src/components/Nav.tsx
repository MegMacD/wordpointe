'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SessionUser {
  id: string;
  name: string;
  role: 'leader' | 'admin';
  is_leader: boolean;
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const mainLinks = [
    { href: '/', label: 'Home' },
    { href: '/record', label: 'Record' },
    { href: '/spend', label: 'Spend' },
    { href: '/users', label: 'Users' },
  ];

  const adminLinks = [
    { href: '/admin/memory-items', label: 'Memory Items' },
    { href: '/admin/records', label: 'User Records' },
    { href: '/admin/bonus-points', label: 'Adjust Points' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  const isAdminPage = pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#DFA574] shadow-md transition-transform group-hover:scale-105">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800 font-[family-name:var(--font-quicksand)]">
                Word Pointe
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {user ? (
              <>
                {mainLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      pathname === link.href
                        ? 'bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] text-gray-800 shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Admin Dropdown */}
                {user.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      onBlur={() => setTimeout(() => setAdminMenuOpen(false), 200)}
                      className={`flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        isAdminPage
                          ? 'bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] text-gray-800 shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span>Admin</span>
                      <svg className={`ml-1 h-4 w-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {adminMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg">
                        {adminLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setAdminMenuOpen(false)}
                            className={`block px-4 py-2 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${
                              pathname === link.href
                                ? 'bg-[#B5CED8]/20 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="ml-4 flex items-center space-x-3 border-l border-gray-300 pl-4">
                  <Link
                    href="/help"
                    className="group flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-[#B5CED8] hover:shadow-md"
                    title="Help"
                  >
                    <svg className="h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#D1DA8A] to-[#DFA574] text-sm font-bold text-gray-800 shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-4 py-2 text-sm font-semibold text-gray-800 shadow-md transition-all hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-xl p-2 text-gray-700 transition-colors hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {user && mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-2.5 text-base font-semibold transition-all ${
                    pathname === link.href
                      ? 'bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] text-gray-800 shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Admin Section in Mobile */}
              {user.role === 'admin' && (
                <div className="pt-2">
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Admin
                  </div>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded-xl px-4 py-2.5 text-base font-semibold transition-all ${
                        pathname === link.href
                          ? 'bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] text-gray-800 shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
              
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-all ${
                  pathname === '/help'
                    ? 'bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] text-gray-800 shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help
              </Link>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3 px-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#D1DA8A] to-[#DFA574] text-sm font-bold text-gray-800 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 block w-full rounded-xl bg-red-50 px-4 py-2.5 text-left text-base font-semibold text-red-600 transition-all hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

