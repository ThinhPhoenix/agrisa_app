// src/hooks/useResponsive.ts
import { useWindowDimensions } from "react-native"; // Hook built-in RN để lấy kích thước màn hình động

// Custom hook trả về kích thước và hướng màn hình
export const useResponsive = () => {
  const { width, height } = useWindowDimensions(); // Lấy width/height, auto-update khi orientation change

  const isLandscape = width > height; // Detect hướng ngang (landscape) nếu width > height
  const isTablet = width > 600; // Detect tablet (breakpoint cơ bản cho responsive)

  return {
    width, // Kích thước width hiện tại
    height, // Kích thước height hiện tại
    isLandscape, // Boolean: true nếu màn hình ngang
    isTablet, // Boolean: true nếu tablet (cho layout rộng hơn)
  };
};

// Comment:
// - Hook này giúp wrapper re-render mượt mà khi xoay màn hình.
// - Best practice: Sử dụng trong wrapper để tránh prop drilling (truyền props sâu).
