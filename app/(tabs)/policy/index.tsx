import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import PublicBasePolicyScreen from "@/domains/policy/components/public-base-policy";
import { VStack } from "@gluestack-ui/themed";

export default function MessageScreen() {
  const { colors } = useAgrisaColors();

  return (
    <>
      <PublicBasePolicyScreen />
    </>
  );
}
