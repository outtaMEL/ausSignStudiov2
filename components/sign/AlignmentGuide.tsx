'use client'

/**
 * Alignment Guide Component
 * Shows reference lines when dragging elements
 * Provides visual feedback for alignment opportunities
 */

import { AlignmentPoint } from '@/lib/types'

interface AlignmentLine {
  type: 'horizontal' | 'vertical'
  position: number  // in h-space
  strength: 'weak' | 'strong'
  label?: string
}

interface AlignmentGuideProps {
  lines: AlignmentLine[]
  boardSize: { w: number; h: number }
  pxPerH: number
  zoom: number
}

export function AlignmentGuide({ 
  lines, 
  boardSize, 
  pxPerH, 
  zoom 
}: AlignmentGuideProps) {
  if (lines.length === 0) return null

  const scale = zoom / 100

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: `${boardSize.w * pxPerH * scale}px`,
        height: `${boardSize.h * pxPerH * scale}px`,
      }}
    >
      {lines.map((line, index) => {
        const color = line.strength === 'strong' ? '#3b82f6' : '#93c5fd'
        const strokeWidth = line.strength === 'strong' ? 2 : 1

        if (line.type === 'vertical') {
          const x = line.position * pxPerH * scale
          return (
            <g key={index}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={boardSize.h * pxPerH * scale}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
                opacity={0.8}
              />
              {line.label && (
                <text
                  x={x + 4}
                  y={12}
                  fill={color}
                  fontSize={10}
                  fontWeight="bold"
                >
                  {line.label}
                </text>
              )}
            </g>
          )
        } else {
          const y = line.position * pxPerH * scale
          return (
            <g key={index}>
              <line
                x1={0}
                y1={y}
                x2={boardSize.w * pxPerH * scale}
                y2={y}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
                opacity={0.8}
              />
              {line.label && (
                <text
                  x={4}
                  y={y - 4}
                  fill={color}
                  fontSize={10}
                  fontWeight="bold"
                >
                  {line.label}
                </text>
              )}
            </g>
          )
        }
      })}
    </svg>
  )
}

