
/**
 * Model Insurance Partner cơ bản
 */
export interface InsurancePartner {
  partner_id: string;
  partner_display_name: string;
  partner_logo_url: string;
  cover_photo_url: string;
  partner_tagline: string;
  partner_description: string;
  partner_phone: string;
  partner_official_email: string;
  customer_service_hotline: string;
  hotline: string;
  support_hours: string;
  partner_website: string;
  fax_number: string;
  head_office_address: string;
  province_name: string;
  ward_name: string;
  partner_rating_score: number;
  partner_rating_count: number;
  trust_metric_experience: number;
  trust_metric_clients: number;
  trust_metric_claim_rate: number;
  total_payouts: string;
  average_payout_time: string;
  confirmation_timeline: string;
  coverage_areas: string;
  year_established: number;
}

/**
 * Response từ API cho Insurance Partner
 */
export interface InsurancePartnerResponse {
  partner_id: string;
  partner_display_name: string;
  partner_logo_url: string;
  cover_photo_url: string;
  partner_tagline: string;
  partner_description: string;
  partner_phone: string;
  partner_official_email: string;
  customer_service_hotline: string;
  hotline: string;
  support_hours: string;
  partner_website: string;
  head_office_address: string;
  province_name: string;
  ward_name: string;
  partner_rating_score: number;
  partner_rating_count: number;
  trust_metric_experience: number;
  trust_metric_clients: number;
  trust_metric_claim_rate: number;
  total_payouts: string;
  average_payout_time: string;
  confirmation_timeline: string;
  coverage_areas: string;
  year_established: number;
  legal_company_name: string;
  partner_trading_name: string;
  company_type: "domestic" | "foreign" | "joint_venture";
  incorporation_date: string;
  tax_identification_number: string;
  business_registration_number: string;
  insurance_license_number: string;
  license_issue_date: string;
  license_expiry_date: string;
  authorized_insurance_lines: string[];
  operating_provinces: string[];
  legal_document_urls: string[];
  province_code: string;
  district_code: string;
  ward_code: string;
  postal_code: string;
  fax_number: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
  last_updated_by_id: string;
  last_updated_by_name: string;
}
