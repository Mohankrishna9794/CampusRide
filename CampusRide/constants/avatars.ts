// Deterministic avatar color + initial helpers so the same user
// always renders with the same color across every screen.
const PALETTE = ['#1A56DB', '#2563EB', '#1D4ED8', '#16A34A', '#9333EA', '#DB2777', '#EA580C'];

export function colorFor(id?: string): string {
  if (!id) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initialOf(name?: string): string {
  return (name?.trim()?.charAt(0) || '?').toUpperCase();
}
