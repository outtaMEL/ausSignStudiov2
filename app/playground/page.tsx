'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { computeLayout, toSVG, downloadSVG } from '@/lib/engine'
import { DEFAULT_TEMPLATE, DEFAULT_FONT_METRICS } from '@/lib/defaults'
import { LayoutModel, PanelInput, ShieldType, DirectionType } from '@/lib/types'
import { Download, FileJson } from 'lucide-react'

/**
 * 🧪 Playground - Standalone D1-D4 Engine Testing
 * 
 * Features:
 * 1. Real-time parameter adjustment
 * 2. View intermediate results (Layout Model JSON)
 * 3. Export SVG and configuration
 * 4. Fully independent from main app state
 */
export default function PlaygroundPage() {
  // Panel inputs (matching old project defaults)
  const [panels, setPanels] = useState<PanelInput[]>([
    {
      roadName: 'SALTASH HWY',
      roadNumberType: 'shield',
      roadNumber: '',
      shieldLabel: 'M1',
      destinations: ['Plumpton'],
      direction: 'left',
      alignOverride: {
        centerGroup: null,
        roadNumber: null,
        arrow: null,
      },
    },
    {
      roadName: '',
      roadNumberType: 'number',
      roadNumber: 'A85',
      shieldLabel: '',
      destinations: ['Hawker'],
      direction: 'right',
      alignOverride: {
        centerGroup: null,
        roadNumber: null,
        arrow: null,
      },
    },
  ])

  // Template parameters
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)

  // Engine parameters
  const [pxPerH, setPxPerH] = useState(30)

  // Font metrics
  const [fontMetrics, setFontMetrics] = useState(DEFAULT_FONT_METRICS)

  // Layout result
  const [layout, setLayout] = useState<LayoutModel | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-compute layout on any change
  useEffect(() => {
    try {
      setError(null)
      // Clean panels: filter out empty destinations before passing to engine
      const cleanedPanels = panels.map(panel => ({
        ...panel,
        destinations: panel.destinations.filter(d => d.trim())
      }))
      const result = computeLayout({
        input: { panels: cleanedPanels },
        template,
        pxPerH,
        fontMetrics,
      })
      setLayout(result)
    } catch (err: any) {
      setError(err.message)
      setLayout(null)
    }
  }, [panels, template, pxPerH, fontMetrics])

  // Update panel field
  const updatePanel = (idx: number, field: keyof PanelInput, value: any) => {
    const newPanels = [...panels]
    ;(newPanels[idx] as any)[field] = value
    setPanels(newPanels)
  }

  // Update destinations
  const updateDestinations = (idx: number, value: string) => {
    const newPanels = [...panels]
    // Split by newline, keep empty lines during editing, filter only truly empty ones
    const lines = value.split('\n')
    newPanels[idx].destinations = lines.length === 1 && !lines[0].trim() ? [] : lines
    setPanels(newPanels)
  }

  // Download SVG
  const handleDownloadSVG = () => {
    if (!layout) return
    downloadSVG(layout, 'playground-sign.svg', { backgroundColor: '#0B6B4D' })
  }

  // Download config JSON
  const handleDownloadConfig = () => {
    // Clean panels before export
    const cleanedPanels = panels.map(panel => ({
      ...panel,
      destinations: panel.destinations.filter(d => d.trim())
    }))
    const config = { panels: cleanedPanels, template, pxPerH, fontMetrics }
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'playground-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sign-green">🧪 Engine Playground</h1>
            <p className="text-sm text-muted-foreground">Standalone D1-D4 Engine Testing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadConfig}>
              <FileJson className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSVG} disabled={!layout}>
              <Download className="h-4 w-4 mr-2" />
              Export SVG
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Inputs */}
          <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
            {/* Panel Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Panel Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {panels.map((panel, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold">Panel {idx + 1}</h4>
                    
                    <div>
                      <Label className="text-xs">Road Name (white bg, black text)</Label>
                      <Input
                        value={panel.roadName}
                        onChange={(e) => updatePanel(idx, 'roadName', e.target.value)}
                        placeholder="SALTASH HWY"
                        className="h-8 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Road Number Type</Label>
                      <select
                        value={panel.roadNumberType}
                        onChange={(e) => updatePanel(idx, 'roadNumberType', e.target.value as ShieldType)}
                        className="w-full h-8 text-sm border rounded px-2"
                      >
                        <option value="none">None</option>
                        <option value="number">Road Number (yellow text)</option>
                        <option value="shield">Shield</option>
                      </select>
                    </div>

                    {panel.roadNumberType === 'number' && (
                      <div>
                        <Label className="text-xs">Road Number (yellow text)</Label>
                        <Input
                          value={panel.roadNumber}
                          onChange={(e) => updatePanel(idx, 'roadNumber', e.target.value)}
                          placeholder="A85"
                          className="h-8 text-sm"
                        />
                      </div>
                    )}

                    {panel.roadNumberType === 'shield' && (
                      <div>
                        <Label className="text-xs">Shield Label</Label>
                        <Input
                          value={panel.shieldLabel}
                          onChange={(e) => updatePanel(idx, 'shieldLabel', e.target.value)}
                          placeholder="M1"
                          className="h-8 text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs">Destinations (one per line)</Label>
                      <textarea
                        value={panel.destinations.join('\n')}
                        onChange={(e) => updateDestinations(idx, e.target.value)}
                        placeholder="Plumpton&#10;Melbourne"
                        className="w-full text-sm border rounded px-3 py-2 min-h-[60px]"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Direction</Label>
                      <div className="flex gap-2 mt-1">
                        {(['left', 'forward', 'right'] as const).map((dir) => (
                          <Button
                            key={dir}
                            variant={panel.direction === dir ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => updatePanel(idx, 'direction', dir)}
                          >
                            {dir === 'left' ? '← Left' : dir === 'forward' ? '↑ Forward' : '→ Right'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Advanced Alignment
                      </summary>
                      <div className="mt-2 space-y-2">
                        <div>
                          <Label className="text-xs">Destinations Group</Label>
                          <select
                            value={panel.alignOverride?.centerGroup || ''}
                            onChange={(e) => updatePanel(idx, 'alignOverride', {
                              ...panel.alignOverride,
                              centerGroup: e.target.value || null
                            })}
                            className="w-full h-7 text-xs border rounded px-2"
                          >
                            <option value="">Default (follow direction)</option>
                            <option value="left">Force Left</option>
                            <option value="right">Force Right</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Road Number</Label>
                          <select
                            value={panel.alignOverride?.roadNumber || ''}
                            onChange={(e) => updatePanel(idx, 'alignOverride', {
                              ...panel.alignOverride,
                              roadNumber: e.target.value || null
                            })}
                            className="w-full h-7 text-xs border rounded px-2"
                          >
                            <option value="">Default</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Arrow</Label>
                          <select
                            value={panel.alignOverride?.arrow || ''}
                            onChange={(e) => updatePanel(idx, 'alignOverride', {
                              ...panel.alignOverride,
                              arrow: e.target.value || null
                            })}
                            className="w-full h-7 text-xs border rounded px-2"
                          >
                            <option value="">Default</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Template Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Template Parameters (D3)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">letter_height_h</Label>
                    <span className="text-xs text-muted-foreground">{template.letter_height_h}h</span>
                  </div>
                  <Slider
                    min={4}
                    max={12}
                    step={0.5}
                    value={[template.letter_height_h]}
                    onValueChange={([v]) => setTemplate({ ...template, letter_height_h: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">line_spacing_h</Label>
                    <span className="text-xs text-muted-foreground">{template.line_spacing_h}h</span>
                  </div>
                  <Slider
                    min={0.25}
                    max={2}
                    step={0.25}
                    value={[template.line_spacing_h]}
                    onValueChange={([v]) => setTemplate({ ...template, line_spacing_h: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">group_spacing_h</Label>
                    <span className="text-xs text-muted-foreground">{template.group_spacing_h}h</span>
                  </div>
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.25}
                    value={[template.group_spacing_h]}
                    onValueChange={([v]) => setTemplate({ ...template, group_spacing_h: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">board_pad_h</Label>
                    <span className="text-xs text-muted-foreground">{template.board_pad_h}h</span>
                  </div>
                  <Slider
                    min={0.25}
                    max={3}
                    step={0.25}
                    value={[template.board_pad_h]}
                    onValueChange={([v]) => setTemplate({ ...template, board_pad_h: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">corner_radius_h</Label>
                    <span className="text-xs text-muted-foreground">{template.corner_radius_h}h</span>
                  </div>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[template.corner_radius_h]}
                    onValueChange={([v]) => setTemplate({ ...template, corner_radius_h: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">border_h</Label>
                    <span className="text-xs text-muted-foreground">{template.border_h}h</span>
                  </div>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[template.border_h]}
                    onValueChange={([v]) => setTemplate({ ...template, border_h: v })}
                  />
                </div>

                <details className="text-xs border-t pt-3">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-3">
                    Road Name / Number Styles
                  </summary>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-xs">roadName_letter_height_h</Label>
                        <span className="text-xs text-muted-foreground">{template.roadName_letter_height_h}h</span>
                      </div>
                      <Slider
                        min={4}
                        max={10}
                        step={0.5}
                        value={[template.roadName_letter_height_h]}
                        onValueChange={([v]) => setTemplate({ ...template, roadName_letter_height_h: v })}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-xs">roadNumber_letter_height_h</Label>
                        <span className="text-xs text-muted-foreground">{template.roadNumber_letter_height_h}h</span>
                      </div>
                      <Slider
                        min={4}
                        max={10}
                        step={0.5}
                        value={[template.roadNumber_letter_height_h]}
                        onValueChange={([v]) => setTemplate({ ...template, roadNumber_letter_height_h: v })}
                      />
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>

            {/* Font Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Font Metrics (D2)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">Avg Char Width Ratio</Label>
                    <span className="text-xs text-muted-foreground">{fontMetrics.avgCharWidthRatio}</span>
                  </div>
                  <Slider
                    min={0.3}
                    max={1.0}
                    step={0.05}
                    value={[fontMetrics.avgCharWidthRatio]}
                    onValueChange={([v]) => setFontMetrics({ ...fontMetrics, avgCharWidthRatio: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">Ascent Ratio</Label>
                    <span className="text-xs text-muted-foreground">{fontMetrics.ascentRatio}</span>
                  </div>
                  <Slider
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    value={[fontMetrics.ascentRatio]}
                    onValueChange={([v]) => setFontMetrics({ ...fontMetrics, ascentRatio: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">Descent Ratio</Label>
                    <span className="text-xs text-muted-foreground">{fontMetrics.descentRatio}</span>
                  </div>
                  <Slider
                    min={0.0}
                    max={0.5}
                    step={0.05}
                    value={[fontMetrics.descentRatio]}
                    onValueChange={([v]) => setFontMetrics({ ...fontMetrics, descentRatio: v })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Engine Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Engine Parameters (D1→D4)</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">pxPerH</Label>
                    <span className="text-xs text-muted-foreground">{pxPerH} px/h</span>
                  </div>
                  <Slider
                    min={10}
                    max={60}
                    step={5}
                    value={[pxPerH]}
                    onValueChange={([v]) => setPxPerH(v)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Output size: ~{Math.round((20 * pxPerH) / 10) * 10} × {Math.round((15 * pxPerH) / 10) * 10} px
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="space-y-6 sticky top-6">
            {/* SVG Preview */}
            <Card>
              <CardHeader>
                <CardTitle>SVG Preview (D4)</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {!layout && !error && (
                  <div className="text-center text-muted-foreground py-12">
                    <p>Loading preview...</p>
                  </div>
                )}
                {layout && (
                  <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center">
                    <div
                      data-sign-preview
                      className="w-full max-w-full"
                      style={{ 
                        maxHeight: '500px',
                        aspectRatio: `${layout.board.w} / ${layout.board.h}`
                      }}
                      dangerouslySetInnerHTML={{
                        __html: toSVG(layout, { backgroundColor: '#0B6B4D' }),
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Layout Model JSON */}
            {layout && (
              <Card>
                <CardHeader>
                  <CardTitle>Layout Model (D3 Output)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary">
                    <TabsList>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="items">Items</TabsTrigger>
                      <TabsTrigger value="meta">Meta</TabsTrigger>
                      <TabsTrigger value="full">Full JSON</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Board Size:</span>
                          <span className="font-mono">{layout.board.w} × {layout.board.h} px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Items Count:</span>
                          <span className="font-mono">{layout.items.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sign Type:</span>
                          <span className="font-mono">{layout.meta.signType}</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="items">
                      <pre className="text-xs bg-slate-100 p-3 rounded-lg overflow-auto max-h-96">
                        {JSON.stringify(layout.items, null, 2)}
                      </pre>
                    </TabsContent>

                    <TabsContent value="meta">
                      <pre className="text-xs bg-slate-100 p-3 rounded-lg overflow-auto max-h-96">
                        {JSON.stringify(layout.meta, null, 2)}
                      </pre>
                    </TabsContent>

                    <TabsContent value="full">
                      <pre className="text-xs bg-slate-100 p-3 rounded-lg overflow-auto max-h-96">
                        {JSON.stringify(layout, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Info */}
      <div className="border-t bg-white p-4 mt-8">
        <div className="container mx-auto text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>🔧 Engine Pipeline:</strong> Input → D1 (h-space layout) → D2 (text measurement) → D3 (layout engine) → D4 (SVG rendering)
          </p>
          <p>
            <strong>📁 Code Location:</strong> <code className="bg-slate-100 px-2 py-1 rounded">lib/engine/</code>
          </p>
        </div>
      </div>
    </div>
  )
}
