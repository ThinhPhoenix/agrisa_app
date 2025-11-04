import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import PublicBasePolicyScreen from "@/domains/policy/components/public-base-policy";
import { VStack } from "@gluestack-ui/themed";

export default function MessageScreen() {
  const { colors } = useAgrisaColors();

  return (
    <VStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      bg={colors.background}
    >
      <PublicBasePolicyScreen />
    </VStack>
  );
}
