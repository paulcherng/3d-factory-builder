# 3D 工廠佈局編輯器

一個基於 React Three Fiber 的網頁 3D 工廠佈局編輯器，允許使用者創建、編輯和預覽工廠建築物的 3D 佈局。

## 功能特點

- ✨ 直觀的 3D 編輯介面
- 🎯 拖放功能支援網格吸附
- 📐 即時調整建築物尺寸和位置
- 🎨 多種區域類型（行政、倉庫、生產等）
- 💾 匯入/匯出 FACTORY_ZONES 資料格式
- 👁️ 3D 預覽模式
- 🌫️ 可調整環境設定（霧氣、攝影機、地面）

## 安裝

```bash
npm install
```

## 運行

開發模式：
```bash
npm run dev
```

建置生產版本：
```bash
npm run build
```

預覽生產版本：
```bash
npm run preview
```

## 測試

運行測試：
```bash
npm test
```

監視模式運行測試：
```bash
npm run test:watch
```

## 使用方式

### 編輯模式

1. **新增區域**: 點擊工具列的「新增區域」按鈕
2. **選擇區域**: 在 3D 場景中點擊區域，或在左側列表中選擇
3. **拖動區域**: 選中區域後，在 3D 場景中拖動調整位置
4. **編輯屬性**: 在右側屬性面板中修改名稱、類型、位置、尺寸和描述
5. **刪除區域**: 選中區域後，點擊「刪除」按鈕

### 匯入/匯出

- **匯出**: 點擊「匯出」按鈕，下載 `factory-zones.js` 文件
- **匯入**: 點擊「匯入」按鈕，選擇 JSON 或 JS 格式的文件

匯出格式範例：
```javascript
const FACTORY_ZONES = [
  {
    id: 'ADMIN_01',
    name: '行政大樓',
    type: 'ADMIN',
    position: [35, 6, -35],
    dimensions: [25, 12, 15],
    description: 'Main administrative offices.'
  }
];
```

### 預覽模式

1. 點擊「預覽」按鈕切換到預覽模式
2. 使用右側控制面板調整：
   - 霧氣效果（近距離/遠距離）
   - 攝影機視野角度
   - 地面網格大小
3. 點擊「重置設定」恢復預設值
4. 點擊「返回編輯」回到編輯模式

### 攝影機控制

- **旋轉**: 滑鼠左鍵拖動
- **縮放**: 滑鼠滾輪
- **平移**: 滑鼠右鍵拖動

## 技術棧

- **React 18** - UI 框架
- **TypeScript** - 類型安全
- **React Three Fiber** - 3D 渲染
- **@react-three/drei** - Three.js 輔助工具
- **Zustand** - 狀態管理
- **Vite** - 建置工具
- **Vitest** - 測試框架
- **fast-check** - 屬性測試

## 專案結構

```
src/
├── components/          # React 元件
│   ├── Canvas3D.tsx    # 3D 畫布
│   ├── Zone3D.tsx      # 3D 區域物件
│   ├── Toolbar.tsx     # 工具列
│   ├── ZoneList.tsx    # 區域列表
│   ├── PropertyEditor.tsx  # 屬性編輯器
│   └── EnvironmentControls.tsx  # 環境控制
├── store/              # 狀態管理
│   └── editorStore.ts  # Zustand store
├── utils/              # 工具函式
│   ├── defaults.ts     # 預設值
│   ├── validation.ts   # 驗證函式
│   ├── gridSnap.ts     # 網格吸附
│   └── dataTransform.ts  # 資料轉換
├── types.ts            # TypeScript 類型定義
├── App.tsx             # 根元件
└── main.tsx            # 入口文件
```

## 區域類型

- `ADMIN` - 行政區域（藍色）
- `UTILITY` - 公用設施（灰色）
- `BUILDING` - 一般建築（橙色）
- `PRODUCTION` - 生產區域（紅色）
- `WAREHOUSE` - 倉庫（綠色）

## 瀏覽器支援

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要 WebGL 2.0 支援。

## 授權

MIT
