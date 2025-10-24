'use client'

/**
 * 元素库组件（第一列）
 * 显示所有可用的元素类型
 * Phase 4: 点击创建元素
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { 
  Type, 
  Navigation, 
  Shield, 
  MoveRight,
  Square,
  Layers,
  Plus
} from 'lucide-react'
import { ElementType, ElementConfig } from '@/lib/types'
import { ElementConfigDialog } from './ElementConfigDialog'

interface ElementTemplate {
  type: ElementType
  name: string
  description: string
  icon: React.ReactNode
  category: 'text' | 'symbols' | 'composite'
}

const elementTemplates: ElementTemplate[] = [
  // Text elements
  {
    type: 'text',
    name: 'Plain Text',
    description: 'Simple text element',
    icon: <Type className="h-5 w-5" />,
    category: 'text',
  },
  {
    type: 'roadName',
    name: 'Road Name',
    description: 'White bg, black text',
    icon: <Square className="h-5 w-5" />,
    category: 'text',
  },
  {
    type: 'roadNumber',
    name: 'Road Number',
    description: 'Yellow road number',
    icon: <Square className="h-5 w-5" />,
    category: 'text',
  },
  
  // Symbols
  {
    type: 'shield',
    name: 'Shield',
    description: 'M1, M2 shields',
    icon: <Shield className="h-5 w-5" />,
    category: 'symbols',
  },
  {
    type: 'arrow',
    name: 'Arrow',
    description: 'Direction arrow',
    icon: <MoveRight className="h-5 w-5" />,
    category: 'symbols',
  },
  
  // Composite
  {
    type: 'composite',
    name: 'Composite',
    description: 'Combined elements',
    icon: <Layers className="h-5 w-5" />,
    category: 'composite',
  },
  {
    type: 'board',
    name: 'Nested Board',
    description: 'Board within board',
    icon: <Navigation className="h-5 w-5" />,
    category: 'composite',
  },
]

const categories = [
  { id: 'text', name: 'Text Elements', icon: <Type className="h-4 w-4" /> },
  { id: 'symbols', name: 'Symbol Elements', icon: <Shield className="h-4 w-4" /> },
  { id: 'composite', name: 'Composite Elements', icon: <Layers className="h-4 w-4" /> },
]

interface ElementLibraryProps {
  onCreateElement?: (type: ElementType, config: ElementConfig) => void
}

export function ElementLibrary({ onCreateElement }: ElementLibraryProps) {
  const [selectedType, setSelectedType] = useState<ElementType | null>(null)

  const handleElementClick = (type: ElementType) => {
    setSelectedType(type)
  }

  const handleConfirm = (config: ElementConfig) => {
    if (selectedType && onCreateElement) {
      onCreateElement(selectedType, config)
    }
    setSelectedType(null)
  }

  const handleCancel = () => {
    setSelectedType(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-slate-50">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Element Library
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click to add elements
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {categories.map((category) => {
          const elements = elementTemplates.filter(
            (el) => el.category === category.id
          )

          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-muted-foreground">{category.icon}</div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                  {category.name}
                </h3>
              </div>

              <div className="space-y-2">
                {elements.map((element) => (
                  <Card
                    key={element.type}
                    className="p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                    onClick={() => handleElementClick(element.type)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100 transition-colors">
                        {element.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{element.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {element.description}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Tip */}
      <div className="px-4 py-3 border-t bg-green-50 text-xs text-green-800">
        <p className="flex items-start gap-2">
          <span className="font-bold">💡 Tip:</span>
          <span>Click to create elements</span>
        </p>
      </div>

      {/* Config Dialog */}
      {selectedType && (
        <ElementConfigDialog
          elementType={selectedType}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

