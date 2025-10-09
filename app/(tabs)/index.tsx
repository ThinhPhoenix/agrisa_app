import HomeHeader from "@/components/home-screen/home-header";
import InsuranceCards from "@/components/home-screen/insurance-card";
import MyFormsList from "@/components/home-screen/my-farm-list";
import QuickActions from "@/components/home-screen/quick-actions";
import { useAgrisaColors } from "@/domains/agrisa-theme/hooks/use-agrisa-colors";
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
