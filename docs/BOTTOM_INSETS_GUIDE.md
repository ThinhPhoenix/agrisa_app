# Hướng dẫn áp dụng useBottomInsets cho tất cả các trang

## Hook đã tạo
Đã tạo custom hook `useBottomInsets` tại: `domains/shared/hooks/useBottomInsets.ts`

Hook này tự động phát hiện Android navigation bar 3 nút và trả về padding cần thêm.

## Cách sử dụng

### 1. Import hook
```tsx
import { useBottomInsets } from "@/domains/shared/hooks/useBottomInsets";
```

### 2. Sử dụng trong component
```tsx
export default function YourScreen() {
  const bottomPadding = useBottomInsets();
  
  return (
    <ScrollView 
      contentContainerStyle={{ 
        paddingBottom: 20 + bottomPadding  // Thêm bottomPadding vào padding hiện tại
      }}
    >
      {/* Your content */}
    </ScrollView>
  );
}
```

### 3. Áp dụng cho Bottom CTA
```tsx
const BottomCTA = () => {
  const bottomPadding = useBottomInsets();
  
  return (
    <Box
      position="absolute"
      bottom={0}
      paddingBottom={bottomPadding}  // Thêm dynamic padding
    >
      {/* CTA content */}
    </Box>
  );
};
```

## Danh sách các trang cần cập nhật

### ✅ Đã cập nhật
- [x] `domains/policy/components/detail-base-policy.tsx` - Bottom CTA
- [x] `app/(tabs)/index.tsx` - Main home page
- [x] `app/(tabs)/_layout.tsx` - Tab bar layout

### 📋 Cần cập nhật - Tab Pages
- [ ] `app/(tabs)/notification/index.tsx`
- [ ] `app/(tabs)/profile/index.tsx`
- [ ] `app/(tabs)/transaction-history/index.tsx`

### 📋 Cần cập nhật - Farmer Pages
- [ ] `app/(farmer)/farm/index.tsx`
- [ ] `app/(farmer)/policy/my-policies.tsx` 
- [ ] `app/(farmer)/policy/history.tsx`
- [ ] `app/(farmer)/policy/faq.tsx`
- [ ] `app/(farmer)/satellite/index.tsx`
- [ ] `app/(farmer)/satellite/[id]/index.tsx`
- [ ] `app/(farmer)/satellite/[id]/images.tsx`
- [ ] `app/(farmer)/claim/index.tsx`

### 📋 Cần cập nhật - Auth Pages
- [ ] `domains/auth/components/sign-in/sign-in.tsx`
- [ ] `domains/auth/components/sign-in/username-sign-in.tsx`
- [ ] `app/auth/sign-up/email-input.tsx`
- [ ] `app/auth/sign-up/password-input.tsx`
- [ ] `app/auth/sign-up/otp-verification.tsx`
- [ ] `app/auth/sign-up/phone-verification.tsx`
- [ ] `app/auth/sign-up/cccd-input.tsx`

### 📋 Cần cập nhật - Settings & Profile
- [ ] `app/settings/profile/index.tsx`
- [ ] `app/settings/help-center/index.tsx`
- [ ] `app/settings/about/index.tsx`
- [ ] `app/edit-profile/index.tsx`
- [ ] `app/edit-profile/personal-info/index.tsx`
- [ ] `app/edit-profile/bank-info/index.tsx`
- [ ] `app/edit-profile/phone-change/index.tsx`

### 📋 Cần cập nhật - Domain Components
- [ ] `domains/policy/components/detail-registered-policy.tsx`
- [ ] `domains/policy/components/register-policy-form.tsx`
- [ ] `domains/farm/components/detail-farm.tsx`
- [ ] `domains/eKYC/components/my-bank-info/my-bank-info.tsx`

### 📋 Cần cập nhật - Other Pages
- [ ] `app/partner/[id]/index.tsx`

## Lưu ý quan trọng

1. **Chỉ thêm vào padding hiện tại**, KHÔNG thay thế:
   ```tsx
   // ✅ ĐÚNG
   paddingBottom: 100 + bottomPadding
   
   // ❌ SAI
   paddingBottom: bottomPadding
   ```

2. **Áp dụng cho tất cả ScrollView** có `contentContainerStyle`

3. **Áp dụng cho Bottom CTA hoặc fixed component** ở bottom của màn hình

4. **Không cần kiểm tra Platform** - hook đã tự động xử lý

## Ví dụ chi tiết

### Trước khi cập nhật
```tsx
export default function MyScreen() {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 100
      }}
    >
      {/* Content */}
    </ScrollView>
  );
}
```

### Sau khi cập nhật
```tsx
import { useBottomInsets } from "@/domains/shared/hooks/useBottomInsets";

export default function MyScreen() {
  const bottomPadding = useBottomInsets();
  
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 100 + bottomPadding  // ← Chỉ thêm vào đây
      }}
    >
      {/* Content */}
    </ScrollView>
  );
}
```

## Testing

Test trên:
- ✅ Android với navigation bar 3 nút (có bottomPadding)
- ✅ Android với gesture navigation (không có bottomPadding)
- ✅ iOS (không có bottomPadding)

Padding sẽ tự động điều chỉnh dựa trên loại điều hướng của thiết bị.
