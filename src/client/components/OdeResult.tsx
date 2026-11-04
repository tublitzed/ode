import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";

type OdeResultProps = {
  ode: string;
  onWriteAnother: () => void;
  topic: string;
};

const OdeResult = ({ ode, onWriteAnother, topic }: OdeResultProps) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="wrap-anywhere">Ode to {topic}</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-6">
      <p className="whitespace-pre-line">{ode}</p>
      <Button className="w-full" onClick={onWriteAnother}>
        Write another ode
      </Button>
    </CardContent>
  </Card>
);

export default OdeResult;
