import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Kiểm tra kết nối ban đầu
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    // Lắng nghe thay đổi kết nối
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Hàm kiểm tra lại kết nối
  const checkConnection = async () => {
    setIsChecking(true);
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected ?? false);
    setIsChecking(false);
    return state.isConnected ?? false;
  };

  return {
    isConnected,
    isChecking,
    checkConnection,
  };
};
