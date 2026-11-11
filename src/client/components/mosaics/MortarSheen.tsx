import { FRAME_INSET } from "@/client/utils/mosaic";

const INSET = `${(FRAME_INSET / 240) * 100}%`;

const MortarSheen = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute overflow-hidden"
    style={{ inset: INSET }}
  >
    <div className="animate-sheen absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgb(255_250_240/0.22)_50%,transparent_65%)] bg-size-[300%_100%] motion-reduce:animate-none motion-reduce:hidden" />
  </div>
);

export default MortarSheen;
