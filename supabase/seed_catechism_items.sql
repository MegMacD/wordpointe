-- Catechism and Knowledge-Based Memory Items
-- These are non-verse items like books of the Bible, commandments, etc.
-- Run this in Supabase SQL Editor after migrations

INSERT INTO memory_items (type, reference, text, points_first, points_repeat, active, created_at, updated_at) VALUES
  -- Books of the Bible
  (
    'custom',
    'Old Testament',
    'Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi',
    15,
    5,
    true,
    now(),
    now()
  ),
  (
    'custom',
    'New Testament',
    'Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation',
    15,
    5,
    true,
    now(),
    now()
  ),
  (
    'custom',
    'Gospels',
    'Matthew, Mark, Luke, John',
    10,
    1,
    true,
    now(),
    now()
  ),
  (
    'custom',
    'ALL 66 books',
    'Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi, Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation',
    40,
    10,
    true,
    now(),
    now()
  ),
  (
    'custom',
    '10 Commandments',
    '1. You shall have no other gods before Me. 2. You shall not make idols. 3. You shall not take the name of the LORD your God in vain. 4. Remember the Sabbath day, to keep it holy. 5. Honor your father and your mother. 6. You shall not murder. 7. You shall not commit adultery. 8. You shall not steal. 9. You shall not bear false witness against your neighbor. 10. You shall not covet.',
    30,
    5,
    true,
    now(),
    now()
  )
ON CONFLICT (reference) DO UPDATE SET
  text = EXCLUDED.text,
  points_first = EXCLUDED.points_first,
  points_repeat = EXCLUDED.points_repeat,
  active = EXCLUDED.active,
  updated_at = now();

-- Verify items were created
SELECT reference, points_first, points_repeat, active, type
FROM memory_items
WHERE type = 'custom'
ORDER BY reference;
