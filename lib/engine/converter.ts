/**
 * D2: 几何转换器
 * 将文字和图标转换为 h 空间的 Box
 */

import { Box, FontMetrics, IconConfig } from '../types'
import { createBox } from './box'

// 默认字体数据
const DEFAULT_FONTS: Record<string, FontMetrics> = {
  E: {
    avgCharWidthRatio: 0.6,
    ascentRatio: 0.75,
    descentRatio: 0.25,
  },
}

// 默认图标数据
const DEFAULT_ICONS: Record<string, IconConfig> = {
  'arrow-right-std': {
    nativeW: 100,
    nativeH: 80,
    baselineAnchor: 'middle',
  },
  'arrow-left-std': {
    nativeW: 100,
    nativeH: 80,
    baselineAnchor: 'middle',
  },
  'arrow-forward-std': {
    nativeW: 80,
    nativeH: 100,
    baselineAnchor: 'middle',
  },
  'shield-route': {
    nativeW: 80,
    nativeH: 100,
    baselineAnchor: 'middle',
  },
  'shield-freeway': {
    nativeW: 80,
    nativeH: 100,
    baselineAnchor: 'middle',
  },
}

/**
 * 扩展的Box类型（包含文字元数据）
 */
export interface TextBox extends Box {
  type: 'text'
  text: string
  fontSeries: string
  letter_h: number
  ascent_h: number
  descent_h: number
}

/**
 * 扩展的Box类型（包含图标元数据）
 */
export interface IconBox extends Box {
  type: 'icon'
  iconId: string
  baselineOffset_h: number
  label?: string
}

/**
 * 扩展的Box类型（包含Road Name元数据）
 */
export interface RoadNameBox extends Box {
  type: 'roadName'
  text: string
  letter_h: number
  pad_h: number
  textWidth_h: number
  textHeight_h: number
  ascent_h: number
  descent_h: number
}

/**
 * 扩展的Box类型（包含Road Number元数据）
 */
export interface RoadNumberBox extends Box {
  type: 'roadNumber'
  text: string
  letter_h: number
  textWidth_h: number
  textHeight_h: number
  ascent_h: number
  descent_h: number
}

/**
 * 测量文字尺寸
 */
export function measureText(
  text: string,
  fontSeries: string,
  letter_h: number
): {
  width_h: number
  ascent_h: number
  descent_h: number
  height_h: number
} {
  const font = DEFAULT_FONTS[fontSeries]
  if (!font) {
    throw new Error(`Font series "${fontSeries}" not found`)
  }

  const width_h = text.length * letter_h * font.avgCharWidthRatio
  const ascent_h = letter_h * font.ascentRatio
  const descent_h = letter_h * font.descentRatio
  const height_h = letter_h

  return {
    width_h,
    ascent_h,
    descent_h,
    height_h,
  }
}

/**
 * 测量图标尺寸
 */
export function measureIcon(
  iconId: string,
  line_h: number
): {
  width_h: number
  height_h: number
  baselineOffset_h: number
} {
  const icon = DEFAULT_ICONS[iconId]
  if (!icon) {
    throw new Error(`Icon "${iconId}" not found`)
  }

  const height_h = line_h
  const width_h = (icon.nativeW / icon.nativeH) * height_h

  let baselineOffset_h = 0
  if (icon.baselineAnchor === 'middle') {
    baselineOffset_h = height_h / 2
  }

  return {
    width_h,
    height_h,
    baselineOffset_h,
  }
}

/**
 * 将文字转换为 Box
 */
export function toBoxText(
  text: string,
  options: {
    fontSeries: string
    letter_h: number
    fontMetrics?: FontMetrics
  }
): TextBox {
  const { fontSeries, letter_h, fontMetrics } = options

  const defaultFont = DEFAULT_FONTS[fontSeries]
  if (!defaultFont) {
    throw new Error(`Font series "${fontSeries}" not found`)
  }

  const finalMetrics = fontMetrics ? { ...defaultFont, ...fontMetrics } : defaultFont

  const width_h = text.length * letter_h * finalMetrics.avgCharWidthRatio
  const ascent_h = letter_h * finalMetrics.ascentRatio
  const descent_h = letter_h * finalMetrics.descentRatio
  const height_h = letter_h

  const box = createBox(width_h, height_h)

  return {
    ...box,
    type: 'text',
    text,
    fontSeries,
    letter_h,
    ascent_h,
    descent_h,
  }
}

/**
 * 将图标转换为 Box
 */
export function toBoxIcon(
  iconId: string,
  options: {
    line_h: number
    label?: string
    fontMetrics?: FontMetrics
  }
): IconBox {
  const { line_h, label, fontMetrics } = options

  const icon = DEFAULT_ICONS[iconId]
  if (!icon) {
    throw new Error(`Icon "${iconId}" not found`)
  }

  const height_h = line_h
  let width_h = (icon.nativeW / icon.nativeH) * height_h

  // 如果是 shield 且有 label，根据文字宽度调整
  if (iconId.includes('shield') && label && fontMetrics) {
    const labelLetterH = line_h * 0.6
    const defaultFont = DEFAULT_FONTS['E']
    const finalMetrics = fontMetrics || defaultFont

    const labelWidth = label.length * labelLetterH * finalMetrics.avgCharWidthRatio
    const padding = line_h * 0.4
    const minWidth = labelWidth + padding

    width_h = Math.max(width_h, minWidth)
  }

  let baselineOffset_h = 0
  if (icon.baselineAnchor === 'middle') {
    baselineOffset_h = height_h / 2
  }

  const box = createBox(width_h, height_h)

  return {
    ...box,
    type: 'icon',
    iconId,
    baselineOffset_h,
    label,
  }
}

/**
 * 将 Road Name 转换为 Box
 */
export function toBoxRoadName(
  text: string,
  options: {
    letter_h: number
    pad_h: number
    fontMetrics?: FontMetrics
  }
): RoadNameBox {
  const { letter_h, pad_h, fontMetrics } = options

  const defaultFont = DEFAULT_FONTS['E']
  const finalMetrics = fontMetrics ? { ...defaultFont, ...fontMetrics } : defaultFont

  const textWidth_h = text.length * letter_h * finalMetrics.avgCharWidthRatio * 1.1
  const textHeight_h = letter_h

  const width_h = textWidth_h + 2.5 * pad_h
  const height_h = textHeight_h + 2 * pad_h

  const box = createBox(width_h, height_h)

  return {
    ...box,
    type: 'roadName',
    text,
    letter_h,
    pad_h,
    textWidth_h,
    textHeight_h,
    ascent_h: letter_h * finalMetrics.ascentRatio,
    descent_h: letter_h * finalMetrics.descentRatio,
  }
}

/**
 * 将 Road Number 转换为 Box
 */
export function toBoxRoadNumber(
  text: string,
  options: {
    letter_h: number
    fontMetrics?: FontMetrics
  }
): RoadNumberBox {
  const { letter_h, fontMetrics } = options

  const defaultFont = DEFAULT_FONTS['E']
  const finalMetrics = fontMetrics ? { ...defaultFont, ...fontMetrics } : defaultFont

  const width_h = text.length * letter_h * finalMetrics.avgCharWidthRatio
  const height_h = letter_h

  const box = createBox(width_h, height_h)

  return {
    ...box,
    type: 'roadNumber',
    text,
    letter_h,
    textWidth_h: width_h,
    textHeight_h: height_h,
    ascent_h: letter_h * finalMetrics.ascentRatio,
    descent_h: letter_h * finalMetrics.descentRatio,
  }
}

export { DEFAULT_FONTS as fonts, DEFAULT_ICONS as icons }

