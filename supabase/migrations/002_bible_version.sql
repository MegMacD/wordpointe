-- Add Bible version setting
alter table settings add column bible_version text default 'ESV';

-- Update existing settings row if it exists
update settings set bible_version = 'ESV' where bible_version is null;
