import { isOdeType, isTesseraColor } from "@/shared/ode";
import type { MosaicShape, OdeType } from "@/shared/ode";

const STORAGE_KEY = "ode:lastOde";

export type SavedComparison = Partial<Record<OdeType, string>>;

export type LastOde = {
  comparison?: SavedComparison;
  mosaic?: MosaicShape[];
  ode: string;
  shareIds?: Record<string, string>;
  topic: string;
};

const readComparison = (value: unknown): SavedComparison =>
  Object.fromEntries(
    Object.entries(value ?? {}).filter(
      ([type, ode]) => isOdeType(type) && typeof ode === "string",
    ),
  );

const isMosaicShape = (value: unknown): value is MosaicShape =>
  typeof value === "object" &&
  value !== null &&
  "d" in value &&
  "fill" in value &&
  typeof value.d === "string" &&
  isTesseraColor(value.fill);

const readMosaic = (value: unknown) =>
  Array.isArray(value) && value.every(isMosaicShape) ? value : undefined;

const readShareIds = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, id]) => typeof id === "string"),
  );
};

const toShareKey = (comparison: SavedComparison = {}) =>
  JSON.stringify(comparison);

export const loadLastOde = (): LastOde | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return undefined;
    }

    const { comparison, mosaic, ode, shareIds, topic } = JSON.parse(stored);
    if (typeof ode !== "string" || typeof topic !== "string") {
      return undefined;
    }

    return {
      comparison: readComparison(comparison),
      mosaic: readMosaic(mosaic),
      ode,
      shareIds: readShareIds(shareIds),
      topic,
    };
  } catch {
    return undefined;
  }
};

export const saveLastOde = (lastOde: LastOde) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lastOde));
  } catch {
    return;
  }
};

export const clearLastOde = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
};

export const loadShareId = (comparison?: SavedComparison) =>
  loadLastOde()?.shareIds?.[toShareKey(comparison)];

export const saveShareId = (
  comparison: SavedComparison | undefined,
  id: string,
) => {
  const lastOde = loadLastOde();
  if (!lastOde) {
    return;
  }

  saveLastOde({
    ...lastOde,
    shareIds: { ...lastOde.shareIds, [toShareKey(comparison)]: id },
  });
};

export const saveComparisonOde = (type: OdeType, ode: string) => {
  const lastOde = loadLastOde();
  if (!lastOde) {
    return;
  }

  saveLastOde({
    ...lastOde,
    comparison: { ...lastOde.comparison, [type]: ode },
  });
};
