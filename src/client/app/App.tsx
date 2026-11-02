import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const App = () => (
  <main className="flex min-h-svh items-center justify-center p-4">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Hello world</CardTitle>
        <CardDescription>The ode app skeleton is running.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Get started</Button>
      </CardContent>
    </Card>
  </main>
);

export default App;
