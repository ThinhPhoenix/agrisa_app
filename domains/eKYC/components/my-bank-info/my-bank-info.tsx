/**
 * ============================================
 * 🏦 MY BANK INFO SCREEN
 * ============================================
 * Màn hình nhập thông tin ngân hàng để nhận chi trả
 * - Hiển thị card ngân hàng động
 * - Form nhập số tài khoản, tên chủ tài khoản, chọn ngân hàng
 * - Update vào profile thông qua API /me
 */

import { CustomForm, FormField } from "@/components/custom-form";
import { useResultStatus } from "@/components/result-status/useResultStatus";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import { useAuthStore } from "@/domains/auth/stores/auth.store";
import { BankOption, useBank } from "@/domains/shared/hooks/use-bank";
import {
    Box,
    Center,
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
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { ChevronDown, Search } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// ============================================
// 📦 INTERFACES
// ============================================
interface BankFormData {
  account_number: string;
  account_name: string;
  bank_code: string;
}

// ============================================
// 🏦 BANK SELECTOR COMPONENT (With Logo)
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

  // Tìm bank đã chọn
  const selectedBank = bankOptions.find((bank) => bank.value === value);

  // Lọc theo search
  const filteredOptions = bankOptions.filter(
    (bank) =>
      bank.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FormControl isInvalid={!!error} style={{ alignItems: "center", marginBottom: 0, paddingBottom: 0 }}>
      <FormControlLabel style={{ marginBottom: 10, width: 315 }}>
        <FormControlLabelText
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.primary_text,
            letterSpacing: 0.2,
          }}
        >
          Ngân hàng
          <Text style={{ color: colors.error, marginLeft: 4, fontSize: 15 }}>
            *
          </Text>
        </FormControlLabelText>
      </FormControlLabel>

      {/* Selector Trigger */}
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
            width: 315,
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

      {/* Error Message */}
      {error && (
        <FormControlError style={{ marginTop: 8 }}>
          <FormControlErrorText
            style={{ fontSize: 13, color: colors.error }}
          >
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}

      {/* Bank Selection Modal */}
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
            <Text
              fontSize="$lg"
              fontWeight="$bold"
              style={{ color: colors.primary_text }}
            >
              Chọn ngân hàng
            </Text>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>

          <ModalBody style={{ padding: 0 }}>
            <VStack>
              {/* Search Input */}
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
                  <View
                    style={{
                      paddingLeft: 12,
                      justifyContent: "center",
                    }}
                  >
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

              {/* Bank Options List */}
              <ScrollView
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
              >
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
                          backgroundColor: isSelected
                            ? colors.successSoft
                            : "transparent",
                        }}
                      >
                        <HStack
                          alignItems="center"
                          justifyContent="space-between"
                          space="sm"
                        >
                          <HStack alignItems="center" space="md" flex={1}>
                            {/* Bank Logo */}
                            <Image
                              source={{ uri: bank.logo }}
                              alt={bank.shortName}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                              }}
                              resizeMode="contain"
                            />
                            {/* Bank Info */}
                            <VStack flex={1}>
                              <Text
                                fontSize="$sm"
                                fontWeight={isSelected ? "$bold" : "$medium"}
                                color={
                                  isSelected
                                    ? colors.primary
                                    : colors.primary_text
                                }
                                numberOfLines={1}
                              >
                                {bank.shortName}
                              </Text>
                              <Text
                                fontSize="$xs"
                                color={colors.secondary_text}
                                numberOfLines={1}
                              >
                                {bank.name}
                              </Text>
                            </VStack>
                          </HStack>
                          {/* Check Icon */}
                          {isSelected && (
                            <CheckIcon size="sm" color={colors.primary} />
                          )}
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
// 🎨 BANK CARD COMPONENT (Static - No Flip)
// ============================================
interface BankCardProps {
  accountNumber: string;
  accountName: string;
  bankLogo: string;
  bankShortName: string;
  colors: any;
}

function BankCard({
  accountNumber,
  accountName,
  bankLogo,
  bankShortName,
  colors,
}: BankCardProps) {
  // Format account number với khoảng cách và bảo mật (ẩn giữa)
  const formatAccountNumber = (number: string): string => {
    if (!number) return "•••• •••• •••• ••••";
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.length <= 4) {
      return cleaned;
    }
    // Hiển thị 4 số đầu, ẩn giữa, hiện 4 số cuối
    const first4 = cleaned.slice(0, 4);
    const last4 = cleaned.slice(-4);
    const middleLength = Math.max(0, cleaned.length - 8);
    const hiddenMiddle = "•".repeat(middleLength);
    // Format với khoảng cách
    const combined = first4 + hiddenMiddle + last4;
    const groups = combined.match(/.{1,4}/g) || [];
    return groups.join(" ");
  };

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, { backgroundColor: "#1a1a2e" }]}>
        {/* Header với heading và logo ngân hàng */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeading}>{bankShortName || "NGÂN HÀNG"}</Text>
          {bankLogo ? (
            <Image
              source={{ uri: bankLogo }}
              alt="Bank Logo"
              style={styles.bankLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.bankLogoPlaceholder}>
              <Text style={styles.bankLogoText}>BANK</Text>
            </View>
          )}
        </View>

        {/* Chip - Sử dụng View vẽ chip card thay vì image */}
        <View style={styles.chipContainer}>
          <View style={styles.chipOuter}>
            <View style={styles.chipInner}>
              <View style={styles.chipLineH} />
              <View style={styles.chipLineV} />
            </View>
          </View>
        </View>

        {/* Contactless Icon - Sử dụng base64 image như gốc */}
        <Image
          source={{
            uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IEzgIwaKTAAADDklEQVRYw+1XS0iUURQ+f5qPyjQflGRFEEFK76koKGxRbWyVVLSOgsCgwjZBJJYuKogSIoOonUK4q3U0WVBWFPZYiIE6kuArG3VGzK/FfPeMM/MLt99/NuHdfPd888/57jn3nvsQWWj/VcMlvMMd5KRTogqx9iCdIjUUmcGR9ImUYowyP3xNGQJoRLVaZ2DaZf8kyjEJALhI28ELioyiwC+Rc3QZwRYyO/DH51hQgWm6DMIh10KmD4u9O16K49itVoPOAmcGAWWOepXIRScAoJZ2Frro8oN+EyTT6lWkkg6msZfMSR35QTJmjU0g15tIGSJ08ZZMJkJkHpNZgSkyXosS13TkJpZ62mPIJvOSzC1bp8vRhhCakEk7G9/o4gmZdbpsTcKu0m63FbnBP9Qrc15zbkbemfgNDtEOI8NO5L5O9VYyRYgmJayZ9nPaxZrSjW4+F6Uw9yQqIiIZwhp2huQTf6OIvCZyGM6gDJBZbyXifJXr7FZjGXsdxADxI7HUJFB6iWvsIhFpkoiIiGTJfjJfiCuJg2ZEspq9EHGVpYgzKqwJqSAOEwuJQ/pxPvE3cYltJCLdxBLiSKKIE5HxJKcTRNeadxfhDiuYw44zVs1dxKwRk/uCxIiQkxKBsSctRVAge9g1E15EHE6yRUaJecRxcWlukdRIbGFOSZCMWQA/iWauIP3slREHXPyliqBcrrD71AmzZ+rD1Mt2Yr8TZc/UR4/YtFnbijnHi3UrN9vKQ9rPaJf867ZiaqDB+czeKYmd3pNa6fuI75MiC0uXXSR5aEMf7s7a6r/PudVXkjFb/SsrCRfROk0Fx6+H1i9kkTGn/E1vEmt1m089fh+RKdQ5O+xNJPUicUIjO0Dm7HwvErEr0YxeibL1StSh37STafE4I7zcBdRq1DiOkdmlTJVnkQTBTS7X1FYyvfO4piaInKbDCDaT2anLudYXCRFsQBgAcIF2/Okwgvz5+Z4tsw118dzruvIvjhTB+HOuWy8UvovEH6beitBKxDyxm9MmISKCWrzB7bSlaqGlsf0FC0gMjzTg6GgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDItMTNUMDg6MTk6NTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTEzVDA4OjE5OjU2KzAwOjAw0ssWdwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xM1QwODoxOTo1NiswMDowMIXeN6gAAAAASUVORK5CYII=",
          }}
          alt="Contactless"
          style={styles.contactlessIcon}
        />

        {/* Account Number */}
        <Text style={styles.accountNumber}>
          {formatAccountNumber(accountNumber)}
        </Text>

        {/* Account Name */}
        <Text style={styles.accountName}>
          {accountName?.toUpperCase() || "TÊN CHỦ TÀI KHOẢN"}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// 📱 MAIN COMPONENT
// ============================================
export default function MyBankInfoScreen() {
  const { colors } = useAgrisaColors();
  const resultStatus = useResultStatus();
  const formRef = useRef<any>(null);
  const { updateProfile, isUpdating } = useAuthMe();
  const { fetchUserProfile, userProfile } = useAuthStore();

  // Bank hook
  const { bankOptions, isLoading: isBanksLoading, getBankLogo, getBankShortName } = useBank();

  // Form state để hiển thị trên card
  const [formData, setFormData] = useState<BankFormData>({
    account_number: "",
    account_name: "",
    bank_code: "",
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Block hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  // Form fields configuration (không bao gồm bank_code vì dùng custom selector)
  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "account_number",
        label: "Số tài khoản",
        type: "input",
        placeholder: "Nhập số tài khoản",
        required: true,
        onChange: (value: string) => {
          setFormData((prev) => ({ ...prev, account_number: value }));
          if (errors.account_number) {
            setErrors((prev) => ({ ...prev, account_number: "" }));
          }
        },
      },
      {
        name: "account_name",
        label: "Tên chủ tài khoản",
        type: "input",
        placeholder: "Nhập tên chủ tài khoản",
        required: true,
        onChange: (value: string) => {
          setFormData((prev) => ({ ...prev, account_name: value }));
          if (errors.account_name) {
            setErrors((prev) => ({ ...prev, account_name: "" }));
          }
        },
      },
      {
        name: "submit",
        label: "",
        type: "button",
        buttonText: "Xác nhận thông tin",
        variant: "solid",
        size: "lg",
        isSubmit: true,
        buttonLoading: isUpdating,
      },
    ],
    [isUpdating, errors]
  );

  // Handle bank selection
  const handleBankChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, bank_code: value }));
    if (errors.bank_code) {
      setErrors((prev) => ({ ...prev, bank_code: "" }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback((values: Record<string, any>): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank_code) {
      newErrors.bank_code = "Vui lòng chọn ngân hàng!";
    }
    if (!values.account_number) {
      newErrors.account_number = "Vui lòng nhập số tài khoản!";
    }
    if (!values.account_name) {
      newErrors.account_name = "Vui lòng nhập tên chủ tài khoản!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.bank_code]);

  // Handle form submit
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      // Validate
      if (!validateForm(values)) {
        return;
      }

      try {
        console.log("🏦 [MyBankInfo] Submitting bank info:", {
          ...values,
          bank_code: formData.bank_code,
        });

        // Gọi API update profile với thông tin ngân hàng
        await updateProfile({
          account_number: values.account_number,
          account_name: values.account_name,
          bank_code: formData.bank_code, // bank_code = bin từ API
        });

        // Refresh profile
        await fetchUserProfile();

        // Hiển thị success
        resultStatus.showSuccess({
          title: "Cập nhật thành công!",
          message: "Thông tin ngân hàng đã được lưu.",
          subMessage: "Bạn có thể nhận chi trả qua tài khoản này.",
          autoRedirectSeconds: 3,
          autoRedirectRoute: "/settings/verify/status",
          showHomeButton: true,
          lockNavigation: true,
        });
      } catch (error: any) {
        console.error("❌ [MyBankInfo] Error updating bank info:", error);
        resultStatus.showError({
          title: "Cập nhật thất bại",
          message:
            error?.response?.data?.message ||
            "Không thể cập nhật thông tin ngân hàng. Vui lòng thử lại.",
          showHomeButton: true,
          lockNavigation: false,
        });
      }
    },
    [updateProfile, fetchUserProfile, resultStatus, formData.bank_code, validateForm]
  );

  // Loading state
  if (isBanksLoading) {
    return (
      <Center flex={1} bg={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text mt="$4" color={colors.secondary_text}>
          Đang tải danh sách ngân hàng...
        </Text>
      </Center>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <Box flex={1} bg={colors.background}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
        >
        <VStack space="lg" p="$5">
          {/* Header */}
          <VStack space="sm" pt="$4">
            <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary_text}>
              Thông tin ngân hàng
            </Text>
            <Text fontSize="$sm" color={colors.secondary_text}>
              Nhập thông tin tài khoản ngân hàng để nhận chi trả
            </Text>
          </VStack>

          {/* Info Notes - Đơn giản */}
          <VStack space="sm">
            <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_text}>
              Lưu ý:
            </Text>
            <VStack space="xs" pl="$2">
              <HStack space="sm" alignItems="center">
                <Text fontSize="$xs" color={colors.secondary_text}>-</Text>
                <Text fontSize="$sm" color={colors.secondary_text} flex={1}>
                  Tên chủ tài khoản phải đúng với số thẻ mà bạn nhập
                </Text>
              </HStack>
              <HStack space="sm" alignItems="center">
                <Text fontSize="$xs" color={colors.secondary_text}>-</Text>
                <Text fontSize="$sm" color={colors.secondary_text} flex={1}>
                  Kiểm tra kỹ số tài khoản trước khi xác nhận
                </Text>
              </HStack>
              <HStack space="sm" alignItems="center">
                <Text fontSize="$xs" color={colors.secondary_text}>-</Text>
                <Text fontSize="$sm" color={colors.secondary_text} flex={1}>
                  Thông tin tài khoản sẽ được chúng tôi bảo mật và chỉ dùng để chi trả chi trả
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Bank Card Preview */}
          <Center mt="$4" mb="$2">
            <BankCard
              accountNumber={formData.account_number}
              accountName={formData.account_name}
              bankLogo={getBankLogo(formData.bank_code)}
              bankShortName={getBankShortName(formData.bank_code)}
              colors={colors}
            />
          </Center>

          {/* Form */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            borderWidth={1}
            borderColor={colors.frame_border}
            p="$4"
          >
            <VStack space="lg">
              {/* Bank Selector với Logo */}
              <BankSelector
                value={formData.bank_code}
                onChange={handleBankChange}
                bankOptions={bankOptions}
                placeholder="Chọn ngân hàng"
                error={errors.bank_code}
                colors={colors}
              />

              {/* Form còn lại */}
              <CustomForm
                ref={formRef}
                fields={formFields}
                onSubmit={handleSubmit}
                gap={20}
              />
            </VStack>
          </Box>

        </VStack>
      </ScrollView>
    </Box>
    </KeyboardAvoidingView>
  );
}

// ============================================
// 🎨 STYLES
// ============================================
const cardWidth = Math.min(screenWidth - 40, 320);
const cardHeight = cardWidth * 0.63; // Tỷ lệ card chuẩn

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    height: cardHeight,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeading: {
    color: "white",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
  },
  bankLogo: {
    width: 50,
    height: 30,
  },
  bankLogoPlaceholder: {
    width: 50,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  bankLogoText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
  chipContainer: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  chipOuter: {
    width: 45,
    height: 35,
    backgroundColor: "#d4af37",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b8860b",
  },
  chipInner: {
    width: 30,
    height: 22,
    backgroundColor: "#c9a227",
    borderRadius: 3,
    position: "relative",
    overflow: "hidden",
  },
  chipLineH: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#b8860b",
  },
  chipLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 14,
    width: 1,
    backgroundColor: "#b8860b",
  },
  contactlessIcon: {
    position: "absolute",
    top: 55,
    left: 75,
    width: 20,
    height: 20,
    tintColor: "rgba(255,255,255,0.8)",
  },
  accountNumber: {
    position: "absolute",
    bottom: 55,
    left: 20,
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  accountName: {
    position: "absolute",
    bottom: 20,
    left: 20,
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
