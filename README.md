# 3D 工廠佈局編輯器

一個基於 React、Three.js 和 React Three Fiber 的互動式 3D 工廠佈局編輯器，支持創建、編輯和管理工廠區域的 3D 模型。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Three.js](https://img.shields.io/badge/three.js-0.160.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)

## 功能特色

### 🎨 核心編輯功能
- **多種幾何形狀**：支持長方體和圓柱體
- **即時 3D 預覽**：所見即所得的編輯體驗
- **雙模式切換**：編輯模式和預覽模式
- **物件變換**：移動、縮放物件
- **網格吸附**：精確對齊物件位置

### 🎯 選擇與操作
- **單選/多選**：點擊選擇單個物件，Shift+拖曳框選多個物件
- **群組功能**：將多個物件群組，一起操作
- **對齊工具**：沿 X、Y、Z 軸對齊物件
- **貼地功能**：快速將物件底部對齊地面

### 🎨 視覺自定義
- **自定義顏色**：為每個物件設置獨特的顏色
- **類型預設顏色**：不同區域類型有預設顏色
- **標籤字體大小**：可調整物件名稱標籤大小
- **視覺輔助**：選擇框、邊界框、中心點標記

### ⏮️ 歷史管理
- **撤銷/重做**：支持 Ctrl+Z / Ctrl+Y 快捷鍵
- **歷史記錄**：保留最近 50 個操作狀態
- **智能記錄**：自動記錄重要操作

### 💾 資料管理
- **匯出功能**：將佈局匯出為 JSON 格式
- **匯入功能**：從 JSON 檔案載入佈局
- **資料驗證**：確保匯入資料的完整性和有效性

### 🎮 互動控制
- **攝影機控制**：OrbitControls 支持旋轉、縮放、平移視角
- **ViewCube**：快速切換標準視角
- **變換控制器**：直觀的 3D 控制器
  - 單軸移動/縮放
  - 雙軸平面移動/縮放
  - 三軸均勻縮放

## 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動開發服務器

```bash
npm run dev
```

應用程式將在 `http://localhost:5173/` 啟動。

### 建置生產版本

```bash
npm run build
```

### 執行測試

```bash
npm test
```

## 使用指南

### 基本操作

#### 創建物件
1. 點擊工具列的「➕ 長方體」或「➕ 圓柱體」按鈕
2. 新物件會出現在場景中心
3. 在右側屬性面板編輯物件屬性

#### 選擇物件
- **單選**：直接點擊物件
- **多選**：按住 Shift 鍵拖曳框選
- **群組選擇**：點擊群組中的任一物件會選中整個群組

#### 移動物件
1. 選擇物件
2. 確保處於「移動」模式（工具列）
3. 拖曳變換控制器：
   - 拖曳箭頭 → 單軸移動
   - 拖曳平面 → 雙軸移動

#### 縮放物件
1. 選擇物件
2. 切換到「縮放」模式
3. 拖曳變換控制器：
   - 拖曳軸端點 → 單軸縮放
   - 拖曳平面 → 雙軸縮放
   - 拖曳中心 → 均勻縮放

#### 變更顏色
1. 選擇物件
2. 在右側屬性面板找到「顏色」選項
3. 點擊顏色選擇器選擇新顏色
4. 點擊「重置顏色」恢復預設顏色

### 進階功能

#### 群組操作
1. 選擇多個物件（Shift+拖曳或 Ctrl+點擊）
2. 點擊「🔗 群組」按鈕（或按 Ctrl+G）
3. 群組後的物件會一起被選中和操作
4. 點擊「🔓 取消群組」解除群組（或按 Ctrl+Shift+G）

#### 對齊物件
1. 選擇多個物件
2. 點擊「對齊 X」、「對齊 Y」或「對齊 Z」按鈕
3. 所有物件會對齊到第一個選中物件的對應軸位置

#### 撤銷/重做
- **撤銷**：Ctrl+Z 或點擊「↶ 撤銷」按鈕
- **重做**：Ctrl+Y 或 Ctrl+Shift+Z 或點擊「↷ 重做」按鈕

#### 匯出/匯入
- **匯出**：點擊「匯出」按鈕，下載 JSON 檔案
- **匯入**：點擊「匯入」按鈕，選擇 JSON 檔案

## 鍵盤快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤銷 |
| `Ctrl+Y` | 重做 |
| `Ctrl+Shift+Z` | 重做（替代） |
| `Ctrl+G` | 群組選中的物件 |
| `Ctrl+Shift+G` | 取消群組 |
| `Shift+拖曳` | 框選多個物件 |
| `Delete` | 刪除選中的物件 |

## 區域類型

編輯器支持以下區域類型，每種類型有預設顏色：

| 類型 | 說明 | 預設顏色 |
|------|------|----------|
| ADMIN | 行政區域 | 藍色 (#3498db) |
| UTILITY | 公用設施 | 灰色 (#95a5a6) |
| BUILDING | 建築物 | 橙色 (#e67e22) |
| PRODUCTION | 生產區域 | 紅色 (#e74c3c) |
| WAREHOUSE | 倉儲區域 | 綠色 (#2ecc71) |

## 資料格式

### 匯出格式

```javascript
const FACTORY_ZONES = [
  {
    "id": "zone-1234567890",
    "name": "生產區域 A",
    "type": "PRODUCTION",
    "geometry": "box",
    "position": [10, 5, 10],
    "dimensions": [20, 10, 15],
    "description": "主要生產線區域",
    "color": "#e74c3c",
    "groupId": "group-1234567890"
  }
];
```

### 欄位說明

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一識別碼 |
| `name` | string | ✅ | 區域名稱 |
| `type` | ZoneType | ✅ | 區域類型 |
| `geometry` | 'box' \| 'cylinder' | ✅ | 幾何形狀 |
| `position` | [number, number, number] | ✅ | 位置 [x, y, z] |
| `dimensions` | [number, number, number] | ✅ | 尺寸（長方體：寬高深；圓柱：半徑、高度、分段） |
| `description` | string | ✅ | 描述 |
| `color` | string | ❌ | 自定義顏色（十六進制） |
| `groupId` | string | ❌ | 群組識別碼 |

## 技術架構

### 技術棧

- **React 18.2** - UI 框架
- **TypeScript 5.2** - 類型安全
- **Three.js 0.160** - 3D 渲染引擎
- **React Three Fiber 8.15** - React 的 Three.js 渲染器
- **React Three Drei 9.92** - Three.js 輔助工具
- **Zustand 4.4** - 狀態管理
- **Vite 5.0** - 建置工具
- **Vitest 1.1** - 測試框架

### 專案結構

```
src/
├── components/          # React 組件
│   ├── Canvas3D.tsx            # 3D 場景容器
│   ├── Zone3D.tsx              # 3D 物件組件
│   ├── Toolbar.tsx             # 工具列
│   ├── ZoneList.tsx            # 物件列表
│   ├── PropertyEditor.tsx      # 屬性編輯器
│   ├── SettingsPanel.tsx       # 設定面板
│   ├── HelpPanel.tsx           # 幫助面板
│   ├── SelectionBox.tsx        # 選擇框
│   ├── SelectionBoxOverlay.tsx # 選擇框覆蓋層
│   ├── MultiSelectTransform.tsx # 多選變換控制器
│   └── EnvironmentControls.tsx # 環境控制
├── store/               # 狀態管理
│   └── editorStore.ts          # Zustand store
├── utils/               # 工具函數
│   ├── defaults.ts             # 預設值
│   ├── validation.ts           # 資料驗證
│   ├── dataTransform.ts        # 資料轉換
│   └── gridSnap.ts             # 網格吸附
├── types.ts             # TypeScript 類型定義
├── App.tsx              # 主應用組件
└── main.tsx             # 應用入口

```

### 核心組件說明

#### Canvas3D
- 3D 場景的主容器
- 管理攝影機、光源、網格
- 整合 OrbitControls 和 TransformControls

#### Zone3D
- 單個 3D 物件的渲染
- 處理物件的選擇、移動、縮放
- 顯示物件名稱標籤

#### MultiSelectTransform
- 多選物件的變換控制
- 計算群組中心點
- 批量更新物件位置和尺寸

#### editorStore
- 使用 Zustand 管理全局狀態
- 包含所有物件資料和操作方法
- 支持撤銷/重做功能

## 開發指南

### 添加新的區域類型

1. 在 `src/types.ts` 中添加新類型：
```typescript
export enum ZoneType {
  // ... 現有類型
  NEW_TYPE = 'NEW_TYPE'
}
```

2. 在 `src/components/Zone3D.tsx` 中添加顏色：
```typescript
const getZoneColor = (type: ZoneType): string => {
  switch (type) {
    // ... 現有類型
    case ZoneType.NEW_TYPE:
      return '#hexcolor';
  }
};
```

### 添加新的幾何形狀

1. 在 `src/types.ts` 中更新類型：
```typescript
export type GeometryType = 'box' | 'cylinder' | 'newshape';
```

2. 在 `src/components/Zone3D.tsx` 中添加渲染邏輯：
```typescript
{zone.geometry === 'newshape' ? (
  <newShapeGeometry args={[...]} />
) : (
  // ... 現有形狀
)}
```

### 自定義變換行為

修改 `src/components/Zone3D.tsx` 或 `src/components/MultiSelectTransform.tsx` 中的 `handleTransformChange` 函數。

## 測試

### 執行所有測試
```bash
npm test
```

### 執行特定測試
```bash
npm test -- validation
```

### 測試覆蓋率
```bash
npm test -- --coverage
```

## 效能優化

### 已實現的優化
- **React.memo**：優化組件重新渲染
- **useRef**：避免不必要的狀態更新
- **批量更新**：多選操作時批量更新狀態
- **條件渲染**：只在需要時渲染 TransformControls

### 效能建議
- 避免同時選擇超過 50 個物件
- 定期清理不需要的歷史記錄
- 使用網格吸附減少即時計算

## 已知限制

1. **歷史記錄**：最多保留 50 個狀態
2. **群組嵌套**：不支持群組的嵌套
3. **旋轉功能**：目前不支持物件旋轉
4. **多選效能**：選擇大量物件（>50）時可能有延遲
5. **瀏覽器兼容性**：需要支持 WebGL 的現代瀏覽器

## 瀏覽器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要 WebGL 2.0 支持。

## 故障排除

### 問題：物件無法移動
**解決方案**：
- 確認已選擇物件（有黃色邊框）
- 確認處於移動模式
- 檢查是否按住 Shift 鍵（會啟用框選）

### 問題：多選不工作
**解決方案**：
- 確認按住 Shift 鍵拖曳
- 確認在 Canvas 區域內拖曳
- 檢查瀏覽器 Console 是否有錯誤

### 問題：匯入失敗
**解決方案**：
- 確認 JSON 格式正確
- 確認包含所有必填欄位
- 檢查資料類型是否正確

### 問題：效能問題
**解決方案**：
- 減少同時選擇的物件數量
- 關閉不必要的視覺效果
- 使用較新的瀏覽器版本

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 開發流程
1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 代碼規範
- 使用 TypeScript
- 遵循 ESLint 規則
- 添加適當的註釋
- 編寫單元測試

## 更新日誌

### v1.0.0 (2024-11-28)
- ✨ 初始版本發布
- ✅ 基本編輯功能
- ✅ 多選和群組功能
- ✅ 撤銷/重做功能
- ✅ 自定義顏色功能
- ✅ 匯出/匯入功能
- ✅ 完整的變換控制

## 授權

MIT License

## 聯絡方式

如有問題或建議，請開啟 Issue。

## 致謝

- [Three.js](https://threejs.org/) - 3D 圖形庫
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - React 渲染器
- [React Three Drei](https://github.com/pmndrs/drei) - 輔助工具
- [Zustand](https://github.com/pmndrs/zustand) - 狀態管理

---

Made with ❤️ using React, Three.js, and TypeScript
