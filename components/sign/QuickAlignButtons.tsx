'use client'

/**
 * Quick Align Buttons
 * Hover on element to show alignment options
 * One-click align to board edges
 */

import { Button } from '@/components/ui/button'
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react'

interface QuickAlignButtonsProps {
  elementId: string
  onAlign: (elementId: string, direction: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void
  position: { x: number; y: number }  // Position in px to show buttons
}

export function QuickAlignButtons({ 
  elementId, 
  onAlign, 
  position 
}: QuickAlignButtonsProps) {
  const buttonClass = "h-7 w-7 p-0 bg-white/90 hover:bg-blue-100 shadow-md"

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 40}px`,
      }}
    >
      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
        {/* Horizontal alignment */}
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass}
          onClick={() => onAlign(elementId, 'left')}
          title="Align Left"
        >
          <AlignHorizontalJustifyStart className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass}
          onClick={() => onAlign(elementId, 'center')}
          title="Align Center"
        >
          <AlignHorizontalJustifyCenter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass}
          onClick={() => onAlign(elementId, 'right')}
          title="Align Right"
        >
          <AlignHorizontalJustifyEnd className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Vertical alignment */}
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass}
          onClick={() => onAlign(elementId, 'top')}
          title="Align Top"
        >
          <AlignVerticalJustifyStart className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass}
          onClick={() => onAlign(elementId, 'middle')}
          title="Align Middle"
        >
          <AlignVerticalJustifyCenter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass}
          onClick={() => onAlign(elementId, 'bottom')}
          title="Align Bottom"
        >
          <AlignVerticalJustifyEnd className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

