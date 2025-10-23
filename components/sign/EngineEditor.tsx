'use client'

import { useCurrentDocument, useActions } from '@/store/signStore'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RotateCcw } from 'lucide-react'

export function EngineEditor() {
  const document = useCurrentDocument()
  const { updateEngine, resetEngine } = useActions()

  if (!document) return null

  const { engine } = document

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <Button variant="outline" size="sm" className="w-full" onClick={resetEngine}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Default
      </Button>

      {/* pxPerH */}
      <div>
        <h4 className="font-medium mb-3">Output Resolution</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="px-per-h" className="text-sm">
                Pixels per H (pxPerH)
              </Label>
              <span className="text-sm text-muted-foreground">{engine.pxPerH} px/h</span>
            </div>
            <Slider
              id="px-per-h"
              min={10}
              max={60}
              step={5}
              value={[engine.pxPerH]}
              onValueChange={([value]) => updateEngine({ pxPerH: value })}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Higher values = higher resolution output (larger file size)
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Snap Mode */}
      <div>
        <h4 className="font-medium mb-3">Pixel Alignment</h4>
        <div className="space-y-3">
          <Label htmlFor="snap-mode" className="text-sm">
            Snap Mode
          </Label>
          <select
            id="snap-mode"
            value={engine.snapMode}
            onChange={(e) => updateEngine({ snapMode: e.target.value as any })}
            className="w-full h-9 border border-input bg-background px-3 py-1 text-sm rounded-md"
          >
            <option value="round">Round (integer pixels)</option>
            <option value="half-pixel">Half-pixel (0.5)</option>
            <option value="none">None (no alignment)</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Controls how coordinates are aligned to pixel grid
          </p>
        </div>
      </div>

      <Separator />

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-sm">About Engine Parameters</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>pxPerH:</strong> Controls output resolution (30 = standard)</li>
          <li>• <strong>Snap Mode:</strong> Affects rendering sharpness</li>
          <li>• Higher pxPerH = sharper but larger files</li>
        </ul>
      </div>
    </div>
  )
}

