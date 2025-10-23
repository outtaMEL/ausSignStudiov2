/**
 * 全局状态管理 - Zustand Store
 */

import { create } from 'zustand'
import { SignDocument, PanelInput, TemplateParams, EngineParams, LayoutModel } from '@/lib/types'
import { DEFAULT_TEMPLATE, DEFAULT_ENGINE, DEFAULT_G11_PANELS, DEFAULT_G12_PANELS, getDefaultDocumentName } from '@/lib/defaults'
import { computeLayout } from '@/lib/engine'
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
    createDocument: (signType: 'G1-1' | 'G1-2' | 'G2' | 'G3', name?: string) => void
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
    createDocument: (signType, name) => {
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

