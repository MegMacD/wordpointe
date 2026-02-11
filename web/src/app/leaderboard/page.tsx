'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

type TimeFrame = 'all-time' | 'month';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  verse_count: number;
  total_points: number;
  current_points: number;
  is_leader: boolean;
  emojiIcon?: string;
}

function LeaderboardPageContent() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeaders, setShowLeaders] = useState(false);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const res = await fetch(`/api/leaderboard?view=${timeFrame}`);
    const data = await res.json();
    console.log('Leaderboard API response:', { status: res.status, data });
    if (res.ok) {
      setLeaderboard(data.items || []);
    } else {
      console.error('Leaderboard API error:', data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D1DA8A] to-[#B8C76E] text-2xl shadow-lg">
              🏆
            </div>
            <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl font-[family-name:var(--font-quicksand)] leading-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-600">
            {timeFrame === 'all-time' 
              ? 'Top memorizers of all time'
              : `Top memorizers for ${currentMonth}`
            }
          </p>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setTimeFrame('all-time')}
            className={`flex-1 rounded-xl border-2 px-4 py-3 text-center font-medium transition-all hover:-translate-y-0.5 ${
              timeFrame === 'all-time'
                ? 'border-[#D1DA8A] bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] text-gray-800 shadow-md'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#D1DA8A]/50'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`flex-1 rounded-xl border-2 px-4 py-3 text-center font-medium transition-all hover:-translate-y-0.5 ${
              timeFrame === 'month'
                ? 'border-[#B5CED8] bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] text-gray-800 shadow-md'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#B5CED8]/50'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Filter Options */}
        <div className="mb-6">
          <label className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 cursor-pointer hover:border-[#B5CED8]/50 transition-all">
            <input
              type="checkbox"
              checked={showLeaders}
              onChange={(e) => setShowLeaders(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#B5CED8] focus:ring-[#B5CED8]"
            />
            <span className="text-sm font-medium text-gray-700">Include Leaders</span>
          </label>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.filter(entry => showLeaders || !entry.is_leader).length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg">
                <p className="text-gray-500">No data available for this time period.</p>
              </div>
            ) : (
              leaderboard
                .filter(entry => showLeaders || !entry.is_leader)
                .map((entry, index) => {
                const isTop3 = index < 3;
                const medals = ['🥇', '🥈', '🥉'];
                
                return (
                  <div
                    key={entry.user_id}
                    className={`rounded-2xl border-2 bg-white p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                      isTop3
                        ? 'border-[#D1DA8A] bg-gradient-to-r from-[#D1DA8A]/10 to-transparent'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex w-12 flex-shrink-0 items-center justify-center text-2xl font-bold">
                        {isTop3 ? medals[index] : `#${index + 1}`}
                      </div>

                      {/* User Icon & Username */}
                      <div className="flex flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] shadow-sm">
                          {entry.emojiIcon ? (
                            <span className="text-xl">{entry.emojiIcon}</span>
                          ) : (
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <Link
                          href={`/users/${entry.user_id}`}
                          className="text-lg font-semibold text-gray-800 hover:text-[#9AB5C1]"
                        >
                          {entry.username}
                        </Link>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-right">
                        <div>
                          <div className="text-2xl font-bold text-[#B5CED8]">
                            {entry.verse_count}
                          </div>
                          <div className="text-xs text-gray-500">verses</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#D1DA8A]">
                            {entry.total_points}
                          </div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <LeaderboardPageContent />
    </AuthGuard>
  );
}
