import useAuthMe from "@/domains/auth/hooks/use-auth-me";
import useCreatePayment from "@/domains/payment/hooks/use-create-payment";
import { Button, Text as GlueText, Switch, VStack } from "@gluestack-ui/themed";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { secureStorage } from "../../../domains/shared/utils/secureStorage";
import { Link } from "expo-router";

export default function Dummy2() {
  const [enableFaceID, setEnableFaceID] = useState(false);
  const { mutate, isPending } = useCreatePayment();
  const {
    data: authMeData,
    isLoading: isAuthMeLoading,
    error: authMeError,
    refetch: refetchAuthMe,
  } = useAuthMe();

  useEffect(() => {
    const loadEnableFaceID = async () => {
      const enabled = await secureStorage.getEnableFaceID();
      setEnableFaceID(enabled);
    };
    loadEnableFaceID();
  }, []);

  const handleToggleFaceID = async (value: boolean) => {
    setEnableFaceID(value);
    await secureStorage.setEnableFaceID(value);
  };

  const handlePay = () => {
    mutate({
      amount: 2000,
      description: "Test payments",
      return_url: "http://agrisa-api.phrimp.io.vn/success-fallback",
      cancel_url: "http://agrisa-api.phrimp.io.vn/cancel-fallback",
      type: "hop_hong",
      items: [
        {
          item_id: "item123",
          name: "Test Item 1",
          price: 1000,
          quantity: 1,
        },
        {
          item_id: "item456",
          name: "Test Item 2",
          price: 500,
          quantity: 2,
        },
      ],
    });
  };

  return (
    <VStack padding={10}>
      {/* Auth Me Data Display */}
      <View className="mb-4 p-4 bg-blue-50 rounded-lg">
        <GlueText className="text-lg font-bold text-blue-800 mb-2">
          Auth Me Data
        </GlueText>

        {isAuthMeLoading && (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="ml-2 text-blue-600">Loading auth data...</Text>
          </View>
        )}

        {authMeError && (
          <Text className="text-red-600">
            Error:{" "}
            {authMeError instanceof Error
              ? authMeError.message
              : "Unknown error"}
          </Text>
        )}

        {authMeData && (
          <View>
            <Text className="text-green-600 font-medium mb-2">
              ✅ Auth Me Success!
            </Text>
            <Text className="text-gray-800 font-mono text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(authMeData, null, 2)}
            </Text>
          </View>
        )}

        <Button
          onPress={() => refetchAuthMe()}
          className="mt-2 bg-blue-500"
          size="sm"
        >
          <Text className="text-white">Refresh Auth Me</Text>
        </Button>
      </View>

      <View className="flex-row items-center justify-between px-4 py-2 bg-gray-100 rounded-lg">
        <GlueText className="text-black">Bật đăng nhập bằng FaceID</GlueText>
        <Switch
          value={enableFaceID}
          onValueChange={handleToggleFaceID}
          size="md"
        />
      </View>
      <View>
        <Button
          onPress={handlePay}
          disabled={isPending}
          className="w-full flex items-center justify-center"
        >
          {isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text>Thanh toán 2000₫</Text>
          )}
        </Button>
      </View>
      <View>
        <Link href="/register-policy">
          <Text className="text-blue-500">Go to Register Policy</Text>
        </Link>
      </View>
    </VStack>
  );
}
