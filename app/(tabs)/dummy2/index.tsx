import useCreatePayment from "@/domains/payment/hooks/use-create-payment";
import { Button, Text as GlueText, Switch, VStack } from "@gluestack-ui/themed";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { secureStorage } from "../../../domains/shared/utils/secureStorage";

export default function Dummy2() {
  const [enableFaceID, setEnableFaceID] = useState(false);
  const { mutate, isPending } = useCreatePayment();

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
    </VStack>
  );
}
