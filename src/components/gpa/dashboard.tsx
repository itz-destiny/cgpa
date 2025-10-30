import CgpaDisplay from "./cgpa-display";
import GpaTrendChart from "./gpa-trend-chart";
import type { Semester } from "@/lib/types";

interface DashboardProps {
    cgpa: number;
    semesters: Semester[];
}

export default function Dashboard({ cgpa, semesters }: DashboardProps) {
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <CgpaDisplay cgpa={cgpa} />
            <GpaTrendChart semesters={semesters} />
        </div>
    )
}
