import ShareOde from "@/client/components/ShareOde";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { DEFAULT_ODE_TYPE, ODE_TYPE_DETAILS } from "@/shared/ode";

type OdeResultProps = {
  ode: string;
  onCompare: () => void;
  onWriteAnother: () => void;
  topic: string;
};

const { description, label } = ODE_TYPE_DETAILS[DEFAULT_ODE_TYPE];

const OdeResult = ({
  ode,
  onCompare,
  onWriteAnother,
  topic,
}: OdeResultProps) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="wrap-anywhere">Ode to {topic}</CardTitle>
      <CardDescription>
        <span className="font-medium">{label}.</span> {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-6">
      <p className="whitespace-pre-line">{ode}</p>
      <div className="grid gap-2">
        <Button className="w-full" onClick={onCompare} variant="outline">
          Compare Pindaric and Horatian odes
        </Button>
        <ShareOde ode={ode} topic={topic} />
        <Button className="w-full" onClick={onWriteAnother}>
          Write another ode
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default OdeResult;
