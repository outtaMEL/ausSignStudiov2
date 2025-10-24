/**
 * Default configuration and presets
 */

import { TemplateParams, EngineParams, FontMetrics, PanelInput } from './types'

/**
 * Default font metrics
 */
export const DEFAULT_FONT_METRICS: FontMetrics = {
  avgCharWidthRatio: 0.6,
  ascentRatio: 0.75,
  descentRatio: 0.25,
}

/**
 * Default template parameters
 */
export const DEFAULT_TEMPLATE: TemplateParams = {
  // 基本间距 (符合AS 1742.6标准, 1h=100mm)
  letter_height_h: 1.6,        // 160mm
  line_spacing_h: 0.15,        // 15mm
  group_spacing_h: 0.2,        // 20mm
  board_pad_h: 0.2,            // 20mm
  panel_spacing_h: 0.06,       // 6mm
  corner_radius_h: 0.1,        // 10mm
  border_h: 0.04,              // 4mm

  // Road Name样式
  roadName_letter_height_h: 1.2,  // 120mm
  roadName_bg_color: '#ffffff',
  roadName_text_color: '#000000',
  roadName_pad_h: 0.1,            // 10mm
  roadName_corner_radius_h: 0.06, // 6mm

  // Road Number样式
  roadNumber_letter_height_h: 1.6, // 160mm
  roadNumber_bg_color: '#ffd700',
  roadNumber_text_color: '#000000',
  roadNumber_pad_h: 0.06,          // 6mm
  roadNumber_corner_radius_h: 0.04,// 4mm

  // 字体
  font_series: 'E',
}

/**
 * Default engine parameters
 */
export const DEFAULT_ENGINE: EngineParams = {
  pxPerH: 100,  // 统一使用100
  snapMode: 'round',
}

/**
 * Empty panel (with example data for preview)
 */
export const EMPTY_PANEL: PanelInput = {
  roadName: 'EXAMPLE RD',
  roadNumberType: 'none',
  roadNumber: '',
  shieldLabel: '',
  destinations: ['Example Destination'],
  direction: 'right',
  alignOverride: {
    centerGroup: null,
    roadNumber: null,
    arrow: null,
  },
}

/**
 * Default panels for G1-1 (matching old project)
 */
export const DEFAULT_G11_PANELS: PanelInput[] = [
  {
    roadName: 'SALTASH HWY',
    roadNumberType: 'shield',
    roadNumber: '',
    shieldLabel: 'M1',
    destinations: ['Plumpton'],
    direction: 'left',
    alignOverride: {
      centerGroup: null,
      roadNumber: null,
      arrow: null,
    },
  },
  {
    roadName: '',
    roadNumberType: 'number',
    roadNumber: 'A85',
    shieldLabel: '',
    destinations: ['Hawker'],
    direction: 'right',
    alignOverride: {
      centerGroup: null,
      roadNumber: null,
      arrow: null,
    },
  },
]

/**
 * Default panels for G1-2 (matching old project)
 */
export const DEFAULT_G12_PANELS: PanelInput[] = [
  {
    roadName: 'WESTERN HWY',
    roadNumberType: 'shield',
    roadNumber: '',
    shieldLabel: 'M8',
    destinations: ['Melbourne', 'City Centre'],
    direction: 'left',
    alignOverride: {
      centerGroup: null,
      roadNumber: null,
      arrow: null,
    },
  },
  {
    roadName: '',
    roadNumberType: 'none',
    roadNumber: '',
    shieldLabel: '',
    destinations: ['Airport'],
    direction: 'forward',
    alignOverride: {
      centerGroup: null,
      roadNumber: null,
      arrow: null,
    },
  },
  {
    roadName: '',
    roadNumberType: 'number',
    roadNumber: 'A1',
    shieldLabel: '',
    destinations: ['Sydney'],
    direction: 'right',
    alignOverride: {
      centerGroup: null,
      roadNumber: null,
      arrow: null,
    },
  },
]

/**
 * Template presets
 */
export const TEMPLATE_PRESETS: Record<string, Partial<TemplateParams>> = {
  standard: {
    letter_height_h: 8,
    line_spacing_h: 0.75,
    group_spacing_h: 1.0,
    board_pad_h: 1.0,
  },
  compact: {
    letter_height_h: 7,
    line_spacing_h: 0.5,
    group_spacing_h: 0.75,
    board_pad_h: 0.75,
  },
  spacious: {
    letter_height_h: 10,
    line_spacing_h: 1.0,
    group_spacing_h: 1.5,
    board_pad_h: 1.5,
  },
}

/**
 * Example panel configurations (for reference, use DEFAULT_G11_PANELS/DEFAULT_G12_PANELS)
 */
export const EXAMPLE_PANELS: Record<string, PanelInput[]> = {
  'g1-1-example': DEFAULT_G11_PANELS,
  'g1-2-example': DEFAULT_G12_PANELS,
}

/**
 * Color presets
 */
export const COLOR_PRESETS = {
  signGreen: '#0B6B4D',
  signWhite: '#FFFFFF',
  signYellow: '#FFD700',
  signBlack: '#000000',
  signBlue: '#0066CC',
  signBrown: '#654321',
}

/**
 * Common pxPerH values
 */
export const PX_PER_H_PRESETS = [20, 25, 30, 35, 40, 50]

/**
 * Get default document name
 */
export function getDefaultDocumentName(signType: string): string {
  const date = new Date().toLocaleDateString('en-AU')
  return `${signType}-${date}`
}
