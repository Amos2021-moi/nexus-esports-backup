"use client"

import { useState } from "react"
import { Eye, X } from "lucide-react"

interface EvidenceViewerProps {
  evidenceImage: string | null
}

export default function EvidenceViewer({ evidenceImage }: EvidenceViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!evidenceImage) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
      >
        <Eye size={16} />
        View Evidence
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setIsOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-all"
            >
              <X size={24} />
            </button>
            <img 
              src={`data:image/png;base64,${evidenceImage}`} 
              alt="Match Evidence" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}