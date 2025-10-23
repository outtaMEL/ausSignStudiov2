/**
 * D3: 布局引擎 - 统一的布局接口
 */

import { LayoutModel, LayoutParams, PanelInput, TemplateParams, FontMetrics, RenderItem } from '../types'
import { toBoxText, toBoxIcon, toBoxRoadName, toBoxRoadNumber } from './converter'
import { stackV, boardSize, stackBoards, BoardStackResult } from './primitives'
import { cloneBox } from './box'
import type { TextBox, IconBox, RoadNameBox, RoadNumberBox } from './converter'

/**
 * 获取箭头图标 ID
 */
function getArrowIconId(direction: string): string {
  switch (direction) {
    case 'forward':
      return 'arrow-forward-std'
    case 'left':
      return 'arrow-left-std'
    case 'right':
      return 'arrow-right-std'
    default:
      return 'arrow-right-std'
  }
}

/**
 * 行元素
 */
interface RowElement {
  type: 'roadName' | 'destinations' | 'arrow' | 'shield' | 'roadNumber'
  box: any
  data: any
}

/**
 * 布局行
 */
interface LayoutRow {
  type: 'roadName' | 'main'
  elements: RowElement[]
  totalWidth: number
  height: number
  align: 'left' | 'center' | 'right'
  y?: number
}

/**
 * Panel布局结果
 */
interface PanelLayout {
  board: { w: number; h: number }
  rows: LayoutRow[]
  maxRowWidth: number
  direction: string
}

/**
 * 布局单个 Panel
 */
function layoutSinglePanel(
  panelInput: PanelInput,
  template: TemplateParams,
  fontMetrics: FontMetrics
): PanelLayout {
  const {
    roadName,
    roadNumberType,
    roadNumber,
    shieldLabel,
    destinations,
    direction,
  } = panelInput

  const {
    font_series,
    letter_height_h,
    line_spacing_h,
    group_spacing_h,
    board_pad_h,
    roadName_letter_height_h,
    roadName_pad_h,
    roadNumber_letter_height_h,
  } = template

  const rows: LayoutRow[] = []

  // 1. Road Name Row
  if (roadName && roadName.trim() !== '') {
    const roadNameBox = toBoxRoadName(roadName, {
      letter_h: roadName_letter_height_h,
      pad_h: roadName_pad_h,
      fontMetrics: fontMetrics,
    })

    rows.push({
      type: 'roadName',
      elements: [{ type: 'roadName', box: roadNameBox, data: { text: roadName } }],
      totalWidth: roadNameBox.w,
      height: roadNameBox.h,
      align: 'center',
    })
  }

  // 2. Destinations
  const validDestinations = destinations.filter((d) => d && d.trim() !== '')

  if (validDestinations.length === 0) {
    throw new Error('At least one destination is required')
  }

  const destBoxes = validDestinations.map((dest) =>
    toBoxText(dest, {
      fontSeries: font_series,
      letter_h: letter_height_h,
      fontMetrics: fontMetrics,
    })
  )

  const destGroup = stackV(destBoxes, line_spacing_h)
  destGroup.children.forEach((child, i) => {
    ;(child as any).text = validDestinations[i]
    ;(child as any).ascent_h = destBoxes[i].ascent_h
  })

  // 3. Road Number or Shield
  let roadNumBox: RoadNumberBox | IconBox | null = null
  let roadNumType: string | null = null

  if (roadNumberType === 'number' && roadNumber && roadNumber.trim() !== '') {
    roadNumBox = toBoxRoadNumber(roadNumber, {
      letter_h: roadNumber_letter_height_h,
      fontMetrics: fontMetrics,
    })
    roadNumType = 'roadNumber'
  } else if (roadNumberType === 'shield' && shieldLabel && shieldLabel.trim() !== '') {
    roadNumBox = toBoxIcon('shield-route', {
      line_h: letter_height_h,
      label: shieldLabel,
      fontMetrics: fontMetrics,
    })
    roadNumType = 'shield'
  }

  // 4. 箭头
  const arrowIconId = getArrowIconId(direction)
  const arrowBox = toBoxIcon(arrowIconId, {
    line_h: letter_height_h,
  })

  // 5. 构建主行
  const mainRowElements: RowElement[] = []

  if (direction === 'forward' || direction === 'left') {
    mainRowElements.push({
      type: 'arrow',
      box: cloneBox(arrowBox),
      data: { iconId: arrowIconId, direction },
    })

    if (roadNumBox) {
      mainRowElements.push({
        type: roadNumType as any,
        box: cloneBox(roadNumBox),
        data:
          roadNumType === 'shield'
            ? { shieldLabel: shieldLabel }
            : { text: roadNumber, ascent_h: roadNumBox.ascent_h },
      })
    }

    mainRowElements.push({
      type: 'destinations',
      box: destGroup,
      data: destGroup,
    })
  } else {
    mainRowElements.push({
      type: 'destinations',
      box: destGroup,
      data: destGroup,
    })

    if (roadNumBox) {
      mainRowElements.push({
        type: roadNumType as any,
        box: cloneBox(roadNumBox),
        data:
          roadNumType === 'shield'
            ? { shieldLabel: shieldLabel }
            : { text: roadNumber, ascent_h: roadNumBox.ascent_h },
      })
    }

    mainRowElements.push({
      type: 'arrow',
      box: cloneBox(arrowBox),
      data: { iconId: arrowIconId, direction },
    })
  }

  let mainRowWidth = 0
  for (let i = 0; i < mainRowElements.length; i++) {
    mainRowWidth += mainRowElements[i].box.w
    if (i < mainRowElements.length - 1) {
      mainRowWidth += group_spacing_h
    }
  }

  const mainRowHeight = Math.max(...mainRowElements.map((el) => el.box.h))

  let defaultAlign: 'left' | 'center' | 'right' = 'center'
  if (direction === 'left') defaultAlign = 'left'
  if (direction === 'right') defaultAlign = 'right'

  rows.push({
    type: 'main',
    elements: mainRowElements,
    totalWidth: mainRowWidth,
    height: mainRowHeight,
    align: defaultAlign,
  })

  // 6. 计算布局
  const maxRowWidth = Math.max(...rows.map((r) => r.totalWidth))

  let currentY_h = 0
  const positionedRows: LayoutRow[] = []

  for (const row of rows) {
    positionedRows.push({
      ...row,
      y: currentY_h,
    })

    currentY_h += row.height
    if (positionedRows.length < rows.length) {
      currentY_h += line_spacing_h
    }
  }

  const contentH = currentY_h
  const panelBoard = boardSize(maxRowWidth, contentH, board_pad_h)

  return {
    board: panelBoard,
    rows: positionedRows,
    maxRowWidth: maxRowWidth,
    direction: direction,
  }
}

/**
 * 应用对齐并生成 items
 */
function applyAlignmentAndGenerateItems(
  panelLayout: PanelLayout,
  boardWidth_h: number,
  isDominant: boolean,
  template: TemplateParams
): RenderItem[] {
  const { rows, direction } = panelLayout

  const {
    font_series,
    letter_height_h,
    group_spacing_h,
    board_pad_h,
    roadName_letter_height_h,
    roadNumber_letter_height_h,
  } = template

  const items: RenderItem[] = []
  const contentAreaWidth_h = boardWidth_h - 2 * board_pad_h

  for (const row of rows) {
    const { elements, totalWidth, height, align, y = 0 } = row

    let rowStartX_h = 0

    if (isDominant || align === 'left') {
      rowStartX_h = 0
    } else if (align === 'right') {
      rowStartX_h = contentAreaWidth_h - totalWidth
    } else if (align === 'center') {
      rowStartX_h = (contentAreaWidth_h - totalWidth) / 2
    }

    let currentX_h = rowStartX_h

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i]
      const offsetX = board_pad_h + currentX_h
      const offsetY = board_pad_h + y
      const elY = offsetY + (height - el.box.h) / 2

      if (el.type === 'roadName') {
        items.push({
          t: 'roadName',
          x: offsetX,
          y: offsetY,
          w: el.box.w,
          h: el.box.h,
          text: el.data.text,
          fontSize: roadName_letter_height_h,
          fontSeries: font_series,
          ascent_h: el.box.ascent_h,
        })
      } else if (el.type === 'destinations') {
        for (const child of el.box.children) {
          items.push({
            t: 'text',
            x: offsetX + child.x,
            y: elY + child.y + (child as any).ascent_h,
            text: (child as any).text,
            fontSize: letter_height_h,
            fontSeries: font_series,
            ascent_h: (child as any).ascent_h,
          })
        }
      } else if (el.type === 'arrow') {
        items.push({
          t: 'arrow',
          x: offsetX,
          y: elY,
          w: el.box.w,
          h: el.box.h,
          iconId: el.data.iconId,
          direction: el.data.direction,
        })
      } else if (el.type === 'shield') {
        items.push({
          t: 'shield',
          x: offsetX,
          y: elY,
          w: el.box.w,
          h: el.box.h,
          iconId: 'shield-route',
          label: el.data.shieldLabel,
        })
      } else if (el.type === 'roadNumber') {
        items.push({
          t: 'roadNumber',
          x: offsetX,
          y: elY + el.data.ascent_h,
          text: el.data.text,
          fontSize: roadNumber_letter_height_h,
          fontSeries: font_series,
          ascent_h: el.data.ascent_h,
        })
      }

      currentX_h += el.box.w
      if (i < elements.length - 1) {
        currentX_h += group_spacing_h
      }
    }
  }

  return items
}

/**
 * 执行G1-1布局（2个panel）
 */
export function layoutG11(params: LayoutParams): LayoutModel {
  const { input, template, pxPerH, fontMetrics } = params

  if (!input.panels || input.panels.length < 2) {
    throw new Error('G1-1 requires at least 2 panels')
  }

  const panelLayouts = [
    layoutSinglePanel(input.panels[0], template, fontMetrics),
    layoutSinglePanel(input.panels[1], template, fontMetrics),
  ]

  const widths = panelLayouts.map((p) => p.board.w)
  const maxWidth = Math.max(...widths)
  const dominantIndex = widths.indexOf(maxWidth)

  const panelsWithItems = panelLayouts.map((layout, index) => {
    const isDominant = index === dominantIndex
    const items = applyAlignmentAndGenerateItems(layout, maxWidth, isDominant, template)

    return {
      board: { w: maxWidth, h: layout.board.h },
      items: items,
    }
  })

  const panelSpacing_h = template.panel_spacing_h ?? 0.3
  const stacked = stackBoards(panelsWithItems as BoardStackResult[], panelSpacing_h, true)

  const boardPx = {
    w: stacked.board.w * pxPerH,
    h: stacked.board.h * pxPerH,
  }

  const itemsPx = stacked.items.map((item: any) => {
    const itemPx: any = {
      ...item,
      x: item.x * pxPerH,
      y: item.y * pxPerH,
    }

    if (item.w !== undefined) itemPx.w = item.w * pxPerH
    if (item.h !== undefined) itemPx.h = item.h * pxPerH
    if (item.fontSize !== undefined) itemPx.fontSize = item.fontSize * pxPerH

    return itemPx
  })

  return {
    board: boardPx,
    items: itemsPx,
    meta: {
      signType: 'G1-1',
      panelCount: 2,
      dominantPanelIndex: dominantIndex,
      panel_spacing_h: panelSpacing_h,
      panel_spacing_px: panelSpacing_h * pxPerH,
      letter_height_h: template.letter_height_h,
      letter_height_px: template.letter_height_h * pxPerH,
      board_w_h: stacked.board.w,
      board_h_h: stacked.board.h,
      board_w_px: boardPx.w,
      board_h_px: boardPx.h,
      pxPerH,
      ...stacked.meta,
    },
  }
}

/**
 * 执行G1-2布局（3个panel）
 */
export function layoutG12(params: LayoutParams): LayoutModel {
  const { input, template, pxPerH, fontMetrics } = params

  if (!input.panels || input.panels.length < 3) {
    throw new Error('G1-2 requires at least 3 panels')
  }

  const panelLayouts = [
    layoutSinglePanel(input.panels[0], template, fontMetrics),
    layoutSinglePanel(input.panels[1], template, fontMetrics),
    layoutSinglePanel(input.panels[2], template, fontMetrics),
  ]

  const widths = panelLayouts.map((p) => p.board.w)
  const maxWidth = Math.max(...widths)
  const dominantIndex = widths.indexOf(maxWidth)

  const panelsWithItems = panelLayouts.map((layout, index) => {
    const isDominant = index === dominantIndex
    const items = applyAlignmentAndGenerateItems(layout, maxWidth, isDominant, template)

    return {
      board: { w: maxWidth, h: layout.board.h },
      items: items,
    }
  })

  const panelSpacing_h = template.panel_spacing_h ?? 0.3
  const stacked = stackBoards(panelsWithItems as BoardStackResult[], panelSpacing_h, true)

  const boardPx = {
    w: stacked.board.w * pxPerH,
    h: stacked.board.h * pxPerH,
  }

  const itemsPx = stacked.items.map((item: any) => {
    const itemPx: any = {
      ...item,
      x: item.x * pxPerH,
      y: item.y * pxPerH,
    }

    if (item.w !== undefined) itemPx.w = item.w * pxPerH
    if (item.h !== undefined) itemPx.h = item.h * pxPerH
    if (item.fontSize !== undefined) itemPx.fontSize = item.fontSize * pxPerH

    return itemPx
  })

  return {
    board: boardPx,
    items: itemsPx,
    meta: {
      signType: 'G1-2',
      panelCount: 3,
      dominantPanelIndex: dominantIndex,
      panel_spacing_h: panelSpacing_h,
      panel_spacing_px: panelSpacing_h * pxPerH,
      letter_height_h: template.letter_height_h,
      letter_height_px: template.letter_height_h * pxPerH,
      board_w_h: stacked.board.w,
      board_h_h: stacked.board.h,
      board_w_px: boardPx.w,
      board_h_px: boardPx.h,
      pxPerH,
      ...stacked.meta,
    },
  }
}

/**
 * 主布局函数 - 根据signType选择对应的布局引擎
 */
export function computeLayout(params: LayoutParams): LayoutModel {
  // 从input中提取signType，如果没有则从panels数量推断
  const panelCount = params.input.panels.length
  
  if (panelCount === 2) {
    return layoutG11(params)
  } else if (panelCount === 3) {
    return layoutG12(params)
  } else {
    throw new Error(`Unsupported panel count: ${panelCount}`)
  }
}

