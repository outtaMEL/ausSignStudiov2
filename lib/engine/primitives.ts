/**
 * D1: 排版原语（h 单位）
 * 纯函数，处理 Box 的堆叠、对齐、测量等操作
 */

import { Box, Alignment } from '../types'
import { cloneBox } from './box'

/**
 * 堆叠结果
 */
export interface StackResult {
  w: number
  h: number
  children: Box[]
}

/**
 * 垂直堆叠子盒子
 */
export function stackV(children: Box[], gap_h: number = 0): StackResult {
  if (!children || children.length === 0) {
    return { w: 0, h: 0, children: [] }
  }

  const positioned: Box[] = []
  let currentY = 0
  let maxW = 0

  for (let i = 0; i < children.length; i++) {
    const child = cloneBox(children[i])
    child.y = currentY
    child.x = 0
    positioned.push(child)

    maxW = Math.max(maxW, child.w)
    currentY += child.h

    if (i < children.length - 1) {
      currentY += gap_h
    }
  }

  return {
    w: maxW,
    h: currentY,
    children: positioned,
  }
}

/**
 * 水平堆叠子盒子
 */
export function stackH(children: Box[], gap_h: number = 0): StackResult {
  if (!children || children.length === 0) {
    return { w: 0, h: 0, children: [] }
  }

  const positioned: Box[] = []
  let currentX = 0
  let maxH = 0

  for (let i = 0; i < children.length; i++) {
    const child = cloneBox(children[i])
    child.x = currentX
    child.y = 0
    positioned.push(child)

    maxH = Math.max(maxH, child.h)
    currentX += child.w

    if (i < children.length - 1) {
      currentX += gap_h
    }
  }

  return {
    w: currentX,
    h: maxH,
    children: positioned,
  }
}

/**
 * 对齐子盒子
 */
export function align(
  child: Box,
  parentSize: { w: number; h: number },
  alignment: Alignment = {}
): Box {
  const aligned = cloneBox(child)
  const { h = 'left', v = 'top' } = alignment

  // 水平对齐
  switch (h) {
    case 'center':
      aligned.x = (parentSize.w - child.w) / 2
      break
    case 'right':
      aligned.x = parentSize.w - child.w
      break
    case 'left':
    default:
      aligned.x = 0
      break
  }

  // 垂直对齐
  switch (v) {
    case 'middle':
      aligned.y = (parentSize.h - child.h) / 2
      break
    case 'bottom':
      aligned.y = parentSize.h - child.h
      break
    case 'baseline':
      // baseline 需要额外信息，这里简化为 bottom
      aligned.y = parentSize.h - child.h
      break
    case 'top':
    default:
      aligned.y = 0
      break
  }

  return aligned
}

/**
 * 居中对齐（快捷方式）
 */
export function center(child: Box, parentSize: { w: number; h: number }): Box {
  return align(child, parentSize, { h: 'center', v: 'middle' })
}

/**
 * 获取多个子盒子的最大宽度
 */
export function maxWidth(children: Box[]): number {
  if (!children || children.length === 0) return 0
  return Math.max(...children.map((c) => c.w))
}

/**
 * 计算多个子盒子垂直堆叠的总高度
 */
export function sumHeights(children: Box[], gap_h: number = 0): number {
  if (!children || children.length === 0) return 0
  const totalHeight = children.reduce((sum, c) => sum + c.h, 0)
  const totalGap = (children.length - 1) * gap_h
  return totalHeight + totalGap
}

/**
 * 计算板面尺寸（内容 + 边距）
 */
export function boardSize(
  contentW: number,
  contentH: number,
  pad_h: number
): { w: number; h: number } {
  return {
    w: contentW + 2 * pad_h,
    h: contentH + 2 * pad_h,
  }
}

/**
 * 像素对齐：h → px 并对齐到整数或 0.5
 */
export function snapToPixel(pxPerH: number, value_h: number): number {
  const px = value_h * pxPerH
  // 对齐到 0.5 像素（避免模糊边缘）
  return Math.round(px * 2) / 2
}

/**
 * 将整个 Box 从 h 空间转换到像素空间
 */
export function boxToPixels(box: Box, pxPerH: number): Box {
  return {
    x: snapToPixel(pxPerH, box.x),
    y: snapToPixel(pxPerH, box.y),
    w: snapToPixel(pxPerH, box.w),
    h: snapToPixel(pxPerH, box.h),
  }
}

/**
 * Board堆叠结果
 */
export interface BoardStackResult {
  board: {
    w: number
    h: number
  }
  items: any[]
  meta: Record<string, any>
}

/**
 * 垂直堆叠多个 board
 */
export function stackBoards(
  boards: BoardStackResult[],
  spacing_h: number = 0,
  equalWidth: boolean = true
): BoardStackResult {
  if (boards.length === 0) {
    throw new Error('stackBoards: boards array is empty')
  }

  if (boards.length === 1) {
    return boards[0]
  }

  // 1. 找出最大宽度
  const maxWidth_h = equalWidth ? Math.max(...boards.map((b) => b.board.w)) : 0

  // 2. 计算总高度和每个 board 的 y 偏移
  let currentY_h = 0
  const positionedBoards: Array<{
    board: { w: number; h: number }
    items: any[]
    offsetX: number
    offsetY: number
    finalWidth: number
  }> = []

  for (const board of boards) {
    const boardWidth = equalWidth ? maxWidth_h : board.board.w

    // 计算水平居中偏移
    const offsetX_h = equalWidth ? (maxWidth_h - board.board.w) / 2 : 0

    positionedBoards.push({
      board: board.board,
      items: board.items,
      offsetX: offsetX_h,
      offsetY: currentY_h,
      finalWidth: boardWidth,
    })

    currentY_h += board.board.h + spacing_h
  }

  // 3. 合并所有 items
  const allItems: any[] = []
  for (const pb of positionedBoards) {
    for (const item of pb.items) {
      allItems.push({
        ...item,
        x: item.x + pb.offsetX,
        y: item.y + pb.offsetY,
      })
    }
  }

  // 4. 计算总 board 尺寸
  const finalWidth = equalWidth ? maxWidth_h : Math.max(...boards.map((b) => b.board.w))
  const finalHeight = currentY_h - spacing_h

  return {
    board: {
      w: finalWidth,
      h: finalHeight,
    },
    items: allItems,
    meta: {
      boardCount: boards.length,
      spacing_h: spacing_h,
      equalWidth: equalWidth,
      individualBoards: positionedBoards.map((pb) => ({
        w: pb.board.w,
        h: pb.board.h,
        offsetX: pb.offsetX,
        offsetY: pb.offsetY,
      })),
    },
  }
}

