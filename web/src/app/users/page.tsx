'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserSummary } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import UserForm from '@/components/UserForm';
import { EMOJI_ICON_OPTIONS } from '@/components/emojiIconOptions';

const USERS_PAGE_SIZE = 20;

interface EditingUser {
  id: string;
  name: string;
  is_leader: boolean;
  role?: 'leader' | 'admin';
  notes?: string;
  emojiIcon?: string;
  displayAccommodationNote?: boolean;
}

function UsersPageContent() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLoginAccess, setShowLoginAccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.user?.role === 'admin') {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (nextSearch !== search) {
        setCurrentPage(1);
        setSearch(nextSearch);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    void fetchUsers(currentPage, search);
  }, [currentPage, search]);

  useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (showAddForm && allUsers.length === 0) {
      void fetchAllUsers();
    }
  }, [showAddForm, allUsers.length]);

  const fetchUsers = async (page = currentPage, query = search) => {
    const isInitialLoad = users.length === 0;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsPageLoading(true);
    }

    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(USERS_PAGE_SIZE),
    });

    if (query) {
      params.set('q', query);
    }

    try {
      const res = await fetch(`/api/users?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.items || []);
        setTotalUsers(data.total || 0);
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        setMessage({ type: 'error', text: 'Failed to load users' });
        setTimeout(() => setMessage(null), 3000);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setIsPageLoading(false);
      }
    }
  };

  const fetchAllUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (res.ok) {
      setAllUsers(data.items || []);
    }
  };

  const handleUserAdded = () => {
    setShowAddForm(false);
    setCurrentPage(1);
    void fetchUsers(1, search); // Refresh the users list
    if (allUsers.length > 0) {
      void fetchAllUsers();
    }
    setMessage({ type: 'success', text: 'User added successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEditUser = async (user: UserSummary) => {
    setActionLoading(user.id);
    setShowEmojiPicker(false); // Reset emoji picker state
    setShowLoginAccess(false);
    setNewPassword('');
    setPasswordMessage(null);
    setShowClearConfirm(false);
    try {
      // Fetch full user data including notes
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) {
        const fullUser = await res.json();
        setEditingUser({
          id: fullUser.id,
          name: fullUser.name,
          is_leader: fullUser.is_leader,
          role: fullUser.role,
          notes: fullUser.notes || '',
          emojiIcon: fullUser.emojiIcon || '',
          displayAccommodationNote: !!fullUser.display_accommodation_note,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load user data' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetPassword = async () => {
    if (!editingUser) return;
    if (!editingUser.is_leader && editingUser.role !== 'admin') {
      setPasswordMessage({ type: 'error', text: 'Only leaders or admins can have login access' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: data.message || 'Password updated' });
        setNewPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Network error while updating password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearPassword = async () => {
    if (!editingUser) return;
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: data.message || 'Login access removed' });
        setShowClearConfirm(false);
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to remove login access' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Network error while removing login access' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setActionLoading(editingUser.id);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingUser.name.trim(),
          is_leader: editingUser.is_leader,
          notes: editingUser.notes?.trim() || null,
          emojiIcon: editingUser.emojiIcon || null,
          displayAccommodationNote: !!editingUser.displayAccommodationNote,
        }),
      });

      if (res.ok) {
        setEditingUser(null);
        setShowEmojiPicker(false);
        void fetchUsers(currentPage, search);
        if (allUsers.length > 0) {
          void fetchAllUsers();
        }
        setMessage({ type: 'success', text: 'User updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update user' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteConfirm(null);
        const nextPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        if (nextPage !== currentPage) {
          setCurrentPage(nextPage);
        } else {
          void fetchUsers(nextPage, search);
        }
        if (allUsers.length > 0) {
          void fetchAllUsers();
        }
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PAGE_SIZE));
  const pageStart = totalUsers === 0 ? 0 : (currentPage - 1) * USERS_PAGE_SIZE + 1;
  const pageEnd = totalUsers === 0 ? 0 : pageStart + users.length - 1;
  const maxPageButtons = 7;
  const pageWindowStart = Math.max(1, Math.min(currentPage - Math.floor(maxPageButtons / 2), totalPages - maxPageButtons + 1));
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + maxPageButtons - 1);
  const pageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, i) => pageWindowStart + i
  );

  return (
    <div className="mx-auto h-[calc(100dvh-4rem)] max-w-7xl overflow-y-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Success/Error Messages */}
        {message && (
          <div
            className={`rounded-2xl p-4 ${
              message.type === 'success'
                ? 'bg-[#B5CED8]/20 text-gray-800 border border-[#B5CED8]/30'
                : 'bg-[#C97435]/10 text-gray-800 border border-[#C97435]/30'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="mr-2 h-5 w-5 text-[#B5CED8]" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Add User Form */}
        {showAddForm && (
          <UserForm
            onUserAdded={handleUserAdded}
            onCancel={() => setShowAddForm(false)}
            existingUsers={allUsers.length > 0 ? allUsers : users}
          />
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#B5CED8]/20 via-[#D1DA8A]/10 to-[#DFA574]/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
              <div className="mb-6 flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">User Icon</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] shadow-sm">
                      {editingUser.emojiIcon ? (
                        <span className="text-2xl">{editingUser.emojiIcon}</span>
                      ) : (
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-[#B5CED8]"
                    >
                      {showEmojiPicker ? '✕ Close' : editingUser.emojiIcon ? 'Change Icon' : 'Pick an Icon'}
                    </button>
                    {editingUser.emojiIcon && (
                      <button
                        type="button"
                        onClick={() => setEditingUser({ ...editingUser, emojiIcon: '' })}
                        className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        title="Remove icon"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  {showEmojiPicker && (
                    <div className="mt-3 rounded-xl border-2 border-[#B5CED8]/30 bg-[#F0F7FA] p-3">
                      <div className="max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                          {EMOJI_ICON_OPTIONS.map((emoji) => (
                            <button
                              type="button"
                              key={emoji}
                              className={`text-2xl flex items-center justify-center rounded-full border-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/30 ${editingUser.emojiIcon === emoji ? 'border-[#B5CED8] bg-white shadow-sm' : 'border-transparent hover:border-[#B5CED8] hover:bg-white/70 focus:border-[#B5CED8]'} min-w-[44px] min-h-[44px]`}
                              style={{ boxSizing: 'border-box' }}
                              onClick={() => {
                                setEditingUser({ ...editingUser, emojiIcon: emoji });
                                setShowEmojiPicker(false);
                              }}
                              aria-label={`Select ${emoji} as user icon`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">Tap an emoji to select it</p>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="edit-name" className="mb-2 block text-sm font-semibold text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
                    required
                  />
                </div>
                
                
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-is-leader"
                      checked={editingUser.is_leader}
                      onChange={(e) => setEditingUser({ ...editingUser, is_leader: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-[#B5CED8] focus:ring-[#B5CED8]"
                    />
                    <label htmlFor="edit-is-leader" className="ml-3 block text-sm font-medium text-gray-700">
                      This person is a leader
                    </label>
                  </div>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="edit-display-accommodation-note"
                      checked={!!editingUser.displayAccommodationNote}
                      onChange={(e) => setEditingUser({ ...editingUser, displayAccommodationNote: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-[#B5CED8] focus:ring-[#B5CED8]"
                    />
                    <label htmlFor="edit-display-accommodation-note" className="ml-3 block text-sm font-medium text-gray-700">
                      Display notes when recording
                      <span
                        className="ml-2 text-xs text-gray-500 cursor-help"
                        title="Check this box if the notes contain information a leader should see when recording a memory verse, such as accommodations or support needs."
                      >&#9432;</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-notes" className="mb-2 block text-sm font-semibold text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="edit-notes"
                    value={editingUser.notes}
                    onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                    rows={3}
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
                    placeholder="Any additional notes about this person"
                  />
                </div>

                {isAdmin && (
                  <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                    <button
                      type="button"
                      onClick={() => setShowLoginAccess(!showLoginAccess)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-gray-700">Login Access (Admin Only)</span>
                      <span className="text-sm text-gray-500">{showLoginAccess ? 'Hide' : 'Show'}</span>
                    </button>

                    {showLoginAccess && (
                      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                        {!editingUser.is_leader && editingUser.role !== 'admin' && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            This user is not marked as a leader/admin, so login access cannot be set.
                          </div>
                        )}

                        {passwordMessage && (
                          <div
                            className={`rounded-xl p-3 text-sm font-medium ${
                              passwordMessage.type === 'success'
                                ? 'bg-[#B5CED8]/20 text-gray-800 border border-[#B5CED8]/30'
                                : 'bg-[#C97435]/10 text-gray-800 border border-[#C97435]/30'
                            }`}
                          >
                            {passwordMessage.text}
                          </div>
                        )}

                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Set New Password
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
                              disabled={passwordLoading}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  void handleSetPassword();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => void handleSetPassword()}
                              disabled={passwordLoading || !newPassword || (!editingUser.is_leader && editingUser.role !== 'admin')}
                              className="rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                              {passwordLoading ? 'Saving...' : 'Set'}
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          {!showClearConfirm ? (
                            <button
                              type="button"
                              onClick={() => setShowClearConfirm(true)}
                              disabled={passwordLoading || (!editingUser.is_leader && editingUser.role !== 'admin')}
                              className="text-sm font-medium text-[#C97435] hover:underline disabled:opacity-50"
                            >
                              Remove login access
                            </button>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-700">Remove login for {editingUser.name}?</span>
                              <button
                                type="button"
                                onClick={() => void handleClearPassword()}
                                disabled={passwordLoading}
                                className="rounded-xl bg-[#C97435] px-3 py-1.5 text-sm font-semibold text-white transition-all hover:bg-[#B86428] disabled:opacity-50"
                              >
                                {passwordLoading ? 'Removing...' : 'Yes, remove'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowClearConfirm(false)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
                  disabled={actionLoading === editingUser.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editingUser.name.trim() || actionLoading === editingUser.id}
                  className="rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {actionLoading === editingUser.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#B5CED8]/20 via-[#D1DA8A]/10 to-[#DFA574]/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center">
                <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#C97435]/20">
                  <svg className="h-7 w-7 text-[#C97435]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Delete User</h3>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Are you sure you want to delete this user? This action cannot be undone and will remove all their records and data.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
                  disabled={actionLoading === deleteConfirm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(deleteConfirm)}
                  disabled={actionLoading === deleteConfirm}
                  className="rounded-xl bg-gradient-to-r from-[#C97435] to-[#A85C28] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {actionLoading === deleteConfirm ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] shadow-md">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)] leading-tight">Users</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full sm:w-64 rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
              />
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full sm:w-auto whitespace-nowrap rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {showAddForm ? '✕ Cancel' : '+ Add User'}
              </button>
            </div>
          </div>

          {loading && users.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <svg className="mx-auto h-8 w-8 animate-spin text-[#B5CED8]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-sm">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="mt-3 text-gray-600">
                {search ? 'No users match your search' : 'No users yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {pageStart}-{pageEnd} of {totalUsers} user{totalUsers === 1 ? '' : 's'}
                </p>
                <p>
                  Page {currentPage} of {totalPages}
                </p>
              </div>
              {isPageLoading && (
                <div className="rounded-xl border border-[#B5CED8]/40 bg-[#F0F7FA] px-3 py-2 text-xs font-medium text-gray-700">
                  Loading page {currentPage}...
                </div>
              )}
              <div className="grid gap-2 sm:gap-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="group rounded-2xl border-2 border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm transition-all hover:shadow-md hover:border-[#B5CED8]/40"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      {/* User Info */}
                      <div className="flex min-w-0 items-center space-x-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] shadow-sm">
                          {user.emojiIcon ? (
                            <span className="text-base">{user.emojiIcon}</span>
                          ) : (
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-[15px]">
                              {user.name}
                            </h3>
                            {user.is_leader && (
                              <span className="inline-flex items-center whitespace-nowrap rounded-lg bg-[#B5CED8]/20 px-1.5 py-0 text-[11px] font-medium text-gray-800">
                                Leader
                              </span>
                            )}
                            {isAdmin && user.hasLoginAccess === true && (
                              <span
                                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-[#D1DA8A]/25 px-1.5 py-0 text-[11px] font-medium text-gray-800"
                                title="Login is enabled"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Login
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/users/${user.id}`}
                          className="flex h-9 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-3 text-xs font-semibold text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:h-9 sm:flex-none sm:text-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={actionLoading === user.id}
                          className="h-9 flex-1 rounded-xl border-2 border-gray-200 bg-white px-3 text-center text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:flex-none sm:text-sm"
                        >
                          {actionLoading === user.id ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                          ) : (
                            'Edit'
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="h-9 rounded-xl border-2 border-[#C97435]/30 bg-white px-2.5 text-sm font-medium text-[#C97435] transition-all hover:border-[#C97435]/50 hover:bg-[#C97435]/5"
                          aria-label="Delete user"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-800">{currentPage}</span> of <span className="font-semibold text-gray-800">{totalPages}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || isPageLoading}
                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || isPageLoading}
                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isPageLoading}
                      className={`min-w-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        pageNum === currentPage
                          ? 'bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] text-gray-800 shadow-sm'
                          : 'border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage >= totalPages || isPageLoading}
                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages || isPageLoading}
                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersPageContent />
    </AuthGuard>
  );
}

