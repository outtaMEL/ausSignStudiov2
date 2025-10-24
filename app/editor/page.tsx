'use client'

/**
 * Manual Editor Page - 手动模式编辑器
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrentDocument, useActions } from '@/store/signStore'
import {
  ResizableThreeColumn,
  ElementLibrary,
  StagedElements,
  SpacingWarning,
} from '@/components/sign'
import { SimpleManualCanvas } from '@/components/sign/SimpleManualCanvas'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { ElementType, ElementConfig, PlacedElement, StagedElement } from '@/lib/types'
import { validateSpacing } from '@/lib/engine/manual'

export default function EditorPage() {
  const router = useRouter()
  const document = useCurrentDocument()
  const actions = useActions()
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [draggingStagedElement, setDraggingStagedElement] = useState<StagedElement | null>(null)
  const [draggingBackToStaging, setDraggingBackToStaging] = useState<string | null>(null)
  const [spacingViolations, setSpacingViolations] = useState<Array<{
    elem1Id: string
    elem2Id: string
    currentSpacing: number
    minRequired: number
    direction: 'horizontal' | 'vertical'
  }>>([])

  // Validate spacing whenever elements change
  useEffect(() => {
    if (!document?.manualData?.placed) return

    const violations = validateSpacing(document.manualData.placed, {
      'text-text-h': 0.15,
      'text-text-v': 0.15,
      'roadName-text-h': 0.2,
      'roadName-text-v': 0.15,
      'shield-text-h': 0.2,
      'arrow-text-h': 0.2,
      'roadNumber-text-h': 0.2,
    })

    setSpacingViolations(violations)
  }, [document?.manualData?.placed])

  // 如果没有文档或不是manual模式，跳转回playground
  useEffect(() => {
    if (!document || document.mode !== 'manual') {
      router.push('/playground')
    }
  }, [document, router])

  if (!document || document.mode !== 'manual' || !document.manualData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading editor...</p>
          <Button onClick={() => router.push('/playground')}>
            Back to Playground
          </Button>
        </div>
      </div>
    )
  }

  // 开始拖拽
  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current
    if (activeData?.type === 'staged-element') {
      setDraggingStagedElement(activeData.element)
    }
    if (activeData?.type === 'canvas-to-staging') {
      setDraggingBackToStaging(activeData.elementId)
    }
  }

  // 处理从暂存区拖拽元素
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggingStagedElement(null)
    setDraggingBackToStaging(null)
    
    if (!document) return

    const activeData = active.data.current

    // 从暂存区拖拽到画布：放置到鼠标位置
    if (activeData?.type === 'staged-element' && over?.id === 'simple-canvas-drop-zone') {
      const element = activeData.element
      
      // 尝试获取SVG元素并转换鼠标坐标
      const canvasContainer = window.document.querySelector('[data-canvas-container]')
      const svgEl = canvasContainer?.querySelector('svg') as SVGSVGElement
      
      let targetX = document.manualData!.boardSize.w / 2 - element.preview.w / 2
      let targetY = document.manualData!.boardSize.h / 2 - element.preview.h / 2
      
      if (svgEl && event.activatorEvent) {
        try {
          const mouseEvent = event.activatorEvent as PointerEvent
          const pt = svgEl.createSVGPoint()
          
          // 使用当前鼠标位置（不是起始位置）
          pt.x = mouseEvent.clientX
          pt.y = mouseEvent.clientY
          const svgPt = pt.matrixTransform(svgEl.getScreenCTM()!.inverse())
          
          // 以元素中心对齐鼠标位置
          targetX = svgPt.x - element.preview.w / 2
          targetY = svgPt.y - element.preview.h / 2
        } catch (e) {
          console.warn('SVG coordinate conversion failed, using center position')
        }
      }
      
      // 确保在board范围内
      targetX = Math.max(0, Math.min(targetX, document.manualData!.boardSize.w - element.preview.w))
      targetY = Math.max(0, Math.min(targetY, document.manualData!.boardSize.h - element.preview.h))
      
      actions.placeElement(element.id, { x: targetX, y: targetY })
      setTimeout(() => actions.regenerateManualLayout(), 10)
    }

    // 从画布拖回暂存区
    if (activeData?.type === 'canvas-to-staging' && over?.id === 'staging-area') {
      const elementId = activeData.elementId
      actions.moveElementBack(elementId)
    }
  }
  
  // 处理画布内元素移动
  const handleElementMove = (elementId: string, newX: number, newY: number) => {
    actions.moveElement(elementId, { x: newX, y: newY })
  }

  // 创建元素
  const handleCreateElement = (type: ElementType, config: ElementConfig) => {
    actions.createElementFromTemplate(type, config)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/playground">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{document.name}</h1>
          <span className="text-sm text-muted-foreground">Manual Mode</span>
        </div>
      </header>

      {/* Main Content - 三列布局 */}
      <div className="flex-1 overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <ResizableThreeColumn
            columnOne={
              <ElementLibrary onCreateElement={handleCreateElement} />
            }
            columnTwo={
              <div className="h-full relative">
                <StagedElements
                  elements={document.manualData.staged}
                  onDelete={(id) => actions.deleteElement(id, 'staged')}
                  onDuplicate={(id) => actions.duplicateElement(id, 'staged')}
                  isDraggingToStaging={!!draggingBackToStaging}
                />
                
                {/* Drop hint when dragging back to staging */}
                {draggingBackToStaging && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-green-500/5 animate-in fade-in">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl text-sm font-medium animate-in zoom-in-95 duration-200">
                      ← Release to move back to staging ←
                    </div>
                  </div>
                )}
              </div>
            }
            columnThree={
              <div className="h-full relative">
                <SimpleManualCanvas
                  elements={document.manualData.placed}
                  boardSize={document.manualData.boardSize}
                  onElementMove={handleElementMove}
                  onElementClick={(id) => setSelectedElementId(id)}
                  onMoveBackToStaging={(id) => actions.moveElementBack(id)}
                  selectedElementId={selectedElementId}
                />
                
                {/* Drop hint when dragging */}
                {draggingStagedElement && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-blue-500/5 transition-all duration-200 animate-in fade-in">
                    <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-xl text-sm font-medium animate-in zoom-in-95 duration-200">
                      ↓ Release to place element at center ↓
                    </div>
                  </div>
                )}
                
                {/* Spacing Warnings Overlay */}
                {spacingViolations.length > 0 && (
                  <SpacingWarning
                    violations={spacingViolations}
                    boardSize={document.manualData.boardSize}
                    pxPerH={100}
                    zoom={100}
                  />
                )}
              </div>
            }
          />
          
          {/* Drag Overlay - 拖拽时跟随鼠标的预览 */}
          <DragOverlay dropAnimation={null}>
            {draggingStagedElement ? (
              <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-blue-500 opacity-90">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-bold text-sm capitalize">{draggingStagedElement.type}</div>
                    <div className="text-xs text-gray-500">
                      {draggingStagedElement.config.text || 
                       draggingStagedElement.config.label || 
                       'Element'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {draggingStagedElement.preview.w.toFixed(1)} × {draggingStagedElement.preview.h.toFixed(1)} h
                </div>
              </div>
            ) : draggingBackToStaging ? (
              <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-green-500 opacity-90">
                <div className="flex items-center gap-3">
                  <ArrowLeft className="w-5 h-5 text-green-500 animate-pulse" />
                  <div>
                    <div className="font-bold text-sm text-green-700">Moving to Staging</div>
                    <div className="text-xs text-gray-500">Release over staging area</div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
