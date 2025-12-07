/**
 * ============================================
 * 🏦 USE BANK HOOK
 * ============================================
 * Hook để lấy danh sách ngân hàng từ VietQR API
 * và quản lý state liên quan đến ngân hàng
 */

import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { Datum } from "../models/bank.model";
import { bankService } from "../services/bank.service";

export interface BankOption {
  label: string;
  value: string; // bin code
  logo: string;
  shortName: string;
  name: string;
}

/**
 * Hook để lấy danh sách ngân hàng
 * @returns Object chứa danh sách ngân hàng và các state liên quan
 */
export const useBank = () => {
  // Query để lấy danh sách ngân hàng
  const {
    data: banksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [QueryKey.SHARED.BANKS],
    queryFn: async () => {
      const response = await bankService.get.getAllBanks();
      return response;
    },
    staleTime: 1000 * 60 * 60, // Cache 1 giờ
    gcTime: 1000 * 60 * 60 * 24, // Giữ cache 24 giờ
  });

  // Lấy danh sách ngân hàng từ response
  const banks: Datum[] = (banksData as any)?.data?.data || [];

  // Chuyển đổi sang options cho combobox/select
  const bankOptions: BankOption[] = banks
    .filter((bank) => bank.transferSupported === 1) // Chỉ lấy ngân hàng hỗ trợ chuyển khoản
    .map((bank) => ({
      label: `${bank.shortName} - ${bank.name}`,
      value: bank.bin, // bank_code = bin
      logo: bank.logo,
      shortName: bank.shortName,
      name: bank.name,
    }));

  // Tìm ngân hàng theo bin code (bank_code)
  const getBankByCode = (bankCode: string): BankOption | undefined => {
    return bankOptions.find((bank) => bank.value === bankCode);
  };

  // Tìm logo ngân hàng theo bin code
  const getBankLogo = (bankCode: string): string => {
    const bank = getBankByCode(bankCode);
    return bank?.logo || "";
  };

  // Tìm tên ngắn ngân hàng theo bin code
  const getBankShortName = (bankCode: string): string => {
    const bank = getBankByCode(bankCode);
    return bank?.shortName || "";
  };

  return {
    banks,
    bankOptions,
    isLoading,
    isError,
    error,
    refetch,
    getBankByCode,
    getBankLogo,
    getBankShortName,
  };
};

export default useBank;
