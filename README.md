# AU Sign Studio v2

澳大利亚道路标志设计工具 - 符合 AS 1742.6 标准

## 🎯 项目简介

AU Sign Studio v2 是一个完全重构的道路标志设计工具，采用现代化的 Next.js 架构，将原有的 sign-engine-sandbox 核心引擎转换为 TypeScript 模块，提供更好的类型安全和开发体验。

### 主要特性

- ✅ **符合标准**: 严格遵循 AS 1742.6 澳大利亚道路标志标准
- ✅ **TypeScript**: 完整的类型定义，提供更好的IDE支持
- ✅ **模块化架构**: D1-D4 引擎模块化设计，易于维护和扩展
- ✅ **实时预览**: 所见即所得的编辑体验
- ✅ **灵活配置**: 丰富的模板参数和引擎设置

## 🏗 项目结构

```
ausSignStudio-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页/Dashboard
│   │   ├── globals.css         # 全局样式
│   │   └── editor/             # 编辑器页面
│   │       └── page.tsx
│   ├── components/             # React 组件
│   │   ├── ui/                 # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── separator.tsx
│   │   ├── SignCanvas.tsx      # SVG 画布组件
│   │   ├── PanelEditor.tsx     # 面板编辑器
│   │   ├── TemplateEditor.tsx  # 模板编辑器
│   │   └── EngineEditor.tsx    # 引擎设置编辑器
│   ├── lib/                    # 核心库
│   │   ├── engine/             # D1-D4 引擎模块 (TypeScript)
│   │   │   ├── box.ts          # D1: Box 定义
│   │   │   ├── primitives.ts   # D1: 排版原语
│   │   │   ├── converter.ts    # D2: 几何转换器
│   │   │   ├── layout.ts       # D3: 布局引擎
│   │   │   ├── renderer.ts     # D4: SVG 渲染器
│   │   │   └── index.ts        # 统一导出
│   │   ├── types.ts            # 类型定义
│   │   ├── utils.ts            # 工具函数
│   │   └── defaults.ts         # 默认配置
│   └── store/                  # 状态管理
│       └── signStore.ts        # Zustand Store
├── public/                     # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd ausSignStudio-v2
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动

### 3. 构建生产版本

```bash
npm run build
npm start
```

## 📖 核心概念

### D1-D4 引擎架构

本项目的核心是 D1-D4 四层引擎架构，从原 sign-engine-sandbox 重构而来：

#### D1 - Box & Primitives (h 空间)

所有布局计算都在抽象的 "h" 单位空间中进行，与像素无关：

```typescript
import { createBox, stackV, stackH } from '@/lib/engine'

// 创建一个 Box
const box = createBox(10, 2) // 宽10h，高2h

// 垂直堆叠
const stacked = stackV([box1, box2], 0.5) // 间距0.5h
```

#### D2 - Converter (文字和图标测量)

将文字和图标转换为 h 空间的 Box：

```typescript
import { toBoxText, toBoxIcon } from '@/lib/engine'

// 文字转 Box
const textBox = toBoxText('Sydney', {
  fontSeries: 'E',
  letter_h: 8,
  fontMetrics: { avgCharWidthRatio: 0.6, ascentRatio: 0.75, descentRatio: 0.25 }
})

// 图标转 Box
const arrowBox = toBoxIcon('arrow-right-std', { line_h: 8 })
```

#### D3 - Layout (布局引擎)

执行完整的布局计算，支持 G1-1, G1-2 等标志类型：

```typescript
import { computeLayout } from '@/lib/engine'

const layout = computeLayout({
  input: {
    panels: [
      {
        roadName: 'SALTASH HWY',
        roadNumberType: 'shield',
        shieldLabel: 'M1',
        destinations: ['Plumpton'],
        direction: 'left'
      }
    ]
  },
  template: templateParams,
  pxPerH: 30,
  fontMetrics: fontMetrics
})
```

#### D4 - Renderer (SVG 渲染)

将布局模型渲染为 SVG：

```typescript
import { toSVG, downloadSVG } from '@/lib/engine'

// 生成 SVG 字符串
const svgString = toSVG(layout, {
  backgroundColor: '#0B6B4D',
  includeGrid: false,
  includeGuides: false
})

// 下载 SVG
downloadSVG(layout, 'my-sign.svg')
```

### 状态管理

使用 Zustand 进行全局状态管理：

```typescript
import { useSignStore, useCurrentDocument, useActions } from '@/store/signStore'

function MyComponent() {
  const document = useCurrentDocument()
  const { updatePanel, saveDocument } = useActions()
  
  // 使用状态和actions
}
```

## 🎨 设计系统

### 颜色

- **Primary (标志绿)**: `#0B6B4D`
- **Sign White**: `#FFFFFF`
- **Sign Yellow**: `#FFD700`
- **Sign Black**: `#000000`

### 间距系统

基于 h 单位的间距系统，保证布局一致性：

- 字母高度: 4-12h
- 行间距: 0.25-2h
- 组间距: 0.5-3h
- 边距: 0.25-3h

## 📝 使用指南

### 创建新标志

1. 在首页点击 "创建 G1-1" 或 "创建 G1-2"
2. 进入编辑器页面
3. 在左侧面板编辑内容
4. 实时在中央画布查看预览
5. 在右侧调整模板和引擎参数

### 编辑面板

每个面板可以设置：

- **道路名称**: 可选的道路名称（白底黑字）
- **路号类型**: 无/路盾/编号
- **目的地**: 1-3个目的地
- **方向**: 左/前/右

### 调整模板参数

在右侧"模板"标签中可以调整：

- 基本间距（字母高度、行间距、组间距等）
- 道路名称样式（字号、颜色）
- 道路编号样式（字号、颜色）

### 引擎设置

- **像素密度 (pxPerH)**: 控制最终输出尺寸，建议 20-50
- **像素对齐模式**: 防止边缘模糊

### 导出

点击右上角"导出SVG"按钮，下载生成的标志文件。

## 🔧 开发指南

### 添加新的标志类型

1. 在 `src/lib/types.ts` 中添加新的 `SignType`
2. 在 `src/lib/engine/layout.ts` 中实现布局函数
3. 在 `src/store/signStore.ts` 的 `createDocument` 中添加处理逻辑

### 扩展布局引擎

所有布局逻辑都在 `src/lib/engine/layout.ts` 中：

```typescript
export function layoutG13(params: LayoutParams): LayoutModel {
  // 实现 G1-3 布局
  // ...
}
```

### 自定义渲染

在 `src/lib/engine/renderer.ts` 中修改 SVG 渲染逻辑：

```typescript
function renderCustomElement(item: CustomItem): string {
  // 自定义渲染逻辑
}
```

## 📦 依赖

### 核心依赖

- **Next.js 14**: React 框架
- **TypeScript**: 类型安全
- **Zustand**: 状态管理
- **Tailwind CSS**: 样式框架
- **Radix UI**: 无障碍UI组件
- **Lucide React**: 图标库

### 开发依赖

- **ESLint**: 代码检查
- **Prettier**: 代码格式化

## 🔄 从旧项目迁移

如果你有来自 `ausSignMaster` (v1) 的数据：

1. 旧版本使用的是 mock 布局引擎，新版本使用真实的 D1-D4 引擎
2. 数据结构有所变化，需要进行转换
3. 参考 `src/lib/types.ts` 中的新数据结构

## 🛠 技术亮点

### 相比 v1 的改进

1. **完整的 TypeScript 支持**: 所有代码都有类型定义
2. **真实的布局引擎**: 使用从 sign-engine-sandbox 转换的 D1-D4 模块
3. **更清晰的架构**: 严格的分层设计，职责明确
4. **更好的性能**: 优化的状态管理和渲染逻辑
5. **更现代的 UI**: 基于 shadcn/ui 的组件系统

### 核心原则

- **单一职责**: 每个模块只做一件事
- **类型安全**: 利用 TypeScript 防止错误
- **可测试性**: 纯函数设计，易于测试
- **可扩展性**: 易于添加新功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

## 📞 联系

如有问题，请通过 Issue 联系。

---

**Built with ❤️ for Australian road sign designers**

