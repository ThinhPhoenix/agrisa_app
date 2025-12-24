import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useInsurancePartner } from "@/domains/insurance-partner/hooks/use-insurance-partner";
import { useToast } from "@/domains/shared/hooks/useToast";
import { Utils } from "@/libs/utils/utils"; // ✅ THÊM IMPORT
import {
    Badge,
    BadgeText,
    Box,
    CheckIcon,
    HStack,
    Image,
    Input,
    InputField,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    Pressable,
    ScrollView,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Leaf,
    Search,
    Shield,
    XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import { usePolicy } from "../hooks/use-policy";
import type { PublicBasePolicyResponse } from "../models/policy.models";

// ============= MAIN COMPONENT =============

export default function PublicBasePolicyScreen({
    headerComponent,
    onScroll,
}: {
    headerComponent?: React.ReactNode;
    onScroll?: any;
}) {
    const { colors } = useAgrisaColors();
    const toast = useToast();
    const { getPublicBasePolicy } = usePolicy();

    // Insurance partners for filter
    const { getInsurancePartner } = useInsurancePartner();
    const {
        data: partnersData,
        isLoading: partnersLoading,
        isError: partnersError,
    } = getInsurancePartner();

    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
        null
    );
    const [selectedCropType, setSelectedCropType] = useState<string | null>(
        null
    );
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [providerSearch, setProviderSearch] = useState("");

    const partners = useMemo(() => {
        if (!partnersData?.success || !Array.isArray(partnersData.data))
            return [];
        return partnersData.data;
    }, [partnersData]);

    const filteredPartners = useMemo(() => {
        if (!providerSearch) return partners;
        return partners.filter((p) =>
            p.partner_display_name
                .toLowerCase()
                .includes(providerSearch.toLowerCase())
        );
    }, [partners, providerSearch]);

    const { data, isLoading, isFetching, isError, refetch, error } =
        getPublicBasePolicy();

    useEffect(() => {
        if (isError) {
            console.error("❌ [PublicBasePolicy] Lỗi tải chính sách:", error);
        }
    }, [isError, error, toast]);

    const policies: PublicBasePolicyResponse[] = useMemo(
        () => (data?.data as PublicBasePolicyResponse[]) ?? [],
        [data]
    );

    const isRefreshing = isFetching && !isLoading;

    // Apply filters to policies
    const policiesToShow = useMemo(() => {
        return policies.filter((p) => {
            if (
                selectedProviderId &&
                p.insurance_provider_id !== selectedProviderId
            )
                return false;
            if (selectedCropType && p.crop_type !== selectedCropType)
                return false;
            return true;
        });
    }, [policies, selectedProviderId, selectedCropType]);

    return (
        <ScrollView
            bg={colors.background}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={refetch}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                />
            }
        >
            <VStack space="lg" pb="$8" px={0}>
                {/* Optional Header Component (e.g., Cover Image) - Full Width */}
                {headerComponent}

                {/* Content with padding */}
                <VStack space="lg" px="$4">
                    {/* Header */}
                    <VStack space="xs">
                        <Text
                            fontSize="$2xl"
                            fontWeight="$bold"
                            color={colors.primary_text}
                        >
                            Chương trình bảo hiểm
                        </Text>
                        <Text fontSize="$sm" color={colors.secondary_text}>
                            Khám phá các chương trình bảo hiểm nông nghiệp được
                            cung cấp
                        </Text>
                    </VStack>

                    {/* Filters: Provider + Crop Type */}
                    <VStack space="sm">
                        <HStack space="sm" alignItems="center">
                            {/* Provider Selector Trigger */}
                            <Pressable
                                onPress={() => setIsProviderModalOpen(true)}
                            >
                                <Box
                                    style={{
                                        height: 48,
                                        paddingHorizontal: 12,
                                        borderRadius: 8,
                                        borderWidth: 2,
                                        borderColor: colors.frame_border,
                                        backgroundColor: colors.background,
                                        justifyContent: "center",
                                        minWidth: 150,
                                    }}
                                >
                                    <HStack alignItems="center" space="sm">
                                        <Text
                                            fontSize="$sm"
                                            color={colors.primary_text}
                                            flex={1}
                                            numberOfLines={1}
                                        >
                                            {selectedProviderId
                                                ? partners.find(
                                                      (p) =>
                                                          p.partner_id ===
                                                          selectedProviderId
                                                  )?.partner_display_name
                                                : "Nhà cung cấp"}
                                        </Text>
                                        <ChevronDown
                                            size={16}
                                            color={colors.secondary_text}
                                        />
                                    </HStack>
                                </Box>
                            </Pressable>

                            {/* Crop Type Selector Trigger */}
                            <Pressable onPress={() => setIsCropModalOpen(true)}>
                                <Box
                                    style={{
                                        height: 48,
                                        paddingHorizontal: 12,
                                        borderRadius: 8,
                                        borderWidth: 2,
                                        borderColor: colors.frame_border,
                                        backgroundColor: colors.background,
                                        justifyContent: "center",
                                        minWidth: 120,
                                    }}
                                >
                                    <HStack alignItems="center" space="sm">
                                        <Text
                                            fontSize="$sm"
                                            color={colors.primary_text}
                                            flex={1}
                                            numberOfLines={1}
                                        >
                                            {selectedCropType === "rice"
                                                ? "Lúa"
                                                : selectedCropType === "coffee"
                                                  ? "Cà phê"
                                                  : "Loại cây"}
                                        </Text>
                                        <ChevronDown
                                            size={16}
                                            color={colors.secondary_text}
                                        />
                                    </HStack>
                                </Box>
                            </Pressable>

                            {/* Clear filters quick action */}
                            {(selectedProviderId || selectedCropType) && (
                                <Pressable
                                    onPress={() => {
                                        setSelectedProviderId(null);
                                        setSelectedCropType(null);
                                    }}
                                >
                                    <Box style={{ paddingHorizontal: 8 }}>
                                        <Text
                                            fontSize="$sm"
                                            color={colors.primary}
                                            fontWeight="$medium"
                                        >
                                            Xóa
                                        </Text>
                                    </Box>
                                </Pressable>
                            )}
                        </HStack>

                        {/* Provider Modal */}
                        <Modal
                            isOpen={isProviderModalOpen}
                            onClose={() => setIsProviderModalOpen(false)}
                            size="lg"
                        >
                            <ModalBackdrop />
                            <ModalContent
                                style={{
                                    borderRadius: 16,
                                    maxWidth: 420,
                                    maxHeight: "85%",
                                    backgroundColor: colors.background,
                                }}
                            >
                                <ModalHeader
                                    style={{
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.frame_border,
                                        paddingVertical: 16,
                                    }}
                                >
                                    <Text
                                        fontSize="$lg"
                                        fontWeight="$bold"
                                        style={{ color: colors.primary_text }}
                                    >
                                        Chọn nhà cung cấp
                                    </Text>
                                    <ModalCloseButton />
                                </ModalHeader>
                                <ModalBody style={{ padding: 0 }}>
                                    {/* Loading / Error */}
                                    {partnersLoading ? (
                                        <Box py="$6" alignItems="center">
                                            <Spinner
                                                size="small"
                                                color={colors.primary}
                                            />
                                        </Box>
                                    ) : partnersError ? (
                                        <Box p="$4">
                                            <Text
                                                fontSize="$sm"
                                                color={colors.error}
                                            >
                                                Không thể tải danh sách đối tác
                                            </Text>
                                        </Box>
                                    ) : partners.length === 0 ? (
                                        <Box p="$4">
                                            <Text
                                                fontSize="$sm"
                                                color={colors.secondary_text}
                                            >
                                                Không có nhà cung cấp
                                            </Text>
                                        </Box>
                                    ) : (
                                        <VStack>
                                            {/* Search Input */}
                                            <Box
                                                style={{
                                                    padding: 12,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor:
                                                        colors.frame_border,
                                                }}
                                            >
                                                <Input
                                                    style={{
                                                        borderRadius: 8,
                                                        borderWidth: 2,
                                                        borderColor:
                                                            colors.frame_border,
                                                        backgroundColor:
                                                            colors.background,
                                                    }}
                                                >
                                                    <Box
                                                        style={{
                                                            paddingLeft: 12,
                                                            justifyContent:
                                                                "center",
                                                        }}
                                                    >
                                                        <Search
                                                            size={18}
                                                            color={
                                                                colors.secondary_text
                                                            }
                                                        />
                                                    </Box>
                                                    <InputField
                                                        placeholder="Tìm kiếm nhà cung cấp..."
                                                        value={providerSearch}
                                                        onChangeText={
                                                            setProviderSearch
                                                        }
                                                        style={{
                                                            paddingHorizontal: 12,
                                                            paddingVertical: 12,
                                                            color: colors.primary_text,
                                                            fontSize: 14,
                                                        }}
                                                        placeholderTextColor={
                                                            colors.muted_text
                                                        }
                                                    />
                                                </Input>
                                            </Box>

                                            <ScrollView
                                                style={{ maxHeight: 400 }}
                                                showsVerticalScrollIndicator={
                                                    false
                                                }
                                            >
                                                <VStack>
                                                    {filteredPartners.map(
                                                        (p) => {
                                                            const isSelected =
                                                                selectedProviderId ===
                                                                p.partner_id;
                                                            return (
                                                                <Pressable
                                                                    key={
                                                                        p.partner_id
                                                                    }
                                                                    onPress={() => {
                                                                        setSelectedProviderId(
                                                                            p.partner_id
                                                                        );
                                                                        setIsProviderModalOpen(
                                                                            false
                                                                        );
                                                                        setProviderSearch(
                                                                            ""
                                                                        );
                                                                    }}
                                                                >
                                                                    <HStack
                                                                        alignItems="center"
                                                                        justifyContent="space-between"
                                                                        space="sm"
                                                                        style={{
                                                                            paddingVertical: 12,
                                                                            paddingHorizontal: 16,
                                                                            borderBottomWidth: 1,
                                                                            borderBottomColor:
                                                                                colors.frame_border,
                                                                            backgroundColor:
                                                                                isSelected
                                                                                    ? colors.successSoft
                                                                                    : "transparent",
                                                                        }}
                                                                    >
                                                                        <HStack
                                                                            alignItems="center"
                                                                            space="md"
                                                                            flex={
                                                                                1
                                                                            }
                                                                        >
                                                                            <Box
                                                                                w={
                                                                                    40
                                                                                }
                                                                                h={
                                                                                    40
                                                                                }
                                                                                borderRadius="$lg"
                                                                                overflow="hidden"
                                                                                bg={
                                                                                    colors.background
                                                                                }
                                                                                alignItems="center"
                                                                                justifyContent="center"
                                                                                borderWidth={
                                                                                    1
                                                                                }
                                                                                borderColor={
                                                                                    colors.frame_border
                                                                                }
                                                                            >
                                                                                {p.partner_logo_url ? (
                                                                                    <Image
                                                                                        source={{
                                                                                            uri: p.partner_logo_url,
                                                                                        }}
                                                                                        alt={
                                                                                            p.partner_display_name
                                                                                        }
                                                                                        style={{
                                                                                            width: 40,
                                                                                            height: 40,
                                                                                        }}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                ) : (
                                                                                    <Building2
                                                                                        size={
                                                                                            20
                                                                                        }
                                                                                        color={
                                                                                            colors.muted_text
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </Box>

                                                                            <VStack
                                                                                flex={
                                                                                    1
                                                                                }
                                                                            >
                                                                                <Text
                                                                                    fontSize="$sm"
                                                                                    fontWeight={
                                                                                        isSelected
                                                                                            ? "$bold"
                                                                                            : "$medium"
                                                                                    }
                                                                                    color={
                                                                                        isSelected
                                                                                            ? colors.primary
                                                                                            : colors.primary_text
                                                                                    }
                                                                                    numberOfLines={
                                                                                        1
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        p.partner_display_name
                                                                                    }
                                                                                </Text>
                                                                            </VStack>
                                                                        </HStack>

                                                                        {isSelected && (
                                                                            <CheckIcon
                                                                                size="sm"
                                                                                color={
                                                                                    colors.primary
                                                                                }
                                                                            />
                                                                        )}
                                                                    </HStack>
                                                                </Pressable>
                                                            );
                                                        }
                                                    )}
                                                </VStack>
                                            </ScrollView>
                                        </VStack>
                                    )}
                                </ModalBody>
                            </ModalContent>
                        </Modal>

                        {/* Crop Modal */}
                        <Modal
                            isOpen={isCropModalOpen}
                            onClose={() => setIsCropModalOpen(false)}
                            size="sm"
                        >
                            <ModalBackdrop />
                            <ModalContent
                                style={{
                                    borderRadius: 16,
                                    maxWidth: 320,
                                    backgroundColor: colors.background,
                                }}
                            >
                                <ModalHeader
                                    style={{
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.frame_border,
                                        paddingVertical: 12,
                                    }}
                                >
                                    <Text
                                        fontSize="$lg"
                                        fontWeight="$bold"
                                        style={{ color: colors.primary_text }}
                                    >
                                        Loại cây
                                    </Text>
                                    <ModalCloseButton />
                                </ModalHeader>
                                <ModalBody style={{ padding: 0 }}>
                                    <VStack>
                                        {[
                                            { value: null, label: "Tất cả" },
                                            { value: "rice", label: "Lúa" },
                                            {
                                                value: "coffee",
                                                label: "Cà phê",
                                            },
                                        ].map((opt) => {
                                            const isSelected =
                                                selectedCropType === opt.value;
                                            return (
                                                <Pressable
                                                    key={String(opt.value)}
                                                    onPress={() => {
                                                        setSelectedCropType(
                                                            opt.value as
                                                                | string
                                                                | null
                                                        );
                                                        setIsCropModalOpen(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    <Box
                                                        style={{
                                                            paddingVertical: 12,
                                                            paddingHorizontal: 16,
                                                            borderBottomWidth: 1,
                                                            borderBottomColor:
                                                                colors.frame_border,
                                                            backgroundColor:
                                                                isSelected
                                                                    ? colors.successSoft
                                                                    : "transparent",
                                                        }}
                                                    >
                                                        <Text
                                                            fontSize="$sm"
                                                            color={
                                                                isSelected
                                                                    ? colors.primary
                                                                    : colors.primary_text
                                                            }
                                                            fontWeight={
                                                                isSelected
                                                                    ? "$bold"
                                                                    : "$medium"
                                                            }
                                                        >
                                                            {opt.label}
                                                        </Text>
                                                    </Box>
                                                </Pressable>
                                            );
                                        })}
                                    </VStack>
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                    </VStack>

                    {/* Loading State */}
                    {isLoading ? (
                        <Box
                            alignItems="center"
                            justifyContent="center"
                            py="$10"
                        >
                            <Spinner size="large" color={colors.primary} />
                            <Text
                                color={colors.secondary_text}
                                fontSize="$sm"
                                mt="$3"
                            >
                                Đang tải bảo hiểm ...
                            </Text>
                        </Box>
                    ) : policiesToShow.length === 0 ? (
                        /* Empty State */
                        <Box
                            borderWidth={1}
                            borderColor={colors.frame_border}
                            borderRadius="$xl"
                            p="$6"
                            bg={colors.card_surface}
                            alignItems="center"
                        >
                            <Shield
                                size={48}
                                color={colors.muted_text}
                                strokeWidth={1.5}
                            />
                            <Text
                                fontSize="$lg"
                                fontWeight="$semibold"
                                color={colors.primary_text}
                                mt="$3"
                            >
                                Chưa có bảo hiểm
                            </Text>
                            <Text
                                fontSize="$sm"
                                color={colors.secondary_text}
                                textAlign="center"
                                mt="$1"
                            >
                                Không có chương trình phù hợp với bộ lọc
                            </Text>
                        </Box>
                    ) : (
                        /* Policy Cards */
                        <VStack space="md">
                            {policiesToShow.map((policy) => (
                                <PolicyCard
                                    key={policy.id}
                                    policy={policy}
                                    colors={colors}
                                />
                            ))}
                        </VStack>
                    )}
                </VStack>
            </VStack>
        </ScrollView>
    );
}

// ============= POLICY CARD COMPONENT =============

type ColorSet = ReturnType<typeof useAgrisaColors>["colors"];

const PolicyCard = ({
    policy,
    colors,
}: {
    policy: PublicBasePolicyResponse;
    colors: ColorSet;
}) => {
    const { getInsurancePartnerDetail } = useInsurancePartner();

    // Lấy thông tin insurance partner
    const { data: partnerData, isLoading: partnerLoading } =
        getInsurancePartnerDetail(policy.insurance_provider_id);

    const handlePress = () => {
        router.push({
            pathname: "/(farmer)/form-policy/[id]",
            params: { policyId: policy.id },
        });
    };

    return (
        <Pressable onPress={handlePress}>
            {({ pressed }) => (
                <Box
                    borderWidth={1}
                    borderColor={pressed ? colors.primary : colors.frame_border}
                    borderRadius="$2xl"
                    bg={colors.card_surface}
                    overflow="hidden"
                    opacity={pressed ? 0.95 : 1}
                    sx={{
                        _web: {
                            transition: "all 0.2s",
                            ":hover": {
                                borderColor: colors.primary,
                                shadowColor: colors.shadow,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 12,
                                transform: [{ translateY: -2 }],
                            },
                        },
                        shadowColor: colors.shadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <VStack space="md" p="$4">
                        {/* Header: Product Name + Status */}
                        <HStack
                            justifyContent="space-between"
                            alignItems="flex-start"
                            mb="$1"
                        >
                            <VStack flex={1} mr="$3" space="xs">
                                <Text
                                    fontSize="$xl"
                                    fontWeight="$bold"
                                    color={colors.primary_text}
                                    lineHeight="$xl"
                                >
                                    {policy.product_name}
                                </Text>
                                {/* Crop Type */}
                                <HStack space="xs" alignItems="center">
                                    <Leaf
                                        size={14}
                                        color={colors.success}
                                        strokeWidth={2}
                                    />
                                    <Text
                                        fontSize="$xs"
                                        color={colors.secondary_text}
                                        fontWeight="$medium"
                                    >
                                        {Utils.getCropLabel(policy.crop_type)}
                                    </Text>
                                </HStack>
                                {/* Insurance Partner */}
                                <HStack space="xs" alignItems="center">
                                    <Building2
                                        size={14}
                                        color={colors.primary}
                                        strokeWidth={2}
                                    />
                                    {partnerLoading ? (
                                        <Spinner
                                            size="small"
                                            color={colors.primary}
                                        />
                                    ) : (
                                        <Text
                                            fontSize="$xs"
                                            color={colors.muted_text}
                                            fontWeight="$medium"
                                            numberOfLines={1}
                                        >
                                            {partnerData?.data
                                                ?.partner_display_name ||
                                                policy.insurance_provider_id}
                                        </Text>
                                    )}
                                </HStack>
                            </VStack>
                            <StatusBadge
                                status={policy.status}
                                colors={colors}
                            />
                        </HStack>

                        {/* Hero Info Section - Premium & Duration */}
                        <HStack
                            space="md"
                            bg={colors.background}
                            borderRadius="$xl"
                            p="$4"
                            borderWidth={2}
                            borderColor={colors.primary}
                            alignItems="center"
                            sx={{
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 6,
                            }}
                        >
                            {/* Left: Premium */}
                            <VStack flex={1} space="xs">
                                <HStack space="xs" alignItems="center" mb="$1">
                                    <Shield
                                        size={16}
                                        color={colors.primary}
                                        strokeWidth={2.5}
                                    />
                                    <Text
                                        fontSize="$2xs"
                                        color={colors.muted_text}
                                        fontWeight="$semibold"
                                        textTransform="uppercase"
                                        letterSpacing={0.5}
                                    >
                                        Phí bồi thường
                                    </Text>
                                </HStack>
                                <Text
                                    fontSize="$2xl"
                                    fontWeight="$bold"
                                    color={colors.primary}
                                    lineHeight="$2xl"
                                >
                                    {Utils.formatCurrency(
                                        policy.fix_premium_amount
                                    )}
                                </Text>
                                <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                >
                                    {policy.is_per_hectare
                                        ? "/ hecta"
                                        : "Phí cố định"}
                                </Text>
                            </VStack>

                            {/* Divider */}
                            <Box
                                w="$0.5"
                                h="$20"
                                bg={colors.frame_border}
                                borderRadius="$full"
                            />

                            {/* Right: Duration */}
                            <VStack flex={1} space="xs" alignItems="flex-end">
                                <HStack space="xs" alignItems="center" mb="$1">
                                    <Text
                                        fontSize="$2xs"
                                        color={colors.muted_text}
                                        fontWeight="$semibold"
                                        textTransform="uppercase"
                                        letterSpacing={0.5}
                                    >
                                        Thời hạn BH
                                    </Text>
                                    <Clock
                                        size={16}
                                        color={colors.success}
                                        strokeWidth={2.5}
                                    />
                                </HStack>
                                <Text
                                    fontSize="$2xl"
                                    fontWeight="$bold"
                                    color={colors.success}
                                    lineHeight="$2xl"
                                    textAlign="right"
                                >
                                    {policy.coverage_duration_days}
                                </Text>
                                <Text
                                    fontSize="$xs"
                                    color={colors.secondary_text}
                                    textAlign="right"
                                >
                                    ngày bảo vệ
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Timeline - Enrollment Period */}
                        <Box
                            bg={colors.background}
                            borderRadius="$lg"
                            px="$3"
                            py="$2.5"
                            borderWidth={1}
                            borderColor={colors.frame_border}
                        >
                            <HStack space="sm" alignItems="center">
                                <Calendar
                                    size={14}
                                    color={colors.info}
                                    strokeWidth={2}
                                />
                                <VStack flex={1}>
                                    <Text
                                        fontSize="$2xs"
                                        color={colors.muted_text}
                                        mb="$0.5"
                                    >
                                        Thời gian đăng ký
                                    </Text>
                                    <HStack space="xs" alignItems="center">
                                        <Text
                                            fontSize="$xs"
                                            fontWeight="$bold"
                                            color={colors.primary_text}
                                        >
                                            {Utils.formatDateForMS(
                                                policy.enrollment_start_day
                                            )}
                                        </Text>
                                        <Text
                                            fontSize="$xs"
                                            color={colors.muted_text}
                                        >
                                            →
                                        </Text>
                                        <Text
                                            fontSize="$xs"
                                            fontWeight="$bold"
                                            color={colors.primary_text}
                                        >
                                            {Utils.formatDateForMS(
                                                policy.enrollment_end_day
                                            )}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </Box>

                        {/* Footer: Update & Action */}
                        <HStack
                            justifyContent="space-between"
                            alignItems="center"
                            pt="$2"
                            borderTopWidth={1}
                            borderTopColor={colors.frame_border}
                        >
                            <Text fontSize="$2xs" color={colors.muted_text}>
                                Cập nhật{" "}
                                {Utils.formatStringVietnameseDateTime(
                                    new Date(policy.updated_at)
                                )}
                            </Text>

                            <HStack space="xs" alignItems="center">
                                <Text
                                    fontSize="$sm"
                                    fontWeight="$bold"
                                    color={colors.primary}
                                >
                                    Chi tiết
                                </Text>
                                <ChevronRight
                                    size={18}
                                    color={colors.primary}
                                    strokeWidth={2.5}
                                />
                            </HStack>
                        </HStack>
                    </VStack>
                </Box>
            )}
        </Pressable>
    );
};

// ============= SUB-COMPONENTS =============

const StatusBadge = ({
    status,
    colors,
}: {
    status: PublicBasePolicyResponse["status"];
    colors: ColorSet;
}) => {
    const statusConfig = {
        active: {
            icon: CheckCircle2,
            bg: colors.successSoft,
            text: colors.success,
            label: "Đang bán",
        },
        inactive: {
            icon: XCircle,
            bg: colors.errorSoft,
            text: colors.error,
            label: "Ngừng bán",
        },
        pending: {
            icon: Clock,
            bg: colors.warningSoft,
            text: colors.pending,
            label: "Chờ duyệt",
        },
        suspended: {
            icon: XCircle,
            bg: colors.warningSoft,
            text: colors.warning,
            label: "Tạm ngưng",
        },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
        <Badge
            bg={config.bg}
            borderRadius="$full"
            px="$2.5"
            py="$1"
            borderWidth={1}
            borderColor={config.text}
        >
            <HStack space="xs" alignItems="center">
                <IconComponent
                    size={12}
                    color={config.text}
                    strokeWidth={2.5}
                />
                <BadgeText
                    color={config.text}
                    fontSize="$2xs"
                    fontWeight="$bold"
                    textTransform="uppercase"
                    letterSpacing={0.5}
                >
                    {config.label}
                </BadgeText>
            </HStack>
        </Badge>
    );
};
