import type { RestartDialogProps } from "../../api/types";

/** Confirm-restart modal for the draft board. */
export function RestartDialog({ open, onCancel, onConfirm }: RestartDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-raised rounded-lg p-6 shadow-xl w-80">
        <h2 className="text-lg font-bold mb-2">Restart Draft</h2>
        <p className="text-sm text-ink-soft mb-4">
          Start over from pick 1 with the same teams and keepers?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-rule/60 rounded hover:bg-rule"
          >
            Continue
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}
