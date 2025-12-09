import { useNotificationModal } from "@/components/modal";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { useFarm } from "@/domains/farm/hooks/use-farm";
import { Farm } from "@/domains/farm/models/farm.models";
import { useMemo, useState } from "react";
import {
    PublicBasePolicyResponse,
    RegisterPolicyPayload,
} from "../models/policy.models";
import {
    DocumentTagsSchema,
    formatDocumentTagsForSubmit,
} from "../utils/document-tags.utils";
import { usePolicy } from "./use-policy";

interface UsePolicyFormProps {
    basePolicy: PublicBasePolicyResponse;
    basePolicyId: string;
    totalDataCost: number; // Từ metadata.total_data_cost
    documentTags?: DocumentTagsSchema; // Schema từ document_tags
}

export const usePolicyForm = ({
    basePolicy,
    basePolicyId,
    totalDataCost,
    documentTags,
}: UsePolicyFormProps) => {
    const { user } = useAuthStore();
    const notification = useNotificationModal();
    const { registerPolicyMutation } = usePolicy();
    const { getListFarm } = useFarm();

    // Get danh sách farm
    const { data: farmsResponse, isLoading: isLoadingFarms } = getListFarm();
    const farms: Farm[] =
        farmsResponse?.success && farmsResponse?.data ? farmsResponse.data : [];

    // State
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [plantingDate, setPlantingDate] = useState<Date>(new Date()); // Default to current date
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho document tags form data
    const [documentTagsData, setDocumentTagsData] = useState<
        Record<string, any>
    >({});

    /**
     * Tính toán các giá trị dựa trên farm được chọn
     */
    const calculateValues = () => {
        if (!selectedFarm) {
            return {
                areaMultiplier: 0,
                coverageAmount: 0,
                totalPremium: 0,
            };
        }

        // Chuyển m² sang hecta (1 hecta = 10,000 m²)
        const areaInHectares = selectedFarm.area_sqm;

        // Area multiplier (làm tròn 2 chữ số)
        const areaMultiplier = Number(areaInHectares.toFixed(2));

        // Tính coverage amount
        let coverageAmount = basePolicy.fix_payout_amount;
        if (basePolicy.is_payout_per_hectare) {
            coverageAmount = basePolicy.fix_payout_amount * areaMultiplier;
        }

        // Tính phí bảo hiểm
        let totalPremium = basePolicy.fix_premium_amount;
        if (basePolicy.is_per_hectare) {
            totalPremium = basePolicy.fix_premium_amount * areaMultiplier;
        }

        // Nhân với premium_base_rate
        totalPremium = totalPremium * basePolicy.premium_base_rate;

        return {
            areaMultiplier,
            coverageAmount: coverageAmount,
            totalPremium: totalPremium,
        };
    };

    const { areaMultiplier, coverageAmount, totalPremium } = calculateValues();

    /**
     * Kiểm tra form có hợp lệ để enable/disable button
     * Sử dụng useMemo để tránh infinite loop
     */
    const isFormValid = useMemo(() => {
        if (!selectedFarm || !plantingDate) {
            return false;
        }

        // Nếu có document_tags, kiểm tra xem đã điền đầy đủ chưa
        if (documentTags && Object.keys(documentTags).length > 0) {
            const allFieldsFilled = Object.keys(documentTags).every(
                (fieldName) => {
                    const value = documentTagsData[fieldName];
                    return (
                        value !== undefined && value !== null && value !== ""
                    );
                }
            );

            return allFieldsFilled;
        }

        return true;
    }, [selectedFarm, plantingDate, documentTags, documentTagsData]);

    /**
     * Validate form trước khi submit
     */
    const validateForm = (): string | null => {
        if (!user?.id) {
            return "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.";
        }

        if (!selectedFarm) {
            return "Vui lòng chọn trang trại để đăng ký bảo hiểm.";
        }

        if (!plantingDate) {
            return "Vui lòng chọn ngày gieo trồng.";
        }

        // Kiểm tra planting date không được trong quá khứ
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(plantingDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return "Ngày gieo trồng không được chọn ngày trong quá khứ. Vui lòng chọn ngày hôm nay hoặc tương lai.";
        }

        // Validate document_tags nếu có
        if (documentTags && Object.keys(documentTags).length > 0) {
            const missingFields: string[] = [];

            Object.entries(documentTags).forEach(([fieldName, fieldType]) => {
                const value = documentTagsData[fieldName];

                // Kiểm tra field có giá trị hay không
                if (value === undefined || value === null || value === "") {
                    missingFields.push(fieldName);
                }
            });

            if (missingFields.length > 0) {
                return `Vui lòng điền đầy đủ thông tin bổ sung: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? "..." : ""}`;
            }
        }

        return null;
    };

    /**
     * Submit form đăng ký policy
     */
    const submitPolicy = async () => {
        try {
            setIsSubmitting(true);

            // Validate
            const error = validateForm();
            if (error) {
                notification.error(error);
                setIsSubmitting(false);
                return;
            }

            if (!user?.id || !selectedFarm) {
                notification.error("Thông tin không đầy đủ");
                setIsSubmitting(false);
                return;
            }

            // Format document tags data
            const formattedPolicyTags = formatDocumentTagsForSubmit(
                documentTagsData,
                documentTags
            );

            // Tạo payload
            const payload: RegisterPolicyPayload = {
                registered_policy: {
                    base_policy_id: basePolicyId,
                    insurance_provider_id: basePolicy.insurance_provider_id,
                    farmer_id: user.id,
                    planting_date: Math.floor(plantingDate.getTime() / 1000), // Unix timestamp
                    area_multiplier: 1, // Luôn là 1
                    coverage_amount: 1,
                    total_farmer_premium: totalPremium,
                    total_data_cost: totalDataCost,
                },
                farm: {
                    id: selectedFarm.id,
                },
                policy_tags: {
                    ...formattedPolicyTags,
                    season: getCurrentSeason(),
                    registration_channel: "mobile_app",
                },
            };

            console.log("📤 Submitting policy registration:", payload);

            // Call API - success/error đã được xử lý trong usePolicy
            await registerPolicyMutation.mutateAsync(payload);
        } catch (error: any) {
            // Error đã được xử lý trong mutation onError
            console.error("❌ Error in submitPolicy:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Lấy mùa vụ hiện tại (dựa vào tháng)
     */
    const getCurrentSeason = (): string => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        if (month >= 1 && month <= 5) {
            return `spring_${year}`;
        } else if (month >= 6 && month <= 8) {
            return `summer_${year}`;
        } else if (month >= 9 && month <= 11) {
            return `autumn_${year}`;
        } else {
            return `winter_${year}`;
        }
    };

    return {
        // Data
        farms,
        isLoadingFarms,
        selectedFarm,
        plantingDate,
        documentTagsData,

        // Calculated values
        areaMultiplier,
        coverageAmount,
        totalPremium,
        totalDataCost,

        // State
        isSubmitting,
        isFormValid,

        // Actions
        setSelectedFarm,
        setPlantingDate,
        setDocumentTagsData,
        submitPolicy,
    };
};
