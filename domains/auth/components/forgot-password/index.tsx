import { CustomForm, FormField } from "@/components/custom-form";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  Button,
  ButtonText,
  Image,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { KeyRound, Phone } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import useChangePass from "../../hooks/use-change-pass";
import useSendOtp from "../../hooks/use-send-otp";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_BORDER_COLOR = "rgba(255, 255, 255, 0.45)";
const CARD_GRADIENT = [
    "rgba(255,255,255,0.7)",
    "rgba(255,237,237,0.7)",
] as const;

const phoneFields: FormField[] = [
    {
        name: "phoneNumber",
        label: "Số điện thoại đã đăng ký",
        type: "input" as const,
        placeholder: "0987654321",
        required: true,
        startContent: <Phone size={18} color="#6B7280" strokeWidth={2} />,
        keyboardType: "phone-pad",
        validation: (value: string) => {
            if (!value.trim()) {
                return {
                    isValid: false,
                    errorMessage: "Vui lòng nhập số điện thoại",
                };
            }
            if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(value)) {
                return {
                    isValid: false,
                    errorMessage: "Số điện thoại không hợp lệ",
                };
            }
            return { isValid: true };
        },
    },
];

const otpPasswordFields: FormField[] = [
    {
        name: "otp",
        label: "Mã OTP",
        type: "input",
        placeholder: "Nhập mã OTP",
        required: true,
        startContent: <KeyRound size={18} color="#6B7280" strokeWidth={2} />,
        validation: (value: string) => {
            if (!value.trim()) {
                return { isValid: false, errorMessage: "Vui lòng nhập mã OTP" };
            }
            return { isValid: true };
        },
    },
    {
        name: "newPassword",
        label: "Mật khẩu mới",
        type: "password",
        placeholder: "Nhập mật khẩu mới",
        required: true,
        startContent: <KeyRound size={18} color="#6B7280" strokeWidth={2} />,
        validation: (value: string) => {
            if (!value.trim()) {
                return {
                    isValid: false,
                    errorMessage: "Vui lòng nhập mật khẩu mới",
                };
            }
            if (value.length < 6) {
                return {
                    isValid: false,
                    errorMessage: "Mật khẩu phải có ít nhất 6 ký tự",
                };
            }
            return { isValid: true };
        },
    },
    {
        name: "confirmPassword",
        label: "Xác nhận mật khẩu",
        type: "password",
        placeholder: "Nhập lại mật khẩu mới",
        required: true,
        startContent: <KeyRound size={18} color="#6B7280" strokeWidth={2} />,
        validation: (value: string, formValues: any) => {
            if (!value.trim()) {
                return {
                    isValid: false,
                    errorMessage: "Vui lòng xác nhận mật khẩu",
                };
            }
            if (value !== formValues.newPassword) {
                return {
                    isValid: false,
                    errorMessage: "Mật khẩu xác nhận không khớp",
                };
            }
            return { isValid: true };
        },
    },
];

const ForgotPasswordComponentUI = () => {
    const { colors } = useAgrisaColors();
    const sendOtpMutation = useSendOtp();
    const changePassMutation = useChangePass();

    const [step, setStep] = useState<
        "input-phone" | "enter-otp-password" | "success"
    >("input-phone");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const phoneFormRef = useRef<any>(null);
    const otpFormRef = useRef<any>(null);

    const resetState = () => {
        setStep("input-phone");
        setPhoneNumber("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
    };

    const handleSendOtp = async () => {
        const isValid = phoneFormRef.current?.validateFields();
        if (!isValid) return;
        try {
            await sendOtpMutation.sendOtp(phoneNumber);
            setStep("enter-otp-password");
        } catch (error) {
            console.error("Failed to send OTP");
        }
    };

    const handleChangePassword = async () => {
        const isValid = otpFormRef.current?.validateFields();
        if (!isValid) return;
        try {
            await changePassMutation.mutateAsync({
                otp: otp,
                new_password: newPassword,
                phone: phoneNumber,
            });
            setStep("success");
        } catch (error) {
            console.error("Failed to change password");
        }
    };

    // Render success screen
    if (step === "success") {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ImageBackground
                        source={require("@/assets/images/Login/Agrisa-Auth.png")}
                        style={{ flex: 1 }}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={[
                                "rgba(89, 172, 119, 0.3)",
                                "rgba(89, 172, 119, 0.6)",
                            ]}
                            style={{ flex: 1 }}
                        >
                            <VStack
                                flex={1}
                                justifyContent="center"
                                px="$5"
                                space="lg"
                            >
                                {/* Logo */}
                                <Box alignItems="center">
                                    <Image
                                        source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                                        alt="Agrisa Logo"
                                        style={{
                                            width: 100,
                                            height: 100,
                                        }}
                                        resizeMode="contain"
                                    />
                                </Box>

                                {/* Success Card */}
                                <LinearGradient
                                    colors={CARD_GRADIENT}
                                    style={{
                                        borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor: CARD_BORDER_COLOR,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box p="$5">
                                        <VStack space="md" alignItems="center">
                                            {/* Success Icon */}
                                            <Box
                                                bg={colors.success}
                                                p="$4"
                                                borderRadius="$full"
                                                mb="$2"
                                            >
                                                <KeyRound
                                                    size={40}
                                                    color="white"
                                                    strokeWidth={2}
                                                />
                                            </Box>

                                            {/* Title */}
                                            <Text
                                                fontSize="$xl"
                                                fontWeight="$bold"
                                                color={colors.primary_text}
                                                textAlign="center"
                                            >
                                                Mật khẩu đã được thay đổi!
                                            </Text>

                                            {/* Message */}
                                            <Text
                                                fontSize="$sm"
                                                color={colors.secondary_text}
                                                textAlign="center"
                                                lineHeight="$lg"
                                                px="$2"
                                            >
                                                Mật khẩu của bạn đã được cập
                                                nhật thành công.
                                                {"\n\n"}
                                                Bây giờ bạn có thể đăng nhập với
                                                mật khẩu mới.
                                            </Text>

                                            {/* Back to Login Button */}
                                            <Button
                                                onPress={() => {
                                                    resetState();
                                                    router.replace(
                                                        "/auth/sign-in"
                                                    );
                                                }}
                                                size="md"
                                                bg={colors.success}
                                                borderRadius="$lg"
                                                mt="$4"
                                                width="100%"
                                                $active-opacity={0.8}
                                            >
                                                <ButtonText
                                                    color={
                                                        colors.primary_white_text
                                                    }
                                                    fontWeight="$bold"
                                                    fontSize="$sm"
                                                >
                                                    Đăng nhập ngay
                                                </ButtonText>
                                            </Button>
                                        </VStack>
                                    </Box>
                                </LinearGradient>
                            </VStack>
                        </LinearGradient>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        );
    }

    // Render enter OTP and password form
    if (step === "enter-otp-password") {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ImageBackground
                        source={require("@/assets/images/Login/Agrisa-Auth.png")}
                        style={{ flex: 1 }}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={[
                                "rgba(89, 172, 119, 0.3)",
                                "rgba(89, 172, 119, 0.6)",
                            ]}
                            style={{ flex: 1 }}
                        >
                            <VStack
                                flex={1}
                                justifyContent="center"
                                px="$5"
                                space="lg"
                            >
                                {/* Logo */}
                                <Box alignItems="center">
                                    <Image
                                        source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                                        alt="Agrisa Logo"
                                        style={{
                                            width: 100,
                                            height: 100,
                                        }}
                                        resizeMode="contain"
                                    />
                                </Box>

                                {/* Change Password Card */}
                                <LinearGradient
                                    colors={CARD_GRADIENT}
                                    style={{
                                        borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor: CARD_BORDER_COLOR,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box p="$5">
                                        {/* Header */}
                                        <VStack
                                            space="xs"
                                            alignItems="center"
                                            mb="$4"
                                        >
                                            <Text
                                                fontSize="$xl"
                                                fontWeight="$bold"
                                                color={colors.primary_text}
                                                textAlign="center"
                                            >
                                                Đặt lại mật khẩu
                                            </Text>
                                            <Text
                                                fontSize="$xs"
                                                color={colors.secondary_text}
                                                textAlign="center"
                                                lineHeight="$sm"
                                                px="$2"
                                            >
                                                Nhập mã OTP và mật khẩu mới
                                            </Text>
                                        </VStack>

                                        {/* Form Fields */}
                                        <CustomForm
                                            ref={otpFormRef}
                                            fields={otpPasswordFields}
                                            initialValues={{
                                                otp: otp,
                                                newPassword: newPassword,
                                                confirmPassword:
                                                    confirmPassword,
                                            }}
                                            onValuesChange={(values) => {
                                                setOtp(values.otp || "");
                                                setNewPassword(
                                                    values.newPassword || ""
                                                );
                                                setConfirmPassword(
                                                    values.confirmPassword || ""
                                                );
                                            }}
                                            showSubmitButton={false}
                                            gap={12}
                                        />

                                        {/* Submit Button */}
                                        <Button
                                            onPress={handleChangePassword}
                                            isDisabled={
                                                changePassMutation.isPending
                                            }
                                            size="md"
                                            bg={colors.primary}
                                            borderRadius="$lg"
                                            mt="$5"
                                            $active-opacity={0.8}
                                        >
                                            <ButtonText
                                                color={
                                                    colors.primary_white_text
                                                }
                                                fontWeight="$bold"
                                                fontSize="$sm"
                                            >
                                                {changePassMutation.isPending
                                                    ? "Đang xử lý..."
                                                    : "Đặt lại mật khẩu"}
                                            </ButtonText>
                                        </Button>

                                        {/* Footer */}
                                        <VStack
                                            space="md"
                                            alignItems="center"
                                            mt="$6"
                                        >
                                            <Box
                                                borderTopWidth={1}
                                                borderTopColor={colors.primary}
                                                width="100%"
                                                pt="$3"
                                            >
                                                <Text
                                                    fontSize="$sm"
                                                    color={
                                                        colors.secondary_text
                                                    }
                                                    textAlign="center"
                                                >
                                                    <Text
                                                        fontSize="$sm"
                                                        color={colors.success}
                                                        fontWeight="$bold"
                                                        onPress={() =>
                                                            setStep(
                                                                "input-phone"
                                                            )
                                                        }
                                                    >
                                                        Quay lại
                                                    </Text>
                                                </Text>
                                            </Box>
                                        </VStack>
                                    </Box>
                                </LinearGradient>
                            </VStack>
                        </LinearGradient>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        );
    }

    // Render input phone form
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ImageBackground
                    source={require("@/assets/images/Login/Agrisa-Auth.png")}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={[
                            "rgba(89, 172, 119, 0.3)",
                            "rgba(89, 172, 119, 0.6)",
                        ]}
                        style={{ flex: 1 }}
                    >
                        <VStack
                            flex={1}
                            justifyContent="center"
                            px="$5"
                            space="lg"
                        >
                            {/* Logo */}
                            <Box alignItems="center">
                                <Image
                                    source={require("@/assets/images/Logo/Agrisa_Logo.png")}
                                    alt="Agrisa Logo"
                                    style={{
                                        width: 100,
                                        height: 100,
                                    }}
                                    resizeMode="contain"
                                />
                            </Box>

                            {/* Forgot Password Card */}
                            <LinearGradient
                                colors={CARD_GRADIENT}
                                style={{
                                    borderRadius: 20,
                                    borderWidth: 2,
                                    borderColor: CARD_BORDER_COLOR,
                                    overflow: "hidden",
                                }}
                            >
                                <Box p="$5">
                                    {/* Header */}
                                    <VStack
                                        space="xs"
                                        alignItems="center"
                                        mb="$4"
                                    >
                                        <Text
                                            fontSize="$xl"
                                            fontWeight="$bold"
                                            color={colors.primary_text}
                                            textAlign="center"
                                        >
                                            Quên mật khẩu
                                        </Text>
                                        <Text
                                            fontSize="$xs"
                                            color={colors.secondary_text}
                                            textAlign="center"
                                            lineHeight="$sm"
                                            px="$2"
                                        >
                                            Nhập số điện thoại để nhận mã OTP
                                            đặt lại mật khẩu
                                        </Text>
                                    </VStack>

                                    {/* Form Fields */}
                                    <CustomForm
                                        ref={phoneFormRef}
                                        fields={phoneFields}
                                        initialValues={{ phoneNumber }}
                                        onValuesChange={(values) => {
                                            const transformedPhone =
                                                values.phoneNumber
                                                    ?.replace(/\D/g, "")
                                                    .slice(0, 10) || "";
                                            setPhoneNumber(transformedPhone);
                                        }}
                                        showSubmitButton={false}
                                        gap={12}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        onPress={handleSendOtp}
                                        isDisabled={sendOtpMutation.isPending}
                                        size="md"
                                        bg={colors.primary}
                                        borderRadius="$lg"
                                        mt="$5"
                                        $active-opacity={0.8}
                                    >
                                        <ButtonText
                                            color={colors.primary_white_text}
                                            fontWeight="$bold"
                                            fontSize="$sm"
                                        >
                                            {sendOtpMutation.isPending
                                                ? "Đang gửi..."
                                                : "Gửi mã OTP"}
                                        </ButtonText>
                                    </Button>

                                    {/* Footer */}
                                    <VStack
                                        space="md"
                                        alignItems="center"
                                        mt="$6"
                                    >
                                        <Box
                                            borderTopWidth={1}
                                            borderTopColor={colors.primary}
                                            width="100%"
                                            pt="$3"
                                        >
                                            <Text
                                                fontSize="$sm"
                                                color={colors.secondary_text}
                                                textAlign="center"
                                            >
                                                Nhớ lại mật khẩu?{" "}
                                                <Text
                                                    fontSize="$sm"
                                                    color={colors.success}
                                                    fontWeight="$bold"
                                                    onPress={() =>
                                                        router.replace(
                                                            "/auth/sign-in"
                                                        )
                                                    }
                                                >
                                                    Đăng nhập ngay
                                                </Text>
                                            </Text>
                                        </Box>
                                    </VStack>
                                </Box>
                            </LinearGradient>
                        </VStack>
                    </LinearGradient>
                </ImageBackground>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordComponentUI;
