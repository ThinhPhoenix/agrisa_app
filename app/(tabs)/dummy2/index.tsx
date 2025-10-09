import { Text as GlueText, Switch, VStack } from "@gluestack-ui/themed";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { CustomInput } from "../../../components/custom-input";
import { secureStorage } from "../../../domains/shared/utils/secure-storage";

export default function Dummy2() {
  const [enableFaceID, setEnableFaceID] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
    <VStack className="flex-1 bg-white justify-center items-center p-4">
      <View className="flex-row items-center justify-between px-4 py-2 bg-gray-100 rounded-lg mb-4">
        <GlueText className="text-black">Bật đăng nhập bằng FaceID</GlueText>
        <Switch
          value={enableFaceID}
          onValueChange={handleToggleFaceID}
          size="md"
        />
      </View>

      <VStack space="md" className="w-full">
        <CustomInput
          variant="text"
          label="Text Input"
          placeholder="Enter text"
          value={textValue}
          onChangeText={setTextValue}
        />
        <CustomInput
          variant="number"
          label="Number Input"
          placeholder="Enter number"
          value={numberValue}
          onChangeText={setNumberValue}
        />
        <CustomInput
          variant="phone"
          label="Phone Input"
          placeholder="Enter phone"
          value={phoneValue}
          onChangeText={setPhoneValue}
        />
        <CustomInput
          variant="email"
          label="Email Input"
          placeholder="Enter email"
          value={emailValue}
          onChangeText={setEmailValue}
        />
        <CustomInput
          variant="password"
          label="Password Input"
          placeholder="Enter password"
          value={passwordValue}
          onChangeText={setPasswordValue}
        />
        <CustomInput
          variant="url"
          label="URL Input"
          placeholder="Enter URL"
          value={urlValue}
          onChangeText={setUrlValue}
        />
        <CustomInput
          variant="search"
          label="Search Input"
          placeholder="Search"
          value={searchValue}
          onChangeText={setSearchValue}
        />
        <CustomInput
          variant="textarea"
          label="Textarea Input"
          placeholder="Enter text"
          value={textareaValue}
          onChangeText={setTextareaValue}
          numberOfLines={4}
        />
        <CustomInput
          variant="date"
          label="Date Input"
          placeholder="Select date"
          startDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <CustomInput
          variant="daterange"
          label="Date Range Input"
          placeholder="Select date range"
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </VStack>
    </VStack>
  );
}
