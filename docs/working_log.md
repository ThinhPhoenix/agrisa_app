# 📋 Nhật ký Phát triển Agrisa
*Nền tảng Bảo hiểm Nông nghiệp Thông minh*

---

## 🗓️ Ngày 08/10/2025
#### **Feature EKYC**
> **👤 Người thực hiện:** Nhân  
> **🌿 Branch:** `nhan/ekyc`



## 🗓️ Ngày 25/09/2025

#### **Update API Connection for ekyc include Service, Custom Hooks**
> **👤 Người thực hiện:** Nhân  
> **🌿 Branch:** `nhan/ekyc`

**🔧 Công việc đã thực hiện:**
- ✅ Cập nhật các API liên quan đến EKYC và tải các thư viện liên quan dể tiến hành EKYC


## 🗓️ Ngày 24/09/2025

### ✅ **Hoàn thành**

#### **Update some grunt task**
> **👤 Người thực hiện:** Nhân  
> **🌿 Branch:** `master`

**🔧 Công việc đã thực hiện:**
- ✅ Cập nhật routing paths cho các trang Authentication

#### **Git Management & Conflict Resolution**
> **👤 Người thực hiện:** Nhân  
> **🌿 Branch:** `nhan/auth`

**🔧 Công việc đã thực hiện:**
- ✅ Resolve merge conflicts khi hợp nhất vào master
- ✅ Fix conflicts trong `README.md`

#### **Authentication System & State Management**
> **👤 Người thực hiện:** Nhân  
> **🌿 Branch:** `nhan/auth`  
> **📝 Commit:** `Feat: create auth store and update information`

**🔧 Công việc đã thực hiện:**
- **Auth Store Implementation**
  - ✅ Tích hợp Zustand Middleware cho toàn bộ App
  - ✅ Quản lý state authentication với:
    - `access_token` - Token xác thực
    - `user` - Thông tin người dùng nông dân
  - ✅ Chuẩn bị sẵn Refresh Token mechanism (chờ BE implement)

- **Secure Storage Integration**
  - ✅ Sử dụng Expo SecureStore để lưu trữ thông tin nhạy cảm
  - ✅ Đảm bảo bảo mật thông tin authentication cho nông dân

- **Profile Screen Development**
  - ✅ Xây dựng trang Profile hiển thị thông tin từ Auth Store
  - ✅ Tích hợp các trường thông tin:
    - 📧 Email address
    - 📱 Phone number
    - ✅ Verification status (eKYC, Phone, Account Status)

---

## 🗓️ Ngày 23/09/2025

### ✅ **Hoàn thành**
- ✅ **UI/UX Improvements**
  - Cập nhật Status Bar configuration
  - Tích hợp Toast notification system
  - Hoàn thiện các trang Authentication (Sign In, Sign Up)
  
- ✅ **Code Optimization**
  - Format lại import statements
  - Cleanup code dư thừa trong Home page
  - Tối ưu hóa structure project

### ❌ **Vấn đề gặp phải**
- **Gluestack + NativeWind Integration Issue**
  - 🔍 **Mô tả:** Gặp khó khăn khi kết hợp Gluestack UI với NativeWind
  - 🔄 **Trạng thái:** Chưa giải quyết hoàn toàn
  - 📋 **Kế hoạch:** Cần research thêm về configuration

---

## 🗓️ Ngày 22/09/2025

### ✅ **Hoàn thành**
- ✅ **API Integration Success**
  - Kết nối thành công API endpoints
  - Build layout hoàn chỉnh cho Sign In và Sign Up
  - Test flow authentication cho nông dân

### ❌ **Vấn đề đã xử lý**
- **Phone Field Validation Error**
  - 🔍 **Mô tả:** Sai định dạng field Phone trong API request
  - ✅ **Giải pháp:** Đã cập nhật và xử lý thành công
  - 📋 **Kết quả:** Authentication flow hoạt động ổn định

---


### 🐛 **Issues cần theo dõi**
1. **Styling Framework Integration** - Gluestack + NativeWind compatibility
2. **Token Management** - Cần implement refresh token từ Backend
3. **Offline Support** - Chuẩn bị cho nông dân vùng có mạng yếu

---

## 📝 **Ghi chú phát triển**

> **💡 Lưu ý quan trọng cho Agrisa:**
> - Luôn ưu tiên UX đơn giản, dễ sử dụng cho nông dân
> - Đảm bảo offline capability cho vùng nông thôn
> - Security first - bảo vệ thông tin cá nhân nông dân
> - Performance optimization cho các thiết bị phổ thông
