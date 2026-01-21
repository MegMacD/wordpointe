-- Popular Bible Verses for Sunday School Memory Work
-- This script adds common memory verses to the memory_items table

INSERT INTO memory_items (type, reference, text, points_first, points_repeat, active) VALUES
  -- Core Gospel Verses
  ('verse', 'John 3:16', 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 15, 8, true),
  ('verse', 'Romans 6:23', 'For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.', 12, 6, true),
  ('verse', 'Romans 10:9', 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.', 12, 6, true),
  ('verse', 'Ephesians 2:8-9', 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.', 15, 8, true),
  
  -- Faith and Trust
  ('verse', 'Proverbs 3:5-6', 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.', 15, 8, true),
  ('verse', 'Philippians 4:13', 'I can do all things through Christ which strengtheneth me.', 10, 5, true),
  ('verse', 'Hebrews 11:1', 'Now faith is the substance of things hoped for, the evidence of things not seen.', 10, 5, true),
  ('verse', 'Jeremiah 29:11', 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.', 12, 6, true),
  
  -- Love and Relationships
  ('verse', '1 John 4:8', 'He that loveth not knoweth not God; for God is love.', 8, 4, true),
  ('verse', 'John 13:34-35', 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another. By this shall all men know that ye are my disciples, if ye have love one to another.', 18, 10, true),
  ('verse', '1 Corinthians 13:13', 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.', 10, 5, true),
  ('verse', 'Ephesians 4:32', 'And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ''s sake hath forgiven you.', 12, 6, true),
  
  -- Guidance and Wisdom
  ('verse', 'Psalm 119:105', 'Thy word is a lamp unto my feet, and a light unto my path.', 10, 5, true),
  ('verse', 'James 1:5', 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.', 12, 6, true),
  ('verse', 'Proverbs 22:6', 'Train up a child in the way he should go: and when he is old, he will not depart from it.', 10, 5, true),
  
  -- Strength and Comfort
  ('verse', 'Psalm 23:1', 'The LORD is my shepherd; I shall not want.', 8, 4, true),
  ('verse', 'Isaiah 41:10', 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.', 18, 10, true),
  ('verse', 'Philippians 4:19', 'But my God shall supply all your need according to his riches in glory by Christ Jesus.', 10, 5, true),
  ('verse', '2 Timothy 1:7', 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', 12, 6, true),
  
  -- Prayer and Communication with God
  ('verse', 'Philippians 4:6-7', 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.', 20, 12, true),
  ('verse', '1 Thessalonians 5:17', 'Pray without ceasing.', 5, 3, true),
  ('verse', 'Matthew 6:9-11', 'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name. Thy kingdom come, Thy will be done in earth, as it is in heaven. Give us this day our daily bread.', 20, 12, true),
  
  -- Obedience and Service
  ('verse', 'Ephesians 6:1', 'Children, obey your parents in the Lord: for this is right.', 8, 4, true),
  ('verse', 'Colossians 3:20', 'Children, obey your parents in all things: for this is well pleasing unto the Lord.', 10, 5, true),
  ('verse', 'Matthew 28:19-20', 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world.', 25, 15, true),
  
  -- Shorter verses for younger children
  ('verse', 'Jesus wept', 'Jesus wept.', 3, 2, true),
  ('verse', 'God is love', 'God is love.', 3, 2, true),
  ('verse', 'Be ye kind', 'Be ye kind one to another.', 5, 3, true),
  ('verse', 'Children obey', 'Children, obey your parents.', 5, 3, true),
  
  -- Memory aids and categories
  ('custom', 'Books of the New Testament', 'Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation', 25, 15, true),
  ('custom', 'Books of the Old Testament (first 10)', 'Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel', 20, 12, true),
  ('custom', 'Fruits of the Spirit', 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law. (Galatians 5:22-23)', 20, 12, true);

-- Add some additional custom memory work items
INSERT INTO memory_items (type, reference, text, points_first, points_repeat, active) VALUES
  ('custom', 'Ten Commandments', 'I. Thou shalt have no other gods before me. II. Thou shalt not make idols. III. Thou shalt not take the Lord''s name in vain. IV. Remember the Sabbath day. V. Honor thy father and mother. VI. Thou shalt not murder. VII. Thou shalt not commit adultery. VIII. Thou shalt not steal. IX. Thou shalt not bear false witness. X. Thou shalt not covet.', 30, 20, true),
  ('custom', 'Names of Jesus', 'Wonderful, Counselor, Mighty God, Everlasting Father, Prince of Peace (Isaiah 9:6)', 15, 8, true),
  ('custom', 'Armor of God', 'Truth, Righteousness, Gospel of Peace, Faith, Salvation, Word of God (Ephesians 6:13-17)', 18, 10, true);