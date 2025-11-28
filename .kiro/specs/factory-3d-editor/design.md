# 設計文件

## 概述

3D 工廠佈局編輯器是一個基於 React 和 React Three Fiber 的網頁應用程式，提供直觀的視覺化介面來創建和編輯工廠建築物的 3D 佈局。系統採用元件化架構，將編輯功能、3D 渲染和資料管理清晰分離。

核心技術棧：
- **React**: UI 框架
- **React Three Fiber**: 3D 渲染（基於 Three.js）
- **@react-three/drei**: Three.js 輔助工具
- **TypeScript**: 類型安全
- **Zustand 或 React Context**: 狀態管理

## 架構

系統採用分層架構：

```
┌─────────────────────────────────────────┐
│         UI Layer (React Components)      │
│  ┌──────────────┐    ┌───────────────┐  │
│  │ Editor Panel │    │ Preview Panel │  │
│  └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         State Management Layer           │
│         (Zustand Store / Context)        │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         3D Rendering Layer               │
│         (React Three Fiber)              │
│  ┌──────────────┐    ┌───────────────┐  │
│  │ Zone Objects │    │ Environment   │  │
│  └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Data Layer                       │
│  ┌──────────────┐    ┌───────────────┐  │
│  │ Import/Export│    │ Validation    │  │
│  └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────┘
```

### 主要元件

1. **App**: 根元件，管理整體佈局和模式切換
2. **EditorPanel**: 編輯模式介面，包含工具列和屬性面板
3. **PreviewPanel**: 預覽模式介面，包含環境控制
4. **Canvas3D**: React Three Fiber 畫布，渲染 3D 場景
5. **Zone**: 代表單一建築物的 3D 物件
6. **ZoneControls**: 處理區域的拖動和變換
7. **PropertyEditor**: 編輯選中區域的屬性
8. **EnvironmentControls**: 調整霧氣、攝影機、地面設定
9. **DataManager**: 處理匯入/匯出功能

## 元件和介面

### 資料類型

```typescript
enum ZoneType {
  ADMIN = 'ADMIN',
  UTILITY = 'UTILITY',
  BUILDING = 'BUILDING',
  PRODUCTION = 'PRODUCTION',
  WAREHOUSE = 'WAREHOUSE'
}

interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  position: [number, number, number]; // [x, y, z]
  dimensions: [number, number, number]; // [width, height, depth]
  description: string;
}

interface EnvironmentSettings {
  fog: {
    enabled: boolean;
    near: number;
    far: number;
    color: string;
  };
  camera: {
    position: [number, number, number];
    fov: number;
  };
  ground: {
    size: number;
    divisions: number;
  };
}

interface EditorState {
  zones: Zone[];
  selectedZoneId: string | null;
  mode: 'edit' | 'preview';
  environment: EnvironmentSettings;
  snapToGrid: boolean;
  gridSize: number;
}
```

### 核心元件介面

```typescript
// 狀態管理 Store
interface EditorStore {
  // State
  zones: Zone[];
  selectedZoneId: string | null;
  environment: EnvironmentSettings;
  snapToGrid: boolean;
  gridSize: number;
  
  // Actions
  addZone: () => void;
  removeZone: (id: string) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  selectZone: (id: string | null) => void;
  updateEnvironment: (updates: Partial<EnvironmentSettings>) => void;
  exportData: () => string;
  importData: (data: Zone[]) => void;
}

// Zone 元件 Props
interface ZoneProps {
  zone: Zone;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (position: [number, number, number]) => void;
  snapToGrid: boolean;
  gridSize: number;
}

// PropertyEditor 元件 Props
interface PropertyEditorProps {
  zone: Zone | null;
  onUpdate: (updates: Partial<Zone>) => void;
}

// EnvironmentControls 元件 Props
interface EnvironmentControlsProps {
  settings: EnvironmentSettings;
  onUpdate: (updates: Partial<EnvironmentSettings>) => void;
}
```

## 資料模型

### Zone 資料模型

Zone 是系統的核心資料模型，代表工廠中的一個建築物或區域：

- **id**: 唯一識別碼，格式為 `{TYPE}_{序號}`（如 `ADMIN_01`）
- **name**: 顯示名稱，支援中英文
- **type**: 區域類型枚舉值
- **position**: 3D 空間中的位置 [x, y, z]，y 通常為高度的一半
- **dimensions**: 尺寸 [寬度, 高度, 深度]
- **description**: 文字描述

### 座標系統

- **X 軸**: 左右方向（正值向右）
- **Y 軸**: 上下方向（正值向上）
- **Z 軸**: 前後方向（正值向前）
- **原點**: 校園中心點 (0, 0, 0)

### 網格吸附

當 `snapToGrid` 啟用時，位置座標會被調整到最近的網格點：

```
snappedValue = Math.round(value / gridSize) * gridSize
```

預設 `gridSize` 為 1 單位。


## 正確性屬性

*屬性是一個特徵或行為，應該在系統的所有有效執行中保持為真——本質上是關於系統應該做什麼的正式陳述。屬性作為人類可讀規範和機器可驗證正確性保證之間的橋樑。*

基於需求分析，以下是需要透過屬性測試驗證的核心正確性屬性：

### 屬性 1: 區域創建增加計數
*對於任意* 初始狀態，創建新區域應該使 zones 陣列長度增加 1
**驗證需求: 1.1**

### 屬性 2: 區域 ID 唯一性
*對於任意* 數量的區域創建操作，所有區域的 ID 應該互不相同
**驗證需求: 1.2**

### 屬性 3: 新區域具有有效預設值
*對於任意* 新創建的區域，應該具有有效的 position、dimensions 和 type 預設值（dimensions 所有值 > 0，position 為有效座標，type 為有效枚舉值）
**驗證需求: 1.3**

### 屬性 4: 位置更新保持一致性
*對於任意* 區域和任意新位置座標，更新位置後該區域的 position 屬性應該等於新座標
**驗證需求: 2.1, 2.3, 2.4**

### 屬性 5: 網格吸附正確對齊
*對於任意* 位置值和網格大小，啟用吸附後的座標應該是網格大小的整數倍
**驗證需求: 2.2**

### 屬性 6: 尺寸更新正確性
*對於任意* 區域和任意正數尺寸值 [w, h, d]，更新後 dimensions 應該等於 [w, h, d]
**驗證需求: 3.2, 3.3, 3.4**

### 屬性 7: 尺寸驗證拒絕非正數
*對於任意* 區域和任意非正數尺寸值（≤ 0），更新操作應該被拒絕，原 dimensions 保持不變
**驗證需求: 3.5**

### 屬性 8: 類型更新保持其他屬性不變
*對於任意* 區域和任意有效 ZoneType，更新 type 後，position、dimensions、name 和 description 應該保持不變
**驗證需求: 4.3**

### 屬性 9: 屬性更新正確性
*對於任意* 區域和任意字串值，更新 name 或 description 後，對應屬性應該等於新值
**驗證需求: 4.4, 4.5**

### 屬性 10: 匯出包含所有區域
*對於任意* zones 陣列，匯出的資料應該包含相同數量的區域物件
**驗證需求: 5.1**

### 屬性 11: 匯出格式完整性
*對於任意* 區域，匯出的物件應該包含 id、name、type、position、dimensions 和 description 欄位，且 position 和 dimensions 都是長度為 3 的陣列
**驗證需求: 5.2, 5.3, 5.4**

### 屬性 12: 匯入匯出往返一致性
*對於任意* 有效的 zones 陣列，匯出後再匯入應該產生等價的陣列（所有區域的所有屬性相同）
**驗證需求: 5.1, 9.1, 9.2**

### 屬性 13: 預覽渲染所有區域
*對於任意* zones 陣列，預覽模式應該渲染相同數量的 3D 物件
**驗證需求: 6.2**

### 屬性 14: 環境設定更新正確性
*對於任意* 有效的環境設定值（fog、camera、ground），更新後對應的 environment 屬性應該等於新值
**驗證需求: 7.1, 7.2, 7.3**

### 屬性 15: 環境重置恢復預設值
*對於任意* 修改過的環境設定，重置操作後所有環境參數應該等於預設值
**驗證需求: 7.5**

### 屬性 16: 區域刪除移除正確物件
*對於任意* zones 陣列和任意區域 ID，刪除後 zones 陣列不應包含該 ID 的區域，且長度減少 1
**驗證需求: 8.1, 8.2**

### 屬性 17: 無效值驗證保持原值
*對於任意* 區域和任意無效屬性值（如負數尺寸、空 ID），更新操作應該被拒絕，所有屬性保持不變
**驗證需求: 8.4, 8.5**

### 屬性 18: 匯入驗證拒絕無效資料
*對於任意* 缺少必要欄位或格式錯誤的資料，匯入操作應該被拒絕，zones 陣列保持不變
**驗證需求: 9.3, 9.4**

## 錯誤處理

### 輸入驗證錯誤

1. **無效尺寸值**: 當使用者輸入非正數尺寸時
   - 顯示錯誤訊息："尺寸必須大於 0"
   - 保持原有值不變
   - 在輸入欄位顯示紅色邊框

2. **無效位置值**: 當位置座標為 NaN 或 Infinity 時
   - 顯示錯誤訊息："位置座標無效"
   - 恢復到上一個有效位置

3. **空白名稱**: 當區域名稱為空字串時
   - 顯示警告訊息："建議填寫區域名稱"
   - 允許儲存但標記為未命名

### 資料匯入錯誤

1. **格式錯誤**: JSON 解析失敗
   - 顯示錯誤訊息："資料格式錯誤，請檢查 JSON 格式"
   - 不修改現有資料

2. **缺少必要欄位**: 區域物件缺少 id、position 或 dimensions
   - 顯示錯誤訊息："資料不完整，缺少必要欄位: {欄位名稱}"
   - 列出所有缺少欄位的區域
   - 不匯入任何資料

3. **類型錯誤**: 欄位類型不符合預期
   - 顯示錯誤訊息："資料類型錯誤: {欄位名稱} 應為 {預期類型}"
   - 不匯入任何資料

### 操作錯誤

1. **刪除不存在的區域**: 嘗試刪除不存在的 ID
   - 靜默失敗，不顯示錯誤
   - 記錄警告到 console

2. **選擇不存在的區域**: 嘗試選擇不存在的 ID
   - 清除選擇狀態
   - 不顯示錯誤訊息

### 渲染錯誤

1. **Three.js 渲染失敗**: WebGL 不支援或初始化失敗
   - 顯示降級訊息："您的瀏覽器不支援 3D 渲染，請使用現代瀏覽器"
   - 提供 2D 平面圖替代方案

2. **記憶體不足**: 區域數量過多導致效能問題
   - 顯示警告："區域數量過多可能影響效能"
   - 建議分批處理或簡化場景

## 測試策略

### 單元測試

使用 **Vitest** 作為測試框架，測試以下核心功能：

1. **資料驗證函式**
   - 測試 `validateZone()` 正確識別無效資料
   - 測試 `validateDimensions()` 拒絕非正數
   - 測試 `validatePosition()` 處理 NaN 和 Infinity

2. **座標轉換函式**
   - 測試 `snapToGrid()` 正確對齊座標
   - 測試邊界情況（0、負數、小數）

3. **資料轉換函式**
   - 測試 `exportToJSON()` 產生正確格式
   - 測試 `importFromJSON()` 正確解析資料
   - 測試往返轉換的一致性

4. **ID 生成函式**
   - 測試 `generateZoneId()` 產生唯一 ID
   - 測試 ID 格式符合規範

5. **狀態管理**
   - 測試 store actions 正確更新狀態
   - 測試狀態更新不會產生副作用

### 屬性測試

使用 **fast-check** 作為屬性測試框架，實現上述所有正確性屬性。

**配置要求**:
- 每個屬性測試至少執行 100 次迭代
- 使用自訂生成器產生有效的 Zone 物件
- 每個測試必須標註對應的設計文件屬性編號

**測試標註格式**:
```typescript
// Feature: factory-3d-editor, Property 1: 區域創建增加計數
```

**自訂生成器**:
- `arbZone()`: 生成有效的 Zone 物件
- `arbPosition()`: 生成有效的 3D 座標
- `arbDimensions()`: 生成正數尺寸陣列
- `arbZoneType()`: 生成有效的 ZoneType 枚舉值
- `arbEnvironmentSettings()`: 生成有效的環境設定

### 整合測試

使用 **React Testing Library** 測試元件互動：

1. **編輯流程**
   - 創建區域 → 選擇 → 編輯屬性 → 驗證更新
   - 創建多個區域 → 拖動 → 驗證位置更新

2. **匯入匯出流程**
   - 創建區域 → 匯出 → 清空 → 匯入 → 驗證一致性

3. **模式切換**
   - 編輯模式 → 預覽模式 → 驗證渲染
   - 預覽模式 → 調整環境 → 驗證更新

### 視覺測試

使用 **Storybook** 進行視覺回歸測試：

1. 不同數量區域的場景
2. 不同環境設定的預覽
3. 錯誤狀態的 UI 顯示
4. 響應式佈局在不同螢幕尺寸

## 效能考量

### 渲染優化

1. **實例化渲染**: 當區域數量 > 50 時，使用 Three.js InstancedMesh
2. **LOD (Level of Detail)**: 根據攝影機距離調整區域細節
3. **視錐剔除**: 只渲染攝影機視野內的區域
4. **React.memo**: 記憶化 Zone 元件避免不必要的重新渲染

### 狀態管理優化

1. **選擇性訂閱**: 元件只訂閱需要的狀態切片
2. **批次更新**: 使用 `batch()` 合併多個狀態更新
3. **不可變更新**: 使用 immer 或展開運算子確保不可變性

### 記憶體管理

1. **清理 Three.js 資源**: 在元件卸載時釋放 geometry 和 material
2. **限制歷史記錄**: 撤銷/重做堆疊最多保留 50 個狀態
3. **虛擬化列表**: 當區域列表 > 100 時使用虛擬滾動

## 使用者介面設計

### 編輯模式佈局

```
┌─────────────────────────────────────────────────────┐
│  工具列: [新增] [刪除] [匯入] [匯出] [預覽]          │
├──────────────┬──────────────────────┬───────────────┤
│              │                      │               │
│  區域列表    │    3D 畫布           │  屬性面板     │
│              │                      │               │
│  □ ADMIN_01  │                      │  名稱: ___    │
│  ☑ GARAGE_01 │      [3D 場景]       │  類型: [▼]    │
│  □ WH_01     │                      │  位置:        │
│              │                      │   X: ___      │
│              │                      │   Y: ___      │
│              │                      │   Z: ___      │
│              │                      │  尺寸:        │
│              │                      │   寬: ___     │
│              │                      │   高: ___     │
│              │                      │   深: ___     │
│              │                      │  描述: ___    │
└──────────────┴──────────────────────┴───────────────┘
```

### 預覽模式佈局

```
┌─────────────────────────────────────────────────────┐
│  [返回編輯]                                          │
├──────────────────────────────────┬───────────────────┤
│                                  │                   │
│                                  │  環境控制         │
│                                  │                   │
│         3D 預覽場景              │  霧氣:            │
│                                  │   近: [====|--]   │
│                                  │   遠: [======|-]  │
│                                  │                   │
│                                  │  攝影機:          │
│                                  │   FOV: [===|--]   │
│                                  │   位置: ___       │
│                                  │                   │
│                                  │  地面:            │
│                                  │   大小: [====|-]  │
│                                  │                   │
│                                  │  [重置設定]       │
└──────────────────────────────────┴───────────────────┘
```

### 互動設計

1. **拖動區域**
   - 滑鼠懸停時高亮顯示
   - 拖動時顯示半透明預覽
   - 吸附時顯示網格對齊線

2. **選擇區域**
   - 點擊區域選中
   - 選中時顯示邊框和控制點
   - 在列表中同步高亮

3. **編輯屬性**
   - 即時更新 3D 場景
   - 無效輸入時顯示紅色邊框
   - 使用 debounce 避免過度渲染

4. **攝影機控制**
   - 滑鼠左鍵拖動旋轉
   - 滑鼠滾輪縮放
   - 滑鼠右鍵拖動平移

## 技術實作細節

### 狀態管理實作 (Zustand)

```typescript
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export const useEditorStore = create<EditorStore>()(
  devtools((set, get) => ({
    zones: [],
    selectedZoneId: null,
    environment: getDefaultEnvironment(),
    snapToGrid: true,
    gridSize: 1,
    
    addZone: () => {
      const newZone = createDefaultZone();
      set((state) => ({
        zones: [...state.zones, newZone],
        selectedZoneId: newZone.id
      }));
    },
    
    removeZone: (id) => {
      set((state) => ({
        zones: state.zones.filter(z => z.id !== id),
        selectedZoneId: state.selectedZoneId === id ? null : state.selectedZoneId
      }));
    },
    
    updateZone: (id, updates) => {
      // 驗證更新
      const validatedUpdates = validateZoneUpdates(updates);
      if (!validatedUpdates) return;
      
      set((state) => ({
        zones: state.zones.map(z => 
          z.id === id ? { ...z, ...validatedUpdates } : z
        )
      }));
    },
    
    // ... 其他 actions
  }))
);
```

### 網格吸附實作

```typescript
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function snapPositionToGrid(
  position: [number, number, number],
  gridSize: number
): [number, number, number] {
  return [
    snapToGrid(position[0], gridSize),
    position[1], // Y 軸通常不吸附
    snapToGrid(position[2], gridSize)
  ];
}
```

### 資料驗證實作

```typescript
function validateZone(zone: Partial<Zone>): boolean {
  // 檢查必要欄位
  if (!zone.id || !zone.position || !zone.dimensions) {
    return false;
  }
  
  // 檢查尺寸為正數
  if (zone.dimensions.some(d => d <= 0)) {
    return false;
  }
  
  // 檢查位置為有效數字
  if (zone.position.some(p => !isFinite(p))) {
    return false;
  }
  
  // 檢查類型有效
  if (zone.type && !Object.values(ZoneType).includes(zone.type)) {
    return false;
  }
  
  return true;
}
```

### 匯出功能實作

```typescript
function exportZones(zones: Zone[]): string {
  const formatted = zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    type: zone.type,
    position: zone.position,
    dimensions: zone.dimensions,
    description: zone.description
  }));
  
  return `const FACTORY_ZONES = ${JSON.stringify(formatted, null, 2)};`;
}
```

## 部署考量

### 瀏覽器支援

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要 WebGL 2.0 支援。

### 建置優化

1. **程式碼分割**: 使用動態 import 分離編輯器和預覽器
2. **Tree shaking**: 移除未使用的 Three.js 模組
3. **壓縮**: 使用 terser 壓縮 JavaScript
4. **資源優化**: 壓縮紋理和模型檔案

### 環境變數

```
VITE_DEFAULT_GRID_SIZE=1
VITE_MAX_ZONES=1000
VITE_ENABLE_PERFORMANCE_MONITORING=false
```

## 未來擴展

1. **多種形狀支援**: 圓柱、球體、自訂多邊形
2. **材質和紋理**: 為區域添加顏色和紋理
3. **圖層系統**: 組織複雜場景
4. **協作編輯**: 多人即時編輯
5. **動畫系統**: 添加移動路徑和動畫
6. **匯出格式**: 支援 glTF、OBJ 等 3D 格式
7. **模板系統**: 預設工廠佈局模板
8. **測量工具**: 距離和面積測量
