import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Button, ButtonText } from "@gluestack-ui/themed";
import { ViewStyle, ActivityIndicator, StyleProp } from "react-native";
import { colors } from "@/domains/shared/constants/colors";

export interface PrimaryButtonProps {
	children?: React.ReactNode;
	onPress?: (e?: any) => void;
	disabled?: boolean;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

/**
 * PrimaryButton
 * - Gradient background using `colors.primary500` -> `colors.primary700`
 * - Height 56, borderRadius 8, subtle shadow
 * - Uses `@gluestack-ui/themed` Button and ButtonText so it fits the app's UI system
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
	children,
	onPress,
	disabled = false,
	loading = false,
	style,
	testID,
}) => {
	return (
		<LinearGradient
			colors={[colors.primary500, colors.primary700]}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 0 }}
			style={[
				{
					height: 56,
					borderRadius: 8,
					justifyContent: "center",
					alignItems: "center",
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.25,
					shadowRadius: 6,
					elevation: 6,
					overflow: "hidden",
				},
				// allow caller to override margins/width etc.
				style as any,
			]}
		>
			<Button
				onPress={onPress}
				isDisabled={disabled || loading}
				testID={testID}
				style={{
					width: "100%",
					height: "100%",
					backgroundColor: "transparent",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<ButtonText style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
						{children}
					</ButtonText>
				)}
			</Button>
		</LinearGradient>
	);
};

export default PrimaryButton;

/**
 * SecondaryButton
 * - Solid gray background, same size/radius/shadow as Primary
 * - Dark label color, supports loading/disabled like Primary
 */
export const SecondaryButton: React.FC<PrimaryButtonProps> = ({
	children,
	onPress,
	disabled = false,
	loading = false,
	style,
	testID,
}) => {
	return (
		<Button
			onPress={onPress}
			isDisabled={disabled || loading}
			testID={testID}
			style={
				({
					width: "100%",
					height: 56,
					borderRadius: 8,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#F3F4F6",
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.12,
					shadowRadius: 4,
					elevation: 2,
					overflow: "hidden",
				} as any) as any
			}
		>
			{loading ? (
				<ActivityIndicator color="#111827" />
			) : (
				<ButtonText style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>
					{children}
				</ButtonText>
			)}
		</Button>
	);
};

export interface CustomButtonProps extends PrimaryButtonProps {
	bgColor?: string;
	textColor?: string;
}

/**
 * CustomButton
 * - Solid background color and text color configurable via props
 */
export const CustomButton: React.FC<CustomButtonProps> = ({
	children,
	onPress,
	disabled = false,
	loading = false,
	style,
	testID,
	bgColor = "#E5E7EB",
	textColor = "#111827",
}) => {
	return (
		<Button
			onPress={onPress}
			isDisabled={disabled || loading}
			testID={testID}
			style={
				({
					width: "100%",
					height: 56,
					borderRadius: 8,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: bgColor,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.12,
					shadowRadius: 4,
					elevation: 2,
					overflow: "hidden",
				} as any) as any
			}
		>
			{loading ? (
				<ActivityIndicator color={textColor} />
			) : (
				<ButtonText style={{ color: textColor, fontSize: 16, fontWeight: "600" }}>
					{children}
				</ButtonText>
			)}
		</Button>
	);
};
