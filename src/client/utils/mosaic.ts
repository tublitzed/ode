import type { MosaicShape, TesseraColor } from "@/shared/ode";

type Rgb = [number, number, number];

type Tile = {
  distance: number;
  isFrame: boolean;
  isGround: boolean;
  region: number;
  tone: number;
  x: number;
  y: number;
};

export type Mosaic = {
  image: ImageData;
  inset: number;
  owner: Int32Array;
  shapes: MosaicShape[];
  tiles: Tile[];
};

const CANVAS_UNITS = 240;
const FRAME_COLORS = ["#2A2522", "#EDE3CC", "#A8352A"];
const GROUND = "#E9E0CC";
const GROUT = "#C4B79E";
const GROUT_WIDTH = 2.1;
const SKETCH_COLOR = "rgba(150, 62, 40, 0.75)";
const TILE_SIZE = 13;
const TONE_RANGE = 18;

export const MOSAIC_SIZE = 720;

const TONES: Record<string, string[]> = {
  b: ["#BCD4E3", "#7AA6C7", "#3F6E9C", "#203E66"],
  g: ["#C6D7A2", "#8EAE63", "#5B7F3E", "#33502A"],
  k: ["#E3E0DA", "#B6B1A8", "#7F7A72", "#4B4742"],
  n: ["#DBC09E", "#B18B63", "#7D5B3E", "#4A3423"],
  o: ["#F3C38B", "#E39445", "#C06A27", "#84441A"],
  r: ["#EAA696", "#D2614B", "#A8352A", "#6E1F1A"],
  y: ["#F5DF95", "#E3BA47", "#BA8B26", "#7D5C1A"],
};

const SOLIDS: Record<string, string> = {
  C: "#EDE3CC",
  K: "#2A2522",
  W: "#F7F4EE",
};

const colorOf = (fill: string) =>
  fill.startsWith("#")
    ? fill
    : (SOLIDS[fill] ?? TONES[fill[0]][Number(fill[1]) - 1]);

const toRgb = (hex: string): Rgb => {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const seededRandom = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const ring = (outer: number, inner: number) =>
  `M${outer} ${outer} H${CANVAS_UNITS - outer} V${CANVAS_UNITS - outer} H${outer} Z ` +
  `M${inner} ${inner} V${CANVAS_UNITS - inner} H${CANVAS_UNITS - inner} V${inner} Z`;

const tileUnits = (TILE_SIZE * CANVAS_UNITS) / MOSAIC_SIZE;
const frameInset = tileUnits * 5;
const frameShapes = FRAME_COLORS.map((fill, index) => ({
  d: ring(tileUnits * (index === 0 ? 0 : index + 1), tileUnits * (index + 2)),
  fill,
}));

const paintRegions = (shapes: MosaicShape[]) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = MOSAIC_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas is unavailable");
  }

  const fills: string[] = [];
  const paint = ({ d, fill }: { d: string; fill: string }) => {
    let index = fills.indexOf(fill);
    if (index < 0) {
      fills.push(fill);
      index = fills.length - 1;
    }

    context.fillStyle = `rgb(${index * 8 + 4}, 0, 0)`;
    try {
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type
      context.fill(new Path2D(d));
    } catch {
      return;
    }
  };

  const unit = MOSAIC_SIZE / CANVAS_UNITS;
  const scale = (unit * (CANVAS_UNITS - frameInset * 2)) / CANVAS_UNITS;
  context.setTransform(
    scale,
    0,
    0,
    scale,
    frameInset * unit,
    frameInset * unit,
  );
  shapes.forEach(paint);
  context.setTransform(unit, 0, 0, unit, 0, 0);
  frameShapes.forEach(paint);

  const pixels = context.getImageData(0, 0, MOSAIC_SIZE, MOSAIC_SIZE).data;
  const regions = new Int16Array(MOSAIC_SIZE * MOSAIC_SIZE);
  for (let i = 0; i < regions.length; i++) {
    const red = pixels[i * 4];
    const index = Math.round((red - 4) / 8);
    const isClean =
      pixels[i * 4 + 3] === 255 && Math.abs(red - (index * 8 + 4)) <= 1;
    regions[i] = pixels[i * 4 + 3] < 128 ? -1 : isClean ? index : -2;
  }

  for (let i = 0; i < regions.length; i++) {
    if (regions[i] !== -2) {
      continue;
    }

    regions[i] = i > 0 && regions[i - 1] !== -2 ? regions[i - 1] : -1;
  }

  return { fills, regions };
};

const measureDistances = (regions: Int16Array) => {
  const size = MOSAIC_SIZE;
  const distances = new Float32Array(size * size).fill(Number.MAX_VALUE);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const region = regions[i];
      const isEdge =
        x === 0 ||
        y === 0 ||
        x === size - 1 ||
        y === size - 1 ||
        regions[i - 1] !== region ||
        regions[i + 1] !== region ||
        regions[i - size] !== region ||
        regions[i + size] !== region;
      if (isEdge) {
        distances[i] = 0.5;
      }
    }
  }

  const sweep = (forward: boolean) => {
    const step = forward ? -1 : 1;
    const neighbors: [number, number, number][] = [
      [step, 0, 1],
      [0, step, 1],
      [step, step, Math.SQRT2],
      [-step, step, Math.SQRT2],
    ];
    for (let n = 0; n < size * size; n++) {
      const i = forward ? n : size * size - 1 - n;
      const x = i % size;
      const y = (i - x) / size;
      for (const [dx, dy, cost] of neighbors) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) {
          continue;
        }

        const j = ny * size + nx;
        if (regions[j] === regions[i] && distances[j] + cost < distances[i]) {
          distances[i] = distances[j] + cost;
        }
      }
    }
  };

  sweep(true);
  sweep(false);
  return distances;
};

const bucketKey = (x: number, y: number) =>
  `${Math.floor(x / TILE_SIZE)},${Math.floor(y / TILE_SIZE)}`;

const createTileIndex = () => {
  const buckets = new Map<string, Tile[]>();

  return {
    add: (tile: Tile) => {
      const key = bucketKey(tile.x, tile.y);
      buckets.set(key, [...(buckets.get(key) ?? []), tile]);
    },
    near: (x: number, y: number) => {
      const found: Tile[] = [];
      const cx = Math.floor(x / TILE_SIZE);
      const cy = Math.floor(y / TILE_SIZE);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          found.push(...(buckets.get(`${cx + dx},${cy + dy}`) ?? []));
        }
      }
      return found;
    },
  };
};

const placeTiles = (regions: Int16Array, distances: Float32Array) => {
  const random = seededRandom(11);
  const index = createTileIndex();
  const tiles: Tile[] = [];
  const candidates: number[] = [];
  for (let i = 0; i < distances.length; i++) {
    const course = (distances[i] - TILE_SIZE / 2) / TILE_SIZE;
    if (Math.abs(course - Math.round(course)) < 0.12) {
      candidates.push(i);
    }
  }

  for (let k = candidates.length - 1; k > 0; k--) {
    const j = Math.floor(random() * (k + 1));
    [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
  }

  const frameBand = TILE_SIZE * 4;
  const minimumGap = (TILE_SIZE * 0.92) ** 2;
  for (const i of candidates) {
    const x = i % MOSAIC_SIZE;
    const y = (i - x) / MOSAIC_SIZE;
    const region = regions[i];
    const isCrowded = index
      .near(x, y)
      .some(
        (tile) =>
          tile.region === region &&
          (tile.x - x) ** 2 + (tile.y - y) ** 2 < minimumGap,
      );
    if (isCrowded) {
      continue;
    }

    const tile = {
      distance: distances[i],
      isFrame:
        x < frameBand ||
        y < frameBand ||
        x > MOSAIC_SIZE - frameBand ||
        y > MOSAIC_SIZE - frameBand,
      isGround: region < 0,
      region,
      tone: random(),
      x,
      y,
    };
    tiles.push(tile);
    index.add(tile);
  }

  return { index, tiles };
};

export const buildMosaic = (shapes: MosaicShape[]): Mosaic => {
  const { fills, regions } = paintRegions(shapes);
  const distances = measureDistances(regions);
  const { index, tiles } = placeTiles(regions, distances);
  const tileNumbers = new Map(tiles.map((tile, number) => [tile, number]));
  const colors = fills.map((fill) => toRgb(colorOf(fill as TesseraColor)));
  const ground = toRgb(GROUND);
  const grout = toRgb(GROUT);
  const image = new ImageData(MOSAIC_SIZE, MOSAIC_SIZE);
  const owner = new Int32Array(MOSAIC_SIZE * MOSAIC_SIZE).fill(-1);

  for (let i = 0; i < regions.length; i++) {
    const x = i % MOSAIC_SIZE;
    const y = (i - x) / MOSAIC_SIZE;
    let nearest: Tile | undefined;
    let first = Infinity;
    let second = Infinity;
    for (const tile of index.near(x, y)) {
      if (tile.region !== regions[i]) {
        continue;
      }

      const distance = (tile.x - x) ** 2 + (tile.y - y) ** 2;
      if (distance < first) {
        second = first;
        first = distance;
        nearest = tile;
      } else if (distance < second) {
        second = distance;
      }
    }

    let rgb = grout;
    const isTile =
      nearest &&
      distances[i] >= GROUT_WIDTH * 0.55 &&
      Math.sqrt(second) - Math.sqrt(first) > GROUT_WIDTH;
    if (nearest && isTile) {
      const base = regions[i] < 0 ? ground : colors[regions[i]];
      const shift = (nearest.tone - 0.5) * TONE_RANGE;
      rgb = base.map((value) =>
        Math.max(0, Math.min(255, value + shift)),
      ) as Rgb;
      owner[i] = tileNumbers.get(nearest) ?? -1;
    }

    image.data.set([...rgb, 255], i * 4);
  }

  return { image, inset: frameInset, owner, shapes, tiles };
};

export const paintMosaic = (canvas: HTMLCanvasElement, mosaic: Mosaic) => {
  canvas.getContext("2d")?.putImageData(mosaic.image, 0, 0);
};

export const paintGrout = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.fillStyle = GROUT;
  context.fillRect(0, 0, MOSAIC_SIZE, MOSAIC_SIZE);
};

export const paintBed = (canvas: HTMLCanvasElement, mosaic: Mosaic) => {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  paintGrout(canvas);
  const image = context.getImageData(0, 0, MOSAIC_SIZE, MOSAIC_SIZE);
  for (let i = 0; i < mosaic.owner.length; i++) {
    const tile = mosaic.tiles[mosaic.owner[i]];
    if (tile?.isFrame) {
      image.data.set(mosaic.image.data.subarray(i * 4, i * 4 + 4), i * 4);
    }
  }
  context.putImageData(image, 0, 0);
};

export const paintSketch = (canvas: HTMLCanvasElement, mosaic: Mosaic) => {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const unit = MOSAIC_SIZE / CANVAS_UNITS;
  const scale = (unit * (CANVAS_UNITS - mosaic.inset * 2)) / CANVAS_UNITS;
  context.save();
  context.setTransform(
    scale,
    0,
    0,
    scale,
    mosaic.inset * unit,
    mosaic.inset * unit,
  );
  context.strokeStyle = SKETCH_COLOR;
  context.lineWidth = 1.1;
  context.lineJoin = "round";
  for (const { d } of mosaic.shapes) {
    try {
      context.stroke(new Path2D(d));
    } catch {
      continue;
    }
  }
  context.restore();
};

const byCourse = (a: Tile, b: Tile) =>
  Math.round(a.distance / TILE_SIZE) - Math.round(b.distance / TILE_SIZE) ||
  a.tone - b.tone;

const byAngle = (a: Tile, b: Tile) => {
  const middle = MOSAIC_SIZE / 2;
  return (
    Math.atan2(a.y - middle, a.x - middle) -
    Math.atan2(b.y - middle, b.x - middle)
  );
};

export type TileGroup = "frame" | "ground" | "picture";

const isInGroup = (tile: Tile, group: TileGroup) => {
  if (group === "frame") {
    return tile.isFrame;
  }

  return !tile.isFrame && tile.isGround === (group === "ground");
};

const groupPixels = (mosaic: Mosaic, group: TileGroup) => {
  const chosen = mosaic.tiles
    .map((tile, number) => ({ number, tile }))
    .filter(({ tile }) => isInGroup(tile, group))
    .toSorted((a, b) =>
      (group === "frame" ? byAngle : byCourse)(a.tile, b.tile),
    );
  const rank = new Map(
    chosen.map(({ number }, position) => [number, position]),
  );
  const pixels: number[][] = chosen.map(() => []);
  for (let i = 0; i < mosaic.owner.length; i++) {
    const position = rank.get(mosaic.owner[i]);
    if (position !== undefined) {
      pixels[position].push(i);
    }
  }
  return pixels;
};

const easeOut = (progress: number) => 1 - (1 - progress) ** 3;

export const layTiles = (
  canvas: HTMLCanvasElement,
  mosaic: Mosaic,
  group: TileGroup,
  durationMs: number,
  signal: AbortSignal,
) =>
  new Promise<void>((resolve) => {
    const context = canvas.getContext("2d");
    if (!context) {
      resolve();
      return;
    }

    const pixels = groupPixels(mosaic, group);
    const frame = context.getImageData(0, 0, MOSAIC_SIZE, MOSAIC_SIZE);
    const start = performance.now();
    let shown = 0;

    const step = (now: number) => {
      if (signal.aborted) {
        resolve();
        return;
      }

      const progress = Math.min(1, (now - start) / durationMs);
      const target = Math.floor(easeOut(progress) * pixels.length);
      for (; shown < target; shown++) {
        for (const i of pixels[shown]) {
          frame.data.set(mosaic.image.data.subarray(i * 4, i * 4 + 4), i * 4);
        }
      }
      context.putImageData(frame, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
