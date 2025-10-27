import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGpaClassification } from "@/lib/types";

interface CgpaDisplayProps {
  cgpa: number;
}

export default function CgpaDisplay({ cgpa }: CgpaDisplayProps) {
  const classification = getGpaClassification(cgpa);
  const displayValue = isNaN(cgpa) ? "0.00" : cgpa.toFixed(2);

  const getGpaColor = (gpa: number) => {
    if (gpa >= 4.5) return "text-green-600";
    if (gpa >= 3.5) return "text-blue-600";
    if (gpa >= 2.4) return "text-yellow-600";
    if (gpa >= 1.5) return "text-orange-600";
    return "text-red-600";
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Cumulative Grade Point Average (CGPA)</CardTitle>
        <CardDescription>
          Your real-time overall academic performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className={`text-7xl font-bold ${getGpaColor(cgpa)} transition-colors duration-300`}>
          {displayValue}
        </div>
        <p className="mt-2 text-lg font-medium text-muted-foreground">
          {classification}
        </p>
      </CardContent>
    </Card>
  );
}
