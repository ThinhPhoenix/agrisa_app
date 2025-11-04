import { Button, VStack } from "@gluestack-ui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { AgrisaHeader } from "../../../components/Header";
import useCreatePayment from "../../../domains/payment/hooks/use-create-payment";
import { colors } from "../../../domains/shared/constants/colors";

// Define the Policy interface based on the provided struct
interface Policy {
  id: string;
  insurance_provider_id: string;
  product_name: string;
  product_code?: string;
  product_description?: string;
  crop_type: string;
  coverage_currency: string;
  coverage_duration_days: number;
  fix_premium_amount: number;
  is_per_hectare: boolean;
  premium_base_rate: number;
  fix_payout_amount: number;
  is_payout_per_hectare: boolean;
  over_threshold_multiplier: number;
  payout_base_rate: number;
  data_complexity_score: number;
  monthly_data_cost: number;
  status: string; // Assuming BasePolicyStatus is a string enum
  template_document_url?: string;
  document_validation_status: string; // Assuming ValidationStatus is a string
  document_validation_score?: number;
  important_additional_information?: any;
  created_at: string; // ISO string
  updated_at: string;
  created_by?: string;
}

// Mock data for demonstration
const mockPolicies: Policy[] = [
  {
    id: "1",
    insurance_provider_id: "provider1",
    product_name: "Crop Insurance Basic",
    product_code: "CIB001",
    crop_type: "Rice",
    coverage_currency: "VND",
    coverage_duration_days: 365,
    fix_premium_amount: 1000000,
    is_per_hectare: true,
    premium_base_rate: 0.05,
    fix_payout_amount: 5000000,
    is_payout_per_hectare: true,
    over_threshold_multiplier: 1.2,
    payout_base_rate: 0.1,
    data_complexity_score: 5,
    monthly_data_cost: 10000,
    status: "active",
    document_validation_status: "validated",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    insurance_provider_id: "provider2",
    product_name: "Flood Protection",
    product_code: "FP002",
    crop_type: "Corn",
    coverage_currency: "VND",
    coverage_duration_days: 180,
    fix_premium_amount: 500000,
    is_per_hectare: false,
    premium_base_rate: 0.03,
    fix_payout_amount: 2000000,
    is_payout_per_hectare: false,
    over_threshold_multiplier: 1.5,
    payout_base_rate: 0.08,
    data_complexity_score: 3,
    monthly_data_cost: 5000,
    status: "pending",
    document_validation_status: "pending",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-01T00:00:00Z",
  },
  // Add more mock data as needed
];

export default function PolicyDetail() {
  const { id } = useLocalSearchParams();
  const { mutate, isPending } = useCreatePayment();

  // Find the policy by id (in real app, fetch from API)
  const policy = mockPolicies.find((p) => p.id === id);

  if (!policy) {
    return (
      <VStack className="flex-1 bg-white">
        <AgrisaHeader title="Policy Detail" />
        <View className="flex-1 justify-center items-center">
          <Text>Policy not found</Text>
        </View>
      </VStack>
    );
  }

  const handlePay = () => {
    mutate({
      amount: policy.fix_premium_amount,
      description: `Payment for ${policy.product_name}`,
      return_url: "http://agrisa-api.phrimp.io.vn/success-fallback",
      cancel_url: "http://agrisa-api.phrimp.io.vn/cancel-fallback",
      type: "hop_hong",
      items: [
        {
          item_id: policy.id,
          name: policy.product_name,
          price: policy.fix_premium_amount,
          quantity: 1,
        },
      ],
    });
  };

  return (
    <VStack className="flex-1 bg-white">
      <AgrisaHeader title="Policy Detail" />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-white p-4 rounded-xl border border-gray-300 mb-4">
          <Text className="text-black font-bold text-xl mb-4">
            {policy.product_name}
          </Text>

          <View className="mb-2">
            <Text className="text-gray-600 text-sm">Product Code</Text>
            <Text className="text-black">{policy.product_code || "N/A"}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-600 text-sm">Crop Type</Text>
            <Text className="text-black">{policy.crop_type}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-600 text-sm">Coverage Currency</Text>
            <Text className="text-black">{policy.coverage_currency}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-600 text-sm">Coverage Duration</Text>
            <Text className="text-black">
              {policy.coverage_duration_days} days
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-600 text-sm">Premium Amount</Text>
            <Text className="text-black">
              {policy.fix_premium_amount.toLocaleString()}{" "}
              {policy.coverage_currency}
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-600 text-sm">Status</Text>
            <Text className="text-black capitalize">{policy.status}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-600 text-sm">Created At</Text>
            <Text className="text-black">
              {new Date(policy.created_at).toLocaleDateString()}
            </Text>
          </View>

          {policy.product_description && (
            <View className="mb-2">
              <Text className="text-gray-600 text-sm">Description</Text>
              <Text className="text-black">{policy.product_description}</Text>
            </View>
          )}
        </View>

        {policy.status === "pending" && (
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
              onPress={handlePay}
              disabled={isPending}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
              }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Thanh toán {policy.fix_premium_amount.toLocaleString()}₫
                </Text>
              )}
            </Button>
          </LinearGradient>
        )}
      </ScrollView>
    </VStack>
  );
}
