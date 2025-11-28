# 3D 工廠編輯器 - 問題修復 V6

## 修復的問題

### 1. ✅ 撤銷功能修復
**問題**：新建物件後移動或調整大小，按 Ctrl+Z 撤銷會直接刪除物件

**原因**：歷史記錄保存時機錯誤，在變換結束後保存導致無法回到變換前的狀態

**解決方案**：
- 將歷史記錄保存移到變換開始時（`handleTransformStart`）
- 這樣撤銷時會回到變換前的狀態，而不是物件創建前

**修改文件**：
- `src/components/Zone3D.tsx`

### 2. ✅ 群組功能實現
**問題**：群組功能沒有實際作用

**解決方案**：
- 當選擇一個物件時，如果它在群組中，自動選擇整個群組
- 群組中的所有物件會一起被選中
- 支持多選時一起移動和縮放

**實現細節**：
```typescript
// 選擇物件時自動選擇群組
selectZone: (id: string | null, multiSelect = false) => {
  const selectedZone = zones.find(z => z.id === id);
  
  // 如果物件在群組中，選擇整個群組
  let idsToSelect = [id];
  if (selectedZone?.groupId && groups[selectedZone.groupId]) {
    idsToSelect = groups[selectedZone.groupId];
  }
  // ...
}
```

**修改文件**：
- `src/store/editorStore.ts` - 更新 selectZone 邏輯

### 3. ✅ 多選時一起移動和縮放
**問題**：多選物件時，移動和調整大小只影響單個物件

**解決方案**：
- 創建新組件 `MultiSelectTransform` 處理多選變換
- 當選擇多個物件時：
  - 隱藏單個物件的 TransformControls
  - 顯示群組的 TransformControls
  - 計算所有選中物件的中心點
  - 移動時：所有物件保持相對位置一起移動
  - 縮放時：所有物件相對於中心點縮放，同時調整位置和尺寸

**實現細節**：
```typescript
// 移動：計算位移並應用到所有物件
const offset = groupPosition - centerPosition;
selectedZones.forEach(zone => {
  newPosition = initialPosition + offset;
});

// 縮放：相對於中心點縮放
selectedZones.forEach(zone => {
  relativePos = (initialPosition - center) * scale;
  newPosition = center + relativePos;
  newDimensions = initialDimensions * scale;
});
```

**新增文件**：
- `src/components/MultiSelectTransform.tsx` - 多選變換控制器

**修改文件**：
- `src/components/Canvas3D.tsx` - 整合多選變換控制器
- `src/components/Zone3D.tsx` - 添加 hideTransformControls 屬性

### 4. ✅ 顏色變更功能修復
**問題**：顏色選擇器無法正常工作

**原因**：`validateZoneUpdates` 函數沒有處理 `color` 欄位，導致顏色更新被過濾掉

**解決方案**：
- 在驗證函數中添加對 `color`、`groupId` 和 `geometry` 欄位的支持
- 這些欄位可以是任意值或 undefined

**修改文件**：
- `src/utils/validation.ts` - 添加顏色和群組欄位驗證

## 技術實現

### MultiSelectTransform 組件
```typescript
export const MultiSelectTransform = ({ selectedZoneIds }) => {
  // 計算中心點
  const center = calculateCenter(selectedZones);
  
  // 記錄初始狀態
  const handleTransformStart = () => {
    saveHistory();
    recordInitialPositions();
    recordInitialDimensions();
  };
  
  // 處理變換
  const handleTransformChange = () => {
    if (transformMode === 'translate') {
      // 計算位移並應用到所有物件
      updateAllPositions(offset);
    } else if (transformMode === 'scale') {
      // 縮放所有物件的位置和尺寸
      updateAllPositionsAndDimensions(scale);
    }
  };
  
  return (
    <group ref={groupRef} position={center}>
      <TransformControls ... />
    </group>
  );
};
```

### 群組選擇邏輯
```typescript
// 在 editorStore.ts 中
selectZone: (id, multiSelect) => {
  const zone = zones.find(z => z.id === id);
  
  // 自動選擇群組中的所有物件
  let idsToSelect = [id];
  if (zone?.groupId && groups[zone.groupId]) {
    idsToSelect = groups[zone.groupId];
  }
  
  // 處理多選邏輯
  if (multiSelect) {
    // 添加或移除群組
  } else {
    // 單選群組
  }
}
```

## 測試建議

### 1. 測試撤銷功能
1. 新建一個物件
2. 移動物件到新位置
3. 按 Ctrl+Z
4. ✅ 驗證：物件回到原始位置，而不是被刪除

### 2. 測試群組功能
1. 選擇多個物件
2. 點擊「🔗 群組」按鈕
3. 取消選擇，然後點擊群組中的任一物件
4. ✅ 驗證：群組中的所有物件都被選中

### 3. 測試多選移動
1. 框選或 Ctrl+點擊選擇多個物件
2. 使用變換控制器移動
3. ✅ 驗證：所有選中的物件一起移動，保持相對位置

### 4. 測試多選縮放
1. 選擇多個物件
2. 切換到縮放模式
3. 使用變換控制器縮放
4. ✅ 驗證：所有物件相對於中心點縮放，位置和尺寸都改變

### 5. 測試顏色變更
1. 選擇一個物件
2. 在屬性面板中點擊顏色選擇器
3. 選擇新顏色
4. ✅ 驗證：3D 場景中物件顏色立即更新
5. 點擊「重置顏色」
6. ✅ 驗證：物件恢復為類型預設顏色

## 已知限制

1. **多選縮放**：縮放時物件會相對於群組中心點縮放，可能不符合某些使用場景的預期
2. **群組嵌套**：目前不支持群組的嵌套（群組中的群組）
3. **歷史記錄大小**：限制為 50 個狀態，超過會自動刪除最舊的記錄

## 後續改進建議

1. **撤銷/重做優化**：
   - 添加歷史記錄預覽
   - 顯示每個歷史狀態的描述

2. **群組功能增強**：
   - 支持群組命名
   - 支持群組嵌套
   - 群組層級視圖

3. **多選變換優化**：
   - 添加多選時的視覺反饋（邊界框）
   - 支持多選時的對齊功能
   - 支持多選時的分布功能

4. **顏色功能增強**：
   - 顏色預設集
   - 顏色歷史記錄
   - 批量修改顏色
