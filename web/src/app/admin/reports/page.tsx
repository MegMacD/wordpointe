'use client';

import { useState, useEffect } from 'react';
import { UserSummary } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';

function ReportsPageContent() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users?pageSize=1000');
    const data = await res.json();
    if (res.ok) {
      setUsers(data.items || []);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    // Use the new server-side CSV export
    window.location.href = '/api/reports/users-csv';
  };

  const handleExportUserHistory = (userId: string, userName: string) => {
    // Export individual user history
    window.location.href = `/api/reports/user-history-csv/${userId}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        {/* Print Header */}
        <div className="print-header">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DFA574] to-[#C88A5E] shadow-md">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)] leading-tight">
              Word Pointe Points Report
            </h1>
          </div>
          <div className="print-date mb-6 text-sm text-gray-600">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="print-hide mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="rounded-xl bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] px-5 py-2.5 font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            disabled={loading}
          >
            Export All Users CSV
          </button>
          <button
            onClick={handlePrint}
            className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
          >
            Print Report
          </button>
        </div>

        {/* Statistics Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#B5CED8]">
              {users.length}
            </div>
            <div className="text-sm font-medium text-gray-600">
              Total Users
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#D1DA8A]">
              {users.filter(u => u.current_points > 0).length}
            </div>
            <div className="text-sm font-medium text-gray-600">
              Users with Points
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#DFA574]">
              {users.reduce((sum, u) => sum + u.current_points, 0)}
            </div>
            <div className="text-sm font-medium text-gray-600">
              Current Points
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-700">
              {users.reduce((sum, u) => sum + u.current_points, 0)}
            </div>
            <div className="text-sm font-medium text-gray-600">
              Total System Points
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-semibold text-gray-900">Current Points Report</h2>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-600">No users found</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-[#DFA574]/10 to-[#DFA574]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Current Points
                  </th>
                  <th className="print-hide px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.is_leader ? 'Leader' : 'Student'}
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${
                      user.current_points > 50 ? 'text-green-600' : 
                      user.current_points === 0 ? 'text-gray-400' : 
                      'text-gray-900'
                    }`}>
                      {user.current_points}
                    </td>
                    <td className="print-hide whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleExportUserHistory(user.id, user.name)}
                        className="rounded-lg bg-[#B5CED8]/20 px-2 py-1 text-xs font-medium text-[#9AB5C1] hover:bg-[#B5CED8]/30 transition-colors"
                        title={`Export history for ${user.name}`}
                      >
                        Export History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 border-t pt-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <div>
              Report includes {users.length} users ({users.filter(u => u.is_leader).length} leaders, {users.filter(u => !u.is_leader).length} students)
            </div>
            <div>
              Total System Points: {users.reduce((sum, u) => sum + u.current_points, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Print Footer - Only visible when printing */}
      <div className="print-footer" style={{ display: 'none' }}>
        Word Pointe Sunday School Memory Program - North Pointe Church
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AuthGuard requireAdmin>
      <ReportsPageContent />
    </AuthGuard>
  );
}

