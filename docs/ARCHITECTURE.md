# 架构文档

## 系统架构

AU Sign Studio v2 采用分层架构设计，确保代码的可维护性和可扩展性。

```
┌─────────────────────────────────────────────┐
│          UI Layer (React/Next.js)           │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Pages      │  │    Components        │ │
│  │ - Dashboard  │  │ - SignCanvas         │ │
│  │ - Editor     │  │ - PanelEditor        │ │
│  │ - Library    │  │ - TemplateEditor     │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│       State Management (Zustand)            │
│  - Document State                           │
│  - Layout Cache                             │
│  - UI State                                 │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│         Business Logic Layer                │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Defaults    │  │    Utilities         │ │
│  │  - Templates │  │ - Helpers            │ │
│  │  - Presets   │  │ - Validators         │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│         Sign Engine (D1-D4)                 │
│  ┌─────────────────────────────────────┐   │
│  │  D1: Box & Primitives (h space)     │   │
│  │  - createBox, stackV, stackH        │   │
│  │  - Pure layout calculations         │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  D2: Converter                      │   │
│  │  - Text measurement                 │   │
│  │  - Icon sizing                      │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  D3: Layout Engine                  │   │
│  │  - layoutG11, layoutG12             │   │
│  │  - Panel composition                │   │
│  │  - Alignment logic                  │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  D4: Renderer                       │   │
│  │  - SVG generation                   │   │
│  │  - Export functions                 │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 数据流

### 创建新文档

```
User Action → createDocument()
  ↓
Store: Create Document
  ↓
Store: Regenerate Layout
  ↓
Engine: computeLayout()
  ↓
Store: Set Layout Model
  ↓
UI: Re-render Canvas
```

### 编辑面板

```
User Input → updatePanel()
  ↓
Store: Update Panel Data
  ↓
Store: Regenerate Layout
  ↓
Engine: computeLayout()
  ↓
Store: Set Layout Model
  ↓
UI: Re-render Canvas
```

### 导出SVG

```
User Click → downloadSVG()
  ↓
Get Current Layout
  ↓
Renderer: toSVG()
  ↓
Browser: Download File
```

## 引擎详解

### D1: Box & Primitives

**职责**: 抽象空间布局计算

- 所有计算在 "h" 单位空间进行
- 与像素无关，确保缩放一致性
- 提供基础的布局原语

**核心函数**:
- `createBox(w, h)`: 创建Box
- `stackV(boxes, gap)`: 垂直堆叠
- `stackH(boxes, gap)`: 水平堆叠
- `align(box, parent, alignment)`: 对齐
- `boardSize(contentW, contentH, pad)`: 计算板面

### D2: Converter

**职责**: 文字和图标的几何转换

- 测量文字宽度和高度
- 计算图标尺寸
- 提供字体度量参数

**核心函数**:
- `toBoxText(text, options)`: 文字→Box
- `toBoxIcon(iconId, options)`: 图标→Box
- `toBoxRoadName(text, options)`: 道路名称→Box
- `toBoxRoadNumber(text, options)`: 道路编号→Box

### D3: Layout Engine

**职责**: 完整的布局计算

- Panel 级别的布局
- 多 Panel 的堆叠和对齐
- Dominant panel 检测
- h → px 转换

**核心函数**:
- `layoutSinglePanel()`: 单个Panel布局
- `applyAlignmentAndGenerateItems()`: 应用对齐
- `layoutG11(params)`: G1-1布局
- `layoutG12(params)`: G1-2布局
- `computeLayout(params)`: 统一入口

### D4: Renderer

**职责**: SVG渲染

- 生成SVG标记
- 渲染各种元素类型
- 导出功能

**核心函数**:
- `toSVG(model, options)`: 生成SVG
- `toDataURL(model)`: 生成Data URL
- `downloadSVG(model, filename)`: 下载SVG

## 状态管理

### Store结构

```typescript
{
  currentDocument: SignDocument | null,
  currentLayout: LayoutModel | null,
  recentDocuments: DocumentInfo[],
  ui: {
    sidebarOpen: boolean,
    activeTab: 'properties' | 'template' | 'engine',
    previewScale: number,
    showGrid: boolean,
    showGuides: boolean
  },
  actions: {
    // Document
    createDocument, loadDocument, updateDocument,
    saveDocument, deleteDocument,
    
    // Panel
    updatePanel, addPanel, removePanel,
    movePanelUp, movePanelDown,
    
    // Template & Engine
    updateTemplate, resetTemplate,
    updateEngine,
    
    // Layout
    regenerateLayout,
    
    // UI
    toggleSidebar, setActiveTab, setPreviewScale,
    toggleGrid, toggleGuides
  }
}
```

### 性能优化

1. **布局缓存**: Layout只在数据变化时重新计算
2. **选择性更新**: 使用 Zustand selectors 避免不必要的re-render
3. **防抖**: 对频繁的输入进行防抖处理

## 组件层次

### 快速模式（Playground）
```
PlaygroundPage
├── Header
├── PanelEditor (左侧)
│   └── PanelCard[]
├── SignCanvas (中央)
│   └── SVGDisplay (自动生成)
└── SettingsPanel (右侧)
    ├── PropertiesTab
    ├── TemplateEditor
    └── EngineEditor
```

### 手动模式（Editor）
```
EditorPage
├── Header
│   └── BackButton
├── ResizableThreeColumn (可调整三列)
│   ├── ElementLibrary (左列)
│   │   └── ElementTemplates
│   ├── StagedElements (中列)
│   │   └── StagedElement[] (拖拽暂存区)
│   └── SimpleManualCanvas (右列)
│       ├── Board背景
│       ├── PlacedElement[] (已放置元素)
│       ├── BackToStagingHandle (拖回手柄)
│       └── SpacingWarning (间距警告)
└── DragOverlay (拖拽预览)
```

### 手动模式画布实现

**SimpleManualCanvas** - 使用原生鼠标事件实现精确拖拽：
- ✅ 原生mousedown/mousemove/mouseup事件
- ✅ SVG坐标转换（createSVGPoint + getScreenCTM）
- ✅ 实时移动反馈（透明度变化）
- ✅ 双向拖拽支持（与@dnd-kit配合）
- ✅ 边界检查和碰撞检测

**ManualCanvas** - 使用@dnd-kit的旧版实现（已弃用）：
- ⚠️ 保留用于参考，但不再在Editor中使用

## 扩展指南

### 添加新的标志类型

1. 更新类型定义:
```typescript
// src/lib/types.ts
export type SignType = 'G1-1' | 'G1-2' | 'G2' | 'G3' | 'NEW_TYPE'
```

2. 实现布局函数:
```typescript
// src/lib/engine/layout.ts
export function layoutNewType(params: LayoutParams): LayoutModel {
  // 实现布局逻辑
}
```

3. 更新路由:
```typescript
// src/lib/engine/layout.ts - computeLayout()
switch (signType) {
  case 'NEW_TYPE':
    return layoutNewType(params)
}
```

4. 更新UI:
```typescript
// src/app/page.tsx
// 添加新的创建按钮
```

### 自定义渲染样式

修改 `src/lib/engine/renderer.ts` 中的渲染函数：

```typescript
function renderText(item: TextItem): string {
  // 自定义文字渲染逻辑
  return `<text ... />`
}
```

### 添加新的模板参数

1. 更新类型:
```typescript
// src/lib/types.ts
export interface TemplateParams {
  // 添加新参数
  newParam: number
}
```

2. 更新默认值:
```typescript
// src/lib/defaults.ts
export const DEFAULT_TEMPLATE: TemplateParams = {
  newParam: 1.0,
}
```

3. 更新UI:
```typescript
// src/components/TemplateEditor.tsx
// 添加新的输入控件
```

## 最佳实践

1. **类型先行**: 先定义类型，再实现逻辑
2. **纯函数**: 引擎层使用纯函数，避免副作用
3. **单一职责**: 每个函数只做一件事
4. **可测试性**: 保持函数的可测试性
5. **文档**: 为复杂逻辑添加注释

## 性能考虑

- 避免在渲染路径中进行复杂计算
- 使用 React.memo 优化组件
- 合理使用 Zustand 的 selector
- 大型 SVG 使用虚拟化技术

