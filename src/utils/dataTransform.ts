import { Zone } from '../types';
import { validateZone } from './validation';

// 匯出區域為 FACTORY_ZONES 格式
export const exportZones = (zones: Zone[]): string => {
  const formatted = zones.map(zone => {
    const zoneData: any = {
      id: zone.id,
      name: zone.name,
      type: zone.type,
      geometry: zone.geometry,
      position: zone.position,
      dimensions: zone.dimensions,
      description: zone.description
    };
    
    // 只在有自定義顏色時才包含
    if (zone.color) {
      zoneData.color = zone.color;
    }
    
    // 只在有群組時才包含
    if (zone.groupId) {
      zoneData.groupId = zone.groupId;
    }
    
    return zoneData;
  });

  return `const FACTORY_ZONES = ${JSON.stringify(formatted, null, 2)};`;
};

// 匯入結果介面
export interface ImportResult {
  success: boolean;
  zones?: Zone[];
  error?: string;
}

// 匯入區域資料
export const importZones = (data: Zone[]): ImportResult => {
  // 檢查是否為陣列
  if (!Array.isArray(data)) {
    return {
      success: false,
      error: '資料格式錯誤：應為陣列'
    };
  }

  // 驗證每個區域
  const missingFields: string[] = [];
  const invalidZones: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const zone = data[i];

    // 檢查必要欄位（color 和 groupId 是可選的）
    const requiredFields = ['id', 'name', 'type', 'position', 'dimensions', 'description'];
    const missing = requiredFields.filter(field => !(field in zone));

    if (missing.length > 0) {
      missingFields.push(`區域 ${i + 1} 缺少欄位: ${missing.join(', ')}`);
      invalidZones.push(i);
      continue;
    }
    
    // geometry 欄位如果不存在，設置預設值
    if (!zone.geometry) {
      zone.geometry = 'box';
    }

    // 驗證區域完整性
    if (!validateZone(zone)) {
      invalidZones.push(i);
    }
  }

  // 如果有錯誤，返回錯誤訊息
  if (invalidZones.length > 0) {
    const errorMessages = [];
    if (missingFields.length > 0) {
      errorMessages.push(...missingFields);
    }
    if (invalidZones.length > 0) {
      errorMessages.push(`區域 ${invalidZones.map(i => i + 1).join(', ')} 資料無效`);
    }

    return {
      success: false,
      error: `資料不完整或無效：\n${errorMessages.join('\n')}`
    };
  }

  // 所有驗證通過，返回資料
  return {
    success: true,
    zones: data
  };
};
