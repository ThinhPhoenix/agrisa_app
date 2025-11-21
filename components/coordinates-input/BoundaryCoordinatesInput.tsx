import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Input,
  InputField,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";

interface CoordinatePoint {
  id: string;
  lng: string;
  lat: string;
}

interface BoundaryCoordinatesInputProps {
  value?: string; // Format: "x,y; x,y; x,y" (VN2000 coordinates)
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Component nhập tọa độ boundary với hệ quy chiếu VN2000
 * Mỗi điểm có số thứ tự và 2 ô input: X và Y
 */
export const BoundaryCoordinatesInput: React.FC<BoundaryCoordinatesInputProps> = ({
  value = "",
  onChange,
  label = "Tọa độ ranh giới (VN2000)",
  helperText,
  error,
  required = false,
  disabled = false,
}) => {
  const { colors } = useAgrisaColors();
  const [points, setPoints] = useState<CoordinatePoint[]>([]);

  // Parse string value thành array of points
  useEffect(() => {
    if (value && value.trim()) {
      const parsed = value.split(";").map((pair, index) => {
        const [lng = "", lat = ""] = pair.trim().split(",");
        return {
          id: `point-${index}-${Date.now()}`,
          lng: lng.trim(),
          lat: lat.trim(),
        };
      });
      setPoints(parsed);
    } else {
      // Khởi tạo 3 điểm mặc định nếu chưa có
      if (points.length === 0) {
        setPoints([
          { id: `point-0-${Date.now()}`, lng: "", lat: "" },
          { id: `point-1-${Date.now()}`, lng: "", lat: "" },
          { id: `point-2-${Date.now()}`, lng: "", lat: "" },
        ]);
      }
    }
  }, [value]);

  // Convert points array thành string và notify parent
  const notifyChange = (updatedPoints: CoordinatePoint[]) => {
    const stringValue = updatedPoints
      .filter((p) => p.lng.trim() && p.lat.trim()) // Chỉ lấy points có đủ lng/lat
      .map((p) => `${p.lng.trim()},${p.lat.trim()}`)
      .join("; ");
    
    onChange?.(stringValue);
  };

  // Update một điểm cụ thể
  const updatePoint = (id: string, field: "lng" | "lat", value: string) => {
    const updated = points.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setPoints(updated);
    notifyChange(updated);
  };

  // Thêm điểm mới
  const addPoint = () => {
    const newPoint: CoordinatePoint = {
      id: `point-${points.length}-${Date.now()}`,
      lng: "",
      lat: "",
    };
    const updated = [...points, newPoint];
    setPoints(updated);
    notifyChange(updated);
  };

  // Xóa điểm
  const removePoint = (id: string) => {
    if (points.length <= 3) {
      // Không cho xóa nếu chỉ còn 3 điểm (polygon tối thiểu)
      return;
    }
    const updated = points.filter((p) => p.id !== id);
    setPoints(updated);
    notifyChange(updated);
  };

  return (
    <FormControl isInvalid={!!error} isDisabled={disabled}>
      {/* Label */}
      <FormControlLabel>
        <FormControlLabelText
          fontSize="$sm"
          fontWeight="$semibold"
          color={colors.primary_text}
        >
          {label}
          {required && (
            <Text color={colors.error} ml="$1">
              *
            </Text>
          )}
        </FormControlLabelText>
      </FormControlLabel>

      {/* Helper Text */}
      {helperText && (
        <FormControlHelper mb="$2">
          <FormControlHelperText fontSize="$xs" color={colors.secondary_text}>
            {helperText}
          </FormControlHelperText>
        </FormControlHelper>
      )}

      {/* Points List - Gộp chung 1 khung */}
      <Box
        bg={colors.card_surface}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={colors.frame_border}
        mb="$3"
        overflow="hidden"
      >
        {points.map((point, index) => (
          <React.Fragment key={point.id}>
            {/* Divider giữa các điểm */}
            {index > 0 && (
              <Box
                h={1}
                bg={colors.frame_border}
                width="100%"
              />
            )}

            <HStack space="md" alignItems="center" p="$3">
              {/* Số thứ tự */}
              <Box
                bg={colors.primary}
                borderRadius="$md"
                px="$2.5"
                py="$1.5"
                minWidth={36}
                alignItems="center"
              >
                <Text fontSize="$sm" fontWeight="$bold" color={colors.primary_white_text}>
                  {index + 1}
                </Text>
              </Box>

              {/* Tọa độ X (VN2000) */}
              <VStack flex={1} space="xs">
                <Text
                  fontSize="$2xs"
                  color={colors.secondary_text}
                  fontWeight="$medium"
                >
                  Điểm X
                </Text>
                <Input
                  size="sm"
                  variant="outline"
                  borderColor={colors.frame_border}
                  isDisabled={disabled}
                >
                  <InputField
                    value={point.lng}
                    onChangeText={(v) => updatePoint(point.id, "lng", v)}
                    placeholder="650000"
                    keyboardType="numeric"
                    fontSize="$sm"
                  />
                </Input>
              </VStack>

              {/* Tọa độ Y (VN2000) */}
              <VStack flex={1} space="xs">
                <Text
                  fontSize="$2xs"
                  color={colors.secondary_text}
                  fontWeight="$medium"
                >
                  Điểm Y
                </Text>
                <Input
                  size="sm"
                  variant="outline"
                  borderColor={colors.frame_border}
                  isDisabled={disabled}
                >
                  <InputField
                    value={point.lat}
                    onChangeText={(v) => updatePoint(point.id, "lat", v)}
                    placeholder="1150000"
                    keyboardType="numeric"
                    fontSize="$sm"
                  />
                </Input>
              </VStack>

              {/* Nút xóa */}
              <Button
                size="sm"
                variant="link"
                onPress={() => removePoint(point.id)}
                isDisabled={disabled || points.length <= 3}
                opacity={points.length <= 3 ? 0.3 : 1}
              >
                <ButtonIcon as={Trash2} size="sm" color={colors.error} />
              </Button>
            </HStack>
          </React.Fragment>
        ))}
      </Box>

      {/* Nút thêm điểm */}
      <Button
        size="sm"
        variant="outline"
        action="secondary"
        onPress={addPoint}
        isDisabled={disabled}
        borderColor={colors.primary}
        borderWidth={1}
      >
        <ButtonIcon as={Plus} size="sm" color={colors.primary} mr="$1" />
        <ButtonText fontSize="$sm" color={colors.primary}>
          Thêm điểm tọa độ
        </ButtonText>
      </Button>

      

      {/* Error Message */}
      {error && (
        <FormControlError mt="$2">
          <FormControlErrorText fontSize="$xs" color={colors.error}>
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
