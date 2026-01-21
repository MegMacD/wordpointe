'use client';

import { useState, useEffect } from 'react';
import { Settings } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';

function SettingsPageContent() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pointsFirst, setPointsFirst] = useState<number>(10);
  const [pointsRepeat, setPointsRepeat] = useState<number>(5);
  const [bibleVersion, setBibleVersion] = useState<string>('KJV');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (res.ok) {
      setSettings(data);
      setPointsFirst(data.default_points_first || 10);
      setPointsRepeat(data.default_points_repeat || 5);
      setBibleVersion(data.bible_version || 'KJV');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          default_points_first: pointsFirst,
          default_points_repeat: pointsRepeat,
          bible_version: bibleVersion,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSettings(data);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        <div className="mb-6 flex items-center">
          <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#9AB5C1] shadow-md">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl p-4 border ${
              message.type === 'success'
                ? 'bg-[#B5CED8]/20 text-gray-800 border-[#B5CED8]/30'
                : 'bg-[#C97435]/10 text-gray-800 border-[#C97435]/30'
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Default Points (First Time)
            </label>
            <input
              type="number"
              min="0"
              value={pointsFirst}
              onChange={(e) => setPointsFirst(parseInt(e.target.value) || 0)}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Points awarded when a user records a memory item for the first time
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Default Points (Repeat)
            </label>
            <input
              type="number"
              min="0"
              value={pointsRepeat}
              onChange={(e) => setPointsRepeat(parseInt(e.target.value) || 0)}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Points awarded when a user records a memory item again (repeat)
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Preferred Bible Version
            </label>
            <select
              value={bibleVersion}
              onChange={(e) => setBibleVersion(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm transition-colors focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
            >
              <option value="KJV">King James Version (KJV)</option>
              <option value="NIV">New International Version (NIV)</option>
              <option value="ESV">English Standard Version (ESV)</option>
              <option value="NLT">New Living Translation (NLT)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Default Bible version for automatically fetching verse text. Requires API key for NIV/ESV/NLT.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-[#B5CED8] to-[#9AB5C1] px-4 py-3 font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5 animate-spin text-gray-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border-2 border-[#B5CED8]/30 bg-[#B5CED8]/10 p-5">
          <div className="flex items-start">
            <svg className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-[#B5CED8]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-800">Note</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                These are default values. Individual memory items can override these values.
                Changes here only affect new memory items that don't specify custom point values.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard requireAdmin>
      <SettingsPageContent />
    </AuthGuard>
  );
}

