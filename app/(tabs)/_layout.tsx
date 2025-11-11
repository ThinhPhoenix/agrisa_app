import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Tabs } from "expo-router";
import React from "react";
import { Animated, Pressable, SafeAreaView, Text, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";

function HomeIcon(props: any) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="injected-svg"
      data-src="https://cdn.hugeicons.com/icons/home-01-bulk-rounded.svg?v=3.0"
      color="#000"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M21.75 14.558V11.99c0-1.508.015-2.526-.354-3.405l-.079-.175c-.337-.69-.894-1.217-1.687-1.854l-.872-.684-2-1.556-.031-.024c-1.004-.78-1.81-1.407-2.515-1.832-.73-.44-1.425-.71-2.212-.71-.787 0-1.481.27-2.212.71-.535.322-1.127.76-1.82 1.293l-.726.563-2 1.556c-1.269.987-2.11 1.618-2.56 2.538-.45.92-.432 1.972-.432 3.58v2.51l.002 1.16c.006 1.1.03 2.02.133 2.78.14 1.037.435 1.89 1.11 2.565l.128.122c.654.59 1.465.858 2.437.988 1.002.135 2.28.135 3.882.135h4.116c1.601 0 2.88 0 3.882-.135 1.037-.14 1.89-.435 2.565-1.11l.122-.128c.59-.654.858-1.465.988-2.437.135-1.002.135-2.28.135-3.882z"
        fill="#000"
      />
      <Path
        d="M14.47 16.152a1 1 0 011.222 1.57l-.078.067c-.978.761-2.245 1.21-3.614 1.21a5.904 5.904 0 01-3.428-1.071l-.186-.139-.077-.066a1 1 0 011.221-1.57l.084.058.243.173A3.93 3.93 0 0012 17c.932 0 1.765-.306 2.386-.79l.084-.058z"
        fill="#000"
      />
    </Svg>
  );
}

function UserIcon(props: any) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="injected-svg"
      data-src="https://cdn.hugeicons.com/icons/user-circle-bulk-rounded.svg?v=3.0"
      color="#000"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M1.25 12C1.25 6.063 6.063 1.25 12 1.25S22.75 6.063 22.75 12 17.937 22.75 12 22.75 1.25 17.937 1.25 12z"
        fill="#000"
      />
      <Path
        d="M12 5.25a3.25 3.25 0 00-1.417 6.176 5.753 5.753 0 00-4.332 5.46.75.75 0 00.214.539A7.729 7.729 0 0012 19.75c2.168 0 4.13-.892 5.536-2.326a.75.75 0 00.214-.54 5.753 5.753 0 00-4.333-5.458A3.25 3.25 0 0012 5.25z"
        fill="#000"
      />
    </Svg>
  );
}

function FarmIcon(props: any) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="injected-svg"
      data-src="https://cdn.hugeicons.com/icons/leaf-01-bulk-rounded.svg?v=3.0"
      color="#000"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M20.194 2.275a.75.75 0 01.53.53c1.78 6.608 1.07 10.872-.8 13.504-1.87 2.631-4.762 3.441-6.924 3.441A6.75 6.75 0 016.25 13c0-3.694 2.89-6.206 6.644-6.742 3.395-.485 5.02-2.176 6.18-3.383.138-.143.269-.279.396-.405a.75.75 0 01.724-.195z"
        fill="#000"
      />
      <Path
        d="M17.44 9.447a.75.75 0 01.168 1.047c-1.607 2.221-3.99 4.374-7.426 5.233-2.213.554-3.709 1.264-4.703 2.137-.973.855-1.514 1.907-1.74 3.26a.75.75 0 11-1.479-.247c.275-1.648.963-3.028 2.23-4.14 1.245-1.093 2.999-1.882 5.328-2.465 2.997-.749 5.107-2.63 6.574-4.657a.75.75 0 011.048-.168z"
        fill="#000"
      />
    </Svg>
  );
}

function ContractIcon(props: any) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="injected-svg"
      data-src="https://cdn.hugeicons.com/icons/document-attachment-bulk-rounded.svg?v=3.0"
      color="#000"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.404 14.025c.694-.73 1.694-1.275 2.846-1.275 1.152 0 2.152.544 2.846 1.275.688.724 1.154 1.71 1.154 2.725v3a1 1 0 11-2 0v-3c0-.415-.205-.928-.604-1.347-.391-.412-.892-.653-1.396-.653-.504 0-1.005.24-1.396.653-.399.419-.604.932-.604 1.347v3.5a.5.5 0 001 0v-3.5a1 1 0 112 0v3.5a2.5 2.5 0 01-5 0v-3.5c0-1.014.466-2.001 1.154-2.725z"
        fill="#000"
      />
      <G opacity={0.4} fill="#000">
        <Path d="M16.989 1.403c-1.14-.153-2.595-.153-4.433-.153h-1.112c-1.838 0-3.294 0-4.433.153-1.172.158-2.121.49-2.87 1.238-.748.749-1.08 1.698-1.238 2.87-.153 1.14-.153 2.595-.153 4.433v4.605c0 1.602 0 2.872.119 3.876.121 1.03.377 1.88.96 2.588.197.24.417.461.658.659.709.582 1.557.837 2.588.96 1.004.118 2.274.118 3.876.118h2.004a3.736 3.736 0 01-.955-2.5v-3.5c0-1.389.63-2.673 1.498-3.586.882-.929 2.194-1.664 3.752-1.664 1.558 0 2.87.735 3.752 1.664.085.09.168.182.248.279v-3.5c0-1.837 0-3.293-.153-4.432-.158-1.172-.49-2.121-1.238-2.87-.749-.748-1.698-1.08-2.87-1.238zM19.325 21.802a2.324 2.324 0 01-.131-.065c-.031.071-.064.142-.1.21.08-.045.156-.094.231-.145z" />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.75 6a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9A.75.75 0 016.75 6zM6.75 10a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z"
        fill="#000"
      />
    </Svg>
  );
}

function NotificationIcon(props: any) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="injected-svg"
      data-src="https://cdn.hugeicons.com/icons/notification-02-bulk-rounded.svg?v=3.0"
      color="#000"
      {...props}
    >
      <Path
        opacity={0.4}
        d="M12 2C8.5 2 5.71 4.98 6 8.5c0 1.85.67 3.58 1.78 4.87l1.15 1.31c.5.57.88 1.1 1.16 1.61L10 17h4l-.09-.71c.28-.51.66-1.04 1.16-1.61l1.15-1.31C17.33 12.08 18 10.35 18 8.5c.29-3.52-2.5-6.5-6-6.5z"
        fill="#000"
      />
      <Path
        d="M10 17h4c0 1.1-.9 2-2 2s-2-.9-2-2zm4.54 3.75c.14-.3.21-.64.21-1v-.5c0-.14-.11-.25-.25-.25h-5c-.14 0-.25.11-.25.25v.5c0 .36.07.7.21 1h5.08z"
        fill="#000"
      />
    </Svg>
  );
}

function AnimatedTabButton({
  route,
  index,
  isFocused,
  options,
  onPress,
  onLongPress,
  colors,
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
      className="flex-1 items-center justify-center"
    >
      <Animated.View
        className="items-center"
        style={{
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }}
      >
        {options.tabBarIcon &&
          options.tabBarIcon({
            color: isFocused ? colors.success : colors.textMuted,
            size: isFocused ? 26 : 22,
          })}
        <Text
          className={`text-xs mt-1 font-medium ${
            isFocused ? "text-green-600" : "text-gray-500"
          }`}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useAgrisaColors();
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;

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
      return `${i * tabWidth + tabWidth / 2 - 2}%`;
    }),
  });

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <View className="relative">
        <Animated.View
          className="absolute top-0 h-1 bg-green-600 rounded-full"
          style={{
            width: "12%",
            transform: [{ translateX }],
          }}
        />
        <View
          className="flex-row bg-white border-t border-gray-200 px-2"
          style={{ height: 65 }}
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
                colors={colors}
              />
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
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
          tabBarIcon: ({ color, size }) => (
            <HomeIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="policy/index"
        options={{
          title: "Hợp đồng",
          tabBarIcon: ({ color, size }) => (
            <ContractIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification/index"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <NotificationIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Tôi",
          tabBarIcon: ({ color, size }) => (
            <UserIcon width={size} height={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
