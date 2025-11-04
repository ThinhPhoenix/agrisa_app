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
  Input,
  InputField,
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
import { LinearGradient } from "expo-linear-gradient";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Animated, View } from "react-native";

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
    | "radioGroup";
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
}

export interface CustomFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  onValuesChange?: (values: Record<string, any>) => void;
  formStyle?: any;
  gap?: number;
}

export const CustomForm = forwardRef(function CustomForm(
  {
    fields,
    initialValues,
    onSubmit,
    onValuesChange,
    formStyle,
    gap = 16,
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
  // pressedFields removed: ripple now provides the visual feedback
  const [ripples, setRipples] = useState<Record<string, any>>({});

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
      // cleanup after animation
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
          validationErrors[field.name] =
            `Vui lòng ${field.type === "select" || field.type === "multiselect" ? "chọn" : "nhập"} ${field.label.toLowerCase()}!`;
        }
      });

      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0 ? formData : false;
    },
    getFieldsValue: () => formData,
    resetFields: () => {
      setFormData(initialValues || {});
      setErrors({});
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
  };

  const handleSubmit = () => {
    const validationResult = (ref as any).current?.validateFields();
    if (validationResult) onSubmit && onSubmit(formData);
  };

  const inputContainerStyle = {
    backgroundColor: "rgba(222,222,222,1)",
    minHeight: 56,
    borderRadius: 8,
    justifyContent: "center",
    overflow: "hidden",
  } as const;

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
                borderColor: focusedFields[field.name] ? "#60A5FA" : "#E5E7EB",
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
                borderColor: focusedFields[field.name] ? "#60A5FA" : "#E5E7EB",
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
            {/* If this is a submit button, render it with a gradient like sign-in-v2 */}
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
                  isDisabled={field.disabled}
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

      {/* render a default submit button when caller provided onSubmit but
          didn't include an explicit submit field */}
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
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
              }}
            >
              <ButtonText
                style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
              >
                Submit
              </ButtonText>
            </Button>
          </LinearGradient>
        </View>
      )}
    </VStack>
  );
});

export default CustomForm;
