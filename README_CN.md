# AU Sign Studio v2 🚀

澳大利亚道路标志设计工具 - 符合 AS 1742.6 标准

## 🎯 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
http://localhost:3000              # 首页
http://localhost:3000/editor       # 编辑器
http://localhost:3000/playground   # 引擎测试 ⭐
```

## 📂 项目结构

```
ausSignStudio-v2/
├── app/                    # Next.js 页面路由
│   ├── page.tsx           # 首页
│   ├── editor/            # 编辑器页面
│   └── playground/        # 引擎测试页面 ⭐
│
├── components/
│   ├── sign/              # 业务组件
│   │   ├── SignCanvas.tsx      # SVG 显示
│   │   ├── PanelEditor.tsx     # 面板编辑
│   │   ├── TemplateEditor.tsx  # 模板编辑
│   │   └── index.ts            # 统一导出
│   └── ui/                # shadcn/ui 基础组件
│
├── lib/
│   ├── engine/            # D1-D4 引擎核心 ⭐
│   │   ├── box.ts         # D1: Box定义
│   │   ├── primitives.ts  # D1: 排版原语
│   │   ├── converter.ts   # D2: 几何转换
│   │   ├── layout.ts      # D3: 布局引擎
│   │   ├── renderer.ts    # D4: SVG渲染
│   │   └── index.ts       # 统一导出
│   ├── types.ts           # 类型定义
│   ├── utils.ts           # 工具函数
│   └── defaults.ts        # 默认配置
│
└── store/
    └── signStore.ts       # Zustand 状态管理
```

## 🔑 核心概念

### D1-D4 引擎架构

本项目的核心是四层引擎架构：

- **D1 (Box & Primitives)**: h空间布局原语
- **D2 (Converter)**: 文字和图标几何转换
- **D3 (Layout)**: 完整的布局计算引擎
- **D4 (Renderer)**: SVG渲染输出

### 代码分层

```
页面 (app/) 
  ↓
组件 (components/sign/)
  ↓
状态 (store/)
  ↓
业务逻辑 (lib/)
  ↓
引擎 (lib/engine/)  ← D1-D4
```

## 💡 如何使用

### 1. 创建标志

```bash
# 启动应用
npm run dev

# 访问首页创建新标志
http://localhost:3000

# 选择 G1-1 (2个面板) 或 G1-2 (3个面板)
```

### 2. 编辑面板

在编辑器中可以设置：
- 道路名称
- 路号类型（路盾/编号）
- 目的地（1-3个）
- 方向（左/前/右）

### 3. 测试引擎

访问 Playground 页面独立测试 D1-D4 引擎：
```
http://localhost:3000/playground
```

功能：
- ✅ 实时调整参数
- ✅ 查看 Layout Model JSON
- ✅ 查看 SVG 预览
- ✅ 导出 SVG 和配置

### 4. 在代码中使用引擎

```typescript
// 导入引擎
import { computeLayout, toSVG } from '@/lib/engine'
import { DEFAULT_TEMPLATE, DEFAULT_FONT_METRICS } from '@/lib/defaults'

// 计算布局
const layout = computeLayout({
  input: { panels: [...] },
  template: DEFAULT_TEMPLATE,
  pxPerH: 30,
  fontMetrics: DEFAULT_FONT_METRICS,
})

// 生成 SVG
const svg = toSVG(layout, { backgroundColor: '#0B6B4D' })
```

### 5. 导入组件

```typescript
// 业务组件
import { SignCanvas, PanelEditor } from '@/components/sign'

// UI 组件
import { Button, Card } from '@/components/ui/button'

// 状态管理
import { useSignStore } from '@/store/signStore'

// 类型
import type { SignDocument, LayoutModel } from '@/lib/types'
```

## 📖 文档

- **README.md** - 完整的英文文档
- **ARCHITECTURE.md** - 详细架构说明
- **HOW_TO_TEST_ENGINE.md** - 引擎测试指南

## 🎨 技术栈

- **Next.js 14** - React 框架（App Router）
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **Radix UI** - 无障碍 UI 组件
- **Lucide React** - 图标库

## 🧪 测试和开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🔧 常见任务

### 修改布局逻辑

编辑 `lib/engine/layout.ts` 中的布局函数，然后在 Playground 测试。

### 修改渲染样式

编辑 `lib/engine/renderer.ts` 中的渲染函数。

### 添加新的标志类型

1. 更新 `lib/types.ts` 添加新类型
2. 在 `lib/engine/layout.ts` 实现布局函数
3. 在 `app/page.tsx` 添加创建按钮

## 📊 快速参考

| 功能 | 位置 |
|------|------|
| D1-D4 引擎 | `lib/engine/` |
| 业务组件 | `components/sign/` |
| UI 组件 | `components/ui/` |
| 页面路由 | `app/` |
| 状态管理 | `store/signStore.ts` |
| 类型定义 | `lib/types.ts` |
| 测试页面 | http://localhost:3000/playground |

## 🎉 特性

- ✅ 完整的 TypeScript 支持
- ✅ 符合 AS 1742.6 标准
- ✅ D1-D4 布局引擎
- ✅ 实时预览
- ✅ 独立测试页面（Playground）
- ✅ 清晰的模块化架构
- ✅ 响应式设计

---

**立即开始**: `npm run dev` 🚀

