'use client'

/**
 * Spacing Warning Component
 * Shows warnings when elements violate minimum spacing rules
 */

import { AlertTriangle } from 'lucide-react'

interface SpacingViolation {
  elem1Id: string
  elem2Id: string
  currentSpacing: number
  minRequired: number
  direction: 'horizontal' | 'vertical'
}

interface SpacingWarningProps {
  violations: SpacingViolation[]
  boardSize: { w: number; h: number }
  pxPerH: number
  zoom: number
}

export function SpacingWarning({ 
  violations, 
  boardSize, 
  pxPerH, 
  zoom 
}: SpacingWarningProps) {
  if (violations.length === 0) return null

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-yellow-900">
              Spacing Warnings
            </h3>
            <p className="text-xs text-yellow-800 mt-1">
              {violations.length} element pair{violations.length > 1 ? 's' : ''} violate minimum spacing
            </p>
            <ul className="text-xs text-yellow-700 mt-2 space-y-1">
              {violations.slice(0, 3).map((v, i) => (
                <li key={i}>
                  • {v.direction}: {v.currentSpacing.toFixed(2)}h 
                  (min: {v.minRequired.toFixed(2)}h)
                </li>
              ))}
              {violations.length > 3 && (
                <li className="text-yellow-600">
                  + {violations.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

