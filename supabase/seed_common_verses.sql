-- ⚠️ DEPRECATED: This file is kept for reference only
-- 
-- NEW APPROACH: Use the seed script instead to fetch verses from the Bible API
-- This ensures you get the correct NIV translation and up-to-date text.
--
-- Run: cd web && npm run seed:verses
-- See: docs/SEEDING_VERSES.md for details
--
-- This SQL file has hardcoded ESV text which may be outdated.
-- The new script fetches verses dynamically from the Bible API.

-- Common Memory Verses for Sunday School
-- This preloads commonly memorized Bible verses in ESV
-- Run this after migrations to populate your verse library
-- Kids can still add any verse they want on-the-fly

-- MULTI-VERSE RANGES:
-- For passages commonly memorized as complete units (Psalm 23, 1 Cor 13:4-8),
-- we only include the full range with appropriate points for the whole passage.
-- If a kid wants to memorize just one verse from a range, they can add it on-the-fly
-- when recording, and the system will auto-create it with appropriate points.

-- Popular verses for kids to memorize
INSERT INTO memory_items (type, reference, text, points_first, points_repeat, active, bible_version, created_at, updated_at) VALUES
  -- Gospel Verses
  ('verse', 'John 3:16', 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Romans 3:23', 'for all have sinned and fall short of the glory of God,', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Romans 6:23', 'For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Romans 5:8', 'but God shows his love for us in that while we were still sinners, Christ died for us.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Romans 10:9', 'because, if you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Ephesians 2:8-9', 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.', 12, 6, true, 'ESV', now(), now()),
  ('verse', 'Ephesians 2:10', 'For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'John 1:12', 'But to all who did receive him, who believed in his name, he gave the right to become children of God,', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'John 14:6', 'Jesus said to him, "I am the way, and the truth, and the life. No one comes to the Father except through me.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 John 1:9', 'If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '2 Corinthians 5:17', 'Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.', 10, 5, true, 'ESV', now(), now()),
  
  -- Encouragement & Trust
  ('verse', 'Philippians 4:13', 'I can do all things through him who strengthens me.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Philippians 4:6-7', 'do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.', 14, 7, true, 'ESV', now(), now()),
  ('verse', 'Proverbs 3:5-6', 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.', 12, 6, true, 'ESV', now(), now()),
  ('verse', 'Jeremiah 29:11', 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Isaiah 40:31', 'but they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Joshua 1:9', 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Psalm 46:1', 'God is our refuge and strength, a very present help in trouble.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 Peter 5:7', 'casting all your anxieties on him, because he cares for you.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '2 Timothy 1:7', 'for God gave us a spirit not of fear but of power and love and self-control.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Deuteronomy 31:6', 'Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.', 10, 5, true, 'ESV', now(), now()),
  
  -- Psalms
  ('verse', 'Psalm 23:1', 'The Lord is my shepherd; I shall not want.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Psalm 119:11', 'I have stored up your word in my heart, that I might not sin against you.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Psalm 139:14', 'I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Psalm 118:24', 'This is the day that the Lord has made; let us rejoice and be glad in it.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Psalm 56:3', 'When I am afraid, I put my trust in you.', 10, 5, true, 'ESV', now(), now()),
  
  -- Love & Obedience
  ('verse', 'John 13:34', 'A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 John 4:19', 'We love because he first loved us.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 John 4:11', 'Beloved, if God so loved us, we also ought to love one another.', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Matthew 22:37-38', 'And he said to him, "You shall love the Lord your God with all your heart and with all your soul and with all your mind. This is the great and first commandment.', 12, 6, true, 'ESV', now(), now()),
  ('verse', 'Colossians 3:23', 'Whatever you do, work heartily, as for the Lord and not for men,', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 Corinthians 10:31', 'So, whether you eat or drink, or whatever you do, do all to the glory of God.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 Corinthians 13:4-8', 'Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful; it does not rejoice at wrongdoing, but rejoices with the truth. Love bears all things, believes all things, hopes all things, endures all things. Love never ends. As for prophecies, they will pass away; as for tongues, they will cease; as for knowledge, it will pass away.', 20, 10, true, 'ESV', now(), now()),
  ('verse', '1 Corinthians 16:13-14', 'Be watchful, stand firm in the faith, act like men, be strong. Let all that you do be done in love.', 12, 6, true, 'ESV', now(), now()),
  ('verse', 'Ephesians 4:2-3', 'with all humility and gentleness, with patience, bearing with one another in love, eager to maintain the unity of the Spirit in the bond of peace.', 12, 6, true, 'ESV', now(), now()),
  
  -- God's Word
  ('verse', '2 Timothy 3:16', 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness,', 10, 5, true, 'ESV', now(), now()),
  ('verse', 'Hebrews 4:12', 'For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow, and discerning the thoughts and intentions of the heart.', 12, 6, true, 'ESV', now(), now()),
  ('verse', 'Joshua 1:8', 'This Book of the Law shall not depart from your mouth, but you shall meditate on it day and night, so that you may be careful to do according to all that is written in it. For then you will make your way prosperous, and then you will have good success.', 16, 8, true, 'ESV', now(), now()),
  
  -- Faith & Faithfulness
  ('verse', 'Deuteronomy 7:9', 'Know therefore that the Lord your God is God, the faithful God who keeps covenant and steadfast love with those who love him and keep his commandments, to a thousand generations,', 12, 6, true, 'ESV', now(), now()),
  ('verse', 'Deuteronomy 32:4', 'The Rock, his work is perfect, for all his ways are justice. A God of faithfulness and without iniquity, just and upright is he.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 Timothy 1:17', 'To the King of the ages, immortal, invisible, the only God, be honor and glory forever and ever. Amen.', 10, 5, true, 'ESV', now(), now()),
  ('verse', '1 Thessalonians 5:16-18', 'Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.', 12, 6, true, 'ESV', now(), now()),
  
  -- Christmas
  ('verse', 'Luke 2:10-11', 'And the angel said to them, "Fear not, for behold, I bring you good news of great joy that will be for all the people. For unto you is born this day in the city of David a Savior, who is Christ the Lord.', 14, 7, true, 'ESV', now(), now()),
  ('verse', 'John 1:14', 'And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.', 10, 5, true, 'ESV', now(), now()),
  
  -- Easter
  ('verse', '1 Corinthians 15:3-4', 'For I delivered to you as of first importance what I also received: that Christ died for our sins in accordance with the Scriptures, that he was buried, that he was raised on the third day in accordance with the Scriptures,', 14, 7, true, 'ESV', now(), now()),
  ('verse', 'Matthew 28:5-6', 'But the angel said to the women, "Do not be afraid, for I know that you seek Jesus who was crucified. He is not here, for he has risen, as he said. Come, see the place where he lay.', 14, 7, true, 'ESV', now(), now())

ON CONFLICT ON CONSTRAINT memory_items_reference_unique DO NOTHING;
ON CONFLICT ON CONSTRAINT memory_items_reference_unique DO NOTHING;

-- NOTE: The ON CONFLICT clause prevents duplicates if you run this script multiple times
-- 
-- FLEXIBILITY FOR KIDS:
-- - Kids can add ANY verse on-the-fly when recording (auto-creates with ESV text)
-- - Want to memorize just 1 Cor 13:4 instead of the full 13:4-8? Just enter it when recording!
-- - The system will fetch the text and assign appropriate points automatically
-- - This seed script just provides common starting verses - not a complete list