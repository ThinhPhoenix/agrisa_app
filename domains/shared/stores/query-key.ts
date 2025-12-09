export const QueryKey = {
  AUTH: {
    SIGN_IN: "sign-in",
    SIGN_UP: "sign-up",
    CHECK_IDENTIFIER: "check-identifier",
    ME: "auth-me",
    SEND_PHONE_OTP: "send-phone-otp",
    VERIFY_PHONE_OTP: "verify-phone-otp",
  },

  INSURANCE_PARTNER: {
    VIEW_ALL: "insurance-partners",
    DETAIL: "insurance-partner-detail",
  },

  EKYC: {
    STATUS: "ekyc-status",
    OCR_ID: "ekyc-ocr-id",
    FACE_SCAN: "ekyc-face-scan",
    CARD_INFO: "ekyc-card-info",
    CONFIRM_CARD_INFO: "ekyc-confirm-card-info",
    UPDATE_CARD_INFO_FIELDS: "ekyc-update-card-info-fields",
    RESET_EKYC: "ekyc-reset",
  },

  POLICY: {
    BASE: "policy-base",
    DETAIL: "policy-detail",
    REGISTER: "policy-register",
    REGISTERED_POLICIES: "registered-policies",
    REGISTERED_POLICY_DETAIL: "registered-policy-detail",
    UNDERWRITING: "underwriting-policy",
    CANCEL: "policy-cancel",
    GET_CANCEL_REASONS: "get-cancel-reasons",
    GET_CANCEL_REQUESTS: "get-cancel-requests",
  },

  FARM: {
    LIST: "farm-list",
    DETAIL: "farm-detail",
    CREATE: "farm-create",
    UPDATE: "farm-update",
  },

  STATS: {
    OVERVIEW: "stats-overview",
  },

  DATA_SOURCE: {
    DETAIL: "data-source-detail",
  },

  DATA_MONITOR: {
    POLICY_MONITOR: "policy-data-monitor",
    DETAIL_POLICY_MONITOR: "detail-policy-data-monitor",
  },

  PAYMENT: {
    GET_ALL_PAYMENT: "get-all-payment",
    GET_DETAIL_PAYMENT: "get-detail-payment",
    GET_TOTAL_BY_TYPE: "get-total-by-type",
  },

  CLAIM_EVENT: {
    LIST: "claim-event-list",
    DETAIL: "claim-event-detail",
    BY_POLICY: "claim-event-by-policy",
    BY_FARM: "claim-event-by-farm",
  },

  PAYOUT: {
    GET_PAYOUT_BY_CLAIM_ID: "get-payout-by-claim-id",
  },

  NOTIFICATION: {
    GET_ALL: "get-all-notification",
    GET_COUNT: "get-notification-count",
  },

  SHARED: {
    BANKS: "shared-banks",
  },

  TEST: "test",
};
