import { AlertCircle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  icon?: React.ElementType
  danger?: boolean
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon: Icon = AlertCircle,
  danger = true,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="glass-card p-8 w-full max-w-sm animate-scale-in text-center relative overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-12 -mt-12 ${danger ? 'bg-red-500/5' : 'bg-primary/5'}`}
        />

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${danger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-primary'}`}
        >
          <Icon size={32} />
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 font-medium mb-8">{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 justify-center py-3 font-bold">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${danger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'} text-white rounded-xl flex-1 py-3 font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
