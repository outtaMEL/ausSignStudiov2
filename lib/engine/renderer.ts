/**
 * D4: SVG 渲染器
 * 将布局模型渲染为 SVG 字符串
 */

import { LayoutModel, RenderItem, SVGExportOptions } from '../types'

/**
 * 转义 XML 特殊字符
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 渲染箭头图标
 */
function renderArrow(item: Extract<RenderItem, { t: 'arrow' }>): string {
  const { x, y, w, h, direction = 'right' } = item

  let arrow = `  <g id="arrow">\n`

  if (direction === 'left') {
    // 左箭头
    const headWidth = w * 0.4
    const headHeight = h * 0.8
    const headY = y + (h - headHeight) / 2

    const bodyWidth = w * 0.6
    const bodyHeight = h * 0.3
    const bodyX = x + headWidth
    const bodyY = y + (h - bodyHeight) / 2

    const tipX = x
    const tipY = y + h / 2
    const topX = x + headWidth
    const topY = headY
    const bottomX = x + headWidth
    const bottomY = headY + headHeight

    arrow += `    <polygon points="${tipX},${tipY} ${topX},${topY} ${bottomX},${bottomY}" fill="white" />\n`
    arrow += `    <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" fill="white" />\n`
  } else if (direction === 'forward') {
    // 向上箭头
    const headWidth = w * 0.8
    const headHeight = h * 0.4
    const headX = x + (w - headWidth) / 2

    const bodyWidth = w * 0.3
    const bodyHeight = h * 0.6
    const bodyX = x + (w - bodyWidth) / 2
    const bodyY = y + headHeight

    const tipX = x + w / 2
    const tipY = y
    const leftX = headX
    const leftY = y + headHeight
    const rightX = headX + headWidth
    const rightY = y + headHeight

    arrow += `    <polygon points="${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}" fill="white" />\n`
    arrow += `    <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" fill="white" />\n`
  } else {
    // 右箭头（默认）
    const bodyWidth = w * 0.6
    const bodyHeight = h * 0.3
    const bodyY = y + (h - bodyHeight) / 2

    const headWidth = w * 0.4
    const headHeight = h * 0.8
    const headY = y + (h - headHeight) / 2
    const headX = x + bodyWidth

    arrow += `    <rect x="${x}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" fill="white" />\n`

    const tipX = headX + headWidth
    const tipY = y + h / 2
    const topX = headX
    const topY = headY
    const bottomX = headX
    const bottomY = headY + headHeight

    arrow += `    <polygon points="${tipX},${tipY} ${topX},${topY} ${bottomX},${bottomY}" fill="white" />\n`
  }

  arrow += `  </g>\n`

  return arrow
}

/**
 * 渲染路盾
 */
function renderShield(item: Extract<RenderItem, { t: 'shield' }>): string {
  const { x, y, w, h, label } = item

  let shield = `  <g id="shield">\n`

  // 背景矩形
  shield += `    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" rx="4" />\n`

  // 文字
  const fontSize = h * 0.4
  const textY = y + h / 2 + fontSize / 3

  shield += `    <text x="${x + w / 2}" y="${textY}" font-size="${fontSize}" font-family="Arial, sans-serif" fill="black" font-weight="bold" text-anchor="middle">${escapeXml(label)}</text>\n`

  shield += `  </g>\n`

  return shield
}

/**
 * 渲染Road Name
 */
function renderRoadName(item: Extract<RenderItem, { t: 'roadName' }>): string {
  const { x, y, w, h, text, fontSize } = item

  let roadName = `  <g id="roadName">\n`

  // 背景矩形
  roadName += `    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" rx="4" />\n`

  // 文字（居中）
  const textY = y + h / 2 + fontSize / 3

  roadName += `    <text x="${x + w / 2}" y="${textY}" font-size="${fontSize}" font-family="Arial, sans-serif" fill="black" font-weight="bold" text-anchor="middle">${escapeXml(text)}</text>\n`

  roadName += `  </g>\n`

  return roadName
}

/**
 * 渲染Road Number
 */
function renderRoadNumber(item: Extract<RenderItem, { t: 'roadNumber' }>): string {
  const { x, y, text, fontSize } = item

  return `  <text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, sans-serif" fill="#FFD700" font-weight="bold">${escapeXml(text)}</text>\n`
}

/**
 * 渲染文字
 */
function renderText(item: Extract<RenderItem, { t: 'text' }>): string {
  const { x, y, text, fontSize } = item

  return `  <text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, sans-serif" fill="white" font-weight="bold">${escapeXml(text)}</text>\n`
}

/**
 * 生成 SVG 字符串
 */
export function toSVG(model: LayoutModel, options: SVGExportOptions = {}): string {
  const { board, items } = model
  const { backgroundColor = '#0B6B4D', includeGuides = false, includeGrid = false } = options

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${board.w}" height="${board.h}" viewBox="0 0 ${board.w} ${board.h}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="${board.w}" height="${board.h}" fill="${backgroundColor}" rx="8" />
  
`

  // 渲染网格（如果需要）
  if (includeGrid) {
    svg += `  <!-- Grid -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
`
  }

  // 渲染每个元素
  for (const item of items) {
    switch (item.t) {
      case 'text':
        svg += renderText(item)
        break
      case 'arrow':
        svg += renderArrow(item)
        break
      case 'shield':
        svg += renderShield(item)
        break
      case 'roadName':
        svg += renderRoadName(item)
        break
      case 'roadNumber':
        svg += renderRoadNumber(item)
        break
    }
  }

  // 渲染参考线（如果需要）
  if (includeGuides && model.meta) {
    svg += `  <!-- Guides -->
`
    // 添加参考线渲染逻辑
  }

  svg += `</svg>`

  return svg
}

/**
 * 生成SVG数据URL
 */
export function toDataURL(model: LayoutModel, options: SVGExportOptions = {}): string {
  const svgString = toSVG(model, options)
  const encoded = encodeURIComponent(svgString)
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

/**
 * 触发SVG下载
 */
export function downloadSVG(model: LayoutModel, filename: string = 'sign.svg', options: SVGExportOptions = {}): void {
  const svgString = toSVG(model, options)
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

