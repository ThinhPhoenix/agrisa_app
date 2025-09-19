import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, Pressable, VStack } from "@gluestack-ui/themed";
import { Text } from "@gluestack-ui/themed/build/components/Badge/styled-components";
import { HelpCircle, Phone, PlusSquare, Satellite, UserPlus } from "lucide-react-native";

interface QuickAction {
  id: string;
  title: string;
  icon: any;
  color: string;
  onPress: () => void;
}

export default function QuickActions() {
  const { colors } = useAgrisaColors();

  // Sắp xếp lại thứ tự theo yêu cầu: Đăng ký => Vệ tinh => Trợ giúp => Liên hệ
  const mockActions: QuickAction[] = [
    {
      id: "1",
      title: "Đăng ký",
      icon: PlusSquare,
      color: colors.success,
      onPress: () => console.log("Đăng ký bảo hiểm"),
    },
    {
      id: "2",
      title: "Vệ tinh",
      icon: Satellite,
      color: colors.warning,
      onPress: () => console.log("Vệ tinh"),
    },
    {
      id: "3",
      title: "Trợ giúp",
      icon: HelpCircle,
      color: colors.pending,
      onPress: () => console.log("Trợ giúp"),
    },
    {
      id: "4",
      title: "Liên hệ",
      icon: Phone,
      color: colors.error,
      onPress: () => console.log("Liên hệ"),
    },
  ];

  return (
    <VStack space="md" paddingHorizontal={20}>
     

      {/* 4 cột ngang đều nhau */}
      <HStack space="sm" justifyContent="space-between">
        {mockActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Pressable
              key={action.id}
              onPress={action.onPress}
              flex={1} // Đảm bảo mỗi cột chiếm đều không gian
              marginHorizontal={2} // Khoảng cách nhỏ giữa các cột
            >
              <VStack
                alignItems="center"
                space="sm"
                paddingVertical={10}
                paddingHorizontal={8}

                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={4}
                elevation={2}
                minHeight={0} // Đảm bảo chiều cao tối thiểu đồng đều
              >
                {/* Icon với background màu */}
                
                <IconComponent size={30} color={action.color} />

                {/* Text content */}
                <VStack alignItems="center" space="xs" flex={1}>
                  <Text
                    color={colors.text}
                    fontSize="$xs"
                    fontWeight="600"
                    textAlign="center"
                    numberOfLines={1}
                  >
                    {action.title}
                  </Text>
                  
                </VStack>
              </VStack>
            </Pressable>
          );
        })}
      </HStack>
    </VStack>
  );
}
