import React from "react";
import { useNetworkStatus } from "@/domains/connection/hooks/use-connection";
import NoConnectionScreen from "./connection-issue-screen";

interface Props {
  children: React.ReactNode;
}

const NetworkWrapper: React.FC<Props> = ({ children }) => {
  const { isConnected, isChecking, checkConnection } = useNetworkStatus();

  // Nếu không có mạng, hiển thị màn hình lỗi
  if (!isConnected) {
    return (
      <NoConnectionScreen onRetry={checkConnection} isRetrying={isChecking} />
    );
  }

  // Nếu có mạng, hiển thị nội dung bình thường
  return <>{children}</>;
};

export default NetworkWrapper;
