import { useEffect, useRef } from 'react';

// showModal() bloquea el resto de la página mientras el diálogo está abierto.
export default function ConfirmDialog({ open, message, confirmLabel = 'Eliminar', onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      // Evita que Escape también cierre el menú lateral del carrito.
      onKeyDown={(e) => e.key === 'Escape' && e.stopPropagation()}
    >
      <p className="confirm-dialog__message">{message}</p>
      <div className="confirm-dialog__actions">
        <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="confirm-dialog__confirm" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
