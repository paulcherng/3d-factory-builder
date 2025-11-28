# 3D 工廠編輯器 - 多選功能修復 V8

## 修復內容

### 問題診斷
群組移動和縮放功能不正常的根本原因：
1. **中心點計算時機錯誤**：在變換過程中，物件位置更新會觸發 useEffect 重新計算中心點
2. **狀態管理不當**：centerPosition 在變換過程中被修改，導致位移計算錯誤
3. **OrbitControls 干擾**：多選變換時沒有正確禁用攝影機控制

### 修復方案

#### 1. 改進中心點管理
```typescript
const handleTransformStart = () => {
  isTransforming.current = true;
  
  // 記錄初始中心位置（使用 clone 避免引用問題）
  if (groupRef.current) {
    const currentCenter = groupRef.current.position.clone();
    centerPosition.current.copy(currentCenter);
  }
};
```

**關鍵點**：
- 使用 `clone()` 創建新的 Vector3 對象
- 在變換開始時鎖定中心位置
- 變換過程中不允許 useEffect 更新中心點

#### 2. 優化位移計算
```typescript
const handleTransformChange = () => {
  if (transformMode === 'translate') {
    // 直接計算當前位置與初始中心的差值
    const currentPos = groupRef.current.position;
    const offset = new Vector3(
      currentPos.x - centerPosition.current.x,
      currentPos.y - centerPosition.current.y,
      currentPos.z - centerPosition.current.z
    );
    
    // 應用位移到所有物件
    selectedZones.forEach(zone => {
      const initialPos = initialPositions.current.get(zone.id);
      if (initialPos) {
        const newPosition: [number, number, number] = [
          initialPos[0] + offset.x,
          initialPos[1] + offset.y,
          initialPos[2] + offset.z
        ];
        updateZone(zone.id, { position: newPosition });
      }
    });
  }
};
```

**改進點**：
- 不使用 `sub()` 方法，避免修改原始對象
- 直接計算差值，更清晰明確
- 移除不必要的批量收集步驟

#### 3. 優化縮放計算
```typescript
const handleTransformChange = () => {
  if (transformMode === 'scale') {
    const scale = groupRef.current.scale;
    
    selectedZones.forEach(zone => {
      const initialPos = initialPositions.current.get(zone.id);
      const initialDim = initialDimensions.current.get(zone.id);
      
      if (initialPos && initialDim) {
        // 計算相對位置
        const relativePos = new Vector3(
          initialPos[0] - centerPosition.current.x,
          initialPos[1] - centerPosition.current.y,
          initialPos[2] - centerPosition.current.z
        );
        
        // 應用縮放（直接計算，不使用 multiply）
        const scaledPos = new Vector3(
          relativePos.x * scale.x,
          relativePos.y * scale.y,
          relativePos.z * scale.z
        );
        
        // 計算新位置和尺寸
        const newPosition: [number, number, number] = [
          centerPosition.current.x + scaledPos.x,
          centerPosition.current.y + scaledPos.y,
          centerPosition.current.z + scaledPos.z
        ];
        
        const newDimensions: [number, number, number] = [
          Math.max(0.1, initialDim[0] * scale.x),
          Math.max(0.1, initialDim[1] * scale.y),
          Math.max(0.1, initialDim[2] * scale.z)
        ];
        
        updateZone(zone.id, { position: newPosition, dimensions: newDimensions });
      }
    });
  }
};
```

**改進點**：
- 不使用 `multiply()` 方法，避免修改原始對象
- 直接計算縮放後的位置
- 確保尺寸不小於 0.1

#### 4. 整合 OrbitControls 控制
```typescript
// Canvas3D.tsx
<MultiSelectTransform 
  selectedZoneIds={selectedZoneIds}
  onTransformStart={() => setIsTransforming(true)}
  onTransformEnd={() => setIsTransforming(false)}
/>
```

```typescript
// MultiSelectTransform.tsx
const handleTransformStart = () => {
  isTransforming.current = true;
  onTransformStartCallback?.();  // 通知 Canvas3D
  // ...
};

const handleTransformEnd = () => {
  // ...
  isTransforming.current = false;
  onTransformEndCallback?.();  // 通知 Canvas3D
};
```

**效果**：
- 多選變換時自動禁用攝影機控制
- 避免拖曳時攝影機跟著移動

#### 5. 添加調試日誌
```typescript
const handleTransformStart = () => {
  console.log('Transform Start');
  console.log('Initial center:', centerPosition.current);
  // ...
};

const handleTransformChange = () => {
  console.log('Offset:', offset);
  // 或
  console.log('Scale:', scale);
  // ...
};

const handleTransformEnd = () => {
  console.log('Transform End');
  // ...
};
```

**用途**：
- 幫助診斷問題
- 驗證計算是否正確
- 追蹤變換流程

## 測試指南

### 測試 1: 多選移動
1. 創建 3 個物件，位置分別在 (0,5,0), (10,5,0), (20,5,0)
2. 框選所有物件
3. 打開瀏覽器 Console
4. 拖曳 X 軸箭頭向右移動 5 單位
5. **預期結果**：
   - Console 顯示 "Transform Start"
   - Console 顯示多次 "Offset: Vector3 {x: 5, y: 0, z: 0}"
   - 所有物件移動到 (5,5,0), (15,5,0), (25,5,0)
   - Console 顯示 "Transform End"

### 測試 2: 多選縮放
1. 創建 2 個物件，位置在 (0,5,0) 和 (10,5,0)，尺寸都是 (5,5,5)
2. 框選兩個物件
3. 切換到縮放模式
4. 拖曳控制器縮放 2 倍
5. **預期結果**：
   - 中心點在 (5,5,0)
   - 第一個物件移動到 (-5,5,0)，尺寸變為 (10,10,10)
   - 第二個物件移動到 (15,5,0)，尺寸變為 (10,10,10)
   - 兩個物件之間的距離從 10 變為 20

### 測試 3: 群組功能
1. 創建 3 個物件
2. 選擇所有物件
3. 點擊「🔗 群組」按鈕
4. 取消選擇
5. 點擊群組中的任一物件
6. **預期結果**：
   - 群組中的所有物件都被選中
   - 顯示多選變換控制器
   - 可以一起移動和縮放

### 測試 4: 攝影機控制
1. 選擇多個物件
2. 開始拖曳變換控制器
3. **預期結果**：
   - 拖曳時攝影機不移動
   - 只有物件在移動
4. 釋放滑鼠
5. **預期結果**：
   - 可以正常旋轉和縮放視角

## 調試技巧

如果功能還是不正常，請按以下步驟調試：

1. **檢查 Console 輸出**
   - 是否有 "Transform Start" 輸出？
   - 是否有 "Offset" 或 "Scale" 輸出？
   - 是否有錯誤訊息？

2. **檢查選擇狀態**
   - 是否選擇了 2 個以上的物件？
   - 是否看到黃色中心球體？
   - 是否看到黃色邊界框？

3. **檢查變換控制器**
   - 是否看到紅綠藍箭頭？
   - 箭頭是否在正確的位置（中心點）？
   - 單個物件的控制器是否被隱藏？

4. **檢查物件更新**
   - 在 handleTransformChange 中添加更多日誌
   - 確認 updateZone 被調用
   - 確認新位置計算正確

5. **檢查狀態管理**
   - 確認 isTransforming.current 在變換時為 true
   - 確認 centerPosition.current 在變換時不變
   - 確認 initialPositions 正確記錄

## 已知問題和限制

1. **性能**：選擇大量物件（>20）時可能有延遲
2. **精度**：連續多次縮放可能累積誤差
3. **視覺**：邊界框在變換過程中不會即時更新

## 後續改進

1. **批量更新優化**：使用單次 setState 更新所有物件
2. **動態邊界框**：變換過程中即時更新邊界框
3. **撤銷優化**：將多選變換作為單個操作記錄
4. **性能優化**：使用 requestAnimationFrame 節流更新
