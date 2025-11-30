# 📊 Changelog: Cải tiến Monitor Data Display

## Ngày cập nhật: 30/11/2025 (v2.0 - Major Update)

### 🔥 Thay đổi quan trọng
1. **✅ So sánh toàn bộ policy numbers** - Không chỉ so sánh item đầu tiên
2. **✅ Filter chính xác** - Chỉ hiển thị data của policy hiện tại
3. **✅ Tách riêng logic** - MonitorDataHelper class để quản lý validation
4. **✅ Thống kê chi tiết** - Average NDMI, confidence, data quality counts

### 🎯 Mục tiêu
Cải thiện logic hiển thị dữ liệu giám sát (monitor data) với các tính năng:
- Hiển thị monitor data cho cả `approved` và `rejected` underwriting status
- Validate policy number từ monitor data với policy detail
- Hiển thị đánh giá NDMI (Normalized Difference Moisture Index) với màu sắc và biểu tượng rõ ràng
- Hiển thị độ tin cậy (confidence) của dữ liệu vệ tinh

---

## 📝 Chi tiết thay đổi

### 1. **Utils.ts** - Thêm Utility Functions

#### ✅ `getNDMIStatus(value: number)`
Đánh giá trạng thái độ ẩm đất dựa trên chỉ số NDMI:

| Giá trị NDMI | Label | Màu sắc | Icon | Khuyến nghị |
|--------------|-------|---------|------|-------------|
| > 0.4 | Rất ẩm | `info` (xanh dương) | `droplets` | Đất đủ nước, không cần tưới |
| > 0.2 | Độ ẩm tốt | `success` (xanh lá) | `sprout` | Cây trồng phát triển tốt |
| > 0.1 | Hơi khô | `pending` (vàng) | `alert-triangle` | Nên theo dõi, có thể cần tưới |
| > 0 | Khô | `warning` (cam) | `triangle-alert` | Cần tưới nước sớm |
| ≤ 0 | Rất khô | `error` (đỏ) | `alert-circle` | Cần tưới nước ngay! |

**Example:**
```typescript
const status = Utils.getNDMIStatus(0.2199);
// Output: { label: "Độ ẩm tốt", color: "success", iconName: "sprout", advice: "Cây trồng phát triển tốt" }
```

---

#### ✅ `getConfidenceExplanation(confidence: number, cloudCover: number)`
Đánh giá độ tin cậy của dữ liệu vệ tinh:

| Confidence | Status | Message | Icon | Màu |
|------------|--------|---------|------|-----|
| < 0.3 | `low` | Dữ liệu tham khảo (mây che X%) | `cloud` | `muted_text` |
| 0.3 - 0.7 | `medium` | Dữ liệu khá chính xác | `cloud-sun` | `pending` |
| > 0.7 | `high` | Dữ liệu rất chính xác | `sun` | `success` |

**Example:**
```typescript
const confidenceInfo = Utils.getConfidenceExplanation(0.45, 65);
// Output: { status: "medium", message: "Dữ liệu khá chính xác", iconName: "cloud-sun", color: "pending" }
```

---

#### ✅ `validateMonitorDataPolicy(monitorPolicyNumber, detailPolicyNumber)`
So sánh policy number từ monitor data và policy detail để đảm bảo tính hợp lệ.

**Example:**
```typescript
const isValid = Utils.validateMonitorDataPolicy("POL-2024-001", "POL-2024-001");
// Output: true
```

---

#### ✅ `shouldShowMonitorData(underwritingStatus)`
Kiểm tra xem có nên hiển thị monitor data hay không.

**Logic:**
- Hiển thị khi `underwriting_status === "approved"` hoặc `"rejected"`
- Không hiển thị khi `"pending"` hoặc trạng thái khác

**Example:**
```typescript
const shouldShow = Utils.shouldShowMonitorData("approved");
// Output: true

const shouldShow2 = Utils.shouldShowMonitorData("pending");
// Output: false
```

---

### 2. **policy-status.enum.ts** - Cập nhật Colors

#### ✅ Thêm màu cho `UnderwritingStatus.REJECTED`
```typescript
export const PolicyStatusColors = {
  // ... existing statuses
  [UnderwritingStatus.REJECTED]: "error",
} as const;
```

---

### 3. **detail-registered-policy.tsx** - Component Updates

#### ✅ Import thêm icons từ lucide-react-native
```typescript
import {
  // ... existing icons
  Cloud,
  CloudSun,
  Droplets,
  Sun,
  TriangleAlert,
} from "lucide-react-native";
```

#### ✅ Logic hiển thị Monitor Data
**Thay đổi từ:**
```typescript
const shouldFetchMonitoring = policy.status === "pending_payment";
```

**Thành:**
```typescript
const shouldFetchMonitoring = Utils.shouldShowMonitorData(
  policy.underwriting_status
);
```

#### ✅ Validation Monitor Data
```typescript
const monitorData = monitoringData?.success ? monitoringData.data : null;
const isValidMonitorData =
  monitorData &&
  Utils.validateMonitorDataPolicy(
    monitorData.monitoring_data?.[0]?.policy_number,
    policy.policy_number
  );
```

#### ✅ UI cải tiến cho từng monitoring item

**Cấu trúc mới:**
```
┌─────────────────────────────────────────────┐
│ 💧 NDMI               ☀️ Dữ liệu rất chính xác│
│                                             │
│ 0.219                                       │
│ Độ ẩm tốt                                   │
│                                             │
│ [Cây trồng phát triển tốt]                 │
│                                             │
│ 30/11/2025, 14:30:45                       │
└─────────────────────────────────────────────┘
```

**Features:**
- Icon động theo NDMI status
- Màu border theo mức độ (xanh lá cho "Độ ẩm tốt", đỏ cho "Rất khô", v.v.)
- Badge với advice (khuyến nghị hành động)
- Icon confidence với message rõ ràng

---

## 🎨 Màu sắc sử dụng

Tất cả màu sắc đều lấy từ `AgrisaColors`:
- **info** - Xanh dương (#0ea5e9) - Rất ẩm
- **success** - Xanh lá (#059669) - Độ ẩm tốt
- **pending** - Vàng (#f59e0b) - Hơi khô
- **warning** - Cam (#ea580c) - Khô
- **error** - Đỏ (#dc2626) - Rất khô
- **muted_text** - Xám (#718096) - Confidence thấp

---

## 🧪 Test Cases

### Test 1: Approved Policy with Valid Monitor Data
```typescript
✅ underwriting_status: "approved"
✅ policy_number: "POL-2024-001"
✅ monitor_data.policy_number: "POL-2024-001"
✅ NDMI value: 0.2199

Expected Result:
- Monitor data section hiển thị
- NDMI status: "Độ ẩm tốt" với icon 🌱 (sprout)
- Màu xanh lá (success)
- Advice: "Cây trồng phát triển tốt"
```

### Test 2: Rejected Policy with Monitor Data
```typescript
✅ underwriting_status: "rejected"
✅ Monitor data vẫn hiển thị
✅ Validation policy number vẫn chạy

Expected Result:
- Monitor data section vẫn hiển thị
- UI tương tự như approved
```

### Test 3: Pending Policy
```typescript
✅ underwriting_status: "pending"

Expected Result:
- Monitor data section KHÔNG hiển thị
- shouldFetchMonitoring = false
```

### Test 4: Policy Number Mismatch
```typescript
❌ policy_number: "POL-2024-001"
❌ monitor_data.policy_number: "POL-2024-002"

Expected Result:
- Console warning: "❌ Policy number mismatch..."
- Monitor data KHÔNG hiển thị (isValidMonitorData = false)
```

### Test 5: Low Confidence Data
```typescript
✅ confidence_score: 0.25
✅ cloud_cover_percentage: 85

Expected Result:
- Confidence icon: ☁️ (cloud)
- Màu xám (muted_text)
- Message: "Dữ liệu tham khảo (mây che 85%)"
```

---

## 🔍 Console Logs

Các utility functions sẽ log ra console để debug:

```
📊 Monitor data display check: status="approved" → SHOW
✅ Parsed 5 boundary coordinates
⚠️ Missing policy number for validation
❌ Policy number mismatch: Monitor="POL-2024-002" vs Detail="POL-2024-001"
```

---

## 📱 UX Improvements

1. **Visual Feedback rõ ràng:**
   - Màu sắc trực quan (đỏ = nguy hiểm, xanh = tốt)
   - Icon phù hợp với từng trạng thái
   
2. **Actionable Advice:**
   - Mỗi NDMI level đều có khuyến nghị cụ thể
   - Nông dân biết cần làm gì (tưới nước, theo dõi, v.v.)

3. **Data Transparency:**
   - Hiển thị độ tin cậy của dữ liệu
   - Cảnh báo khi mây che nhiều

4. **Validation Chặt chẽ:**
   - So sánh policy number để tránh nhầm lẫn
   - Chỉ hiển thị khi underwriting status phù hợp

---

## 🚀 Next Steps (Future Improvements)

1. **Thêm chart visualization** cho monitoring data theo thời gian
2. **Alert system** khi NDMI xuống dưới ngưỡng nguy hiểm
3. **Export report** dữ liệu giám sát
4. **Push notification** khi phát hiện rủi ro

---

## 📚 Related Files

- `libs/utils/utils.ts` - Utility functions
- `domains/shared/constants/AgrisaColors.ts` - Color system
- `domains/policy/enums/policy-status.enum.ts` - Status enums
- `domains/policy/components/detail-registered-policy.tsx` - Main UI component
- `domains/farm-data-monitor/models/data-monitor.model.ts` - Data models

---

**Author:** Agrisa Team  
**Date:** 30/11/2025  
**Version:** 1.0.0
