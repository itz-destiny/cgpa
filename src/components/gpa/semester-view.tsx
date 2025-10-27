"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Save } from "lucide-react";
import type { Semester, Course } from "@/lib/types";
import { calculateGPA } from "@/lib/grade-logic";
import CourseCard from "./course-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

interface SemesterViewProps {
  semester: Semester;
  onAddCourse: (semesterId: string) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onUpdateCourse: (semesterId: string, course: Course) => void;
  onRemoveSemester: (semesterId: string) => void;
  onUpdateSemesterName: (semesterId: string, newName: string) => void;
}

export default function SemesterView({
  semester,
  onAddCourse,
  onRemoveCourse,
  onUpdateCourse,
  onRemoveSemester,
  onUpdateSemesterName,
}: SemesterViewProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(semester.name);

  const gpa = useMemo(
    () => calculateGPA(semester.courses),
    [semester.courses]
  );
  
  const handleNameSave = () => {
    onUpdateSemesterName(semester.id, tempName);
    setIsEditingName(false);
  }

  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="text-2xl font-bold p-0 h-auto border-0 focus-visible:ring-0"
                  aria-label="Semester name"
                />
                 <Button variant="ghost" size="icon" onClick={handleNameSave} aria-label="Save semester name">
                  <Save className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <CardTitle className="flex items-center gap-2">
                {semester.name}
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} aria-label="Edit semester name">
                  <Edit className="h-5 w-5" />
                </Button>
              </CardTitle>
            )}
            <CardDescription>
              Grade Point Average (GPA):{" "}
              <span className="font-bold text-foreground">
                {gpa.toFixed(2)}
              </span>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveSemester(semester.id)}
            className="text-destructive hover:text-destructive"
            aria-label="Delete semester"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {semester.courses.length > 0 ? (
          semester.courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onUpdate={(updatedCourse) =>
                onUpdateCourse(semester.id, updatedCourse)
              }
              onRemove={() => onRemoveCourse(semester.id, course.id)}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No courses added yet.</p>
            <p>Click "Add Course" to begin.</p>
          </div>
        )}
      </CardContent>
      <Separator className="my-0" />
      <CardFooter className="p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onAddCourse(semester.id)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </CardFooter>
    </Card>
  );
}
