# 縮放模式測試指南

## TransformControls 縮放模式說明

在縮放模式下，TransformControls 提供三種縮放方式：

### 1. 單軸縮放（Single Axis Scale）
**操作方式**：拖曳單個軸端點的小立方體
- 紅色立方體 → 只縮放 X 軸
- 綠色立方體 → 只縮放 Y 軸
- 藍色立方體 → 只縮放 Z 軸

**預期行為**：
- 只有對應軸的尺寸改變
- 其他兩個軸保持不變
- Console 輸出示例：`Scale: {x: 1.5, y: 1.0, z: 1.0}`

### 2. 雙軸縮放（Plane Scale）
**操作方式**：拖曳兩個軸之間的平面方塊
- 紅綠平面（XY 平面）→ 同時縮放 X 和 Y 軸
- 紅藍平面（XZ 平面）→ 同時縮放 X 和 Z 軸
- 綠藍平面（YZ 平面）→ 同時縮放 Y 和 Z 軸

**預期行為**：
- 對應的兩個軸同時縮放
- 第三個軸保持不變
- Console 輸出示例：`Scale: {x: 1.5, y: 1.5, z: 1.0}` (XY 平面)

### 3. 三軸均勻縮放（Uniform Scale）
**操作方式**：拖曳中心的白色立方體
- 所有軸同時等比例縮放

**預期行為**：
- 所有軸的縮放比例相同
- Console 輸出示例：`Scale: {x: 1.5, y: 1.5, z: 1.5, isUniform: true}`

## 測試步驟

### 測試 1: 單個物件的單軸縮放
1. 創建一個物件（尺寸 10x10x10）
2. 選擇物件
3. 切換到縮放模式
4. 拖曳紅色立方體（X 軸）
5. 打開 Console 查看輸出
6. **預期**：只有 X 軸的 scale 值改變

### 測試 2: 單個物件的雙軸縮放
1. 創建一個物件
2. 選擇物件
3. 切換到縮放模式
4. 找到並拖曳 XY 平面的方塊（紅綠之間）
5. 打開 Console 查看輸出
6. **預期**：X 和 Y 的 scale 值改變，Z 保持 1.0

### 測試 3: 多選物件的單軸縮放
1. 創建 2-3 個物件
2. 框選所有物件
3. 切換到縮放模式
4. 拖曳紅色立方體（X 軸）
5. 打開 Console 查看輸出
6. **預期**：
   - Console: `Scale: {x: 1.5, y: 1.0, z: 1.0}`
   - 所有物件只在 X 軸方向縮放

### 測試 4: 多選物件的雙軸縮放
1. 創建 2-3 個物件
2. 框選所有物件
3. 切換到縮放模式
4. 拖曳 XY 平面的方塊
5. 打開 Console 查看輸出
6. **預期**：
   - Console: `Scale: {x: 1.5, y: 1.5, z: 1.0}`
   - 所有物件在 X 和 Y 軸方向縮放，Z 軸不變

## 常見問題

### Q1: 看不到平面縮放控制器
**可能原因**：
- 視角問題：從某些角度看，平面方塊可能被軸線遮擋
- 控制器太小：嘗試放大視角或調整 `size` 屬性

**解決方法**：
- 旋轉視角，從不同角度觀察
- 在代碼中增加 TransformControls 的 `size` 屬性值

### Q2: 拖曳平面時，第三個軸也跟著縮放
**可能原因**：
- 不小心拖曳到了中心的均勻縮放控制器
- 或者拖曳到了軸線而不是平面

**解決方法**：
- 確保拖曳的是平面方塊（兩個軸之間的區域）
- 觀察 Console 輸出，確認只有兩個軸的值在改變

### Q3: 所有軸都在縮放（均勻縮放）
**可能原因**：
- 拖曳了中心的白色立方體
- 這是正常的均勻縮放行為

**解決方法**：
- 如果不想均勻縮放，請拖曳軸線或平面
- Console 會顯示 `isUniform: true` 表示均勻縮放

## 視覺指南

```
縮放模式下的 TransformControls 結構：

        Y (綠)
        |
        |  [YZ平面]
        | /
        |/_____ X (紅)
       /|
      / |
     /  |
    Z   [XY平面]
  (藍)
  
  [XZ平面] 在 X-Z 之間

中心白色立方體 = 均勻縮放
軸端點立方體 = 單軸縮放
平面方塊 = 雙軸縮放
```

## 調試技巧

### 添加更詳細的日誌

在 `handleTransformChange` 中：

```typescript
if (transformMode === 'scale') {
  const scale = groupRef.current.scale;
  
  // 判斷縮放類型
  let scaleType = 'unknown';
  if (scale.x !== 1 && scale.y === 1 && scale.z === 1) scaleType = 'X-axis';
  else if (scale.x === 1 && scale.y !== 1 && scale.z === 1) scaleType = 'Y-axis';
  else if (scale.x === 1 && scale.y === 1 && scale.z !== 1) scaleType = 'Z-axis';
  else if (scale.x !== 1 && scale.y !== 1 && scale.z === 1) scaleType = 'XY-plane';
  else if (scale.x !== 1 && scale.y === 1 && scale.z !== 1) scaleType = 'XZ-plane';
  else if (scale.x === 1 && scale.y !== 1 && scale.z !== 1) scaleType = 'YZ-plane';
  else if (scale.x === scale.y && scale.y === scale.z) scaleType = 'Uniform';
  
  console.log('Scale Type:', scaleType, scale);
}
```

### 視覺化縮放軸

可以在場景中添加輔助線來顯示哪些軸正在縮放：

```typescript
// 在 MultiSelectTransform 中添加
{transformMode === 'scale' && (
  <>
    {/* X 軸指示器 */}
    <arrowHelper args={[new Vector3(1, 0, 0), centerPosition.current, 5, 0xff0000]} />
    {/* Y 軸指示器 */}
    <arrowHelper args={[new Vector3(0, 1, 0), centerPosition.current, 5, 0x00ff00]} />
    {/* Z 軸指示器 */}
    <arrowHelper args={[new Vector3(0, 0, 1), centerPosition.current, 5, 0x0000ff]} />
  </>
)}
```

## 預期的 Console 輸出

### 單軸縮放 (X)
```
Transform Start
Initial center: Vector3 {x: 10, y: 5, z: 10}
Scale: {x: 1.2, y: 1.0, z: 1.0, isUniform: false}
Scale: {x: 1.5, y: 1.0, z: 1.0, isUniform: false}
Transform End
```

### 雙軸縮放 (XY)
```
Transform Start
Initial center: Vector3 {x: 10, y: 5, z: 10}
Scale: {x: 1.2, y: 1.2, z: 1.0, isUniform: false}
Scale: {x: 1.5, y: 1.5, z: 1.0, isUniform: false}
Transform End
```

### 均勻縮放
```
Transform Start
Initial center: Vector3 {x: 10, y: 5, z: 10}
Scale: {x: 1.2, y: 1.2, z: 1.2, isUniform: true}
Scale: {x: 1.5, y: 1.5, z: 1.5, isUniform: true}
Transform End
```

## 如果功能確實不正常

如果經過測試後，雙軸縮放確實沒有正常工作（例如拖曳 XY 平面時 Z 軸也跟著縮放），請提供：

1. Console 的完整輸出
2. 你的操作步驟
3. 預期行為 vs 實際行為
4. 截圖或錄屏（如果可能）

這樣我可以更準確地診斷和修復問題。
