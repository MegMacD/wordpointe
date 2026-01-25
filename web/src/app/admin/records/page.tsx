'use client';

import { useEffect, useState } from 'react';
import { VerseRecord, SpendRecord, User, MemoryItem } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';

interface Message {
  type: 'success' | 'error';
  text: string;
}

function AdminRecordsPageContent() {
  const [verseRecords, setVerseRecords] = useState<(VerseRecord & { 
    memory_items?: MemoryItem; 
    users?: User 
  })[]>([]);
  const [spendRecords, setSpendRecords] = useState<(SpendRecord & { 
    users?: User 
  })[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'verse' | 'spend'>('verse');
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchVerseRecords = async () => {
    try {
      const response = await fetch('/api/records');
      if (response.ok) {
        const data = await response.json();
        setVerseRecords(data.items || []);
      } else {
        const errorData = await response.json();
        showMessage('error', `Failed to fetch verse records: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching verse records:', error);
      showMessage('error', 'Network error while fetching verse records');
    }
  };

  const fetchSpendRecords = async () => {
    try {
      const response = await fetch('/api/spend');
      if (response.ok) {
        const data = await response.json();
        setSpendRecords(data.items || []);
      } else {
        const errorData = await response.json();
        showMessage('error', `Failed to fetch spend records: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching spend records:', error);
      showMessage('error', 'Network error while fetching spend records');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchVerseRecords(), fetchSpendRecords()])
      .finally(() => setLoading(false));
  }, []);

  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    if (activeTab === 'spend') {
      setEditFormData({
        note: record.note || '',
        points_spent: record.points_spent || 0
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      const apiPath = activeTab === 'verse' ? 'records' : 'spend';
      const response = await fetch(`/api/${apiPath}/${editingRecord.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        showMessage('success', `${activeTab === 'verse' ? 'Verse' : 'Spend'} record updated successfully`);
        setEditingRecord(null);
        if (activeTab === 'verse') {
          fetchVerseRecords();
        } else {
          fetchSpendRecords();
        }
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      showMessage('error', 'Failed to update record');
    }
  };

  const handleDeleteRecord = async (record: any) => {
    const recordType = activeTab === 'verse' ? 'verse' : 'spend';
    if (!confirm(`Are you sure you want to delete this ${recordType} record? This action cannot be undone.`)) {
      return;
    }

    try {
      const apiPath = activeTab === 'verse' ? 'records' : 'spend';
      const response = await fetch(`/api/${apiPath}/${record.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', `${activeTab === 'verse' ? 'Verse' : 'Spend'} record deleted successfully`);
        if (activeTab === 'verse') {
          fetchVerseRecords();
        } else {
          fetchSpendRecords();
        }
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      showMessage('error', 'Failed to delete record');
    }
  };

  const filteredVerseRecords = verseRecords.filter(record => {
    const matchesSearch = !search || 
      record.memory_items?.reference?.toLowerCase().includes(search.toLowerCase()) ||
      record.users?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesUser = !userFilter ||
      record.users?.name?.toLowerCase().includes(userFilter.toLowerCase());

    return matchesSearch && matchesUser;
  });

  const filteredSpendRecords = spendRecords.filter(record => {
    const matchesSearch = !search || 
      record.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
      record.note?.toLowerCase().includes(search.toLowerCase());
    
    const matchesUser = !userFilter ||
      record.users?.name?.toLowerCase().includes(userFilter.toLowerCase());

    return matchesSearch && matchesUser;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] shadow-md">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)] leading-tight">User Records</h1>
              <p className="mt-1 text-sm text-gray-600">Manage verse and spend records</p>
            </div>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              Promise.all([fetchVerseRecords(), fetchSpendRecords()])
                .finally(() => setLoading(false));
            }}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#B5CED8]/20 to-[#B5CED8]/10 border border-[#B5CED8]/30 p-4">
            <div className="text-2xl font-bold text-gray-800">{verseRecords.length}</div>
            <div className="text-sm text-gray-700">Total Verse Records</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#D1DA8A]/20 to-[#D1DA8A]/10 border border-[#D1DA8A]/30 p-4">
            <div className="text-2xl font-bold text-gray-800">{spendRecords.length}</div>
            <div className="text-sm text-gray-700">Total Spend Records</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#DFA574]/20 to-[#DFA574]/10 border border-[#DFA574]/30 p-4">
            <div className="text-2xl font-bold text-gray-800">
              {verseRecords.reduce((sum, record) => sum + (record.points_awarded || 0), 0)}
            </div>
            <div className="text-sm text-gray-700">Points Awarded</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#B5CED8]/20 to-[#9AB5C1]/10 border border-[#B5CED8]/30 p-4">
            <div className="text-2xl font-bold text-gray-800">
              {spendRecords.reduce((sum, record) => sum + (record.points_spent || 0), 0)}
            </div>
            <div className="text-sm text-gray-700">Points Spent</div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 rounded-2xl p-4 border ${
            message.type === 'success' 
              ? 'bg-[#D1DA8A]/20 text-gray-800 border-[#D1DA8A]/30' 
              : 'bg-[#C97435]/10 text-gray-800 border-[#C97435]/30'
          }`}>
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

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 rounded-2xl bg-gray-50 p-1.5">
          <button
            onClick={() => setActiveTab('verse')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'verse'
                ? 'bg-gradient-to-r from-[#D1DA8A] to-[#BCC775] text-gray-800 shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Verse Records ({verseRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('spend')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'spend'
                ? 'bg-gradient-to-r from-[#DFA574] to-[#C98F5F] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Spend Records ({spendRecords.length})
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
          />
          <input
            type="text"
            placeholder="Filter by user..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <>
            {/* Verse Records Table */}
            {activeTab === 'verse' && (
              <div className="overflow-x-auto rounded-2xl border-2 border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-[#D1DA8A]/10 to-[#D1DA8A]/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Memory Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Points Awarded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Recorded At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredVerseRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {record.users?.name || 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>
                            <div className="font-medium">{record.memory_items?.reference || 'Unknown Item'}</div>
                            {record.memory_items?.type && (
                              <div className="text-xs text-gray-400">{record.memory_items.type}</div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {record.points_awarded}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <div>
                            <div>{new Date(record.recorded_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(record.recorded_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                            record.record_type === 'first' 
                              ? 'bg-[#D1DA8A]/30 text-gray-800' 
                              : 'bg-[#B5CED8]/30 text-gray-800'
                          }`}>
                            {record.record_type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteRecord(record)}
                              className="font-medium text-[#C97435] hover:text-[#A85C28] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredVerseRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No verse records found</div>
                )}
              </div>
            )}

            {/* Spend Records Table */}
            {activeTab === 'spend' && (
              <div className="overflow-x-auto rounded-2xl border-2 border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-[#DFA574]/10 to-[#DFA574]/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Points Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Spent At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredSpendRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {record.users?.name || 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {record.note || 'General spending'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {record.points_spent}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <div>
                            <div>{new Date(record.spent_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(record.spent_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {record.undone ? (
                            <span className="rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                              Undone
                            </span>
                          ) : (
                            <span className="rounded-lg bg-[#D1DA8A]/30 px-2.5 py-1 text-xs font-medium text-gray-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="font-medium text-[#B5CED8] hover:text-[#9AB5C1] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record)}
                              className="font-medium text-[#C97435] hover:text-[#A85C28] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSpendRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No spend records found</div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal - Only for spend records */}
      {editingRecord && activeTab === 'spend' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit Spend Record
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({...editFormData, note: e.target.value})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points Spent
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.points_spent}
                  onChange={(e) => setEditFormData({...editFormData, points_spent: parseInt(e.target.value) || 0})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminRecordsPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminRecordsPageContent />
    </AuthGuard>
  );
}
