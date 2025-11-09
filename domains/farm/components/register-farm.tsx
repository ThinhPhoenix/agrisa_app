import type { FormField } from '@/components/custom-form';
import { CustomForm } from '@/components/custom-form';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { Farm, FormFarmDTO } from '@/domains/farm/models/farm.models';
import { useToast } from '@/domains/shared/hooks/useToast';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  ScrollView,
  Spinner,
  Text,
  VStack
} from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileText,
  XCircle,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image } from 'react-native';

interface RegisterFarmFormProps {
  /**
   * Mode: create (tạo mới) hoặc edit (cập nhật)
   */
  mode?: 'create' | 'edit';
  
  /**
   * Farm data để edit (chỉ có khi mode = 'edit')
   */
  initialData?: Farm | null;
  
  /**
   * Callback khi submit thành công
   */
  onSubmitSuccess?: (farm: FormFarmDTO) => void;
  
  /**
   * Loading state từ parent (khi đang call API)
   */
  isSubmitting?: boolean;
}

/**
 * Component đăng ký nông trại mới
 * 
 * Features:
 * - ✅ OCR sổ đỏ BẮT BUỘC để nhận diện thông tin (chỉ Create mode)
 * - ✅ Validation đầy đủ
 * - ✅ UX đơn giản cho nông dân
 */
export const RegisterFarmForm: React.FC<RegisterFarmFormProps> = ({
  mode = 'create',
  initialData = null,
  onSubmitSuccess,
  isSubmitting = false,
}) => {
  const { colors } = useAgrisaColors();
  const { toast } = useToast();

  // ===== STATE MANAGEMENT =====
  const [redBookImage, setRedBookImage] = useState<string | null>(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<Partial<FormFarmDTO> | null>(null);
  const [formValues, setFormValues] = useState<Partial<FormFarmDTO>>({});

  // ===== INITIALIZE FORM VALUES (Edit Mode) =====
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const initialFormData: Partial<FormFarmDTO> = {
        farm_name: initialData.farm_name,
        province: initialData.province,
        district: initialData.district,
        commune: initialData.commune,
        address: initialData.address,
        crop_type: initialData.crop_type,
        area_sqm: initialData.area_sqm,
        planting_date: initialData.planting_date,
        expected_harvest_date: initialData.expected_harvest_date,
        land_certificate_number: initialData.land_certificate_number,
        soil_type: initialData.soil_type,
        has_irrigation: initialData.has_irrigation,
        irrigation_type: initialData.irrigation_type,
      };

      setFormValues(initialFormData);
      // Edit mode không cần OCR
      setOcrResult(initialFormData);
    }
  }, [mode, initialData]);

  // ===== FORM FIELDS CONFIGURATION =====
  const formFields: FormField[] = [
    // Section 1: Thông tin cơ bản
    {
      name: "farm_name",
      label: "Tên nông trại",
      placeholder: "Ví dụ: Trang trại lúa Đồng Tháp",
      type: "input",
      required: true,
    },

    // Section 2: Địa chỉ (auto-fill từ OCR trong Create mode)
    {
      name: "province",
      label: "Tỉnh/Thành phố",
      placeholder:
        mode === "create" ? "Tự động điền từ sổ đỏ" : "Nhập tỉnh/thành phố",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "district",
      label: "Quận/Huyện",
      placeholder:
        mode === "create" ? "Tự động điền từ sổ đỏ" : "Nhập quận/huyện",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "commune",
      label: "Phường/Xã",
      placeholder:
        mode === "create" ? "Tự động điền từ sổ đỏ" : "Nhập phường/xã",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "address",
      label: "Địa chỉ chi tiết",
      placeholder:
        mode === "create" ? "Tự động điền từ sổ đỏ" : "Nhập địa chỉ chi tiết",
      type: "textarea",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },

    // Section 3: Thông tin canh tác
    {
      name: "crop_type",
      label: "Loại cây trồng",
      placeholder: "Chọn loại cây trồng",
      type: "select", // ✅ Changed to select
      options: [
        { label: "Lúa", value: "rice" },
        { label: "Cà phê", value: "coffee" },
        { label: "Ngô", value: "corn" },
        { label: "Tiêu", value: "pepper" },
        { label: "Thanh long", value: "dragon_fruit" },
        { label: "Sầu riêng", value: "durian" },
        { label: "Khác", value: "other" },
      ],
    },
    {
      name: "area_sqm",
      label: "Diện tích (m²)",
      placeholder:
        mode === "create" ? "Tự động điền từ sổ đỏ" : "Nhập diện tích",
      type: "number",
      required: true,
      disabled: mode === "create" && !ocrResult,
      helperText:
        mode === "create"
          ? "Diện tích được lấy từ sổ đỏ"
          : "Đơn vị: mét vuông (m²)",
    },
    {
      name: "planting_date",
      label: "Ngày gieo trồng",
      placeholder: "Chọn ngày gieo trồng",
      type: "datepicker", // ✅ Changed to datepicker
      required: true,
      dateFormat: "DD/MM/YYYY",
      helperText: "Ngày bắt đầu gieo trồng cây trồng",
    },
    {
      name: "expected_harvest_date",
      label: "Ngày thu hoạch dự kiến",
      placeholder: "Chọn ngày thu hoạch",
      type: "datepicker", // ✅ Changed to datepicker
      required: true,
      dateFormat: "DD/MM/YYYY",
      helperText: "Ngày dự kiến thu hoạch (dựa vào chu kỳ cây trồng)",
    },

    // Section 4: Thông tin đất đai
    {
      name: "land_certificate_number",
      label: "Số sổ đỏ",
      placeholder:
        mode === "create" ? "Tự động điền từ sổ đỏ" : "Nhập số sổ đỏ",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
      helperText: "Số giấy chứng nhận quyền sử dụng đất",
    },
    {
      name: "soil_type",
      label: "Loại đất",
      placeholder: "Chọn loại đất",
      type: "select", // ✅ Changed to combobox
      required: true,
      options: [
        { label: "Đất phù sa", value: "alluvial" },
        { label: "Đất sét", value: "clay" },
        { label: "Đất cát", value: "sandy" },
        { label: "Đất thịt", value: "loam" },
        { label: "Đất than bùn", value: "peat" },
        { label: "Đất xám bạc màu", value: "grey" },
        { label: "Đất đỏ bazan", value: "red_basalt" },
        { label: "Đất phèn", value: "acid_sulfate" },
        { label: "Đất mặn", value: "saline" },
        { label: "Khác", value: "other" },
      ],
    },

    // Section 5: Tưới tiêu
    {
      name: "has_irrigation",
      label: "Có hệ thống tưới tiêu?",
      type: "switch",
      required: true,
    },
    {
      name: "irrigation_type",
      label: "Loại hệ thống tưới",
      placeholder: "Chọn loại hệ thống tưới",
      type: "select",
      required: false,
      options: [
        { label: "Kênh mương", value: "canal" },
        { label: "Nhỏ giọt", value: "drip" },
        { label: "Phun mưa", value: "sprinkler" },
        { label: "Máy bơm", value: "pump" },
        { label: "Nước mưa", value: "rain_fed" },
        { label: "Tưới ngập", value: "flood" },
        { label: "Tưới rãnh", value: "furrow" },
        { label: "Không có", value: "none" },
      ],
    },
  ];

  // ===== HANDLERS =====

  /**
   * Chụp/Chọn ảnh sổ đỏ
   */
  const handlePickRedBookImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        toast.error('Cần cấp quyền truy cập camera để chụp ảnh');
        return;
      }

      Alert.alert(
        'Chụp ảnh sổ đỏ',
        'Hãy chụp rõ các thông tin: Số sổ, địa chỉ, diện tích',
        [
          {
            text: 'Chụp ảnh',
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.9,
              });

              if (!result.canceled) {
                setRedBookImage(result.assets[0].uri);
                await processOCR(result.assets[0].uri);
              }
            },
          },
          {
            text: 'Chọn từ thư viện',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.9,
              });

              if (!result.canceled) {
                setRedBookImage(result.assets[0].uri);
                await processOCR(result.assets[0].uri);
              }
            },
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Pick image error:', error);
      toast.error('Không thể chọn ảnh');
    }
  }, [toast]);

  /**
   * Xử lý OCR sổ đỏ
   */
  const processOCR = useCallback(async (imageUri: string) => {
    try {
      setIsOCRProcessing(true);
      toast.info('Đang nhận diện thông tin sổ đỏ...');

      // TODO: Call OCR API
      // const response = await ocrAPI.processRedBook(imageUri);
      
      // Mock OCR result
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockOCRResult: Partial<FormFarmDTO> = {
        land_certificate_number: 'SH-2024-001234',
        address: 'Ấp Tân Tiến, xã Mỹ Hội, huyện Cao Lãnh',
        province: 'Đồng Tháp',
        district: 'Cao Lãnh',
        commune: 'Mỹ Hội',
        area_sqm: 50000,
      };

      setOcrResult(mockOCRResult);
      setFormValues(prev => ({ ...prev, ...mockOCRResult }));
      
      toast.success('✅ Đã nhận diện thành công!');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('❌ Không thể nhận diện. Vui lòng chụp lại ảnh rõ hơn.');
    } finally {
      setIsOCRProcessing(false);
    }
  }, [toast]);

  /**
   * Remove ảnh sổ đỏ
   */
  const handleRemoveRedBookImage = useCallback(() => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa ảnh sổ đỏ? Thông tin đã nhận diện sẽ bị xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setRedBookImage(null);
            setOcrResult(null);
            setFormValues({});
            toast.info('Đã xóa ảnh sổ đỏ');
          },
        },
      ]
    );
  }, [toast]);

  /**
   * Submit form
   */
  const handleSubmit = useCallback(async (values: Record<string, any>) => {
    try {
      // ✅ Validate OCR trong Create Mode
      if (mode === 'create' && !ocrResult) {
        toast.error('Vui lòng chụp ảnh sổ đỏ để nhận diện thông tin');
        return;
      }

      const farmData: FormFarmDTO = {
        farm_name: values.farm_name as string,
        province: values.province as string,
        district: values.district as string,
        commune: values.commune as string,
        address: values.address as string,
        crop_type: values.crop_type as string,
        area_sqm: Number(values.area_sqm),
        planting_date: Math.floor(
          new Date(values.planting_date.split('/').reverse().join('-')).getTime() / 1000
        ),
        expected_harvest_date: Math.floor(
          new Date(values.expected_harvest_date.split('/').reverse().join('-')).getTime() / 1000
        ),
        land_certificate_number: values.land_certificate_number as string,
        soil_type: values.soil_type as string,
        has_irrigation: Boolean(values.has_irrigation),
        irrigation_type: values.irrigation_type as string || 'none',
      };

      onSubmitSuccess?.(farmData);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  }, [mode, ocrResult, onSubmitSuccess, toast]);

  // ===== RENDER =====

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <VStack space="lg" px="$4" py="$4">
        {/* Header */}
        <VStack space="xs">
          <Text fontSize="$2xl" fontWeight="$bold" color={colors.text}>
            {mode === 'edit' ? 'Cập nhật nông trại' : 'Đăng ký nông trại mới'}
          </Text>
          <Text fontSize="$sm" color={colors.textSecondary} lineHeight="$md">
            {mode === 'edit' 
              ? 'Cập nhật thông tin nông trại của bạn'
              : 'Chụp ảnh sổ đỏ để hệ thống tự động nhận diện thông tin đất đai'
            }
          </Text>
        </VStack>

        {/* ===== BƯỚC 1: OCR SỔ ĐỎ (BẮT BUỘC - CHỈ CREATE MODE) ===== */}
        {mode === 'create' && (
          <Box
            bg={ocrResult ? colors.primarySoft : colors.card}
            borderRadius="$xl"
            p="$4"
            borderWidth={2}
            borderColor={ocrResult ? colors.success : colors.warning}
            sx={{
              shadowColor: ocrResult ? colors.success : colors.warning,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <VStack space="md">
              {/* Header */}
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space="sm">
                  <Box
                    bg={ocrResult ? colors.success : colors.warning}
                    borderRadius="$full"
                    p="$2"
                  >
                    <FileText size={20} color="#fff" strokeWidth={2.5} />
                  </Box>
                  <VStack>
                    <Text fontSize="$md" fontWeight="$bold" color={colors.text}>
                      Bước 1: Chụp ảnh sổ đỏ
                    </Text>
                    <Text fontSize="$xs" color={colors.textSecondary}>
                      Bắt buộc để nhận diện thông tin
                    </Text>
                  </VStack>
                </HStack>

                {ocrResult && (
                  <Box
                    bg={colors.success}
                    borderRadius="$full"
                    px="$3"
                    py="$1"
                  >
                    <Text fontSize="$xs" color="#fff" fontWeight="$bold">
                      ✓ Hoàn thành
                    </Text>
                  </Box>
                )}
              </HStack>

              {redBookImage ? (
                // ===== ĐÃ CÓ ẢNH =====
                <VStack space="sm">
                  {/* Preview Image */}
                  <Box
                    borderRadius="$lg"
                    overflow="hidden"
                    borderWidth={2}
                    borderColor={ocrResult ? colors.success : colors.border}
                    position="relative"
                  >
                    <Image
                      source={{ uri: redBookImage }}
                      style={{ width: '100%', height: 240 }}
                      resizeMode="cover"
                    />
                    
                    {/* OCR Processing Overlay */}
                    {isOCRProcessing && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="rgba(0,0,0,0.7)"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Spinner size="large" color={colors.success} />
                        <Text color="#fff" mt="$3" fontSize="$md" fontWeight="$semibold">
                          Đang xử lý ảnh...
                        </Text>
                        <Text color="#fff" mt="$1" fontSize="$xs">
                          Vui lòng chờ trong giây lát
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {/* OCR Result Summary */}
                  {ocrResult && (
                    <Box 
                      bg={colors.success} 
                      borderRadius="$lg" 
                      p="$4"
                      sx={{
                        shadowColor: colors.success,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <HStack alignItems="center" space="xs" mb="$3">
                        <CheckCircle2 size={20} color="#fff" strokeWidth={2.5} />
                        <Text fontSize="$sm" fontWeight="$bold" color="#fff">
                          Thông tin đã nhận diện
                        </Text>
                      </HStack>
                      
                      <VStack space="sm">
                        <HStack justifyContent="space-between">
                          <Text fontSize="$xs" color="#fff" opacity={0.9}>
                            Số sổ đỏ:
                          </Text>
                          <Text fontSize="$xs" fontWeight="$bold" color="#fff">
                            {ocrResult.land_certificate_number}
                          </Text>
                        </HStack>
                        
                        <HStack justifyContent="space-between">
                          <Text fontSize="$xs" color="#fff" opacity={0.9}>
                            Địa chỉ:
                          </Text>
                          <Text fontSize="$xs" fontWeight="$bold" color="#fff" textAlign="right" flex={1} ml="$2">
                            {ocrResult.address}
                          </Text>
                        </HStack>
                        
                        <HStack justifyContent="space-between">
                          <Text fontSize="$xs" color="#fff" opacity={0.9}>
                            Diện tích:
                          </Text>
                          <Text fontSize="$xs" fontWeight="$bold" color="#fff">
                            {ocrResult.area_sqm?.toLocaleString('vi-VN')} m²
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  {/* Actions */}
                  <HStack space="sm">
                    <Button
                      flex={1}
                      variant="outline"
                      borderColor={colors.error}
                      onPress={handleRemoveRedBookImage}
                    >
                      <HStack space="xs" alignItems="center">
                        <XCircle size={16} color={colors.error} strokeWidth={2} />
                        <ButtonText color={colors.error} fontSize="$sm" fontWeight="$semibold">
                          Xóa ảnh
                        </ButtonText>
                      </HStack>
                    </Button>
                    
                    <Button
                      flex={1}
                      bg={colors.success}
                      onPress={handlePickRedBookImage}
                    >
                      <HStack space="xs" alignItems="center">
                        <Camera size={16} color="#fff" strokeWidth={2} />
                        <ButtonText color="#fff" fontSize="$sm" fontWeight="$semibold">
                          Chụp lại
                        </ButtonText>
                      </HStack>
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                // ===== CHƯA CÓ ẢNH =====
                <VStack space="md">
                  {/* Illustration/Icon */}
                  <Box alignItems="center" py="$6">
                    <Box
                      bg={colors.primarySoft}
                      borderRadius="$full"
                      p="$6"
                      mb="$4"
                    >
                      <Camera size={64} color={colors.success} strokeWidth={1.5} />
                    </Box>
                    
                    <Text fontSize="$md" fontWeight="$bold" color={colors.text} textAlign="center">
                      Chụp ảnh sổ đỏ của bạn
                    </Text>
                    <Text fontSize="$sm" color={colors.textSecondary} textAlign="center" mt="$2" lineHeight="$md">
                      Hệ thống sẽ tự động nhận diện thông tin như: số sổ, địa chỉ, diện tích
                    </Text>
                  </Box>

                  {/* Tips */}
                  <Box
                    bg={colors.warning + '20'}
                    borderRadius="$lg"
                    p="$3"
                    borderWidth={1}
                    borderColor={colors.warning}
                  >
                    <Text fontSize="$xs" fontWeight="$bold" color={colors.warning} mb="$2">
                      💡 Mẹo chụp ảnh tốt:
                    </Text>
                    <VStack space="xs">
                      <Text fontSize="$xs" color={colors.text}>• Đảm bảo đủ ánh sáng, không bị tối</Text>
                      <Text fontSize="$xs" color={colors.text}>• Chụp rõ các số và chữ trên sổ đỏ</Text>
                      <Text fontSize="$xs" color={colors.text}>• Chụp toàn bộ trang có thông tin</Text>
                      <Text fontSize="$xs" color={colors.text}>• Không bị mờ, méo hoặc che khuất</Text>
                    </VStack>
                  </Box>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    bg={colors.warning}
                    onPress={handlePickRedBookImage}
                    sx={{
                      shadowColor: colors.warning,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <HStack space="sm" alignItems="center" py="$2">
                      <Camera size={24} color="#fff" strokeWidth={2.5} />
                      <ButtonText color="#fff" fontSize="$md" fontWeight="$bold">
                        Bắt đầu chụp ảnh sổ đỏ
                      </ButtonText>
                    </HStack>
                  </Button>
                </VStack>
              )}
            </VStack>
          </Box>
        )}

        {/* ===== WARNING: Phải OCR trước khi điền form (CHỈ CREATE MODE) ===== */}
        {mode === 'create' && !ocrResult && (
          <Box
            bg={colors.error + '15'}
            borderRadius="$lg"
            p="$4"
            borderWidth={1}
            borderColor={colors.error}
          >
            <HStack space="sm" alignItems="flex-start">
              <AlertCircle size={20} color={colors.error} strokeWidth={2} style={{ marginTop: 2 }} />
              <VStack flex={1}>
                <Text fontSize="$sm" fontWeight="$bold" color={colors.error}>
                  Chưa thể điền thông tin
                </Text>
                <Text fontSize="$xs" color={colors.error} lineHeight="$sm" mt="$1">
                  Vui lòng chụp ảnh sổ đỏ trước để hệ thống tự động nhận diện và điền thông tin. Điều này đảm bảo tính chính xác và minh bạch.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* ===== FORM: Điền thông tin ===== */}
        {(mode === 'edit' || ocrResult) && (
          <>
            {/* Section Header */}
            <HStack alignItems="center" space="sm" mt="$2">
              <Box
                bg={colors.success}
                borderRadius="$full"
                p="$2"
              >
                <FileText size={16} color="#fff" strokeWidth={2.5} />
              </Box>
              <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
                {mode === 'edit' ? 'Thông tin nông trại' : 'Bước 2: Điền thông tin bổ sung'}
              </Text>
            </HStack>

            {/* Info Notice */}
            {mode === 'create' && (
              <Box
                bg="#E0F2FE"
                borderRadius="$lg"
                p="$3"
                borderWidth={1}
                borderColor="#38BDF8"
              >
                <HStack space="xs" alignItems="flex-start">
                  <AlertCircle size={16} color="#0284C7" strokeWidth={2} style={{ marginTop: 2 }} />
                  <VStack flex={1}>
                    <Text fontSize="$xs" fontWeight="$semibold" color="#0284C7">
                      Thông tin tự động
                    </Text>
                    <Text fontSize="$xs" color="#0284C7" lineHeight="$sm" mt="$1">
                      Các trường đã được điền tự động từ sổ đỏ. Bạn có thể chỉnh sửa nếu cần thiết.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Main Form */}
            <CustomForm
              fields={formFields}
              initialValues={formValues}
              onSubmit={handleSubmit}
              submitButtonText={
                isSubmitting 
                  ? 'Đang xử lý...' 
                  : mode === 'edit' 
                    ? 'Cập nhật nông trại' 
                    : 'Hoàn tất đăng ký'
              }
              isSubmitting={isSubmitting}
              gap={24}
            />
          </>
        )}
      </VStack>
    </ScrollView>
  );
};