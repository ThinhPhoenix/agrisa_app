import useAxios from "@/config/useAxios.config";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
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
      // Store return and cancel URLs from request body
      setReturnUrl(body.return_url);
      setCancelUrl(body.cancel_url);
      const response = await useAxios.post("/payment/protected/link", body);
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.checkout_url) {
      console.log("Payment checkout URL received:", data);
      setCheckoutUrl(data.checkout_url);
      // Navigate to PayOS page with checkout URL and return URLs from request body
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
