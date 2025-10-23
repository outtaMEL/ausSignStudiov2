'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Download,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Maximize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentDocument, useCurrentLayout, useUI, useActions } from '@/store/signStore'
import { SignCanvas, PanelEditor, TemplateEditor, EngineEditor } from '@/components/sign'
import { toSVG, downloadSVG } from '@/lib/engine'

export default function EditorPage() {
  const router = useRouter()
  const document = useCurrentDocument()
  const layout = useCurrentLayout()
  const ui = useUI()
  const { saveDocument, setPreviewScale, toggleGrid, toggleGuides, setActiveTab } = useActions()

  // 如果没有文档，跳转回首页
  useEffect(() => {
    if (!document) {
      router.push('/')
    }
  }, [document, router])

  if (!document) {
    return null
  }

  const handleSave = () => {
    saveDocument()
    // TODO: 显示保存成功提示
  }

  const handleDownload = () => {
    if (!layout) return
    downloadSVG(layout, `${document.name}.svg`, {
      backgroundColor: '#0B6B4D',
      includeGuides: ui.showGuides,
      includeGrid: ui.showGrid,
    })
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="font-semibold">{document.name}</h1>
            <p className="text-xs text-muted-foreground">{document.signType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} disabled={!layout}>
            <Download className="h-4 w-4 mr-2" />
            Export SVG
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Panel Editor */}
        <div className="w-80 border-r bg-white overflow-y-auto no-print">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Panel Editor</h2>
            <PanelEditor />
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-2 flex items-center gap-2 no-print">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewScale(Math.max(0.1, ui.previewScale - 0.1))}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {Math.round(ui.previewScale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewScale(Math.min(2, ui.previewScale + 0.1))}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleGrid}
              title="Toggle Grid"
              className={ui.showGrid ? 'bg-accent' : ''}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleGuides}
              title="Toggle Guides"
              className={ui.showGuides ? 'bg-accent' : ''}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Canvas */}
          <SignCanvas />
        </div>

        {/* Right Sidebar - Settings */}
        <div className="w-96 border-l bg-white overflow-y-auto no-print">
          <Tabs value={ui.activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full">
            <TabsList className="w-full justify-start rounded-none border-b px-4">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="engine">Engine</TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="properties" className="mt-0">
                <h3 className="font-semibold mb-4">Document Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Document Name</label>
                    <input
                      type="text"
                      value={document.name}
                      onChange={(e) => {
                        // TODO: Implement name editing
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sign Type</label>
                    <div className="mt-1 px-3 py-2 bg-muted rounded-md text-sm">
                      {document.signType}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="template" className="mt-0">
                <h3 className="font-semibold mb-4">Template Parameters</h3>
                <TemplateEditor />
              </TabsContent>

              <TabsContent value="engine" className="mt-0">
                <h3 className="font-semibold mb-4">Engine Settings</h3>
                <EngineEditor />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

