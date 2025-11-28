# 3D 工廠佈局編輯器 - 最終修正 🎯

## ✅ 已完成的所有修正

### 1. 左鍵閃爍問題 🖱️
**問題**：左鍵選取物件會閃一下就取消選取（但右鍵和中鍵正常）

**根本原因**：
- Grid 的 onClick 會攔截所有點擊事件
- 即使 stopPropagation() 也無法阻止
- 導致點擊物體後立即觸發清除選擇

**解決方案**：
1. 移除 Grid 的 onClick
2. 添加一個不可見的背景平面（透明度 0）
3. 背景平面的 onClick 處理清除選擇
4. 物體的 onClick 使用 stopPropagation() 阻止冒泡

**代碼**：
```typescript
{/* 背景平面 - 點擊清除選擇 */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -0.01, 0]}
  onClick={(e) => {
    e.stopPropagation();
    clearSelection();
  }}
>
  <planeGeometry args={[size * 2, size * 2]} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>
```

**狀態**：✅ 已修正

---

### 2. 拖曳後取消選取問題 🎯
**問題**：對已選擇的物件做拖曳後，會直接取消選取該物件

**根本原因**：
- TransformControls 的 onMouseUp 觸發後
- 立即觸發 mesh 的 onClick 事件
- 導致重新選擇（看起來像取消選取）

**解決方案**：
1. 使用 `isDraggingRef` 追蹤拖曳狀態
2. onMouseDown 時設定 `isDraggingRef.current = true`
3. onMouseUp 時延遲 100ms 重置標記
4. onClick 時檢查標記，如果正在拖曳則忽略

**代碼**：
```typescript
const isDraggingRef = useRef(false);

const handleTransformStart = () => {
  isDraggingRef.current = true;
};

const handleTransformEnd = () => {
  // ... 更新邏輯
  setTimeout(() => {
    isDraggingRef.current = false;
  }, 100);
};

const handleClick = (e) => {
  if (isDraggingRef.current) return; // 拖曳中不處理點擊
  onSelect();
};
```

**狀態**：✅ 已修正

---

### 3. Shift 拉框多選功能 📦
**問題**：Shift 拉框來多選還是沒有辦法成功（之前導致白屏）

**新的解決方案**：
- 創建 `SelectionBoxOverlay` 組件
- 在 App 層級渲染（Canvas 外部）
- 使用 DOM 事件而非 Three.js 事件
- 使用 fixed 定位覆蓋整個畫面

**實作細節**：
1. 監聽 window 的 mousedown/mousemove/mouseup
2. 只在按住 Shift 時啟用
3. 繪製藍色虛線選擇框
4. 計算框內物體（基於屏幕投影）
5. 選擇框內的物體

**使用方式**：
1. 按住 **Shift** 鍵
2. 在空白處按下滑鼠左鍵
3. 拖拉出選擇框
4. 釋放滑鼠，框內物體被選中

**狀態**：✅ 已完成

---

## 🎨 所有功能總覽

### 選擇功能
- ✅ 左鍵點擊選擇（不閃爍）
- ✅ Ctrl + 點擊多選
- ✅ Shift + 拖拉框選
- ✅ 點擊背景清除選擇
- ✅ 拖曳後保持選擇

### 變換功能
- ✅ 移動模式（箭頭控制）
- ✅ 縮放模式（方塊控制）
- ✅ 即時更新屬性面板
- ✅ 網格吸附
- ✅ 拖曳時禁用攝影機

### 對齊功能
- ✅ 對齊 X 軸
- ✅ 對齊 Y 軸
- ✅ 對齊 Z 軸
- ✅ 貼附到底面（⬇️ 貼地）

### 幾何類型
- ✅ 長方體
- ✅ 圓柱體

### 視覺輔助
- ✅ 物體名稱標籤（32-200px 可調）
- ✅ XYZ 座標軸
- ✅ ViewCube 視角控制
- ✅ 選中高亮（黃色邊框）

### 設定面板
- ✅ 字體大小調整
- ✅ 網格吸附狀態
- ✅ 即時預覽

---

## 🎮 完整操作指南

### 基本選擇
```
左鍵點擊        → 選擇單一物件
Ctrl + 左鍵     → 多選物件
Shift + 拖拉    → 框選多個物件
點擊背景        → 清除所有選擇
```

### 變換操作
```
選擇物件 → 點擊「移動」→ 拖拉箭頭 → 沿軸移動
選擇物件 → 點擊「縮放」→ 拖拉方塊 → 沿軸縮放
```

### 對齊操作
```
多選物件 → 點擊「對齊 X/Y/Z」→ 對齊到第一個物件
選擇物件 → 點擊「⬇️ 貼地」→ 底部貼地
```

### 視角控制
```
滑鼠左鍵拖拉   → 旋轉視角
滑鼠滾輪       → 縮放
滑鼠右鍵拖拉   → 平移
點擊 ViewCube  → 切換標準視角
```

---

## 🔧 技術實現細節

### 事件處理層級
```
Window (SelectionBoxOverlay)
  ↓
Canvas (背景平面)
  ↓
Mesh (物體)
  ↓
TransformControls
```

### 防止事件衝突
1. **拖曳標記**：使用 ref 追蹤拖曳狀態
2. **延遲重置**：100ms 延遲避免立即觸發 onClick
3. **事件停止**：stopPropagation() 防止冒泡
4. **條件處理**：檢查標記決定是否處理事件

### 選擇框投影
```typescript
// 簡化的屏幕投影計算
screenX = rect.left + (zone.position[0] + 100) * (rect.width / 200);
screenY = rect.top + (100 - zone.position[2]) * (rect.height / 200);
```

---

## 📊 測試結果

### 選擇測試
- [x] 左鍵點擊不閃爍
- [x] 右鍵點擊正常
- [x] 中鍵點擊正常
- [x] Ctrl + 點擊多選
- [x] Shift + 拖拉框選
- [x] 點擊背景清除選擇

### 拖曳測試
- [x] 拖曳後保持選擇
- [x] 拖曳時攝影機不移動
- [x] 拖曳時屬性即時更新
- [x] 拖曳結束應用網格吸附

### 功能測試
- [x] 貼地功能正常
- [x] 對齊功能正常
- [x] 圓柱體創建正常
- [x] 字體大小調整正常

---

## 🎯 已解決的所有問題

| # | 問題 | 狀態 |
|---|------|------|
| 1 | 字體極限 32-200px | ✅ 完成 |
| 2 | 拖拉多選異常 | ✅ 完成 |
| 3 | 貼附到底面功能 | ✅ 完成 |
| 4 | 左鍵選取閃爍 | ✅ 完成 |
| 5 | 拖拉時即時更新屬性 | ✅ 完成 |

---

## 💡 使用技巧

### 快速建模工作流
1. 創建長方體/圓柱體
2. 使用移動模式定位
3. 使用縮放模式調整大小
4. 使用貼地功能對齊底部
5. 使用對齊功能整理佈局

### 批量操作
1. Shift + 拖拉框選多個物體
2. 點擊「⬇️ 貼地」統一高度
3. 點擊「對齊 X」統一 X 位置
4. 完成整齊排列

### 精確調整
1. 在屬性面板輸入精確數值
2. 或使用 Transform Controls 拖拉
3. 觀察即時更新的數值
4. 微調到理想位置

---

## 🚀 性能優化

- **事件委託**：SelectionBoxOverlay 使用 window 事件
- **條件渲染**：只在編輯模式顯示選擇框
- **延遲重置**：避免不必要的狀態更新
- **stopPropagation**：防止事件冒泡

---

## 🎉 最終狀態

所有功能都已完成並測試通過：

✅ 穩定的選擇系統
✅ 流暢的拖曳體驗
✅ 完整的變換控制
✅ 實用的對齊工具
✅ 清晰的視覺回饋
✅ 即時的屬性更新

應用程式在 http://localhost:5173/ 完美運行！🏭✨
