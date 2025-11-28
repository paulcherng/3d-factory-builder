import { Zone, ZoneType } from '../types';

// 驗證尺寸為正數
export const validateDimensions = (dimensions: [number, number, number]): boolean => {
  return dimensions.every(d => typeof d === 'number' && d > 0 && isFinite(d));
};

// 驗證位置座標有效性
export const validatePosition = (position: [number, number, number]): boolean => {
  return position.every(p => typeof p === 'number' && isFinite(p));
};

// 驗證區域類型
export const validateZoneType = (type: ZoneType): boolean => {
  return Object.values(ZoneType).includes(type);
};

// 驗證完整區域物件
export const validateZone = (zone: Partial<Zone>): boolean => {
  // 檢查必要欄位
  if (!zone.id || !zone.position || !zone.dimensions) {
    return false;
  }

  // 檢查尺寸為正數
  if (!validateDimensions(zone.dimensions)) {
    return false;
  }

  // 檢查位置為有效數字
  if (!validatePosition(zone.position)) {
    return false;
  }

  // 檢查類型有效
  if (zone.type && !validateZoneType(zone.type)) {
    return false;
  }

  return true;
};

// 驗證區域更新
export const validateZoneUpdates = (
  currentZone: Zone,
  updates: Partial<Zone>
): Partial<Zone> | null => {
  const validatedUpdates: Partial<Zone> = {};

  // 驗證尺寸
  if (updates.dimensions) {
    if (!validateDimensions(updates.dimensions)) {
      console.error('尺寸必須大於 0');
      return null;
    }
    validatedUpdates.dimensions = updates.dimensions;
  }

  // 驗證位置
  if (updates.position) {
    if (!validatePosition(updates.position)) {
      console.error('位置座標無效');
      return null;
    }
    validatedUpdates.position = updates.position;
  }

  // 驗證類型
  if (updates.type) {
    if (!validateZoneType(updates.type)) {
      console.error('無效的區域類型');
      return null;
    }
    validatedUpdates.type = updates.type;
  }

  // 名稱和描述可以是任意字串
  if (updates.name !== undefined) {
    validatedUpdates.name = updates.name;
  }

  if (updates.description !== undefined) {
    validatedUpdates.description = updates.description;
  }

  // ID 不應該被更新
  if (updates.id && updates.id !== currentZone.id) {
    console.error('不能修改區域 ID');
    return null;
  }

  return validatedUpdates;
};
