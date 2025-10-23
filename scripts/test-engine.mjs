#!/usr/bin/env node

/**
 * 命令行测试脚本 - 独立测试 D1-D4 引擎
 * 
 * 用法:
 *   node scripts/test-engine.mjs
 *   node scripts/test-engine.mjs --type=G1-2
 *   node scripts/test-engine.mjs --output=test-output.svg
 */

import { writeFileSync } from 'fs'

// 模拟引擎函数 (简化版，实际应该从编译后的 TypeScript 导入)
// 注意：这里需要先编译 TypeScript，或使用 tsx 运行

const testConfig = {
  panels: [
    {
      roadName: 'SALTASH HWY',
      roadNumberType: 'shield',
      roadNumber: '',
      shieldLabel: 'M1',
      destinations: ['Plumpton'],
      direction: 'left',
    },
    {
      roadName: '',
      roadNumberType: 'number',
      roadNumber: 'A85',
      shieldLabel: '',
      destinations: ['Hawker'],
      direction: 'right',
    },
  ],
  template: {
    letter_height_h: 8,
    line_spacing_h: 0.75,
    group_spacing_h: 1.0,
    board_pad_h: 1.0,
    panel_spacing_h: 0.3,
    corner_radius_h: 0.5,
    border_h: 0.2,
    roadName_letter_height_h: 6,
    roadName_bg_color: '#ffffff',
    roadName_text_color: '#000000',
    roadName_pad_h: 0.5,
    roadName_corner_radius_h: 0.3,
    roadNumber_letter_height_h: 7,
    roadNumber_bg_color: '#ffd700',
    roadNumber_text_color: '#000000',
    roadNumber_pad_h: 0.3,
    roadNumber_corner_radius_h: 0.2,
    font_series: 'E',
  },
  pxPerH: 30,
}

console.log('🧪 Engine Test Script')
console.log('=' .repeat(50))
console.log('\n📝 测试配置:')
console.log(JSON.stringify(testConfig, null, 2))
console.log('\n' + '='.repeat(50))

console.log('\n⚠️  注意: 这是一个演示脚本')
console.log('实际使用需要:')
console.log('  1. 编译 TypeScript: npm run build')
console.log('  2. 或使用 tsx: npx tsx scripts/test-engine.ts')
console.log('\n📚 要真正测试引擎，请:')
console.log('  1. 访问 Playground: http://localhost:3000/playground')
console.log('  2. 或在代码中导入: import { computeLayout } from "@/lib/engine"')
console.log('\n✅ D1-D4 引擎代码位置: src/lib/engine/')
console.log('   - box.ts & primitives.ts (D1)')
console.log('   - converter.ts (D2)')
console.log('   - layout.ts (D3)')
console.log('   - renderer.ts (D4)')

