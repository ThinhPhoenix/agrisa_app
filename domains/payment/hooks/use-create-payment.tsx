import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { CreatePaymentSchema } from "../schemas/create-payment.schema";

interface PaymentResponse {
  checkout_url: string;
}

const useCreatePayment = () => {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string>("");
  const [cancelUrl, setCancelUrl] = useState<string>("");

  const { data, error, mutate, isPending, reset } = useMutation<
    PaymentResponse,
    Error,
    CreatePaymentSchema
  >({
    mutationKey: ["create-payment"],
    mutationFn: async (body: CreatePaymentSchema) => {
      // ✅ Tự động generate URLs phù hợp với môi trường
      // Dev: exp://192.168.x.x:8081/--/payment/success
      // Prod: agrisa://payment/success
      const appReturnUrl = __DEV__
        ? Linking.createURL('payment/success')
        : 'agrisa://payment/success';
      
      const appCancelUrl = __DEV__
        ? Linking.createURL('payment/cancel')
        : 'agrisa://payment/cancel';

      console.log('🌍 Environment:', __DEV__ ? 'Development' : 'Production');
      console.log('✅ Return URL:', appReturnUrl);
      console.log('❌ Cancel URL:', appCancelUrl);

      setReturnUrl(appReturnUrl);
      setCancelUrl(appCancelUrl);

      // Gửi request với URLs tương ứng môi trường
      const requestBody = {
        ...body,
        return_url: appReturnUrl,
        cancel_url: appCancelUrl,
      };

      const response = await useAxios.post("/payment/protected/link", requestBody);
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.checkout_url) {
      console.log("💳 Payment checkout URL received:", data);
      setCheckoutUrl(data.checkout_url);
      // Navigate to PayOS WebView
      router.push({
        pathname: "/payos",
        params: {
          checkoutUrl: data.checkout_url,
          returnUrl: returnUrl,
          cancelUrl: cancelUrl,
        },
      });
      reset();
    }
  }, [data, returnUrl, cancelUrl, reset]);

  useEffect(() => {
    if (!data) {
      setCheckoutUrl(null);
      setReturnUrl("");
      setCancelUrl("");
    }
  }, [data]);

  return {
    data,
    error,
    mutate,
    isPending,
    checkoutUrl,
    returnUrl,
    cancelUrl,
    reset,
  };
};

export default useCreatePayment;
