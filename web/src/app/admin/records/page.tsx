'use client';

import { useEffect, useState } from 'react';
import { VerseRecord, SpendRecord, User, MemoryItem } from '@/lib/types';

interface Message {
  type: 'success' | 'error';
  text: string;
}

export default function AdminRecordsPage() {
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="mb-6">
                  <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Records</h1>
          <button
            onClick={() => {
              setLoading(true);
              Promise.all([fetchVerseRecords(), fetchSpendRecords()])
                .finally(() => setLoading(false));
            }}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
          <p className="mt-2 text-gray-600">Manage verse and spend records</p>
        </div>

        {/* Summary Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-2xl font-bold text-blue-600">{verseRecords.length}</div>
            <div className="text-sm text-blue-800">Total Verse Records</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-2xl font-bold text-green-600">{spendRecords.length}</div>
            <div className="text-sm text-green-800">Total Spend Records</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="text-2xl font-bold text-purple-600">
              {verseRecords.reduce((sum, record) => sum + (record.points_awarded || 0), 0)}
            </div>
            <div className="text-sm text-purple-800">Points Awarded</div>
          </div>
          <div className="rounded-lg bg-orange-50 p-4">
            <div className="text-2xl font-bold text-orange-600">
              {spendRecords.reduce((sum, record) => sum + (record.points_spent || 0), 0)}
            </div>
            <div className="text-sm text-orange-800">Points Spent</div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('verse')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === 'verse'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Verse Records ({verseRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('spend')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === 'spend'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Spend Records ({spendRecords.length})
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Filter by user..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <>
            {/* Verse Records Table */}
            {activeTab === 'verse' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                          <span className={`rounded-full px-2 py-1 text-xs ${
                            record.record_type === 'first' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {record.record_type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteRecord(record)}
                              className="text-red-600 hover:text-red-900"
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                              Undone
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record)}
                              className="text-red-600 hover:text-red-900"
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