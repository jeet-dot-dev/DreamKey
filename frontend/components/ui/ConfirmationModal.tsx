import React from "react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 text-left shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        <h3 className="text-xl font-semibold text-white leading-6">
          {title}
        </h3>

        <div className="mt-4">
          <div className="text-sm text-neutral-400 leading-relaxed">
            {message}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-neutral-700 bg-black/40 text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-500 font-semibold transition-all flex items-center justify-center min-w-[100px] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
