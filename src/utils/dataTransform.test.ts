import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { exportZones, importZones } from './dataTransform';
import { arbZones, arbInvalidZone } from '../test/generators';

describe('Data Transform Properties', () => {
  // Feature: factory-3d-editor, Property 10: 匯出包含所有區域
  // Feature: factory-3d-editor, Property 11: 匯出格式完整性
  // Validates: Requirements 5.1, 5.2, 5.3, 5.4
  it('Property 10 & 11: 對於任意 zones 陣列，匯出的資料應該包含相同數量的區域物件且所有必要欄位完整', () => {
    fc.assert(
      fc.property(arbZones(0, 20), (zones) => {
        const exported = exportZones(zones);
        
        // 解析匯出的資料
        const jsonMatch = exported.match(/\[[\s\S]*\]/);
        expect(jsonMatch).not.toBeNull();
        
        const parsed = JSON.parse(jsonMatch![0]);
        
        // 驗證數量相同
        expect(parsed.length).toBe(zones.length);
        
        // 驗證每個區域的欄位完整性
        parsed.forEach((zone: any, index: number) => {
          expect(zone).toHaveProperty('id');
          expect(zone).toHaveProperty('name');
          expect(zone).toHaveProperty('type');
          expect(zone).toHaveProperty('position');
          expect(zone).toHaveProperty('dimensions');
          expect(zone).toHaveProperty('description');
          
          // 驗證 position 和 dimensions 是長度為 3 的陣列
          expect(Array.isArray(zone.position)).toBe(true);
          expect(zone.position.length).toBe(3);
          expect(Array.isArray(zone.dimensions)).toBe(true);
          expect(zone.dimensions.length).toBe(3);
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 12: 匯入匯出往返一致性
  // Validates: Requirements 5.1, 9.1, 9.2
  it('Property 12: 對於任意有效的 zones 陣列，匯出後再匯入應該產生等價的陣列', () => {
    fc.assert(
      fc.property(arbZones(1, 20), (zones) => {
        // 匯出
        const exported = exportZones(zones);
        
        // 解析匯出的資料
        const jsonMatch = exported.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch![0]);
        
        // 匯入
        const result = importZones(parsed);
        
        // 驗證匯入成功
        expect(result.success).toBe(true);
        expect(result.zones).toBeDefined();
        expect(result.zones!.length).toBe(zones.length);
        
        // 驗證每個區域的屬性相同
        result.zones!.forEach((zone, index) => {
          expect(zone.id).toBe(zones[index].id);
          expect(zone.name).toBe(zones[index].name);
          expect(zone.type).toBe(zones[index].type);
          
          // 驗證 position（處理 +0 vs -0 的情況）
          expect(zone.position[0]).toBeCloseTo(zones[index].position[0], 5);
          expect(zone.position[1]).toBeCloseTo(zones[index].position[1], 5);
          expect(zone.position[2]).toBeCloseTo(zones[index].position[2], 5);
          
          // 驗證 dimensions
          expect(zone.dimensions[0]).toBeCloseTo(zones[index].dimensions[0], 5);
          expect(zone.dimensions[1]).toBeCloseTo(zones[index].dimensions[1], 5);
          expect(zone.dimensions[2]).toBeCloseTo(zones[index].dimensions[2], 5);
          
          expect(zone.description).toBe(zones[index].description);
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 18: 匯入驗證拒絕無效資料
  // Validates: Requirements 9.3, 9.4
  it('Property 18: 對於任意缺少必要欄位或格式錯誤的資料，匯入操作應該被拒絕', () => {
    fc.assert(
      fc.property(fc.array(arbInvalidZone(), { minLength: 1, maxLength: 10 }), (invalidZones) => {
        const result = importZones(invalidZones as any);
        
        // 驗證匯入失敗
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.zones).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});
