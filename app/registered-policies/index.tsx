import { VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { AgrisaHeader } from "../../components/Header";

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

const PolicyItem = ({ policy }: { policy: Policy }) => (
  <Pressable onPress={() => router.push(`/registered-policies/${policy.id}`)}>
    <View className="bg-white p-4 rounded-xl border border-gray-300 relative mb-4">
      <View className="flex-row gap-1 absolute top-2 right-2 z-10 bg-red-200 border border-red-500 px-1 py-0.5 rounded-md">
        <Text className="text-red-600 font-semibold text-xs capitalize">
          {policy.status}
        </Text>
      </View>
      <Text className="text-black font-bold text-lg mb-2 line-clamp-2">
        {policy.product_name}
      </Text>
      <Text className="text-black mb-1 truncate">
        Crop Type: {policy.crop_type}
      </Text>
      <Text className="text-black mb-1 truncate">
        Currency: {policy.coverage_currency}
      </Text>
      <Text className="text-black truncate">
        Created: {new Date(policy.created_at).toLocaleDateString()}
      </Text>
      <View className="absolute bottom-4 right-4 z-10">
        <Text className="text-primary-500 font-semibold text-xs">
          Xem chi tiết
        </Text>
      </View>
    </View>
  </Pressable>
);

export default function RegisteredPolicies() {
  return (
    <VStack className="flex-1 bg-white">
      <AgrisaHeader title="Registered Policies" />
      <View className="flex-1 px-4 pt-4">
        <FlatList
          data={mockPolicies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PolicyItem policy={item} />}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    </VStack>
  );
}
