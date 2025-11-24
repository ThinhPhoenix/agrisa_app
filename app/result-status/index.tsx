import { ResultStatusScreen } from "@/components/result-status";
import { useLocalSearchParams } from "expo-router";
import React from "react";

/**
 * Route cho Result Status Screen
 * Path: /result-status
 * 
 * Nhận params từ navigation:
 * - status: "success" | "error" | "loading" | "warning"
 * - title: string (optional)
 * - message: string
 * - subMessage: string (optional)
 * - showHomeButton: "true" | "false"
 * - lockNavigation: "true" | "false"
 * - homeRoute: string
 * - autoRedirectSeconds: string (số)
 * - autoRedirectRoute: string
 */
export default function ResultStatusPage() {
  const params = useLocalSearchParams<{
    status: "success" | "error" | "loading" | "warning";
    title?: string;
    message: string;
    subMessage?: string;
    showHomeButton?: string;
    lockNavigation?: string;
    homeRoute?: string;
    autoRedirectSeconds?: string;
    autoRedirectRoute?: string;
  }>();

  return (
    <ResultStatusScreen
      status={params.status || "success"}
      title={params.title}
      message={params.message || ""}
      subMessage={params.subMessage}
      showHomeButton={params.showHomeButton !== "false"}
      lockNavigation={params.lockNavigation !== "false"}
      homeRoute={params.homeRoute || "/(tabs)/"}
      autoRedirectSeconds={
        params.autoRedirectSeconds
          ? parseInt(params.autoRedirectSeconds, 10)
          : undefined
      }
      autoRedirectRoute={params.autoRedirectRoute}
    />
  );
}
