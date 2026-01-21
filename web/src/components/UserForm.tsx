'use client';

import { useState } from 'react';

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
}

export default function UserForm({ onUserAdded, onCancel, compact = false, existingUsers = [] }: UserFormProps) {
  const [name, setName] = useState('');
  const [isLeader, setIsLeader] = useState(false);
  const [notes, setNotes] = useState('');
  const [legacyPoints, setLegacyPoints] = useState('');
  const [loading, setLoading] = useState(false);
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
      const userData: CreateUserRequest = {
        name: name.trim(),
        is_leader: isLeader,
      };

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
        setNotes('');
        setLegacyPoints('');
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
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showDuplicateWarning && !error && (
        <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          <div className="flex items-center">
            <svg className="mr-2 h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            A user with this name already exists. Please use a different name.
          </div>
        </div>
      )}

      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
              showDuplicateWarning 
                ? 'border-amber-300 focus:border-amber-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Enter user's name"
            disabled={loading}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_leader"
            checked={isLeader}
            onChange={(e) => setIsLeader(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={loading}
          />
          <label htmlFor="is_leader" className="ml-2 block text-sm text-gray-700">
            This person is a leader
          </label>
        </div>

        {!compact && (
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Any additional notes about this person"
              disabled={loading}
            />
          </div>
        )}

        {!compact && (
          <div>
            <label htmlFor="legacy-points" className="block text-sm font-medium text-gray-700">
              Legacy Points (Optional)
            </label>
            <input
              type="number"
              id="legacy-points"
              value={legacyPoints}
              onChange={(e) => setLegacyPoints(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Points from previous system"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              If this user had points in a previous system, enter them here to carry over their balance.
            </p>
          </div>
        )}

        <div className={`flex ${compact ? 'justify-end space-x-2' : 'justify-between'}`}>
          {!compact && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <div className={compact ? 'flex space-x-2' : 'flex space-x-2'}>
            {compact && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : compact ? 'Add' : 'Add User'}
            </button>
          </div>
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
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Add New User</h2>
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    </div>
  );
}