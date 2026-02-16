'use client';

import { useState, useEffect } from 'react';
import { UserSummary, MemoryItem } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import UserFormFields from '@/components/UserFormFields';
import SearchableDropdown from '@/components/SearchableDropdown';
import { validateBibleReference, validateBibleReferenceExists, getBookSuggestions } from '@/lib/bible-api';

function RecordPageContent() {
    // ...existing code...
    // ...existing code...
    // ...existing code...
    // selectedUser assignment moved below
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [recordType, setRecordType] = useState<'first' | 'repeat'>('first');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showRecordTypeOverride, setShowRecordTypeOverride] = useState(false);
  const [checkingRecordType, setCheckingRecordType] = useState(false);
  const [itemFilter, setItemFilter] = useState<'all' | 'verse' | 'custom'>('all');
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [fetchedVerseText, setFetchedVerseText] = useState<string>('');
  const [fetchingVerse, setFetchingVerse] = useState(false);
  const [recordInfo, setRecordInfo] = useState<{
    recordType: 'first' | 'repeat';
    count: number;
    hasRecorded: boolean;
    isFirst: boolean;
  } | null>(null);
  const [customReference, setCustomReference] = useState<string>('');
  const [useCustomReference, setUseCustomReference] = useState(false);
  const [referenceError, setReferenceError] = useState<string>('');
  const [bookSuggestions, setBookSuggestions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('NIV'); // NIV is now the stored/default version
  const [alternateVerseText, setAlternateVerseText] = useState<string>('');
  const [fetchingAlternateVerse, setFetchingAlternateVerse] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMemoryItems();
    loadRecentItems();
  }, []);

  const loadRecentItems = () => {
    try {
      const stored = localStorage.getItem('recentMemoryItems');
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent items:', error);
    }
  };

  const addToRecentItems = (itemId: string) => {
    try {
      const updated = [itemId, ...recentItems.filter(id => id !== itemId)].slice(0, 5);
      setRecentItems(updated);
      localStorage.setItem('recentMemoryItems', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent items:', error);
    }
  };

  // Check record type when both user and item are selected
  const checkRecordType = async (userId: string, itemId: string) => {
    if (!userId || !itemId) {
      setRecordInfo(null);
      return;
    }

    setCheckingRecordType(true);
    try {
      const response = await fetch(`/api/records/check?user_id=${userId}&memory_item_id=${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setRecordInfo({
          recordType: data.record_type,
          count: data.count,
          hasRecorded: data.has_recorded,
          isFirst: data.is_first
        });
        setRecordType(data.record_type);
      }
    } catch (error) {
      console.error('Error checking record type:', error);
    } finally {
      setCheckingRecordType(false);
    }
  };

  // Automatically check record type when selections change
  useEffect(() => {
    const itemId = useCustomReference ? customReference : selectedItemId;
    checkRecordType(selectedUserId, itemId);
    if (!useCustomReference) {
      fetchVerseIfNeeded(selectedItemId);
    }
    // Reset version when item changes
    setSelectedVersion('NIV');
    setAlternateVerseText('');
  }, [selectedUserId, selectedItemId, useCustomReference, customReference]);

  // Fetch verse text for Bible verses without stored text
  const fetchVerseIfNeeded = async (itemId: string) => {
    if (!itemId) {
      setFetchedVerseText('');
      return;
    }

    const item = memoryItems.find(i => i.id === itemId);
    if (!item) return;

    // Only fetch if it's a verse type and doesn't have text
    if (item.type === 'verse' && !item.text) {
      setFetchingVerse(true);
      try {
        const response = await fetch(`/api/bible/verse?reference=${encodeURIComponent(item.reference)}`);
        if (response.ok) {
          const data = await response.json();
          setFetchedVerseText(data.text || '');
        } else {
          setFetchedVerseText('');
        }
      } catch (error) {
        console.error('Error fetching verse:', error);
        setFetchedVerseText('');
      } finally {
        setFetchingVerse(false);
      }
    } else {
      setFetchedVerseText('');
    }
  };

  // Fetch alternate version of verse
  const fetchAlternateVersion = async (reference: string, version: string) => {
    if (!reference || version === 'NIV') {
      setAlternateVerseText('');
      return;
    }

    setFetchingAlternateVerse(true);
    try {
      const response = await fetch(`/api/bible/verse?reference=${encodeURIComponent(reference)}&version=${version}`);
      if (response.ok) {
        const data = await response.json();
        setAlternateVerseText(data.text || '');
      } else {
        setAlternateVerseText('');
      }
    } catch (error) {
      console.error('Error fetching alternate version:', error);
      setAlternateVerseText('');
    } finally {
      setFetchingAlternateVerse(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (res.ok) {
      // Map display_accommodation_note to displayAccommodationNote for all users
      const mapped = (data.items || []).map((u: any) => ({
        ...u,
        displayAccommodationNote: typeof u.displayAccommodationNote !== 'undefined'
          ? u.displayAccommodationNote
          : u.display_accommodation_note,
      }));
      setUsers(mapped);
    }
  };

  const fetchMemoryItems = async () => {
    const res = await fetch('/api/memory-items?active=true');
    const data = await res.json();
    if (res.ok) {
      setMemoryItems(data.items || []);
    }
  };

  // Derive selectedItem from memoryItems and selectedItemId
  const filteredUsers = users;
  const filteredItems = itemFilter === 'all' 
    ? memoryItems 
    : memoryItems.filter(item => item.type === itemFilter);

  const selectedItem = memoryItems.find((item) => item.id === selectedItemId);

  const recentMemoryItems = recentItems
    .map(id => memoryItems.find(item => item.id === id))
    .filter((item): item is MemoryItem => item !== undefined);

  // Handle version change - must come after selectedItem is defined
  useEffect(() => {
    if (selectedItem?.type === 'verse' && selectedItem.reference && selectedVersion !== 'ESV') {
      fetchAlternateVersion(selectedItem.reference, selectedVersion);
    } else {
      setAlternateVerseText('');
    }
  }, [selectedVersion, selectedItem]);

  const handleUserAdded = async () => {
    setShowAddUser(false);
    await fetchUsers(); // Refresh the user list
    // Note: We could auto-select the new user here if needed
  };

  const handleAddUser = async (userData: { name: string; is_leader: boolean; notes: string; emojiIcon?: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          is_leader: userData.is_leader,
          notes: userData.notes || undefined,
          emojiIcon: userData.emojiIcon || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await handleUserAdded();
        return true;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create user' });
        return false;
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while creating user' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let itemId = useCustomReference ? customReference : selectedItemId;
    
    // Validate custom reference before submitting
    if (useCustomReference) {
      setLoading(true);
      setReferenceError('');
      
      // Verify verse actually exists in the Bible
      const validation = await validateBibleReferenceExists(customReference);
      if (!validation.isValid) {
        setReferenceError(validation.error || 'Invalid reference');
        setLoading(false);
        return;
      }
      // Use normalized reference
      itemId = validation.normalized!;
    }
    
    if (!selectedUserId || !itemId) {
      setMessage({ type: 'error', text: 'Please select a user and memory item' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setReferenceError('');

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          memory_item_id: itemId,
          record_type: recordType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const wasNewVerse = useCustomReference;
        setMessage({
          type: 'success',
          text: wasNewVerse 
            ? `New verse added and recorded! +${data.points_awarded} points awarded.`
            : `Recorded! +${data.points_awarded} points awarded.`,
        });
        if (!useCustomReference) {
          addToRecentItems(selectedItemId);
        }
        setSelectedUserId('');
        setSelectedItemId('');
        setCustomReference('');
        setUseCustomReference(false);
        setRecordType('first');
        fetchUsers(); // Refresh points
        fetchMemoryItems(); // Refresh items list in case new verse was added
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to record' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  // Convert users to dropdown options
  const userOptions = users.map(user => ({
    id: user.id,
    label: user.name,
    secondary: user.is_leader ? 'Leader' : '',
    icon: user.emojiIcon
  }));

  // Convert memory items to dropdown options with grouping
  const memoryItemOptions = filteredItems.map(item => {
    const isRecent = recentItems.includes(item.id);
    return {
      id: item.id,
      label: item.reference,
      secondary: `${item.points_first}pts first / ${item.points_repeat}pts repeat`,
      group: isRecent ? 'Recently Used' : item.type === 'verse' ? 'Bible Verses' : 'Books & More',
      badge: item.type === 'verse' ? 'Verse' : 'Books & More'
    };
  }).sort((a, b) => {
    // Sort: Recent items first, then by group
    const aRecent = recentItems.includes(a.id);
    const bRecent = recentItems.includes(b.id);
    if (aRecent && !bRecent) return -1;
    if (!aRecent && bRecent) return 1;
    if (aRecent && bRecent) {
      return recentItems.indexOf(a.id) - recentItems.indexOf(b.id);
    }
    return a.group.localeCompare(b.group);
  });

  // Find selected user object after users state initialization
  const selectedUser = users.find(u => u.id === selectedUserId);
  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        {/* Header with Lime accent */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D1DA8A] to-[#B8C76E] shadow-md">
              <svg className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)] leading-tight">Record Memory</h1>
          </div>
          <p className="text-gray-600">Track Bible memory achievements and award points</p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl p-4 ${
              message.type === 'success'
                ? 'bg-[#D1DA8A]/20 text-gray-800 border border-[#D1DA8A]/30'
                : 'bg-[#C97435]/10 text-gray-800 border border-[#C97435]/30'
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

        {/* Accommodation Note Display (moved below header) */}
        {selectedUser && selectedUser.notes && selectedUser.notes.trim() &&
          selectedUser.displayAccommodationNote && (
          <div className="mb-6 rounded-2xl border-2 border-[#B5CED8]/40 bg-[#F0F7FA] p-4 flex items-start">
            <svg className="mr-3 h-5 w-5 text-[#B5CED8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#B5CED8] mb-1 flex items-center gap-1">
                Accommodation Note
                <span className="relative group">
                  <svg className="h-4 w-4 text-[#B5CED8] ml-1 cursor-pointer" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2} tabIndex={0} aria-label="Info">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="white" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 7v2m0 4h.01" />
                  </svg>
                  <span className="absolute left-1/2 z-10 -translate-x-1/2 mt-2 w-64 rounded bg-gray-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                    This note is shown to leaders when recording memory verses for this user.
                  </span>
                </span>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-line">{selectedUser.notes}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="block text-sm font-semibold text-gray-700">
                Select User
              </label>
              <button
                type="button"
                onClick={() => setShowAddUser(!showAddUser)}
                className="text-sm font-medium text-[#B8C76E] hover:text-[#A0B055] transition-colors sm:text-right"
              >
                {showAddUser ? '✕ Cancel' : '+ Add New User'}
              </button>
            </div>

            {showAddUser && (
              <div className="mb-4 rounded-2xl border-2 border-[#D1DA8A]/30 bg-[#D1DA8A]/10 p-4">
                <UserFormFields
                  compact
                  onSubmit={handleAddUser}
                  onCancel={() => setShowAddUser(false)}
                  existingUsers={users}
                  loading={loading}
                />
              </div>
            )}

            <SearchableDropdown
              options={userOptions}
              value={selectedUserId}
              onSelect={setSelectedUserId}
              placeholder="Choose a user..."
              searchPlaceholder="Search users..."
              emptyMessage="No users found. Add a new user above."
            />
          </div>

          {/* Memory Item Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Memory Item
            </label>
            
            {/* Quick Filter Buttons */}
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setItemFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                  itemFilter === 'all'
                    ? 'bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] text-gray-800 shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Items ({memoryItems.length})
              </button>
              <button
                type="button"
                onClick={() => setItemFilter('verse')}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                  itemFilter === 'verse'
                    ? 'bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] text-gray-800 shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                📖 Verses Only ({memoryItems.filter(i => i.type === 'verse').length})
              </button>
              <button
                type="button"
                onClick={() => setItemFilter('custom')}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                  itemFilter === 'custom'
                    ? 'bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] text-gray-800 shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                📚 Books & More ({memoryItems.filter(i => i.type === 'custom').length})
              </button>
              {recentMemoryItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (recentMemoryItems.length > 0) {
                      setSelectedItemId(recentMemoryItems[0].id);
                    }
                  }}
                  className="rounded-xl px-3 py-1.5 text-sm font-medium bg-[#DFA574]/10 text-[#C88A5E] hover:bg-[#DFA574]/20 transition-all border-2 border-[#DFA574]/30"
                >
                  🕐 Recent ({recentMemoryItems.length})
                </button>
              )}
            </div>

            <SearchableDropdown
              options={memoryItemOptions}
              value={selectedItemId}
              onSelect={setSelectedItemId}
              placeholder="Choose a memory item..."
              searchPlaceholder="Search verses and memory work..."
              emptyMessage="No memory items found."
              showGroups={true}
              showCount={false}
              disabled={useCustomReference}
            />

            {/* Custom Verse Reference Input */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setUseCustomReference(!useCustomReference);
                  if (!useCustomReference) {
                    setSelectedItemId('');
                    setReferenceError('');
                  } else {
                    setCustomReference('');
                    setBookSuggestions([]);
                  }
                }}
                className="text-sm font-medium text-[#B8C76E] hover:text-[#A0B055] transition-colors"
              >
                {useCustomReference ? '✕ Use Existing Items' : '+ Enter New Verse Reference'}
              </button>
            </div>

            {useCustomReference && (
              <div className="mt-3 relative">
                <input
                  type="text"
                  value={customReference}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomReference(value);
                    setReferenceError('');
                    
                    // Get autocomplete suggestions for book names
                    const bookMatch = value.match(/^([1-3]?\s?[A-Za-z\s]*)/);
                    if (bookMatch && bookMatch[1].trim()) {
                      const suggestions = getBookSuggestions(bookMatch[1].trim());
                      setBookSuggestions(suggestions);
                    } else {
                      setBookSuggestions([]);
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    if (customReference) {
                      const validation = validateBibleReference(customReference);
                      if (!validation.isValid) {
                        setReferenceError(validation.error || 'Invalid reference');
                      }
                    }
                    // Delay hiding suggestions to allow clicking them
                    setTimeout(() => setBookSuggestions([]), 200);
                  }}
                  placeholder="e.g., John 3:16 or Psalm 23:1-6"
                  className={`w-full rounded-xl border-2 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:outline-none focus:ring-2 ${
                    referenceError 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-[#D1DA8A] focus:ring-[#D1DA8A]/20'
                  }`}
                />
                
                {/* Autocomplete suggestions */}
                {bookSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                    {bookSuggestions.map((book) => (
                      <button
                        key={book}
                        type="button"
                        onClick={() => {
                          // Replace just the book name in the reference
                          const current = customReference.trim();
                          const match = current.match(/^([1-3]?\s?[A-Za-z\s]*)(.*)/);
                          if (match) {
                            setCustomReference(book + (match[2] ? ' ' + match[2].trim() : ' '));
                          } else {
                            setCustomReference(book + ' ');
                          }
                          setBookSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#D1DA8A]/10 transition-colors text-sm text-gray-900"
                      >
                        {book}
                      </button>
                    ))}
                  </div>
                )}
                
                {referenceError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {referenceError}
                  </p>
                )}
                
                {!referenceError && customReference && (
                  <p className="mt-2 text-xs text-gray-600">
                    🪄 Verse will be verified and automatically fetched from the Bible API (NIV)
                  </p>
                )}
              </div>
            )}

            {selectedItem && (selectedItem.text || fetchedVerseText) && (
              <div className="mt-3 rounded-2xl bg-gradient-to-r from-[#D1DA8A]/10 to-[#B5CED8]/10 border border-gray-200 p-4 text-sm">
                {/* Version Selector for Verses */}
                {selectedItem.type === 'verse' && selectedItem.reference && (
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">View in:</label>
                    <select
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#D1DA8A] focus:outline-none focus:ring-2 focus:ring-[#D1DA8A]/20"
                    >
                      <option value="NIV">NIV (Stored)</option>
                      <option value="ESV">ESV</option>
                      <option value="KJV">KJV</option>
                      <option value="NKJV">NKJV</option>
                      <option value="NLT">NLT</option>
                      <option value="NASB">NASB</option>
                    </select>
                  </div>
                )}
                
                <div className="flex items-start">
                  <svg className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-[#B8C76E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div className="text-gray-700 flex-1">
                    <strong className="text-gray-900">Text ({selectedVersion}):</strong> 
                    {fetchingAlternateVerse ? (
                      <span className="ml-2 inline-flex items-center text-gray-500">
                        <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading {selectedVersion}...
                      </span>
                    ) : (
                      <span className="ml-1">
                        {selectedVersion === 'NIV' 
                          ? (selectedItem.text || fetchedVerseText)
                          : (alternateVerseText || selectedItem.text || fetchedVerseText)}
                      </span>
                    )}
                    {selectedItem.type === 'verse' && selectedItem.reference && (
                      <span className="text-gray-600"> — {selectedItem.reference}</span>
                    )}
                    {fetchedVerseText && !selectedItem.text && selectedVersion === 'NIV' && (
                      <div className="mt-1 text-xs text-gray-500 italic">
                        Auto-fetched from Bible API
                      </div>
                    )}
                    {selectedVersion !== 'NIV' && alternateVerseText && (
                      <div className="mt-1 text-xs text-gray-500 italic">
                        Viewing {selectedVersion} translation (NIV is stored)
                      </div>
                    )}
                    {fetchingVerse && (
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading verse text...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Automatic Record Type Detection */}
          {(checkingRecordType || recordInfo) && selectedUserId && selectedItemId && (
            <div className="rounded-2xl border-2 border-[#D1DA8A]/40 bg-[#D1DA8A]/15 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {checkingRecordType ? (
                    <>
                      <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-[#B8C76E] border-t-transparent"></div>
                      <span className="text-sm text-gray-700">Checking previous records...</span>
                    </>
                  ) : recordInfo ? (
                    <div className="flex items-center">
                      <div className={`mr-2 h-2 w-2 rounded-full ${recordInfo.isFirst ? 'bg-[#D1DA8A]' : 'bg-[#DFA574]'}`}></div>
                      <span className="font-medium text-gray-900">
                        {recordInfo.isFirst ? 'First Time' : `Repeat (${recordInfo.count} previous)`}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">
                        • {selectedItem?.points_first && recordInfo.isFirst ? selectedItem.points_first : selectedItem?.points_repeat || 0} points
                      </span>
                    </div>
                  ) : null}
                </div>
                
                {recordInfo && (
                  <button
                    type="button"
                    onClick={() => setShowRecordTypeOverride(!showRecordTypeOverride)}
                    className="text-xs text-gray-600 hover:text-gray-800 underline"
                  >
                    {showRecordTypeOverride ? 'Hide override' : 'Need to override?'}
                  </button>
                )}
              </div>
              
              {recordInfo && !checkingRecordType && (
                <p className="mt-2 text-sm text-gray-700">
                  {recordInfo.isFirst 
                    ? 'This user has not recorded this memory item before.' 
                    : `This user has recorded this memory item ${recordInfo.count} time${recordInfo.count === 1 ? '' : 's'} previously.`}
                </p>
              )}
            </div>
          )}

          {/* Manual Record Type Override (Collapsible) */}
          {showRecordTypeOverride && recordInfo && selectedUserId && selectedItemId && (
            <div className="rounded-2xl border-2 border-[#DFA574]/30 bg-[#DFA574]/10 p-4">
              <div className="mb-3">
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-[#DFA574]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Manual Override</span>
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  Only use this to correct mistakes. The auto-detection above is usually correct.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="first"
                    checked={recordType === 'first'}
                    onChange={(e) => setRecordType(e.target.value as 'first')}
                    className="mr-2 text-[#DFA574] focus:ring-[#DFA574]"
                  />
                  <span className="text-sm text-gray-800">
                    First Time ({selectedItem?.points_first || 0} points)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="repeat"
                    checked={recordType === 'repeat'}
                    onChange={(e) => setRecordType(e.target.value as 'repeat')}
                    className="mr-2 text-[#DFA574] focus:ring-[#DFA574]"
                  />
                  <span className="text-sm text-gray-800">
                    Repeat ({selectedItem?.points_repeat || 0} points)
                  </span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedUserId || (!selectedItemId && !customReference)}
            className="w-full rounded-xl bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] px-4 py-3 font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5 animate-spin text-gray-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recording...
              </span>
            ) : (
              'Record Memory'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RecordPage() {
  return (
    <AuthGuard>
      <RecordPageContent />
    </AuthGuard>
  );
}

