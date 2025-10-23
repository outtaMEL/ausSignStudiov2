'use client'

import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useCurrentDocument, useActions } from '@/store/signStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function PanelEditor() {
  const document = useCurrentDocument()
  const { updatePanel, addPanel, removePanel, movePanelUp, movePanelDown } = useActions()

  if (!document) return null

  return (
    <div className="space-y-4">
      {document.panels.map((panel, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Panel {index + 1}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => movePanelUp(index)}
                  disabled={index === 0}
                  title="Move Up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => movePanelDown(index)}
                  disabled={index === document.panels.length - 1}
                  title="Move Down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => removePanel(index)}
                  disabled={document.panels.length <= 2}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Road Name */}
            <div>
              <Label htmlFor={`roadName-${index}`} className="text-xs">
                Road Name
              </Label>
              <Input
                id={`roadName-${index}`}
                value={panel.roadName}
                onChange={(e) => updatePanel(index, { roadName: e.target.value })}
                placeholder="SALTASH HWY"
                className="h-9"
              />
            </div>

            {/* Road Number Type */}
            <div>
              <Label className="text-xs">Road Number Type</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={panel.roadNumberType === 'none' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePanel(index, { roadNumberType: 'none' })}
                >
                  None
                </Button>
                <Button
                  variant={panel.roadNumberType === 'shield' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePanel(index, { roadNumberType: 'shield' })}
                >
                  Shield
                </Button>
                <Button
                  variant={panel.roadNumberType === 'number' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePanel(index, { roadNumberType: 'number' })}
                >
                  Number
                </Button>
              </div>
            </div>

            {/* Shield Label */}
            {panel.roadNumberType === 'shield' && (
              <div>
                <Label htmlFor={`shield-${index}`} className="text-xs">
                  Shield Label
                </Label>
                <Input
                  id={`shield-${index}`}
                  value={panel.shieldLabel}
                  onChange={(e) => updatePanel(index, { shieldLabel: e.target.value })}
                  placeholder="M1"
                  className="h-9"
                />
              </div>
            )}

            {/* Road Number */}
            {panel.roadNumberType === 'number' && (
              <div>
                <Label htmlFor={`roadNumber-${index}`} className="text-xs">
                  Road Number
                </Label>
                <Input
                  id={`roadNumber-${index}`}
                  value={panel.roadNumber}
                  onChange={(e) => updatePanel(index, { roadNumber: e.target.value })}
                  placeholder="A85"
                  className="h-9"
                />
              </div>
            )}

            <Separator />

            {/* Destinations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Destinations</Label>
                {panel.destinations.length < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      const newDestinations = [...panel.destinations, '']
                      updatePanel(index, { destinations: newDestinations })
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              {panel.destinations.map((dest, destIndex) => (
                <div key={destIndex} className="flex gap-2 mt-2">
                  <Input
                    value={dest}
                    onChange={(e) => {
                      const newDestinations = [...panel.destinations]
                      newDestinations[destIndex] = e.target.value
                      updatePanel(index, { destinations: newDestinations })
                    }}
                    placeholder={`Destination ${destIndex + 1}`}
                    className="h-9"
                  />
                  {panel.destinations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      onClick={() => {
                        const newDestinations = panel.destinations.filter((_, i) => i !== destIndex)
                        updatePanel(index, { destinations: newDestinations })
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Direction */}
            <div>
              <Label className="text-xs">Direction</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={panel.direction === 'left' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePanel(index, { direction: 'left' })}
                >
                  ← Left
                </Button>
                <Button
                  variant={panel.direction === 'forward' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePanel(index, { direction: 'forward' })}
                >
                  ↑ Forward
                </Button>
                <Button
                  variant={panel.direction === 'right' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updatePanel(index, { direction: 'right' })}
                >
                  Right →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Panel Button */}
      {document.panels.length < 3 && (
        <Button variant="outline" className="w-full" onClick={addPanel}>
          <Plus className="h-4 w-4 mr-2" />
          Add Panel
        </Button>
      )}
    </div>
  )
}
