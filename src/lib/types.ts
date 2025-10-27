export type Grade = "A" | "B" | "C" | "D" | "F" | "";

export const gradePoints: Record<Exclude<Grade, "">, number> = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  F: 0.0,
};

export const gradeOptions: { value: Exclude<Grade, "">, label: string }[] = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
    { value: "F", label: "F" },
];

export interface Course {
  id: string;
  name: string;
  units: number;
  grade: Grade;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export const getGpaClassification = (gpa: number): string => {
  if (gpa >= 4.5) return "First Class Honours";
  if (gpa >= 3.5) return "Second Class Honours (Upper Division)";
  if (gpa >= 2.4) return "Second Class Honours (Lower Division)";
  if (gpa >= 1.5) return "Third Class Honours";
  if (gpa >= 1.0) return "Pass";
  return "Fail";
};
