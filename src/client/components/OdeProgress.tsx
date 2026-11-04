import OdeProgressStatus from "@/client/components/OdeProgressStatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";

type OdeProgressProps = {
  topic: string;
};

const OdeProgress = ({ topic }: OdeProgressProps) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="wrap-anywhere">Ode to {topic}</CardTitle>
    </CardHeader>
    <CardContent>
      <OdeProgressStatus />
    </CardContent>
  </Card>
);

export default OdeProgress;
