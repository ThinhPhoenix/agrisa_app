import { Box, Button, ButtonText, Text } from "@gluestack-ui/themed";
import {
  Check,
  Moon,
  Palette,
  RotateCcw,
  Smartphone,
  Sun
} from "lucide-react-native";
import React from "react";
import { Alert, Dimensions, ScrollView, TouchableOpacity } from "react-native";

import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useThemeStore } from "@/domains/agrisa_theme/stores/themeStore";
import { AgrisaColors } from "@/domains/shared/constants/AgrisaColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ThemeSettings = () => {
  const { mode, setTheme, toggleTheme } = useThemeStore();
  const { colors, isDark, isLight } = useAgrisaColors();

  // Danh sách theme options
  const themeOptions = [
    {
      key: "light" as const,
      label: "Sáng (Light)",
      description: "Phù hợp sử dụng ngoài trời, dưới ánh sáng mặt trời",
      icon: Sun,
      colors: AgrisaColors.light,
      recommended: true,
    },
    {
      key: "dark" as const,
      label: "Tối (Dark)",
      description: "Tiết kiệm pin, dễ nhìn trong điều kiện ánh sáng yếu",
      icon: Moon,
      colors: AgrisaColors.dark,
      recommended: false,
    },
  ];

  // Xử lý thay đổi theme
  const handleThemeChange = async (newTheme: "light" | "dark") => {
    if (newTheme === mode) return;

    try {
      await setTheme(newTheme);
      // Haptic feedback nếu có
      console.log(`🎨 [Agrisa] Đã chuyển sang theme: ${newTheme}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thay đổi theme. Vui lòng thử lại.", [
        { text: "OK" },
      ]);
    }
  };

  // Reset về theme mặc định
  const handleResetTheme = () => {
    Alert.alert(
      "Khôi phục theme mặc định",
      "Bạn có muốn khôi phục về theme sáng (Light) - phù hợp cho nông dân?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Khôi phục",
          onPress: () => handleThemeChange("light"),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      
    >
      {/* Header */}
      <Box
        style={{
          paddingHorizontal: 24,
          
          paddingBottom: 32,
          alignItems: "center",
        }}
      >
        <Box
          style={{
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 20,
            marginBottom: 16,
          }}
        >
          <Palette size={32} color={colors.text} />
        </Box>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.text,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Tùy chỉnh Giao diện
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Chọn theme phù hợp với môi trường sử dụng
        </Text>
      </Box>

      {/* Theme Options */}
      <Box style={{ paddingHorizontal: 24 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Chế độ hiển thị
        </Text>

        {themeOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = mode === option.key;

          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleThemeChange(option.key)}
              style={{
                marginBottom: 16,
              }}
            >
              <Box
                style={{
                  backgroundColor: isSelected ? colors.success : colors.card,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.success : colors.border,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {/* Header của option */}
                <Box
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Box
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Box
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.2)"
                          : colors.surface,
                        padding: 12,
                        borderRadius: 12,
                        marginRight: 12,
                      }}
                    >
                      <IconComponent
                        size={24}
                        color={isSelected ? "white" : colors.text}
                      />
                    </Box>

                    <Box style={{ flex: 1 }}>
                      <Box
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: isSelected ? "white" : colors.text,
                            marginRight: 8,
                          }}
                        >
                          {option.label}
                        </Text>

                        {option.recommended && (
                          <Box
                            style={{
                              backgroundColor: colors.warning,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "600",
                                color: "white",
                              }}
                            >
                              KHUYẾN NGHỊ
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {isSelected && <Check size={24} color="white" />}
                </Box>

                {/* Mô tả */}
                <Text
                  style={{
                    fontSize: 14,
                    color: isSelected
                      ? "rgba(255,255,255,0.9)"
                      : colors.textSecondary,
                    lineHeight: 20,
                    marginBottom: 16,
                  }}
                >
                  {option.description}
                </Text>

                {/* Preview colors */}
                <Box
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isSelected
                        ? "rgba(255,255,255,0.8)"
                        : colors.textMuted,
                      marginRight: 12,
                      fontWeight: "500",
                    }}
                  >
                    Xem trước:
                  </Text>

                  <Box style={{ flexDirection: "row" }}>
                    {[
                      option.colors.primary,
                      option.colors.background,
                      option.colors.success,
                      option.colors.warning,
                    ].map((color, index) => (
                      <Box
                        key={index}
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: color,
                          borderRadius: 10,
                          marginRight: 6,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? "rgba(255,255,255,0.3)"
                            : colors.border,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </TouchableOpacity>
          );
        })}
      </Box>

      {/* Quick Actions */}
      <Box
        style={{
          paddingHorizontal: 24,
          marginTop: 32,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Thao tác nhanh
        </Text>

        {/* Toggle Button */}
        <TouchableOpacity onPress={toggleTheme} style={{ marginBottom: 12 }}>
          <Box
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box style={{ flexDirection: "row", alignItems: "center" }}>
              <Smartphone
                size={20}
                color={colors.text}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: colors.text,
                  fontWeight: "500",
                }}
              >
                Chuyển đổi nhanh
              </Text>
            </Box>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {isDark ? "Sang → Tối" : "Tối → Sáng"}
            </Text>
          </Box>
        </TouchableOpacity>

        {/* Reset Button */}
        <Button
          onPress={handleResetTheme}
          variant="outline"
          style={{
            borderColor: colors.border,
            borderWidth: 1,
            backgroundColor: "transparent",
          }}
        >
          <Box
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <RotateCcw
              size={18}
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <ButtonText
              style={{
                color: colors.textSecondary,
                fontWeight: "500",
              }}
            >
              Khôi phục mặc định
            </ButtonText>
          </Box>
        </Button>
      </Box>

      {/* Tips */}
      <Box
        style={{
          paddingHorizontal: 24,
          marginTop: 32,
          marginBottom: 40,
        }}
      >
        <Box
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: colors.info,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            💡 Mẹo sử dụng
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              lineHeight: 18,
            }}
          >
            • <Text style={{ fontWeight: "500" }}>Chế độ Sáng</Text>: Phù hợp
            khi làm việc ngoài trời, dưới ánh sáng mặt trời{"\n"}•{" "}
            <Text style={{ fontWeight: "500" }}>Chế độ Tối</Text>: Tiết kiệm
            pin, giảm mỏi mắt khi sử dụng ban đêm{"\n"}• Theme sẽ được lưu tự
            động và áp dụng khi mở app lần sau
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default ThemeSettings;
