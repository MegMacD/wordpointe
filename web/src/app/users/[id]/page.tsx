'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserWithPoints, VerseRecord, SpendRecord, BonusRecord } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';

function UserDetailPageContent() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserWithPoints | null>(null);
  const [records, setRecords] = useState<VerseRecord[]>([]);
  const [spends, setSpends] = useState<SpendRecord[]>([]);
  const [bonuses, setBonuses] = useState<BonusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'spends'>('records');

  useEffect(() => {
    if (userId) {
      fetchUser();
      fetchRecords();
      fetchSpends();
      fetchBonuses();
    }
  }, [userId]);

  const fetchUser = async () => {
    const res = await fetch(`/api/users/${userId}`);
    const data = await res.json();
    if (res.ok) {
      setUser(data);
    }
    setLoading(false);
  };

  const fetchRecords = async () => {
    const res = await fetch(`/api/records?user_id=${userId}`);
    const data = await res.json();
    if (res.ok) {
      setRecords(data.items || []);
    }
  };

  const fetchSpends = async () => {
    const res = await fetch(`/api/spend?user_id=${userId}`);
    const data = await res.json();
    if (res.ok) {
      setSpends(data.items || []);
    }
  };

  const fetchBonuses = async () => {
    const res = await fetch(`/api/bonus?user_id=${userId}`);
    const data = await res.json();
    if (res.ok) {
      setBonuses(data.items || []);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link href="/users" className="inline-flex items-center font-medium text-[#B5CED8] hover:text-[#9AB5C1] transition-colors">
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </Link>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] shadow-md">
              {user.emojiIcon ? (
                <span className="text-2xl">{user.emojiIcon}</span>
              ) : (
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)] leading-tight">{user.name}</h1>
              {user.is_leader && (
                <span className="mt-2 inline-flex items-center rounded-xl bg-[#B5CED8]/20 px-3 py-1 text-xs font-medium text-gray-800">
                  Leader
                </span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-[#B5CED8]/15 to-[#B5CED8]/5 border-2 border-[#B5CED8]/30 p-5">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1]">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Current Points</div>
                <div className="text-3xl font-bold text-gray-900">{user.current_points}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b-2 border-gray-200">
          <nav className="-mb-0.5 flex space-x-8">
            <button
              onClick={() => setActiveTab('records')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'records'
                  ? 'border-[#B5CED8] text-[#B5CED8]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Records ({records.length + bonuses.length})
            </button>
            <button
              onClick={() => setActiveTab('spends')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'spends'
                  ? 'border-[#B5CED8] text-[#B5CED8]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Spends ({spends.filter((s) => !s.undone).length})
            </button>
          </nav>
        </div>

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-3">
            {records.length === 0 && bonuses.length === 0 ? (
              <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
                No records yet
              </div>
            ) : (
              // Combine and sort records and bonuses by date
              [...records.map(r => ({ type: 'verse' as const, data: r, date: r.recorded_at })),
               ...bonuses.map(b => ({ type: 'bonus' as const, data: b, date: b.awarded_at }))]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item) => (
                  <div
                    key={`${item.type}-${item.data.id}`}
                    className="rounded-2xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 transition-all hover:shadow-md"
                  >
                    {item.type === 'verse' ? (
                      // Verse record
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D1DA8A]/20">
                            <svg className="h-5 w-5 text-[#B8C76E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {(item.data as VerseRecord).memory_items?.reference || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {(item.data as VerseRecord).record_type === 'first' ? 'First Time' : 'Repeat'} · {new Date((item.data as VerseRecord).recorded_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center rounded-xl bg-[#D1DA8A]/20 px-3 py-1.5">
                          <span className="text-lg font-semibold text-[#B8C76E]">+{(item.data as VerseRecord).points_awarded}</span>
                          <span className="ml-1 text-sm text-gray-600">pts</span>
                        </div>
                      </div>
                    ) : (
                      // Bonus record
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                            (item.data as BonusRecord).category === 'legacy' ? 'bg-[#B5CED8]/20' :
                            (item.data as BonusRecord).category === 'correction' ? 'bg-[#DFA574]/20' :
                            'bg-[#D1DA8A]/20'
                          }`}>
                            <svg className={`h-5 w-5 ${
                              (item.data as BonusRecord).category === 'legacy' ? 'text-[#B5CED8]' :
                              (item.data as BonusRecord).category === 'correction' ? 'text-[#DFA574]' :
                              'text-[#B8C76E]'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              {(item.data as BonusRecord).category === 'legacy' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (item.data as BonusRecord).category === 'correction' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {(item.data as BonusRecord).reason}
                              </span>
                              <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                                {(item.data as BonusRecord).category}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date((item.data as BonusRecord).awarded_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center rounded-xl px-3 py-1.5 ${
                          (item.data as BonusRecord).points_awarded > 0 
                            ? 'bg-[#D1DA8A]/20' 
                            : 'bg-[#C97435]/20'
                        }`}>
                          <span className={`text-lg font-semibold ${
                            (item.data as BonusRecord).points_awarded > 0 
                              ? 'text-[#B8C76E]' 
                              : 'text-[#C97435]'
                          }`}>
                            {(item.data as BonusRecord).points_awarded > 0 ? '+' : ''}{(item.data as BonusRecord).points_awarded}
                          </span>
                          <span className="ml-1 text-sm text-gray-600">pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {/* Spends Tab */}
        {activeTab === 'spends' && (
          <div className="space-y-3">
            {spends.filter((s) => !s.undone).length === 0 ? (
              <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
                No spends yet
              </div>
            ) : (
              spends
                .filter((s) => !s.undone)
                .map((spend) => (
                  <div
                    key={spend.id}
                    className="rounded-2xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFA574]/20">
                          <svg className="h-5 w-5 text-[#DFA574]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {spend.note || 'No note'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(spend.spent_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center rounded-xl bg-[#DFA574]/20 px-3 py-1.5">
                        <span className="text-lg font-semibold text-[#DFA574]">-{spend.points_spent}</span>
                        <span className="ml-1 text-sm text-gray-600">pts</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <AuthGuard>
      <UserDetailPageContent />
    </AuthGuard>
  );
}

