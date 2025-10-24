/**
 * 标志引擎 - 统一导出接口
 */

export * from './box'
export * from './primitives'
export * from './converter'
export * from './layout'
export * from './renderer'
export * from './manual'

// Manual mode utilities
export { validateSpacing, detectAlignmentOpportunities } from './manual'

// 便捷函数：从输入生成SVG
import { LayoutParams, SVGExportOptions } from '../types'
import { computeLayout } from './layout'
import { toSVG } from './renderer'

/**
 * 一站式生成SVG
 */
export function generateSVG(params: LayoutParams, options: SVGExportOptions = {}): string {
  const model = computeLayout(params)
  return toSVG(model, options)
}

