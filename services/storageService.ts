import localforage from 'localforage';
import { CharacterProfile } from '../types';

// Configure localforage
localforage.config({
  name: 'MyMuseAI',
  storeName: 'characters_store', // Should be alphanumeric, with underscores.
  description: 'Storage for My Muse AI characters and images'
});

const CHARACTERS_KEY_PREFIX = 'my-muse-ai-characters-';

export const storageService = {
  /**
   * Save characters for a specific user.
   */
  saveCharacters: async (username: string, characters: CharacterProfile[]): Promise<void> => {
    try {
      await localforage.setItem(`${CHARACTERS_KEY_PREFIX}${username}`, characters);
    } catch (error) {
      console.error('Failed to save characters to storage:', error);
      throw error;
    }
  },

  /**
   * Load characters for a specific user.
   * Attempts to migrate from localStorage if data exists there but not in localforage.
   */
  loadCharacters: async (username: string): Promise<CharacterProfile[]> => {
    try {
      const key = `${CHARACTERS_KEY_PREFIX}${username}`;
      
      // 1. Try to load from localforage
      const characters = await localforage.getItem<CharacterProfile[]>(key);
      if (characters) {
        return characters;
      }

      // 2. If not found, try to migrate from localStorage (legacy support)
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          // Save to localforage
          await localforage.setItem(key, parsedData);
          // Clear from localStorage to free up space
          localStorage.removeItem(key);
          return parsedData;
        } catch (e) {
          console.error('Failed to parse legacy localStorage data:', e);
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to load characters from storage:', error);
      return [];
    }
  },

  /**
   * Clear all data for a user (optional, for logout/cleanup)
   */
  clearUserData: async (username: string): Promise<void> => {
    try {
      await localforage.removeItem(`${CHARACTERS_KEY_PREFIX}${username}`);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }
};
