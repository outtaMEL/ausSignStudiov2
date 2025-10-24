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
  ManualCanvas,
  AlignmentGuide,
  QuickAlignButtons,
  SpacingWarning,
} from '@/components/sign'
import { DndContext, DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core'
import { ElementType, ElementConfig, PlacedElement } from '@/lib/types'
import { detectAlignmentOpportunities, validateSpacing } from '@/lib/engine/manual'

export default function EditorPage() {
  const router = useRouter()
  const document = useCurrentDocument()
  const actions = useActions()
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)
  const [draggingElement, setDraggingElement] = useState<PlacedElement | null>(null)
  const [alignmentLines, setAlignmentLines] = useState<Array<{
    type: 'horizontal' | 'vertical'
    position: number
    elementIds: string[]
    alignmentPoint: string
  }>>([])
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

  // 处理拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current
    if (activeData?.type === 'placed-element') {
      setDraggingElement(activeData.element)
    }
  }

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    setAlignmentLines([])
    setDraggingElement(null)
    
    const { active, over } = event
    if (!over || !document) return

    const activeData = active.data.current

    // 从暂存区拖到画布（使用SVG坐标）
    if (activeData?.type === 'staged-element' && over.id === 'manual-canvas') {
      const element = activeData.element
      
      // 使用SVG坐标转换
      const svgEl = window.document.querySelector('svg[data-board-canvas]') as SVGSVGElement
      if (!svgEl) {
        // Fallback: 放置在中心
        const centerX = document.manualData!.boardSize.w / 2 - element.preview.w / 2
        const centerY = document.manualData!.boardSize.h / 2 - element.preview.h / 2
        actions.placeElement(element.id, { x: centerX, y: centerY })
        setTimeout(() => actions.regenerateManualLayout(), 10)
        return
      }

      // 获取鼠标位置并转换为SVG坐标（h空间）
      const mouseEvent = event.activatorEvent as MouseEvent
      const pt = svgEl.createSVGPoint()
      pt.x = mouseEvent.clientX + (event.delta?.x || 0)
      pt.y = mouseEvent.clientY + (event.delta?.y || 0)
      const svgPt = pt.matrixTransform(svgEl.getScreenCTM()!.inverse())

      actions.placeElement(element.id, { x: svgPt.x, y: svgPt.y })
      setTimeout(() => actions.regenerateManualLayout(), 10)
    }

    // 从画布拖回暂存区
    if (activeData?.type === 'placed-element' && over.id === 'staging-area') {
      actions.moveElementBack(active.id as string)
    }
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
        <DndContext 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ResizableThreeColumn
            columnOne={
              <ElementLibrary onCreateElement={handleCreateElement} />
            }
            columnTwo={
              <StagedElements
                elements={document.manualData.staged}
                onDelete={(id) => actions.deleteElement(id, 'staged')}
                onDuplicate={(id) => actions.duplicateElement(id, 'staged')}
              />
            }
            columnThree={
              <div className="h-full relative">
                <ManualCanvas
                  elements={document.manualData.placed}
                  boardSize={document.manualData.boardSize}
                  onElementClick={(id) => setSelectedElementId(id)}
                  selectedElementId={selectedElementId}
                  hoveredElementId={hoveredElementId}
                  onElementHover={(id) => setHoveredElementId(id)}
                  alignmentLines={alignmentLines}
                  onQuickAlign={(id, direction) => {
                    actions.alignToBoard(id, direction)
                    setTimeout(() => actions.regenerateManualLayout(), 10)
                  }}
                />
                
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
        </DndContext>
      </div>
    </div>
  )
}
