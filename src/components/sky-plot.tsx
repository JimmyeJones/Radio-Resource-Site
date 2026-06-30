'use client';

export interface SkyPoint {
  az: number; // degrees, 0 = N
  el: number; // degrees, 90 = zenith
}

/**
 * Polar az/el sky plot. North up, East right. Outer ring = horizon (el 0),
 * centre = zenith (el 90). Plots a pass track.
 */
export function SkyPlot({ track, size = 240 }: { track: SkyPoint[]; size?: number }) {
  const r = size / 2;
  const ring = r - 16;

  // az/el -> x,y. radius shrinks toward centre as elevation rises.
  function xy(az: number, el: number) {
    const rad = ring * (1 - Math.max(0, Math.min(90, el)) / 90);
    const a = ((az - 90) * Math.PI) / 180; // rotate so 0°=N at top
    return [r + rad * Math.cos(a), r + rad * Math.sin(a)] as const;
  }

  const path = track
    .map((p, i) => {
      const [x, y] = xy(p.az, p.el);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const start = track[0];
  const end = track[track.length - 1];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Sky track of the satellite pass, north up"
      className="text-muted"
    >
      {[ring, ring * 0.66, ring * 0.33].map((rr, i) => (
        <circle key={i} cx={r} cy={r} r={rr} fill="none" stroke="currentColor" strokeOpacity={0.3} />
      ))}
      <line x1={r} y1={r - ring} x2={r} y2={r + ring} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={r - ring} y1={r} x2={r + ring} y2={r} stroke="currentColor" strokeOpacity={0.2} />
      {(['N', 'E', 'S', 'W'] as const).map((d, i) => {
        const [x, y] = xy(i * 90, 0);
        return (
          <text key={d} x={x} y={y} dy={i === 0 ? -4 : i === 2 ? 12 : 4} dx={i === 1 ? 6 : i === 3 ? -6 : 0}
            textAnchor="middle" className="fill-muted text-[10px] font-medium">
            {d}
          </text>
        );
      })}
      {track.length > 1 ? (
        <path d={path} fill="none" stroke="rgb(var(--accent))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {start ? <circle {...circleProps(xy(start.az, start.el))} className="fill-success" /> : null}
      {end ? <circle {...circleProps(xy(end.az, end.el))} className="fill-danger" /> : null}
    </svg>
  );
}

function circleProps([x, y]: readonly [number, number]) {
  return { cx: x, cy: y, r: 4 };
}
