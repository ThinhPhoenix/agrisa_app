import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  // Thêm components mới cho combo box
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  Text,
  View,
} from "@gluestack-ui/themed";
import {
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
  IdCard,
  Mail,
  MapPin,
  Phone,
  User,
  UserPlus,
} from "lucide-react-native";
import React, { use, useState } from "react";
import { Control, Controller } from "react-hook-form";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuthForm } from "../../hooks/use-auth-form";
import { SignUpPayloadSchema } from "../../schemas/auth.schema";
// Import cho date picker
import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignUpComponentUI = () => {
  const { colors } = useAgrisaColors();
  const [showPassword, setShowPassword] = useState(false);

  // State cho combo box giới tính
  const [showGenderSelection, setShowGenderSelection] = useState(false);

  // State cho date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(1990, 0, 15)); // Default date

  // Sử dụng hook auth form cho Agrisa
  const { form, onSubmit, isLoading, error, reset, clearErrors } = useAuthForm({
    type: "sign-up",
  });

  const signUpFormControl = form.control as Control<SignUpPayloadSchema>;

  // Mapping giới tính tiếng Việt -> tiếng Anh (cho payload)
  const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
  ];

  // Lấy label tiếng Việt từ value tiếng Anh
  const getGenderLabel = (value: string): string => {
    const option = genderOptions.find((opt) => opt.value === value);
    return option ? option.label : "Chọn giới tính";
  };

  // Helper functions cho format (giữ nguyên)
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, "").replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      return "+84" + cleaned.substring(1);
    }

    if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
      return "+" + cleaned;
    }

    if (cleaned.startsWith("+84")) {
      return cleaned;
    }

    if (cleaned.length >= 9 && cleaned.length <= 10) {
      return "+84" + cleaned;
    }

    return phone;
  };

  const formatCCCD = (value: string): string => {
    return value.replace(/\D/g, "").slice(0, 12);
  };

  // Helper format date để hiển thị trong input (DD/MM/YYYY - dễ đọc cho nông dân)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";

    try {
      // Nếu là format YYYY-MM-DD, chuyển sang DD/MM/YYYY
      if (dateString.includes("-") && dateString.length === 10) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      }

      return dateString;
    } catch {
      return dateString;
    }
  };

  // Helper chuyển Date object thành string YYYY-MM-DD (cho payload)
  const formatDateForPayload = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Xử lý khi user chọn date từ picker
  const handleDateChange = (event: any, date?: Date, field?: any) => {
    setShowDatePicker(false);

    if (date && field) {
      // Validate tuổi hợp lệ (18-80 tuổi)
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();

      if (age < 18) {
        Alert.alert(
          "Độ tuổi không hợp lệ",
          "Bạn phải từ 18 tuổi trở lên để đăng ký bảo hiểm nông nghiệp Agrisa.",
          [{ text: "Đã hiểu" }]
        );
        return;
      }

      if (age > 80) {
        Alert.alert(
          "Độ tuổi không hợp lệ",
          "Độ tuổi tối đa để tham gia Agrisa là 80 tuổi.",
          [{ text: "Đã hiểu" }]
        );
        return;
      }

      setSelectedDate(date);
      // Gửi về backend format YYYY-MM-DD
      const formattedDate = formatDateForPayload(date);
      field.onChange(formattedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 20,
            paddingHorizontal: 16,
          }}
        >
          <Box
            style={{
              width: "100%",
              maxWidth: 420,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Form đăng ký Agrisa */}
            <Box
              style={{
                width: "100%",
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 28,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* Header Agrisa (giữ nguyên) */}
              <Box
                style={{
                  alignItems: "center",
                  marginBottom: 24,
                  width: "100%",
                }}
              >
                <Box
                  style={{
                    backgroundColor: colors.success,
                    padding: 16,
                    borderRadius: 20,
                    marginBottom: 16,
                  }}
                >
                  <UserPlus size={32} color="white" />
                </Box>

                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Đăng Ký Agrisa
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Tham gia nền tảng bảo hiểm nông nghiệp thông minh
                </Text>
              </Box>

              {/* Error display (giữ nguyên) */}
              {error && (
                <Box
                  style={{
                    width: "100%",
                    backgroundColor: "#fee2e2",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.error,
                  }}
                >
                  <Text style={{ color: colors.error, fontSize: 14 }}>
                    {error.message || "Có lỗi xảy ra. Vui lòng thử lại."}
                  </Text>
                </Box>
              )}

              {/* Form fields */}
              <Box style={{ width: "100%" }}>
                {/* Các field khác giữ nguyên - Họ tên, SĐT, Email, CCCD */}
                {/* ... (code các field trước đó không thay đổi) ... */}

                {/* Họ và tên */}
                <Controller
                  control={signUpFormControl}
                  name="user_profile.full_name"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 16 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          <User size={16} color={colors.text} /> Họ và tên
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        variant="outline"
                        size="md"
                        style={{
                          borderColor: fieldState.error
                            ? colors.error
                            : colors.border,
                          borderRadius: 12,
                          borderWidth: 2,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <InputField
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="Nguyễn Văn A"
                          placeholderTextColor={colors.textMuted}
                          autoCapitalize="words"
                          style={{
                            fontSize: 16,
                            color: colors.text,
                            paddingHorizontal: 16,
                          }}
                        />
                      </Input>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* Số điện thoại */}
                <Controller
                  control={signUpFormControl}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 16 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          <Phone size={16} color={colors.text} /> Số điện thoại
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        variant="outline"
                        size="md"
                        style={{
                          borderColor: fieldState.error
                            ? colors.error
                            : colors.border,
                          borderRadius: 12,
                          borderWidth: 2,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <InputField
                          value={field.value}
                          onChangeText={(text) => {
                            const formatted = formatPhoneNumber(text);
                            field.onChange(formatted);
                          }}
                          placeholder="+84987654321"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="phone-pad"
                          style={{
                            fontSize: 16,
                            color: colors.text,
                            paddingHorizontal: 16,
                          }}
                        />
                      </Input>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textMuted,
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        Có thể nhập: 0987654321 hoặc +84987654321
                      </Text>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* Email */}
                <Controller
                  control={signUpFormControl}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 16 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          <Mail size={16} color={colors.text} /> Email (không
                          bắt buộc)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        variant="outline"
                        size="md"
                        style={{
                          borderColor: fieldState.error
                            ? colors.error
                            : colors.border,
                          borderRadius: 12,
                          borderWidth: 2,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <InputField
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="nguyen.van.a@email.com"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={{
                            fontSize: 16,
                            color: colors.text,
                            paddingHorizontal: 16,
                          }}
                        />
                      </Input>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* CCCD */}
                <Controller
                  control={signUpFormControl}
                  name="national_id"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 16 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          <IdCard size={16} color={colors.text} /> Số CCCD
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        variant="outline"
                        size="md"
                        style={{
                          borderColor: fieldState.error
                            ? colors.error
                            : colors.border,
                          borderRadius: 12,
                          borderWidth: 2,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <InputField
                          value={field.value}
                          onChangeText={(text) => {
                            const formatted = formatCCCD(text);
                            field.onChange(formatted);
                          }}
                          placeholder="012345678901"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                          maxLength={12}
                          style={{
                            fontSize: 16,
                            color: colors.text,
                            paddingHorizontal: 16,
                          }}
                        />
                      </Input>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* NGÀY SINH MỚI - với Date Picker */}
                <Controller
                  control={signUpFormControl}
                  name="user_profile.date_of_birth"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 16 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          <Calendar size={16} color={colors.text} /> Ngày sinh
                        </FormControlLabelText>
                      </FormControlLabel>

                      <TouchableOpacity
                        onPress={() => {
                          // Nếu đã có giá trị, parse để set default cho picker
                          if (field.value) {
                            try {
                              const [year, month, day] = field.value.split("-");
                              setSelectedDate(
                                new Date(
                                  parseInt(year),
                                  parseInt(month) - 1,
                                  parseInt(day)
                                )
                              );
                            } catch (e) {
                              // Giữ nguyên default date
                            }
                          }
                          setShowDatePicker(true);
                        }}
                        style={{
                          borderColor: fieldState.error
                            ? colors.error
                            : colors.border,
                          borderRadius: 12,
                          borderWidth: 2,
                          backgroundColor: colors.surface,
                          minHeight: 56,
                          justifyContent: "center",
                          paddingHorizontal: 16,
                          position: "relative",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: field.value ? colors.text : colors.textMuted,
                          }}
                        >
                          {field.value
                            ? formatDateForDisplay(field.value)
                            : "Chọn ngày sinh"}
                        </Text>

                        {/* Icon Calendar ở bên phải */}
                        <Box
                          style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: [{ translateY: -10 }],
                          }}
                        >
                          <Calendar size={20} color={colors.textMuted} />
                        </Box>
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textMuted,
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        Chạm để chọn từ lịch. Tuổi từ 18-80 để tham gia Agrisa
                      </Text>

                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}

                      {/* Date Picker Modal */}
                      {showDatePicker && (
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          maximumDate={new Date()} // Không cho chọn ngày tương lai
                          minimumDate={new Date(1940, 0, 1)} // Từ năm 1940
                          onChange={(event, date) =>
                            handleDateChange(event, date, field)
                          }
                          // Locale Việt Nam
                          locale="vi-VN"
                          themeVariant={useThemeStore.getState().mode === "dark" ? "dark" : "light"}
                        />
                      )}
                    </FormControl>
                  )}
                />

                {/* GIỚI TÍNH MỚI - với ActionSheet combo box */}
                <Controller
                  control={signUpFormControl}
                  name="user_profile.gender"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 16 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          Giới tính
                        </FormControlLabelText>
                      </FormControlLabel>

                      <TouchableOpacity
                        onPress={() => setShowGenderSelection(true)}
                        style={{
                          borderColor: fieldState.error
                            ? colors.error
                            : colors.border,
                          borderRadius: 12,
                          borderWidth: 2,
                          backgroundColor: colors.surface,
                          minHeight: 56,
                          justifyContent: "center",
                          paddingHorizontal: 16,
                          position: "relative",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: field.value ? colors.text : colors.textMuted,
                          }}
                        >
                          {getGenderLabel(field.value)}
                        </Text>

                        {/* Chevron Down Icon */}
                        <Box
                          style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: [{ translateY: -10 }],
                          }}
                        >
                          <ChevronDown size={20} color={colors.textMuted} />
                        </Box>
                      </TouchableOpacity>

                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}

                      {/* Gender Selection ActionSheet */}
                      <Actionsheet
                        isOpen={showGenderSelection}
                        onClose={() => setShowGenderSelection(false)}
                      >
                        <ActionsheetBackdrop />
                        <ActionsheetContent>
                          <ActionsheetDragIndicatorWrapper>
                            <ActionsheetDragIndicator />
                          </ActionsheetDragIndicatorWrapper>

                          {/* Header */}
                          <Box style={{ padding: 16, alignItems: "center" }}>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "600",
                                color: colors.text,
                              }}
                            >
                              Chọn giới tính
                            </Text>
                          </Box>

                          {/* Options */}
                          {genderOptions.map((option) => (
                            <ActionsheetItem
                              key={option.value}
                              onPress={() => {
                                field.onChange(option.value); // Gửi về payload tiếng Anh
                                setShowGenderSelection(false);
                              }}
                              style={{
                                backgroundColor:
                                  field.value === option.value
                                    ? colors.success + "20" // Highlight lựa chọn hiện tại
                                    : "transparent",
                              }}
                            >
                              <ActionsheetItemText
                                style={{
                                  fontSize: 16,
                                  color:
                                    field.value === option.value
                                      ? colors.success
                                      : colors.text,
                                  fontWeight:
                                    field.value === option.value
                                      ? "600"
                                      : "400",
                                }}
                              >
                                {option.label} {/* Hiển thị tiếng Việt */}
                              </ActionsheetItemText>
                            </ActionsheetItem>
                          ))}
                        </ActionsheetContent>
                      </Actionsheet>
                    </FormControl>
                  )}
                />

                {/* Địa chỉ - giữ nguyên */}
                <Controller
                  control={signUpFormControl}
                  name="user_profile.address"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 16 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          <MapPin size={16} color={colors.text} /> Địa chỉ
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        variant="outline"
                        size="md"
                        style={{
                          borderColor: fieldState.error
                            ? colors.error
                            : colors.border,
                          borderRadius: 12,
                          borderWidth: 2,
                          backgroundColor: colors.surface,
                          minHeight: 80,
                        }}
                      >
                        <InputField
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="Thôn 1, Xã ABC, Huyện XYZ, Tỉnh DEF"
                          placeholderTextColor={colors.textMuted}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                          style={{
                            fontSize: 16,
                            color: colors.text,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                          }}
                        />
                      </Input>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* Mật khẩu - giữ nguyên */}
                <Controller
                  control={signUpFormControl}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormControl
                      isInvalid={!!fieldState.error}
                      style={{ marginBottom: 24 }}
                    >
                      <FormControlLabel>
                        <FormControlLabelText
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          Mật khẩu
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Box style={{ position: "relative" }}>
                        <Input
                          variant="outline"
                          size="md"
                          style={{
                            borderColor: fieldState.error
                              ? colors.error
                              : colors.border,
                            borderRadius: 12,
                            borderWidth: 2,
                            backgroundColor: colors.surface,
                          }}
                        >
                          <InputField
                            value={field.value}
                            onChangeText={field.onChange}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            style={{
                              fontSize: 16,
                              color: colors.text,
                              paddingHorizontal: 16,
                              paddingRight: 50,
                            }}
                          />
                        </Input>
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: [{ translateY: -12 }],
                            padding: 4,
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color={colors.textMuted} />
                          ) : (
                            <Eye size={20} color={colors.textMuted} />
                          )}
                        </TouchableOpacity>
                      </Box>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textMuted,
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự
                        đặc biệt
                      </Text>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText
                            style={{
                              color: colors.error,
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fieldState.error.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                {/* Nút đăng ký và footer - giữ nguyên */}
                <Button
                  onPress={onSubmit}
                  isDisabled={isLoading}
                  size="md"
                  style={{
                    backgroundColor: colors.success,
                    borderRadius: 12,
                    width: "100%",
                    opacity: isLoading ? 0.8 : 1,
                    shadowColor: colors.success,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <ButtonText
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: 17,
                    }}
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng Ký Agrisa"}
                  </ButtonText>
                </Button>

                {form.formState.isDirty && (
                  <Button
                    onPress={() => {
                      reset();
                      clearErrors();
                    }}
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: colors.border,
                      borderRadius: 8,
                      width: "100%",
                      marginTop: 12,
                    }}
                  >
                    <ButtonText
                      style={{
                        color: colors.textSecondary,
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Làm mới form
                    </ButtonText>
                  </Button>
                )}
              </Box>

              {/* Footer */}
              <Box
                style={{
                  marginTop: 20,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Đã có tài khoản?{" "}
                  <Text
                    style={{
                      color: colors.success,
                      fontWeight: "600",
                    }}
                  >
                    Đăng nhập ngay
                  </Text>
                </Text>

                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    textAlign: "center",
                    marginTop: 12,
                    fontStyle: "italic",
                  }}
                >
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <Text style={{ color: colors.success }}>
                    Điều khoản dịch vụ
                  </Text>{" "}
                  của Agrisa
                </Text>
              </Box>
            </Box>
          </Box>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpComponentUI;
