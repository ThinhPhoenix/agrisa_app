import { FormField } from "@/components/custom-form";

/**
 * Type definition cho document_tags từ backend
 * Format: { "field_name": "field_type" }
 * Example: { "họ và tên": "string", "ngày sinh": "date", "diện tích": "float" }
 */
export type DocumentTagsSchema = Record<string, string>;

/**
 * Mapping từ type string sang type của CustomForm
 */
const TYPE_MAPPING: Record<string, FormField["type"]> = {
  string: "input",
  text: "input",
  textarea: "textarea",
  number: "number",
  integer: "number",
  float: "number",
  date: "datepicker",
  datetime: "datepicker",
  boolean: "switch",
  select: "select",
  combobox: "combobox",
};

/**
 * Chuyển đổi document_tags schema thành FormField array
 * 
 * @param documentTags - Schema từ backend (field_name: field_type)
 * @returns Array of FormField để render trong CustomForm
 */
export const convertDocumentTagsToFormFields = (
  documentTags?: DocumentTagsSchema
): FormField[] => {
  if (!documentTags || Object.keys(documentTags).length === 0) {
    return [];
  }

  return Object.entries(documentTags)
    .filter(([_, fieldType]) => fieldType && typeof fieldType === "string")
    .map(([fieldName, fieldType]) => {
      const formType = TYPE_MAPPING[fieldType.toLowerCase()] || "input";

      // Format label từ field name (capitalize first letter)
      const label = fieldName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const field: FormField = {
        name: fieldName,
        label: label,
        type: formType,
        required: false, // Có thể điều chỉnh theo yêu cầu
      };

      return field;
    });
};

/**
 * Validate dữ liệu form trước khi submit
 *
 * @param formData - Dữ liệu từ form
 * @param documentTags - Schema validation
 * @returns Object chứa isValid và errors
 */
export const validateDocumentTagsData = (
  formData: Record<string, any>,
  documentTags?: DocumentTagsSchema
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!documentTags) {
    return { isValid: true, errors };
  }

  Object.entries(documentTags).forEach(([fieldName, fieldType]) => {
    const value = formData[fieldName];

    // Skip nếu fieldType không hợp lệ
    if (!fieldType || typeof fieldType !== "string") {
      return;
    }

    // Skip validation nếu không bắt buộc và không có giá trị
    if (!value || value === "") {
      return;
    }

    // Validate theo type
    switch (fieldType.toLowerCase()) {
      case "number":
      case "integer":
      case "float":
        if (isNaN(Number(value))) {
          errors[fieldName] = `${fieldName} phải là số hợp lệ`;
        }
        break;

      case "date":
      case "datetime":
        // Kiểm tra format DD/MM/YYYY
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(value)) {
          errors[fieldName] = `${fieldName} không đúng định dạng DD/MM/YYYY`;
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[fieldName] = `${fieldName} không hợp lệ`;
        }
        break;

      case "string":
      case "text":
      case "textarea":
        if (typeof value !== "string") {
          errors[fieldName] = `${fieldName} phải là văn bản`;
        }
        break;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format dữ liệu form để gửi lên backend
 * Tất cả giá trị sẽ được chuyển thành string
 *
 * @param formData - Dữ liệu từ form
 * @param documentTags - Schema để biết type
 * @returns Formatted data với tất cả values là string
 */
export const formatDocumentTagsForSubmit = (
  formData: Record<string, any>,
  documentTags?: DocumentTagsSchema
): Record<string, string> => {
  if (!documentTags) {
    return {};
  }

  const formatted: Record<string, string> = {};

  Object.entries(formData).forEach(([fieldName, value]) => {
    const fieldType = documentTags[fieldName];

    if (
      !fieldType ||
      typeof fieldType !== "string" ||
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    // Chuyển tất cả về string
    formatted[fieldName] = String(value);
  });

  return formatted;
};

/**
 * Lấy initial values từ document_tags (nếu có)
 *
 * @param documentTags - Schema
 * @returns Initial values cho form
 */
export const getInitialValuesFromDocumentTags = (
  documentTags?: DocumentTagsSchema
): Record<string, any> => {
  if (!documentTags) {
    return {};
  }

  const initialValues: Record<string, any> = {};

  Object.entries(documentTags).forEach(([fieldName, fieldType]) => {
    // Skip nếu fieldType không hợp lệ
    if (!fieldType || typeof fieldType !== "string") {
      initialValues[fieldName] = "";
      return;
    }

    switch (fieldType.toLowerCase()) {
      case "boolean":
        initialValues[fieldName] = false;
        break;
      case "integer":
      case "float":
      case "number":
        initialValues[fieldName] = undefined;
        break;
      default:
        initialValues[fieldName] = "";
    }
  });

  return initialValues;
};
