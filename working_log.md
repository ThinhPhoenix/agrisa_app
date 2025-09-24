24/09/2025
[Done]
1) 
Người làm: Nhân - Branch: nhan/auth
Commit Message: Feat: create auth store and update information
- Cập nhật Auth Store và wrap cho toàn bộ App (Zustand Middleware)
(trước mắt chỉ lấy ra từ Token bao gồm:
    + access_token
    + user
), sau khi có /me sẽ cập nhật thêm các Field cần thiết và liên quan,
trong Store đã để sẵn phần Refresh để nếu BE muốn sử dụng về 2 dạng Token
- Tạo Storage sử dụng secureStore của Expo để store các thông tin cần thiết
- Cập nhật trang Profile Screen dựa trên các Data từ Auth Store bao gồm
    + Mail, Phone, Verified (eKYC, Phone, Status)


23/9
[Done] 
Cập nhật Status Bar, Toast và các trang Auth liên quan
Format lại các import và xoá các phần dư thừa trong trang Home page
[Error]
- Đã cập nhật lại để kết hợp Gluestack với Nativewind nhưng có vấn đề phát sinh
chưa sử dụng được

22/9
[Done] Nối API + Build Layout cho Sign in và Sign Up thành công
[Error] Gặp lỗi sai field đối với Phone (đã xử lý)
