/**
 * 全局状态管理 - Zustand Store
 */

import { create } from 'zustand'
import { 
  SignDocument, 
  PanelInput, 
  TemplateParams, 
  EngineParams, 
  LayoutModel,
  ManualLayoutData,
  StagedElement,
  PlacedElement,
  ElementConfig,
  ElementType,
  AlignmentConstraint,
} from '@/lib/types'
import { DEFAULT_TEMPLATE, DEFAULT_ENGINE, DEFAULT_G11_PANELS, DEFAULT_G12_PANELS, EMPTY_PANEL, getDefaultDocumentName } from '@/lib/defaults'
import { computeLayout, computeManualLayout } from '@/lib/engine'
import { generateId, deepClone } from '@/lib/utils'

/**
 * Store State
 */
interface SignStore {
  // 当前文档
  currentDocument: SignDocument | null
  
  // 布局模型（缓存）
  currentLayout: LayoutModel | null
  
  // 最近的文档列表
  recentDocuments: Array<{
    id: string
    name: string
    signType: string
    thumbnail?: string
    updatedAt: string
  }>
  
  // UI状态
  ui: {
    sidebarOpen: boolean
    activeTab: 'properties' | 'template' | 'engine'
    previewScale: number
    showGrid: boolean
    showGuides: boolean
  }
  
  // Actions
  actions: {
    // 文档操作
    createDocument: (signType: 'G1-1' | 'G1-2' | 'G2' | 'G3', name?: string, mode?: 'quick' | 'manual') => void
    loadDocument: (doc: SignDocument) => void
    updateDocument: (updates: Partial<SignDocument>) => void
    saveDocument: () => void
    deleteDocument: (id: string) => void
    
    // Panel操作
    updatePanel: (index: number, updates: Partial<PanelInput>) => void
    addPanel: () => void
    removePanel: (index: number) => void
    movePanelUp: (index: number) => void
    movePanelDown: (index: number) => void
    
    // 模板操作
    updateTemplate: (updates: Partial<TemplateParams>) => void
    resetTemplate: () => void
    
    // 引擎操作
    updateEngine: (updates: Partial<EngineParams>) => void
    resetEngine: () => void
    
    // 布局操作
    regenerateLayout: () => void
    
    // Manual Mode操作
    switchToManual: () => void
    createElementFromTemplate: (type: ElementType, config: ElementConfig) => void
    deleteElement: (id: string, location: 'staged' | 'placed') => void
    duplicateElement: (id: string, location: 'staged' | 'placed') => void
    placeElement: (elementId: string, position: { x: number; y: number }) => void
    moveElement: (elementId: string, position: { x: number; y: number }) => void
    moveElementBack: (elementId: string) => void
    alignToBoard: (elementId: string, direction: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void
    regenerateManualLayout: () => void
    
    // UI操作
    toggleSidebar: () => void
    setActiveTab: (tab: 'properties' | 'template' | 'engine') => void
    setPreviewScale: (scale: number) => void
    toggleGrid: () => void
    toggleGuides: () => void
  }
}

/**
 * 创建Store
 */
export const useSignStore = create<SignStore>((set, get) => ({
  // 初始状态
  currentDocument: null,
  currentLayout: null,
  recentDocuments: [],
  
  ui: {
    sidebarOpen: true,
    activeTab: 'properties',
    previewScale: 0.5,
    showGrid: false,
    showGuides: false,
  },
  
  actions: {
    // 创建新文档
    createDocument: (signType, name, mode = 'quick') => {
      // Use example panels that showcase the features
      let panels: PanelInput[]
      if (signType === 'G1-1') {
        panels = deepClone(DEFAULT_G11_PANELS)
      } else if (signType === 'G1-2') {
        panels = deepClone(DEFAULT_G12_PANELS)
      } else {
        // Fallback for other types
        const panelCount = 2
        panels = deepClone(DEFAULT_G11_PANELS)
      }
      
      const newDoc: SignDocument = {
        id: generateId(),
        name: name || getDefaultDocumentName(signType),
        signType,
        mode,
        panels,
        template: deepClone(DEFAULT_TEMPLATE),
        engine: deepClone(DEFAULT_ENGINE),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      set({ currentDocument: newDoc, currentLayout: null })
      
      // 自动生成布局
      get().actions.regenerateLayout()
    },
    
    // 加载文档
    loadDocument: (doc) => {
      set({ 
        currentDocument: deepClone(doc),
        currentLayout: null
      })
      
      // 自动生成布局
      get().actions.regenerateLayout()
    },
    
    // 更新文档
    updateDocument: (updates) => {
      set((state) => {
        if (!state.currentDocument) return state
        
        return {
          currentDocument: {
            ...state.currentDocument,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      // 如果更新了影响布局的属性，重新生成
      if (updates.panels || updates.template || updates.engine) {
        get().actions.regenerateLayout()
      }
    },
    
    // 保存文档
    saveDocument: () => {
      const doc = get().currentDocument
      if (!doc) return
      
      // 更新最近文档列表
      set((state) => {
        const recent = state.recentDocuments.filter((d) => d.id !== doc.id)
        recent.unshift({
          id: doc.id,
          name: doc.name,
          signType: doc.signType,
          updatedAt: doc.updatedAt,
        })
        
        return {
          recentDocuments: recent.slice(0, 10), // 保留最近10个
        }
      })
      
      // TODO: 持久化到后端或localStorage
      console.log('Document saved:', doc)
    },
    
    // 删除文档
    deleteDocument: (id) => {
      set((state) => ({
        recentDocuments: state.recentDocuments.filter((d) => d.id !== id),
      }))
      
      // TODO: 从后端或localStorage删除
    },
    
    // 更新Panel
    updatePanel: (index, updates) => {
      set((state) => {
        if (!state.currentDocument) return state
        
        const newPanels = [...state.currentDocument.panels]
        newPanels[index] = { ...newPanels[index], ...updates }
        
        return {
          currentDocument: {
            ...state.currentDocument,
            panels: newPanels,
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 添加Panel
    addPanel: () => {
      set((state) => {
        if (!state.currentDocument) return state
        if (state.currentDocument.panels.length >= 3) return state
        
        return {
          currentDocument: {
            ...state.currentDocument,
            panels: [...state.currentDocument.panels, deepClone(EMPTY_PANEL)],
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 删除Panel
    removePanel: (index) => {
      set((state) => {
        if (!state.currentDocument) return state
        if (state.currentDocument.panels.length <= 2) return state
        
        const newPanels = state.currentDocument.panels.filter((_, i) => i !== index)
        
        return {
          currentDocument: {
            ...state.currentDocument,
            panels: newPanels,
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 上移Panel
    movePanelUp: (index) => {
      if (index === 0) return
      
      set((state) => {
        if (!state.currentDocument) return state
        
        const newPanels = [...state.currentDocument.panels]
        ;[newPanels[index - 1], newPanels[index]] = [newPanels[index], newPanels[index - 1]]
        
        return {
          currentDocument: {
            ...state.currentDocument,
            panels: newPanels,
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 下移Panel
    movePanelDown: (index) => {
      const doc = get().currentDocument
      if (!doc || index === doc.panels.length - 1) return
      
      set((state) => {
        if (!state.currentDocument) return state
        
        const newPanels = [...state.currentDocument.panels]
        ;[newPanels[index], newPanels[index + 1]] = [newPanels[index + 1], newPanels[index]]
        
        return {
          currentDocument: {
            ...state.currentDocument,
            panels: newPanels,
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 更新模板
    updateTemplate: (updates) => {
      set((state) => {
        if (!state.currentDocument) return state
        
        return {
          currentDocument: {
            ...state.currentDocument,
            template: {
              ...state.currentDocument.template,
              ...updates,
            },
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 重置模板
    resetTemplate: () => {
      set((state) => {
        if (!state.currentDocument) return state
        
        return {
          currentDocument: {
            ...state.currentDocument,
            template: deepClone(DEFAULT_TEMPLATE),
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 更新引擎参数
    updateEngine: (updates) => {
      set((state) => {
        if (!state.currentDocument) return state
        
        return {
          currentDocument: {
            ...state.currentDocument,
            engine: {
              ...state.currentDocument.engine,
              ...updates,
            },
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 重置引擎参数
    resetEngine: () => {
      set((state) => {
        if (!state.currentDocument) return state
        
        return {
          currentDocument: {
            ...state.currentDocument,
            engine: deepClone(DEFAULT_ENGINE),
            updatedAt: new Date().toISOString(),
          },
        }
      })
      
      get().actions.regenerateLayout()
    },
    
    // 重新生成布局
    regenerateLayout: () => {
      const doc = get().currentDocument
      if (!doc) return
      
      try {
          // 清理 panels：过滤掉空的 destinations
          const cleanedPanels = doc.panels.map(panel => ({
            ...panel,
            destinations: panel.destinations.filter(d => d && d.trim())
          }))
          
        const layout = computeLayout({
            input: {
              panels: cleanedPanels,
            },
            template: doc.template,
            pxPerH: doc.engine.pxPerH,
            fontMetrics: {
              avgCharWidthRatio: 0.6,
              ascentRatio: 0.75,
              descentRatio: 0.25,
            },
          })
        
        set({ currentLayout: layout })
      } catch (error) {
        console.error('Layout generation failed:', error)
        set({ currentLayout: null })
      }
    },
    
    // ========== Manual Mode 操作 ==========
    
    switchToManual: () => {
      const doc = get().currentDocument
      const layout = get().currentLayout
      if (!doc || !layout) return
      
      const pxPerH = layout.meta?.pxPerH || doc.engine.pxPerH || 100
      
      // 转换LayoutModel items 到 PlacedElements
      const placed: PlacedElement[] = []
      
      layout.items.forEach((item) => {
        let type: ElementType = 'text'
        let config: ElementConfig = {}
        let itemW = 'w' in item ? item.w : 0
        let itemH = 'h' in item ? item.h : 0
        
        if (item.t === 'text') {
          type = 'text'
          config = {
            text: item.text,
            fontSeries: item.fontSeries,
            letter_h: item.fontSize / pxPerH,
          }
          if (itemW === 0 || itemH === 0) {
            itemW = item.text.length * item.fontSize * 0.6
            itemH = item.fontSize
          }
        } else if (item.t === 'roadName') {
          type = 'roadName'
          config = {
            text: item.text,
            letter_h: item.fontSize / pxPerH,
          }
        } else if (item.t === 'roadNumber') {
          type = 'roadNumber'
          config = {
            text: item.text,
            letter_h: item.fontSize / pxPerH,
          }
          if (itemW === 0 || itemH === 0) {
            itemW = item.text.length * item.fontSize * 0.7
            itemH = item.fontSize * 1.2
          }
        } else if (item.t === 'shield') {
          type = 'shield'
          config = {
            iconId: item.iconId,
            label: item.label,
          }
        } else if (item.t === 'arrow') {
          type = 'arrow'
          config = {
            iconId: item.iconId,
            direction: item.direction,
          }
        }
        
        // 🔧 坐标修复：text/roadNumber的y是基线，需要转换为左上角
        let finalY = item.y / pxPerH
        if (item.t === 'text' || item.t === 'roadNumber') {
          const ascent_h = ('ascent_h' in item && item.ascent_h) 
            ? item.ascent_h 
            : (item.fontSize * 0.75) / pxPerH
          finalY = item.y / pxPerH - ascent_h
        }
        
        // 边界检查和数据验证
        const x = Math.max(0, Math.min(item.x / pxPerH, layout.board.w / pxPerH))
        const y = Math.max(0, Math.min(finalY, layout.board.h / pxPerH))
        const w = Math.max(0.1, Math.min(itemW / pxPerH, layout.board.w / pxPerH))
        const h = Math.max(0.1, Math.min(itemH / pxPerH, layout.board.h / pxPerH))
        
        // 如果数据异常，跳过这个元素
        if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
          console.warn('Invalid element data, skipping:', item)
          return
        }
        
        placed.push({
          id: generateId(),
          type,
          config,
          box: { x, y, w, h },
        })
      })
      
      set({
        currentDocument: {
          ...doc,
          mode: 'manual',
          manualData: {
            staged: [],
            placed,
            boardSize: { 
              w: layout.board.w / pxPerH, 
              h: layout.board.h / pxPerH 
            },
          },
        },
      })
      
      // 立即调用regenerateManualLayout
      setTimeout(() => get().actions.regenerateManualLayout(), 10)
    },
    
    createElementFromTemplate: (type, config) => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      // 智能计算预览尺寸（基于文本长度和类型）
      let w = 2
      let h = 1.6
      
      if (type === 'text') {
        const text = config.text || 'Text'
        const letterH = config.letter_h || 1.6
        // 使用平均字符宽度比例0.6
        w = Math.max(text.length * letterH * 0.6, 1)
        h = letterH
      } else if (type === 'roadName') {
        const text = config.text || 'ROAD NAME'
        const letterH = config.letter_h || 1.2
        const padH = config.pad_h || 0.15
        w = Math.max(text.length * letterH * 0.6 + padH * 2, 2)
        h = letterH + padH * 2
      } else if (type === 'roadNumber') {
        const text = config.text || 'A1'
        const letterH = config.letter_h || 0.8
        w = Math.max(text.length * letterH * 0.7 + 0.2, 1.2)
        h = letterH + 0.2
      } else if (type === 'shield') {
        const label = config.label || 'M1'
        const letterH = config.letter_h || 1
        w = Math.max(label.length * letterH * 0.6 + 0.3, 1.2)
        h = letterH + 0.2
      } else if (type === 'arrow') {
        w = 1.2
        h = 0.8
      }
      
      const newElement: StagedElement = {
        id: generateId(),
        type,
        config,
        preview: { x: 0, y: 0, w, h },
      }
      
      set({
        currentDocument: {
          ...doc,
          manualData: {
            ...doc.manualData,
            staged: [...doc.manualData.staged, newElement],
          },
        },
      })
    },
    
    deleteElement: (id, location) => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      if (location === 'staged') {
        set({
          currentDocument: {
            ...doc,
            manualData: {
              ...doc.manualData,
              staged: doc.manualData.staged.filter(el => el.id !== id),
            },
          },
        })
      } else {
        set({
          currentDocument: {
            ...doc,
            manualData: {
              ...doc.manualData,
              placed: doc.manualData.placed.filter(el => el.id !== id),
            },
          },
        })
        setTimeout(() => get().actions.regenerateManualLayout(), 10)
      }
    },
    
    duplicateElement: (id, location) => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      if (location === 'staged') {
        const element = doc.manualData.staged.find(el => el.id === id)
        if (!element) return
        
        const duplicate: StagedElement = {
          ...deepClone(element),
          id: generateId(),
        }
        
        set({
          currentDocument: {
            ...doc,
            manualData: {
              ...doc.manualData,
              staged: [...doc.manualData.staged, duplicate],
            },
          },
        })
      } else {
        const element = doc.manualData.placed.find(el => el.id === id)
        if (!element) return
        
        const duplicate: PlacedElement = {
          ...deepClone(element),
          id: generateId(),
          box: {
            ...element.box,
            x: element.box.x + 0.5,
            y: element.box.y + 0.5,
          },
        }
        
        set({
          currentDocument: {
            ...doc,
            manualData: {
              ...doc.manualData,
              placed: [...doc.manualData.placed, duplicate],
            },
          },
        })
        setTimeout(() => get().actions.regenerateManualLayout(), 10)
      }
    },
    
    placeElement: (elementId, position) => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      const element = doc.manualData.staged.find(el => el.id === elementId)
      if (!element) return
      
      const placed: PlacedElement = {
        id: element.id,
        type: element.type,
        config: element.config,
        box: {
          x: position.x,
          y: position.y,
          w: element.preview.w,
          h: element.preview.h,
        },
      }
      
      set({
        currentDocument: {
          ...doc,
          manualData: {
            ...doc.manualData,
            staged: doc.manualData.staged.filter(el => el.id !== elementId),
            placed: [...doc.manualData.placed, placed],
          },
        },
      })
    },
    
    moveElement: (elementId, position) => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      set({
        currentDocument: {
          ...doc,
          manualData: {
            ...doc.manualData,
            placed: doc.manualData.placed.map(el => 
              el.id === elementId
                ? { ...el, box: { ...el.box, x: position.x, y: position.y } }
                : el
            ),
          },
        },
      })
    },
    
    moveElementBack: (elementId) => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      const element = doc.manualData.placed.find(el => el.id === elementId)
      if (!element) return
      
      const stagedElement: StagedElement = {
        id: element.id,
        type: element.type,
        config: element.config,
        preview: {
          x: 0,
          y: 0,
          w: element.box.w,
          h: element.box.h,
        },
      }
      
      set({
        currentDocument: {
          ...doc,
          manualData: {
            ...doc.manualData,
            placed: doc.manualData.placed.filter(el => el.id !== elementId),
            staged: [...doc.manualData.staged, stagedElement],
          },
        },
      })
      setTimeout(() => get().actions.regenerateManualLayout(), 10)
    },
    
    alignToBoard: (elementId, direction) => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      const element = doc.manualData.placed.find(el => el.id === elementId)
      if (!element) return
      
      const board = doc.manualData.boardSize
      let newX = element.box.x
      let newY = element.box.y
      
      switch (direction) {
        case 'left':
          newX = 0
          break
        case 'right':
          newX = board.w - element.box.w
          break
        case 'center':
          newX = (board.w - element.box.w) / 2
          break
        case 'top':
          newY = 0
          break
        case 'bottom':
          newY = board.h - element.box.h
          break
        case 'middle':
          newY = (board.h - element.box.h) / 2
          break
      }
      
      get().actions.moveElement(elementId, { x: newX, y: newY })
    },
    
    regenerateManualLayout: () => {
      const doc = get().currentDocument
      if (!doc || !doc.manualData) return
      
      // 调用manual layout引擎重新计算
      const newLayout = computeManualLayout({
        elements: doc.manualData.placed,
        constraints: doc.manualData.alignmentConstraints || [],
        pxPerH: 100,
      })
      
      set({
        currentDocument: {
          ...doc,
          manualData: {
            ...doc.manualData,
            placed: newLayout.elements,
            boardSize: newLayout.boardSize,
          },
        },
      })
    },
    
    // UI操作
    toggleSidebar: () => {
      set((state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      }))
    },
    
    setActiveTab: (tab) => {
      set((state) => ({
        ui: { ...state.ui, activeTab: tab },
      }))
    },
    
    setPreviewScale: (scale) => {
      set((state) => ({
        ui: { ...state.ui, previewScale: scale },
      }))
    },
    
    toggleGrid: () => {
      set((state) => ({
        ui: { ...state.ui, showGrid: !state.ui.showGrid },
      }))
    },
    
    toggleGuides: () => {
      set((state) => ({
        ui: { ...state.ui, showGuides: !state.ui.showGuides },
      }))
    },
  },
}))

/**
 * Hooks for easier access
 */
export const useCurrentDocument = () => useSignStore((state) => state.currentDocument)
export const useCurrentLayout = () => useSignStore((state) => state.currentLayout)
export const useRecentDocuments = () => useSignStore((state) => state.recentDocuments)
export const useUI = () => useSignStore((state) => state.ui)
export const useActions = () => useSignStore((state) => state.actions)

