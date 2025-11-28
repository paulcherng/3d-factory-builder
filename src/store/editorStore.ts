import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EditorStore, Zone, EnvironmentSettings } from '../types';
import { getDefaultEnvironment, createDefaultZone } from '../utils/defaults';
import { validateZoneUpdates } from '../utils/validation';
import { exportZones, importZones } from '../utils/dataTransform';

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      zones: [],
      selectedZoneId: null,
      selectedZoneIds: [],
      mode: 'edit',
      environment: getDefaultEnvironment(),
      snapToGrid: true,
      gridSize: 1,
      transformMode: 'translate',
      labelFontSize: 48, // 預設字體大小

      // 新增區域
      addZone: (geometry: 'box' | 'cylinder' = 'box') => {
        const newZone = createDefaultZone(geometry);
        set((state) => ({
          zones: [...state.zones, newZone],
          selectedZoneId: newZone.id,
          selectedZoneIds: [newZone.id]
        }));
      },

      // 刪除區域
      removeZone: (id: string) => {
        set((state) => ({
          zones: state.zones.filter(z => z.id !== id),
          selectedZoneId: state.selectedZoneId === id ? null : state.selectedZoneId
        }));
      },

      // 更新區域
      updateZone: (id: string, updates: Partial<Zone>) => {
        const zone = get().zones.find(z => z.id === id);
        if (!zone) return;

        // 驗證更新
        const validatedUpdates = validateZoneUpdates(zone, updates);
        if (!validatedUpdates) return;

        set((state) => ({
          zones: state.zones.map(z =>
            z.id === id ? { ...z, ...validatedUpdates } : z
          )
        }));
      },

      // 選擇區域（支援多選）
      selectZone: (id: string | null, multiSelect = false) => {
        if (id === null) {
          set({ selectedZoneId: null, selectedZoneIds: [] });
          return;
        }

        if (multiSelect) {
          const currentIds = get().selectedZoneIds;
          const isAlreadySelected = currentIds.includes(id);
          
          if (isAlreadySelected) {
            // 取消選擇
            const newIds = currentIds.filter(zid => zid !== id);
            set({ 
              selectedZoneIds: newIds,
              selectedZoneId: newIds.length > 0 ? newIds[0] : null
            });
          } else {
            // 添加到選擇
            const newIds = [...currentIds, id];
            set({ 
              selectedZoneIds: newIds,
              selectedZoneId: id
            });
          }
        } else {
          set({ selectedZoneId: id, selectedZoneIds: [id] });
        }
      },

      // 選擇多個區域
      selectMultipleZones: (ids: string[]) => {
        set({ 
          selectedZoneIds: ids,
          selectedZoneId: ids.length > 0 ? ids[0] : null
        });
      },

      // 清除選擇
      clearSelection: () => {
        set({ selectedZoneId: null, selectedZoneIds: [] });
      },

      // 對齊區域
      alignZones: (axis: 'x' | 'y' | 'z') => {
        const { zones, selectedZoneIds } = get();
        if (selectedZoneIds.length < 2) return;

        const selectedZones = zones.filter(z => selectedZoneIds.includes(z.id));
        
        // 計算對齊位置（使用第一個選中物件的位置）
        const referenceZone = selectedZones[0];
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        const alignValue = referenceZone.position[axisIndex];

        // 更新所有選中區域的位置
        set((state) => ({
          zones: state.zones.map(z => {
            if (selectedZoneIds.includes(z.id) && z.id !== referenceZone.id) {
              const newPosition: [number, number, number] = [...z.position];
              newPosition[axisIndex] = alignValue;
              return { ...z, position: newPosition };
            }
            return z;
          })
        }));
      },

      // 貼附到底面
      snapToGround: () => {
        const { selectedZoneIds } = get();
        if (selectedZoneIds.length === 0) return;

        // 更新所有選中區域的 Y 位置
        set((state) => ({
          zones: state.zones.map(z => {
            if (selectedZoneIds.includes(z.id)) {
              const newPosition: [number, number, number] = [...z.position];
              // Y 位置 = 高度的一半（物體底部貼地）
              newPosition[1] = z.dimensions[1] / 2;
              return { ...z, position: newPosition };
            }
            return z;
          })
        }));
      },

      // 更新環境設定
      updateEnvironment: (updates: Partial<EnvironmentSettings>) => {
        set((state) => ({
          environment: {
            ...state.environment,
            ...updates,
            fog: updates.fog ? { ...state.environment.fog, ...updates.fog } : state.environment.fog,
            camera: updates.camera ? { ...state.environment.camera, ...updates.camera } : state.environment.camera,
            ground: updates.ground ? { ...state.environment.ground, ...updates.ground } : state.environment.ground
          }
        }));
      },

      // 重置環境設定
      resetEnvironment: () => {
        set({ environment: getDefaultEnvironment() });
      },

      // 匯出資料
      exportData: () => {
        return exportZones(get().zones);
      },

      // 匯入資料
      importData: (data: Zone[]) => {
        const result = importZones(data);
        if (result.success && result.zones) {
          set({ zones: result.zones, selectedZoneId: null });
        } else {
          console.error('匯入失敗:', result.error);
          throw new Error(result.error);
        }
      },

      // 設定模式
      setMode: (mode: 'edit' | 'preview') => {
        set({ mode });
      },

      // 設定變換模式
      setTransformMode: (mode: 'translate' | 'scale') => {
        set({ transformMode: mode });
      },

      // 設定標籤字體大小
      setLabelFontSize: (size: number) => {
        set({ labelFontSize: size });
      }
    }),
    { name: 'EditorStore' }
  )
);
