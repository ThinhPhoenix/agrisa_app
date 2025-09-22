// import useAxios from '@/config/useAxios.config';
// import { SignInRequest } from '@/domains/auth/schemas/signInRequestSchema';
// import { User } from '@/domains/user-farmer/schemas/user.schema';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { create } from 'zustand';

// export const useUserStore = create((set) => ({
//   user: null,
//   setUser: (user: User) => set({ user }),
//   clearUser: () => set({ user: null }),
//   signIn: async (req: SignInRequest) => {
//     try {
//       const res = await useAxios.post('/auth/signin', req);
//       await AsyncStorage.setItem(`token`, res.data.token);
//     } catch (error) {
//       console.error(error);
//     }
//   },
// }));