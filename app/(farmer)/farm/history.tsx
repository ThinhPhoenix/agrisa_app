import { AgrisaHeader } from '@/components/Header';
import { useAgrisaColors } from '@/domains/agrisa_theme/hooks/useAgrisaColor';
import { FarmHistoryList } from '@/domains/farm/components/farm-history-list';
import { Box } from '@gluestack-ui/themed';
import React, { useState } from 'react';

interface FarmRegistrationHistory {
  id: string;
  farm_name: string;
  registration_date: number;
  status: 'pending' | 'approved' | 'rejected';
  province: string;
  district: string;
  area_sqm: number;
  crop_type: string; // 'rice', 'coffee', etc.
  rejection_reason?: string;
}

export default function FarmHistoryScreen() {
  const { colors } = useAgrisaColors();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [historyList] = useState<FarmRegistrationHistory[]>([
    {
      id: '1',
      farm_name: 'Trang trại lúa Đồng Tháp',
      registration_date: 1704067200,
      status: 'approved',
      province: 'Đồng Tháp',
      district: 'Cao Lãnh',
      area_sqm: 50000,
      crop_type: 'rice',
    },
    {
      id: '2',
      farm_name: 'Vườn rau An Giang',
      registration_date: 1703462400,
      status: 'pending',
      province: 'An Giang',
      district: 'Châu Đốc',
      area_sqm: 30000,
      crop_type: 'rice',
    },
    {
      id: '3',
      farm_name: 'Đồng lúa Cần Thơ',
      registration_date: 1702857600,
      status: 'rejected',
      province: 'Cần Thơ',
      district: 'Phong Điền',
      area_sqm: 40000,
      crop_type: 'rice',
      rejection_reason: 'Giấy tờ đất đai không hợp lệ',
    },
    {
      id: '4',
      farm_name: 'Vườn cà phê Đắk Lắk',
      registration_date: 1705277600,
      status: 'pending',
      province: 'Đắk Lắk',
      district: 'Buôn Ma Thuột',
      area_sqm: 60000,
      crop_type: 'coffee',
    },
    {
      id: '5',
      farm_name: 'Trang trại rau sạch Long An',
      registration_date: 1706487200,
      status: 'rejected',
      province: 'Long An',
      district: 'Tân An',
      area_sqm: 25000,
      crop_type: 'rice',
      rejection_reason: 'Thiếu giấy chứng nhận sử dụng đất',
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleItemPress = (item: FarmRegistrationHistory) => {
    console.log('Pressed:', item);
  };

  return (
    <Box flex={1} bg={colors.background}>
      <AgrisaHeader title="Lịch sử đăng ký" showBackButton={true} />
      <FarmHistoryList
        historyList={historyList}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onItemPress={handleItemPress}
      />
    </Box>
  );
}
