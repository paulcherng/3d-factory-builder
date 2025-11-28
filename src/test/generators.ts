import * as fc from 'fast-check';
import { Zone, ZoneType, EnvironmentSettings } from '../types';

// 生成有效的 ZoneType
export const arbZoneType = (): fc.Arbitrary<ZoneType> => {
  return fc.constantFrom(
    ZoneType.ADMIN,
    ZoneType.UTILITY,
    ZoneType.BUILDING,
    ZoneType.PRODUCTION,
    ZoneType.WAREHOUSE
  );
};

// 生成有效的 3D 座標
export const arbPosition = (): fc.Arbitrary<[number, number, number]> => {
  return fc.tuple(
    fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
    fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
    fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true })
  );
};

// 生成正數尺寸陣列
export const arbDimensions = (): fc.Arbitrary<[number, number, number]> => {
  return fc.tuple(
    fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }),
    fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }),
    fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true })
  );
};

// 生成非正數尺寸（用於測試驗證）
export const arbInvalidDimensions = (): fc.Arbitrary<[number, number, number]> => {
  return fc.tuple(
    fc.float({ max: Math.fround(0), noNaN: true }),
    fc.float({ max: Math.fround(0), noNaN: true }),
    fc.float({ max: Math.fround(0), noNaN: true })
  );
};

// 生成有效的 Zone ID
export const arbZoneId = (): fc.Arbitrary<string> => {
  return fc.tuple(
    arbZoneType(),
    fc.integer({ min: 1, max: 99 })
  ).map(([type, num]) => `${type}_${String(num).padStart(2, '0')}`);
};

// 生成有效的 Zone 物件
export const arbZone = (): fc.Arbitrary<Zone> => {
  return fc.record({
    id: arbZoneId(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    type: arbZoneType(),
    position: arbPosition(),
    dimensions: arbDimensions(),
    description: fc.string({ maxLength: 200 })
  });
};

// 生成 Zone 陣列
export const arbZones = (minLength = 0, maxLength = 20): fc.Arbitrary<Zone[]> => {
  return fc.array(arbZone(), { minLength, maxLength });
};

// 生成有效的環境設定
export const arbEnvironmentSettings = (): fc.Arbitrary<EnvironmentSettings> => {
  return fc.record({
    fog: fc.record({
      enabled: fc.boolean(),
      near: fc.float({ min: Math.fround(1), max: Math.fround(50), noNaN: true }),
      far: fc.float({ min: Math.fround(50), max: Math.fround(200), noNaN: true }),
      color: fc.constantFrom('#cccccc', '#ffffff', '#aaaaaa')
    }),
    camera: fc.record({
      position: arbPosition(),
      fov: fc.float({ min: Math.fround(30), max: Math.fround(120), noNaN: true })
    }),
    ground: fc.record({
      size: fc.float({ min: Math.fround(50), max: Math.fround(500), noNaN: true }),
      divisions: fc.integer({ min: 10, max: 50 })
    })
  });
};

// 生成網格大小
export const arbGridSize = (): fc.Arbitrary<number> => {
  return fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true });
};

// 生成無效的 Zone（缺少必要欄位）
export const arbInvalidZone = (): fc.Arbitrary<Partial<Zone>> => {
  return fc.oneof(
    // 缺少 id
    fc.record({
      name: fc.string(),
      type: arbZoneType(),
      position: arbPosition(),
      dimensions: arbDimensions(),
      description: fc.string()
    }),
    // 缺少 position
    fc.record({
      id: arbZoneId(),
      name: fc.string(),
      type: arbZoneType(),
      dimensions: arbDimensions(),
      description: fc.string()
    }),
    // 缺少 dimensions
    fc.record({
      id: arbZoneId(),
      name: fc.string(),
      type: arbZoneType(),
      position: arbPosition(),
      description: fc.string()
    }),
    // 無效的 dimensions（非正數）
    fc.record({
      id: arbZoneId(),
      name: fc.string(),
      type: arbZoneType(),
      position: arbPosition(),
      dimensions: arbInvalidDimensions(),
      description: fc.string()
    })
  );
};
