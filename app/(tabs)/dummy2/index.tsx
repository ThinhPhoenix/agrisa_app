import { Text as GlueText, Switch, VStack } from "@gluestack-ui/themed";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { secureStorage } from "../../../domains/shared/utils/secureStorage";

export default function Dummy2() {
  const [enableFaceID, setEnableFaceID] = useState(false);

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

  return (
    <VStack className="flex-1 bg-white justify-center items-center">
      <View className="flex-row items-center justify-between px-4 py-2 bg-gray-100 rounded-lg">
        <GlueText className="text-black">Bật đăng nhập bằng FaceID</GlueText>
        <Switch
          value={enableFaceID}
          onValueChange={handleToggleFaceID}
          size="md"
        />
      </View>
    </VStack>
  );
}
