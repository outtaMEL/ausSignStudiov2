/**
 * Core type definitions
 */

// ========== Engine Layer Types (D1-D4) ==========

/**
 * Box: Rectangle in h-space
 */
export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Font metrics parameters
 */
export interface FontMetrics {
  avgCharWidthRatio: number  // Average character width ratio
  ascentRatio: number         // Ascent ratio
  descentRatio: number        // Descent ratio
}

/**
 * Icon configuration
 */
export interface IconConfig {
  nativeW: number
  nativeH: number
  baselineAnchor: 'top' | 'middle' | 'bottom'
}

/**
 * Alignment options
 */
export interface Alignment {
  h?: 'left' | 'center' | 'right'
  v?: 'top' | 'middle' | 'bottom' | 'baseline'
}

/**
 * Render item types
 */
export type RenderItem =
  | {
      t: 'text'
      x: number
      y: number
      text: string
      fontSize: number
      fontSeries: string
      ascent_h: number
    }
  | {
      t: 'roadName'
      x: number
      y: number
      w: number
      h: number
      text: string
      fontSize: number
      fontSeries: string
      ascent_h: number
    }
  | {
      t: 'roadNumber'
      x: number
      y: number
      text: string
      fontSize: number
      fontSeries: string
      ascent_h: number
    }
  | {
      t: 'arrow'
      x: number
      y: number
      w: number
      h: number
      iconId: string
      direction: DirectionType
    }
  | {
      t: 'shield'
      x: number
      y: number
      w: number
      h: number
      iconId: string
      label: string
    }

/**
 * Layout model output
 */
export interface LayoutModel {
  board: {
    w: number
    h: number
  }
  items: RenderItem[]
  meta: Record<string, any>
}

// ========== Business Layer Types ==========

/**
 * Direction type
 */
export type DirectionType = 'forward' | 'left' | 'right'

/**
 * Shield type
 */
export type ShieldType = 'shield' | 'number' | 'none'

/**
 * Panel input data
 */
export interface PanelInput {
  roadName: string
  roadNumberType: ShieldType
  roadNumber: string
  shieldLabel: string
  destinations: string[]
  direction: DirectionType
  alignOverride?: {
    centerGroup?: 'left' | 'right' | null
    roadNumber?: 'left' | 'right' | null
    arrow?: 'left' | 'right' | null
  }
}

/**
 * Sign type
 */
export type SignType = 'G1-1' | 'G1-2' | 'G2' | 'G3'

/**
 * Template parameters
 */
export interface TemplateParams {
  // 基本间距
  letter_height_h: number
  line_spacing_h: number
  group_spacing_h: number
  board_pad_h: number
  panel_spacing_h: number
  corner_radius_h: number
  border_h: number

  // Road Name样式
  roadName_letter_height_h: number
  roadName_bg_color: string
  roadName_text_color: string
  roadName_pad_h: number
  roadName_corner_radius_h: number

  // Road Number样式
  roadNumber_letter_height_h: number
  roadNumber_bg_color: string
  roadNumber_text_color: string
  roadNumber_pad_h: number
  roadNumber_corner_radius_h: number

  // 字体
  font_series: string
}

/**
 * Engine parameters
 */
export interface EngineParams {
  pxPerH: number
  snapMode: 'none' | 'round' | 'half-pixel'
}

// ========== Manual Mode Types ==========

/**
 * Element types in manual mode
 */
export type ElementType = 'text' | 'roadName' | 'roadNumber' | 'shield' | 'arrow' | 'composite' | 'board'

/**
 * Element configuration
 */
export interface ElementConfig {
  text?: string
  fontSeries?: string
  letter_h?: number
  pad_h?: number
  iconId?: string
  label?: string
  direction?: 'left' | 'right' | 'forward'
}

/**
 * Staged element (waiting to be placed)
 */
export interface StagedElement {
  id: string
  type: ElementType
  config: ElementConfig
  preview: {
    x: number
    y: number
    w: number
    h: number
  }
}

/**
 * Placed element on canvas
 */
export interface PlacedElement {
  id: string
  type: ElementType
  config: ElementConfig
  box: {
    x: number
    y: number
    w: number
    h: number
  }
  groupId?: string
}

/**
 * Manual layout data
 */
export interface ManualLayoutData {
  staged: StagedElement[]
  placed: PlacedElement[]
  boardSize: { w: number; h: number }
  alignmentConstraints?: AlignmentConstraint[]
}

/**
 * Alignment constraint
 */
export interface AlignmentConstraint {
  sourceId: string
  targetId: string
  type: 'align-left' | 'align-right' | 'align-center' | 'align-top' | 'align-bottom' | 'align-middle'
}

/**
 * Alignment point type
 */
export type AlignmentPoint = 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle'

/**
 * Sign document
 */
export interface SignDocument {
  id: string
  name: string
  signType: SignType
  mode?: 'quick' | 'manual'
  panels: PanelInput[]
  template: TemplateParams
  engine: EngineParams
  manualData?: ManualLayoutData
  createdAt: string
  updatedAt: string
}

/**
 * Layout input parameters
 */
export interface LayoutParams {
  input: {
    panels: PanelInput[]
  }
  template: TemplateParams
  pxPerH: number
  fontMetrics: FontMetrics
  iconConfig?: Record<string, IconConfig>
}

/**
 * SVG export options
 */
export interface SVGExportOptions {
  includeGuides?: boolean
  includeGrid?: boolean
  backgroundColor?: string
  format?: 'svg' | 'png' | 'pdf'
}

