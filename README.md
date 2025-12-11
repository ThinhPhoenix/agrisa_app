# Agrisa - Nền tảng Bảo hiểm Nông nghiệp Thông minh

## 📱 Giới thiệu
**Agrisa** - FPT Capstone Project - là nền tảng kết nối giữa doanh nghiệp bảo hiểm và nông dân các bảo hiểm nông nghiệp dựa trên dữ liệu chỉ số vệ tinh để đánh giá mức độ thiệt hại cây trồng một cách chính xác, minh bạch và nhanh chóng.

## 🚀 Tech Stack

### Framework & Platform
- **Framework**: [Expo](https://docs.expo.dev/) v54.0.8
- **React**: 19.1.0
- **React Native**: 0.81.4
- **Routing**: Expo Router v6.0.6

### UI/UX
- **UI Components**: 
  - [React Native Paper](https://callstack.github.io/react-native-paper/) v5.14.5
  - [Gluestack UI](https://ui.gluestack.io/) v1.1.73
- **Styling**: 
  - [NativeWind](https://www.nativewind.dev/) v4.1.23 (Tailwind CSS cho React Native)
  - React Native Responsive Screen
- **Icons**: [Lucide React Native](https://lucide.dev/icons) v0.539.0
- **Fonts**: 
  - Bricolage Grotesque
  - Dancing Script
  - Fraunces

### State Management & Data
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) v5.0.7
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest) v5.89.0
- **HTTP Client**: [Axios](https://axios-http.com/) v1.11.0
- **Form Management**: [React Hook Form](https://react-hook-form.com/) v7.63.0
- **Validation**: [Zod](https://zod.dev/) v4.1.11
- **Storage**: 
  - [Async Storage](https://react-native-async-storage.github.io/async-storage/) v2.2.0
  - Expo Secure Store v15.0.7

### Tính năng chính
- **Maps & Location**: 
  - OpenMapVN GL v1.0.1
  - Expo Location v19.0.7
  - Proj4 v2.20.2 (xử lý tọa độ)
- **Camera & Media**: 
  - Expo Camera v17.0.8
  - React Native Vision Camera v4.7.2 (với Face Detector)
  - Expo Image Picker v17.0.8
  - Expo Image Manipulator v14.0.7
- **Authentication**: 
  - Expo Local Authentication v17.0.7 (Biometric)
  - eKYC support
- **Notifications**: 
  - Expo Notifications v0.32.12
  - Background Fetch v14.0.9
  - Task Manager v14.0.9
- **Charts**: React Native Chart Kit v6.12.0
- **QR Code**: React Native QRCode SVG v6.3.20
- **Payment**: Tích hợp PayOS

### Navigation
- React Navigation v7
- React Navigation Bottom Tabs
- React Native Gesture Handler v2.28.0
- React Native Reanimated v4.1.0

## 🛠️ Cài đặt

### Yêu cầu hệ thống
- Node.js 18+
- Bun / npm / yarn
- Expo CLI
- iOS Simulator / Android Emulator hoặc thiết bị thật

### Các bước cài đặt

```bash
# Clone repository
git clone https://github.com/ThinhPhoenix/agrisa_app.git

# Di chuyển vào thư mục dự án
cd agrisa_app

# Cài đặt dependencies
bun install
# hoặc
npm install
# hoặc
yarn install
```

## 🏃 Cách chạy ứng dụng

### Development Mode
```bash
# Khởi động Metro bundler
bun start
# hoặc
npm start
# hoặc
yarn start
```

### Chạy trên thiết bị cụ thể
```bash
# Android
bun run android
# hoặc npm run android

# iOS
bun run ios
# hoặc npm run ios

# Web
bun run web
# hoặc npm run web
```

### Build Production
```bash
# Build APK cho Android
bun run build:apk

# Build IPA cho iOS
bun run build:ipa
```

## 🐛 Troubleshooting

### Lỗi khi chạy app
Nếu gặp lỗi khi chạy ứng dụng, thử các bước sau:

1. **Xóa cache Expo**:
```bash
# Xóa folder .expo
rm -rf .expo

# Khởi động lại
bun start
```

2. **Clear watchman** (macOS/Linux):
```bash
watchman watch-del-all
```

3. **Reset Metro bundler cache**:
```bash
bun start --clear
```

4. **Reinstall dependencies**:
```bash
rm -rf node_modules
bun install
```

## 🔑 Environment Variables

Tạo file `.env` trong root directory:

```env
# API Configuration
API_BASE_URL=your_api_url
API_KEY=your_api_key

# PayOS
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key

# Map
OPENMAPVN_API_KEY=your_map_api_key
```

## 📚 Tài liệu tham khảo
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Lucide Icons](https://lucide.dev/icons)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [NativeWind](https://www.nativewind.dev/)

## 👥 Đội ngũ phát triển
Đồ án Capstone - Nền tảng bảo hiểm nông nghiệp Agrisa

