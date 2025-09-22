import { CustomForm, FormField } from "@/components/custom-form";
import { VStack } from "@gluestack-ui/themed";
import { View } from "react-native";

export default function SignInScreen() {
  const fields: FormField[] = [
    {
      type: "input",
      name: "username",
      label: "Tên tài khoảng",
      required: true,
      placeholder: "Nhập tài khoảng của bạn",
    },
    {
      type: "password",
      name: "password",
      label: "Mật khẩu",
      required: true,
      placeholder: "Nhập mật khẩu của bạn",
    },
    {
      type: "button",
      name: "submit",
      label: "Đăng nhập",
      onClick: () => {
        console.log("Sign In button pressed");
      },
    },
  ];

  return (
    <VStack justifyContent="center">
      <View className="p-4 w-full">
        <CustomForm fields={fields} />
      </View>
    </VStack>
  );
}
