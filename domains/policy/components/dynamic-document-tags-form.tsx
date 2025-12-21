import CustomForm from "@/components/custom-form";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { FileText, Info } from "lucide-react-native";
import React, { memo, useMemo, useRef } from "react";
import {
    convertDocumentTagsToFormFields,
    DocumentTagsSchema,
    getInitialValuesFromDocumentTags,
} from "../utils/document-tags.utils";

interface DynamicDocumentTagsFormProps {
  documentTags?: DocumentTagsSchema;
  onValuesChange?: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

/**
 * Component render dynamic form dựa trên document_tags schema
 * Tự động tạo các input fields phù hợp với type
 */
export const DynamicDocumentTagsForm: React.FC<DynamicDocumentTagsFormProps> = memo(({
  documentTags,
  onValuesChange,
  initialValues,
}) => {
  const { colors } = useAgrisaColors();
  const formRef = useRef<any>(null);

  // Nếu không có document_tags, không hiển thị gì
  if (!documentTags || Object.keys(documentTags).length === 0) {
    return null;
  }

  // Convert document_tags sang form fields - Memoize để tránh tính lại
  const formFields = useMemo(
    () => convertDocumentTagsToFormFields(documentTags),
    [documentTags]
  );

  // Initial values - Memoize để tránh tính lại
  const defaultInitialValues = useMemo(
    () => initialValues || getInitialValuesFromDocumentTags(documentTags),
    [initialValues, documentTags]
  );

  return (
    <VStack space="md">
      {/* Header */}
      <Box
        borderRadius="$xl"
        p="$4"
        borderWidth={1}
        borderColor={colors.info}
      >
        <HStack space="sm" alignItems="center" mb="$2">
          
          <Text fontSize="$md" fontWeight="$bold" >
            Thông tin bổ sung cho hồ sơ đăng ký
          </Text>
        </HStack>
        <HStack space="xs" alignItems="flex-start">
          <Text fontSize="$xs"flex={1} lineHeight={18}>
            Vui lòng điền các thông tin bên dưới để hoàn tất hồ sơ đăng ký bảo hiểm. 
            Các thông tin này sẽ được sử dụng để xác minh và xử lý hồ sơ của bạn.
          </Text>
        </HStack>
      </Box>

      {/* Dynamic Form */}
      <Box
        bg={colors.card_surface}
        borderRadius="$xl"
        p="$4"
        borderWidth={1}
        borderColor={colors.frame_border}
      >
        <CustomForm
          ref={formRef}
          fields={formFields}
          initialValues={defaultInitialValues}
          onValuesChange={onValuesChange}
          gap={16}
        />
      </Box>

      
    </VStack>
  );
});
