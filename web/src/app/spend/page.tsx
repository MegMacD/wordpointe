'use client';

import { useState, useEffect } from 'react';
import { UserSummary, SpendRecord } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import SearchableDropdown from '@/components/SearchableDropdown';

function SpendPageContent() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pointsSpent, setPointsSpent] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recentSpends, setRecentSpends] = useState<SpendRecord[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchRecentSpends();
      fetchUsers(); // Refresh to get updated points
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (res.ok) {
      setUsers(data.items || []);
    }
  };

  const fetchRecentSpends = async () => {
    if (!selectedUserId) return;
    const res = await fetch(`/api/spend?user_id=${selectedUserId}&undone=false`);
    const data = await res.json();
    if (res.ok) {
      setRecentSpends((data.items || []).slice(0, 5));
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !pointsSpent) {
      setMessage({ type: 'error', text: 'Please select a user and enter points' });
      return;
    }

    const points = parseInt(pointsSpent);
    if (isNaN(points) || points <= 0) {
      setMessage({ type: 'error', text: 'Points must be a positive number' });
      return;
    }

    if (selectedUser && points > selectedUser.current_points) {
      setMessage({
        type: 'error',
        text: `Insufficient points. Current: ${selectedUser.current_points}`,
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          points_spent: points,
          note: note || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Spent ${points} points successfully!`,
        });
        setPointsSpent('');
        setNote('');
        fetchUsers();
        fetchRecentSpends();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to spend points' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (spendId: string) => {
    try {
      const res = await fetch(`/api/spend/${spendId}/undo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Spend record undone!' });
        fetchUsers();
        fetchRecentSpends();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to undo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  // Convert users to dropdown options
  const userOptions = users.map(user => ({
    id: user.id,
    label: user.name,
    secondary: user.is_leader ? 'Leader' : ''
  }));

  const remainingPoints =
    selectedUser && pointsSpent
      ? selectedUser.current_points - parseInt(pointsSpent) || 0
      : selectedUser?.current_points ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        {/* Header with Peach accent */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DFA574] to-[#C88A5E] shadow-md">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)] leading-tight">Spend Points</h1>
          </div>
          <p className="text-gray-600">Redeem points for rewards and prizes</p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl p-4 ${
              message.type === 'success'
                ? 'bg-[#DFA574]/20 text-gray-800 border border-[#DFA574]/30'
                : 'bg-[#C97435]/10 text-gray-800 border border-[#C97435]/30'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="mr-2 h-5 w-5 text-[#DFA574]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="mr-2 h-5 w-5 text-[#C97435]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <SearchableDropdown
              label="Select User"
              options={userOptions}
              value={selectedUserId}
              onSelect={setSelectedUserId}
              placeholder="Choose a user to spend points..."
              searchPlaceholder="Search users..."
              emptyMessage="No users found."
            />
          </div>

          {/* Current Points Display */}
          {selectedUser && (
            <div className="rounded-2xl bg-gradient-to-r from-[#DFA574]/15 to-[#DFA574]/5 border-2 border-[#DFA574]/30 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DFA574] to-[#C88A5E]">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Available Points</div>
                    <div className="text-3xl font-bold text-gray-900">{selectedUser.current_points}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Points to Spend */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Points to Spend
            </label>
            <input
              type="number"
              min="1"
              value={pointsSpent}
              onChange={(e) => setPointsSpent(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#DFA574] focus:outline-none focus:ring-2 focus:ring-[#DFA574]/20"
              placeholder="Enter points amount"
              required
            />
            {selectedUser && pointsSpent && (
              <div className="mt-3 flex items-center rounded-xl bg-gray-50 px-4 py-2 text-sm">
                <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">
                  Remaining after spend: <span className="font-semibold">{remainingPoints}</span>
                </span>
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Candy, Small toy, Sticker"
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#DFA574] focus:outline-none focus:ring-2 focus:ring-[#DFA574]/20"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !selectedUserId ||
              !pointsSpent ||
              (selectedUser && parseInt(pointsSpent) > selectedUser.current_points)
            }
            className="w-full rounded-xl bg-gradient-to-r from-[#DFA574] to-[#C88A5E] px-4 py-3 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Spend Points'
            )}
          </button>
        </form>

        {/* Recent Spends */}
        {selectedUserId && recentSpends.length > 0 && (
          <div className="mt-8 border-t-2 border-gray-100 pt-8">
            <div className="mb-4 flex items-center">
              <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Recent Spends</h2>
            </div>
            <div className="space-y-3">
              {recentSpends.map((spend) => (
                <div
                  key={spend.id}
                  className="flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 transition-all hover:shadow-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#DFA574]/20">
                        <svg className="h-4 w-4 text-[#DFA574]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">-{spend.points_spent} points</div>
                        {spend.note && (
                          <div className="text-sm text-gray-600">{spend.note}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(spend.spent_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUndo(spend.id)}
                    className="ml-4 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 hover:shadow-sm"
                  >
                    Undo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpendPage() {
  return (
    <AuthGuard>
      <SpendPageContent />
    </AuthGuard>
  );
}

