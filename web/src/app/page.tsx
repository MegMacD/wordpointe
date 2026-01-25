'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

function HomeContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#B5CED8] via-[#D1DA8A] to-[#DFA574] p-8 shadow-lg sm:p-12">
        <div className="flex items-center space-x-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/30 backdrop-blur-sm shadow-md">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl font-[family-name:var(--font-quicksand)]">
              Word Pointe
            </h1>
            <p className="text-lg text-white/90">
              Helping kids hide God's Word in their hearts
            </p>
            <p className="text-base text-white/80">
              Track verses, celebrate progress, grow in faith
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/record"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#D1DA8A] opacity-20 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D1DA8A] to-[#BCC775] text-white shadow-lg">
                <svg className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Record Memory
              </h3>
              <p className="text-gray-600">
                Record when a child memorizes a verse
              </p>
              <div className="mt-4 flex items-center text-sm font-semibold text-gray-700">
                Get Started
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/spend"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#DFA574] opacity-20 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DFA574] to-[#C98F5F] text-white shadow-lg">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Spend Points
              </h3>
              <p className="text-gray-600">
                Deduct points when a child redeems a prize
              </p>
              <div className="mt-4 flex items-center text-sm font-semibold text-gray-700">
                Get Started
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/users"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[#B5CED8] opacity-20 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] text-white shadow-lg">
                <svg className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Manage Users
              </h3>
              <p className="text-gray-600">
                View and manage all kids and leaders
              </p>
              <div className="mt-4 flex items-center text-sm font-semibold text-gray-700">
                Get Started
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/memory-items"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Memory Items
            </h2>
            <p className="text-gray-600">
              Manage verses and custom memory items
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Reports
            </h2>
            <p className="text-gray-600">
              Export current points and history
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Settings
            </h2>
            <p className="text-gray-600">
              Configure default point values
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
