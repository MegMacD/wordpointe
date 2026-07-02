export const DEFAULT_BIBLE_VERSION = 'NIV';

export function getEffectiveBibleVersion(version?: string | null): string {
  return version || DEFAULT_BIBLE_VERSION;
}