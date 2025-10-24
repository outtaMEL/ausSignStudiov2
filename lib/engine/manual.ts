/**
 * D5: Manual Layout Engine
 * 手动模式布局引擎 - 最小实现
 */

import { PlacedElement, AlignmentConstraint } from '../types'

export interface ManualLayoutParams {
  elements: PlacedElement[]
  constraints: AlignmentConstraint[]
  pxPerH: number
}

export interface ManualLayoutResult {
  elements: PlacedElement[]
  boardSize: { w: number; h: number }
}

/**
 * 计算board尺寸（基于elements的bounding box）
 */
function calculateBoardSizeFromElements(elements: PlacedElement[]): { w: number; h: number } {
  if (elements.length === 0) {
    return { w: 10, h: 5 }
  }

  let maxX = 0
  let maxY = 0
  
  for (const element of elements) {
    const right = element.box.x + element.box.w
    const bottom = element.box.y + element.box.h
    
    if (right > maxX) maxX = right
    if (bottom > maxY) maxY = bottom
  }

  // 加上padding (0.3h)
  const pad = 0.3
  return {
    w: Math.max(maxX + pad, 10),
    h: Math.max(maxY + pad, 5),
  }
}

/**
 * Validate spacing between elements
 */
export function validateSpacing(
  elements: PlacedElement[],
  minSpacing: { [key: string]: number } = {}
): Array<{
  elem1Id: string
  elem2Id: string
  currentSpacing: number
  minRequired: number
  direction: 'horizontal' | 'vertical'
}> {
  const violations: Array<{
    elem1Id: string
    elem2Id: string
    currentSpacing: number
    minRequired: number
    direction: 'horizontal' | 'vertical'
  }> = []

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const elem1 = elements[i]
      const elem2 = elements[j]

      const horizontalGap = Math.max(
        elem2.box.x - (elem1.box.x + elem1.box.w),
        elem1.box.x - (elem2.box.x + elem2.box.w)
      )

      const verticalGap = Math.max(
        elem2.box.y - (elem1.box.y + elem1.box.h),
        elem1.box.y - (elem2.box.y + elem2.box.h)
      )

      const minH = minSpacing[`${elem1.type}-${elem2.type}-h`] || 0.15
      const minV = minSpacing[`${elem1.type}-${elem2.type}-v`] || 0.15

      if (horizontalGap >= 0 && horizontalGap < minH) {
        violations.push({
          elem1Id: elem1.id,
          elem2Id: elem2.id,
          currentSpacing: horizontalGap,
          minRequired: minH,
          direction: 'horizontal',
        })
      }

      if (verticalGap >= 0 && verticalGap < minV) {
        violations.push({
          elem1Id: elem1.id,
          elem2Id: elem2.id,
          currentSpacing: verticalGap,
          minRequired: minV,
          direction: 'vertical',
        })
      }
    }
  }

  return violations
}

/**
 * Detect alignment opportunities
 */
export function detectAlignmentOpportunities(
  elements: PlacedElement[],
  threshold: number = 0.1
): Array<{
  type: 'horizontal' | 'vertical'
  position: number
  elementIds: string[]
  alignmentPoint: string
}> {
  const lines: Array<{
    type: 'horizontal' | 'vertical'
    position: number
    elementIds: string[]
    alignmentPoint: string
  }> = []

  // Check vertical alignment (left, center, right edges)
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const e1 = elements[i]
      const e2 = elements[j]

      // Left edges
      if (Math.abs(e1.box.x - e2.box.x) < threshold) {
        lines.push({
          type: 'vertical',
          position: e1.box.x,
          elementIds: [e1.id, e2.id],
          alignmentPoint: 'left',
        })
      }

      // Right edges
      const e1Right = e1.box.x + e1.box.w
      const e2Right = e2.box.x + e2.box.w
      if (Math.abs(e1Right - e2Right) < threshold) {
        lines.push({
          type: 'vertical',
          position: e1Right,
          elementIds: [e1.id, e2.id],
          alignmentPoint: 'right',
        })
      }

      // Centers
      const e1CenterX = e1.box.x + e1.box.w / 2
      const e2CenterX = e2.box.x + e2.box.w / 2
      if (Math.abs(e1CenterX - e2CenterX) < threshold) {
        lines.push({
          type: 'vertical',
          position: e1CenterX,
          elementIds: [e1.id, e2.id],
          alignmentPoint: 'center',
        })
      }
    }
  }

  return lines
}

/**
 * Manual layout computation
 */
export function computeManualLayout(params: ManualLayoutParams): ManualLayoutResult {
  const { elements } = params
  
  // 计算board尺寸
  const boardSize = calculateBoardSizeFromElements(elements)
  
  // 返回结果（暂时不做constraint求解，只计算board大小）
  return {
    elements,
    boardSize,
  }
}
