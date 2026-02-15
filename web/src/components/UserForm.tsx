'use client';

import { useState } from 'react';
import { EMOJI_ICON_OPTIONS, getRandomEmoji } from './emojiIconOptions';

interface UserFormProps {
  onUserAdded: () => void;
  onCancel?: () => void;
  compact?: boolean;
  existingUsers?: Array<{ id: string; name: string }>;
}

interface CreateUserRequest {
  name: string;
  is_leader?: boolean;
  notes?: string;
  legacy_points?: number;
  displayAccommodationNote?: boolean;
}

export default function UserForm({ onUserAdded, onCancel, compact = false, existingUsers = [] }: UserFormProps) {
  const [name, setName] = useState('');
  const [isLeader, setIsLeader] = useState(false);
  const [notes, setNotes] = useState('');
  const [legacyPoints, setLegacyPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [emojiIcon, setEmojiIcon] = useState<string>('');
  const [useRandomIcon, setUseRandomIcon] = useState(false);
  const [displayAccommodationNote, setDisplayAccommodationNote] = useState(false);

  // Check for duplicates when name changes
  const checkForDuplicates = (inputName: string) => {
    const trimmedName = inputName.trim().toLowerCase();
    if (trimmedName && existingUsers.length > 0) {
      const isDuplicate = existingUsers.some(user => 
        user.name.toLowerCase() === trimmedName
      );
      setShowDuplicateWarning(isDuplicate);
    } else {
      setShowDuplicateWarning(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    checkForDuplicates(newName);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Check for duplicates before submission
    const trimmedName = name.trim().toLowerCase();
    const duplicateUser = existingUsers.find(user => 
      user.name.toLowerCase() === trimmedName
    );
    
    if (duplicateUser) {
      setError(`A user named "${duplicateUser.name}" already exists. Please use a different name.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const userData: CreateUserRequest & { emojiIcon?: string } = {
        name: name.trim(),
        is_leader: isLeader,
        displayAccommodationNote,
      };
      // Use random emoji if checkbox is checked, otherwise use selected emoji
      if (useRandomIcon) {
        userData.emojiIcon = getRandomEmoji();
      } else if (emojiIcon) {
        userData.emojiIcon = emojiIcon;
      }

      if (notes.trim()) {
        userData.notes = notes.trim();
      }

      // Include legacy points if provided
      const points = parseInt(legacyPoints);
      if (legacyPoints.trim() && !isNaN(points) && points !== 0) {
        userData.legacy_points = points;
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        // Reset form
        setName('');
        setIsLeader(false);
        setUseRandomIcon(false);
        setNotes('');
        setLegacyPoints('');
        setEmojiIcon('');
        onUserAdded();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      {error && (
        <div className="mb-4 rounded-2xl bg-[#C97435]/10 border border-[#C97435]/30 p-4 text-sm text-gray-800">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-[#C97435]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {showDuplicateWarning && !error && (
        <div className="mb-4 rounded-2xl bg-[#DFA574]/10 border border-[#DFA574]/30 p-4 text-sm text-gray-800">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-[#DFA574]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">A user with this name already exists. Please use a different name.</span>
          </div>
        </div>
      )}

      <div className={compact ? 'space-y-3' : 'space-y-5'}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">User Icon (Emoji)</label>
          
          <div className="mb-3 flex items-center rounded-xl bg-gray-50 p-3">
            <input
              type="checkbox"
              id="use-random-icon"
              checked={useRandomIcon}
              onChange={(e) => {
                setUseRandomIcon(e.target.checked);
                if (e.target.checked) {
                  setEmojiIcon(''); // Clear manual selection when using random
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-[#B5CED8] focus:ring-[#B5CED8]"
              disabled={loading}
            />
            <label htmlFor="use-random-icon" className="ml-3 block text-sm font-medium text-gray-700">
              Randomly assign an emoji
            </label>
          </div>

          {!useRandomIcon && (
            <>
              <div className="grid grid-cols-8 gap-2 mb-2">
                {EMOJI_ICON_OPTIONS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    className={`text-2xl p-1 rounded-xl border-2 transition-colors ${emojiIcon === emoji ? 'border-[#B5CED8] bg-[#F0F7FA]' : 'border-transparent hover:border-gray-300'}`}
                    onClick={() => setEmojiIcon(emoji)}
                    aria-label={`Select ${emoji} as user icon`}
                    disabled={loading}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">Pick an emoji to use as your user icon.</p>
            </>
          )}
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            className={`block w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-colors focus:outline-none focus:ring-2 ${
              showDuplicateWarning 
                ? 'border-[#DFA574]/50 focus:border-[#DFA574] focus:ring-[#DFA574]/20' 
                : 'border-gray-200 focus:border-[#B5CED8] focus:ring-[#B5CED8]/20'
            }`}
            placeholder="Enter user's name"
            disabled={loading}
            required
          />
        </div>

        <div className="rounded-xl bg-gray-50 p-4 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_leader"
              checked={isLeader}
              onChange={(e) => setIsLeader(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-[#B5CED8] focus:ring-[#B5CED8]"
              disabled={loading}
            />
            <label htmlFor="is_leader" className="ml-3 block text-sm font-medium text-gray-700">
              This person is a leader
            </label>
          </div>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="display-accommodation-note"
              checked={displayAccommodationNote}
              onChange={(e) => setDisplayAccommodationNote(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-[#B5CED8] focus:ring-[#B5CED8]"
              disabled={loading}
            />
            <label htmlFor="display-accommodation-note" className="ml-3 block text-sm font-medium text-gray-700">
              Display notes when recording
              <span
                className="ml-2 text-xs text-gray-500 cursor-help"
                title="Check this box if the notes contain information a leader should see when recording a memory verse, such as accommodations or support needs."
              >
                &#9432;
              </span>
            </label>
          </div>
        </div>

        {!compact && (
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
              placeholder="Any additional notes about this person"
              disabled={loading}
            />
          </div>
        )}

        {!compact && (
          <div>
            <label htmlFor="legacy-points" className="block text-sm font-semibold text-gray-700 mb-2">
              Legacy Points (Optional)
            </label>
            <input
              type="number"
              id="legacy-points"
              value={legacyPoints}
              onChange={(e) => setLegacyPoints(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
              placeholder="Points from previous system"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-600">
              If this user had points in a previous system, enter them here to carry over their balance.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? 'Adding...' : compact ? 'Add' : 'Add User'}
          </button>
        </div>
      </div>
    </>
  );

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        {formContent}
      </form>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-lg">
      <div className="mb-6 flex items-center">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1]">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
      </div>
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    </div>
  );
}