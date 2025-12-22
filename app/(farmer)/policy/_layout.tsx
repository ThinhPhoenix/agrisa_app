import { AgrisaColors } from '@/domains/shared/constants/AgrisaColors';
import { useBottomInsets } from "@/domains/shared/hooks/useBottomInsets";
import { Tabs } from "expo-router";
import { FileText, HelpCircle, History, Home } from "lucide-react-native";
import React from "react";
import { Animated, Pressable, SafeAreaView, Text, View } from "react-native";

function AnimatedTabButton({
  route,
  index,
  isFocused,
  options,
  onPress,
  onLongPress,
}: any) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const translateYAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.spring(translateYAnim, {
        toValue: isFocused ? -3 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
    ]).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 7,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  };

  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
        ? options.title
        : route.name;

  return (
    <Pressable
      key={route.key}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }}
      >
        {options.tabBarIcon &&
          options.tabBarIcon({
            color: isFocused
              ? AgrisaColors.light.primary
              : AgrisaColors.light.muted_text,
            size: isFocused ? 26 : 22,
          })}
        <Text
          style={{
            fontSize: 10,
            marginTop: 4,
            fontWeight: "600",
            color: isFocused
              ? AgrisaColors.light.primary
              : AgrisaColors.light.muted_text,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;
  const bottomPadding = useBottomInsets();

  React.useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [state.index]);

  const translateX = indicatorAnim.interpolate({
    inputRange: state.routes.map((_: any, i: number) => i),
    outputRange: state.routes.map((_: any, i: number) => {
      const tabWidth = 100 / state.routes.length;
      return `${i * tabWidth + tabWidth / 2 - 6}%`;
    }),
  });

  return (
    <SafeAreaView
      style={{
        backgroundColor: AgrisaColors.light.background,
        paddingBottom: bottomPadding,
      }}
    >
      <View style={{ position: "relative" }}>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            height: 3,
            width: "12%",
            backgroundColor: AgrisaColors.light.primary,
            borderRadius: 2,
            transform: [{ translateX }],
          }}
        />
        <View
          style={{
            flexDirection: "row",
            backgroundColor: AgrisaColors.light.background,
            borderTopWidth: 1,
            borderTopColor: AgrisaColors.light.frame_border,
            paddingHorizontal: 8,
            height: 65,
          }}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <AnimatedTabButton
                key={route.key}
                route={route}
                index={index}
                isFocused={isFocused}
                options={options}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function PolicyTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-policies"
        options={{
          title: "Hợp đồng của tôi",
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Lịch sử đăng ký",
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="faq"
        options={{
          title: "Câu hỏi",
          tabBarIcon: ({ color, size }) => (
            <HelpCircle size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
