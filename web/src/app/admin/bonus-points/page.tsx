'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserSummary } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import SearchableDropdown from '@/components/SearchableDropdown';

function BonusPointsPageContent() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pointsAwarded, setPointsAwarded] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState<'bonus' | 'correction' | 'other'>('bonus');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (res.ok) {
      setUsers(data.items || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !pointsAwarded || !reason.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    const points = parseInt(pointsAwarded);
    if (isNaN(points) || points === 0) {
      setMessage({ type: 'error', text: 'Points must be a non-zero number' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          points_awarded: points,
          reason: reason.trim(),
          category,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Reset form
        setSelectedUserId('');
        setPointsAwarded('');
        setReason('');
        setCategory('bonus');
        
        setMessage({ 
          type: 'success', 
          text: `Successfully ${points > 0 ? 'granted' : 'deducted'} ${Math.abs(points)} point(s)!` 
        });
        setTimeout(() => setMessage(null), 5000);
        
        // Refresh users to show updated points
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to grant points' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  // Convert users to dropdown options
  const userOptions = users.map(user => ({
    id: user.id,
    label: user.name,
    secondary: `${user.current_points} points${user.is_leader ? ' • Leader' : ''}`
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DFA574] to-[#C98F5F] shadow-md">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)] leading-tight">Adjust Points</h1>
              <p className="mt-1 text-sm text-gray-600">
                Add or remove points for bonuses, corrections, or special occasions
              </p>
            </div>
          </div>
          <Link
            href="/admin/records"
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
          >
            View All Records
          </Link>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl p-4 border ${
              message.type === 'success'
                ? 'bg-[#D1DA8A]/20 text-gray-800 border-[#D1DA8A]/30'
                : 'bg-[#C97435]/10 text-gray-800 border-[#C97435]/30'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="mr-2 h-5 w-5 text-[#B8C76E]" fill="currentColor" viewBox="0 0 20 20">
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

        <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User *
            </label>
            <SearchableDropdown
              options={userOptions}
              value={selectedUserId}
              onSelect={setSelectedUserId}
              placeholder="Choose a user..."
              searchPlaceholder="Search users..."
              emptyMessage="No users found."
              disabled={loading}
            />
            {selectedUser && (
              <p className="mt-2 text-sm text-gray-600">
                Current points: <span className="font-semibold">{selectedUser.current_points}</span>
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'bonus' | 'correction' | 'other')}
              className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#DFA574] focus:outline-none focus:ring-2 focus:ring-[#DFA574]/20"
              disabled={loading}
            >
              <option value="bonus">Bonus (special achievement or occasion)</option>
              <option value="correction">Correction (fix an error)</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Points */}
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700">
              Points to Award *
            </label>
            <input
              type="number"
              id="points"
              value={pointsAwarded}
              onChange={(e) => setPointsAwarded(e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#DFA574] focus:outline-none focus:ring-2 focus:ring-[#DFA574]/20"
              placeholder="Enter positive number to add, negative to deduct"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a positive number to add points, or a negative number to deduct points
            </p>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#DFA574] focus:outline-none focus:ring-2 focus:ring-[#DFA574]/20"
              placeholder="Explain why these points are being awarded (required for audit trail)"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be saved for record-keeping and transparency
            </p>
          </div>

          {/* Preview */}
          {selectedUser && pointsAwarded && !isNaN(parseInt(pointsAwarded)) && parseInt(pointsAwarded) !== 0 && (
            <div className="rounded-md bg-blue-50 p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Preview</h3>
              <p className="text-sm text-blue-700">
                <span className="font-semibold">{selectedUser.name}</span> will have{' '}
                <span className="font-semibold">
                  {selectedUser.current_points + parseInt(pointsAwarded)}
                </span>{' '}
                points after this adjustment
                {parseInt(pointsAwarded) > 0 ? (
                  <span className="text-green-700"> (+{pointsAwarded})</span>
                ) : (
                  <span className="text-red-700"> ({pointsAwarded})</span>
                )}
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedUserId('');
                setPointsAwarded('');
                setReason('');
                setCategory('bonus');
              }}
              className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
              disabled={loading}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUserId || !pointsAwarded || !reason.trim()}
              className="rounded-xl bg-gradient-to-r from-[#DFA574] to-[#C98F5F] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Processing...' : 'Adjust Points'}
            </button>
          </div>
        </form>
      </div>

        {/* Help Section */}
        <div className="mt-8 rounded-2xl bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">When to Use Point Adjustments</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <svg className="mr-2 mt-0.5 h-5 w-5 text-[#DFA574] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Bonus:</strong> Special achievements, birthdays, participation in events, or encouragement</span>
          </li>
          <li className="flex items-start">
            <svg className="mr-2 mt-0.5 h-5 w-5 text-[#D1DA8A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Correction:</strong> Fix errors in point tracking, restore accidentally lost points</span>
          </li>
          <li className="flex items-start">
            <svg className="mr-2 mt-0.5 h-5 w-5 text-[#B5CED8] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Legacy Points:</strong> When creating a new user, add their points from the previous system (if not added during user creation)</span>
          </li>
          <li className="flex items-start">
            <svg className="mr-2 mt-0.5 h-5 w-5 text-[#C98F5F] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Deductions:</strong> Use negative numbers to remove points (rare, but available if needed)</span>
          </li>
        </ul>
        </div>
      </div>
    </div>
  );
}

export default function BonusPointsPage() {
  return (
    <AuthGuard requireAdmin>
      <BonusPointsPageContent />
    </AuthGuard>
  );
}
