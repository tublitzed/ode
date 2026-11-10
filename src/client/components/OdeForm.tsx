import type { ComponentProps } from "react";

import MosaicPanel from "@/client/components/MosaicPanel";
import OdeTopicFields from "@/client/components/OdeTopicFields";

const OdeForm = (props: ComponentProps<typeof OdeTopicFields>) => (
  <>
    <MosaicPanel
      className="max-w-[min(25rem,72vw)]"
      label="An empty mosaic, waiting for its picture"
      state="waiting"
    />
    <OdeTopicFields {...props} />
  </>
);

export default OdeForm;
