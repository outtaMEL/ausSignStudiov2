'use client'

/**
 * 暂存区组件（第二列）
 * 显示暂存的元素列表
 * Phase 4: 拖拽功能实现
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Copy,
  Trash2,
  Inbox,
  MoveRight,
  GripVertical
} from 'lucide-react'
import { StagedElement } from '@/lib/types'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// 可拖拽元素组件
function DraggableElement({
  element,
  onDelete,
  onDuplicate,
  getElementIcon,
  getElementLabel,
}: {
  element: StagedElement
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  getElementIcon: (type: string) => string
  getElementLabel: (element: StagedElement) => string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    data: {
      type: 'staged-element',
      element,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    transition: 'opacity 150ms ease',
  }

  // Generate simple SVG preview
  const renderPreviewSVG = () => {
    const w = element.preview.w
    const h = element.preview.h
    
    // Use CSS to make SVG responsive, not fixed px size
    const svgStyle = {
      maxWidth: '100%',
      maxHeight: '80px',
      width: 'auto',
      height: 'auto',
    }

    if (element.type === 'text') {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle} preserveAspectRatio="xMidYMid meet">
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={h * 0.7}
            fill="#333"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
          >
            {element.config.text || 'Text'}
          </text>
        </svg>
      )
    }

    if (element.type === 'roadName') {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={w} height={h} fill="white" stroke="black" strokeWidth="0.05" />
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={h * 0.6}
            fill="black"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
          >
            {element.config.text || 'ROAD NAME'}
          </text>
        </svg>
      )
    }

    if (element.type === 'roadNumber') {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={w} height={h} fill="#FFD700" stroke="black" strokeWidth="0.05" />
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={h * 0.7}
            fill="black"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
          >
            {element.config.text || 'A1'}
          </text>
        </svg>
      )
    }

    if (element.type === 'shield') {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={w} height={h} fill="white" stroke="black" strokeWidth="0.05" />
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={h * 0.6}
            fill="black"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
          >
            {element.config.label || 'M1'}
          </text>
        </svg>
      )
    }

    if (element.type === 'arrow') {
      const direction = element.config.direction || 'right'
      const centerX = w / 2
      const centerY = h / 2
      const aw = w * 0.7
      const ah = h * 0.7
      
      let points = ''
      if (direction === 'left') {
        points = `${centerX - aw/2},${centerY} ${centerX + aw/2},${centerY - ah/2} ${centerX + aw/2},${centerY + ah/2}`
      } else {
        points = `${centerX + aw/2},${centerY} ${centerX - aw/2},${centerY - ah/2} ${centerX - aw/2},${centerY + ah/2}`
      }
      
      return (
        <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={w} height={h} fill="#2D6A4F" opacity="0.1" />
          <polygon points={points} fill="white" />
        </svg>
      )
    }

    return null
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-md transition-shadow group cursor-move overflow-hidden relative">
         {/* SVG Preview - Element only */}
         <div 
           className="w-full bg-slate-100 p-4 flex items-center justify-center border-b"
           style={{ minHeight: '100px' }}
         >
           {renderPreviewSVG()}
         </div>
        
        {/* Drag Handle - Top Left */}
        <div
          {...listeners}
          {...attributes}
          className="absolute top-2 left-2 text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing bg-white/90 rounded p-1"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Actions - Bottom Right */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 rounded p-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Show property panel
              console.log('Properties:', element)
            }}
            title="Properties"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-green-100"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate?.(element.id)
            }}
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(element.id)
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

interface StagedElementsProps {
  elements: StagedElement[]
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  isDraggingToStaging?: boolean
}

export function StagedElements({
  elements,
  onDelete,
  onDuplicate,
  isDraggingToStaging = false,
}: StagedElementsProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'staging-area',
    data: {
      type: 'staging-area',
    },
  })
  
  // 高亮staging area当拖拽回来时
  const shouldHighlight = isOver || isDraggingToStaging

  const getElementIcon = (type: string) => {
    // 根据类型返回不同的图标颜色
    const colorMap: Record<string, string> = {
      text: 'bg-blue-100 text-blue-600',
      roadName: 'bg-green-100 text-green-600',
      roadNumber: 'bg-yellow-100 text-yellow-600',
      shield: 'bg-purple-100 text-purple-600',
      arrow: 'bg-orange-100 text-orange-600',
      composite: 'bg-pink-100 text-pink-600',
      board: 'bg-indigo-100 text-indigo-600',
    }
    
    return colorMap[type] || 'bg-gray-100 text-gray-600'
  }

  const getElementLabel = (element: StagedElement): string => {
    if (element.type === 'text' && element.config.text) {
      return element.config.text
    }
    if (element.type === 'roadName' && element.config.text) {
      return element.config.text
    }
    if (element.type === 'roadNumber' && element.config.text) {
      return `Road ${element.config.text}`
    }
    if (element.type === 'shield' && element.config.label) {
      return element.config.label
    }
    if (element.type === 'arrow') {
      return `Arrow ${element.config.direction || 'forward'}`
    }
    return element.type
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-slate-50">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          Staging Area
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {elements.length} elements
          </span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Drag to canvas to place
        </p>
      </div>

      {/* Content */}
      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-auto p-4 transition-all duration-200 ${
          shouldHighlight ? 'bg-green-50 ring-2 ring-inset ring-green-400' : ''
        }`}
      >
        {elements.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Staging area is empty</p>
              <p className="text-xs mt-1">
                Add elements from the library
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {elements.map((element, index) => (
              <DraggableElement
                key={element.id}
                element={element}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                getElementIcon={getElementIcon}
                getElementLabel={getElementLabel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      {elements.length > 0 && (
        <div className="px-4 py-3 border-t bg-blue-50 text-xs text-blue-800">
          <p className="flex items-start gap-2">
            <MoveRight className="h-4 w-4 flex-shrink-0" />
            <span>Drag elements to canvas to place</span>
          </p>
        </div>
      )}
    </div>
  )
}

