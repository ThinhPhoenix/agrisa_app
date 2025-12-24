import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  FileCheck,
  HelpCircle,
  Info,
  Leaf,
  Shield,
  TrendingUp,
} from "lucide-react-native";
import { useState } from "react";

export default function FAQScreen() {
  const { colors } = useAgrisaColors();

  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Categories
  const categories = [
    { id: "all", label: "Tất cả", icon: BookOpen },
    { id: "general", label: "Chung", icon: Info },
    { id: "indices", label: "Chỉ số vệ tinh", icon: Database },
    { id: "technical", label: "Kỹ thuật", icon: FileCheck },
  ];

  // FAQ Data - Tổng quát cho tất cả loại bảo hiểm
  const faqs = [
    {
      id: "how-insurance-works",
      category: "general",
      question: "Bảo hiểm này hoạt động như thế nào?",
      answer:
        "Bảo hiểm nông nghiệp của chúng tôi sử dụng công nghệ vệ tinh hiện đại để theo dõi tình trạng cây trồng của bạn 24/7.\n\n🛰️ Quy trình hoạt động:\n1. Đăng ký: Bạn cung cấp thông tin nông trại và cây trồng\n2. Giám sát: Hệ thống vệ tinh theo dõi liên tục\n3. Phát hiện: Tự động nhận biết khi có dấu hiệu thiệt hại\n4. Chi trả: Tiền chi trả được chuyển tự động vào tài khoản\n\n✨ Ưu điểm:\n• Không cần đợi thẩm định viên đến kiểm tra\n• Nhanh chóng, minh bạch\n• Không thể gian lận\n• Dữ liệu khách quan từ vệ tinh",
      icon: Shield,
      color: "#10b981",
    },
    {
      id: "payout-calculation",
      category: "general",
      question: "Số tiền chi trả được tính như thế nào?",
      answer:
        "Số tiền chi trả phụ thuộc vào gói bảo hiểm bạn chọn và mức độ thiệt hại thực tế.\n\n📊 Các yếu tố ảnh hưởng:\n\n1️⃣ DIỆN TÍCH THIỆT HẠI:\n• Hệ thống vệ tinh xác định chính xác diện tích bị ảnh hưởng\n• Không tính toàn bộ nông trại, chỉ tính phần thiệt hại\n\n2️⃣ MỨC ĐỘ THIỆT HẠI:\n• Thiệt hại nhẹ: Mức chi trả cơ bản\n• Thiệt hại nặng: Mức chi trả cao hơn (có thể gấp 1.5-2 lần)\n\n3️⃣ LOẠI GÓI BẢO HIỂM:\n• Mỗi gói có mức chi trả khác nhau\n• Gói cao cấp thường chi trả nhiều hơn\n\n💡 Ví dụ minh họa:\n• Nông trại 10 hecta\n• Thiệt hại thực tế: 3 hecta\n• Mức chi trả: 5 triệu/hecta\n→ Nhận được: 3 × 5 triệu = 15 triệu đồng\n\n⚡ Lưu ý:\n• Tất cả được tính toán TỰ ĐỘNG\n• Minh bạch, có thể kiểm tra trên app",
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      id: "claim-process",
      category: "general",
      question: "Tôi có cần làm gì để nhận chi trả không?",
      answer:
        "Không! Đây là điểm đặc biệt của bảo hiểm vệ tinh - TỰ ĐỘNG 100%\n\n✨ Quy trình tự động:\n\n1️⃣ HỆ THỐNG PHÁT HIỆN:\n• Vệ tinh theo dõi liên tục\n• Phát hiện thiệt hại tự động\n• Không cần bạn báo cáo\n\n2️⃣ XÁC MINH:\n• Kiểm tra điều kiện kích hoạt\n• Xác nhận mức độ thiệt hại\n• Tính toán số tiền chi trả\n\n3️⃣ CHI TRẢ:\n• Chuyển tiền trực tiếp vào tài khoản\n• Thường trong 3-5 ngày làm việc\n• Bạn nhận thông báo qua ứng dụng\n\n📱 Bạn chỉ cần:\n• Cập nhật thông tin tài khoản chính xác\n• Theo dõi thông báo trên ứng dụng\n• Nhận tiền!\n\n🎯 Không cần:\n❌ Gọi điện báo thiệt hại\n❌ Chụp ảnh hiện trường\n❌ Viết đơn yêu cầu\n❌ Chờ thẩm định viên\n❌ Nộp chứng từ",
      icon: Shield,
      color: "#10b981",
    },
    {
      id: "contract-coverage-period",
      category: "general",
      question:
        "Khi nào hợp đồng có hiệu lực và khi nào tôi được nhận chi trả?",
      answer:
        "Hợp đồng bảo hiểm có 2 mốc thời gian quan trọng bạn cần lưu ý:\n\n📅 THỜI GIAN BẮT ĐẦU HỢP ĐỒNG:\n• Tính từ ngày thanh toán thành công\n• Hợp đồng chính thức có hiệu lực\n• Bạn có thể theo dõi dữ liệu vệ tinh ngay lập tức\n• Xem các chỉ số NDVI, NDMI, NDWI của nông trại\n\n⏰ THỜI GIAN BẮT ĐẦU BẢO VỆ (Waiting Period):\n• Thường sau 7-14 ngày kể từ ngày thanh toán\n• Chỉ từ thời điểm này mới được nhận chi trả\n• Thời gian cụ thể tùy theo loại cây trồng và gói bảo hiểm\n\n🎯 Ví dụ minh họa:\n\n📆 Ngày 1/1: Thanh toán hợp đồng\n→ Hợp đồng có hiệu lực ✅\n→ Bắt đầu theo dõi dữ liệu ✅\n→ CHƯA được chi trả ❌\n\n📆 Ngày 8/1: Bắt đầu thời gian bảo vệ\n→ Được nhận chi trả nếu có thiệt hại ✅\n\n💡 Tại sao có thời gian chờ:\n• Tránh trường hợp mua bảo hiểm khi đã biết thiệt hại sắp xảy ra\n• Đảm bảo tính công bằng cho tất cả nông dân\n• Phù hợp với thông lệ quốc tế\n\n✨ Trong thời gian chờ:\n• Hợp đồng vẫn hợp lệ\n• Vẫn được theo dõi dữ liệu vệ tinh\n• Nhận cảnh báo và thông báo\n• Chỉ chưa được chi trả chi trả\n\n📱 Kiểm tra trên app:\nBạn có thể xem chính xác thời gian bắt đầu bảo vệ trong phần chi tiết hợp đồng của mình.",
      icon: Clock,
      color: "#f59e0b",
    },
    {
      id: "growth-stage",
      category: "general",
      question: "Giai đoạn sinh trưởng ảnh hưởng gì đến bảo hiểm?",
      answer:
        "Mỗi giai đoạn phát triển của cây trồng có các rủi ro khác nhau, nên bảo hiểm áp dụng điều kiện phù hợp.\n\n🌱 Các giai đoạn chính:\n\n1️⃣ Nảy mầm (0-15 ngày):\n• Rủi ro: Thiếu nước, nhiệt độ thấp\n• Điều kiện: Độ ẩm đất, nhiệt độ\n\n2️⃣ Cây con (15-30 ngày):\n• Rủi ro: Sâu bệnh, thiếu dinh dưỡng\n• Điều kiện: NDVI, NDMI\n\n3️⃣ Sinh trưởng (30-60 ngày):\n• Rủi ro: Hạn hán, thiếu nước\n• Điều kiện: NDMI, lượng mưa\n\n4️⃣ Ra hoa/Đậu quả (60-90 ngày):\n• Rủi ro: Nhiệt độ cao, thiếu nước\n• Điều kiện: Nhiệt độ, NDWI\n\n5️⃣ Chín/Thu hoạch (90-120 ngày):\n• Rủi ro: Mưa nhiều, úng lụt\n• Điều kiện: Lượng mưa, NDWI\n\n✅ Lợi ích:\nBảo vệ tối ưu cho từng giai đoạn với điều kiện phù hợp.",
      icon: Leaf,
      color: "#10b981",
    },
    {
      id: "early-warning",
      category: "general",
      question: "Cảnh báo sớm giúp gì cho tôi?",
      answer:
        "Cảnh báo sớm là thông báo trước khi tình huống trở nên nghiêm trọng, giúp bạn kịp thời xử lý.\n\n⚠️ Cách hoạt động:\n\n1️⃣ Đặt ngưỡng cảnh báo (VD: 80% ngưỡng nguy hiểm)\n2️⃣ Hệ thống theo dõi liên tục\n3️⃣ Gửi thông báo khi đạt ngưỡng cảnh báo\n4️⃣ Bạn có thời gian chuẩn bị\n\n📱 Thông báo qua:\n• Ứng dụng di động\n• Tin nhắn SMS\n• Email\n\n🎯 Ví dụ thực tế:\n\n📊 Ngưỡng nguy hiểm: NDMI < 0.2\n⚠️ Cảnh báo sớm: NDMI < 0.25 (80%)\n\nKhi NDMI = 0.24:\n→ Bạn nhận cảnh báo\n→ Có 3-5 ngày để tưới nước\n→ Tránh thiệt hại nghiêm trọng\n\n✨ Lợi ích:\n• Chủ động phòng ngừa\n• Giảm thiểu thiệt hại\n• Tiết kiệm chi phí",
      icon: AlertTriangle,
      color: "#f59e0b",
    },
    {
      id: "ndmi",
      category: "indices",
      question: "NDMI (Chỉ số độ ẩm) là gì?",
      answer:
        "NDMI (Normalized Difference Moisture Index) là chỉ số đo độ ẩm của đất và cây trồng thông qua ảnh vệ tinh.\n\n🌱 Giá trị NDMI:\n• 0.4 - 1.0: Độ ẩm tốt, cây khỏe mạnh 💚\n• 0.2 - 0.4: Độ ẩm trung bình, cần theo dõi 💛\n• < 0.2: Thiếu nước nghiêm trọng, nguy cơ hạn hán 💔\n\n💧 Ứng dụng thực tế:\n• Phát hiện sớm hạn hán trước khi cây chết\n• Theo dõi sức khỏe cây trồng\n• Đánh giá nhu cầu tưới tiêu\n• Quyết định thời điểm tưới nước\n\n⚠️ Lưu ý quan trọng:\nNDMI thấp kéo dài có thể dẫn đến thiệt hại cây trồng và kích hoạt chi trả bảo hiểm tự động.",
      icon: Database,
      color: "#3b82f6",
    },
    {
      id: "ndvi",
      category: "indices",
      question: "NDVI (Chỉ số thực vật) là gì?",
      answer:
        "NDVI (Normalized Difference Vegetation Index) là chỉ số đo mức độ xanh tươi và sức khỏe của cây trồng.\n\n🌾 Giá trị NDVI:\n• 0.6 - 0.9: Cây rất khỏe, sinh trưởng tốt 💪\n• 0.3 - 0.6: Cây khỏe mạnh bình thường ✅\n• 0.1 - 0.3: Cây yếu, thiếu dinh dưỡng 😟\n• < 0.1: Đất trống hoặc cây chết ❌\n\n📊 Ứng dụng:\n• Đánh giá sinh trưởng cây trồng qua từng giai đoạn\n• Phát hiện sớm sâu bệnh\n• Dự đoán năng suất thu hoạch\n• Theo dõi giai đoạn phát triển\n\n✅ Ý nghĩa:\nNDVI giảm đột ngột cho thấy cây đang bị stress hoặc thiệt hại do hạn hán, úng lụt, sâu bệnh.",
      icon: Leaf,
      color: "#10b981",
    },
    {
      id: "ndwi",
      category: "indices",
      question: "NDWI (Chỉ số nước) là gì?",
      answer:
        "NDWI (Normalized Difference Water Index) là chỉ số đo lượng nước trong cây và độ ẩm bề mặt.\n\n💦 Giá trị NDWI:\n• > 0.3: Nhiều nước, nguy cơ úng lụt 🌊\n• 0.0 - 0.3: Độ ẩm bình thường ✅\n• -0.3 - 0.0: Khô, cần tưới 💧\n• < -0.3: Rất khô, hạn hán nghiêm trọng 🔥\n\n🎯 Sử dụng cho:\n• Phát hiện sớm ngập lụt\n• Giám sát nguồn nước tưới\n• Đánh giá stress do thiếu nước\n• Quản lý tưới tiêu hiệu quả\n\n⚡ Mẹo hữu ích:\nKết hợp NDWI với NDMI sẽ cho đánh giá chính xác hơn về tình trạng nước của cây trồng.",
      icon: TrendingUp,
      color: "#3b82f6",
    },
    {
      id: "evi",
      category: "indices",
      question: "EVI (Chỉ số thực vật nâng cao) là gì?",
      answer:
        "EVI (Enhanced Vegetation Index) là phiên bản cải tiến của NDVI, chính xác hơn ở vùng cây trồng dày đặc.\n\n🌿 Ưu điểm EVI:\n• Giảm nhiễu từ đất và khí quyển\n• Chính xác hơn với cây trồng rậm\n• Phân biệt tốt các mức độ xanh\n• Đặc biệt phù hợp cho vùng nhiệt đới\n\n📈 Giá trị EVI:\n• 0.5 - 0.8: Cây rất tốt 🌟\n• 0.3 - 0.5: Sinh trưởng bình thường ✅\n• 0.1 - 0.3: Cây yếu ⚠️\n• < 0.1: Không có cây hoặc cây chết ❌\n\n🔬 Phù hợp cho:\nLúa nước, cà phê, cao su và các cây trồng nhiệt đới khác. EVI giúp phát hiện vấn đề ngay cả khi cây còn xanh tươi.",
      icon: Leaf,
      color: "#10b981",
    },
    {
      id: "savi",
      category: "indices",
      question: "SAVI (Chỉ số thực vật điều chỉnh đất) là gì?",
      answer:
        "SAVI (Soil-Adjusted Vegetation Index) là chỉ số NDVI được điều chỉnh để giảm ảnh hưởng của đất.\n\n🏜️ Đặc điểm SAVI:\n• Loại bỏ nhiễu từ màu sắc đất\n• Chính xác ở vùng cây trồng thưa\n• Phù hợp giai đoạn đầu mùa vụ\n• Hữu ích khi đất trống một phần\n\n📊 Khi nào nên dùng SAVI:\n• Cây non mới trồng (1-2 tuần)\n• Cây trồng cách xa nhau\n• Đất có màu sáng hoặc tối đặc biệt\n• Giai đoạn đầu sinh trưởng\n\n✨ Lợi ích:\nSAVI giúp đánh giá chính xác tình trạng cây ngay cả khi diện tích lá còn ít, tránh nhầm lẫn với đất trống.",
      icon: Database,
      color: "#3b82f6",
    },
    {
      id: "trigger",
      category: "technical",
      question: "Trigger (Bộ kích hoạt) là gì?",
      answer:
        'Trigger là tập hợp các điều kiện cần thiết để bảo hiểm tự động chi trả chi trả.\n\n🎯 Cách hiểu đơn giản:\nGiống như "công tắc tự động" - khi tất cả điều kiện đều đạt, hệ thống sẽ tự động bật và chi tiền.\n\n📋 Đặc điểm:\n• Mỗi gói bảo hiểm có nhiều trigger\n• Mỗi trigger áp dụng cho giai đoạn khác nhau\n• VD: Trigger cho giai đoạn nảy mầm, trigger cho giai đoạn ra hoa...\n\n✅ Khi nào kích hoạt:\nKhi TẤT CẢ các điều kiện trong trigger được đáp ứng đồng thời, hệ thống sẽ tự động chi trả chi trả cho bạn.',
      icon: Shield,
      color: "#10b981",
    },
    {
      id: "condition",
      category: "technical",
      question: "Điều kiện (Condition) hoạt động như thế nào?",
      answer:
        "Điều kiện là tiêu chí cụ thể cần đạt được để trigger kích hoạt.\n\n📝 Ví dụ điều kiện:\n'Lượng mưa trung bình trong 7 ngày < 10mm'\n'Chỉ số NDVI giảm xuống dưới 0.3'\n'Nhiệt độ cao hơn 38°C trong 5 ngày liên tục'\n\n🔍 Cách theo dõi:\n• Hệ thống giám sát liên tục qua vệ tinh\n• Dữ liệu được cập nhật hàng ngày\n• So sánh với ngưỡng đã định\n• Tự động cảnh báo khi gần đạt điều kiện\n\n⚡ Minh bạch:\nBạn có thể xem tất cả điều kiện và tiến trình giám sát trên ứng dụng.",
      icon: FileCheck,
      color: "#3b82f6",
    },
    {
      id: "aggregation-window",
      category: "technical",
      question: "Thời gian theo dõi (Aggregation Window) là gì?",
      answer:
        "Thời gian theo dõi là khoảng thời gian hệ thống thu thập và tính toán dữ liệu để đánh giá điều kiện.\n\n⏱️ Ví dụ dễ hiểu:\n• 'Trung bình 7 ngày': Thu thập dữ liệu 7 ngày liên tục → Tính trung bình\n• 'Tối đa 14 ngày': Lấy giá trị cao nhất trong 14 ngày\n• 'Tổng 30 ngày': Cộng tổng các giá trị trong 30 ngày\n\n🎯 Tại sao cần thời gian theo dõi:\n• Tránh kích hoạt nhầm do thời tiết biến đổi ngắn hạn\n• Đảm bảo thiệt hại thực sự nghiêm trọng\n• Phản ánh chính xác tình trạng thực tế\n\n📌 Nguyên tắc:\nThời gian càng dài, điều kiện càng khắt khe nhưng kết quả càng đáng tin cậy.",
      icon: Clock,
      color: "#3b82f6",
    },
    {
      id: "validation-window",
      category: "technical",
      question: "Thời gian xác minh (Validation Window) là gì?",
      answer:
        "Thời gian xác minh là khoảng thời gian bổ sung sau khi đạt ngưỡng để kiểm tra lại tình trạng.\n\n🔍 Cách hoạt động (4 bước):\n\n1️⃣ PHÁT HIỆN:\nĐiều kiện đạt ngưỡng (VD: NDMI < 0.2 trong 7 ngày)\n\n2️⃣ CHỜ XÁC MINH:\nHệ thống chờ thêm thời gian xác minh (VD: 3 ngày)\n\n3️⃣ KIỂM TRA LẠI:\nTình trạng có duy trì không?\n\n4️⃣ QUYẾT ĐỊNH:\n• Nếu CÓ → Xác nhận thiệt hại, chi trả ngay ✅\n• Nếu KHÔNG → Hủy kích hoạt (cây đã phục hồi) ❌\n\n✅ Lợi ích:\n• Tránh chi trả nhầm do thời tiết tạm thời\n• Đảm bảo thiệt hại thực sự xảy ra\n• Bảo vệ cả nông dân và công ty bảo hiểm\n\n⏳ Thông thường: 1-5 ngày tùy loại rủi ro",
      icon: CheckCircle2,
      color: "#10b981",
    },
    {
      id: "baseline-comparison",
      category: "technical",
      question: "Dữ liệu so sánh (Baseline) là gì?",
      answer:
        "Dữ liệu so sánh là giá trị tham chiếu từ cùng kỳ năm trước để đánh giá mức độ bất thường.\n\n📊 Cách tính (4 bước):\n\n1️⃣ Lấy dữ liệu cùng thời điểm năm trước\n2️⃣ Tính toán giá trị trung bình/trung vị\n3️⃣ So sánh với giá trị hiện tại\n4️⃣ Đánh giá mức độ sai lệch\n\n🎯 Ví dụ thực tế:\n📅 Ngày 15/6/2024:\n• NDVI năm nay = 0.3\n• NDVI cùng kỳ năm 2023 = 0.6\n• Chênh lệch: Giảm 50% ⚠️\n\n💡 Kết luận:\nCây yếu hơn nhiều so với bình thường → Có thể do hạn hán, sâu bệnh\n\n✨ Ưu điểm:\nPhát hiện bất thường chính xác hơn so với chỉ dùng ngưỡng cố định, phù hợp với đặc điểm từng vùng.",
      icon: TrendingUp,
      color: "#3b82f6",
    },
    {
      id: "logic-operator",
      category: "technical",
      question: "AND và OR khác nhau thế nào?",
      answer:
        "AND và OR là hai cách kết hợp điều kiện để kích hoạt bảo hiểm.\n\n🔴 AND (VÀ) - Tất cả phải đạt:\nTẤT CẢ các điều kiện phải đạt được CÙNG LÚC\n\n📌 Ví dụ AND:\n• Nhiệt độ > 35°C VÀ\n• Độ ẩm < 40% VÀ\n• Không mưa 7 ngày\n→ Cả 3 điều kiện phải đủ mới chi trả\n\n🟢 OR (HOẶC) - Chỉ cần 1:\nChỉ cần 1 trong các điều kiện đạt là đủ\n\n📌 Ví dụ OR:\n• Lượng mưa < 10mm HOẶC\n• Không mưa 14 ngày liên tiếp\n→ Đạt 1 trong 2 là kích hoạt\n\n💡 Khi nào dùng:\n• AND: Rủi ro phức tạp cần nhiều yếu tố\n• OR: Rủi ro có nhiều nguyên nhân khác nhau",
      icon: HelpCircle,
      color: "#f59e0b",
    },
    {
      id: "consecutive",
      category: "technical",
      question: "Yêu cầu liên tiếp nghĩa là gì?",
      answer:
        "Yêu cầu liên tiếp có nghĩa là hiện tượng xấu phải xảy ra LIÊN TỤC không gián đoạn.\n\n📅 Ví dụ 'Không mưa 14 ngày liên tiếp':\n\n❌ KHÔNG ĐẠT:\nNgày 1-6: Không mưa ☀️\nNgày 7: Có mưa 🌧️ ← Gián đoạn\nNgày 8-14: Không mưa ☀️\n→ Đếm lại từ ngày 8\n\n✅ ĐẠT ĐIỀU KIỆN:\nNgày 1-14: Không mưa liên tục ☀️☀️☀️\n→ Đủ 14 ngày, kích hoạt chi trả\n\n🎯 Tại sao cần liên tiếp:\n• Đảm bảo thiệt hại thực sự nghiêm trọng\n• Tránh kích hoạt nhầm\n• Có 1 ngày mưa = cây có cơ hội phục hồi\n\n💡 Lưu ý:\nKhông phải tất cả điều kiện đều yêu cầu liên tiếp, chỉ một số điều kiện quan trọng.",
      icon: TrendingUp,
      color: "#ef4444",
    },
  ];

  const filteredFAQs =
    selectedCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Câu hỏi thường gặp" onBack={() => router.back()} />

      <ScrollView flex={1}>
        <VStack space="lg" p="$4">
          {/* Header Info */}
          <Box
            bg={colors.primarySoft}
            borderWidth={1}
            borderColor={colors.primary}
            p="$4"
            borderRadius="$2xl"
          >
            <HStack space="sm" alignItems="center" mb="$2">
              <Box bg={colors.primary} p="$2" borderRadius="$full">
                <HelpCircle
                  size={20}
                  color={colors.primary_white_text}
                  strokeWidth={2.5}
                />
              </Box>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.primary}>
                Hướng dẫn & Giải đáp
              </Text>
            </HStack>
            <Text fontSize="$sm" color={colors.primary_text} lineHeight="$lg">
              Tìm hiểu chi tiết về bảo hiểm nông nghiệp, các chỉ số vệ tinh và
              cách thức hoạt động. Chọn danh mục bên dưới để xem câu hỏi liên
              quan.
            </Text>
          </Box>

          {/* Category Filters */}
          <VStack space="sm">
            <Text
              fontSize="$xs"
              fontWeight="$bold"
              color={colors.secondary_text}
              mb="$1"
            >
              Danh mục
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space="sm">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  const IconComponent = category.icon;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      {({ pressed }) => (
                        <Box
                          bg={isSelected ? colors.primary : colors.card_surface}
                          borderWidth={1}
                          borderColor={
                            isSelected ? colors.primary : colors.frame_border
                          }
                          borderRadius="$full"
                          px="$4"
                          py="$2"
                          opacity={pressed ? 0.7 : 1}
                        >
                          <HStack space="xs" alignItems="center">
                            <IconComponent
                              size={16}
                              color={
                                isSelected
                                  ? colors.primary_white_text
                                  : colors.secondary_text
                              }
                              strokeWidth={2}
                            />
                            <Text
                              fontSize="$sm"
                              fontWeight="$semibold"
                              color={
                                isSelected
                                  ? colors.primary_white_text
                                  : colors.secondary_text
                              }
                            >
                              {category.label}
                            </Text>
                          </HStack>
                        </Box>
                      )}
                    </Pressable>
                  );
                })}
              </HStack>
            </ScrollView>
          </VStack>

          {/* FAQ List */}
          <VStack space="sm">
            {filteredFAQs.map((faq, index) => {
              const isExpanded = expandedFAQ === faq.id;
              const IconComponent = faq.icon;

              return (
                <Box
                  key={faq.id}
                  bg={colors.card_surface}
                  borderWidth={2}
                  borderColor={isExpanded ? faq.color : colors.frame_border}
                  borderRadius="$xl"
                  overflow="hidden"
                >
                  <Pressable onPress={() => toggleFAQ(faq.id)}>
                    {({ pressed }) => (
                      <Box
                        bg={isExpanded ? `${faq.color}10` : "transparent"}
                        opacity={pressed ? 0.8 : 1}
                      >
                        <HStack
                          space="sm"
                          alignItems="center"
                          justifyContent="space-between"
                          px="$4"
                          py="$4"
                        >
                          <HStack space="sm" alignItems="center" flex={1}>
                            {/* Icon */}
                            <IconComponent
                              size={20}
                              color={
                                isExpanded ? faq.color : colors.secondary_text
                              }
                              strokeWidth={2}
                            />

                            {/* Question */}
                            <Text
                              fontSize="$sm"
                              fontWeight={isExpanded ? "$bold" : "$semibold"}
                              color={
                                isExpanded ? faq.color : colors.primary_text
                              }
                              flex={1}
                              lineHeight="$lg"
                            >
                              {faq.question}
                            </Text>
                          </HStack>

                          {/* Expand Icon */}
                          {isExpanded ? (
                            <ChevronUp
                              size={18}
                              color={faq.color}
                              strokeWidth={2.5}
                            />
                          ) : (
                            <ChevronDown
                              size={18}
                              color={colors.secondary_text}
                              strokeWidth={2.5}
                            />
                          )}
                        </HStack>
                      </Box>
                    )}
                  </Pressable>

                  {/* Answer */}
                  {isExpanded && (
                    <Box
                      px="$4"
                      pb="$4"
                      pt="$2"
                      borderTopWidth={1}
                      borderTopColor={colors.frame_border}
                      bg={`${faq.color}05`}
                    >
                      <Text
                        fontSize="$sm"
                        color={colors.primary_text}
                        lineHeight="$xl"
                      >
                        {faq.answer}
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
