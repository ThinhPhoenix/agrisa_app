import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OcrData {
  cccd_front?: string;
  cccd_back?: string;
  userData?: {
    name?: string;
    id_number?: string;
    dob?: string;
    address?: string;
  };
}

interface FaceScanData {
  video?: string;
  isVerified?: boolean;
}

interface EkycState {
  ocrData: OcrData;
  faceScanData: FaceScanData;
  isOcrCompleted: boolean;
  isFaceScanCompleted: boolean;
  
  // Actions
  setOcrData: (data: Partial<OcrData>) => void;
  setFaceScanData: (data: Partial<FaceScanData>) => void;
  setOcrCompleted: (completed: boolean) => void;
  setFaceScanCompleted: (completed: boolean) => void;
  resetEkyc: () => void;
}

export const useEkycStore = create<EkycState>()(
  persist(
    (set) => ({
      ocrData: {},
      faceScanData: {},
      isOcrCompleted: false,
      isFaceScanCompleted: false,

      setOcrData: (data) =>
        set((state) => ({
          ocrData: { ...state.ocrData, ...data },
        })),

      setFaceScanData: (data) =>
        set((state) => ({
          faceScanData: { ...state.faceScanData, ...data },
        })),

      setOcrCompleted: (completed) =>
        set({ isOcrCompleted: completed }),

      setFaceScanCompleted: (completed) =>
        set({ isFaceScanCompleted: completed }),

      resetEkyc: () =>
        set({
          ocrData: {},
          faceScanData: {},
          isOcrCompleted: false,
          isFaceScanCompleted: false,
        }),
    }),
    {
      name: "ekyc-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);