"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, GraduationCap, LogIn } from "lucide-react";
import type { Semester, Course } from "@/lib/types";
import { calculateCGPA } from "@/lib/grade-logic";
import { Button } from "@/components/ui/button";
import SemesterView from "@/components/gpa/semester-view";
import CgpaDisplay from "@/components/gpa/cgpa-display";
import Header from "@/components/layout/header";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";

export default function GradeCalculatorPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const semestersColRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'semesters') : null, 
    [firestore, user]
  );
  const { data: semesters, isLoading: areSemestersLoading } = useCollection<Semester>(semestersColRef);

  const cgpa = useMemo(() => calculateCGPA(semesters || []), [semesters]);

  const handleAddSemester = () => {
    if (!semestersColRef) return;
    const newSemester: Omit<Semester, 'id'> = {
      name: `Semester ${semesters ? semesters.length + 1 : 1}`,
      courses: [],
    };
    addDocumentNonBlocking(semestersColRef, newSemester);
  };

  const handleRemoveSemester = (semesterId: string) => {
    if (!semestersColRef) return;
    deleteDocumentNonBlocking(doc(semestersColRef, semesterId));
  };
  
  const handleUpdateSemesterName = (semesterId: string, newName: string) => {
    if (!semestersColRef) return;
    updateDocumentNonBlocking(doc(semestersColRef, semesterId), { name: newName });
  };

  const handleAddCourse = (semesterId: string) => {
    if (!semestersColRef) return;
    const semester = semesters?.find(s => s.id === semesterId);
    if (!semester) return;
    
    const newCourse: Course = {
      id: `course-${crypto.randomUUID()}`,
      name: "",
      units: 0,
      grade: "",
    };

    const updatedCourses = [...semester.courses, newCourse];
    updateDocumentNonBlocking(doc(semestersColRef, semesterId), { courses: updatedCourses });
  };

  const handleRemoveCourse = (semesterId: string, courseId: string) => {
    if (!semestersColRef) return;
    const semester = semesters?.find(s => s.id === semesterId);
    if (!semester) return;
    
    const updatedCourses = semester.courses.filter((c) => c.id !== courseId);
    updateDocumentNonBlocking(doc(semestersColRef, semesterId), { courses: updatedCourses });
  };

  const handleUpdateCourse = (semesterId: string, updatedCourse: Course) => {
     if (!semestersColRef) return;
    const semester = semesters?.find(s => s.id === semesterId);
    if (!semester) return;

    const updatedCourses = semester.courses.map((c) =>
      c.id === updatedCourse.id ? updatedCourse : c
    );
    updateDocumentNonBlocking(doc(semestersColRef, semesterId), { courses: updatedCourses });
  };


  if (isUserLoading || (user && areSemestersLoading)) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground mb-4 animate-pulse mx-auto" />
            <p className="text-muted-foreground">Loading your academic data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
           <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg mt-16">
              <GraduationCap className="h-16 w-16 text-primary mb-4" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to GradeRight</h1>
              <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                Your personal CGPA compiler. Sign in or create an account to start managing your academic performance with ease.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                   <Link href="/signup">
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
        </main>
        <footer className="py-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GradeRight. All rights reserved.</p>
        </footer>
      </div>
    )
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

          {(semesters && semesters.length > 0) ? (
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
