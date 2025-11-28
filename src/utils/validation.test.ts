import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateDimensions, validateZoneUpdates } from './validation';
import { snapToGrid } from './gridSnap';
import { arbPosition, arbDimensions, arbGridSize, arbZone, arbInvalidDimensions } from '../test/generators';

describe('Validation and Transform Properties', () => {
  // Feature: factory-3d-editor, Property 5: 網格吸附正確對齊
  // Validates: Requirements 2.2
  it('Property 5: 對於任意位置值和網格大小，啟用吸附後的座標應該是網格大小的整數倍', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
        arbGridSize(),
        (value, gridSize) => {
          const snapped = snapToGrid(value, gridSize);
          
          // 驗證結果是網格大小的整數倍
          const ratio = snapped / gridSize;
          const roundedRatio = Math.round(ratio);
          
          // 允許浮點數誤差
          expect(Math.abs(ratio - roundedRatio)).toBeLessThan(0.0001);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 6: 尺寸更新正確性
  // Validates: Requirements 3.2, 3.3, 3.4
  it('Property 6: 對於任意區域和任意正數尺寸值，更新後 dimensions 應該等於新值', () => {
    fc.assert(
      fc.property(arbZone(), arbDimensions(), (zone, newDimensions) => {
        const result = validateZoneUpdates(zone, { dimensions: newDimensions });
        
        // 驗證更新成功
        expect(result).not.toBeNull();
        expect(result!.dimensions).toBeDefined();
        expect(result!.dimensions![0]).toBe(newDimensions[0]);
        expect(result!.dimensions![1]).toBe(newDimensions[1]);
        expect(result!.dimensions![2]).toBe(newDimensions[2]);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 7: 尺寸驗證拒絕非正數
  // Validates: Requirements 3.5
  it('Property 7: 對於任意區域和任意非正數尺寸值，更新操作應該被拒絕，原 dimensions 保持不變', () => {
    fc.assert(
      fc.property(arbZone(), arbInvalidDimensions(), (zone, invalidDimensions) => {
        const result = validateZoneUpdates(zone, { dimensions: invalidDimensions });
        
        // 驗證更新被拒絕
        expect(result).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});
