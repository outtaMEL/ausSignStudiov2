'use client'

/**
 * 可调节的三列布局组件
 * 支持列宽手动调整（3:3:4 默认比例）
 */

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ResizableThreeColumnProps {
  columnOne: React.ReactNode
  columnTwo: React.ReactNode
  columnThree: React.ReactNode
  className?: string
}

export function ResizableThreeColumn({
  columnOne,
  columnTwo,
  columnThree,
  className,
}: ResizableThreeColumnProps) {
  // 列宽百分比（默认 30%, 30%, 40%）
  const [widths, setWidths] = useState([30, 30, 40])
  const [isDragging, setIsDragging] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (dividerIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(dividerIndex)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging === null || !containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const mouseX = e.clientX - containerRect.left
      const percentage = (mouseX / containerRect.width) * 100

      setWidths((prevWidths) => {
        const newWidths = [...prevWidths]
        
        if (isDragging === 0) {
          // 调整第一列和第二列
          const minWidth = 15 // 最小宽度 15%
          const maxWidth = 50 // 最大宽度 50%
          const newWidth1 = Math.max(minWidth, Math.min(maxWidth, percentage))
          const diff = newWidth1 - prevWidths[0]
          
          newWidths[0] = newWidth1
          newWidths[1] = Math.max(minWidth, prevWidths[1] - diff)
          newWidths[2] = 100 - newWidths[0] - newWidths[1]
        } else if (isDragging === 1) {
          // 调整第二列和第三列
          const minWidth = 15
          const col1Width = prevWidths[0]
          const remainingWidth = 100 - col1Width
          const col2Percentage = ((percentage - col1Width) / remainingWidth) * 100
          
          const newCol2Width = Math.max(15, Math.min(85, col2Percentage))
          newWidths[1] = (remainingWidth * newCol2Width) / 100
          newWidths[2] = remainingWidth - newWidths[1]
        }

        return newWidths
      })
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  // 添加/移除鼠标事件监听
  useState(() => {
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  })

  return (
    <div
      ref={containerRef}
      className={cn('flex h-full w-full relative', className)}
      style={{ userSelect: isDragging !== null ? 'none' : 'auto' }}
    >
      {/* 第一列 */}
      <div
        className="h-full overflow-auto border-r bg-white"
        style={{ width: `${widths[0]}%` }}
      >
        {columnOne}
      </div>

      {/* 分隔线 1 */}
      <div
        className={cn(
          'w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors flex-shrink-0',
          isDragging === 0 && 'bg-blue-500'
        )}
        onMouseDown={handleMouseDown(0)}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-0.5 h-8 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* 第二列 */}
      <div
        className="h-full overflow-auto border-r bg-white"
        style={{ width: `${widths[1]}%` }}
      >
        {columnTwo}
      </div>

      {/* 分隔线 2 */}
      <div
        className={cn(
          'w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors flex-shrink-0',
          isDragging === 1 && 'bg-blue-500'
        )}
        onMouseDown={handleMouseDown(1)}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-0.5 h-8 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* 第三列 */}
      <div
        className="h-full overflow-auto bg-slate-50"
        style={{ width: `${widths[2]}%` }}
      >
        {columnThree}
      </div>

      {/* 拖拽时的遮罩 */}
      {isDragging !== null && (
        <div className="absolute inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  )
}

