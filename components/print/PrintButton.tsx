"use client";

export function PrintButton() {
  return (
    <div className="print-actions">
      <button type="button" className="primary" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  );
}
