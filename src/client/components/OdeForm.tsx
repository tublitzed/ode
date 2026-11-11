import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import MosaicPanel from "@/client/components/MosaicPanel";
import OdeProgressStatus from "@/client/components/OdeProgressStatus";
import OdeTopicFields from "@/client/components/OdeTopicFields";
import Sinopia from "@/client/components/Sinopia";
import VerseDraft from "@/client/components/VerseDraft";
import { SKETCHES } from "@/client/utils/sketches";

const LORE_INTERVAL_MS = 5200;
const SKETCH_DRAW_MS = 1600;
const SKETCH_INTERVAL_MS = 5000;
const SKETCH_STAGGER_MS = 70;

const ODE_LORE = [
  "Warming up the nightingale…",
  "Pablo Neruda wrote odes to tomatoes, socks and onions.",
  "Keats wrote “Ode to a Nightingale” in the spring of 1819.",
  "Horace’s odes gave us “carpe diem.”",
  "Pindar wrote odes for winners of the Olympic Games.",
  "Some Roman floors were laid with more than a million tiles.",
  "Schiller’s “Ode to Joy” became the finale of Beethoven’s Ninth.",
  "Shelley wrote “Ode to the West Wind” in a wood near Florence.",
];

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const OdeForm = (props: ComponentProps<typeof OdeTopicFields>) => {
  const { isWriting, topic } = props;
  const [sketchIndex, setSketchIndex] = useState(0);
  const isIdle = !isWriting && !topic;

  useEffect(() => {
    if (!isIdle || prefersReducedMotion()) {
      return;
    }

    const timer = setInterval(() => {
      setSketchIndex((index) => (index + 1) % SKETCHES.length);
    }, SKETCH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isIdle]);

  const sketch = SKETCHES[sketchIndex];

  return (
    <>
      <MosaicPanel
        className="max-w-[min(25rem,72vw)]"
        label="An empty mosaic, waiting for its picture"
        state="waiting"
      >
        {isIdle && (
          <Sinopia
            cycleMs={SKETCH_INTERVAL_MS}
            drawMs={SKETCH_DRAW_MS}
            key={sketchIndex}
            paths={sketch.shapes.map(({ d }) => d)}
            staggerMs={SKETCH_STAGGER_MS}
          />
        )}
        {isWriting && <VerseDraft />}
      </MosaicPanel>
      <OdeTopicFields
        {...props}
        placeholder={isIdle ? sketch.topic : undefined}
        status={
          <OdeProgressStatus
            hasTiles={false}
            intervalMs={LORE_INTERVAL_MS}
            phrases={ODE_LORE}
          />
        }
      />
    </>
  );
};

export default OdeForm;
