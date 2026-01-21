'use client';

import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

function HelpPageContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center">
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5CED8] to-[#A0B8C2] shadow-md">
              <svg className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quick Help Guide</h1>
          </div>
          <p className="text-gray-600">Everything you need to know to get started with Word Pointe</p>
        </div>

        {/* Getting Started */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#D1DA8A] text-sm font-bold text-gray-800">1</span>
            Getting Started
          </h2>
          <div className="ml-10 space-y-3 text-gray-700">
            <p>
              Word Pointe helps you track Bible memory verses and award points to kids in your ministry. 
              The main tasks are <strong>recording</strong> when kids complete memory work and <strong>spending</strong> their earned points on rewards.
            </p>
          </div>
        </section>

        {/* Recording Memory Work */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#D1DA8A] text-sm font-bold text-gray-800">2</span>
            Recording Memory Work
          </h2>
          <div className="ml-10 space-y-4">
            <div className="rounded-2xl border-2 border-[#D1DA8A]/30 bg-[#D1DA8A]/10 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Go to the Record page</h3>
              <ol className="ml-4 list-decimal space-y-2 text-gray-700">
                <li><strong>Select the child</strong> from the dropdown (or add a new one)</li>
                <li><strong>Choose the memory item</strong> they completed:
                  <ul className="ml-6 mt-1 list-disc text-sm">
                    <li>Use quick filters: <strong>Verses Only</strong>, <strong>Books & More</strong>, or <strong>Recent</strong></li>
                    <li>Search by typing in the dropdown</li>
                    <li>Browse by category (Bible Verses, Books & More, Recently Used)</li>
                  </ul>
                </li>
                <li><strong>Check the record type</strong>:
                  <ul className="ml-6 mt-1 list-disc text-sm">
                    <li><strong>First Time</strong> - They get more points for their first time!</li>
                    <li><strong>Repeat</strong> - They get fewer points for practicing again</li>
                    <li>The app automatically detects which it should be</li>
                  </ul>
                </li>
                <li><strong>Click Record</strong> and they get their points!</li>
              </ol>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start">
                <svg className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-700">
                  <strong>Pro tip:</strong> Recently used items appear at the top of the dropdown to save you time!
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start">
                <svg className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-700">
                  <strong>Note about verse text:</strong> The app may show a verse for reference, but the child's memorization may differ slightly based on their Bible translation (NIV, ESV, NLT, etc.) That's perfectly fine!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spending Points */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#DFA574] text-sm font-bold text-gray-800">3</span>
            Spending Points on Rewards
          </h2>
          <div className="ml-10 space-y-4">
            <div className="rounded-2xl border-2 border-[#DFA574]/30 bg-[#DFA574]/10 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Go to the Spend page</h3>
              <ol className="ml-4 list-decimal space-y-2 text-gray-700">
                <li><strong>Select the child</strong> - You'll see their current points balance</li>
                <li><strong>Enter the points to spend</strong>:
                  <ul className="ml-6 mt-1 list-disc text-sm">
                    <li>Use the number pad buttons for quick entry</li>
                    <li>Or type the amount directly</li>
                  </ul>
                </li>
                <li><strong>Add an optional description</strong> (like "Candy bar" or "Pop-it")</li>
                <li><strong>Click Spend Points</strong></li>
              </ol>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start">
                <svg className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-700">
                  <strong>Oops?</strong> You can undo a spend transaction from the child's profile page if you make a mistake.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Viewing Progress */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#B5CED8] text-sm font-bold text-gray-800">4</span>
            Viewing Child Progress
          </h2>
          <div className="ml-10 space-y-4">
            <div className="rounded-2xl border-2 border-[#B5CED8]/30 bg-[#B5CED8]/10 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Go to the Users page</h3>
              <ul className="ml-4 list-disc space-y-2 text-gray-700">
                <li>See all children with their <strong>current points balance</strong></li>
                <li>View <strong>total points earned</strong> all-time</li>
                <li><strong>Click on a child's name</strong> to see:
                  <ul className="ml-6 mt-1 list-disc text-sm">
                    <li>Complete history of memory work completed</li>
                    <li>All rewards they've received</li>
                    <li>Total verses memorized vs. books & more</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-sm font-bold text-white">?</span>
            Common Questions
          </h2>
          <div className="ml-10 space-y-4">
            <div>
              <h3 className="mb-1 font-semibold text-gray-900">What's the difference between "Verse" and "Books & More"?</h3>
              <p className="text-gray-700">
                <strong>Verses</strong> are Scripture passages (like John 3:16).
                <br /> 
                <strong>Books & More</strong> includes memorizing the books of the Bible, prayers, catechisms, creeds, or other memory work.
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gray-900">Why do points vary between first time and repeat?</h3>
              <p className="text-gray-700">
                Kids get more points the first time they complete a memory item to encourage them to try new things. 
                They get fewer points when repeating to practice, but it's still valuable!
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gray-900">Can I add a new child on the fly?</h3>
              <p className="text-gray-700">
                Yes! On the Record page, click "+ Add New User" above the user dropdown to quickly add someone new.
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gray-900">What if a child needs more memory items to choose from?</h3>
              <p className="text-gray-700">
                Contact an admin to add new verses or memory work items. They can do this from the Admin section.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4 border-t border-gray-200 pt-6">
          <Link
            href="/record"
            className="rounded-xl bg-gradient-to-r from-[#D1DA8A] to-[#B8C76E] px-6 py-3 font-semibold text-gray-800 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Recording
          </Link>
          <Link
            href="/"
            className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <AuthGuard>
      <HelpPageContent />
    </AuthGuard>
  );
}
