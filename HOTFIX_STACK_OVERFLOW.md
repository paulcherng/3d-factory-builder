# 緊急修復：堆疊溢出錯誤

## 問題描述

點擊群組按鈕後出現錯誤：
```
Uncaught RangeError: Maximum call stack size exceeded
at Mesh.updateMatrixWorld (three.module.js:7720:2)
at Group.updateMatrixWorld (three.module.js:7752:11)
at TransformControls.updateMatrixWorld (TransformControls.ts:236:19)
...
```

## 根本原因

**循環引用問題**：TransformControls 被放置在 group 內部，並且它的 `object` 屬性指向這個 group，造成無限遞歸。

### 錯誤的結構
```jsx
<group ref={groupRef}>
  <mesh>...</mesh>
  
  {/* ❌ 錯誤：TransformControls 在 group 內部 */}
  <TransformControls object={groupRef.current} />
</group>
```

當 Three.js 更新矩陣時：
1. group.updateMatrixWorld() 被調用
2. 它調用子元素的 updateMatrixWorld()
3. TransformControls.updateMatrixWorld() 被調用
4. TransformControls 更新它的 object（也就是 group）
5. 回到步驟 1 → **無限循環！**

## 解決方案

將 TransformControls 移到 group 外部：

```jsx
<>
  {/* ✅ 正確：group 只包含視覺元素 */}
  <group ref={groupRef} position={centerPosition.current}>
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
    </mesh>
  </group>
  
  {/* ✅ 正確：TransformControls 在外部 */}
  {groupRef.current && (
    <TransformControls
      object={groupRef.current}
      mode={transformMode}
      onMouseDown={handleTransformStart}
      onChange={handleTransformChange}
      onMouseUp={handleTransformEnd}
      // ...
    />
  )}
</>
```

## 修改的文件

- `src/components/MultiSelectTransform.tsx`

## 修改內容

將 TransformControls 從 group 內部移到外部，避免循環引用。

## 驗證步驟

1. 刷新瀏覽器頁面
2. 創建 2-3 個物件
3. 選擇多個物件
4. 點擊「🔗 群組」按鈕
5. **預期結果**：不再出現堆疊溢出錯誤
6. 嘗試移動和縮放群組
7. **預期結果**：功能正常工作

## Three.js 最佳實踐

### ✅ 正確的 TransformControls 使用方式

```jsx
// 方式 1：TransformControls 在外部
<>
  <mesh ref={meshRef} />
  <TransformControls object={meshRef.current} />
</>

// 方式 2：TransformControls 作為兄弟元素
<group>
  <mesh ref={meshRef} />
</group>
<TransformControls object={meshRef.current} />
```

### ❌ 錯誤的使用方式

```jsx
// 錯誤 1：TransformControls 在被控制的 group 內部
<group ref={groupRef}>
  <TransformControls object={groupRef.current} />
</group>

// 錯誤 2：嵌套的 TransformControls
<TransformControls object={outerRef.current}>
  <TransformControls object={innerRef.current} />
</TransformControls>
```

## 相關資源

- [Three.js TransformControls 文檔](https://threejs.org/docs/#examples/en/controls/TransformControls)
- [React Three Fiber TransformControls](https://github.com/pmndrs/drei#transformcontrols)

## 技術細節

### 為什麼會造成無限遞歸？

Three.js 的場景圖（Scene Graph）使用樹狀結構：
- 每個節點都有父節點和子節點
- `updateMatrixWorld()` 會遞歸更新所有子節點
- TransformControls 會更新它控制的 object
- 如果 object 是 TransformControls 的父節點 → 循環！

### 矩陣更新流程

```
Scene
  └─ Group (groupRef)
      ├─ Mesh (視覺元素)
      └─ TransformControls (object = groupRef) ← 指向父節點！
          └─ 更新 groupRef
              └─ 觸發 Group.updateMatrixWorld()
                  └─ 更新子節點
                      └─ TransformControls.updateMatrixWorld()
                          └─ 更新 groupRef ... ← 無限循環！
```

### 正確的結構

```
Scene
  ├─ Group (groupRef)
  │   └─ Mesh (視覺元素)
  └─ TransformControls (object = groupRef) ← 兄弟節點，不是子節點
```

## 預防措施

在使用 TransformControls 時：
1. 永遠不要將 TransformControls 放在它控制的 object 內部
2. 確保 TransformControls 和被控制的 object 是兄弟關係或更遠的關係
3. 使用 React Fragment (`<>...</>`) 來組織結構
4. 在開發時注意 Console 的警告訊息

## 測試清單

- [x] 修復堆疊溢出錯誤
- [ ] 測試多選移動功能
- [ ] 測試多選縮放功能
- [ ] 測試群組功能
- [ ] 測試撤銷/重做功能
- [ ] 確認沒有其他錯誤
