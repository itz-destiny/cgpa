import type { Course, Semester } from './types';
import { gradePoints } from './types';

export const calculateGPA = (courses: Course[]): number => {
  let totalPoints = 0;
  let totalUnits = 0;

  courses.forEach(course => {
    if (course.grade && course.units > 0) {
      totalPoints += gradePoints[course.grade] * course.units;
      totalUnits += course.units;
    }
  });

  if (totalUnits === 0) {
    return 0;
  }

  const gpa = totalPoints / totalUnits;
  return isNaN(gpa) ? 0 : gpa;
};

export const calculateCGPA = (semesters: Semester[]): number => {
  let totalPoints = 0;
  let totalUnits = 0;

  semesters.forEach(semester => {
    semester.courses.forEach(course => {
      if (course.grade && course.units > 0) {
        totalPoints += gradePoints[course.grade] * course.units;
        totalUnits += course.units;
      }
    });
  });

  if (totalUnits === 0) {
    return 0;
  }

  const cgpa = totalPoints / totalUnits;
  return isNaN(cgpa) ? 0 : cgpa;
};
