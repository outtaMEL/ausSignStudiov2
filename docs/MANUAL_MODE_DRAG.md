# 手动模式拖拽系统完整说明

## 概述

手动模式使用混合拖拽方案，结合@dnd-kit和原生鼠标事件，实现了完整的双向拖拽系统：
- ✅ **Library → Staging**: 点击创建元素到暂存区
- ✅ **Staging → Canvas**: 拖拽添加元素到画布
- ✅ **Canvas内移动**: 原生事件实现精确拖拽
- ✅ **Canvas → Staging**: 拖拽手柄移回暂存区

---

## 三种拖拽场景

### 1. Staging → Canvas（跨区域添加）

**技术实现**: @dnd-kit  
**触发方式**: 从StagedElements拖拽元素到Canvas

**视觉反馈**:
```
拖拽开始 → 蓝色DragOverlay卡片跟随鼠标
         ↓
移到Canvas → 蓝色Drop提示出现
         ↓
释放鼠标 → 元素出现在鼠标位置（转SVG坐标）
```

**关键代码**（editor/page.tsx）:
```typescript
<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
  {/* DragOverlay显示拖拽预览 */}
  <DragOverlay dropAnimation={null}>
    {draggingStagedElement && (
      <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500">
        {/* 元素信息卡片 */}
      </div>
    )}
  </DragOverlay>
</DndContext>
```

### 2. Canvas内移动（精确定位）

**技术实现**: 原生鼠标事件  
**触发方式**: 在元素上按住鼠标拖拽

**视觉反馈**:
```
mousedown → 记录拖拽起点和偏移量
         ↓
mousemove → 元素实时跟随（透明度60%）
         ↓
mouseup → 元素固定在新位置
```

**关键代码**（SimpleManualCanvas.tsx）:
```typescript
// SVG坐标转换
const screenToSVG = (clientX: number, clientY: number) => {
  const pt = svgRef.current.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  return pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse())
}

// 拖拽处理
const handleMouseDown = (e, element) => {
  const svgCoord = screenToSVG(e.clientX, e.clientY)
  setDraggingId(element.id)
  setDragOffset({ x: svgCoord.x - element.box.x, y: svgCoord.y - element.box.y })
}

const handleMouseMove = (e) => {
  const svgCoord = screenToSVG(e.clientX, e.clientY)
  const newX = Math.max(0, Math.min(svgCoord.x - dragOffset.x, boardSize.w - 1))
  const newY = Math.max(0, Math.min(svgCoord.y - dragOffset.y, boardSize.h - 1))
  onElementMove(draggingId, newX, newY)
}
```

**优势**:
- ✅ 精确的SVG坐标系统
- ✅ 实时响应，无延迟
- ✅ 自动边界限制
- ✅ 简单可靠，易于调试

### 3. Canvas → Staging（移回暂存区）

**技术实现**: @dnd-kit  
**触发方式**: 拖拽选中元素左上角的蓝色圆形手柄

**视觉反馈**:
```
选中元素 → 左上角显示蓝色圆形手柄 ○←
         ↓
拖拽手柄 → 绿色DragOverlay卡片 + Staging区域绿色高亮
         ↓
释放到Staging → 元素回到暂存区
```

**关键代码**（SimpleManualCanvas.tsx）:
```typescript
function BackToStagingHandle({ elementId, position }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `back-to-staging-${elementId}`,
    data: {
      type: 'canvas-to-staging',
      elementId,
    },
  })

  return (
    <g ref={setNodeRef as any} {...listeners} {...attributes}>
      <circle cx={position.x} cy={position.y} r="0.3" 
              fill="white" stroke="#2563EB" strokeWidth="0.05" />
      {/* 左箭头图标 */}
    </g>
  )
}
```

---

## 视觉设计规范

### DragOverlay样式对比

| 方向 | 边框色 | 图标 | 文本 |
|------|--------|------|------|
| **→ Canvas** | 蓝色 `#2563EB` | 🔵 脉动圆点 | 元素类型 + 尺寸 |
| **← Staging** | 绿色 `#10B981` | ⬅️ 脉动箭头 | "Moving to Staging" |

### Drop Hint提示

| 目标区域 | 背景色 | 提示文本 |
|---------|--------|---------|
| **Canvas** | `bg-blue-500/5` | "↓ Release to place element at center ↓" |
| **Staging** | `bg-green-500/5` | "← Release to move back to staging ←" |

### 元素状态样式

| 状态 | 视觉效果 |
|------|---------|
| **普通** | 虚线边框 `#CBD5E1` |
| **悬停** | 实线边框 `#60A5FA` |
| **选中** | 粗蓝色边框 `#2563EB` + 向外扩展0.15h |
| **拖拽中** | 透明度60% |

---

## 技术架构

### 混合方案理由

**为什么不全用@dnd-kit？**
- Canvas内拖拽需要精确的SVG坐标
- @dnd-kit的坐标转换在SVG中不够准确
- 原生事件提供更好的性能和控制

**为什么不全用原生事件？**
- 跨区域拖拽（Staging ↔ Canvas）用@dnd-kit更简单
- DragOverlay组件提供优秀的视觉反馈
- Drop zone检测更可靠

### 坐标系统

```
浏览器坐标 (clientX, clientY)
    ↓ createSVGPoint + getScreenCTM().inverse()
SVG坐标 (h空间)
    ↓ store.moveElement()
Zustand State更新
    ↓ React重新渲染
SVG元素移动到新位置
```

### 事件冒泡控制

```typescript
// 手柄的拖拽事件 (dnd-kit)
<g {...listeners} {...attributes}>
  <circle />  // 拖回staging
</g>

// 元素本体的拖拽事件 (原生)
<rect onMouseDown={handleMouseDown} />  // Canvas内移动

// 关键：两者不冲突，因为：
// 1. listeners捕获手柄事件
// 2. onMouseDown捕获元素本体事件
// 3. SVG事件冒泡机制自然分离
```

---

## 用户体验流程

### 场景1：从Library创建元素
```
1. 点击Library中的元素类型（如"Plain Text"）
   ↓
2. 弹出配置对话框（ElementConfigDialog）
   ↓
3. 填写文本、字号等配置
   ↓
4. 点击"Add to Staging"
   ↓
5. 元素出现在Staging Area
```

### 场景2：从Staging放置到Canvas
```
1. 在Staging Area拖拽元素
   ↓
2. 蓝色卡片跟随鼠标
   ↓
3. 移到Canvas区域 → 蓝色提示出现
   ↓
4. 释放 → 元素出现在鼠标位置
   ↓
5. 可以立即拖拽调整位置
```

### 场景3：Canvas内精确定位
```
1. 点击Canvas上的元素（蓝色选中框）
   ↓
2. 按住鼠标拖拽元素本体
   ↓
3. 元素变半透明，跟随鼠标
   ↓
4. 释放 → 固定在新位置
   ↓
5. 重复拖拽可继续微调
```

### 场景4：移回Staging修改
```
1. 选中Canvas上的元素
   ↓
2. 左上角出现蓝色圆形手柄 ○←
   ↓
3. 拖拽手柄（不是元素本体）
   ↓
4. 绿色卡片跟随，Staging区域高亮
   ↓
5. 释放到Staging → 元素回到暂存区
   ↓
6. 可以重新配置或删除
```

---

## 性能优化

### 1. 事件监听优化
```typescript
// 只在拖拽时监听全局事件
useEffect(() => {
  if (draggingId) {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }
}, [draggingId])
```

### 2. 坐标计算缓存
```typescript
// 使用useCallback缓存转换函数
const screenToSVG = useCallback((clientX, clientY) => {
  // ... 坐标转换逻辑
}, [])
```

### 3. 条件渲染优化
```typescript
// 只在拖拽时渲染DragOverlay和提示
{draggingStagedElement && <DragOverlay>...</DragOverlay>}
{showBackHandle && <BackToStagingHandle />}
```

---

## 边界情况处理

### 1. 元素超出Board范围
```typescript
const newX = Math.max(0, Math.min(svgCoord.x - dragOffset.x, boardSize.w - 1))
const newY = Math.max(0, Math.min(svgCoord.y - dragOffset.y, boardSize.h - 1))
```

### 2. 异常Box数据过滤
```typescript
// signStore.ts switchToManual()
if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
  console.warn('Invalid element data, skipping:', item)
  return
}
```

### 3. 坐标系统错误恢复
```typescript
try {
  const svgPt = pt.matrixTransform(svgEl.getScreenCTM()!.inverse())
  // 使用转换后的坐标
} catch (e) {
  console.warn('SVG coordinate conversion failed, using center position')
  // 降级到中心位置
}
```

---

## 调试技巧

### 1. 查看SVG坐标
```typescript
console.log('Screen:', e.clientX, e.clientY)
console.log('SVG:', svgCoord.x, svgCoord.y)
console.log('Element box:', element.box)
```

### 2. 检查拖拽状态
```typescript
console.log('Dragging ID:', draggingId)
console.log('Drag offset:', dragOffset)
console.log('isOver:', isOver)
```

### 3. 验证坐标转换
在浏览器控制台：
```javascript
// 获取SVG元素
const svg = document.querySelector('svg')
// 创建测试点
const pt = svg.createSVGPoint()
pt.x = 100; pt.y = 100
// 查看转换结果
pt.matrixTransform(svg.getScreenCTM().inverse())
```

---

## 已知限制和未来改进

### 当前限制
- ⚠️ 拖拽时没有吸附对齐功能（计划中）
- ⚠️ 没有多选拖拽（Phase 7计划）
- ⚠️ 没有键盘快捷键移动（Phase 7计划）

### 未来改进
- [ ] 磁性吸附（靠近其他元素时自动对齐）
- [ ] 对齐引导线（拖拽时显示对齐参考）
- [ ] 框选多个元素批量拖拽
- [ ] 方向键微调位置（精确到0.1h）
- [ ] 拖拽撤销/重做支持

---

## 相关文件

### 核心组件
- `app/editor/page.tsx` - Editor页面主体，管理拖拽状态
- `components/sign/SimpleManualCanvas.tsx` - 画布组件，原生拖拽实现
- `components/sign/StagedElements.tsx` - 暂存区组件，@dnd-kit拖拽源
- `components/sign/ElementLibrary.tsx` - 元素库组件，点击创建

### 状态管理
- `store/signStore.ts` - Zustand store，手动模式actions
  - `placeElement` - 放置元素到Canvas
  - `moveElement` - 移动Canvas元素
  - `moveElementBack` - 移回Staging
  - `regenerateManualLayout` - 重新计算布局

### 类型定义
- `lib/types.ts` - 元素类型定义
  - `StagedElement` - 暂存区元素
  - `PlacedElement` - 已放置元素
  - `ElementType` - 元素类型枚举
  - `ElementConfig` - 元素配置

---

**最后更新**: 2025-10-24  
**状态**: ✅ 完整实现并测试通过  
**版本**: v2.0

