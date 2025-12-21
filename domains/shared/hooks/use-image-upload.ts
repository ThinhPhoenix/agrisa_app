import { useMutation } from "@tanstack/react-query";
import { imageService } from "../services/image.service";
import { QueryKey } from "../stores/query-key";

/**
 * Hook để upload ảnh lên imgbb
 */
export const useImageUpload = () => {
  /**
   * Mutation để upload một ảnh đơn lẻ
   */
  const uploadSingleImageMutation = useMutation({
    mutationKey: [QueryKey.SHARED.IMAGE_UPLOAD_SINGLE],
    mutationFn: async ({ imageUri }: { imageUri: string }) => {
      return await imageService.uploadToImgbb(imageUri);
    },
    onSuccess: (data) => {
      console.log("✅ Single image uploaded successfully:", data);
    },
    onError: (error: any) => {
      console.error("❌ Error uploading single image:", error);
    },
  });

  /**
   * Mutation để upload nhiều ảnh cùng lúc
   */
  const uploadMultipleImagesMutation = useMutation({
    mutationKey: [QueryKey.SHARED.IMAGE_UPLOAD_MULTIPLE],
    mutationFn: async ({ imageUris }: { imageUris: string[] }) => {
      return await imageService.uploadMultipleToImgbb(imageUris);
    },
    onSuccess: (data) => {
      console.log("✅ Multiple images uploaded successfully:", data);
    },
    onError: (error: any) => {
      console.error("❌ Error uploading multiple images:", error);
    },
  });

  return {
    // Mutation để upload ảnh đơn
    uploadSingleImageMutation,
    
    // Mutation để upload nhiều ảnh
    uploadMultipleImagesMutation,

    // Helper function: upload một ảnh và trả về URL
    uploadSingleImage: async (imageUri: string): Promise<string> => {
      try {
        const url = await uploadSingleImageMutation.mutateAsync({
          imageUri,
        });
        return url;
      } catch (error) {
        console.error("❌ uploadSingleImage error:", error);
        throw error;
      }
    },

    // Helper function: upload nhiều ảnh và trả về mảng URLs
    uploadMultipleImages: async (imageUris: string[]): Promise<string[]> => {
      try {
        const urls = await uploadMultipleImagesMutation.mutateAsync({
          imageUris,
        });
        return urls;
      } catch (error) {
        console.error("❌ uploadMultipleImages error:", error);
        throw error;
      }
    },
  };
};
