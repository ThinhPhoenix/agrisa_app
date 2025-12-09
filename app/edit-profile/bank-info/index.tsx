/**
 * ============================================
 * 🏦 CHỈNH SỬA THÔNG TIN NGÂN HÀNG
 * ============================================
 * Trang chỉnh sửa thông tin ngân hàng để nhận bồi thường:
 * - Số tài khoản
 * - Tên chủ tài khoản
 * - Ngân hàng (với logo và combobox)
 * - Hiển thị card ngân hàng preview
 */

import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { UserProfile } from "@/domains/auth/models/auth.models";
import { BankOption, useBank } from "@/domains/shared/hooks/use-bank";
import {
    Box,
    CheckIcon,
    CloseIcon,
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
    HStack,
    Icon,
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
    Text,
    VStack
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { ChevronDown, Search } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// ============================================
// 🏦 BANK SELECTOR COMPONENT
// ============================================
interface BankSelectorProps {
  value: string;
  onChange: (value: string) => void;
  bankOptions: BankOption[];
  placeholder?: string;
  error?: string;
  colors: any;
}

function BankSelector({
  value,
  onChange,
  bankOptions,
  placeholder = "Chọn ngân hàng",
  error,
  colors,
}: BankSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedBank = bankOptions.find((bank) => bank.value === value);

  const filteredOptions = bankOptions.filter(
    (bank) =>
      bank.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FormControl isInvalid={!!error} style={{ marginBottom: 16 }}>
      <FormControlLabel>
        <FormControlLabelText
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.primary_text,
          }}
        >
          Ngân hàng
          <Text style={{ color: colors.error, marginLeft: 4 }}>*</Text>
        </FormControlLabelText>
      </FormControlLabel>

      <Pressable onPress={() => setIsOpen(true)}>
        <View
          style={{
            backgroundColor: colors.background,
            height: 58,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: error ? colors.error : colors.frame_border,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
          }}
        >
          {selectedBank ? (
            <HStack space="sm" alignItems="center" flex={1}>
              <Image
                source={{ uri: selectedBank.logo }}
                alt={selectedBank.shortName}
                style={{ width: 30, height: 30, borderRadius: 4 }}
                resizeMode="contain"
              />
              <Text
                fontSize="$sm"
                fontWeight="$medium"
                color={colors.primary_text}
                numberOfLines={1}
                flex={1}
              >
                {selectedBank.shortName} - {selectedBank.name}
              </Text>
            </HStack>
          ) : (
            <Text style={{ color: colors.muted_text, flex: 1, fontSize: 14 }}>
              {placeholder}
            </Text>
          )}
          <ChevronDown size={18} color={colors.secondary_text} />
        </View>
      </Pressable>

      {error && (
        <FormControlError style={{ marginTop: 8 }}>
          <FormControlErrorText style={{ fontSize: 13, color: colors.error }}>
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchQuery("");
        }}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent
          style={{
            borderRadius: 16,
            maxWidth: 400,
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
            <Text fontSize="$lg" fontWeight="$bold" style={{ color: colors.primary_text }}>
              Chọn ngân hàng
            </Text>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>

          <ModalBody style={{ padding: 0 }}>
            <VStack>
              <View
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.frame_border,
                }}
              >
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <View style={{ paddingLeft: 12, justifyContent: "center" }}>
                    <Search size={18} color={colors.secondary_text} />
                  </View>
                  <InputField
                    placeholder="Tìm kiếm ngân hàng..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      color: colors.primary_text,
                      fontSize: 14,
                    }}
                    placeholderTextColor={colors.muted_text}
                  />
                </Input>
              </View>

              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {filteredOptions.length === 0 ? (
                  <View style={{ padding: 32, alignItems: "center" }}>
                    <Text fontSize="$sm" style={{ color: colors.secondary_text }}>
                      Không tìm thấy ngân hàng
                    </Text>
                  </View>
                ) : (
                  filteredOptions.map((bank) => {
                    const isSelected = value === bank.value;
                    return (
                      <Pressable
                        key={bank.value}
                        onPress={() => {
                          onChange(bank.value);
                          setIsOpen(false);
                          setSearchQuery("");
                        }}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.frame_border,
                          backgroundColor: isSelected ? colors.successSoft : "transparent",
                        }}
                      >
                        <HStack alignItems="center" justifyContent="space-between" space="sm">
                          <HStack alignItems="center" space="md" flex={1}>
                            <Image
                              source={{ uri: bank.logo }}
                              alt={bank.shortName}
                              style={{ width: 40, height: 40, borderRadius: 8 }}
                              resizeMode="contain"
                            />
                            <VStack flex={1}>
                              <Text
                                fontSize="$sm"
                                fontWeight={isSelected ? "$bold" : "$medium"}
                                color={isSelected ? colors.primary : colors.primary_text}
                                numberOfLines={1}
                              >
                                {bank.shortName}
                              </Text>
                              <Text fontSize="$xs" color={colors.secondary_text} numberOfLines={1}>
                                {bank.name}
                              </Text>
                            </VStack>
                          </HStack>
                          {isSelected && <CheckIcon size="sm" color={colors.primary} />}
                        </HStack>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </FormControl>
  );
}

// ============================================
// 💳 BANK CARD PREVIEW
// ============================================
interface BankCardProps {
  accountNumber: string;
  accountName: string;
  bankLogo: string;
  bankShortName: string;
  colors: any;
}

function BankCard({ accountNumber, accountName, bankLogo, bankShortName, colors }: BankCardProps) {
  const formatAccountNumber = (number: string): string => {
    if (!number) return "•••• •••• •••• ••••";
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.length <= 4) return cleaned;
    
    const first4 = cleaned.slice(0, 4);
    const last4 = cleaned.slice(-4);
    const middleLength = Math.max(0, cleaned.length - 8);
    const hiddenMiddle = "•".repeat(middleLength);
    const combined = first4 + hiddenMiddle + last4;
    const groups = combined.match(/.{1,4}/g) || [];
    return groups.join(" ");
  };

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, { backgroundColor: "#1a1a2e" }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeading}>{bankShortName || "NGÂN HÀNG"}</Text>
          {bankLogo ? (
            <Image
              source={{ uri: bankLogo }}
              alt="Bank Logo"
              style={styles.bankLogo}
              resizeMode="contain"
            />
          ) : null}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.accountNumberContainer}>
            <Text style={styles.accountLabel}>Số tài khoản</Text>
            <Text style={styles.accountNumber}>{formatAccountNumber(accountNumber)}</Text>
          </View>

          <View style={styles.accountNameContainer}>
            <Text style={styles.accountLabel}>Chủ tài khoản</Text>
            <Text style={styles.accountName}>{accountName || "NGUYEN VAN A"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function BankInfoScreen() {
  const { colors } = useAgrisaColors();
  const { updateProfile, isUpdating } = useAuthMe();
  const { bankOptions, isLoading: isBankLoading, getBankByCode } = useBank();

  // Để tất cả field trống cho user tự điền
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedBank = getBankByCode(bankCode);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!accountNumber.trim()) {
      newErrors.account_number = "Vui lòng nhập số tài khoản";
    }

    if (!accountName.trim()) {
      newErrors.account_name = "Vui lòng nhập tên chủ tài khoản";
    }

    if (!bankCode) {
      newErrors.bank_code = "Vui lòng chọn ngân hàng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const updateData: Partial<UserProfile> = {
        account_number: accountNumber.trim(),
        account_name: accountName.trim().toUpperCase(),
        bank_code: bankCode,
      };

      await updateProfile(updateData);

      Alert.alert("Thành công", "Cập nhật thông tin ngân hàng thành công!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể cập nhật thông tin ngân hàng!");
    }
  };

  if (isBankLoading) {
    return (
      <>
        <AgrisaHeader title="Thông tin ngân hàng" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.secondary_text }}>Đang tải danh sách ngân hàng...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <AgrisaHeader title="Thông tin ngân hàng" />
      <ScrollView flex={1} bg={colors.background}>
        <VStack p="$4" space="lg" pb="$8">
          {/* Header */}
          <Box>
            <Text fontSize="$xl" fontWeight="$bold" color={colors.primary_text}>
              Thông tin ngân hàng
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text} mt="$2">
              Vui lòng cung cấp thông tin tài khoản ngân hàng của bạn. Thông tin này sẽ được sử dụng để chi trả bồi thường bảo hiểm khi có sự cố.
            </Text>
          </Box>

          {/* Bank Card Preview */}
          {accountNumber && accountName && bankCode && (
            <BankCard
              accountNumber={accountNumber}
              accountName={accountName}
              bankLogo={selectedBank?.logo || ""}
              bankShortName={selectedBank?.shortName || ""}
              colors={colors}
            />
          )}

          {/* Form */}
          <Box
            bg={colors.card_surface}
            borderRadius="$2xl"
            p="$5"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            elevation={5}
          >
            <VStack space="md">
              {/* Số tài khoản */}
              <FormControl isInvalid={!!errors.account_number}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Số tài khoản <Text style={{ color: colors.error }}>*</Text>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.account_number ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    value={accountNumber}
                    onChangeText={(text) => {
                      setAccountNumber(text);
                      if (errors.account_number) setErrors({ ...errors, account_number: "" });
                    }}
                    keyboardType="numeric"
                    style={{ paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.account_number && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.account_number}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Nhập chính xác số tài khoản để nhận tiền bồi thường
                </Text>
              </FormControl>

              {/* Tên chủ tài khoản */}
              <FormControl isInvalid={!!errors.account_name}>
                <FormControlLabel>
                  <FormControlLabelText style={{ fontSize: 15, fontWeight: "600", color: colors.primary_text }}>
                    Tên chủ tài khoản <Text style={{ color: colors.error }}>*</Text>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: errors.account_name ? colors.error : colors.frame_border,
                    backgroundColor: colors.background,
                  }}
                >
                  <InputField
                    value={accountName}
                    onChangeText={(text) => {
                      setAccountName(text.toUpperCase());
                      if (errors.account_name) setErrors({ ...errors, account_name: "" });
                    }}
                    autoCapitalize="characters"
                    style={{ paddingHorizontal: 12, paddingVertical: 12, color: colors.primary_text }}
                  />
                </Input>
                {errors.account_name && (
                  <FormControlError>
                    <FormControlErrorText style={{ color: colors.error }}>{errors.account_name}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text fontSize="$xs" color={colors.secondary_text} mt="$1">
                  Viết hoa không dấu, phải trùng với tên trên thẻ ngân hàng
                </Text>
              </FormControl>

              {/* Ngân hàng */}
              <BankSelector
                value={bankCode}
                onChange={(value) => {
                  setBankCode(value);
                  if (errors.bank_code) setErrors({ ...errors, bank_code: "" });
                }}
                bankOptions={bankOptions}
                error={errors.bank_code}
                colors={colors}
              />

              {/* Buttons */}
              <VStack space="sm" mt="$4">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isUpdating}
                  style={{
                    backgroundColor: isUpdating ? colors.frame_border : colors.primary,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Cập nhật thông tin</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.frame_border,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.primary_text, fontSize: 16, fontWeight: "600" }}>Hủy</Text>
                </TouchableOpacity>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  card: {
    width: screenWidth - 48,
    height: 200,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },
  bankLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  accountNumberContainer: {
    marginBottom: 12,
  },
  accountLabel: {
    fontSize: 10,
    color: "#ffffff",
    opacity: 0.7,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 2,
  },
  accountNameContainer: {},
  accountName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 1,
  },
});
