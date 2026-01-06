import { useState, useEffect } from 'react'
import { TopToolbar } from './components/toolbar/TopToolbar'
import { ToolOptionsPanel } from './components/toolbar/ToolOptionsPanel'
import { HotkeyHelp } from './components/toolbar/HotkeyHelp'
import { Canvas } from './components/canvas/Canvas'
import { useHotkeys } from './hooks/useHotkeys'

export function App() {
  const [showHelp, setShowHelp] = useState(false)
  useHotkeys()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setShowHelp(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <TopToolbar />
      <ToolOptionsPanel />
      <HotkeyHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <Canvas />
    </div>
  )
}
