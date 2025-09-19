import HomeHeader from "@/components/HomeScreen/HomeHeader";
import InsuranceCards from "@/components/HomeScreen/InsuranceCards";
import MyFormsList from "@/components/HomeScreen/MyFarmList";
import QuickActions from "@/components/HomeScreen/QuickActions";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { ScrollView, VStack } from "@gluestack-ui/themed";

export default function HomeScreen() {
  const { colors } = useAgrisaColors();

  return (
    <ScrollView
      flex={1}
      bg={colors.background}
      showsVerticalScrollIndicator={false}
    >
      <VStack>
        <HomeHeader />
        <InsuranceCards />
        <QuickActions />
        <MyFormsList />
      </VStack>
    </ScrollView>
  );
}
