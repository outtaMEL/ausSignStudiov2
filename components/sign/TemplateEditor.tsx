'use client'

import { useCurrentDocument, useActions } from '@/store/signStore'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { RotateCcw } from 'lucide-react'

export function TemplateEditor() {
  const document = useCurrentDocument()
  const { updateTemplate, resetTemplate } = useActions()

  if (!document) return null

  const { template } = document

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <Button variant="outline" size="sm" className="w-full" onClick={resetTemplate}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Default
      </Button>

      {/* Basic Spacing */}
      <div>
        <h4 className="font-medium mb-3">Basic Spacing</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="letter-height" className="text-sm">
                Letter Height
              </Label>
              <span className="text-sm text-muted-foreground">{template.letter_height_h}h</span>
            </div>
            <Slider
              id="letter-height"
              min={4}
              max={12}
              step={0.5}
              value={[template.letter_height_h]}
              onValueChange={([value]) => updateTemplate({ letter_height_h: value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="line-spacing" className="text-sm">
                Line Spacing
              </Label>
              <span className="text-sm text-muted-foreground">{template.line_spacing_h}h</span>
            </div>
            <Slider
              id="line-spacing"
              min={0.25}
              max={2}
              step={0.25}
              value={[template.line_spacing_h]}
              onValueChange={([value]) => updateTemplate({ line_spacing_h: value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="group-spacing" className="text-sm">
                Group Spacing
              </Label>
              <span className="text-sm text-muted-foreground">{template.group_spacing_h}h</span>
            </div>
            <Slider
              id="group-spacing"
              min={0.5}
              max={3}
              step={0.25}
              value={[template.group_spacing_h]}
              onValueChange={([value]) => updateTemplate({ group_spacing_h: value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="board-pad" className="text-sm">
                Board Padding
              </Label>
              <span className="text-sm text-muted-foreground">{template.board_pad_h}h</span>
            </div>
            <Slider
              id="board-pad"
              min={0.25}
              max={3}
              step={0.25}
              value={[template.board_pad_h]}
              onValueChange={([value]) => updateTemplate({ board_pad_h: value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="panel-spacing" className="text-sm">
                Panel Spacing
              </Label>
              <span className="text-sm text-muted-foreground">{template.panel_spacing_h}h</span>
            </div>
            <Slider
              id="panel-spacing"
              min={0.1}
              max={1}
              step={0.1}
              value={[template.panel_spacing_h]}
              onValueChange={([value]) => updateTemplate({ panel_spacing_h: value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Road Name Style */}
      <div>
        <h4 className="font-medium mb-3">Road Name Style</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="roadName-height" className="text-sm">
                Letter Height
              </Label>
              <span className="text-sm text-muted-foreground">
                {template.roadName_letter_height_h}h
              </span>
            </div>
            <Slider
              id="roadName-height"
              min={3}
              max={10}
              step={0.5}
              value={[template.roadName_letter_height_h]}
              onValueChange={([value]) => updateTemplate({ roadName_letter_height_h: value })}
            />
          </div>

          <div>
            <Label htmlFor="roadName-bgColor" className="text-sm">
              Background Color
            </Label>
            <Input
              id="roadName-bgColor"
              type="color"
              value={template.roadName_bg_color}
              onChange={(e) => updateTemplate({ roadName_bg_color: e.target.value })}
              className="h-9 w-full"
            />
          </div>

          <div>
            <Label htmlFor="roadName-textColor" className="text-sm">
              Text Color
            </Label>
            <Input
              id="roadName-textColor"
              type="color"
              value={template.roadName_text_color}
              onChange={(e) => updateTemplate({ roadName_text_color: e.target.value })}
              className="h-9 w-full"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Road Number Style */}
      <div>
        <h4 className="font-medium mb-3">Road Number Style</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="roadNumber-height" className="text-sm">
                Letter Height
              </Label>
              <span className="text-sm text-muted-foreground">
                {template.roadNumber_letter_height_h}h
              </span>
            </div>
            <Slider
              id="roadNumber-height"
              min={3}
              max={12}
              step={0.5}
              value={[template.roadNumber_letter_height_h]}
              onValueChange={([value]) => updateTemplate({ roadNumber_letter_height_h: value })}
            />
          </div>

          <div>
            <Label htmlFor="roadNumber-bgColor" className="text-sm">
              Background Color
            </Label>
            <Input
              id="roadNumber-bgColor"
              type="color"
              value={template.roadNumber_bg_color}
              onChange={(e) => updateTemplate({ roadNumber_bg_color: e.target.value })}
              className="h-9 w-full"
            />
          </div>

          <div>
            <Label htmlFor="roadNumber-textColor" className="text-sm">
              Text Color
            </Label>
            <Input
              id="roadNumber-textColor"
              type="color"
              value={template.roadNumber_text_color}
              onChange={(e) => updateTemplate({ roadNumber_text_color: e.target.value })}
              className="h-9 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

