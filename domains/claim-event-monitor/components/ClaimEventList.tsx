import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, Pressable, Text, VStack } from "@gluestack-ui/themed";
import {
  Ban,
  Banknote,
  CheckCircle2,
  Clock,
  FileText,
  FileWarning,
  Inbox,
  XCircle,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Animated, RefreshControl } from "react-native";
import { ClaimStatus, ClaimStatusTabs } from "../enums/claim-status.enum";
import { ClaimEvent } from "../models/claim-event-data.models";
import { ClaimEventCard } from "./ClaimEventCard";

interface ClaimEventListProps {
  /** Danh sách claims */
  claims: ClaimEvent[];
  /** Callback khi pull to refresh */
  onRefresh?: () => void;
  /** Trạng thái đang refresh */
  isRefreshing?: boolean;
  /** Trạng thái loading */
  isLoading?: boolean;
  /** Header component tùy chỉnh */
  headerComponent?: React.ReactNode;
  /** Hiển thị message khi không có data */
  emptyMessage?: string;
  /** Có hiển thị tabs filter không */
  showTabs?: boolean;
  /** Tab mặc định được chọn */
  defaultTab?: string;
  /** Callback khi scroll (cho parallax effect) */
  onScroll?: any;
}

/**
 * Component hiển thị danh sách các claim events
 * Hỗ trợ pull to refresh, custom header và tabs filter
 */
export const ClaimEventList: React.FC<ClaimEventListProps> = ({
  claims,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
  headerComponent,
  emptyMessage = "Chưa có yêu cầu bồi thường nào",
  showTabs = true,
  defaultTab = "all",
  onScroll,
}) => {
  const { colors } = useAgrisaColors();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Lọc claims theo tab đang active
  const filteredClaims = useMemo(() => {
    if (activeTab === "all") return claims;
    return claims.filter((claim) => claim.status === activeTab);
  }, [claims, activeTab]);

  // Đếm số lượng claims theo từng status
  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: claims.length };
    ClaimStatusTabs.forEach((tab) => {
      if (tab.value !== "all") {
        counts[tab.value] = claims.filter((c) => c.status === tab.value).length;
      }
    });
    return counts;
  }, [claims]);

  // Lấy icon cho từng tab status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case ClaimStatus.PENDING_PARTNER_REVIEW:
        return Clock;
      case ClaimStatus.APPROVED:
        return CheckCircle2;
      case ClaimStatus.REJECTED:
        return XCircle;
      case ClaimStatus.PAID:
        return Banknote;
      case ClaimStatus.CANCELLED:
        return Ban;
      default:
        return FileText;
    }
  };

  // Lấy màu cho từng tab status
  const getStatusColor = (status: string) => {
    switch (status) {
      case ClaimStatus.PENDING_PARTNER_REVIEW:
        return colors.pending;
      case ClaimStatus.APPROVED:
        return colors.info || colors.primary;
      case ClaimStatus.REJECTED:
        return colors.error;
      case ClaimStatus.PAID:
        return colors.success;
      case ClaimStatus.CANCELLED:
        return colors.muted_text;
      default:
        return colors.primary;
    }
  };

  /**
   * Component hiển thị khi không có claims
   */
  const EmptyState = () => (
    <Box flex={1} justifyContent="center" alignItems="center" py="$16" px="$4">
      <Box
        bg={colors.success}
        p="$6"
        borderRadius="$full"
        mb="$4"
      >
        <Inbox size={48} color={colors.primary_white_text} strokeWidth={1.5} />
      </Box>
      <Text
        fontSize="$lg"
        fontWeight="$semibold"
        color={colors.primary_text}
        textAlign="center"
        mb="$2"
      >
        {emptyMessage}
      </Text>
      <Text
        fontSize="$sm"
        color={colors.secondary_text}
        textAlign="center"
        lineHeight="$lg"
      >
        Các yêu cầu bồi thường sẽ được tạo tự động khi điều kiện kích hoạt được
        phát hiện từ dữ liệu vệ tinh.
      </Text>
    </Box>
  );

  /**
   * Component hiển thị khi đang loading
   */
  const LoadingState = () => (
    <Box flex={1} justifyContent="center" alignItems="center" py="$16">
      <Box
        bg={colors.primarySoft || colors.background}
        p="$6"
        borderRadius="$full"
        mb="$4"
      >
        <FileWarning size={48} color={colors.primary} strokeWidth={1.5} />
      </Box>
      <Text
        fontSize="$lg"
        fontWeight="$semibold"
        color={colors.primary_text}
        textAlign="center"
      >
        Đang tải dữ liệu...
      </Text>
    </Box>
  );

  /**
   * Component Tabs - Style giống history.tsx
   */
  const TabsComponent = () => (
    <HStack
      space="sm"
      p="$4"
      bg={colors.background}
      borderBottomWidth={1}
      borderBottomColor={colors.frame_border}
    >
      {ClaimStatusTabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const TabIcon = getStatusIcon(tab.value);
        const tabColor = getStatusColor(tab.value);
        const count = countByStatus[tab.value] || 0;

        return (
          <Pressable
            key={tab.value}
            flex={1}
            onPress={() => setActiveTab(tab.value)}
          >
            {({ pressed }) => (
              <Box
                bg={isActive ? tabColor : colors.card_surface}
                borderRadius="$lg"
                p="$3"
                alignItems="center"
                opacity={pressed ? 0.7 : 1}
                borderWidth={isActive ? 0 : 1}
                borderColor={colors.frame_border}
                position="relative"
              >
                {/* Count Badge */}
                {count > 0 && (
                  <Box
                    position="absolute"
                    top={-6}
                    right={-6}
                    bg={isActive ? colors.primary_white_text : tabColor}
                    borderRadius="$full"
                    minWidth={20}
                    height={20}
                    alignItems="center"
                    justifyContent="center"
                    px="$1"
                    borderWidth={2}
                    borderColor={colors.background}
                  >
                    <Text
                      fontSize="$xs"
                      fontWeight="$bold"
                      color={isActive ? tabColor : colors.primary_white_text}
                    >
                      {count}
                    </Text>
                  </Box>
                )}

                <TabIcon
                  size={20}
                  color={isActive ? colors.primary_white_text : tabColor}
                  strokeWidth={2}
                />
                <Text
                  fontSize="$xs"
                  fontWeight="$semibold"
                  color={isActive ? colors.primary_white_text : tabColor}
                  mt="$1"
                  textAlign="center"
                >
                  {tab.label}
                </Text>
              </Box>
            )}
          </Pressable>
        );
      })}
    </HStack>
  );

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      {/* Header component tùy chỉnh */}
      {headerComponent}

      {/* Tabs filter */}
      {showTabs && <TabsComponent />}

      {/* Content */}
      <VStack space="md" px="$4" pb="$8">
        {isLoading ? (
          <LoadingState />
        ) : filteredClaims.length === 0 ? (
          <EmptyState />
        ) : (
          filteredClaims.map((claim) => (
            <ClaimEventCard key={claim.id} claim={claim} />
          ))
        )}
      </VStack>
    </Animated.ScrollView>
  );
};
