import { X } from 'lucide-react'
import { ALL_HOTKEYS } from '../../constants/hotkeys'

interface HotkeyHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function HotkeyHelp({ isOpen, onClose }: HotkeyHelpProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {ALL_HOTKEYS.map((hotkey) => (
              <div 
                key={hotkey.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-600">{hotkey.description}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border border-gray-200">
                  {hotkey.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 text-gray-700 rounded">?</kbd> or Escape to close
          </p>
        </div>
      </div>
    </div>
  )
}
