import { AgrisaHeader } from "@/components/Header";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { useBottomInsets } from "@/domains/shared/hooks/useBottomInsets";
import { Box, ScrollView, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React from "react";

/**
 * Màn hình Điều khoản và Chính sách sử dụng
 */
export default function TermsAndPolicyScreen() {
  const { colors } = useAgrisaColors();
  const bottomPadding = useBottomInsets();

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <VStack space="sm" mb="$4">
      <Text fontSize="$md" fontWeight="$bold" color={colors.primary}>
        {title}
      </Text>
      {children}
    </VStack>
  );

  const SubSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <VStack space="xs" mb="$3">
      <Text fontSize="$sm" fontWeight="$semibold" color={colors.primary_text}>
        {title}
      </Text>
      {children}
    </VStack>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Text
      fontSize="$sm"
      color={colors.secondary_text}
      lineHeight={22}
      textAlign="justify"
    >
      {children}
    </Text>
  );

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader
        title="Điều khoản & Chính sách"
        showBackButton
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20 + bottomPadding,
        }}
      >
        <VStack space="md" py="$4">
          {/* Header */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <VStack space="xs" alignItems="center">
              <Text
                fontSize="$lg"
                fontWeight="$bold"
                color={colors.primary_text}
                textAlign="center"
              >
                Điều khoản và Chính sách sử dụng
              </Text>
              <Text fontSize="$xs" color={colors.secondary_text}>
                Hiệu lực: 17/12/2025
              </Text>
            </VStack>
          </Box>

          {/* Content */}
          <Box
            bg={colors.card_surface}
            borderRadius="$xl"
            p="$4"
            borderWidth={1}
            borderColor={colors.frame_border}
          >
            <VStack space="md">
              <Section title="1. GIỚI THIỆU VỀ NỀN TẢNG">
                <Paragraph>
                  Agrisa là nền tảng kết nối trung gian giữa nông dân và các
                  công ty bảo hiểm, cung cấp dịch vụ phân phối và quản lý các
                  gói bảo hiểm nông nghiệp. Agrisa không phải là công ty bảo
                  hiểm và không chịu trách nhiệm về các quyết định bảo hiểm, bồi
                  thường hay tranh chấp pháp lý. Tất cả các gói bảo hiểm được
                  cung cấp bởi các đối tác bảo hiểm độc lập, và mọi nghĩa vụ
                  thanh toán, chi trả đều thuộc trách nhiệm của đối tác bảo hiểm
                  tương ứng.
                </Paragraph>
              </Section>

              <Section title="2. VAI TRÒ VÀ TRÁCH NHIỆM CỦA CÁC BÊN">
                <SubSection title="2.1 Vai trò của Agrisa">
                  <Paragraph>
                    Agrisa đóng vai trò là bên cung cấp nền tảng công nghệ và
                    dịch vụ trung gian, bao gồm: cung cấp không gian để các công
                    ty bảo hiểm đăng tải các gói bảo hiểm của họ; kết nối nông
                    dân với các gói bảo hiểm phù hợp; thu thập và xử lý dữ liệu
                    vệ tinh, thời tiết để phục vụ việc theo dõi và đánh giá rủi
                    ro; cung cấp công cụ quản lý và theo dõi hợp đồng bảo hiểm.
                    Agrisa không tham gia vào việc định giá, phê duyệt hay từ
                    chối các yêu cầu chi trả.
                  </Paragraph>
                </SubSection>

                <SubSection title="2.2 Vai trò của Đối tác Bảo hiểm">
                  <Paragraph>
                    Các công ty bảo hiểm là bên cung cấp và chịu trách nhiệm
                    hoàn toàn về các gói bảo hiểm của mình, bao gồm: thiết kế
                    sản phẩm bảo hiểm và xác định mức phí, điều kiện bảo hiểm;
                    xem xét và quyết định phê duyệt hoặc từ chối hồ sơ đăng ký
                    bảo hiểm; xử lý và giải quyết các yêu cầu chi trả; thực hiện
                    nghĩa vụ thanh toán chi trả cho nông dân; giải quyết mọi
                    tranh chấp phát sinh liên quan đến hợp đồng bảo hiểm.
                  </Paragraph>
                </SubSection>

                <SubSection title="2.3 Vai trò của Nông dân">
                  <Paragraph>
                    Nông dân là người sử dụng dịch vụ để tìm kiếm, lựa chọn và
                    mua các gói bảo hiểm phù hợp, có trách nhiệm: cung cấp thông
                    tin chính xác và trung thực về nông trại, diện tích canh
                    tác, loại cây trồng; thanh toán phí bảo hiểm đầy đủ và đúng
                    hạn; tuân thủ các điều khoản và điều kiện của hợp đồng bảo
                    hiểm đã ký kết.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="3. TÀI KHOẢN VÀ XÁC THỰC DANH TÍNH">
                <SubSection title="3.1 Đăng ký tài khoản">
                  <Paragraph>
                    Mỗi người chỉ được phép tạo một tài khoản duy nhất trên nền
                    tảng Agrisa. Tài khoản phải được xác định bằng số điện
                    thoại, địa chỉ email và giấy tờ tùy thân đã được kiểm tra
                    xác thực. Nghiêm cấm việc tạo nhiều tài khoản cho cùng một
                    người hoặc sử dụng thông tin giả mạo.
                  </Paragraph>
                </SubSection>

                <SubSection title="3.2 Xác thực danh tính">
                  <Paragraph>
                    Trước khi có thể đăng ký bảo hiểm hoặc thực hiện thanh toán,
                    nông dân bắt buộc phải hoàn tất quy trình xác thực danh tính
                    điện tử thông qua đối tác xác thực của chúng tôi. Việc xác
                    thực chỉ cần thực hiện một lần cho mỗi tài khoản. Trong
                    trường hợp xác thực không thành công, nông dân có thể được
                    yêu cầu xác thực bằng phương thức thay thế hoặc liên hệ bộ
                    phận hỗ trợ để được hướng dẫn.
                  </Paragraph>
                </SubSection>

                <SubSection title="3.3 Bảo mật tài khoản">
                  <Paragraph>
                    Người dùng có trách nhiệm bảo mật thông tin đăng nhập của
                    mình. Hệ thống sẽ tự động đăng xuất sau một khoảng thời gian
                    không sử dụng để đảm bảo an toàn. Mọi hành động quan trọng
                    trên nền tảng đều được ghi lại và lưu trữ trong thời gian
                    tối thiểu năm năm phục vụ mục đích kiểm tra và giải quyết
                    tranh chấp.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="4. ĐĂNG KÝ VÀ QUẢN LÝ THÔNG TIN TRANG TRẠI">
                <SubSection title="4.1 Yêu cầu đối với nông trại">
                  <Paragraph>
                    Để đủ điều kiện đăng ký bảo hiểm, nông trại phải có diện
                    tích tối thiểu là một nghìn mét vuông và nằm hoàn toàn trong
                    lãnh thổ Việt Nam. Nông dân cần cung cấp tọa độ chính xác
                    xác định ranh giới nông trại và phải có hình ảnh thực tế của
                    nông trại khi tạo hồ sơ.
                  </Paragraph>
                </SubSection>

                <SubSection title="4.2 Thông tin không thể thay đổi">
                  <Paragraph>
                    Khi đã có hợp đồng bảo hiểm đang có hiệu lực, nông dân không
                    được phép thay đổi các thông tin về vị trí, diện tích trang
                    trại hay loại cây trồng cho đến khi hợp đồng hết hạn hoặc bị
                    hủy. Điều này nhằm đảm bảo tính minh bạch và công bằng trong
                    quá trình theo dõi và đánh giá rủi ro.
                  </Paragraph>
                </SubSection>

                <SubSection title="4.3 Hạn chế bảo hiểm trùng lặp">
                  <Paragraph>
                    Một nông trại không thể được bảo hiểm đồng thời bởi nhiều
                    hợp đồng cho cùng một loại rủi ro trong cùng khoảng thời
                    gian. Tuy nhiên, nông dân có thể đăng ký nhiều gói bảo hiểm
                    khác nhau từ các đối tác khác nhau cho cùng một nông trại.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="5. GÓI BẢO HIỂM VÀ HỢP ĐỒNG">
                <SubSection title="5.1 Lựa chọn gói bảo hiểm">
                  <Paragraph>
                    Nông dân chỉ có thể xem và đăng ký các gói bảo hiểm đang
                    được mở cho phép đăng ký trong thời gian quy định. Mỗi gói
                    bảo hiểm có các điều kiện, mức phí và quyền lợi cụ thể do
                    đối tác bảo hiểm quy định. Nông dân cần đọc kỹ các điều
                    khoản trước khi đăng ký.
                  </Paragraph>
                </SubSection>

                <SubSection title="5.2 Hiệu lực hợp đồng">
                  <Paragraph>
                    Hợp đồng bảo hiểm chỉ có hiệu lực và ràng buộc về mặt pháp
                    lý sau khi nông dân đã hoàn tất thanh toán phí bảo hiểm và
                    nhận được xác nhận thanh toán thành công. Quyền bảo hiểm chỉ
                    bắt đầu có hiệu lực sau một khoảng thời gian chờ đợi bắt
                    buộc kể từ ngày mua. Bất kỳ sự cố nào xảy ra trong thời gian
                    chờ đợi này đều không được chi trả.
                  </Paragraph>
                </SubSection>

                <SubSection title="5.3 Tính bất biến của hợp đồng">
                  <Paragraph>
                    Sau khi hợp đồng được tạo thành công, không bên nào có thể
                    thay đổi bất kỳ nội dung nào của hợp đồng, bao gồm mức phí,
                    thời gian bảo hiểm, hoặc các điều khoản đã thỏa thuận. Điều
                    này đảm bảo tính công bằng và minh bạch cho cả hai bên.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="6. THANH TOÁN VÀ HOÀN PHÍ">
                <SubSection title="6.1 Phương thức thanh toán">
                  <Paragraph>
                    Tất cả các giao dịch trên nền tảng được thực hiện bằng đồng
                    Việt Nam. Nông dân phải thanh toán phí bảo hiểm trong vòng
                    hai mươi bốn giờ kể từ khi đăng ký được chấp nhận. Quá thời
                    gian này, đăng ký sẽ tự động bị hủy và nông dân cần đăng ký
                    lại nếu muốn tiếp tục.
                  </Paragraph>
                </SubSection>

                <SubSection title="6.2 Quyền hủy và hoàn phí">
                  <Paragraph>
                    Nông dân có quyền hủy hợp đồng trong vòng hai mươi bốn giờ
                    kể từ khi thanh toán thành công để được hoàn lại toàn bộ số
                    tiền đã trả, với điều kiện thời gian bảo hiểm chưa bắt đầu.
                    Sau khi thời gian bảo hiểm đã bắt đầu, phí bảo hiểm sẽ không
                    được hoàn lại dưới bất kỳ hình thức nào, kể cả khi nông dân
                    bán đất, chuyển đổi mục đích sử dụng hoặc ngừng canh tác.
                  </Paragraph>
                </SubSection>

                <SubSection title="6.3 Gia hạn tự động">
                  <Paragraph>
                    Một số gói bảo hiểm có tính năng gia hạn tự động khi hết
                    hạn. Nếu nông dân không muốn gia hạn, cần chủ động hủy trước
                    khi hợp đồng hết hạn. Khi gia hạn, nông dân phải thanh toán
                    phí bảo hiểm mới trong thời gian quy định, nếu không hợp
                    đồng sẽ tự động bị hủy.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="7. THEO DÕI VÀ ĐÁNH GIÁ RỦI RO">
                <SubSection title="7.1 Nguồn dữ liệu">
                  <Paragraph>
                    Nền tảng Agrisa sử dụng dữ liệu vệ tinh và dữ liệu thời tiết
                    từ các nhà cung cấp độc lập để theo dõi tình trạng trang
                    trại và môi trường canh tác. Dữ liệu này được cập nhật hàng
                    ngày và sử dụng làm cơ sở chính để đánh giá rủi ro và xác
                    định quyền lợi chi trả.
                  </Paragraph>
                </SubSection>

                <SubSection title="7.2 Vai trò của công nghệ">
                  <Paragraph>
                    Hệ thống sử dụng công nghệ trí tuệ nhân tạo để phân tích và
                    đưa ra các khuyến nghị về rủi ro. Tuy nhiên, các khuyến nghị
                    này chỉ mang tính tham khảo. Quyết định cuối cùng về việc
                    chấp nhận hay từ chối hồ sơ bảo hiểm, cũng như phê duyệt hay
                    từ chối các yêu cầu chi trả, hoàn toàn thuộc về đối tác bảo
                    hiểm.
                  </Paragraph>
                </SubSection>

                <SubSection title="7.3 Thông báo cảnh báo">
                  <Paragraph>
                    Nông dân có thể nhận được các thông báo cảnh báo sớm về điều
                    kiện thời tiết bất lợi hoặc nguy cơ rủi ro. Những thông báo
                    này chỉ nhằm mục đích giúp nông dân chuẩn bị và không tự
                    động dẫn đến việc được chi trả. Chỉ khi các điều kiện đạt
                    đến ngưỡng quy định trong hợp đồng, yêu cầu chi trả mới được
                    tạo ra.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="8. BỒI THƯỜNG VÀ QUYỀN LỢI">
                <SubSection title="8.1 Cơ sở xác định chi trả">
                  <Paragraph>
                    Quyền lợi chi trả được xác định dựa trên dữ liệu khách quan
                    từ vệ tinh và thời tiết đã được ghi nhận trong hệ thống, so
                    sánh với các ngưỡng đã được quy định rõ ràng trong hợp đồng.
                    Công thức tính toán số tiền chi trả được thiết lập trước và
                    áp dụng một cách minh bạch cho tất cả các trường hợp.
                  </Paragraph>
                </SubSection>

                <SubSection title="8.2 Quy trình xử lý yêu cầu chi trả">
                  <Paragraph>
                    Khi điều kiện kích hoạt chi trả được phát hiện, hệ thống sẽ
                    tự động tạo yêu cầu chi trả và thông báo cho nông dân. Yêu
                    cầu này sẽ được chuyển đến đối tác bảo hiểm để xem xét và
                    đưa ra quyết định. Đối tác bảo hiểm có trách nhiệm xử lý yêu
                    cầu trong thời gian hợp lý. Trong khi chờ đối tác xem xét,
                    nông dân không thể tạo thêm yêu cầu chi trả mới cho cùng hợp
                    đồng đó.
                  </Paragraph>
                </SubSection>

                <SubSection title="8.3 Phê duyệt và thanh toán">
                  <Paragraph>
                    Khi đối tác bảo hiểm phê duyệt yêu cầu chi trả, số tiền chi
                    trả sẽ được giải ngân trực tiếp cho nông dân theo thỏa thuận
                    mức độ dịch vụ. Đối tác bảo hiểm chịu hoàn toàn trách nhiệm
                    về việc thanh toán này. Sau khi chi trả được chi trả, hợp
                    đồng sẽ kết thúc hiệu lực bảo hiểm cho phần thời gian còn
                    lại, và không thể phát sinh thêm quyền lợi bồi thường mới.
                  </Paragraph>
                </SubSection>

                <SubSection title="8.4 Từ chối yêu cầu chi trả">
                  <Paragraph>
                    Đối tác bảo hiểm có quyền từ chối yêu cầu chi trả nếu xét
                    thấy các điều kiện chưa đủ để thanh toán, ngay cả khi các
                    ngưỡng kỹ thuật đã được đáp ứng. Khi từ chối, đối tác phải
                    cung cấp lý do chi tiết và rõ ràng. Nông dân sẽ nhận được
                    thông báo kèm giải thích. Sau khi bị từ chối, hợp đồng tiếp
                    tục có hiệu lực và có thể phát sinh yêu cầu chi trả mới nếu
                    tình hình xấu đi.
                  </Paragraph>
                </SubSection>

                <SubSection title="8.5 Giới hạn chi trả">
                  <Paragraph>
                    Mỗi hợp đồng bảo hiểm chỉ được chi trả một lần duy nhất
                    trong suốt thời gian hiệu lực. Sau khi nhận được chi trả,
                    nông dân muốn tiếp tục được bảo vệ cần đợi đến khi hợp đồng
                    hết hạn tự nhiên để gia hạn hoặc đăng ký hợp đồng mới.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="9. QUYỀN VÀ TRÁCH NHIỆM CỦA ĐỐI TÁC BẢO HIỂM">
                <SubSection title="9.1 Quyền tự chủ trong kinh doanh">
                  <Paragraph>
                    Đối tác bảo hiểm có toàn quyền thiết kế sản phẩm, định giá,
                    quyết định chấp nhận hay từ chối hồ sơ, và giải quyết các
                    yêu cầu chi trả. Agrisa không can thiệp vào các quyết định
                    kinh doanh này và không chịu trách nhiệm về hậu quả của các
                    quyết định đó.
                  </Paragraph>
                </SubSection>

                <SubSection title="9.2 Nghĩa vụ minh bạch">
                  <Paragraph>
                    Đối tác bảo hiểm phải cung cấp đầy đủ thông tin về điều
                    kiện, điều khoản và quyền lợi của từng gói bảo hiểm bằng
                    tiếng Việt. Các tài liệu hợp đồng phải bao gồm đầy đủ các
                    tiết lộ pháp lý bắt buộc theo quy định của pháp luật Việt
                    Nam.
                  </Paragraph>
                </SubSection>

                <SubSection title="9.3 Hạn chế lợi ích xung đột">
                  <Paragraph>
                    Các tài khoản thuộc sở hữu của đối tác bảo hiểm hoặc nhân
                    viên của họ không được phép mua các gói bảo hiểm do chính
                    công ty họ cung cấp trên nền tảng. Điều này nhằm đảm bảo
                    tính công bằng và ngăn chặn hành vi gian lận.
                  </Paragraph>
                </SubSection>

                <SubSection title="9.4 Chi phí sử dụng nền tảng">
                  <Paragraph>
                    Đối tác bảo hiểm phải trả các khoản phí liên quan đến việc
                    thu thập dữ liệu vệ tinh và thời tiết dựa trên số lượng hợp
                    đồng đã được nông dân đăng ký. Chi phí này được tính cho
                    toàn bộ thời gian bảo hiểm, bất kể hợp đồng có kết thúc sớm
                    hay không.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="10. BẢO MẬT VÀ QUYỀN RIÊNG TƯ">
                <SubSection title="10.1 Thu thập và sử dụng thông tin">
                  <Paragraph>
                    Agrisa thu thập thông tin cá nhân, thông tin nông trại và dữ
                    liệu giao dịch của người dùng để vận hành nền tảng và cung
                    cấp dịch vụ. Thông tin này được bảo vệ và chỉ sử dụng cho
                    các mục đích đã được công bố.
                  </Paragraph>
                </SubSection>

                <SubSection title="10.2 Phân quyền truy cập">
                  <Paragraph>
                    Nông dân chỉ có thể xem thông tin và dữ liệu của chính mình.
                    Đối tác bảo hiểm chỉ được phép truy cập thông tin của những
                    nông dân đã đăng ký gói bảo hiểm do họ cung cấp. Quản trị
                    viên hệ thống có quyền xem dữ liệu để hỗ trợ và xử lý sự cố,
                    nhưng không được phép sửa đổi dữ liệu tài chính hoặc nội
                    dung hợp đồng.
                  </Paragraph>
                </SubSection>

                <SubSection title="10.3 Lưu trữ dữ liệu">
                  <Paragraph>
                    Tất cả dữ liệu giao dịch, thông tin hợp đồng và nhật ký hoạt
                    động được lưu trữ an toàn trong thời gian tối thiểu năm năm
                    để phục vụ mục đích kiểm tra, kiểm toán và giải quyết tranh
                    chấp.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="11. GIẢI QUYẾT TRANH CHẤP VÀ TRÁCH NHIỆM PHÁP LÝ">
                <SubSection title="11.1 Vai trò của Agrisa trong tranh chấp">
                  <Paragraph>
                    Agrisa chỉ đóng vai trò cung cấp nền tảng kết nối và không
                    tham gia vào việc giải quyết các tranh chấp pháp lý giữa
                    nông dân và đối tác bảo hiểm. Mọi tranh chấp liên quan đến
                    nội dung hợp đồng, quyền lợi bảo hiểm, hoặc việc từ chối bồi
                    thường đều thuộc trách nhiệm xử lý của đối tác bảo hiểm
                    tương ứng.
                  </Paragraph>
                </SubSection>

                <SubSection title="11.2 Bằng chứng và hồ sơ">
                  <Paragraph>
                    Agrisa cung cấp dữ liệu khách quan từ hệ thống (dữ liệu vệ
                    tinh, thời tiết, nhật ký giao dịch) làm bằng chứng tham khảo
                    khi có tranh chấp. Tuy nhiên, việc sử dụng các bằng chứng
                    này trong quá trình giải quyết tranh chấp là trách nhiệm của
                    các bên liên quan.
                  </Paragraph>
                </SubSection>

                <SubSection title="11.3 Thẩm quyền giải quyết">
                  <Paragraph>
                    Mọi tranh chấp phát sinh từ việc sử dụng nền tảng hoặc liên
                    quan đến các hợp đồng bảo hiểm sẽ được giải quyết theo pháp
                    luật của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="12. CHẤM DỨT VÀ XÓA TÀI KHOẢN">
                <SubSection title="12.1 Chấm dứt dịch vụ của đối tác">
                  <Paragraph>
                    Khi một đối tác bảo hiểm quyết định ngừng cung cấp dịch vụ
                    trên nền tảng, sẽ có thời gian thông báo ba mươi ngày. Trong
                    thời gian này, đối tác không thể tạo gói bảo hiểm mới hoặc
                    chấp nhận đăng ký mới. Đối tác có thể rút lại quyết định
                    ngừng hoạt động trong thời gian thông báo này.
                  </Paragraph>
                </SubSection>

                <SubSection title="12.2 Xử lý hợp đồng đang hiệu lực">
                  <Paragraph>
                    Các hợp đồng bảo hiểm đang có hiệu lực sẽ tiếp tục được thực
                    hiện và chi trả theo đúng cam kết đến khi hết hạn tự nhiên.
                    Các đăng ký đã được chấp nhận nhưng chưa thanh toán sẽ bị
                    hủy và không được hoàn phí.
                  </Paragraph>
                </SubSection>

                <SubSection title="12.3 Xóa tài khoản người dùng">
                  <Paragraph>
                    Nông dân có thể yêu cầu xóa tài khoản bất kỳ lúc nào. Tuy
                    nhiên, thông tin liên quan đến các hợp đồng đã ký kết vẫn
                    được lưu trữ trong hệ thống phục vụ mục đích kiểm toán và
                    tuân thủ pháp luật.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="13. SỬA ĐỔI ĐIỀU KHOẢN">
                <Paragraph>
                  Agrisa có quyền cập nhật và sửa đổi các điều khoản này khi cần
                  thiết để phù hợp với sự thay đổi của dịch vụ hoặc yêu cầu pháp
                  lý. Những thay đổi quan trọng sẽ được thông báo trước cho
                  người dùng ít nhất ba mươi ngày. Việc tiếp tục sử dụng nền
                  tảng sau khi các thay đổi có hiệu lực đồng nghĩa với việc
                  người dùng chấp nhận các điều khoản mới.
                </Paragraph>
              </Section>

              <Section title="14. ĐIỀU KHOẢN CHUNG">
                <SubSection title="14.1 Tính độc lập của các điều khoản">
                  <Paragraph>
                    Nếu bất kỳ điều khoản nào trong văn bản này bị coi là không
                    hợp lệ hoặc không thể thi hành, các điều khoản còn lại vẫn
                    giữ nguyên hiệu lực.
                  </Paragraph>
                </SubSection>

                <SubSection title="14.2 Ngôn ngữ">
                  <Paragraph>
                    Bản điều khoản này được soạn thảo bằng tiếng Việt. Trong
                    trường hợp có bản dịch sang ngôn ngữ khác, nếu có mâu thuẫn
                    hoặc khác biệt về nội dung, bản tiếng Việt sẽ được ưu tiên
                    áp dụng.
                  </Paragraph>
                </SubSection>

                <SubSection title="14.3 Xác nhận đã đọc và hiểu">
                  <Paragraph>
                    Bằng việc đăng ký tài khoản và sử dụng các dịch vụ trên nền
                    tảng Agrisa, bạn xác nhận rằng đã đọc, hiểu đầy đủ và đồng ý
                    tuân thủ tất cả các điều khoản và chính sách được nêu trong
                    văn bản này.
                  </Paragraph>
                </SubSection>
              </Section>

              <Section title="15. THÔNG TIN LIÊN HỆ">
                <Paragraph>
                  Nếu có bất kỳ thắc mắc hoặc cần hỗ trợ liên quan đến các điều
                  khoản này, vui lòng liên hệ với chúng tôi qua:
                </Paragraph>
                <Box
                  bg={colors.successSoft}
                  borderRadius="$lg"
                  p="$3"
                  mt="$2"
                  borderWidth={1}
                  borderColor={colors.success}
                >
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={colors.primary_text}
                    textAlign="center"
                  >
                    Số điện thoại hỗ trợ: 0377744322
                  </Text>
                </Box>
              </Section>

              {/* Footer */}
              <Box
                bg={colors.background}
                borderRadius="$lg"
                p="$3"
                mt="$2"
                borderWidth={1}
                borderColor={colors.frame_border}
              >
                <Text
                  fontSize="$xs"
                  color={colors.secondary_text}
                  textAlign="center"
                  fontStyle="italic"
                >
                  Văn bản này được cập nhật lần cuối vào ngày 17/12/2025
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
}
