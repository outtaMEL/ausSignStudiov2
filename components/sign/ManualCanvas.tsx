'use client'

/**
 * Manual Canvas Component
 */

import { PlacedElement } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { useDraggable, useDroppable } from '@dnd-kit/core'

interface ManualCanvasProps {
  elements: PlacedElement[]
  boardSize: { w: number; h: number }
  onElementClick?: (id: string) => void
  selectedElementId?: string | null
  hoveredElementId?: string | null
  onElementHover?: (id: string | null) => void
  alignmentLines?: Array<{
    type: 'horizontal' | 'vertical'
    position: number
    elementIds: string[]
    alignmentPoint: string
  }>
  onQuickAlign?: (id: string, direction: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void
  showDebugInfo?: boolean // 可选：显示调试信息
}

// 可拖拽元素组件
function DraggablePlacedElement({
  element,
  isSelected,
  isHovered,
  onClick,
  onHover,
  showDebugInfo,
}: {
  element: PlacedElement
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onHover: (hover: boolean) => void
  showDebugInfo?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: element.id,
    data: {
      type: 'placed-element',
      element,
    },
  })
  
  // 安全检查：确保box数据在合理范围内
  const safeBox = {
    x: Math.max(0, element.box.x),
    y: Math.max(0, element.box.y),
    w: Math.min(element.box.w, 15), // 最大宽度15h
    h: Math.min(element.box.h, 5),  // 最大高度5h
  }

  return (
    <g opacity={isDragging ? 0.5 : 1}>
      {/* Selection highlight - 更明显的选中效果 */}
      {isSelected && (
        <rect
          x={safeBox.x - 0.15}
          y={safeBox.y - 0.15}
          width={safeBox.w + 0.3}
          height={safeBox.h + 0.3}
          fill="none"
          stroke="#2563EB"
          strokeWidth="0.1"
          opacity={0.8}
          pointerEvents="none"
          rx="0.2"
        />
      )}
      
      {/* Hover highlight - 悬停效果 */}
      {isHovered && !isSelected && (
        <rect
          x={safeBox.x - 0.1}
          y={safeBox.y - 0.1}
          width={safeBox.w + 0.2}
          height={safeBox.h + 0.2}
          fill="#60A5FA"
          fillOpacity="0.15"
          stroke="none"
          pointerEvents="none"
          rx="0.15"
        />
      )}
      
      {/* Element content */}
      {element.type === 'text' && (
        <text
          x={safeBox.x + safeBox.w / 2}
          y={safeBox.y + safeBox.h / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={safeBox.h * 0.7}
          fill="white"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          pointerEvents="none"
        >
          {element.config.text || 'Text'}
        </text>
      )}

      {element.type === 'roadName' && (
        <g>
          <rect
            x={safeBox.x}
            y={safeBox.y}
            width={safeBox.w}
            height={safeBox.h}
            fill="white"
            stroke="black"
            strokeWidth="0.05"
            pointerEvents="none"
          />
          <text
            x={safeBox.x + safeBox.w / 2}
            y={safeBox.y + safeBox.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={safeBox.h * 0.6}
            fill="black"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            pointerEvents="none"
          >
            {element.config.text || 'ROAD NAME'}
          </text>
        </g>
      )}

      {element.type === 'roadNumber' && (
        <g>
          <rect
            x={safeBox.x}
            y={safeBox.y}
            width={safeBox.w}
            height={safeBox.h}
            fill="#FFD700"
            stroke="black"
            strokeWidth="0.05"
            pointerEvents="none"
          />
          <text
            x={safeBox.x + safeBox.w / 2}
            y={safeBox.y + safeBox.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={safeBox.h * 0.7}
            fill="black"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            pointerEvents="none"
          >
            {element.config.text || '1'}
          </text>
        </g>
      )}

      {element.type === 'shield' && (
        <g>
          <rect
            x={safeBox.x}
            y={safeBox.y}
            width={safeBox.w}
            height={safeBox.h}
            fill="white"
            stroke="black"
            strokeWidth="0.05"
            pointerEvents="none"
          />
          <text
            x={safeBox.x + safeBox.w / 2}
            y={safeBox.y + safeBox.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={safeBox.h * 0.6}
            fill="black"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            pointerEvents="none"
          >
            {element.config.label || 'M1'}
          </text>
        </g>
      )}

      {element.type === 'arrow' && (() => {
        const centerX = safeBox.x + safeBox.w / 2
        const centerY = safeBox.y + safeBox.h / 2
        const w = safeBox.w * 0.7
        const h = safeBox.h * 0.7
        
        const direction = element.config.direction || 'right'
        let points = ''
        
        if (direction === 'left') {
          const tipX = centerX - w/2
          const baseX = centerX + w/2
          const topY = centerY - h/2
          const botY = centerY + h/2
          points = `${tipX},${centerY} ${baseX},${topY} ${baseX},${botY}`
        } else if (direction === 'right') {
          const tipX = centerX + w/2
          const baseX = centerX - w/2
          const topY = centerY - h/2
          const botY = centerY + h/2
          points = `${tipX},${centerY} ${baseX},${topY} ${baseX},${botY}`
        } else if (direction === 'forward') {
          const tipY = centerY - h/2
          const baseY = centerY + h/2
          const leftX = centerX - w/2
          const rightX = centerX + w/2
          points = `${centerX},${tipY} ${rightX},${baseY} ${leftX},${baseY}`
        } else {
          const tipX = centerX + w/2
          const baseX = centerX - w/2
          const topY = centerY - h/2
          const botY = centerY + h/2
          points = `${tipX},${centerY} ${baseX},${topY} ${baseX},${botY}`
  }

  return (
          <polygon
            points={points}
            fill="white"
            pointerEvents="none"
          />
        )
      })()}

      {/* Interactive overlay rect - full element box */}
      <rect
        ref={setNodeRef as any}
        x={safeBox.x}
        y={safeBox.y}
        width={safeBox.w}
        height={safeBox.h}
        fill="transparent"
        stroke="transparent"
        strokeWidth="0.02"
        style={{ cursor: 'move' }}
        onClick={onClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        {...listeners}
        {...attributes}
      />
      
      {/* 始终显示的轻微边框，帮助识别可交互元素 */}
      {!isSelected && !isHovered && (
        <rect
          x={safeBox.x}
          y={safeBox.y}
          width={safeBox.w}
          height={safeBox.h}
          fill="none"
          stroke="#93C5FD"
          strokeWidth="0.02"
          strokeDasharray="0.15 0.15"
          strokeOpacity="0.3"
          pointerEvents="none"
        />
      )}
      
      {/* Debug info - 显示元素类型 */}
      {showDebugInfo && (
        <g>
          <rect
            x={safeBox.x}
            y={safeBox.y - 0.35}
            width={1.5}
            height={0.3}
            fill="#1F2937"
            opacity="0.9"
            rx="0.05"
            pointerEvents="none"
          />
          <text
            x={safeBox.x + 0.75}
            y={safeBox.y - 0.15}
            textAnchor="middle"
            fontSize="0.18"
            fill="white"
            fontFamily="monospace"
            fontWeight="bold"
            pointerEvents="none"
          >
            {element.type}
          </text>
        </g>
      )}
    </g>
  )
}

export function ManualCanvas({
  elements,
  boardSize,
  onElementClick,
  selectedElementId,
  hoveredElementId,
  onElementHover,
  alignmentLines = [],
  showDebugInfo = false,
}: ManualCanvasProps) {
  const pxPerH = 100 // 固定缩放
  
  // 过滤掉异常的元素（box数据无效）
  const validElements = elements.filter(el => {
    const box = el.box
    // 检查box数据是否有效
    if (!box || isNaN(box.x) || isNaN(box.y) || isNaN(box.w) || isNaN(box.h)) {
      console.warn('❌ Invalid element box (NaN):', el.id, el.type, box)
      return false
    }
    // 检查box是否在合理范围内
    if (box.w <= 0 || box.h <= 0) {
      console.warn('❌ Invalid element box (zero or negative):', el.id, el.type, box)
      return false
    }
    // 更严格的上限检查
    if (box.w > 20 || box.h > 10) {
      console.warn('❌ Element box too large:', el.id, el.type, box, 'max allowed: 20×10h')
      return false
    }
    // 检查是否超出board范围太多
    if (box.x < -5 || box.y < -5 || box.x > boardSize.w + 5 || box.y > boardSize.h + 5) {
      console.warn('❌ Element box out of bounds:', el.id, el.type, box, 'board:', boardSize)
      return false
    }
    return true
  })
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'manual-canvas',
    data: {
      type: 'canvas',
    },
  })

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-slate-50">
        <h2 className="font-semibold text-sm">Canvas</h2>
            <p className="text-xs text-muted-foreground mt-1">
          Board: {boardSize.w.toFixed(1)} × {boardSize.h.toFixed(1)} h | {validElements.length} elements
            </p>
          </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8 bg-slate-100">
        <div className="inline-block bg-white shadow-lg" ref={setNodeRef as any}>
          <svg
            width={boardSize.w * pxPerH}
            height={boardSize.h * pxPerH}
            viewBox={`0 0 ${boardSize.w} ${boardSize.h}`}
            className="border-2 border-slate-300"
            data-board-canvas
          >
            {/* Background */}
            <rect
              x="0"
              y="0"
              width={boardSize.w}
              height={boardSize.h}
              fill="#2D6A4F"
            />

            {/* Alignment Lines */}
            {alignmentLines.map((line, idx) => (
              <line
                key={idx}
                x1={line.type === 'vertical' ? line.position : 0}
                y1={line.type === 'horizontal' ? line.position : 0}
                x2={line.type === 'vertical' ? line.position : boardSize.w}
                y2={line.type === 'horizontal' ? line.position : boardSize.h}
                stroke="#3B82F6"
                strokeWidth="0.02"
                strokeDasharray="0.1 0.1"
                opacity="0.8"
                pointerEvents="none"
              />
            ))}

            {/* Elements */}
            {validElements.map((element) => (
              <DraggablePlacedElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                isHovered={element.id === hoveredElementId}
                onClick={() => onElementClick?.(element.id)}
                onHover={(hover) => onElementHover?.(hover ? element.id : null)}
                showDebugInfo={showDebugInfo}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
