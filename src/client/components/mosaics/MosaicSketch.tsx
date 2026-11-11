import { PICTURE_TRANSFORM } from "@/client/utils/mosaic";

type MosaicSketchProps = {
  cycleMs: number;
  drawMs: number;
  paths: string[];
  staggerMs: number;
  strokeWidth?: number;
};

const MosaicSketch = ({
  cycleMs,
  drawMs,
  paths,
  staggerMs,
  strokeWidth = 1.1,
}: MosaicSketchProps) => (
  <svg
    aria-hidden
    className="animate-sketch-fade pointer-events-none absolute inset-0 size-full motion-reduce:animate-none"
    style={{ animationDuration: `${cycleMs}ms` }}
    viewBox="0 0 240 240"
  >
    <g
      fill="none"
      stroke="rgb(150 62 40 / 0.7)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      transform={PICTURE_TRANSFORM}
    >
      {paths.map((d, index) => (
        <path
          className="animate-sketch-line"
          d={d}
          key={`${index}-${d}`}
          pathLength={1}
          style={{
            animationDelay: `${index * staggerMs}ms`,
            animationDuration: `${drawMs}ms`,
          }}
        />
      ))}
    </g>
  </svg>
);

export default MosaicSketch;
