import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useEditorStore } from './editorStore';
import { resetZoneCounter } from '../utils/defaults';
import { arbZones, arbZone, arbPosition, arbInvalidDimensions } from '../test/generators';

describe('EditorStore - Zone Management Properties', () => {
  beforeEach(() => {
    // 重置 store 到初始狀態
    useEditorStore.setState({
      zones: [],
      selectedZoneId: null,
      mode: 'edit',
      snapToGrid: true,
      gridSize: 1
    });
    // 重置 ID 計數器
    resetZoneCounter();
  });

  // Feature: factory-3d-editor, Property 1: 區域創建增加計數
  // Validates: Requirements 1.1
  it('Property 1: 對於任意初始狀態，創建新區域應該使 zones 陣列長度增加 1', () => {
    fc.assert(
      fc.property(arbZones(0, 10), (initialZones) => {
        // 設定初始狀態
        useEditorStore.setState({ zones: initialZones });
        const initialLength = useEditorStore.getState().zones.length;

        // 創建新區域
        useEditorStore.getState().addZone();

        // 驗證長度增加 1
        const newLength = useEditorStore.getState().zones.length;
        expect(newLength).toBe(initialLength + 1);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 2: 區域 ID 唯一性
  // Validates: Requirements 1.2
  it('Property 2: 對於任意數量的區域創建操作，所有區域的 ID 應該互不相同', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (numZones) => {
        // 重置狀態
        useEditorStore.setState({ zones: [] });
        resetZoneCounter();

        // 創建多個區域
        for (let i = 0; i < numZones; i++) {
          useEditorStore.getState().addZone();
        }

        // 收集所有 ID
        const zones = useEditorStore.getState().zones;
        const ids = zones.map(z => z.id);

        // 驗證所有 ID 唯一
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 3: 新區域具有有效預設值
  // Validates: Requirements 1.3
  it('Property 3: 對於任意新創建的區域，應該具有有效的 position、dimensions 和 type 預設值', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // 重置狀態
        useEditorStore.setState({ zones: [] });

        // 創建新區域
        useEditorStore.getState().addZone();

        // 獲取新區域
        const zones = useEditorStore.getState().zones;
        const newZone = zones[zones.length - 1];

        // 驗證 dimensions 所有值 > 0
        expect(newZone.dimensions[0]).toBeGreaterThan(0);
        expect(newZone.dimensions[1]).toBeGreaterThan(0);
        expect(newZone.dimensions[2]).toBeGreaterThan(0);

        // 驗證 position 為有效座標
        expect(isFinite(newZone.position[0])).toBe(true);
        expect(isFinite(newZone.position[1])).toBe(true);
        expect(isFinite(newZone.position[2])).toBe(true);

        // 驗證 type 為有效枚舉值
        expect(newZone.type).toBeDefined();
        expect(typeof newZone.type).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 4: 位置更新保持一致性
  // Validates: Requirements 2.1, 2.3, 2.4
  it('Property 4: 對於任意區域和任意新位置座標，更新位置後該區域的 position 屬性應該等於新座標', () => {
    fc.assert(
      fc.property(arbZone(), arbPosition(), (zone, newPosition) => {
        // 設定初始狀態
        useEditorStore.setState({ zones: [zone] });

        // 更新位置
        useEditorStore.getState().updateZone(zone.id, { position: newPosition });

        // 獲取更新後的區域
        const updatedZone = useEditorStore.getState().zones.find(z => z.id === zone.id);

        // 驗證位置已更新
        expect(updatedZone).toBeDefined();
        expect(updatedZone!.position[0]).toBe(newPosition[0]);
        expect(updatedZone!.position[1]).toBe(newPosition[1]);
        expect(updatedZone!.position[2]).toBe(newPosition[2]);
      }),
      { numRuns: 100 }
    );
  });
});


describe('EditorStore - Property Update Properties', () => {
  beforeEach(() => {
    useEditorStore.setState({
      zones: [],
      selectedZoneId: null,
      mode: 'edit',
      snapToGrid: true,
      gridSize: 1
    });
  });

  // Feature: factory-3d-editor, Property 8: 類型更新保持其他屬性不變
  // Validates: Requirements 4.3
  it('Property 8: 對於任意區域和任意有效 ZoneType，更新 type 後，position、dimensions、name 和 description 應該保持不變', () => {
    fc.assert(
      fc.property(arbZone(), fc.constantFrom('ADMIN', 'UTILITY', 'BUILDING', 'PRODUCTION', 'WAREHOUSE'), (zone, newType) => {
        useEditorStore.setState({ zones: [zone] });
        
        const originalPosition = [...zone.position];
        const originalDimensions = [...zone.dimensions];
        const originalName = zone.name;
        const originalDescription = zone.description;

        useEditorStore.getState().updateZone(zone.id, { type: newType as any });

        const updatedZone = useEditorStore.getState().zones.find(z => z.id === zone.id);
        expect(updatedZone).toBeDefined();
        expect(updatedZone!.position).toEqual(originalPosition);
        expect(updatedZone!.dimensions).toEqual(originalDimensions);
        expect(updatedZone!.name).toBe(originalName);
        expect(updatedZone!.description).toBe(originalDescription);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 9: 屬性更新正確性
  // Validates: Requirements 4.4, 4.5
  it('Property 9: 對於任意區域和任意字串值，更新 name 或 description 後，對應屬性應該等於新值', () => {
    fc.assert(
      fc.property(arbZone(), fc.string(), fc.string(), (zone, newName, newDescription) => {
        useEditorStore.setState({ zones: [zone] });

        // 更新 name
        useEditorStore.getState().updateZone(zone.id, { name: newName });
        let updatedZone = useEditorStore.getState().zones.find(z => z.id === zone.id);
        expect(updatedZone!.name).toBe(newName);

        // 更新 description
        useEditorStore.getState().updateZone(zone.id, { description: newDescription });
        updatedZone = useEditorStore.getState().zones.find(z => z.id === zone.id);
        expect(updatedZone!.description).toBe(newDescription);
      }),
      { numRuns: 100 }
    );
  });
});


describe('EditorStore - Environment Properties', () => {
  beforeEach(() => {
    useEditorStore.setState({
      zones: [],
      selectedZoneId: null,
      mode: 'edit',
      snapToGrid: true,
      gridSize: 1
    });
  });

  // Feature: factory-3d-editor, Property 14: 環境設定更新正確性
  // Feature: factory-3d-editor, Property 15: 環境重置恢復預設值
  // Validates: Requirements 7.1, 7.2, 7.3, 7.5
  it('Property 14 & 15: 環境設定更新正確且重置恢復預設值', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(1), max: Math.fround(50), noNaN: true }),
        fc.float({ min: Math.fround(50), max: Math.fround(200), noNaN: true }),
        fc.float({ min: Math.fround(30), max: Math.fround(120), noNaN: true }),
        fc.float({ min: Math.fround(50), max: Math.fround(500), noNaN: true }),
        (fogNear, fogFar, fov, groundSize) => {
          const defaultEnv = useEditorStore.getState().environment;
          
          // 更新霧氣設定
          useEditorStore.getState().updateEnvironment({
            fog: { ...defaultEnv.fog, near: fogNear, far: fogFar }
          });
          let env = useEditorStore.getState().environment;
          expect(env.fog.near).toBe(fogNear);
          expect(env.fog.far).toBe(fogFar);
          
          // 更新攝影機設定
          useEditorStore.getState().updateEnvironment({
            camera: { ...env.camera, fov }
          });
          env = useEditorStore.getState().environment;
          expect(env.camera.fov).toBe(fov);
          
          // 更新地面設定
          useEditorStore.getState().updateEnvironment({
            ground: { ...env.ground, size: groundSize }
          });
          env = useEditorStore.getState().environment;
          expect(env.ground.size).toBe(groundSize);
          
          // 重置環境設定
          useEditorStore.getState().resetEnvironment();
          env = useEditorStore.getState().environment;
          
          // 驗證恢復預設值
          expect(env.fog.near).toBe(defaultEnv.fog.near);
          expect(env.fog.far).toBe(defaultEnv.fog.far);
          expect(env.camera.fov).toBe(defaultEnv.camera.fov);
          expect(env.ground.size).toBe(defaultEnv.ground.size);
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('EditorStore - Delete and Validation Properties', () => {
  beforeEach(() => {
    useEditorStore.setState({
      zones: [],
      selectedZoneId: null,
      mode: 'edit',
      snapToGrid: true,
      gridSize: 1
    });
  });

  // Feature: factory-3d-editor, Property 16: 區域刪除移除正確物件
  // Validates: Requirements 8.1, 8.2
  it('Property 16: 對於任意 zones 陣列和任意區域 ID，刪除後 zones 陣列不應包含該 ID 的區域，且長度減少 1', () => {
    fc.assert(
      fc.property(arbZones(1, 20), (zones) => {
        // 確保所有 ID 唯一
        const uniqueZones = zones.filter((zone, index, self) => 
          self.findIndex(z => z.id === zone.id) === index
        );
        
        if (uniqueZones.length === 0) return; // 跳過空陣列
        
        useEditorStore.setState({ zones: uniqueZones });
        
        // 選擇一個隨機區域刪除
        const zoneToDelete = uniqueZones[Math.floor(Math.random() * uniqueZones.length)];
        const initialLength = uniqueZones.length;
        
        // 刪除區域
        useEditorStore.getState().removeZone(zoneToDelete.id);
        
        // 驗證
        const updatedZones = useEditorStore.getState().zones;
        expect(updatedZones.length).toBe(initialLength - 1);
        expect(updatedZones.find(z => z.id === zoneToDelete.id)).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  // Feature: factory-3d-editor, Property 17: 無效值驗證保持原值
  // Validates: Requirements 8.4, 8.5
  it('Property 17: 對於任意區域和任意無效屬性值，更新操作應該被拒絕，所有屬性保持不變', () => {
    fc.assert(
      fc.property(arbZone(), arbInvalidDimensions(), (zone, invalidDimensions) => {
        useEditorStore.setState({ zones: [zone] });
        
        const originalZone = { ...zone };
        
        // 嘗試用無效尺寸更新
        useEditorStore.getState().updateZone(zone.id, { dimensions: invalidDimensions });
        
        // 驗證區域保持不變
        const updatedZone = useEditorStore.getState().zones.find(z => z.id === zone.id);
        expect(updatedZone).toBeDefined();
        expect(updatedZone!.dimensions).toEqual(originalZone.dimensions);
        expect(updatedZone!.position).toEqual(originalZone.position);
        expect(updatedZone!.name).toBe(originalZone.name);
        expect(updatedZone!.type).toBe(originalZone.type);
      }),
      { numRuns: 100 }
    );
  });
});
