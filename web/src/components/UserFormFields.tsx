'use client';

import { useState } from 'react';
import { getRandomEmoji } from './emojiIconOptions';

interface UserFormFieldsProps {
  onSubmit: (userData: { name: string; is_leader: boolean; notes: string; legacy_points?: number; emojiIcon?: string }) => Promise<boolean>;
  onCancel?: () => void;
  compact?: boolean;
  existingUsers?: Array<{ id: string; name: string }>;
  loading?: boolean;
}

interface CreateUserRequest {
  name: string;
  is_leader?: boolean;
  notes?: string;
}

export default function UserFormFields({ onSubmit, onCancel, compact = false, existingUsers = [], loading = false }: UserFormFieldsProps) {
  const [name, setName] = useState('');
  const [isLeader, setIsLeader] = useState(false);
  const [notes, setNotes] = useState('');
  const [legacyPoints, setLegacyPoints] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }

    // Check for duplicates before submission
    const trimmedName = name.trim().toLowerCase();
    const duplicateUser = existingUsers.find(user => 
      user.name.toLowerCase() === trimmedName
    );
    
    if (duplicateUser) {
      setError(`A user named "${duplicateUser.name}" already exists. Please use a different name.`);
      return false;
    }

    setError(null);

    const userData: { name: string; is_leader: boolean; notes: string; legacy_points?: number; emojiIcon?: string } = {
      name: name.trim(),
      is_leader: isLeader,
      notes: notes.trim(),
      emojiIcon: getRandomEmoji() // Randomly assign an emoji
    };

    // Include legacy points if provided
    const points = parseInt(legacyPoints);
    if (legacyPoints.trim() && !isNaN(points) && points !== 0) {
      userData.legacy_points = points;
    }

    const success = await onSubmit(userData);
    
    if (success) {
      // Reset form
      setName('');
      setIsLeader(false);
      setNotes('');
      setLegacyPoints('');
      setShowDuplicateWarning(false);
      setError(null);
    }
    
    return success;
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-[#C97435]/10 border border-[#C97435]/30 p-3 text-sm text-gray-800">
          <div className="flex items-center">
            <svg className="mr-2 h-4 w-4 text-[#C97435]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {showDuplicateWarning && !error && (
        <div className="rounded-xl bg-[#DFA574]/10 border border-[#DFA574]/30 p-3 text-sm text-gray-800">
          <div className="flex items-center">
            <svg className="mr-2 h-4 w-4 text-[#DFA574]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            A user with this name already exists. Please use a different name.
          </div>
        </div>
      )}

      <div>
        <label htmlFor="user-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Name *
        </label>
        <input
          type="text"
          id="user-name"
          value={name}
          onChange={handleNameChange}
          className={`block w-full rounded-xl border-2 px-4 py-2.5 shadow-sm transition-colors focus:outline-none sm:text-sm ${
            showDuplicateWarning 
              ? 'border-[#DFA574] focus:border-[#C88A5E]' 
              : 'border-gray-200 focus:border-[#D1DA8A]'
          }`}
          placeholder="Enter user's name"
          disabled={loading}
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="user-is-leader"
          checked={isLeader}
          onChange={(e) => setIsLeader(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#D1DA8A] focus:ring-[#D1DA8A]"
          disabled={loading}
        />
        <label htmlFor="user-is-leader" className="ml-2 block text-sm font-medium text-gray-700">
          This person is a leader
        </label>
      </div>

      {!compact && (
        <div>
          <label htmlFor="user-notes" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            id="user-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none sm:text-sm"
            placeholder="Any additional notes about this person"
            disabled={loading}
          />
        </div>
      )}

      {!compact && (
        <div>
          <label htmlFor="user-legacy-points" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Legacy Points (Optional)
          </label>
          <input
            type="number"
            id="user-legacy-points"
            value={legacyPoints}
            onChange={(e) => setLegacyPoints(e.target.value)}
            className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 shadow-sm transition-colors focus:border-[#DFA574] focus:outline-none sm:text-sm"
            placeholder="Points from previous system"
            disabled={loading}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            If this user had points in a previous system, enter them here to carry over their balance.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md min-h-[44px]"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="rounded-xl bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 min-h-[44px]"
        >
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </div>
    </div>
  );
}