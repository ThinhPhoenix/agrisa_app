import { colors } from "@/domains/shared/constants/colors";
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
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, ChevronDown } from "lucide-react-native";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Animated, Platform, ScrollView, View } from "react-native";

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
}

export interface CustomFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  onValuesChange?: (values: Record<string, any>) => void;
  formStyle?: any;
  gap?: number;
  submitButtonText?: string;
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
  const [ripples, setRipples] = useState<Record<string, any>>({});

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

  const createRipple = (name: string, nativeEvent: any) => {
    const anim = new Animated.Value(0);
    const opacity = new Animated.Value(0.35);
    const ripple = {
      x: nativeEvent.locationX,
      y: nativeEvent.locationY,
      anim,
      opacity,
      key: Date.now(),
    };

    setRipples((p) => ({ ...p, [name]: ripple }));

    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRipples((p) => {
        const next = { ...p };
        delete next[name];
        return next;
      });
    });
  };

  useImperativeHandle(ref, () => ({
    validateFields: () => {
      const validationErrors: Record<string, string> = {};

      fields.forEach((field) => {
        if (
          field.required &&
          (formData[field.name] === undefined || formData[field.name] === "")
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
    if (initialValues) setFormData(initialValues);
  }, [initialValues]);

  useEffect(() => {
    onValuesChange && onValuesChange(formData);
  }, [formData, onValuesChange]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    const field = fields.find((f) => f.name === name);
    if (field?.onChange) {
      field.onChange(value);
    }
  };

  const handleSubmit = () => {
    const validationResult = (ref as any).current?.validateFields();
    if (validationResult) onSubmit && onSubmit(formData);
  };

  const inputContainerStyle = {
    backgroundColor: "#fff",
    minHeight: 56,
    borderRadius: 8,
    justifyContent: "center",
    overflow: "hidden",
  } as const;

  // ✅ Format date to DD/MM/YYYY
  const formatDate = (date: Date, format: string = "DD/MM/YYYY"): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return format
      .replace("DD", day)
      .replace("MM", month)
      .replace("YYYY", year.toString());
  };

  // ✅ Parse DD/MM/YYYY to Date - Xử lý an toàn hơn
  const parseDate = (dateString: string | undefined | null): Date | null => {
    // Kiểm tra dateString có tồn tại và là string không
    if (!dateString || typeof dateString !== "string") return null;

    const parts = dateString.split("/");
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

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
      <FormControlLabel>
        <FormControlLabelText
          className="text-gray-700 font-medium mb-2 text-xs"
          style={{ fontSize: 12 }}
        >
          {field.label}
          {field.required && (
            <Text style={{ color: "#ef4444", marginLeft: 6, fontSize: 12 }}>
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
                  ? colors.primary400
                  : "#E5E7EB",
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
                  color: "#111827",
                  height: "100%",
                }}
                placeholderTextColor="#666"
              />
            </Input>
            {field.helperText && (
              <FormControlHelper>
                <FormControlHelperText className="text-gray-500 text-sm mt-1">
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError>
              <FormControlErrorText className="text-red-500 text-sm mt-1">
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
                  ? colors.primary400
                  : "#E5E7EB",
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
                  color: "#111827",
                  height: "100%",
                }}
                placeholderTextColor="#666"
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
                  right: 8,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
                accessibilityRole="button"
              >
                {showPassword[field.name] ? (
                  <EyeOffIcon size="md" className="text-gray-500" />
                ) : (
                  <EyeIcon size="md" className="text-gray-500" />
                )}
              </Pressable>
            </Input>
            {field.helperText && (
              <FormControlHelper>
                <FormControlHelperText className="text-gray-500 text-sm mt-1">
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError>
              <FormControlErrorText className="text-red-500 text-sm mt-1">
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
                className="bg-white border-2 border-gray-200 shadow-sm"
                style={{ borderRadius: 8, minHeight: 56 }}
              >
                <SelectInput
                  placeholder={field.placeholder}
                  className="px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <SelectIcon
                  as={ChevronDownIcon}
                  className="text-gray-500 mr-3"
                />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent
                  className="bg-white border-2 border-gray-200 shadow-lg"
                  style={{ borderRadius: 8 }}
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
              <FormControlHelper>
                <FormControlHelperText className="text-gray-500 text-sm mt-1">
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError>
              <FormControlErrorText className="text-red-500 text-sm mt-1">
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
                  borderColor: "#E5E7EB",
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
                    color: formData[field.name] ? "#111827" : "#666",
                    fontSize: 14,
                  }}
                >
                  {formData[field.name] || field.placeholder || "Chọn ngày"}
                </Text>
                <Calendar size={20} color="#6B7280" strokeWidth={2} />
              </View>
            </Pressable>

            {field.helperText && (
              <FormControlHelper>
                <FormControlHelperText className="text-gray-500 text-sm mt-1">
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError>
              <FormControlErrorText className="text-red-500 text-sm mt-1">
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
                        backgroundColor: "#fff",
                        padding: 20,
                      }}
                    >
                      <ModalHeader>
                        <Text fontSize="$lg" fontWeight="$bold">
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
                            accentColor={colors.primary500}
                            textColor="#000000"
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
                  borderColor: "#E5E7EB",
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
                    color: "#111827",
                    height: "100%",
                  }}
                  placeholderTextColor="#666"
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
                  <ChevronDown size={20} color="#6B7280" strokeWidth={2} />
                </View>
              </Input>
            </Pressable>

            {field.helperText && (
              <FormControlHelper>
                <FormControlHelperText className="text-gray-500 text-sm mt-1">
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError>
              <FormControlErrorText className="text-red-500 text-sm mt-1">
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
                  backgroundColor: "#fff",
                }}
              >
                <ModalHeader
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5E7EB",
                    paddingVertical: 16,
                  }}
                >
                  <Text fontSize="$lg" fontWeight="$bold" color="#111827">
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
                          borderBottomColor: "#E5E7EB",
                        }}
                      >
                        <Input style={{ borderRadius: 8 }}>
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
                              color: "#111827",
                            }}
                            placeholderTextColor="#9CA3AF"
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
                          <Text fontSize="$sm" color="#6B7280">
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
                                borderBottomColor: "#F3F4F6",
                                backgroundColor: isSelected
                                  ? "#EFF6FF"
                                  : "transparent",
                              }}
                            >
                              <HStack
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Text
                                  fontSize="$sm"
                                  color={
                                    isSelected ? colors.primary500 : "#111827"
                                  }
                                  fontWeight={isSelected ? "$bold" : "$normal"}
                                >
                                  {option.label}
                                </Text>
                                {isSelected && (
                                  <CheckIcon
                                    size="sm"
                                    color={colors.primary500}
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
            <Textarea style={{ borderRadius: 8, minHeight: 100, padding: 0 }}>
              <TextareaInput
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChangeText={(v) => handleFieldChange(field.name, v)}
                editable={!field.disabled}
                placeholderTextColor="#9CA3AF"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: "#111827",
                }}
              />
            </Textarea>
            {field.helperText && (
              <FormControlHelper>
                <FormControlHelperText className="text-gray-500 text-sm mt-1">
                  {field.helperText}
                </FormControlHelperText>
              </FormControlHelper>
            )}
            <FormControlError>
              <FormControlErrorText className="text-red-500 text-sm mt-1">
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
              <LinearGradient
                colors={[colors.primary500, colors.primary700]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 56,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 6,
                  overflow: "hidden",
                  opacity: field.disabled || isSubmitting ? 0.5 : 1,
                }}
              >
                <Button
                  onPress={handleSubmit}
                  onPressIn={(e: any) =>
                    createRipple(
                      field.name,
                      e?.nativeEvent || { locationX: 0, locationY: 0 }
                    )
                  }
                  isDisabled={field.disabled || isSubmitting}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                  }}
                >
                  <ButtonText
                    style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                  >
                    {field.buttonText || field.label}
                  </ButtonText>
                </Button>
              </LinearGradient>
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
                onPressIn={(e: any) =>
                  createRipple(
                    field.name,
                    e?.nativeEvent || { locationX: 0, locationY: 0 }
                  )
                }
                variant={field.variant || "solid"}
                size={field.size || "md"}
                isDisabled={field.disabled}
                className={`shadow-md ${field.variant === "outline" ? "border-2 border-blue-500 bg-transparent" : "bg-blue-500 hover:bg-blue-600"}`}
                style={{ borderRadius: 8, overflow: "hidden" }}
              >
                <ButtonText
                  className={`font-semibold ${field.variant === "outline" ? "text-blue-500" : "text-white"}`}
                >
                  {field.buttonText || field.label}
                </ButtonText>
                {ripples[field.name] && (
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: ripples[field.name].x - 150,
                      top: ripples[field.name].y - 150,
                      width: 300,
                      height: 300,
                      borderRadius: 150,
                      backgroundColor: "rgba(0,0,0,0.12)",
                      transform: [
                        {
                          scale: ripples[field.name].anim.interpolate
                            ? ripples[field.name].anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.1, 1],
                              })
                            : 1,
                        },
                      ],
                      opacity: ripples[field.name].opacity,
                    }}
                  />
                )}
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
    <VStack style={formStyle}>
      {fields.map((f, idx) => (
        <View
          key={f.name + "-wrap"}
          style={{ marginBottom: idx === fields.length - 1 ? 0 : gap }}
        >
          {renderField(f)}
        </View>
      ))}

      {!hasSubmitField && onSubmit && (
        <View style={{ marginTop: gap }}>
          <LinearGradient
            colors={[colors.primary500, colors.primary700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 56,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 6,
              overflow: "hidden",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            <Button
              onPress={handleSubmit}
              onPressIn={(e: any) =>
                createRipple(
                  "__default_submit",
                  e?.nativeEvent || { locationX: 0, locationY: 0 }
                )
              }
              isDisabled={isSubmitting}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
              }}
            >
              <ButtonText
                style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
              >
                {submitButtonText}
              </ButtonText>
            </Button>
          </LinearGradient>
        </View>
      )}
    </VStack>
  );
});

export default CustomForm;
