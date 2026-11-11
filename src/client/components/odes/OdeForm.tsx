import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import MortarSheen from "@/client/components/mosaics/MortarSheen";
import MosaicPanel from "@/client/components/mosaics/MosaicPanel";
import MosaicSketch from "@/client/components/mosaics/MosaicSketch";
import OdeProgressStatus from "@/client/components/odes/OdeProgressStatus";
import OdeTopicFields from "@/client/components/odes/OdeTopicFields";
import { SKETCHES } from "@/client/utils/sketches";

const PHRASE_INTERVAL_MS = 4500;
const SKETCH_DRAW_MS = 1600;
const SKETCH_INTERVAL_MS = 5000;
const SKETCH_STAGGER_MS = 70;

const WRITING_PHRASES = [
  "Consulting the muses…",
  "Pablo Neruda wrote odes to tomatoes, socks and onions.",
  "Breaking lines in unexpected places…",
  "Keats wrote “Ode to a Nightingale” in the spring of 1819.",
  "Warming up the nightingale…",
  "Schiller’s “Ode to Joy” became the finale of Beethoven’s Ninth.",
  "Mixing the mortar…",
  "Shelley wrote “Ode to the West Wind” in a wood near Florence.",
  "Polishing a stanza…",
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
          <MosaicSketch
            cycleMs={SKETCH_INTERVAL_MS}
            drawMs={SKETCH_DRAW_MS}
            key={sketchIndex}
            paths={sketch.shapes.map(({ d }) => d)}
            staggerMs={SKETCH_STAGGER_MS}
          />
        )}
        {isWriting && <MortarSheen />}
      </MosaicPanel>
      <OdeTopicFields
        {...props}
        placeholder={isIdle ? sketch.topic : undefined}
        status={
          <OdeProgressStatus
            hasTiles={false}
            intervalMs={PHRASE_INTERVAL_MS}
            label={`Writing your ode to ${topic}.`}
            phrases={[`Writing your ode to ${topic}…`, ...WRITING_PHRASES]}
          />
        }
      />
    </>
  );
};

export default OdeForm;
