import { useMemo, useCallback } from 'react'
import { useDiagramStore } from '../../store/diagramStore'
import { DEFAULT_STROKE_COLORS, DEFAULT_FILL_COLORS, DEFAULT_STROKE_WIDTHS, ARROW_HEAD_STYLES } from '../../constants/colors'
import { LAYOUT } from '../../constants/layout'
import { getSelectedShapes, getCommonProperties, getShapeTypeLabel } from '../../utils/selection'
import type { AlignmentType, DistributionType } from '../../utils/alignment'
import { clsx } from 'clsx'
import { Palette, CircleDashed, Layers } from 'lucide-react'
import { ColorSection } from './ColorSection'
import { StrokeWidthSection } from './StrokeWidthSection'
import { ArrowStyleSection } from './ArrowStyleSection'
import { AlignmentSection } from './AlignmentSection'

export function ToolOptionsPanel() {
  const { currentToolOptions, updateToolOptions, selection, shapes, updateSelectedShapes, currentTool, alignShapes, distributeShapes } = useDiagramStore()

  const selectedShapes = useMemo(() =>
    getSelectedShapes(shapes, selection),
    [shapes, selection]
  )

  const commonProps = useMemo(() =>
    getCommonProperties(selectedShapes),
    [selectedShapes]
  )

  const hasSelection = selection.shapeIds.length > 0
  const isDrawingTool = ['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)
  const isArrowTool = currentTool === 'arrow'
  const canAlign = selection.shapeIds.length >= 2
  const canDistribute = selection.shapeIds.length >= 3

  const handleAlign = useCallback((alignment: AlignmentType) => {
    alignShapes(alignment)
  }, [alignShapes])

  const handleDistribute = useCallback((distribution: DistributionType) => {
    distributeShapes(distribution)
  }, [distributeShapes])

  const panelTitle = hasSelection
    ? selection.shapeIds.length === 1
      ? `${getShapeTypeLabel(selectedShapes[0]?.type || '')} Properties`
      : `${selection.shapeIds.length} Shapes Selected`
    : 'Style Options'

  const showArrowStyle = hasSelection
    ? commonProps.allArrows
    : isArrowTool

  return (
    <div
      className="fixed left-4 top-20 z-40"
      style={{ width: LAYOUT.floatingPanel.width }}
    >
      <div className={clsx(
        'bg-white/95 backdrop-blur-xl',
        'border border-gray-200/50',
        'shadow-lg shadow-gray-900/5',
        'transition-all duration-300',
      )}
      style={{ borderRadius: LAYOUT.floatingToolbar.borderRadius }}
      >
        <div className={clsx(
          'flex items-center px-4',
          'border-b border-gray-100',
          'text-sm font-medium text-gray-500'
        )}
        style={{ height: LAYOUT.floatingPanel.headerHeight }}
        >
          {hasSelection ? <Layers className="w-4 h-4 mr-2" /> : <Palette className="w-4 h-4 mr-2" />}
          {panelTitle}
        </div>

        <div className="p-4 space-y-5">
          {hasSelection ? (
            <>
              <ColorSection
                title="Stroke Color"
                colors={DEFAULT_STROKE_COLORS}
                selected={commonProps.stroke}
                mixed={commonProps.stroke === null}
                onSelect={(stroke) => updateSelectedShapes({ stroke })}
              />

              <ColorSection
                title="Fill Color"
                colors={DEFAULT_FILL_COLORS}
                selected={commonProps.fill}
                mixed={commonProps.fill === null}
                onSelect={(fill) => updateSelectedShapes({ fill })}
              />

              <StrokeWidthSection
                widths={DEFAULT_STROKE_WIDTHS}
                selected={commonProps.strokeWidth}
                mixed={commonProps.strokeWidth === null}
                onSelect={(strokeWidth) => updateSelectedShapes({ strokeWidth })}
              />

              {showArrowStyle && commonProps.allArrows && (
                <ArrowStyleSection
                  styles={ARROW_HEAD_STYLES}
                  selected={commonProps.arrowHeadStyle}
                  mixed={commonProps.arrowHeadStyle === null}
                  onSelect={(arrowHeadStyle) => updateSelectedShapes({ arrowHeadStyle })}
                />
              )}

              <AlignmentSection
                canAlign={canAlign}
                canDistribute={canDistribute}
                onAlign={handleAlign}
                onDistribute={handleDistribute}
              />
            </>
          ) : isDrawingTool ? (
            <>
              <ColorSection
                title="Stroke Color"
                colors={DEFAULT_STROKE_COLORS}
                selected={currentToolOptions.stroke}
                onSelect={(stroke) => updateToolOptions({ stroke })}
              />

              <ColorSection
                title="Fill Color"
                colors={DEFAULT_FILL_COLORS}
                selected={currentToolOptions.fill || 'transparent'}
                onSelect={(fill) => updateToolOptions({ fill })}
              />

              <StrokeWidthSection
                widths={DEFAULT_STROKE_WIDTHS}
                selected={currentToolOptions.strokeWidth}
                onSelect={(strokeWidth) => updateToolOptions({ strokeWidth })}
              />

              {isArrowTool && (
                <ArrowStyleSection
                  styles={ARROW_HEAD_STYLES}
                  selected={currentToolOptions.arrowHeadStyle}
                  onSelect={(arrowHeadStyle) => updateToolOptions({ arrowHeadStyle })}
                />
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <CircleDashed className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a drawing tool or shapes to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
