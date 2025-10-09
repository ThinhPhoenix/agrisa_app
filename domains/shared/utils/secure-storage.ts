import * as SecureStore from 'expo-secure-store';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'agrisa_access_token',
  USER_DATA: 'agrisa_user_data',
  ENABLE_FACE_ID: 'agrisa_enable_face_id',
} as const;

export const secureStorage = {
  // Store token
  setToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('❌ [SecureStorage] Error storing token:', error);
      throw error;
    }
  },

  // Get token
  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('❌ [SecureStorage] Error getting token:', error);
      return null;
    }
  },

  // Store user data
  setUser: async (user: any): Promise<void> => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('❌ [SecureStorage] Error storing user:', error);
      throw error;
    }
  },

  // Get user data
  getUser: async (): Promise<any | null> => {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ [SecureStorage] Error getting user:', error);
      return null;
    }
  },

  // Clear all auth data
  clearAuth: async (): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
      ]);
    } catch (error) {
      console.error('❌ [SecureStorage] Error clearing auth:', error);
    }
  },

  // Set enable FaceID
  setEnableFaceID: async (enabled: boolean): Promise<void> => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ENABLE_FACE_ID, JSON.stringify(enabled));
    } catch (error) {
      console.error('❌ [SecureStorage] Error storing enable FaceID:', error);
      throw error;
    }
  },

  // Get enable FaceID
  getEnableFaceID: async (): Promise<boolean> => {
    try {
      const enabled = await SecureStore.getItemAsync(STORAGE_KEYS.ENABLE_FACE_ID);
      return enabled ? JSON.parse(enabled) : false;
    } catch (error) {
      console.error('❌ [SecureStorage] Error getting enable FaceID:', error);
      return false;
    }
  },
};