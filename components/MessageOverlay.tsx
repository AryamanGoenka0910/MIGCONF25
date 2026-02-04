"use client";

type MessageOverlayProps = {
  message: string | null;
  onClose: () => void;
};

export default function MessageOverlay({ message, onClose }: MessageOverlayProps) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-white/90">{message}</p>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-white/60 hover:text-white"
            onClick={onClose}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

