"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, GraduationCap } from "lucide-react";
import type { Semester, Course } from "@/lib/types";
import { calculateCGPA } from "@/lib/grade-logic";
import { Button } from "@/components/ui/button";
import SemesterView from "@/components/gpa/semester-view";
import CgpaDisplay from "@/components/gpa/cgpa-display";
import Header from "@/components/layout/header";

const initialSemesters: Semester[] = [
  {
    id: "sem-1",
    name: "First Semester",
    courses: [
      { id: "course-1-1", name: "Introduction to Computer Science", units: 3, grade: "A" },
      { id: "course-1-2", name: "Calculus I", units: 4, grade: "B" },
      { id: "course-1-3", name: "Communication in English", units: 2, grade: "A" },
    ],
  },
  {
    id: "sem-2",
    name: "Second Semester",
    courses: [
      { id: "course-2-1", name: "Data Structures", units: 3, grade: "C" },
      { id: "course-2-2", name: "Calculus II", units: 4, grade: "B" },
      { id: "course-2-3", name: "Physics for Scientists", units: 3, grade: "" },
    ],
  },
];


export default function GradeCalculatorPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load from local storage or start with initial data
    const savedData = localStorage.getItem("gradeRightData");
    if (savedData) {
      setSemesters(JSON.parse(savedData));
    } else {
      setSemesters(initialSemesters);
    }
  }, []);
  
  useEffect(() => {
    if(isClient) {
      localStorage.setItem("gradeRightData", JSON.stringify(semesters));
    }
  }, [semesters, isClient]);

  const cgpa = useMemo(() => calculateCGPA(semesters), [semesters]);

  const handleAddSemester = () => {
    const newSemester: Semester = {
      id: `sem-${crypto.randomUUID()}`,
      name: `Semester ${semesters.length + 1}`,
      courses: [],
    };
    setSemesters([...semesters, newSemester]);
  };

  const handleRemoveSemester = (semesterId: string) => {
    setSemesters(semesters.filter((s) => s.id !== semesterId));
  };
  
  const handleUpdateSemesterName = (semesterId: string, newName: string) => {
    setSemesters(
      semesters.map((s) => (s.id === semesterId ? { ...s, name: newName } : s))
    );
  };

  const handleAddCourse = (semesterId: string) => {
    const newCourse: Course = {
      id: `course-${crypto.randomUUID()}`,
      name: "",
      units: 0,
      grade: "",
    };
    setSemesters(
      semesters.map((s) =>
        s.id === semesterId
          ? { ...s, courses: [...s.courses, newCourse] }
          : s
      )
    );
  };

  const handleRemoveCourse = (semesterId: string, courseId: string) => {
    setSemesters(
      semesters.map((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s
      )
    );
  };

  const handleUpdateCourse = (semesterId: string, updatedCourse: Course) => {
    setSemesters(
      semesters.map((s) =>
        s.id === semesterId
          ? {
              ...s,
              courses: s.courses.map((c) =>
                c.id === updatedCourse.id ? updatedCourse : c
              ),
            }
          : s
      )
    );
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid gap-8">
          <CgpaDisplay cgpa={cgpa} />

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Semesters
            </h2>
            <Button onClick={handleAddSemester}>
              <Plus className="mr-2 h-4 w-4" /> Add Semester
            </Button>
          </div>

          {semesters.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {semesters.map((semester) => (
                <SemesterView
                  key={semester.id}
                  semester={semester}
                  onAddCourse={handleAddCourse}
                  onRemoveCourse={handleRemoveCourse}
                  onUpdateCourse={handleUpdateCourse}
                  onRemoveSemester={handleRemoveSemester}
                  onUpdateSemesterName={handleUpdateSemesterName}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No Semesters Yet</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-sm">
                Get started by adding your first semester and courses to calculate your GPA and CGPA.
              </p>
              <Button onClick={handleAddSemester}>
                <Plus className="mr-2 h-4 w-4" /> Add First Semester
              </Button>
            </div>
          )}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GradeRight. All rights reserved.</p>
      </footer>
    </div>
  );
}
