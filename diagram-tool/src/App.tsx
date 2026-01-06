import { TopToolbar } from './components/toolbar/TopToolbar'
import { ToolOptionsPanel } from './components/toolbar/ToolOptionsPanel'
import { Canvas } from './components/canvas/Canvas'

export function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <TopToolbar />
      <div className="absolute inset-0 top-14">
        <Canvas />
      </div>
      <ToolOptionsPanel />
    </div>
  )
}
