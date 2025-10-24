# AusSignStudio v2 - 功能完成清单

> **创建日期**: 2024-10-24  
> **状态**: 进行中  
> **目的**: 跟踪手动模式编辑器的功能实现和优化

---

## 📊 总体进度

- ✅ **已完成**: 基础拖拽系统（部分需验证）
- 🚧 **进行中**: 0/5 高级功能
- ⏳ **待开始**: 5/5 高级功能

---

## 🎯 第一阶段：基础拖拽系统（需验证）

### ✅ 已声称完成（需测试验证）

#### 1. Staging → Canvas 拖拽
**状态**: ✅ 代码已实现  
**需验证**:
- [ ] DragOverlay卡片是否正常显示（蓝色边框、元素信息、尺寸）
- [ ] Drop Hint提示是否出现（淡蓝色遮罩、释放提示文字）
- [ ] 元素是否能放置在**鼠标释放的位置**（不是固定中心）
- [ ] SVG坐标转换是否准确
- [ ] 边界保护是否生效

**相关文件**:
- `app/editor/page.tsx` (handleDragEnd with SVG coordinate conversion)
- `components/sign/StagedElements.tsx` (DragOverlay)

**潜在问题**:
- SVG坐标转换可能在不同缩放级别下失效
- 边界检测可能不够robust
- 元素放置后的位置可能需要微调

---

#### 2. Canvas → Staging 拖回
**状态**: ✅ 代码已实现  
**需验证**:
- [ ] 左上角蓝色圆形手柄是否显示正常（不是巨型圆形）
- [ ] 手柄是否只在**选中元素**时显示
- [ ] 拖拽手柄时是否显示绿色DragOverlay
- [ ] Staging area是否显示绿色高亮
- [ ] 元素是否成功移回staging

**相关文件**:
- `components/sign/SimpleManualCanvas.tsx` (BackToStagingHandle)
- `app/editor/page.tsx` (handleDragStart/End for canvas-to-staging)

**潜在问题**:
- 手柄坐标计算可能在某些情况下失效（之前出现过巨型圆形）
- 手柄可能与元素本体的拖拽事件冲突
- 选中状态管理可能不够清晰

---

#### 3. Canvas内元素移动
**状态**: ✅ 代码已实现  
**需验证**:
- [ ] 拖拽元素时是否变半透明（60%）
- [ ] 元素是否实时跟随鼠标
- [ ] 释放后位置是否准确
- [ ] 拖拽时是否不会触发其他交互（如移回staging）

**相关文件**:
- `components/sign/SimpleManualCanvas.tsx` (onMouseDown/Move/Up handlers)

**潜在问题**:
- 与BackToStagingHandle的事件冲突
- 坐标精度问题
- 性能问题（频繁的state更新）

---

### 🔧 已知Bug（需修复）

#### Bug #1: 巨型圆形手柄
**描述**: 点击左上角手柄后出现巨大的圆形  
**状态**: 🟡 声称已修复，需验证  
**修复方案**: 改用cx/cy坐标而非transform  
**验证步骤**:
1. 选中canvas元素
2. 查看左上角手柄大小（应该是0.6h直径的小圆点）
3. 拖拽手柄，观察是否有异常

---

#### Bug #2: 黑白区域问题
**描述**: 点击元素出现大片黑白区域  
**状态**: 🟡 声称已修复  
**修复方案**: 移除异常高亮背景，添加数据验证  
**验证步骤**:
1. 点击canvas上的元素
2. 观察是否有异常的黑白背景
3. 检查选中边框是否正常

---

#### Bug #3: Staging预览显示不完整
**描述**: SVG元素预览被裁剪  
**状态**: 🟡 声称已修复  
**修复方案**: 使用viewBox和响应式尺寸  
**验证步骤**:
1. 创建新元素到staging
2. 检查预览是否完整显示
3. 检查文本、图标是否被裁剪

---

## 🚀 第二阶段：高级功能（待实现）

### 优先级排序

| 功能 | 优先级 | 难度 | 预估时间 | 依赖 |
|------|--------|------|---------|------|
| 4️⃣ Hover显示对齐按钮 | P0 | 🟢 简单 | 10分钟 | 无 |
| 2️⃣ 实时board扩展 | P0 | 🟢 简单 | 15分钟 | 无 |
| 1️⃣ 实时spacing推开 | P1 | 🟡 中等 | 45分钟 | validateSpacing() |
| 5️⃣ Group功能 | P2 | 🟡 中等 | 90分钟 | 多选UI |
| 3️⃣ 中点拖拽对齐 | P3 | 🔴 困难 | 120分钟 | detectAlignment() |

---

### 功能 1️⃣: 实时min spacing推开

**需求**:
- 拖动element时，如果靠近其他element（< 0.15h）
- 被拖动的element自动推开到min spacing距离
- 其他element保持不动

**现有基础**:
- ✅ `validateSpacing()` - 检测spacing违规 (`lib/engine/manual.ts:49-108`)
- ✅ `moveElement()` - 移动元素 (`store/signStore.ts:689-706`)

**需要实现**:
- [ ] `enforceMinSpacing(draggedElement, otherElements, minSpacing): { x, y }`
  - 输入：被拖动元素、其他元素列表、最小间距要求
  - 输出：调整后的合规位置
  - 逻辑：
    1. 检测与每个其他元素的spacing
    2. 如果违反，计算推开方向（最小移动距离）
    3. 返回调整后的位置

- [ ] 在拖拽过程中调用enforcement
  - 位置：`SimpleManualCanvas.tsx` 的 `handleMouseMove`
  - 时机：计算新位置后、更新state前
  - 伪代码：
    ```typescript
    const rawPosition = { x: svgX - dragOffset.x, y: svgY - dragOffset.y }
    const adjustedPosition = enforceMinSpacing(
      { ...draggedElement, box: { ...draggedElement.box, ...rawPosition } },
      otherElements,
      { horizontal: 0.15, vertical: 0.15 }
    )
    actions.moveElement(draggedElement.id, adjustedPosition)
    ```

**实现步骤**:
1. [ ] 在 `lib/engine/manual.ts` 创建 `enforceMinSpacing()` 函数
2. [ ] 编写单元测试（edge cases: 多个违规、边界情况）
3. [ ] 在 `SimpleManualCanvas.tsx` 集成到拖拽逻辑
4. [ ] 测试各种拖拽场景
5. [ ] 添加可视化反馈（可选：显示推开的红线）

**关键算法**:
```typescript
function enforceMinSpacing(
  draggedElement: PlacedElement,
  otherElements: PlacedElement[],
  minSpacing: { horizontal: number; vertical: number }
): { x: number; y: number } {
  let adjustedX = draggedElement.box.x
  let adjustedY = draggedElement.box.y
  
  for (const other of otherElements) {
    if (other.id === draggedElement.id) continue
    
    // 检测水平spacing
    const leftGap = draggedElement.box.x - (other.box.x + other.box.w)
    const rightGap = other.box.x - (draggedElement.box.x + draggedElement.box.w)
    
    if (leftGap > 0 && leftGap < minSpacing.horizontal) {
      // 推开到右边
      adjustedX = other.box.x + other.box.w + minSpacing.horizontal
    } else if (rightGap > 0 && rightGap < minSpacing.horizontal) {
      // 推开到左边
      adjustedX = other.box.x - draggedElement.box.w - minSpacing.horizontal
    }
    
    // 类似逻辑处理垂直spacing
    // ...
  }
  
  return { x: adjustedX, y: adjustedY }
}
```

**测试checklist**:
- [ ] 拖动元素靠近另一个元素时自动推开
- [ ] 推开距离正好是min spacing
- [ ] 多个元素时选择最小推开距离
- [ ] 边界情况：推到board边缘

---

### 功能 2️⃣: 实时board自动扩展

**需求**:
- 拖动element到board外时，board自动扩大
- 始终保持0.3h padding
- 最小尺寸 10h × 5h

**现有基础**:
- ✅ `calculateBoardSizeFromElements()` - 计算board尺寸 (`lib/engine/manual.ts:22-44`)
- ✅ `regenerateManualLayout()` - 重新计算布局 (`store/signStore.ts:775-796`)

**需要实现**:
- [ ] 在拖拽过程中实时调用board扩展检测
  - 位置：`SimpleManualCanvas.tsx` 的 `handleMouseMove`
  - 时机：元素移动到接近/超出边界时
  - 逻辑：
    ```typescript
    const elementRight = newX + element.box.w
    const elementBottom = newY + element.box.h
    
    if (elementRight + 0.3 > currentBoardSize.w || 
        elementBottom + 0.3 > currentBoardSize.h) {
      // 触发board扩展
      actions.regenerateManualLayout()
    }
    ```

- [ ] 优化性能：节流regenerate调用
  - 避免每次mousemove都触发
  - 使用debounce或只在真正需要时调用

**实现步骤**:
1. [ ] 在 `app/editor/page.tsx` 添加board扩展检测逻辑
2. [ ] 在 `handleMouseMove` 中检测边界
3. [ ] 条件触发 `actions.regenerateManualLayout()`
4. [ ] 添加视觉反馈（board边框闪烁提示扩展）
5. [ ] 测试各种拖拽到边界的场景

**伪代码**:
```typescript
// 在 handleMouseMove 中
if (draggingElementId) {
  const element = doc.manualData.placed.find(e => e.id === draggingElementId)
  const newBox = { ...element.box, x: svgX - dragOffset.x, y: svgY - dragOffset.y }
  
  // 检查是否需要扩展board
  const needsExpansion = 
    newBox.x + newBox.w + 0.3 > doc.manualData.boardSize.w ||
    newBox.y + newBox.h + 0.3 > doc.manualData.boardSize.h ||
    newBox.x < 0 || newBox.y < 0
  
  if (needsExpansion) {
    // 先更新元素位置
    actions.moveElement(draggingElementId, { x: Math.max(0, newBox.x), y: Math.max(0, newBox.y) })
    // 然后触发board重算
    setTimeout(() => actions.regenerateManualLayout(), 0)
  } else {
    actions.moveElement(draggingElementId, { x: newBox.x, y: newBox.y })
  }
}
```

**测试checklist**:
- [ ] 拖到右边界时board向右扩展
- [ ] 拖到下边界时board向下扩展
- [ ] 同时触发两个方向扩展
- [ ] 拖回内部时board不缩小（符合预期）
- [ ] 最小尺寸限制生效

---

### 功能 3️⃣: 中点拖拽对齐

**需求**:
- 拖动element的4个中点控制点（上/下/左/右）
- 靠近其他element的对应中点时显示对齐线
- 上/下中点只对齐其他的上/下中点
- 左/右中点只对齐其他的左/右中点
- 释放后snap到对齐位置
- 自动保持min spacing（不被drag的元素不动）

**现有基础**:
- ✅ `detectAlignmentOpportunities()` - 检测对齐机会 (`lib/engine/manual.ts:113-172`)
- ⚠️ 当前只有元素整体拖拽，没有中点handles

**需要实现**:

#### 3.1 中点Handles渲染
- [ ] 在 `SimpleManualCanvas.tsx` 为选中元素添加4个中点handles
  ```typescript
  // Top midpoint
  <circle cx={x + w/2} cy={y} r={0.15} fill="white" stroke="blue" />
  // Bottom midpoint  
  <circle cx={x + w/2} cy={y + h} r={0.15} fill="white" stroke="blue" />
  // Left midpoint
  <circle cx={x} cy={y + h/2} r={0.15} fill="white" stroke="blue" />
  // Right midpoint
  <circle cx={x + w} cy={y + h/2} r={0.15} fill="white" stroke="blue" />
  ```

#### 3.2 中点拖拽事件处理
- [ ] 为每个handle添加独立的拖拽逻辑
  ```typescript
  type MidpointType = 'top' | 'bottom' | 'left' | 'right'
  const [draggingMidpoint, setDraggingMidpoint] = useState<{
    elementId: string
    type: MidpointType
  } | null>(null)
  ```

#### 3.3 对齐检测和snap
- [ ] 创建 `detectMidpointAlignment()` 函数
  ```typescript
  function detectMidpointAlignment(
    element: PlacedElement,
    midpointType: MidpointType,
    targetElements: PlacedElement[],
    threshold: number = 0.1
  ): { aligned: boolean; alignedTo: string[]; snapPosition: number } | null
  ```

#### 3.4 对齐线渲染
- [ ] 添加state存储当前对齐线
  ```typescript
  const [alignmentGuides, setAlignmentGuides] = useState<{
    type: 'horizontal' | 'vertical'
    position: number
    elementIds: string[]
  }[]>([])
  ```
- [ ] 在SVG中渲染虚线
  ```typescript
  {alignmentGuides.map(guide => (
    <line
      key={guide.position}
      x1={guide.type === 'vertical' ? guide.position : 0}
      y1={guide.type === 'horizontal' ? guide.position : 0}
      x2={guide.type === 'vertical' ? guide.position : boardSize.w}
      y2={guide.type === 'horizontal' ? guide.position : boardSize.h}
      stroke="magenta"
      strokeWidth="0.02"
      strokeDasharray="0.1 0.1"
    />
  ))}
  ```

**实现步骤**:
1. [ ] 渲染4个中点handles（只在选中时显示）
2. [ ] 实现中点拖拽逻辑（调整元素位置/大小）
3. [ ] 实现对齐检测算法
4. [ ] 实现对齐线渲染
5. [ ] 实现snap-to-alignment
6. [ ] 结合功能1确保spacing不违规
7. [ ] 测试各种对齐场景

**复杂度分析**:
- 🔴 **高复杂度** - 涉及：
  - 4个独立的拖拽handles
  - 实时对齐检测（性能敏感）
  - 对齐线的动态渲染
  - 与resize逻辑的结合
  - 与spacing enforcement的协调

**测试checklist**:
- [ ] 4个中点handles正确显示
- [ ] 拖拽上/下中点时只检测其他元素的上/下中点
- [ ] 拖拽左/右中点时只检测其他元素的左/右中点
- [ ] 靠近时显示对齐线
- [ ] 释放时snap到对齐位置
- [ ] 对齐后spacing仍符合要求

---

### 功能 4️⃣: Hover显示对齐按钮

**需求**:
- Hover element时显示QuickAlignButtons浮动工具栏
- 6个对齐按钮：left/center/right/top/middle/bottom
- 一键对齐到board边缘

**现有基础**:
- ✅ `QuickAlignButtons` 组件完整实现 (`components/sign/QuickAlignButtons.tsx`)
- ✅ `alignToBoard()` 函数完整实现 (`store/signStore.ts:740-773`)
- ✅ 所有UI和图标已ready

**需要实现**:
- [ ] 在 `SimpleManualCanvas.tsx` 添加hover state
  ```typescript
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)
  ```

- [ ] 为每个element添加hover事件
  ```typescript
  <g
    key={element.id}
    onMouseEnter={() => setHoveredElementId(element.id)}
    onMouseLeave={() => setHoveredElementId(null)}
  >
    {/* element content */}
  </g>
  ```

- [ ] 条件渲染QuickAlignButtons
  ```typescript
  {hoveredElementId && (
    <foreignObject
      x={element.box.x + element.box.w + 0.2}
      y={element.box.y - 0.5}
      width="5"
      height="1"
    >
      <QuickAlignButtons
        elementId={hoveredElementId}
        onAlign={handleQuickAlign}
        position={{ x: 0, y: 0 }}
      />
    </foreignObject>
  )}
  ```

- [ ] 实现 `handleQuickAlign` 回调
  ```typescript
  const handleQuickAlign = useCallback((elementId: string, direction: AlignmentPoint) => {
    actions.alignToBoard(elementId, direction)
    setHoveredElementId(null) // 对齐后隐藏按钮
  }, [actions])
  ```

**实现步骤**:
1. [ ] 添加hover state到SimpleManualCanvas
2. [ ] 为element groups添加onMouseEnter/Leave
3. [ ] 导入QuickAlignButtons组件
4. [ ] 计算按钮显示位置（element右上角）
5. [ ] 连接alignToBoard action
6. [ ] 测试所有6个对齐方向
7. [ ] 优化按钮位置（避免超出viewport）

**交互细节**:
- Hover显示，离开隐藏
- 点击按钮后立即执行对齐
- 对齐后按钮消失
- 按钮位置智能调整（不超出canvas）

**测试checklist**:
- [ ] Hover element时按钮出现
- [ ] 离开element时按钮消失
- [ ] Left对齐到board左边缘
- [ ] Right对齐到board右边缘
- [ ] Center水平居中
- [ ] Top对齐到board顶部
- [ ] Bottom对齐到board底部
- [ ] Middle垂直居中

---

### 功能 5️⃣: Group功能

**需求**:
- 多选elements（Ctrl+Click或框选）
- 选中多个后显示"Group"按钮
- Group后显示统一的边界框
- 可以整体拖动group
- 提供"Ungroup"按钮拆分

**现有基础**:
- ✅ `groupId?: string` 类型定义 (`lib/types.ts:228`)
- ❌ 其他功能全部缺失

**需要实现**:

#### 5.1 多选UI
- [ ] 添加选中state（支持多个）
  ```typescript
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([])
  ```

- [ ] Ctrl+Click多选逻辑
  ```typescript
  const handleElementClick = (elementId: string, event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedElementIds(prev => 
        prev.includes(elementId)
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      )
    } else {
      setSelectedElementIds([elementId])
    }
  }
  ```

- [ ] 框选功能（可选，高级）
  ```typescript
  // 鼠标拖拽画框选区域
  // 释放时选中所有在框内的elements
  ```

#### 5.2 Group/Ungroup操作
- [ ] 在 `store/signStore.ts` 添加actions
  ```typescript
  groupElements: (elementIds: string[]) => {
    const groupId = generateId()
    set(state => {
      if (!state.currentDocument?.manualData) return state
      
      return {
        currentDocument: {
          ...state.currentDocument,
          manualData: {
            ...state.currentDocument.manualData,
            placed: state.currentDocument.manualData.placed.map(el =>
              elementIds.includes(el.id)
                ? { ...el, groupId }
                : el
            )
          }
        }
      }
    })
  },
  
  ungroupElements: (groupId: string) => {
    set(state => {
      if (!state.currentDocument?.manualData) return state
      
      return {
        currentDocument: {
          ...state.currentDocument,
          manualData: {
            ...state.currentDocument.manualData,
            placed: state.currentDocument.manualData.placed.map(el =>
              el.groupId === groupId
                ? { ...el, groupId: undefined }
                : el
            )
          }
        }
      }
    })
  }
  ```

#### 5.3 Group边界框渲染
- [ ] 计算group的bounding box
  ```typescript
  function getGroupBoundingBox(elements: PlacedElement[], groupId: string): Box {
    const grouped = elements.filter(e => e.groupId === groupId)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    for (const el of grouped) {
      minX = Math.min(minX, el.box.x)
      minY = Math.min(minY, el.box.y)
      maxX = Math.max(maxX, el.box.x + el.box.w)
      maxY = Math.max(maxY, el.box.y + el.box.h)
    }
    
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
  }
  ```

- [ ] 渲染group边框
  ```typescript
  <rect
    x={groupBox.x - 0.1}
    y={groupBox.y - 0.1}
    width={groupBox.w + 0.2}
    height={groupBox.h + 0.2}
    fill="none"
    stroke="purple"
    strokeWidth="0.05"
    strokeDasharray="0.2 0.1"
  />
  ```

#### 5.4 Group整体拖动
- [ ] 拖动group中任一元素时，整个group一起移动
  ```typescript
  const handleGroupDrag = (groupId: string, deltaX: number, deltaY: number) => {
    const elementsInGroup = doc.manualData.placed.filter(e => e.groupId === groupId)
    
    for (const element of elementsInGroup) {
      actions.moveElement(element.id, {
        x: element.box.x + deltaX,
        y: element.box.y + deltaY
      })
    }
  }
  ```

**实现步骤**:
1. [ ] 实现多选UI（Ctrl+Click）
2. [ ] 添加Group/Ungroup按钮到工具栏
3. [ ] 实现groupElements/ungroupElements actions
4. [ ] 渲染group边界框
5. [ ] 实现group整体拖动
6. [ ] 测试各种group场景
7. [ ] （可选）实现框选功能

**测试checklist**:
- [ ] Ctrl+Click可以多选elements
- [ ] 选中多个后显示Group按钮
- [ ] 点击Group后elements有相同的groupId
- [ ] Group后显示紫色虚线边框
- [ ] 拖动group中的任一元素，整个group一起移动
- [ ] 点击Ungroup后groupId被清除
- [ ] Ungroup后可以独立移动各个element

---

## 🔍 关键Engine函数清单

### ✅ 已实现且可用

| 函数 | 位置 | 功能 | 状态 |
|------|------|------|------|
| `calculateBoardSizeFromElements()` | `lib/engine/manual.ts:22` | 计算board尺寸 | ✅ |
| `validateSpacing()` | `lib/engine/manual.ts:49` | 检测spacing违规 | ✅ |
| `detectAlignmentOpportunities()` | `lib/engine/manual.ts:113` | 检测对齐机会 | ✅ |
| `alignToBoard()` | `store/signStore.ts:740` | 对齐到board边缘 | ✅ |
| `moveElement()` | `store/signStore.ts:689` | 移动元素 | ✅ |
| `regenerateManualLayout()` | `store/signStore.ts:775` | 重算布局 | ✅ |
| `QuickAlignButtons` | `components/sign/QuickAlignButtons.tsx` | 对齐按钮组件 | ✅ |

### ❌ 需要新增

| 函数 | 用途 | 优先级 | 相关功能 |
|------|------|--------|---------|
| `enforceMinSpacing()` | 强制最小间距 | P1 | 功能1️⃣ |
| `detectCollisions()` | 检测碰撞 | P1 | 功能1️⃣ |
| `detectMidpointAlignment()` | 检测中点对齐 | P3 | 功能3️⃣ |
| `snapToMidpoint()` | 吸附到中点 | P3 | 功能3️⃣ |
| `getGroupBoundingBox()` | 计算group边界 | P2 | 功能5️⃣ |
| `groupElements()` | 创建group | P2 | 功能5️⃣ |
| `ungroupElements()` | 拆分group | P2 | 功能5️⃣ |

---

## 📁 相关文件清单

### 核心文件
- `lib/engine/manual.ts` - 手动布局引擎（spacing、对齐检测）
- `lib/types.ts` - 类型定义
- `store/signStore.ts` - 全局状态管理
- `app/editor/page.tsx` - 编辑器主页面（拖拽协调）
- `components/sign/SimpleManualCanvas.tsx` - Canvas画布组件
- `components/sign/StagedElements.tsx` - Staging区域组件
- `components/sign/QuickAlignButtons.tsx` - 对齐按钮组件

### 文档文件
- `docs/DRAG_AND_DROP_UX.md` - 拖拽体验说明
- `docs/BIDIRECTIONAL_DRAG.md` - 双向拖拽说明
- `docs/ARCHITECTURE.md` - 架构说明
- `docs/SIMPLE_DRAG_IMPLEMENTATION.md` - 简单拖拽实现
- `docs/VISUAL_CONFUSION_EXPLAINED.md` - 视觉混淆说明

---

## 🧪 测试策略

### 冒烟测试（每次改动后必测）
- [ ] 从staging拖元素到canvas - 成功放置
- [ ] 在canvas移动元素 - 位置正确
- [ ] 从canvas拖回staging - 成功移回
- [ ] 选中元素显示边框 - 正常显示
- [ ] 左上角手柄正常大小 - 无巨型圆形

### 集成测试（功能完成后）
- [ ] Spacing enforcement不影响正常拖拽
- [ ] Board扩展不影响已有元素
- [ ] 中点对齐不破坏spacing
- [ ] Hover对齐按钮与拖拽不冲突
- [ ] Group拖动时spacing仍生效

### 性能测试
- [ ] 20个elements时拖拽流畅
- [ ] 频繁拖拽无内存泄漏
- [ ] Board扩展不卡顿
- [ ] 对齐检测不影响帧率

---

## 📝 开发注意事项

### 坐标系统
- ⚠️ **SVG坐标 vs 屏幕坐标**: 注意转换
- ⚠️ **viewBox**: 确保始终设置正确
- ⚠️ **缩放**: 考虑previewScale的影响

### 事件处理
- ⚠️ **事件冲突**: 原生事件 vs @dnd-kit
- ⚠️ **事件冒泡**: 手柄点击不应触发元素拖动
- ⚠️ **Ctrl/Cmd键**: 多选功能需要检测

### 性能优化
- ⚠️ **频繁更新**: mousemove中避免过多state更新
- ⚠️ **节流防抖**: 对齐检测、board扩展检测
- ⚠️ **memo/callback**: 优化组件渲染

### 数据验证
- ⚠️ **NaN检查**: 坐标计算后验证
- ⚠️ **边界检查**: 确保元素不超出合理范围
- ⚠️ **null检查**: currentDocument可能为null

---

## 🎯 下一步行动

### 立即验证（优先级 P0）
1. **测试现有拖拽系统**
   - 启动dev server: `npm run dev`
   - 打开 http://localhost:3000/editor
   - 按照"已声称完成（需测试验证）"章节逐项测试
   - 记录所有发现的问题

2. **修复已知Bug**
   - 验证巨型圆形手柄是否真正修复
   - 验证黑白区域问题是否解决
   - 验证staging预览是否完整

### 开始实现（优先级 P1）
3. **功能4️⃣: Hover显示对齐按钮** (10分钟)
   - 最简单，立即见效
   - 无依赖，风险低

4. **功能2️⃣: 实时board扩展** (15分钟)
   - 简单，用户体验提升明显
   - 只需调用现有函数

5. **功能1️⃣: 实时spacing推开** (45分钟)
   - 核心功能，影响后续功能
   - 需要新增engine函数

### 后续规划（优先级 P2-P3）
6. **功能5️⃣: Group功能** (90分钟)
   - 独立功能，不阻塞其他
   - 提升专业性

7. **功能3️⃣: 中点拖拽对齐** (120分钟)
   - 最复杂，最后实现
   - 可选功能，不是MVP必需

---

## 📞 问题记录

### 待澄清的问题
- [ ] spacing推开时，如果同时违反多个方向，优先级如何？
- [ ] board扩展是否需要有最大限制？
- [ ] group拖动时，如果推到其他元素，是group整体移动还是部分元素停止？
- [ ] 中点对齐的threshold是0.1h还是可配置？
- [ ] 是否需要undo/redo功能？

### 已知限制
- 当前不支持旋转元素
- 当前不支持按住Shift等比例缩放
- 当前不支持键盘快捷键移动元素
- 当前不支持元素层级调整（z-index）

---

**最后更新**: 2024-10-24  
**下次review**: 实现功能4️⃣后更新  
**负责人**: klayn  

---

## 🔗 参考资源

- [dnd-kit文档](https://docs.dndkit.com/)
- [SVG坐标系统](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Positions)
- [React性能优化](https://react.dev/learn/render-and-commit)
- [Zustand文档](https://docs.pmnd.rs/zustand/getting-started/introduction)

