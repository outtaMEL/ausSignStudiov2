'use client'

/**
 * Dimension Overlay Component (Phase 6)
 * Engineering mode: Shows dimensions and spacing annotations
 * Click on blue labels to edit spacing values
 */

import { PlacedElement } from '@/lib/types'
import { useState } from 'react'

interface DimensionLine {
  type: 'width' | 'height' | 'spacing-h' | 'spacing-v'
  x1: number
  y1: number
  x2: number
  y2: number
  value: number
  label: string
  elementId?: string
  editable?: boolean
}

interface DimensionOverlayProps {
  elements: PlacedElement[]
  boardSize: { w: number; h: number }
  zoom: number
  onEditSpacing?: (elementId: string, dimension: 'width' | 'height', newValue: number) => void
}

export function DimensionOverlay({ 
  elements, 
  boardSize, 
  zoom,
  onEditSpacing 
}: DimensionOverlayProps) {
  const [editingDimension, setEditingDimension] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Generate dimension lines for all elements
  const dimensionLines: DimensionLine[] = []
  
  // Element dimensions
  elements.forEach((element) => {
    // Width dimension (top)
    dimensionLines.push({
      type: 'width',
      x1: element.box.x,
      y1: element.box.y - 0.3,
      x2: element.box.x + element.box.w,
      y2: element.box.y - 0.3,
      value: element.box.w,
      label: `${element.box.w.toFixed(2)}h`,
      elementId: element.id,
      editable: true,
    })

    // Height dimension (right)
    dimensionLines.push({
      type: 'height',
      x1: element.box.x + element.box.w + 0.3,
      y1: element.box.y,
      x2: element.box.x + element.box.w + 0.3,
      y2: element.box.y + element.box.h,
      value: element.box.h,
      label: `${element.box.h.toFixed(2)}h`,
      elementId: element.id,
      editable: true,
    })
  })

  // Spacing between elements (detect horizontal and vertical gaps)
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const e1 = elements[i]
      const e2 = elements[j]

      // Horizontal spacing
      const e1Right = e1.box.x + e1.box.w
      const e2Right = e2.box.x + e2.box.w
      
      // Check if e2 is to the right of e1
      if (e2.box.x >= e1Right) {
        const gap = e2.box.x - e1Right
        const overlapY = Math.min(e1.box.y + e1.box.h, e2.box.y + e2.box.h) - Math.max(e1.box.y, e2.box.y)
        
        if (overlapY > 0 && gap < boardSize.w * 0.3) {
          const midY = (Math.max(e1.box.y, e2.box.y) + Math.min(e1.box.y + e1.box.h, e2.box.y + e2.box.h)) / 2
          dimensionLines.push({
            type: 'spacing-h',
            x1: e1Right,
            y1: midY,
            x2: e2.box.x,
            y2: midY,
            value: gap,
            label: `${gap.toFixed(2)}h`,
            editable: false,
          })
        }
      }

      // Vertical spacing
      const e1Bottom = e1.box.y + e1.box.h
      const e2Bottom = e2.box.y + e2.box.h
      
      // Check if e2 is below e1
      if (e2.box.y >= e1Bottom) {
        const gap = e2.box.y - e1Bottom
        const overlapX = Math.min(e1.box.x + e1.box.w, e2.box.x + e2.box.w) - Math.max(e1.box.x, e2.box.x)
        
        if (overlapX > 0 && gap < boardSize.h * 0.3) {
          const midX = (Math.max(e1.box.x, e2.box.x) + Math.min(e1.box.x + e1.box.w, e2.box.x + e2.box.w)) / 2
          dimensionLines.push({
            type: 'spacing-v',
            x1: midX,
            y1: e1Bottom,
            x2: midX,
            y2: e2.box.y,
            value: gap,
            label: `${gap.toFixed(2)}h`,
            editable: false,
          })
        }
      }
    }
  }

  const handleLabelClick = (dimension: DimensionLine) => {
    if (!dimension.editable || !dimension.elementId) return
    
    setEditingDimension(`${dimension.elementId}-${dimension.type}`)
    setEditValue(dimension.value.toFixed(2))
  }

  const handleEditSubmit = (dimension: DimensionLine) => {
    if (!dimension.elementId) return
    
    const newValue = parseFloat(editValue)
    if (isNaN(newValue) || newValue <= 0) return
    
    onEditSpacing?.(dimension.elementId, dimension.type as 'width' | 'height', newValue)
    setEditingDimension(null)
  }

  const handleEditCancel = () => {
    setEditingDimension(null)
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox={`0 0 ${boardSize.w} ${boardSize.h}`}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* Grid */}
      <defs>
        <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#E5E7EB" strokeWidth="0.01" />
        </pattern>
      </defs>
      <rect width={boardSize.w} height={boardSize.h} fill="url(#grid)" />

      {/* Dimension lines */}
      {dimensionLines.map((dim, idx) => {
        const isHorizontal = dim.type === 'width' || dim.type === 'spacing-h'
        const isEditing = editingDimension === `${dim.elementId}-${dim.type}`
        
        const midX = (dim.x1 + dim.x2) / 2
        const midY = (dim.y1 + dim.y2) / 2
        
        const color = dim.type.startsWith('spacing') ? '#F59E0B' : '#3B82F6'
        const strokeWidth = dim.type.startsWith('spacing') ? 0.02 : 0.015

        return (
          <g key={idx}>
            {/* Extension lines (for width/height) */}
            {(dim.type === 'width' || dim.type === 'height') && (
              <>
                {/* Start extension */}
                <line
                  x1={dim.x1}
                  y1={dim.type === 'width' ? dim.y1 : dim.y1 - 0.1}
                  x2={dim.x1}
                  y2={dim.type === 'width' ? dim.y1 + 0.15 : dim.y1}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  opacity={0.6}
                />
                {/* End extension */}
                <line
                  x1={dim.x2}
                  y1={dim.type === 'width' ? dim.y2 : dim.y2}
                  x2={dim.x2}
                  y2={dim.type === 'width' ? dim.y2 + 0.15 : dim.y2 + 0.1}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  opacity={0.6}
                />
              </>
            )}

            {/* Main dimension line */}
            <line
              x1={dim.x1}
              y1={dim.y1}
              x2={dim.x2}
              y2={dim.y2}
              stroke={color}
              strokeWidth={strokeWidth}
              markerStart="url(#arrow-start)"
              markerEnd="url(#arrow-end)"
              opacity={0.8}
            />

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrow-start"
                markerWidth="4"
                markerHeight="4"
                refX="0"
                refY="2"
                orient="auto"
              >
                <polygon points="0,2 4,0 4,4" fill={color} />
              </marker>
              <marker
                id="arrow-end"
                markerWidth="4"
                markerHeight="4"
                refX="4"
                refY="2"
                orient="auto"
              >
                <polygon points="4,2 0,0 0,4" fill={color} />
              </marker>
            </defs>

            {/* Label background */}
            <rect
              x={midX - 0.3}
              y={midY - 0.15}
              width={0.6}
              height={0.3}
              fill={dim.editable ? color : '#94A3B8'}
              opacity={0.9}
              rx={0.05}
              className={dim.editable ? 'pointer-events-auto cursor-pointer' : ''}
              onClick={() => handleLabelClick(dim)}
            />

            {/* Label text */}
            {!isEditing ? (
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={0.12}
                fill="white"
                fontFamily="monospace"
                fontWeight="bold"
                className={dim.editable ? 'pointer-events-auto cursor-pointer' : ''}
                onClick={() => handleLabelClick(dim)}
              >
                {dim.label}
              </text>
            ) : (
              <foreignObject
                x={midX - 0.25}
                y={midY - 0.12}
                width={0.5}
                height={0.24}
                className="pointer-events-auto"
              >
                <input
                  type="number"
                  step="0.1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleEditSubmit(dim)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSubmit(dim)
                    if (e.key === 'Escape') handleEditCancel()
                  }}
                  autoFocus
                  className="w-full h-full text-center text-xs font-mono font-bold bg-blue-600 text-white border-2 border-blue-400 rounded"
                  style={{ fontSize: '12px' }}
                />
              </foreignObject>
            )}
          </g>
        )
      })}

      {/* Legend */}
      <g transform={`translate(0.2, ${boardSize.h - 0.8})`}>
        <rect x="0" y="0" width="2.5" height="0.7" fill="white" opacity="0.9" rx="0.05" />
        <text x="0.15" y="0.25" fontSize={0.1} fontWeight="bold" fill="#1F2937">
          Engineering Mode
        </text>
        <circle cx="0.2" cy="0.45" r="0.05" fill="#3B82F6" />
        <text x="0.3" y="0.5" fontSize={0.08} fill="#4B5563">
          Dimensions
        </text>
        <circle cx="1" cy="0.45" r="0.05" fill="#F59E0B" />
        <text x="1.1" y="0.5" fontSize={0.08} fill="#4B5563">
          Spacing
        </text>
      </g>
    </svg>
  )
}
