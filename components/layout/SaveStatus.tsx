export type SaveState = "idle" | "saving" | "saved" | "error";

const LABELS: Record<SaveState, string> = {
  idle: " ",
  saving: "A guardar…",
  saved: "Guardado",
  error: "Falha ao guardar",
};

export function SaveStatus({ state }: { state: SaveState }) {
  return (
    <span className="save-status" data-state={state}>
      {LABELS[state]}
    </span>
  );
}
