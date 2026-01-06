import { TopToolbar } from './components/toolbar/TopToolbar'
import { ToolOptionsPanel } from './components/toolbar/ToolOptionsPanel'
import { Canvas } from './components/canvas/Canvas'

export function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <TopToolbar />
      <ToolOptionsPanel />
      <Canvas />
    </div>
  )
}
