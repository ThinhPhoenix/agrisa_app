import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";
import {
  Button,
  ButtonText,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Pressable,
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Switch,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from "@gluestack-ui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, ChevronDown } from "lucide-react-native";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Platform, ScrollView, View } from "react-native";

export interface FormField {
  name: string;
  label: string;
  type:
    | "input"
    | "password"
    | "number"
    | "select"
    | "multiselect"
    | "action"
    | "button"
    | "textarea"
    | "switch"
    | "checkbox"
    | "radioGroup"
    | "datepicker"
    | "combobox";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: any }[];
  rules?: any;
  style?: any;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  showSearch?: boolean;
  allowClear?: boolean;
  loading?: boolean;
  buttonText?: string;
  buttonLoading?: boolean;
  variant?: "solid" | "outline" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  isSubmit?: boolean;
  onClick?: () => void;
  onChange?: (value: any) => void;
  onAction?: (values: any, form: any) => void;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  helperText?: string;
  errorText?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  mode?: "date" | "time" | "datetime";
  validation?: (
    value: any,
    formValues?: Record<string, any>
  ) => {
    isValid: boolean;
    errorMessage?: string;
  };
}

export interface CustomFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  onValuesChange?: (values: Record<string, any>) => void;
  formStyle?: any;
  gap?: number;
  submitButtonText?: string;
  showSubmitButton?: boolean; // Control submit button visibility
  isSubmitting?: boolean;
}

export const CustomForm = forwardRef(function CustomForm(
  {
    fields,
    initialValues,
    onSubmit,
    onValuesChange,
    formStyle,
    gap = 16,
    submitButtonText = "Submit",
    showSubmitButton = true,
    isSubmitting = false,
  }: CustomFormProps,
  ref
) {
  const [formData, setFormData] = useState<Record<string, any>>(
    initialValues || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [focusedFields, setFocusedFields] = useState<Record<string, boolean>>(
    {}
  );

  // ✅ DatePicker state
  const [showDatePicker, setShowDatePicker] = useState<Record<string, boolean>>(
    {}
  );
  const [tempDate, setTempDate] = useState<Record<string, Date>>({});

  // ✅ Combobox state
  const [comboboxSearch, setComboboxSearch] = useState<Record<string, string>>(
    {}
  );
  const [showComboboxModal, setShowComboboxModal] = useState<
    Record<string, boolean>
  >({});

  // Theo dõi hash initialValues đã apply để tránh setFormData lặp
  const initialValuesHashRef = useRef<string | null>(null);
  // Theo dõi hash formData đã notify để tránh onValuesChange lặp
  const prevFormDataHashRef = useRef<string | null>(null);
  // Cờ để bỏ qua onValuesChange khi đang sync initialValues -> formData
  const syncingInitialValuesRef = useRef(false);

  const { mode } = useAgrisaColors();
  const themeColors = AgrisaColors[mode];

  useImperativeHandle(ref, () => ({
    validateFields: () => {
      const validationErrors: Record<string, string> = {};

      fields.forEach((field) => {
        const value = formData[field.name];

        // Check required
        if (
          field.required &&
          (value === undefined || value === "" || value === null)
        ) {
          validationErrors[field.name] = `Vui lòng ${
            field.type === "select" ||
            field.type === "multiselect" ||
            field.type === "combobox"
              ? "chọn"
              : field.type === "datepicker"
                ? "chọn ngày"
                : "nhập"
          } ${field.label.toLowerCase()}!`;
        }

        // Run custom validation nếu có và field có giá trị
        if (
          field.validation &&
          value !== undefined &&
          value !== "" &&
          value !== null
        ) {
          const validationResult = field.validation(value, formData);
          if (!validationResult.isValid) {
            validationErrors[field.name] =
              validationResult.errorMessage || "Giá trị không hợp lệ";
          }
        }
      });

      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0 ? formData : false;
    },
    getFieldsValue: () => formData,
    resetFields: () => {
      setFormData(initialValues || {});
      setErrors({});
      setComboboxSearch({});
      setTempDate({});
    },
    setFieldsValue: (values: Record<string, any>) => {
      setFormData((prev) => ({ ...prev, ...values }));
    },
  }));

  useEffect(() => {
    if (!initialValues) return;

    const nextHash = JSON.stringify(initialValues);
    if (initialValuesHashRef.current === nextHash) return;
    initialValuesHashRef.current = nextHash;

    syncingInitialValuesRef.current = true; // tránh trigger onValuesChange khi sync

    setFormData((prev) => ({
      ...prev,
      ...initialValues,
    }));

    // Clear flag ngay sau khi sync xong ở frame tiếp theo
    setTimeout(() => {
      syncingInitialValuesRef.current = false;
    }, 0);
  }, [initialValues]);

  useEffect(() => {
    if (!onValuesChange) return;

    // Bỏ qua nếu đang sync initialValues để tránh vòng lặp
    if (syncingInitialValuesRef.current) return;

    const nextHash = JSON.stringify(formData);
    if (prevFormDataHashRef.current === nextHash) return;
    prevFormDataHashRef.current = nextHash;

    onValuesChange(formData);
  }, [formData, onValuesChange]);

  const handleFieldChange = (name: string, value: any) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const field = fields.find((f) => f.name === name);

    // Run custom validation nếu có
    if (field?.validation) {
      const validationResult = field.validation(value, newFormData);
      if (!validationResult.isValid) {
        setErrors((prev) => ({
          ...prev,
          [name]: validationResult.errorMessage || "Giá trị không hợp lệ",
        }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (field?.onChange) {
      field.onChange(value);
    }
  };

  const handleSubmit = () => {
    // Validate tất cả fields
    const validationErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      // Check required
      if (
        field.required &&
        (value === undefined || value === "" || value === null)
      ) {
        validationErrors[field.name] = `Vui lòng ${
          field.type === "select" ||
          field.type === "multiselect" ||
          field.type === "combobox"
            ? "chọn"
            : field.type === "datepicker"
              ? "chọn ngày"
              : "nhập"
        } ${field.label.toLowerCase()}!`;
      }

      // Run custom validation nếu có và field có giá trị
      if (
        field.validation &&
        value !== undefined &&
        value !== "" &&
        value !== null
      ) {
        const validationResult = field.validation(value, formData);
        if (!validationResult.isValid) {
          validationErrors[field.name] =
            validationResult.errorMessage || "Giá trị không hợp lệ";
        }
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit nếu không có lỗi
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const inputContainerStyle = {
    backgroundColor: themeColors.background,
    minHeight: 56,
    borderRadius: 8,
    justifyContent: "center",
    overflow: "hidden",
  } as const;

  // ✅ Format date to DD/MM/YYYY or YYYY-MM-DD
  const formatDate = (date: Date, format: string = "DD/MM/YYYY"): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return format
      .replace("DD", day)
      .replace("MM", month)
      .replace("YYYY", year.toString());
  };

  // ✅ Parse DD/MM/YYYY hoặc YYYY-MM-DD to Date - Xử lý an toàn hơn
  const parseDate = (dateString: string | undefined | null): Date | null => {
    // Kiểm tra dateString có tồn tại và là string không
    if (!dateString || typeof dateString !== "string") return null;

    let day: number, month: number, year: number;

    // Kiểm tra format YYYY-MM-DD (ISO format)
    if (dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts.length !== 3) return null;

      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
    // Format DD/MM/YYYY
    else if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length !== 3) return null;

      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    } else {
      return null;
    }

    // Kiểm tra tính hợp lệ của ngày
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    const date = new Date(year, month, day);

    // Kiểm tra ngày có hợp lệ không (ví dụ: 31/02/2024 sẽ không hợp lệ)
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  };

  const renderField = (field: FormField) => {
    const commonLabel = (
      <FormControlLabel style={{ marginBottom: 10 }}>
        <FormControlLabelText
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: themeColors.primary_text,
            letterSpacing: 0.2,
          }}
        >
          {field.label}
          {field.required && (
            <Text
              style={{ color: themeColors.error, marginLeft: 4, fontSize: 15 }}
            >
              *
            </Text>
          )}
        </FormControlLabelText>
      </FormControlLabel>
    );

    switch (field.type) {
      case "input":
      case "number":
        return (
          <FormControl
            key={field.name}
            isInvalid={!!errors[field.name]}
            style={field.style}
          >
            {commonLabel}
            <Input
              style={{
                ...inputContainerStyle,
                borderWidth: 2,
                borderColor: focusedFields[field.name]
                  ? themeColors.primary
                  : themeColors.frame_border,
                opacity: field.disabled ? 0.6 : 1,
                backgroundColor: field.disabled
                  ? themeColors.muted_background
                  : themeColors.background,
              }}
            >
              <InputField
                placeholder={field.placeholder}
                value={
                  formData[field.name] !== undefined
                    ? String(formData[field.name])
                    : ""
                }
                onChangeText={(text) =>
                  handleFieldChange(
                    field.name,
                    field.type === "number"
                      ? text
                        ? Number(text)
                        : undefined
                      : text
                  )
                }
                keyboardType={field.type === "number" ? "numeric" : undefined}
                editable={!field.disabled}
                onFocus={() =>
                  setFocusedFields((p) => ({ ...p, [field.name]: true }))
                }
                onBlur={() =>
                  setFocusedFields((p) => ({ ...p, [field.name]: false }))
                }
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: themeColors.primary_text,
                  fontSize: 15,
                }}
                placeholderTextColor={themeColors.muted_text}
              />
            </Input>
            {field.helperText && (
              <FormControlHelper style={{ marginTop: 8 }}>
                \n{" "}
                <FormControlHelperText
                  style={{
                    fontSize: 13,
                    color: themeColors.secondary_text,
                  }}
                >
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError style={{ marginTop: 8 }}>
              <FormControlErrorText
                style={{
                  fontSize: 13,
                  color: themeColors.error,
                }}
              >
                {errors[field.name]}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        );

      case "password":
        return (
          <FormControl
            key={field.name}
            isInvalid={!!errors[field.name]}
            style={field.style}
          >
            {commonLabel}
            <Input
              style={{
                ...inputContainerStyle,
                position: "relative",
                borderWidth: 2,
                borderColor: focusedFields[field.name]
                  ? themeColors.primary
                  : themeColors.frame_border,
                opacity: field.disabled ? 0.6 : 1,
                backgroundColor: field.disabled
                  ? themeColors.muted_background
                  : themeColors.background,
              }}
            >
              <InputField
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChangeText={(v) => handleFieldChange(field.name, v)}
                secureTextEntry={!showPassword[field.name]}
                editable={!field.disabled}
                onFocus={() =>
                  setFocusedFields((p) => ({ ...p, [field.name]: true }))
                }
                onBlur={() =>
                  setFocusedFields((p) => ({ ...p, [field.name]: false }))
                }
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: themeColors.primary_text,
                  fontSize: 15,
                }}
                placeholderTextColor={themeColors.muted_text}
              />
              <Pressable
                onPress={() =>
                  setShowPassword((s) => ({
                    ...s,
                    [field.name]: !s[field.name],
                  }))
                }
                style={{
                  position: "absolute",
                  right: 12,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
                accessibilityRole="button"
              >
                {showPassword[field.name] ? (
                  <EyeOffIcon size="md" color={themeColors.secondary_text} />
                ) : (
                  <EyeIcon size="md" color={themeColors.secondary_text} />
                )}
              </Pressable>
            </Input>
            {field.helperText && (
              <FormControlHelper style={{ marginTop: 8 }}>
                <FormControlHelperText
                  style={{
                    fontSize: 13,
                    color: themeColors.secondary_text,
                  }}
                >
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError style={{ marginTop: 8 }}>
              <FormControlErrorText
                style={{
                  fontSize: 13,
                  color: themeColors.error,
                }}
              >
                {errors[field.name]}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        );

      case "select":
      case "multiselect":
        return (
          <FormControl
            key={field.name}
            isInvalid={!!errors[field.name]}
            style={field.style}
          >
            {commonLabel}
            <Select
              selectedValue={formData[field.name]}
              onValueChange={(value) => handleFieldChange(field.name, value)}
              isDisabled={field.disabled}
            >
              <SelectTrigger
                style={{
                  borderRadius: 8,
                  minHeight: 56,
                  backgroundColor: themeColors.background,
                  borderWidth: 2,
                  borderColor: themeColors.frame_border,
                }}
              >
                <SelectInput
                  placeholder={field.placeholder}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: themeColors.primary_text,
                  }}
                  placeholderTextColor={themeColors.muted_text}
                />
                <SelectIcon
                  as={ChevronDownIcon}
                  style={{ color: themeColors.secondary_text, marginRight: 12 }}
                />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent
                  style={{
                    borderRadius: 8,
                    backgroundColor: themeColors.background,
                    borderWidth: 2,
                    borderColor: themeColors.frame_border,
                  }}
                >
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {field.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      className="px-4 py-3 hover:bg-gray-50"
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
            {field.helperText && (
              <FormControlHelper style={{ marginTop: 20 }}>
                <FormControlHelperText
                  style={{
                    fontSize: 13,
                    color: themeColors.secondary_text,
                  }}
                >
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError style={{ marginTop: 8 }}>
              <FormControlErrorText
                style={{
                  fontSize: 13,
                  color: themeColors.error,
                }}
              >
                {errors[field.name]}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        );

      // ✅ DatePicker - Sử dụng @react-native-community/datetimepicker
      case "datepicker":
        const currentDateValue = formData[field.name]
          ? parseDate(formData[field.name]) || new Date()
          : tempDate[field.name] || new Date();

        return (
          <FormControl
            key={field.name}
            isInvalid={!!errors[field.name]}
            style={field.style}
          >
            {commonLabel}

            {/* Date Input Display - Toàn bộ ô có thể bấm */}
            <Pressable
              onPress={() => {
                if (!field.disabled) {
                  setTempDate((prev) => ({
                    ...prev,
                    [field.name]: currentDateValue,
                  }));
                  setShowDatePicker((prev) => ({
                    ...prev,
                    [field.name]: true,
                  }));
                }
              }}
              disabled={field.disabled}
              style={{ width: "100%" }}
            >
              <View
                style={{
                  ...inputContainerStyle,
                  borderWidth: 2,
                  borderColor: themeColors.frame_border,
                  opacity: field.disabled ? 0.5 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                }}
                pointerEvents="none"
              >
                <Text
                  style={{
                    flex: 1,
                    color: formData[field.name]
                      ? themeColors.primary_text
                      : themeColors.muted_text,
                    fontSize: 14,
                  }}
                >
                  {formData[field.name] || field.placeholder || "Chọn ngày"}
                </Text>
                <Calendar
                  size={20}
                  color={themeColors.secondary_text}
                  strokeWidth={2}
                />
              </View>
            </Pressable>

            {field.helperText && (
              <FormControlHelper style={{ marginTop: 8 }}>
                <FormControlHelperText
                  style={{
                    fontSize: 13,
                    color: themeColors.secondary_text,
                  }}
                >
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError style={{ marginTop: 8 }}>
              <FormControlErrorText
                style={{
                  fontSize: 13,
                  color: themeColors.error,
                }}
              >
                {errors[field.name]}
              </FormControlErrorText>
            </FormControlError>

            {/* ✅ DateTimePicker - Native UI */}
            {showDatePicker[field.name] && (
              <>
                {Platform.OS === "ios" ? (
                  // iOS: Show in Modal
                  <Modal
                    isOpen={showDatePicker[field.name]}
                    onClose={() =>
                      setShowDatePicker((prev) => ({
                        ...prev,
                        [field.name]: false,
                      }))
                    }
                  >
                    <ModalBackdrop />
                    <ModalContent
                      style={{
                        borderRadius: 16,
                        backgroundColor: themeColors.background,
                        padding: 20,
                      }}
                    >
                      <ModalHeader>
                        <Text
                          fontSize="$lg"
                          fontWeight="$bold"
                          style={{ color: themeColors.primary_text }}
                        >
                          {field.label}
                        </Text>
                        <ModalCloseButton>
                          <Icon as={CloseIcon} />
                        </ModalCloseButton>
                      </ModalHeader>
                      <ModalBody>
                        <VStack space="md" alignItems="center">
                          <DateTimePicker
                            value={tempDate[field.name] || new Date()}
                            mode={field.mode || "date"}
                            display="spinner"
                            onChange={(event, selectedDate) => {
                              if (selectedDate) {
                                setTempDate((prev) => ({
                                  ...prev,
                                  [field.name]: selectedDate,
                                }));
                              }
                            }}
                            minimumDate={field.minDate}
                            maximumDate={field.maxDate}
                            locale="vi-VN"
                            accentColor={themeColors.primary}
                            textColor={themeColors.primary_text}
                          />

                          <HStack space="sm" width="100%">
                            <Button
                              flex={1}
                              variant="link"
                              onPress={() =>
                                setShowDatePicker((prev) => ({
                                  ...prev,
                                  [field.name]: false,
                                }))
                              }
                            >
                              <ButtonText>Hủy</ButtonText>
                            </Button>
                            <Button
                              flex={1}
                              onPress={() => {
                                const formatted = formatDate(
                                  tempDate[field.name],
                                  field.dateFormat || "DD/MM/YYYY"
                                );
                                handleFieldChange(field.name, formatted);
                                setShowDatePicker((prev) => ({
                                  ...prev,
                                  [field.name]: false,
                                }));
                              }}
                            >
                              <ButtonText>Xác nhận</ButtonText>
                            </Button>
                          </HStack>
                        </VStack>
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                ) : (
                  // Android: Show directly
                  <DateTimePicker
                    value={tempDate[field.name] || new Date()}
                    mode={field.mode || "date"}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker((prev) => ({
                        ...prev,
                        [field.name]: false,
                      }));

                      if (event.type === "set" && selectedDate) {
                        const formatted = formatDate(
                          selectedDate,
                          field.dateFormat || "DD/MM/YYYY"
                        );
                        handleFieldChange(field.name, formatted);
                      }
                    }}
                    minimumDate={field.minDate}
                    maximumDate={field.maxDate}
                    textColor="#000000"
                  />
                )}
              </>
            )}
          </FormControl>
        );

      // ✅ Combobox - Select với search
      case "combobox":
        const searchQuery = comboboxSearch[field.name] || "";
        const filteredOptions =
          field.options?.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
          ) || [];
        const selectedOption = field.options?.find(
          (opt) => opt.value === formData[field.name]
        );

        return (
          <FormControl
            key={field.name}
            isInvalid={!!errors[field.name]}
            style={field.style}
          >
            {commonLabel}

            {/* Combobox Display */}
            <Pressable
              onPress={() => {
                if (!field.disabled) {
                  setShowComboboxModal((prev) => ({
                    ...prev,
                    [field.name]: true,
                  }));
                }
              }}
              disabled={field.disabled}
            >
              <Input
                style={{
                  ...inputContainerStyle,
                  borderWidth: 2,
                  borderColor: themeColors.frame_border,
                  opacity: field.disabled ? 0.5 : 1,
                }}
                isReadOnly
              >
                <InputField
                  placeholder={field.placeholder || "Chọn..."}
                  value={selectedOption?.label || ""}
                  editable={false}
                  style={{
                    paddingHorizontal: 16,
                    color: themeColors.primary_text,
                    height: "100%",
                  }}
                  placeholderTextColor={themeColors.muted_text}
                />
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <ChevronDown
                    size={20}
                    color={themeColors.secondary_text}
                    strokeWidth={2}
                  />
                </View>
              </Input>
            </Pressable>

            {field.helperText && (
              <FormControlHelper style={{ marginTop: 8 }}>
                <FormControlHelperText
                  style={{
                    fontSize: 13,
                    color: themeColors.secondary_text,
                  }}
                >
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError style={{ marginTop: 8 }}>
              <FormControlErrorText
                style={{
                  fontSize: 13,
                  color: themeColors.error,
                }}
              >
                {errors[field.name]}
              </FormControlErrorText>
            </FormControlError>

            {/* Combobox Modal */}
            <Modal
              isOpen={showComboboxModal[field.name] || false}
              onClose={() => {
                setShowComboboxModal((prev) => ({
                  ...prev,
                  [field.name]: false,
                }));
                setComboboxSearch((prev) => ({ ...prev, [field.name]: "" }));
              }}
              size="lg"
            >
              <ModalBackdrop />
              <ModalContent
                style={{
                  borderRadius: 16,
                  maxWidth: 400,
                  maxHeight: "80%",
                  backgroundColor: themeColors.background,
                }}
              >
                <ModalHeader
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: themeColors.frame_border,
                    paddingVertical: 16,
                  }}
                >
                  <Text
                    fontSize="$lg"
                    fontWeight="$bold"
                    style={{ color: themeColors.primary_text }}
                  >
                    {field.label}
                  </Text>
                  <ModalCloseButton>
                    <Icon as={CloseIcon} />
                  </ModalCloseButton>
                </ModalHeader>
                <ModalBody style={{ padding: 0 }}>
                  <VStack>
                    {/* Search Input */}
                    {field.showSearch !== false && (
                      <View
                        style={{
                          padding: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: themeColors.frame_border,
                        }}
                      >
                        <Input
                          style={{
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: themeColors.frame_border,
                            backgroundColor: themeColors.background,
                          }}
                        >
                          <InputField
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChangeText={(text) =>
                              setComboboxSearch((prev) => ({
                                ...prev,
                                [field.name]: text,
                              }))
                            }
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 12,
                              color: themeColors.primary_text,
                              fontSize: 14,
                            }}
                            placeholderTextColor={themeColors.muted_text}
                          />
                        </Input>
                      </View>
                    )}

                    {/* Options List */}
                    <ScrollView
                      style={{ maxHeight: 400 }}
                      showsVerticalScrollIndicator={false}
                    >
                      {filteredOptions.length === 0 ? (
                        <View style={{ padding: 32, alignItems: "center" }}>
                          <Text
                            fontSize="$sm"
                            style={{ color: themeColors.secondary_text }}
                          >
                            Không tìm thấy kết quả
                          </Text>
                        </View>
                      ) : (
                        filteredOptions.map((option) => {
                          const isSelected =
                            formData[field.name] === option.value;
                          return (
                            <Pressable
                              key={option.value}
                              onPress={() => {
                                handleFieldChange(field.name, option.value);
                                setShowComboboxModal((prev) => ({
                                  ...prev,
                                  [field.name]: false,
                                }));
                                setComboboxSearch((prev) => ({
                                  ...prev,
                                  [field.name]: "",
                                }));
                              }}
                              style={{
                                paddingVertical: 16,
                                paddingHorizontal: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: themeColors.frame_border,
                                backgroundColor: isSelected
                                  ? themeColors.successSoft
                                  : "transparent",
                              }}
                            >
                              <HStack
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Text
                                  fontSize="$sm"
                                  style={{
                                    color: isSelected
                                      ? themeColors.primary
                                      : themeColors.primary_text,
                                    fontWeight: isSelected ? "700" : "400",
                                  }}
                                >
                                  {option.label}
                                </Text>
                                {isSelected && (
                                  <CheckIcon
                                    size="sm"
                                    color={themeColors.primary}
                                  />
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

      case "textarea":
        return (
          <FormControl
            key={field.name}
            isInvalid={!!errors[field.name]}
            style={field.style}
          >
            {commonLabel}
            <Textarea
              style={{
                borderRadius: 8,
                minHeight: 100,
                padding: 0,
                backgroundColor: themeColors.background,
                borderWidth: 2,
                borderColor: themeColors.frame_border,
              }}
            >
              <TextareaInput
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChangeText={(v) => handleFieldChange(field.name, v)}
                editable={!field.disabled}
                placeholderTextColor={themeColors.muted_text}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: themeColors.primary_text,
                }}
              />
            </Textarea>
            {field.helperText && (
              <FormControlHelper style={{ marginTop: 8 }}>
                <FormControlHelperText
                  style={{
                    fontSize: 13,
                    color: themeColors.secondary_text,
                  }}
                >
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError style={{ marginTop: 8 }}>
              <FormControlErrorText
                style={{
                  fontSize: 13,
                  color: themeColors.error,
                }}
              >
                {errors[field.name]}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        );

      case "switch":
        return (
          <FormControl key={field.name} style={field.style}>
            <HStack space="md" alignItems="center">
              <FormControlLabel>
                <FormControlLabelText
                  className="text-xs"
                  style={{ fontSize: 12 }}
                >
                  {field.label}
                  {field.required && (
                    <Text
                      style={{ color: "#ef4444", marginLeft: 6, fontSize: 12 }}
                    >
                      *
                    </Text>
                  )}
                </FormControlLabelText>
              </FormControlLabel>
              <Switch
                value={formData[field.name] || false}
                onValueChange={(value) => handleFieldChange(field.name, value)}
                isDisabled={field.disabled}
              />
            </HStack>
          </FormControl>
        );

      case "checkbox":
        return (
          <FormControl key={field.name} style={field.style}>
            <Checkbox
              value={field.name}
              isChecked={formData[field.name] || false}
              onChange={(isChecked) => handleFieldChange(field.name, isChecked)}
              isDisabled={field.disabled}
              aria-label={field.label}
            >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>{field.label}</CheckboxLabel>
            </Checkbox>
          </FormControl>
        );

      case "radioGroup":
        return (
          <FormControl
            key={field.name}
            isInvalid={!!errors[field.name]}
            style={field.style}
          >
            {commonLabel}
            <RadioGroup
              value={formData[field.name]}
              onChange={(value) => handleFieldChange(field.name, value)}
            >
              <VStack space="md">
                {field.options?.map((option) => (
                  <Radio
                    key={option.value}
                    value={option.value}
                    isDisabled={field.disabled}
                  >
                    <RadioIndicator>
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                    <RadioLabel>{option.label}</RadioLabel>
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
            <FormControlError>
              <FormControlErrorText>{errors[field.name]}</FormControlErrorText>
            </FormControlError>
          </FormControl>
        );

      case "action":
      case "button":
        return (
          <FormControl key={field.name} style={field.style}>
            {field.isSubmit ? (
              <Button
                onPress={handleSubmit}
                isDisabled={field.disabled || isSubmitting}
                style={{
                  backgroundColor: themeColors.primary,
                  borderRadius: 8,
                  minHeight: 52,
                }}
              >
                <ButtonText
                  style={{
                    color: themeColors.primary_white_text,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {field.buttonText || field.label}
                </ButtonText>
              </Button>
            ) : (
              <Button
                onPress={
                  field.onClick ||
                  (() => {
                    if (field.onAction)
                      field.onAction(formData, {
                        getFieldsValue: () => formData,
                        setFieldsValue: handleFieldChange,
                        resetFields: () => setFormData(initialValues || {}),
                      });
                  })
                }
                variant={field.variant || "solid"}
                size={field.size || "md"}
                isDisabled={field.disabled}
                style={{
                  borderRadius: 8,
                  backgroundColor:
                    field.variant === "outline"
                      ? "transparent"
                      : themeColors.primary,
                  borderWidth: field.variant === "outline" ? 2 : 0,
                  borderColor:
                    field.variant === "outline"
                      ? themeColors.primary
                      : "transparent",
                }}
              >
                <ButtonText
                  style={{
                    color:
                      field.variant === "outline"
                        ? themeColors.primary
                        : themeColors.primary_white_text,
                    fontWeight: "600",
                  }}
                >
                  {field.buttonText || field.label}
                </ButtonText>
              </Button>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  const hasSubmitField = fields.some(
    (f) => (f.type === "button" || f.type === "action") && f.isSubmit
  );

  return (
    <VStack
      space="lg"
      style={[
        {
          padding: 20,
          backgroundColor: themeColors.card_surface,
          borderRadius: 12,
        },
        formStyle,
      ]}
    >
      {fields.map((field) => (
        <View key={field.name} style={{ marginBottom: 12 }}>
          {renderField(field)}
        </View>
      ))}

      {!hasSubmitField && onSubmit && showSubmitButton && (
        <Button
          onPress={handleSubmit}
          isDisabled={isSubmitting}
          style={{
            backgroundColor: themeColors.primary,
            borderRadius: 8,
            minHeight: 52,
            marginTop: 8,
          }}
        >
          <ButtonText
            style={{
              color: themeColors.primary_white_text,
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            {isSubmitting ? "Đang xử lý..." : submitButtonText}
          </ButtonText>
        </Button>
      )}
    </VStack>
  );
});

export default CustomForm;
