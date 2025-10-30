"use client";

import { useMemo } from "react";
import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";
import type { Semester } from "@/lib/types";
import { calculateCGPA } from "@/lib/grade-logic";
import { Button } from "@/components/ui/button";
import SemesterView from "@/components/gpa/semester-view";
import Dashboard from "@/components/gpa/dashboard";
import Header from "@/components/layout/header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { downloadSemestersAsCSV } from "@/lib/csv-export";

export default function GradeCalculatorPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const semestersColRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'semesters') : null,
    [firestore, user]
  );

  const { data: semesters, isLoading: areSemestersLoading } = useCollection<Semester>(semestersColRef);

  const sortedSemesters = useMemo(() => {
    if (!semesters) return [];
    return [...semesters].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [semesters]);

  const cgpa = useMemo(() => calculateCGPA(sortedSemesters || []), [sortedSemesters]);

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
              Your personal CGPA compiler. Sign in to view your academic performance.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/login/student">
                  <LogIn className="mr-2 h-4 w-4" /> Student Sign In
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
          <Dashboard cgpa={cgpa} semesters={sortedSemesters} />

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Semesters
            </h2>
             <Button variant="outline" onClick={() => downloadSemestersAsCSV(sortedSemesters)}>
              Export All as CSV
            </Button>
          </div>

          {(sortedSemesters && sortedSemesters.length > 0) ? (
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {sortedSemesters.map((semester) => (
                <SemesterView
                  key={semester.id}
                  semester={semester}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No Results Found</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-sm">
                Your academic results have not been uploaded yet. Please check back later.
              </p>
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
