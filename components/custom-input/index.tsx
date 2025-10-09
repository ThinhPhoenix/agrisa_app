import React, { useState } from "react";
import {
  Input,
  InputField,
  InputSlot,
  InputIcon,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  VStack,
  HStack,
  Button,
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Text,
  Pressable,
} from "@gluestack-ui/themed";
import { Eye, EyeOff, Calendar, AlertCircle } from "lucide-react-native";
import { Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export type InputVariant =
  | "text"
  | "number"
  | "phone"
  | "email"
  | "password"
  | "date"
  | "daterange"
  | "textarea"
  | "url"
  | "search";

interface CustomInputProps {
  variant?: InputVariant;
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  isInvalid?: boolean;
  isReadOnly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
  minDate?: Date;
  maxDate?: Date;
  onDateChange?: (date: Date | null) => void;
  onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  numberOfLines?: number;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  variant = "text",
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helper,
  required = false,
  disabled = false,
  size = "md",
  isInvalid = false,
  isReadOnly = false,
  leftIcon,
  rightIcon,
  maxLength,
  minDate,
  maxDate,
  onDateChange,
  onDateRangeChange,
  startDate,
  endDate,
  numberOfLines = 4,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(
    startDate || null
  );
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate || null);

  const getKeyboardType = () => {
    switch (variant) {
      case "number":
        return "numeric";
      case "phone":
        return "phone-pad";
      case "email":
        return "email-address";
      case "url":
        return "url";
      default:
        return "default";
    }
  };

  const getAutoCapitalize = () => {
    if (variant === "email" || variant === "url") return "none";
    return "sentences";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate && onDateChange) {
      onDateChange(selectedDate);
    }
  };

  const handleDateRangeSelect = (event: any, selectedDate?: Date) => {
    if (!selectedDate) return;

    if (selectingStartDate) {
      setTempStartDate(selectedDate);
      setTempEndDate(null);
      setSelectingStartDate(false);
    } else {
      setTempEndDate(selectedDate);
    }
  };

  const confirmDateRange = () => {
    if (onDateRangeChange && tempStartDate) {
      onDateRangeChange(tempStartDate, tempEndDate);
    }
    setShowDateRangePicker(false);
    setSelectingStartDate(true);
  };

  const clearDateRange = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    if (onDateRangeChange) {
      onDateRangeChange(null, null);
    }
  };

  const renderDateInput = () => (
    <>
      <Pressable onPress={() => !disabled && setShowDatePicker(true)}>
        <Input
          size={size}
          isDisabled={disabled}
          isInvalid={isInvalid || !!error}
          isReadOnly={true}
        >
          {leftIcon && <InputSlot pl="$3">{leftIcon}</InputSlot>}
          <InputField
            placeholder={placeholder || "Select date"}
            value={value || formatDate(startDate || null)}
            editable={false}
          />
          <InputSlot pr="$3">
            <InputIcon as={Calendar} />
          </InputSlot>
        </Input>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </>
  );

  const renderDateRangeInput = () => (
    <>
      <Pressable onPress={() => !disabled && setShowDateRangePicker(true)}>
        <Input
          size={size}
          isDisabled={disabled}
          isInvalid={isInvalid || !!error}
          isReadOnly={true}
        >
          {leftIcon && <InputSlot pl="$3">{leftIcon}</InputSlot>}
          <InputField
            placeholder={placeholder || "Select date range"}
            value={
              startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                : startDate
                  ? formatDate(startDate)
                  : ""
            }
            editable={false}
          />
          <InputSlot pr="$3">
            <InputIcon as={Calendar} />
          </InputSlot>
        </Input>
      </Pressable>

      <Modal
        isOpen={showDateRangePicker}
        onClose={() => {
          setShowDateRangePicker(false);
          setSelectingStartDate(true);
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Select Date Range</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <Text>
                {selectingStartDate ? "Select start date" : "Select end date"}
              </Text>
              {tempStartDate && <Text>Start: {formatDate(tempStartDate)}</Text>}
              {tempEndDate && <Text>End: {formatDate(tempEndDate)}</Text>}
              <DateTimePicker
                value={
                  selectingStartDate
                    ? tempStartDate || new Date()
                    : tempEndDate || tempStartDate || new Date()
                }
                mode="date"
                display="spinner"
                onChange={handleDateRangeSelect}
                minimumDate={
                  selectingStartDate ? minDate : tempStartDate || minDate
                }
                maximumDate={maxDate}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space="md">
              <Button variant="outline" onPress={clearDateRange}>
                <ButtonText>Clear</ButtonText>
              </Button>
              <Button
                variant="outline"
                onPress={() => {
                  setShowDateRangePicker(false);
                  setSelectingStartDate(true);
                }}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button onPress={confirmDateRange} isDisabled={!tempStartDate}>
                <ButtonText>Confirm</ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );

  const renderPasswordInput = () => (
    <Input
      size={size}
      isDisabled={disabled}
      isInvalid={isInvalid || !!error}
      isReadOnly={isReadOnly}
    >
      {leftIcon && <InputSlot pl="$3">{leftIcon}</InputSlot>}
      <InputField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        type={showPassword ? "text" : "password"}
        maxLength={maxLength}
      />
      <InputSlot pr="$3" onPress={() => setShowPassword(!showPassword)}>
        <InputIcon as={showPassword ? Eye : EyeOff} />
      </InputSlot>
    </Input>
  );

  const renderTextAreaInput = () => (
    <Input
      size={size}
      isDisabled={disabled}
      isInvalid={isInvalid || !!error}
      isReadOnly={isReadOnly}
    >
      <InputField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={true}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        textAlignVertical="top"
      />
    </Input>
  );

  const renderStandardInput = () => (
    <Input
      size={size}
      isDisabled={disabled}
      isInvalid={isInvalid || !!error}
      isReadOnly={isReadOnly}
    >
      {leftIcon && <InputSlot pl="$3">{leftIcon}</InputSlot>}
      <InputField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={getKeyboardType()}
        autoCapitalize={getAutoCapitalize()}
        secureTextEntry={variant === "password" && !showPassword}
        maxLength={maxLength}
      />
      {rightIcon && <InputSlot pr="$3">{rightIcon}</InputSlot>}
    </Input>
  );

  const renderInput = () => {
    switch (variant) {
      case "date":
        return renderDateInput();
      case "daterange":
        return renderDateRangeInput();
      case "password":
        return renderPasswordInput();
      case "textarea":
        return renderTextAreaInput();
      default:
        return renderStandardInput();
    }
  };

  return (
    <FormControl
      size={size}
      isDisabled={disabled}
      isInvalid={isInvalid || !!error}
      isRequired={required}
      isReadOnly={isReadOnly}
    >
      {label && (
        <FormControlLabel>
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}

      {renderInput()}

      {helper && !error && (
        <FormControlHelper>
          <FormControlHelperText>{helper}</FormControlHelperText>
        </FormControlHelper>
      )}

      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};

export default CustomInput;
