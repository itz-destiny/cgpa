"use client";

import { useMemo } from "react";
import type { Semester } from "@/lib/types";
import { calculateGPA } from "@/lib/grade-logic";
import CourseCard from "./course-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "../ui/separator";

interface SemesterViewProps {
  semester: Semester;
}

export default function SemesterView({ semester }: SemesterViewProps) {
  const gpa = useMemo(
    () => calculateGPA(semester.courses),
    [semester.courses]
  );

  return (
    <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{semester.name}</CardTitle>
            <CardDescription>
              Grade Point Average (GPA):{" "}
              <span className="font-bold text-foreground">
                {gpa.toFixed(2)}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <div className="grid grid-cols-12 gap-2 px-3 text-sm font-semibold text-muted-foreground">
            <div className="col-span-6">Course Name</div>
            <div className="col-span-2">Units</div>
            <div className="col-span-4">Grade</div>
        </div>
        <Separator />
        {semester.courses.length > 0 ? (
          <div className="space-y-3 pt-2">
            {semester.courses.map((course) => (
                <CourseCard
                key={course.id}
                course={course}
                />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No courses found for this semester.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
