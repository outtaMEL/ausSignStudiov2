'use client'

import { useRef, useEffect, useState } from 'react'
import { useCurrentLayout, useUI } from '@/store/signStore'
import { toSVG } from '@/lib/engine'

export function SignCanvas() {
  const layout = useCurrentLayout()
  const ui = useUI()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // 监听容器大小变化
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  if (!layout) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center bg-slate-100"
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">No Preview</p>
          <p className="text-sm">Add content in the panel editor to see preview</p>
        </div>
      </div>
    )
  }

  // 生成SVG
  const svgString = toSVG(layout, {
    backgroundColor: '#0B6B4D',
    includeGrid: ui.showGrid,
    includeGuides: ui.showGuides,
  })

  // 计算缩放后的尺寸
  const scaledWidth = layout.board.w * ui.previewScale
  const scaledHeight = layout.board.h * ui.previewScale

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto bg-slate-100 flex items-center justify-center p-8"
    >
      <div
        className="bg-white shadow-2xl sign-preview"
        style={{
          width: scaledWidth,
          height: scaledHeight,
        }}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    </div>
  )
}

