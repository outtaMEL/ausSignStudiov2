# 🧪 如何测试 D1-D4 引擎

## 方法对比

| 方法 | 优势 | 适用场景 |
|------|------|----------|
| **Playground 页面** ⭐ 推荐 | 可视化、实时反馈、完整功能 | 日常开发和测试 |
| **单元测试** | 自动化、快速 | CI/CD、回归测试 |
| **Node.js 脚本** | 独立、批量处理 | 批量生成、性能测试 |

---

## 方法 1: Playground 页面 (推荐)

### 启动

```bash
# 启动开发服务器
npm run dev

# 访问 Playground
http://localhost:3000/playground
```

### 功能

- ✅ 实时调整所有参数
- ✅ 查看 SVG 预览
- ✅ 查看 Layout Model JSON
- ✅ 导出 SVG 和配置
- ✅ 完全独立，不依赖主应用

### 使用步骤

1. **修改输入**
   - Panel 内容（道路名称、目的地等）
   - 模板参数（字号、间距等）
   - 引擎参数（pxPerH）

2. **运行布局**
   - 点击"运行布局"按钮
   - 查看 SVG 预览
   - 检查 Layout Model

3. **查看中间结果**
   - 切换到"Items"标签：查看所有渲染项
   - 切换到"Meta"标签：查看元数据
   - 切换到"完整JSON"：查看完整输出

4. **导出**
   - 导出 SVG：下载生成的标志
   - 导出配置：保存当前参数

---

## 方法 2: 在代码中直接调用

### 在任何 React 组件或页面中

```typescript
import { computeLayout, toSVG } from '@/lib/engine'
import { DEFAULT_TEMPLATE, DEFAULT_FONT_METRICS } from '@/lib/defaults'

// 调用引擎
const layout = computeLayout({
  input: {
    panels: [
      {
        roadName: 'TEST HWY',
        roadNumberType: 'shield',
        shieldLabel: 'M1',
        destinations: ['Sydney'],
        direction: 'right',
      },
    ],
  },
  template: DEFAULT_TEMPLATE,
  pxPerH: 30,
  fontMetrics: DEFAULT_FONT_METRICS,
})

// 生成 SVG
const svg = toSVG(layout, { backgroundColor: '#0B6B4D' })

console.log('Layout:', layout)
console.log('SVG:', svg)
```

---

## 方法 3: 单元测试 (推荐用于自动化)

### 创建测试文件

```typescript
// src/lib/engine/__tests__/layout.test.ts
import { describe, it, expect } from 'vitest'
import { computeLayout } from '../layout'

describe('D3 Layout Engine', () => {
  it('should generate G1-1 layout', () => {
    const result = computeLayout({
      input: {
        panels: [/* ... */],
      },
      template: DEFAULT_TEMPLATE,
      pxPerH: 30,
      fontMetrics: DEFAULT_FONT_METRICS,
    })

    expect(result.board.w).toBeGreaterThan(0)
    expect(result.board.h).toBeGreaterThan(0)
    expect(result.items.length).toBeGreaterThan(0)
  })
})
```

### 运行测试

```bash
# 安装 Vitest (如果还没有)
npm install -D vitest

# 运行测试
npm run test
```

---

## 方法 4: Node.js 脚本

### 使用 tsx 运行 TypeScript

```bash
# 安装 tsx
npm install -D tsx

# 创建测试脚本
# scripts/test-engine.ts
```

```typescript
// scripts/test-engine.ts
import { computeLayout, toSVG } from '../src/lib/engine'
import { DEFAULT_TEMPLATE, DEFAULT_FONT_METRICS } from '../src/lib/defaults'
import { writeFileSync } from 'fs'

const layout = computeLayout({
  input: {
    panels: [/* ... */],
  },
  template: DEFAULT_TEMPLATE,
  pxPerH: 30,
  fontMetrics: DEFAULT_FONT_METRICS,
})

const svg = toSVG(layout)
writeFileSync('output.svg', svg)
console.log('✅ SVG generated: output.svg')
```

### 运行

```bash
npx tsx scripts/test-engine.ts
```

---

## 独立测试每个模块

### D1: Box & Primitives

```typescript
import { createBox, stackV, stackH } from '@/lib/engine'

// 创建 box
const box1 = createBox(10, 5)  // 10h × 5h
const box2 = createBox(8, 3)   // 8h × 3h

// 垂直堆叠
const stacked = stackV([box1, box2], 0.5)  // 间距 0.5h

console.log('Stacked:', stacked)
// 输出: { w: 10, h: 8.5, children: [...] }
```

### D2: Converter

```typescript
import { toBoxText, toBoxIcon } from '@/lib/engine'

// 文字测量
const textBox = toBoxText('Sydney', {
  fontSeries: 'E',
  letter_h: 8,
  fontMetrics: { avgCharWidthRatio: 0.6, ascentRatio: 0.75, descentRatio: 0.25 }
})

console.log('Text box:', textBox)
// 输出: { x: 0, y: 0, w: 28.8, h: 8, ascent_h: 6, ... }

// 图标测量
const arrowBox = toBoxIcon('arrow-right-std', { line_h: 8 })

console.log('Arrow box:', arrowBox)
// 输出: { x: 0, y: 0, w: 10, h: 8, ... }
```

### D3: Layout Engine

```typescript
import { computeLayout } from '@/lib/engine'

const layout = computeLayout({
  input: {
    panels: [/* ... */]
  },
  template: { /* ... */ },
  pxPerH: 30,
  fontMetrics: { /* ... */ }
})

console.log('Board size:', layout.board)
console.log('Items count:', layout.items.length)
console.log('Meta:', layout.meta)
```

### D4: Renderer

```typescript
import { toSVG, downloadSVG } from '@/lib/engine'

// 生成 SVG 字符串
const svg = toSVG(layout, {
  backgroundColor: '#0B6B4D',
  includeGrid: true,
  includeGuides: true
})

// 下载 SVG (仅浏览器环境)
downloadSVG(layout, 'test-sign.svg')
```

---

## 调试技巧

### 1. 使用 Playground 的调试功能

```typescript
// 在 Playground 页面中，可以查看：
- Layout Model JSON (完整的中间结果)
- Items 数组 (所有渲染项的位置和属性)
- Meta 对象 (布局元数据)
```

### 2. 在浏览器控制台

```javascript
// 访问 http://localhost:3000/playground
// 打开控制台 (F12)

// 查看全局对象 (如果暴露)
console.log(window.__LAYOUT_DEBUG__)
```

### 3. 添加日志

```typescript
// 在 layout.ts 中添加调试日志
export function computeLayout(params: LayoutParams): LayoutModel {
  console.log('🔍 Input:', params.input)
  
  const result = /* ... */
  
  console.log('✅ Output:', result)
  return result
}
```

---

## 性能测试

### 测试大量面板

```typescript
// 生成 100 个测试用例
const testCases = Array.from({ length: 100 }, (_, i) => ({
  panels: [
    { destinations: [`Destination ${i}`], direction: 'right', /* ... */ }
  ]
}))

console.time('Layout generation')
testCases.forEach(testCase => {
  computeLayout({ input: testCase, /* ... */ })
})
console.timeEnd('Layout generation')
```

### 测试不同 pxPerH

```typescript
const pxPerHValues = [10, 20, 30, 40, 50]

pxPerHValues.forEach(pxPerH => {
  console.time(`Layout @ ${pxPerH}px/h`)
  computeLayout({ /* ... */, pxPerH })
  console.timeEnd(`Layout @ ${pxPerH}px/h`)
})
```

---

## 常见问题

### Q: 如何查看 h 单位的实际值？

A: 在 Playground 的 Meta 标签中，所有值都有 `_h` 和 `_px` 两个版本。

### Q: 如何测试边缘情况？

A: 在 Playground 中输入极端值（如很长的文字、很小的间距）。

### Q: 如何对比不同参数的效果？

A: 
1. 在 Playground 中调整参数
2. 导出配置 JSON
3. 修改后重新导入（或手动修改代码）

---

## 推荐工作流

1. **Playground 快速验证** → 调整参数，查看效果
2. **代码中集成** → 复制有效的参数到应用
3. **单元测试** → 为关键场景添加测试
4. **性能测试** → 使用 Node.js 脚本批量测试

---

## 下一步

- 查看 `src/lib/engine/` 的源代码
- 阅读 `ARCHITECTURE.md` 了解架构
- 在 Playground 中实验不同的参数组合

