'use client';

import { useState, useEffect } from 'react';
import { MemoryItem } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import MemoryItemForm from '@/components/MemoryItemForm';

function MemoryItemsPageContent() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  const [filterBook, setFilterBook] = useState<string>('');
  const [filterPointsMin, setFilterPointsMin] = useState<string>('');
  const [filterPointsMax, setFilterPointsMax] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    let url = '/api/memory-items';
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (filterType) params.append('type', filterType);
    if (filterActive) params.append('active', filterActive);
    if (params.toString()) url += '?' + params.toString();

    const res = await fetch(url);
    const data = await res.json();
    if (res.ok) {
      setItems(data.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [search, filterType, filterActive, filterBook, filterPointsMin, filterPointsMax]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleToggleActive = async (item: MemoryItem) => {
    try {
      const res = await fetch(`/api/memory-items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !item.active }),
      });

      if (res.ok) {
        fetchItems();
        showMessage('success', `Memory item ${!item.active ? 'activated' : 'deactivated'} successfully`);
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Failed to update memory item');
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
      showMessage('error', 'Failed to update memory item');
    }
  };

  const handleSubmitForm = async (formData: Partial<MemoryItem>) => {
    setFormLoading(true);
    try {
      const url = editingItem ? `/api/memory-items/${editingItem.id}` : '/api/memory-items';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        fetchItems();
        setShowAddForm(false);
        setEditingItem(null);
        showMessage('success', `Memory item ${editingItem ? 'updated' : 'created'} successfully`);
      } else {
        showMessage('error', data.error || `Failed to ${editingItem ? 'update' : 'create'} memory item`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      showMessage('error', `Failed to ${editingItem ? 'update' : 'create'} memory item`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteItem = async (item: MemoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.reference}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/memory-items/${item.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        fetchItems();
        showMessage('success', 'Memory item deleted successfully');
      } else {
        showMessage('error', data.error || 'Failed to delete memory item');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      showMessage('error', 'Failed to delete memory item');
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
  };

  // Extract unique Bible books from items
  const bibleBooks = Array.from(new Set(
    items
      .filter(item => item.type === 'verse' && item.reference)
      .map(item => {
        // Extract book name from reference (e.g., "John 3:16" -> "John")
        const match = item.reference.match(/^([1-3]?\s?[A-Za-z]+)/);
        return match ? match[1].trim() : null;
      })
      .filter((book): book is string => book !== null)
  )).sort();

  // Apply client-side filters
  const filteredItems = items.filter(item => {
    // Book filter
    if (filterBook) {
      const itemBook = item.reference.match(/^([1-3]?\s?[A-Za-z]+)/)?.[1]?.trim();
      if (itemBook !== filterBook) return false;
    }
    
    // Points filter
    if (filterPointsMin) {
      const minPoints = parseInt(filterPointsMin);
      if (item.points_first < minPoints && item.points_repeat < minPoints) return false;
    }
    if (filterPointsMax) {
      const maxPoints = parseInt(filterPointsMax);
      if (item.points_first > maxPoints && item.points_repeat > maxPoints) return false;
    }
    
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D1DA8A] to-[#B8C76E] shadow-md">
              <svg className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Memory Items</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-xl bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] px-5 py-2.5 font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            + Add Item
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 rounded-2xl p-4 border ${
            message.type === 'success' ? 'bg-[#D1DA8A]/20 text-gray-800 border-[#D1DA8A]/30' : 'bg-[#C97435]/10 text-gray-800 border-[#C97435]/30'
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

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search reference or text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2.5 shadow-sm transition-colors focus:border-[#D1DA8A] focus:outline-none focus:ring-2 focus:ring-[#D1DA8A]/20"
              />
              <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#D1DA8A] focus:outline-none focus:ring-2 focus:ring-[#D1DA8A]/20"
            >
              <option value="">All Types</option>
              <option value="verse">📖 Verse</option>
              <option value="custom">📚 Books & More</option>
            </select>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#D1DA8A] focus:outline-none focus:ring-2 focus:ring-[#D1DA8A]/20"
            >
              <option value="">All Status</option>
              <option value="true">✓ Active</option>
              <option value="false">✗ Inactive</option>
            </select>
          </div>
          
          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterBook}
              onChange={(e) => setFilterBook(e.target.value)}
              className="rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#D1DA8A] focus:outline-none focus:ring-2 focus:ring-[#D1DA8A]/20"
              disabled={filterType === 'custom'}
            >
              <option value="">All Bible Books</option>
              {bibleBooks.map(book => (
                <option key={book} value={book}>{book}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Min points"
              value={filterPointsMin}
              onChange={(e) => setFilterPointsMin(e.target.value)}
              min="0"
              className="w-32 rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#D1DA8A] focus:outline-none focus:ring-2 focus:ring-[#D1DA8A]/20"
            />
            <input
              type="number"
              placeholder="Max points"
              value={filterPointsMax}
              onChange={(e) => setFilterPointsMax(e.target.value)}
              min="0"
              className="w-32 rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#D1DA8A] focus:outline-none focus:ring-2 focus:ring-[#D1DA8A]/20"
            />
            {(filterBook || filterPointsMin || filterPointsMax) && (
              <button
                type="button"
                onClick={() => {
                  setFilterBook('');
                  setFilterPointsMin('');
                  setFilterPointsMax('');
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                Clear Advanced
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} items
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-gray-600">No items found</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-[#D1DA8A]/10 to-[#D1DA8A]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Text Preview
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Active
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-[#D1DA8A]/5">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {item.reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {item.text ? (
                        <div 
                          className="truncate" 
                          title={item.text}
                        >
                          {item.text.length > 80 ? item.text.substring(0, 80) + '...' : item.text}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No text</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-medium ${
                        item.type === 'verse' ? 'bg-[#B5CED8]/20 text-gray-800' : 'bg-[#DFA574]/20 text-gray-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>First: {item.points_first}</span>
                        <span>Repeat: {item.points_repeat}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {item.active ? (
                        <span className="inline-flex items-center rounded-xl bg-[#D1DA8A]/30 px-3 py-1 text-xs font-medium text-gray-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-xl bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="font-medium text-[#D1DA8A] hover:text-[#B8C76E] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="font-medium text-[#B5CED8] hover:text-[#9AB5C1] transition-colors"
                        >
                          {item.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
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
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <MemoryItemForm
          item={editingItem}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}

export default function MemoryItemsPage() {
  return (
    <AuthGuard requireAdmin>
      <MemoryItemsPageContent />
    </AuthGuard>
  );
}

