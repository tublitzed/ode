import { cn } from "cn";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import {
  buildMosaic,
  layTiles,
  MOSAIC_SIZE,
  paintBed,
  paintGrout,
  paintMosaic,
  paintSketch,
} from "@/client/utils/mosaic";
import type { Mosaic } from "@/client/utils/mosaic";
import type { MosaicShape } from "@/shared/ode";

const FRAME_MS = 1100;
const GROUND_MS = 1500;
const PICTURE_MS = 1900;
const SKETCH_MS = 650;

const NO_SHAPES: MosaicShape[] = [];

const built = new WeakMap<MosaicShape[], Mosaic>();
let hasLaidFrame = false;

const mosaicFor = (shapes: MosaicShape[]) => {
  const cached = built.get(shapes);
  if (cached) {
    return cached;
  }

  const mosaic = buildMosaic(shapes);
  built.set(shapes, mosaic);
  return mosaic;
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });

export type MosaicState = "laid" | "laying" | "waiting";

type MosaicPanelProps = {
  children?: ReactNode;
  className?: string;
  label: string;
  onLaid?: () => void;
  shapes?: MosaicShape[];
  state: MosaicState;
};

const MosaicPanel = ({
  children,
  className,
  label,
  onLaid,
  shapes = NO_SHAPES,
  state,
}: MosaicPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onLaidRef = useRef(onLaid);

  useEffect(() => {
    onLaidRef.current = onLaid;
  }, [onLaid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    const isAnimated = !prefersReducedMotion();

    const waitForPicture = async () => {
      const blank = mosaicFor(NO_SHAPES);
      if (hasLaidFrame || !isAnimated) {
        paintBed(canvas, blank);
        return;
      }

      hasLaidFrame = true;
      paintGrout(canvas);
      await layTiles(canvas, blank, "frame", FRAME_MS, signal);
    };

    const layPicture = async () => {
      const mosaic = mosaicFor(shapes);
      if (!isAnimated) {
        paintMosaic(canvas, mosaic);
        onLaidRef.current?.();
        return;
      }

      paintBed(canvas, mosaic);
      paintSketch(canvas, mosaic);
      await wait(SKETCH_MS, signal);
      await layTiles(canvas, mosaic, "picture", PICTURE_MS, signal);
      await layTiles(canvas, mosaic, "ground", GROUND_MS, signal);
      if (signal.aborted) {
        return;
      }

      paintMosaic(canvas, mosaic);
      onLaidRef.current?.();
    };

    if (state === "waiting") {
      waitForPicture();
    } else if (state === "laying") {
      layPicture();
    } else {
      paintMosaic(canvas, mosaicFor(shapes));
    }

    return () => controller.abort();
  }, [shapes, state]);

  return (
    <div
      className={cn(
        "relative aspect-square w-full shadow-[0_2px_3px_rgb(52_40_30/0.18),0_28px_60px_-18px_rgb(52_40_30/0.45)]",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <canvas
        aria-hidden
        className="block size-full"
        height={MOSAIC_SIZE}
        ref={canvasRef}
        width={MOSAIC_SIZE}
      />
      {children}
    </div>
  );
};

export default MosaicPanel;
