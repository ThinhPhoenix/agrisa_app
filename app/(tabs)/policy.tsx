import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Text, VStack } from "@gluestack-ui/themed";

export default function MessageScreen() {

    const { colors } = useAgrisaColors();


    return (
        <VStack flex={1} justifyContent="center" alignItems="center" bg={colors.background}>
            <Text>Message Screen</Text>
        </VStack>
    )
};
