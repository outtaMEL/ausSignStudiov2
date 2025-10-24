'use client'

/**
 * 元素配置对话框
 * 用户点击元素库时弹出，输入元素参数
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { ElementType, ElementConfig } from '@/lib/types'

interface ElementConfigDialogProps {
  elementType: ElementType
  onConfirm: (config: ElementConfig) => void
  onCancel: () => void
}

export function ElementConfigDialog({
  elementType,
  onConfirm,
  onCancel,
}: ElementConfigDialogProps) {
  const [config, setConfig] = useState<ElementConfig>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(config)
  }

  const renderConfigFields = () => {
    switch (elementType) {
      case 'text':
        return (
          <>
            <div>
              <Label htmlFor="text">Text Content</Label>
              <Input
                id="text"
                value={config.text || ''}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="Enter text..."
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="letter_h">Letter Height (h)</Label>
              <Input
                id="letter_h"
                type="number"
                step="0.1"
                value={config.letter_h || 1}
                onChange={(e) => setConfig({ ...config, letter_h: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )

      case 'roadName':
        return (
          <>
            <div>
              <Label htmlFor="text">Road Name</Label>
              <Input
                id="text"
                value={config.text || ''}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="MAIN ST"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="letter_h">Letter Height (h)</Label>
              <Input
                id="letter_h"
                type="number"
                step="0.1"
                value={config.letter_h || 1}
                onChange={(e) => setConfig({ ...config, letter_h: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="pad_h">Padding (h)</Label>
              <Input
                id="pad_h"
                type="number"
                step="0.05"
                value={config.pad_h || 0.15}
                onChange={(e) => setConfig({ ...config, pad_h: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )

      case 'roadNumber':
        return (
          <>
            <div>
              <Label htmlFor="text">Road Number</Label>
              <Input
                id="text"
                value={config.text || ''}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="A85"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="letter_h">Letter Height (h)</Label>
              <Input
                id="letter_h"
                type="number"
                step="0.1"
                value={config.letter_h || 0.8}
                onChange={(e) => setConfig({ ...config, letter_h: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )

      case 'shield':
        return (
          <>
            <div>
              <Label htmlFor="label">Shield Label</Label>
              <Input
                id="label"
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="M1"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="letter_h">Height (h)</Label>
              <Input
                id="letter_h"
                type="number"
                step="0.1"
                value={config.letter_h || 1}
                onChange={(e) => setConfig({ ...config, letter_h: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )

      case 'arrow':
        return (
          <>
            <div>
              <Label htmlFor="direction">Direction</Label>
              <select
                id="direction"
                value={config.direction || 'forward'}
                onChange={(e) => setConfig({ ...config, direction: e.target.value as any })}
                className="w-full h-9 text-sm border rounded px-3"
              >
                <option value="forward">Forward ↑</option>
                <option value="left">Left ←</option>
                <option value="right">Right →</option>
              </select>
            </div>
            <div>
              <Label htmlFor="letter_h">Height (h)</Label>
              <Input
                id="letter_h"
                type="number"
                step="0.1"
                value={config.letter_h || 1}
                onChange={(e) => setConfig({ ...config, letter_h: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )

      case 'composite':
        return (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">Composite elements coming in future versions</p>
          </div>
        )

      case 'board':
        return (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">Nested Board coming in future versions</p>
          </div>
        )

      default:
        return null
    }
  }

  const getTitle = () => {
    const titles: Record<string, string> = {
      text: 'Create Text Element',
      roadName: 'Create Road Name',
      roadNumber: 'Create Road Number',
      shield: 'Create Shield',
      arrow: 'Create Arrow',
      composite: 'Create Composite',
      board: 'Create Nested Board',
    }
    return titles[elementType] || 'Create Element'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b">
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {renderConfigFields()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={elementType === 'composite' || elementType === 'board'}
            >
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

