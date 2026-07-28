export type Point = { x: number; y: number };

/** Rounds to 2 decimal places so identical inputs always serialize to the same
 * string on server and client, even if the underlying trig call lands on a
 * different float a couple of ULPs apart (observed between Node's and the
 * browser's Math.cos/sin), which would otherwise trip up SSR hydration. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function polar(cx: number, cy: number, r: number, angleDeg: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: round2(cx + r * Math.cos(rad)), y: round2(cy + r * Math.sin(rad)) };
}

export function annularSector(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  a1: number,
  a2: number
): string {
  const p1 = polar(cx, cy, rOut, a1);
  const p2 = polar(cx, cy, rOut, a2);
  const p3 = polar(cx, cy, rIn, a2);
  const p4 = polar(cx, cy, rIn, a1);
  const large = a2 - a1 <= 180 ? 0 : 1;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${rOut} ${rOut} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} A ${rIn} ${rIn} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`;
}

export const WHEEL_SIZE = 460;
export const WHEEL_RADIUS = 165;

export type WheelRingSector = {
  competencyIndex: number;
  ring: number;
  d: string;
  filled: boolean;
  opacity: number;
};

export type WheelLabel = {
  competencyIndex: number;
  name: string;
  score: number;
  labelPos: Point;
  scorePos: Point;
  rotation: number;
};

export type WheelData = {
  size: number;
  cx: number;
  cy: number;
  gridRings: number[];
  sectors: WheelRingSector[];
  labels: WheelLabel[];
  maxedWedges: { competencyIndex: number; d: string }[];
};

/**
 * Pure geometry builder ported from the prototype's buildWheel(): given an ordered
 * list of competency identifiers (name or id) and a score per identifier (0-10,
 * missing = 0), returns structured data for a caller to render as SVG (React or
 * otherwise) instead of a concatenated innerHTML string.
 */
export function buildWheelData(
  competencyIds: string[],
  competencyLabels: Record<string, string>,
  scores: Record<string, number>,
  gap = 1.4
): WheelData {
  const size = WHEEL_SIZE;
  const cx = size / 2;
  const cy = size / 2;
  const R = WHEEL_RADIUS;
  const N = competencyIds.length;

  const gridRings: number[] = [];
  for (let g = 2; g <= 10; g += 2) {
    gridRings.push((R * g) / 10);
  }

  const sectors: WheelRingSector[] = [];
  const labels: WheelLabel[] = [];
  const maxedWedges: { competencyIndex: number; d: string }[] = [];

  if (N === 0) {
    return { size, cx, cy, gridRings, sectors, labels, maxedWedges };
  }

  const wedge = 360 / N;

  competencyIds.forEach((id, i) => {
    const score = scores[id] || 0;
    const a1 = i * wedge + gap / 2;
    const a2 = (i + 1) * wedge - gap / 2;

    for (let ring = 1; ring <= 10; ring++) {
      const rIn = (R * (ring - 1)) / 10;
      const rOut = (R * ring) / 10;
      const filled = ring <= score;
      const opacity = filled ? 0.35 + 0.065 * ring : 1;
      sectors.push({
        competencyIndex: i,
        ring,
        d: annularSector(cx, cy, rIn, rOut, a1, a2),
        filled,
        opacity,
      });
    }

    if (score >= 10) {
      maxedWedges.push({
        competencyIndex: i,
        d: annularSector(cx, cy, R * 0.98, R * 1.0, a1, a2),
      });
    }

    const mid = (a1 + a2) / 2;
    const flip = mid > 90 && mid < 270;
    const labelPos = polar(cx, cy, R + 26, mid);
    const scorePos = polar(cx, cy, R + 42, mid);

    labels.push({
      competencyIndex: i,
      name: competencyLabels[id] ?? "",
      score,
      labelPos,
      scorePos,
      rotation: round2(flip ? mid + 180 : mid),
    });
  });

  return { size, cx, cy, gridRings, sectors, labels, maxedWedges };
}

/** Replicates the prototype's click semantics: clicking the currently-topmost
 * filled ring un-scores it by one; clicking any other ring sets the score to it. */
export function nextScoreForRingClick(currentScore: number, clickedRing: number): number {
  return currentScore === clickedRing ? clickedRing - 1 : clickedRing;
}
