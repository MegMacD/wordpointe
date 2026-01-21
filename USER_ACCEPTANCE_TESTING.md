# User Acceptance Testing Guide

Welcome! This guide will help you test all the features of Word Pointe and provide feedback.

## 🎯 Testing Goals

We want to make sure:
- All features work as expected
- The app is easy to use
- There are no confusing parts
- Points are calculated correctly
- Bible verses display properly

---

## ✅ Testing Checklist

Work through these scenarios and note any issues, questions, or suggestions.

---

## 1️⃣ User Management

### Test: Add a New User (Kid)

**Steps:**
1. Log in as a leader
2. Go to **Users** page (`/users`)
3. Click **"+ Add New User"**
4. Enter:
   - Name: "Test Kid"
   - Leader: Unchecked
   - Notes: "Testing user"
5. Click **"Create User"**

**Expected Result:**
- ✅ New user appears in the list
- ✅ Shows 0 points
- ✅ Success message appears

**Questions:**
- Was it easy to find where to add users?
- Was the form clear?
- Any confusion about the "Leader" checkbox?

---

### Test: Add a User with Legacy Points

**Steps:**
1. On Users page, click **"+ Add New User"** again
2. Enter:
   - Name: "Kid With History"
   - Leader: Unchecked
   - **Legacy Points: 50** (points from previous tracking system)
   - Notes: "Had 50 points in old system"
3. Click **"Create User"**

**Expected Result:**
- ✅ New user appears with 50 points already
- ✅ Success message indicates legacy points were added
- ✅ Points are immediately available for spending

**Questions:**
- Was the legacy points field easy to understand?
- Was it clear this is for importing historical points?
- Would you want to see legacy points tracked separately in history?

---

### Test: Add a New Leader

**Steps:**
1. On Users page, click **"+ Add New User"** again
2. Enter:
   - Name: "Test Leader"
   - Leader: **Checked** ✓
   - Notes: "Testing leader account"
3. Click **"Create User"**

**Expected Result:**
- ✅ New leader appears with a badge/indicator
- ✅ Can distinguish leaders from kids easily

**Questions:**
- Can you easily tell leaders apart from kids in the list?
- Is the leader indicator clear?

---

## 2️⃣ Recording Bible Verses

### Test: Record an Existing Verse (From Pre-loaded List)

**Steps:**
1. Go to **Record Memory** page (`/record`)
2. Select a user: **"Test Kid"**
3. Select memory item: **"John 3:16"** (should be in the dropdown)
4. Notice it says **"First Time"** automatically
5. Click **"Record Memory"**

**Expected Result:**
- ✅ Success message: "Recorded! +10 points awarded"
- ✅ User's points increase by 10
- ✅ Form clears for next recording

**Questions:**
- Was the dropdown easy to search/use?
- Was it clear this was a "first time" recording?
- Did the points calculation make sense?

---

### Test: Record a Repeat Verse

**Steps:**
1. Still on Record Memory page
2. Select same user: **"Test Kid"**
3. Select same verse: **"John 3:16"**
4. Notice it now says **"Repeat (1 previous)"**
5. Click **"Record Memory"**

**Expected Result:**
- ✅ Success message: "Recorded! +5 points awarded"
- ✅ User's points increase by 5 (not 10)
- ✅ Shows how many times previously recorded

**Questions:**
- Was it clear this was a repeat?
- Did the automatic detection work correctly?
- Were the reduced points (5 instead of 10) clear?

---

### Test: Add a NEW Verse (Not in the List)

**Steps:**
1. On Record Memory page
2. Select user: **"Test Kid"**
3. Click **"+ Enter New Verse Reference"**
4. Type: **"Philippians 4:13"**
5. Notice:
   - Book name autocomplete suggestions appear
   - Hint text says verse will be fetched automatically
6. Click **"Record Memory"**

**Expected Result:**
- ✅ Brief loading state while verse is verified
- ✅ Verse is fetched from Bible API
- ✅ Success message with points awarded
- ✅ Verse is now in the system for future use

**Questions:**
- Was the autocomplete helpful?
- Was it clear the verse would be created automatically?
- Did the loading state make sense?
- Any confusion about the process?

---

### Test: Invalid Verse Reference

**Steps:**
1. On Record Memory page
2. Click **"+ Enter New Verse Reference"**
3. Try typing: **"John 50:1"** (John only has 21 chapters)
4. Click **"Record Memory"**

**Expected Result:**
- ✅ Error message: "John 50:1 does not exist in the Bible"
- ✅ Recording is prevented
- ✅ User can correct the reference

**Try these other invalid verses:**
- "1 John 1:800" (chapter 1 only has 10 verses)
- "FakeBook 1:1" (not a real Bible book)
- "John 3" (missing verse number)

**Questions:**
- Were error messages helpful and clear?
- Could you easily correct mistakes?
- Any suggestions for better error messages?

---

### Test: View Verse in Different Translations

**Steps:**
1. On Record Memory page
2. Select a Bible verse from the dropdown (e.g., "John 3:16")
3. Look for the **"View in:"** dropdown that appears
4. Change from **ESV (Stored)** to **NIV**
5. Watch the verse text change
6. Try other versions: KJV, NKJV, NLT, NASB

**Expected Result:**
- ✅ Verse text changes to selected translation
- ✅ Loading state while fetching
- ✅ ESV is clearly marked as the stored version
- ✅ Helper text explains what you're viewing

**Questions:**
- Was it clear which version is stored vs. displayed?
- Was it easy to switch between versions?
- Are the available versions sufficient?
- Would kids find this helpful for memorization?

---

### Test: Verse Ranges (Multi-verse Passages)

**Steps:**
1. On Record Memory page
2. Click **"+ Enter New Verse Reference"**
3. Type: **"Psalm 23:1-6"** (entire passage)
4. Click **"Record Memory"**

**Expected Result:**
- ✅ Fetches the entire passage (all 6 verses)
- ✅ Awards more points than a single verse (likely 20+ points)
- ✅ Displays full text

**Try another:**
- "1 Corinthians 13:4-8" (love passage)

**Questions:**
- Did the point calculation seem fair for longer passages?
- Was the text displayed clearly?
- Would you want to track individual verses within a range?

---

## 3️⃣ Spending Points

### Test: Spend Points on a Prize

**Steps:**
1. Go to **Spend Points** page (`/spend`)
2. Select user: **"Test Kid"** (should have points from earlier tests)
3. Enter points: **5**
4. Enter note: **"Sticker"**
5. Click **"Record Spend"**

**Expected Result:**
- ✅ Success message
- ✅ User's points decrease by 5
- ✅ Spend record is created

**Questions:**
- Was the process intuitive?
- Should there be a list of common prizes?
- Is the note field sufficient?

---

### Test: Undo a Spend

**Steps:**
1. Go to **Users** page (`/users`)
2. Find **"Test Kid"** and click their name
3. Scroll to **"Spend History"** section
4. Find the spend record you just created
5. Click **"Undo"**

**Expected Result:**
- ✅ Points are restored to the user
- ✅ Spend record marked as "undone" (grayed out)
- ✅ Cannot undo again

**Questions:**
- Was it easy to find spend history?
- Was the undo process clear?
- Should undos be more restricted?

---

## 4️⃣ Admin Features

### Test: Admin Menu Organization

**Steps:**
1. Look at the navigation bar
2. Find the **"Admin"** dropdown menu
3. Click it to see admin options:
   - Memory Items
   - Adjust Points
   - Reports
   - Manage Users

**Expected Result:**
- ✅ Admin features grouped in dropdown
- ✅ Dropdown only visible to admin users
- ✅ Main navigation less cluttered
- ✅ Easy to find all admin functions

**Questions:**
- Is the admin menu easy to discover?
- Are the menu items clearly labeled?
- Would you organize it differently?

---

### Test: Adjust Points (Bonus/Correction)

**Steps:**
1. Go to **Admin → Adjust Points** (`/admin/bonus-points`)
2. Select a user from the dropdown
3. Enter:
   - Points: **10**
   - Category: **Bonus**
   - Reason: "Great attitude during practice"
4. Notice the preview: "Test Kid will have X points (currently Y)"
5. Click **"Grant Points"**

**Expected Result:**
- ✅ Success message
- ✅ User's points increase by 10
- ✅ Adjustment is tracked separately from verse records
- ✅ Can view adjustment in user history

**Try Other Scenarios:**
- **Correction**: Grant 5 points with category "Correction" (missed recording)
- **Negative Adjustment**: Enter **-3** points to deduct points
- **Large Amount**: Grant 100 legacy points to a new user

**Expected for Negative:**
- ✅ Works correctly (deducts points)
- ✅ Preview shows "will have X points" correctly

**Questions:**
- Is the purpose of this feature clear?
- Are the categories helpful (Bonus, Correction, Legacy, Other)?
- Should there be more safeguards for large point amounts?
- Would you want preset reasons (dropdown)?
- Is the preview calculation helpful?

---

### Test: Manage Memory Items

**Steps:**
1. Go to **Admin → Memory Items** (`/admin/memory-items`)
2. View the list of verses and custom items
3. Click **"+ Add New Item"**
4. Create a **Bible Verse** item:
   - Type: Verse
   - Reference: Type **"Romans 12:2"**
   - Notice: Verse text auto-fetches from Bible API
   - Bible Version: ESV (default)
   - Points First: 10
   - Points Repeat: 5
   - Active: Checked
5. Click **"Create Item"**

**Expected Result:**
- ✅ Verse text appears automatically as you type
- ✅ Book name autocomplete helps with spelling
- ✅ Can override auto-fetched text if needed (checkbox)
- ✅ New verse appears in list with full text
- ✅ Available immediately in Record Memory dropdown

**Try Another Test:**
6. Click **"+ Add New Item"** again
7. Create a **Custom** item:
   - Type: Custom
   - Reference: "Books of the New Testament"
   - Text: Manually type the list of books
   - Points First: 15
   - Points Repeat: 7
   - Active: Checked
8. Click **"Create Item"**

**Expected Result:**
- ✅ Custom items don't auto-fetch (no Bible reference)
- ✅ Can enter any text you want
- ✅ Custom items are clearly marked

**Questions:**
- Was the auto-fetch feature helpful or distracting?
- Did book name autocomplete work well?
- Is it clear when to use Verse vs. Custom type?
- Would you want to select different Bible versions?
- Is the manual override option clear and accessible?
- What other custom items would be useful?

---

### Test: Deactivate a Memory Item

**Steps:**
1. Still on Memory Items page
2. Find a verse you don't want kids to use
3. Click **"Edit"**
4. Uncheck **"Active"**
5. Save changes

**Expected Result:**
- ✅ Item no longer appears in Record Memory dropdown
- ✅ Still exists in admin view
- ✅ Historical records are preserved

**Questions:**
- Was the active/inactive concept clear?
- Should inactive items be hidden completely?

---

### Test: View Reports

**Steps:**
1. Go to **Admin → Reports** (`/admin/reports`)
2. View the current data:
   - Total users
   - Total verses recorded
   - Top memorizers
   - Recent activity

**Expected Result:**
- ✅ Data matches your test records
- ✅ Reports are easy to read
- ✅ Helpful for tracking progress

**Questions:**
- What other reports would be helpful?
- Is the data presented clearly?
- Would you want to export/print reports?

---

## 5️⃣ General Usability

### Test: Navigation & Branding

**Steps:**
1. Look at the homepage title **"Word Pointe"**:
   - Notice the distinctive Quicksand font
   - Does it feel friendly and modern?
2. Click through all the main pages:
   - Home (/)  
   - Record (/record)
   - Spend (/spend)
   - Users (/users)
   - Admin dropdown → Memory Items
   - Admin dropdown → Adjust Points
   - Admin dropdown → Reports
   - Admin dropdown → Manage Users

**Expected Result:**
- ✅ Main navigation has 4 primary links + Admin dropdown
- ✅ Admin dropdown groups all admin functions
- ✅ Current page is highlighted
- ✅ Branding feels cohesive
- ✅ Navigation is consistent across pages

**Questions:**
- Is navigation intuitive?
- Can you easily find what you need?
- Are page names clear?
- Should there be breadcrumbs?
- Is the admin menu organization helpful?
- Does the Quicksand font work for the branding?
- Is the navigation clean and uncluttered now?

---

### Test: Mobile Experience

**Steps:**
1. Open the app on a phone or tablet
2. Try recording a verse
3. Try spending points
4. View user list

**Questions:**
- Does it work well on mobile?
- Are buttons easy to tap?
- Is text readable?
- Any layout issues?

---

### Test: Search and Filtering

**Steps:**
1. On Users page, try searching for a user
2. On Record page, try searching for a verse
3. Test the filter buttons (All, Verses, Custom)

**Questions:**
- Is search fast and accurate?
- Are filters helpful?
- Would you want more filter options?

---

## 6️⃣ Edge Cases

### Test: Duplicate Prevention

**Steps:**
1. Try creating a user with the same name as an existing user
2. What happens?

**Expected Result:**
- Should warn about potential duplicate

---

### Test: Zero/Negative Points

**Steps:**
1. Find a user with 0 points
2. Try spending 1 point
3. What happens?

**Expected Result:**
- Should prevent going negative

---

### Test: Long Verse Text

**Steps:**
1. Try adding a very long passage like "Romans 8:28-39"
2. Does it display correctly?
3. Are there any layout issues?

---

## 📝 Feedback Form

After testing, please provide feedback on:

### 1. **Ease of Use** (1-5 stars)
- How easy was it to learn the app?
- Rating: ⭐⭐⭐⭐⭐

### 2. **Bible Verse Features**
- Was automatic verse fetching helpful?
- Did multiple translations work well?
- Was validation helpful or annoying?
- Comments:

### 3. **Point System**
- Do point values make sense?
- Is automatic detection of first/repeat helpful?
- Should point values be customizable per verse?
- Comments:

### 4. **Most Confusing Part**
- What was hardest to understand?
- What would you change?

### 5. **Missing Features**
- What features would you like to see?
- What would make this more useful?

### 6. **Bugs or Errors**
- Did anything break?
- Any error messages?
- Please describe what you were doing when it happened

### 7. **Overall Impression**
- Would you use this with your kids?
- What's the best part?
- What's the worst part?

---

## 🐛 How to Report Issues

If you find a bug or have a suggestion:

1. **Note the details:**
   - What page were you on?
   - What did you click?
   - What did you expect to happen?
   - What actually happened?

2. **Share with your contact** or create a GitHub issue

3. **Include:**
   - Browser (Chrome, Firefox, Safari, etc.)
   - Device (Computer, Phone, Tablet)
   - Screenshots if possible

---

## ✅ Quick Summary

**Must Test:**
- [ ] Add a new user
- [ ] Add a user with legacy points (NEW)
- [ ] Record an existing verse
- [ ] Record a NEW verse (auto-create)
- [ ] Try an invalid verse reference
- [ ] View verse in different translations
- [ ] Record a repeat verse
- [ ] Spend points
- [ ] Undo a spend
- [ ] Adjust points for a user (bonus/correction) (NEW)
- [ ] Add a Bible verse item (with auto-fetch) (NEW)
- [ ] Add a custom memory item
- [ ] Test admin dropdown menu (NEW)
- [ ] View reports

**Nice to Test:**
- [ ] Search functionality
- [ ] Mobile experience
- [ ] Verse ranges (multi-verse passages)
- [ ] Deactivate memory items
- [ ] Filter options
- [ ] Book name autocomplete in verse entry
- [ ] Manual text override in admin forms
- [ ] Negative point adjustments
- [ ] Large legacy point amounts
- [ ] Admin menu on mobile

---

Thank you for testing Word Pointe! Your feedback will help make this app better for kids and leaders. 🙏
