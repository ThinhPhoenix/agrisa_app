import { CustomForm, FormField } from "@/components/custom-form";
import { AgrisaHeader } from "@/components/Header";
import { useGlobalNotification } from "@/components/modal/providers";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import useChangePass from "@/domains/auth/hooks/use-change-pass";
import useSendOtp from "@/domains/auth/hooks/use-send-otp";
import { useAuthStore } from "@/domains/auth/stores/auth.store";

import {
    Box,
    Button,
    ButtonText,
    ScrollView,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";

export default function ChangePasswordScreen() {
    const { colors } = useAgrisaColors();
    const notification = useGlobalNotification();

    const { sendOtp, isPending: isSending } = useSendOtp();
    const { user } = useAuthStore();

    // OTP resend / cooldown state
    const [countdown, setCountdown] = useState(0);
    const [otpSentCount, setOtpSentCount] = useState(0);
    const [lastOtpTime, setLastOtpTime] = useState<number | null>(null);

    const canSendOtp = (): boolean => {
        if (otpSentCount >= 5) {
            notification.error(
                "Bạn đã gửi OTP quá 5 lần. Vui lòng liên hệ hỗ trợ!"
            );
            return false;
        }

        if (lastOtpTime) {
            const timeSince = Date.now() - lastOtpTime;
            const cooldown = 60 * 1000; // 1 phút
            if (timeSince < cooldown) {
                const timeLeft = Math.ceil((cooldown - timeSince) / 1000);
                notification.error(
                    `Vui lòng đợi ${timeLeft} giây trước khi gửi lại OTP`
                );
                return false;
            }
        }

        return true;
    };

    const sendOtpToPhone = async () => {
        const phoneRaw = user?.phone_number
            ? String(user.phone_number).trim()
            : null;
        const phone = phoneRaw ? phoneRaw.replace(/^['"]+|['"]+$/g, "") : null;
        if (!phone) {
            notification.error("Không tìm thấy số điện thoại để gửi OTP");
            return;
        }

        if (!canSendOtp()) return;

        try {
            await sendOtp(phone);
            setOtpSentCount((c) => c + 1);
            setLastOtpTime(Date.now());
            setCountdown(60);
            notification.success("Đã gửi mã OTP đến số điện thoại của bạn");
        } catch (error: any) {
            console.error("❌ Error sending OTP:", error);
            const errMsg =
                error?.response?.data?.message ||
                "Không thể gửi mã OTP. Vui lòng thử lại!";
            notification.error(errMsg);
        }
    };

    // Auto-send once on mount if phone exists (keeps previous behavior)
    // React.useEffect(() => {
    //     const phone = user?.phone_number
    //         ? String(user.phone_number)
    //               .trim()
    //               .replace(/^['"]+|['"]+$/g, "")
    //         : null;
    //     if (phone) {
    //         // fire and forget - sendOtpToPhone will handle notifications/state
    //         sendOtpToPhone();
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [user?.phone_number]);

    // Countdown timer for resend
    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown((c) => c - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const maskPhone = (p?: string | null) => {
        if (!p) return "";
        const phone = p.replace(/^['"]+|['"]+$/g, "");
        if (phone.length === 10) {
            return `${phone.slice(0, 3)}****${phone.slice(7)}`;
        }
        return phone;
    };

    const formRef = useRef<any>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const formFields: FormField[] = [
        {
            name: "otp",
            label: "Mã OTP",
            type: "input",
            placeholder: "Nhập mã OTP (6 chữ số)",
            required: true,
            validation: (value) => {
                if (!value || !value.trim()) {
                    return {
                        isValid: false,
                        errorMessage: "Vui lòng nhập mã OTP",
                    };
                }
                if (String(value).trim().length !== 6) {
                    return {
                        isValid: false,
                        errorMessage: "Mã OTP gồm 6 chữ số",
                    };
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
            validation: (value, formValues) => {
                if (!value || !value.trim()) {
                    return {
                        isValid: false,
                        errorMessage: "Vui lòng nhập mật khẩu mới",
                    };
                }
                if (value.length < 8) {
                    return {
                        isValid: false,
                        errorMessage: "Mật khẩu mới phải có ít nhất 8 ký tự",
                    };
                }
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return {
                        isValid: false,
                        errorMessage:
                            "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                    };
                }

                return { isValid: true };
            },
        },
        {
            name: "confirmPassword",
            label: "Xác nhận mật khẩu mới",
            type: "password",
            placeholder: "Nhập lại mật khẩu mới",
            required: true,
            validation: (value, formValues) => {
                if (!value || !value.trim()) {
                    return {
                        isValid: false,
                        errorMessage: "Vui lòng xác nhận mật khẩu mới",
                    };
                }
                if (value !== formValues?.newPassword) {
                    return {
                        isValid: false,
                        errorMessage: "Mật khẩu xác nhận không khớp",
                    };
                }
                return { isValid: true };
            },
        },
    ];

    const changePassMutation = useChangePass();

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            setIsSubmitting(true);

            // Call mutation to change password (OTP-only flow)
            await changePassMutation.mutateAsync({
                otp: String(values.otp).trim(),
                new_password: values.newPassword,
            });

            notification.success("Đổi mật khẩu thành công!");
            // Navigate back
            router.back();
        } catch (error: any) {
            console.error("❌ Error changing password:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Không thể đổi mật khẩu. Vui lòng thử lại!";
            notification.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <AgrisaHeader title="Đổi mật khẩu" />
            <ScrollView flex={1} bg={colors.background}>
                <VStack p="$4" space="lg" pb="$8">
                    {/* Header */}
                    <Box>
                        <Text
                            fontSize="$xl"
                            fontWeight="$bold"
                            color={colors.primary_text}
                        >
                            Đổi mật khẩu
                        </Text>
                        <Text
                            fontSize="$sm"
                            color={colors.secondary_text}
                            mt="$2"
                        >
                            Để bảo mật tài khoản, vui lòng nhập mã OTP và mật
                            khẩu mới.
                        </Text>
                    </Box>

                    {/* OTP send info + Form */}

                    <Box
                        style={{
                            backgroundColor: colors.card_surface,
                            borderRadius: 12,
                            padding: 14,
                            marginBottom: 10,
                        }}
                    >
                        <Text
                            style={{
                                color: colors.primary_text,
                                fontSize: 14,
                                marginBottom: 8,
                            }}
                        >
                            Mã OTP sẽ được gửi tới{" "}
                            {maskPhone(user?.phone_number)}
                        </Text>

                        {countdown > 0 ? (
                            <Text
                                style={{
                                    color: colors.secondary_text,
                                    fontSize: 14,
                                }}
                            >
                                Gửi lại sau {countdown}s
                            </Text>
                        ) : (
                            <Button
                                onPress={sendOtpToPhone}
                                disabled={isSending}
                                bg={
                                    isSending
                                        ? colors.frame_border
                                        : colors.primary
                                }
                                borderRadius={12}
                                p="$3"
                                style={{ alignSelf: "flex-start" }}
                            >
                                {isSending ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ButtonText
                                        fontSize="$sm"
                                        fontWeight="$bold"
                                    >
                                        Gửi mã OTP
                                    </ButtonText>
                                )}
                            </Button>
                        )}
                    </Box>

                    <CustomForm
                        ref={formRef}
                        fields={formFields}
                        onSubmit={handleSubmit}
                        isSubmitting={
                            changePassMutation.isPending || isSubmitting
                        }
                        submitButtonText="Đổi mật khẩu"
                        showSubmitButton={false}
                        formStyle={{
                            backgroundColor: colors.card_surface,
                            borderRadius: 16,
                            padding: 20,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 5,
                        }}
                    />

                    {/* Custom Submit Button with Icon */}
                    <Box mt="$4">
                        <Pressable
                            onPress={() => {
                                if (formRef.current) {
                                    const values =
                                        formRef.current.validateFields();
                                    if (values) {
                                        handleSubmit(values);
                                    }
                                }
                            }}
                            disabled={
                                changePassMutation.isPending || isSubmitting
                            }
                            style={{
                                backgroundColor: colors.primary,
                                borderRadius: 12,
                                padding: 16,
                                height: 56,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                                opacity:
                                    changePassMutation.isPending || isSubmitting
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            {changePassMutation.isPending || isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <KeyRound size={20} color="white" />
                                    <Text
                                        style={{
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            marginLeft: 8,
                                            color: "white",
                                        }}
                                    >
                                        Đổi mật khẩu
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </Box>
                </VStack>
            </ScrollView>
        </>
    );
}
