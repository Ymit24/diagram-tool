import { BrainCircuit } from 'lucide-react'

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BrainCircuit className="w-12 h-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Diagram Tool</h1>
        </div>
        <p className="text-gray-600">A web-based diagramming tool with an infinite canvas</p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="px-4 py-2 bg-white rounded-lg shadow text-sm">
            <span className="font-semibold text-blue-600">Phase 1</span> Complete
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
