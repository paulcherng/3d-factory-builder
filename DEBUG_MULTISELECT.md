# 多選功能調試指南

## 測試步驟

### 1. 基本測試
1. 打開瀏覽器開發者工具（F12）
2. 切換到 Console 標籤
3. 在編輯器中創建 2-3 個物件
4. 使用 Shift+拖曳框選多個物件

**預期結果**：
- 看到黃色半透明球體在中心
- 看到黃色邊界框包圍所有物件
- 看到變換控制器（紅綠藍箭頭）

### 2. 測試移動
1. 選擇多個物件
2. 拖曳變換控制器的箭頭
3. 觀察 Console 輸出

**預期 Console 輸出**：
```
Transform Start
Initial center: Vector3 {x: ..., y: ..., z: ...}
Offset: Vector3 {x: ..., y: ..., z: ...}
Offset: Vector3 {x: ..., y: ..., z: ...}
...
Transform End
```

**預期行為**：
- 所有選中的物件一起移動
- 保持相對位置不變

### 3. 測試縮放
1. 選擇多個物件
2. 切換到縮放模式（工具列的「縮放」按鈕）
3. 拖曳變換控制器
4. 觀察 Console 輸出

**預期 Console 輸出**：
```
Transform Start
Initial center: Vector3 {x: ..., y: ..., z: ...}
Scale: Vector3 {x: ..., y: ..., z: ...}
Scale: Vector3 {x: ..., y: ..., z: ...}
...
Transform End
```

**預期行為**：
- 所有物件相對於中心點縮放
- 物件位置和尺寸都改變

## 常見問題排查

### 問題 1: 看不到變換控制器
**可能原因**：
- 只選擇了一個物件（需要選擇 2 個以上）
- groupRef.current 為 null

**檢查方法**：
在 Console 中輸入：
```javascript
// 檢查選中的物件數量
window.__selectedCount = 0;
```

### 問題 2: 移動時物件不動
**可能原因**：
- handleTransformChange 沒有被調用
- updateZone 沒有正確更新狀態
- centerPosition 在變換過程中被修改

**檢查方法**：
1. 確認 Console 中有 "Offset:" 輸出
2. 確認 offset 的值不是 {x: 0, y: 0, z: 0}
3. 確認 initialPositions 有正確記錄

### 問題 3: 移動後物件位置錯誤
**可能原因**：
- centerPosition 在變換過程中被 useEffect 更新
- initialPositions 沒有正確記錄

**檢查方法**：
1. 在 handleTransformStart 後立即檢查 centerPosition
2. 在 handleTransformChange 中檢查 centerPosition 是否改變
3. 確認 isTransforming.current 在變換過程中為 true

### 問題 4: 縮放時物件飛走
**可能原因**：
- 相對位置計算錯誤
- centerPosition 不正確

**檢查方法**：
1. 確認 Console 中 "Initial center:" 的值正確
2. 確認 relativePos 計算正確
3. 確認 scale 值合理（不是 NaN 或 Infinity）

## 調試技巧

### 添加更多日誌
在 MultiSelectTransform.tsx 中添加：

```typescript
const handleTransformChange = () => {
  if (!groupRef.current || !isTransforming.current) {
    console.log('Transform change skipped:', {
      hasGroupRef: !!groupRef.current,
      isTransforming: isTransforming.current
    });
    return;
  }

  if (transformMode === 'translate') {
    const currentPos = groupRef.current.position;
    const offset = new Vector3(
      currentPos.x - centerPosition.current.x,
      currentPos.y - centerPosition.current.y,
      currentPos.z - centerPosition.current.z
    );
    
    console.log('Transform change:', {
      currentPos: currentPos.toArray(),
      centerPos: centerPosition.current.toArray(),
      offset: offset.toArray(),
      selectedCount: selectedZones.length
    });
    
    // ...
  }
};
```

### 檢查狀態更新
在 Console 中執行：

```javascript
// 獲取當前 store 狀態
const store = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
// 或者在組件中添加：
console.log('Current zones:', zones);
console.log('Selected IDs:', selectedZoneIds);
```

## 預期的完整流程

1. **選擇多個物件**
   - selectedZoneIds.length > 1
   - MultiSelectTransform 組件渲染
   - 顯示中心球體和邊界框

2. **開始變換**（mousedown）
   - handleTransformStart 被調用
   - Console: "Transform Start"
   - isTransforming.current = true
   - 記錄 initialPositions 和 centerPosition
   - OrbitControls 被禁用

3. **變換中**（mousemove）
   - handleTransformChange 被多次調用
   - Console: "Offset:" 或 "Scale:"
   - 計算新位置/尺寸
   - 調用 updateZone 更新每個物件

4. **結束變換**（mouseup）
   - handleTransformEnd 被調用
   - Console: "Transform End"
   - 重新計算中心位置
   - isTransforming.current = false
   - OrbitControls 被啟用

## 如果還是不工作

1. 檢查瀏覽器 Console 是否有錯誤
2. 確認 Three.js 和 @react-three/fiber 版本兼容
3. 嘗試重新啟動開發服務器
4. 清除瀏覽器緩存並刷新頁面
5. 檢查是否有其他組件干擾（如單個物件的 TransformControls）
