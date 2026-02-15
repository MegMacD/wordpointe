// Emoji options for user icon selection
export const EMOJI_ICON_OPTIONS = [
  // Animals
  '🐶', '🐱', '🦊', '🐼', '🐸', '🐧', '🐦', '🐢', '🦁', '🐯', '🐨', '🦄', '🦋', '🐲', '🐬', '🐊', '🦕', '🦖', '🐘', '🦈',
  // Faces
  '😃', '😄', '😉', '😊', '😎', '🤩', '🥳', '😍', '😜', '🤗',
  // Food
  '🍎', '🍉', '🍇', '🍓', '🍕', '🍔', '🍟', '🍦', '🍪', '🍭', '🍿', '🍩', '🥨',
  // Objects
  '🚗', '🚲', '🏀', '⚽', '🧸', '🎨', '🎵', '🎸', '🚀', '🏈', '⚾', 
  // Nature
  '🌈', '🌻', '🌼', '🌞', '⭐️', '🍀', '🌵', '🌹', '❤️',
];

// Helper function to get a random emoji
export function getRandomEmoji(): string {
  return EMOJI_ICON_OPTIONS[Math.floor(Math.random() * EMOJI_ICON_OPTIONS.length)];
}
