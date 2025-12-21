import axios from "axios";

/**
 * Interface cho response từ imgbb API
 */
export interface ImgbbUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string; // URL ảnh đầy đủ
    display_url: string; // URL để hiển thị
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Service để upload ảnh lên imgbb
 */
export const imageService = {
  /**
   * Upload một ảnh lên imgbb
   * @param imageUri - URI của ảnh cần upload (local file path hoặc base64)
   * @returns Promise với URL của ảnh đã upload
   */
  uploadToImgbb: async (imageUri: string): Promise<string> => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_IMG_API_KEY;
      const apiUrl = "https://api.imgbb.com/1/upload";

      console.log("🔍 [imgbb] Starting upload...");
      console.log("🔍 [imgbb] Image URI:", imageUri);
      console.log("🔍 [imgbb] API URL:", apiUrl);
      console.log("🔍 [imgbb] API Key configured:", !!apiKey);

      if (!apiKey) {
        throw new Error("imgbb API key is not configured");
      }

      if (!apiUrl) {
        throw new Error("imgbb API URL is not configured");
      }

      // Tạo FormData để upload
      const formData = new FormData();

      // Append ảnh vào FormData (binary file/base64/URL)
      const fileName = `image_${Date.now()}.jpg`;
      console.log("🔍 [imgbb] File name:", fileName);
      
      // @ts-ignore - FormData trong React Native
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: fileName,
      });

      console.log("🔍 [imgbb] FormData created successfully");
      console.log("🔍 [imgbb] Making POST request to:", `${apiUrl}?key=***`);

      // Gọi API imgbb
      const uploadResponse = await axios.post<ImgbbUploadResponse>(
        `${apiUrl}?key=${apiKey}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ [imgbb] Upload response received");
      console.log("🔍 [imgbb] Response status:", uploadResponse.status);
      console.log("🔍 [imgbb] Response success:", uploadResponse.data.success);

      // Trả về URL của ảnh
      if (uploadResponse.data.success && uploadResponse.data.data) {
        const imageUrl = uploadResponse.data.data.url;
        console.log("✅ [imgbb] Image uploaded successfully:", imageUrl);
        return imageUrl;
      } else {
        console.error("❌ [imgbb] Invalid response structure:", uploadResponse.data);
        throw new Error("Upload failed: Invalid response from imgbb");
      }
    } catch (error: any) {
      console.error("❌ [imgbb] Upload error caught");
      console.error("❌ [imgbb] Error type:", error.constructor.name);
      console.error("❌ [imgbb] Error message:", error.message);
      
      if (error.response) {
        // Server responded with error status
        console.error("❌ [imgbb] Response error");
        console.error("❌ [imgbb] Status code:", error.response.status);
        console.error("❌ [imgbb] Status text:", error.response.statusText);
        console.error("❌ [imgbb] Response data:", JSON.stringify(error.response.data, null, 2));
        console.error("❌ [imgbb] Response headers:", error.response.headers);
        
        const errorMessage = error.response.data?.error?.message || 
                           error.response.data?.message || 
                           "Upload failed";
        throw new Error(`imgbb upload error: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error("❌ [imgbb] Network error - No response received");
        console.error("❌ [imgbb] Request config:", {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        });
        console.error("❌ [imgbb] Request object:", error.request);
        throw new Error("Network error: Unable to reach imgbb server");
      } else {
        // Something happened in setting up the request
        console.error("❌ [imgbb] Request setup error");
        console.error("❌ [imgbb] Error stack:", error.stack);
        throw new Error(error.message || "Unknown error during image upload");
      }
    }
  },

  /**
   * Upload nhiều ảnh lên imgbb
   * @param imageUris - Mảng các URI ảnh cần upload
   * @returns Promise với mảng URLs của các ảnh đã upload
   */
  uploadMultipleToImgbb: async (imageUris: string[]): Promise<string[]> => {
    try {
      // Upload từng ảnh một cách tuần tự để tránh rate limit
      const uploadedUrls: string[] = [];

      for (const uri of imageUris) {
        const uploadedUrl = await imageService.uploadToImgbb(uri);
        uploadedUrls.push(uploadedUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error("❌ Error uploading multiple images:", error);
      throw error;
    }
  },
};