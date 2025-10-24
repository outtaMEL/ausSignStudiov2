'use client'

/**
 * 简化版手动画布 - 使用原生鼠标事件实现拖拽
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { PlacedElement } from '@/lib/types'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { ArrowLeft } from 'lucide-react'

interface SimpleManualCanvasProps {
  elements: PlacedElement[]
  boardSize: { w: number; h: number }
  onElementMove?: (elementId: string, newX: number, newY: number) => void
  onElementClick?: (elementId: string) => void
  onMoveBackToStaging?: (elementId: string) => void
  selectedElementId?: string | null
}

// 拖拽手柄组件 - 用于拖回staging
function BackToStagingHandle({ elementId, position }: { elementId: string; position: { x: number; y: number } }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `back-to-staging-${elementId}`,
    data: {
      type: 'canvas-to-staging',
      elementId,
    },
  })

  return (
    <g
      ref={setNodeRef as any}
      {...listeners}
      {...attributes}
      style={{ cursor: 'pointer' }}
    >
      {/* 使用foreignObject包裹，避免SVG坐标问题 */}
      <circle 
        cx={position.x} 
        cy={position.y} 
        r="0.3" 
        fill="white" 
        stroke="#2563EB" 
        strokeWidth="0.05"
        filter="drop-shadow(0 0.05 0.1 rgba(0,0,0,0.3))"
      />
      <path
        d={`M ${position.x - 0.12} ${position.y} L ${position.x + 0.12} ${position.y} M ${position.x - 0.08} ${position.y - 0.1} L ${position.x} ${position.y} L ${position.x - 0.08} ${position.y + 0.1}`}
        stroke="#2563EB"
        strokeWidth="0.06"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

export function SimpleManualCanvas({
  elements,
  boardSize,
  onElementMove,
  onElementClick,
  onMoveBackToStaging,
  selectedElementId,
}: SimpleManualCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  // 设置为drop target，接收从staging拖来的元素
  const { setNodeRef: setDropRef } = useDroppable({
    id: 'simple-canvas-drop-zone',
  })

  // 将屏幕坐标转换为SVG坐标（h空间）
  const screenToSVG = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    
    const pt = svgRef.current.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgPt = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse())
    
    return { x: svgPt.x, y: svgPt.y }
  }, [])

  // 开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent, element: PlacedElement) => {
    e.stopPropagation()
    
    const svgCoord = screenToSVG(e.clientX, e.clientY)
    setDraggingId(element.id)
    setDragOffset({
      x: svgCoord.x - element.box.x,
      y: svgCoord.y - element.box.y,
    })
    onElementClick?.(element.id)
  }, [screenToSVG, onElementClick])

  // 拖拽中
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingId || !onElementMove) return
    
    const svgCoord = screenToSVG(e.clientX, e.clientY)
    const newX = Math.max(0, Math.min(svgCoord.x - dragOffset.x, boardSize.w - 1))
    const newY = Math.max(0, Math.min(svgCoord.y - dragOffset.y, boardSize.h - 1))
    
    onElementMove(draggingId, newX, newY)
  }, [draggingId, dragOffset, screenToSVG, onElementMove, boardSize])

  // 结束拖拽
  const handleMouseUp = useCallback(() => {
    setDraggingId(null)
  }, [])

  // 监听全局鼠标事件
  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggingId, handleMouseMove, handleMouseUp])

  // 渲染单个元素
  const renderElement = (element: PlacedElement) => {
    const isSelected = element.id === selectedElementId
    const isHovered = element.id === hoveredId
    const isDragging = element.id === draggingId
    const showBackHandle = isSelected && onMoveBackToStaging
    
    // 安全边界
    const box = {
      x: Math.max(0, element.box.x),
      y: Math.max(0, element.box.y),
      w: Math.min(element.box.w, 15),
      h: Math.min(element.box.h, 5),
    }

    return (
      <g 
        key={element.id}
        opacity={isDragging ? 0.6 : 1}
        style={{ cursor: 'move' }}
      >
        {/* 选中高亮 */}
        {isSelected && (
          <rect
            x={box.x - 0.15}
            y={box.y - 0.15}
            width={box.w + 0.3}
            height={box.h + 0.3}
            fill="none"
            stroke="#2563EB"
            strokeWidth="0.12"
            rx="0.2"
            pointerEvents="none"
          />
        )}

        {/* 元素内容 */}
        {element.type === 'text' && (
          <text
            x={box.x + box.w / 2}
            y={box.y + box.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={box.h * 0.7}
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
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill="white"
              stroke="black"
              strokeWidth="0.05"
              pointerEvents="none"
            />
            <text
              x={box.x + box.w / 2}
              y={box.y + box.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={box.h * 0.6}
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
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill="#FFD700"
              stroke="black"
              strokeWidth="0.05"
              pointerEvents="none"
            />
            <text
              x={box.x + box.w / 2}
              y={box.y + box.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={box.h * 0.7}
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
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill="white"
              stroke="black"
              strokeWidth="0.05"
              pointerEvents="none"
            />
            <text
              x={box.x + box.w / 2}
              y={box.y + box.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={box.h * 0.6}
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
          const centerX = box.x + box.w / 2
          const centerY = box.y + box.h / 2
          const w = box.w * 0.7
          const h = box.h * 0.7
          const direction = element.config.direction || 'right'
          
          let points = ''
          if (direction === 'right') {
            points = `${centerX + w/2},${centerY} ${centerX - w/2},${centerY - h/2} ${centerX - w/2},${centerY + h/2}`
          } else if (direction === 'left') {
            points = `${centerX - w/2},${centerY} ${centerX + w/2},${centerY - h/2} ${centerX + w/2},${centerY + h/2}`
          } else {
            points = `${centerX},${centerY - h/2} ${centerX + w/2},${centerY + h/2} ${centerX - w/2},${centerY + h/2}`
          }
          
          return <polygon points={points} fill="white" pointerEvents="none" />
        })()}

        {/* 交互区域 - 关键！ */}
        <rect
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          fill="transparent"
          stroke={isSelected ? '#2563EB' : isHovered ? '#60A5FA' : '#CBD5E1'}
          strokeWidth={isSelected ? '0.08' : '0.04'}
          strokeDasharray={isSelected ? '' : '0.15 0.15'}
          strokeOpacity={isSelected ? 1 : 0.5}
          onMouseDown={(e) => handleMouseDown(e, element)}
          onMouseEnter={() => setHoveredId(element.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ cursor: 'move' }}
        />

        {/* 返回Staging手柄 - 只在选中时显示 */}
        {showBackHandle && (
          <BackToStagingHandle 
            elementId={element.id} 
            position={{ x: box.x - 0.4, y: box.y - 0.4 }}
          />
        )}
      </g>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-slate-50">
        <h2 className="font-semibold text-sm">Canvas</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Board: {boardSize.w.toFixed(1)} × {boardSize.h.toFixed(1)} h | {elements.length} elements
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💡 Click and drag elements to move them
        </p>
      </div>

      {/* Canvas */}
      <div 
        ref={setDropRef as any}
        className="flex-1 overflow-auto p-8 bg-slate-100" 
        data-canvas-container
      >
        <div className="inline-block bg-white shadow-lg">
          <svg
            ref={svgRef}
            width={boardSize.w * 100}
            height={boardSize.h * 100}
            viewBox={`0 0 ${boardSize.w} ${boardSize.h}`}
            className="border-2 border-slate-300"
            style={{ userSelect: 'none' }}
          >
            {/* 背景 */}
            <rect
              x="0"
              y="0"
              width={boardSize.w}
              height={boardSize.h}
              fill="#2D6A4F"
            />

            {/* 元素 */}
            {elements.map(renderElement)}
          </svg>
        </div>
      </div>
    </div>
  )
}

