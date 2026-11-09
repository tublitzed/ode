import type { ComponentProps } from "react";

import MosaicPanel from "@/client/components/MosaicPanel";
import OdeTopicFields from "@/client/components/OdeTopicFields";

const OdeForm = (props: ComponentProps<typeof OdeTopicFields>) => (
  <>
    <MosaicPanel
      className="max-w-100"
      label="An empty mosaic, waiting for its picture"
      state="waiting"
    />
    <OdeTopicFields {...props} />
  </>
);

export default OdeForm;
