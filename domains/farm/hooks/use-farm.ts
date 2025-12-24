import { useNotificationModal } from "@/components/modal";
import { useResultStatus } from "@/components/result-status/export";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { FormFarmDTO } from "../models/farm.models";
import { farmServices } from "../service/farm.service";
import { parseFarmError } from "../utils/farm-error-handler";

export const useFarm = () => {
    const queryClient = useQueryClient();
    const notification = useNotificationModal();
    const resultStatus = useResultStatus();
    const getListFarm = (cropType: string) => {
        return useQuery({
            queryKey: [QueryKey.FARM.LIST, cropType],
            queryFn: () => farmServices.get.listFarm(cropType),
        });
    };

    const getDetailFarm = (
        farm_id: string,
        options?: { enabled?: boolean }
    ) => {
        return useQuery({
            queryKey: [QueryKey.FARM.DETAIL, farm_id],
            queryFn: () => farmServices.get.detailFarm(farm_id),
            enabled:
                options?.enabled !== undefined ? options.enabled : !!farm_id,
        });
    };

    /**
     * Mutation: Tạo farm mới
     */
    const createFarmMutation = useMutation({
        mutationFn: (payload: FormFarmDTO) =>
            farmServices.post.createFarm(payload),
        onSuccess: async (data: any) => {
            console.log("✅ Farm created successfully:", data);

            // Invalidate queries trước khi chuyển trang
            await queryClient.invalidateQueries({
                queryKey: [QueryKey.FARM.LIST],
            });
            
            await queryClient.invalidateQueries({
                queryKey: [QueryKey.STATS.OVERVIEW],
            });

            // Hiển thị Result Status Screen
            resultStatus.showSuccess({
              title: "Đăng ký thành công!",
              message: "Trang trại của bạn đã được đăng ký thành công.",
              subMessage:
                "Bạn có thể bắt đầu đăng ký bảo hiểm cho nông trại này.",
              autoRedirectSeconds: 5,
              autoRedirectRoute: "/(tabs)",
              showHomeButton: true,
              lockNavigation: true,
            });
        },
        onError: (error: any) => {
            console.error("❌ Create farm error:", error);
            console.error("❌ Error response:", error?.response);
            console.error("❌ Error data:", error?.response?.data);

            // Parse error bằng farm-error-handler
            const errorInfo = parseFarmError(error);

            console.log("📋 Parsed error info:", errorInfo);

            // Hiển thị Result Status Screen với error chi tiết
            resultStatus.showError({
                title: errorInfo.title,
                message: errorInfo.message,
                subMessage:
                    errorInfo.subMessage ||
                    "Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ.",
                showHomeButton: true,
                lockNavigation: true,
            });

            // Log technical details for debugging
            if (errorInfo.technicalMessage) {
                console.error(
                    "🔧 Technical error:",
                    errorInfo.technicalMessage
                );
            }
            if (errorInfo.httpStatus) {
                console.error("📊 HTTP Status:", errorInfo.httpStatus);
            }
            if (errorInfo.errorCode) {
                console.error("🔑 Error Code:", errorInfo.errorCode);
            }
        },
    });

    /**
     * Mutation: Cập nhật farm
     */
    const updateFarmMutation = useMutation({
        mutationFn: ({
            farmId,
            payload,
        }: {
            farmId: string;
            payload: FormFarmDTO;
        }) => farmServices.put.updateFarm(farmId, payload),
        onSuccess: (response, variables) => {
            console.log("✅ Farm updated successfully:", response);

            if (response.success) {
                notification.success("✅ Cập nhật nông trại thành công!");

                // Invalidate queries
                queryClient.invalidateQueries({
                    queryKey: [QueryKey.FARM.LIST],
                });
                queryClient.invalidateQueries({
                    queryKey: [QueryKey.FARM.DETAIL, variables.farmId],
                });
                resultStatus.showSuccess({
                  title: "Đăng ký thành công!",
                  message: "Trang trại của bạn đã được đăng ký thành công.",
                  subMessage:
                    "Bạn có thể bắt đầu đăng ký bảo hiểm cho nông trại này.",
                  autoRedirectSeconds: 5,
                  autoRedirectRoute:
                    `/(farmer)/form-farm/${variables.farmId}?mode=detail`,
                  showHomeButton: true,
                  lockNavigation: true,
                });
                
            }
        },
        onError: (error: any, variables) => {
            console.error("❌ Update farm error:", error);
            console.error("❌ Farm ID:", variables.farmId);
            console.error("❌ Error response:", error?.response);
            console.error("❌ Error data:", error?.response?.data);

            // Parse error bằng farm-error-handler
            const errorInfo = parseFarmError(error);

            console.log("📋 Parsed error info:", errorInfo);

            // Hiển thị notification với error chi tiết
            let notificationMessage = errorInfo.message;

            if (errorInfo.subMessage) {
                notificationMessage += `\n${errorInfo.subMessage}`;
            }

            if (errorInfo.suggestions && errorInfo.suggestions.length > 0) {
                notificationMessage += "\n\nGợi ý:";
                errorInfo.suggestions.forEach((suggestion, index) => {
                    notificationMessage += `\n${index + 1}. ${suggestion}`;
                });
            }

            notification.error(notificationMessage);

            // Log technical details for debugging
            if (errorInfo.technicalMessage) {
                console.error(
                    "🔧 Technical error:",
                    errorInfo.technicalMessage
                );
            }
            if (errorInfo.httpStatus) {
                console.error("📊 HTTP Status:", errorInfo.httpStatus);
            }
            if (errorInfo.errorCode) {
                console.error("🔑 Error Code:", errorInfo.errorCode);
            }
        },
    });

    return {
        getListFarm,
        getDetailFarm,
        createFarmMutation,
        updateFarmMutation,
    };
};
