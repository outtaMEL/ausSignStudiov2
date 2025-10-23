/**
 * D1: Box 定义（h 单位）
 * 所有尺寸和坐标都在抽象的 h 空间中
 */

import { Box } from '../types'

/**
 * 创建一个 Box
 */
export function createBox(w: number, h: number): Box {
  return {
    x: 0,
    y: 0,
    w,
    h,
  }
}

/**
 * 克隆 Box
 */
export function cloneBox(box: Box): Box {
  return { ...box }
}

/**
 * 设置 Box 位置
 */
export function setPosition(box: Box, x: number, y: number): Box {
  return { ...box, x, y }
}

