"use client";

import type { Course, Grade } from "@/lib/types";
import { gradeOptions } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "../ui/card";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div className="md:col-span-6">
            <Input
              type="text"
              name="name"
              value={course.name}
              readOnly
              className="w-full font-medium bg-transparent border-0"
              aria-label="Course name"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              type="number"
              name="units"
              value={course.units}
              readOnly
              className="w-full bg-transparent border-0"
              aria-label="Course units"
            />
          </div>
          <div className="md:col-span-4">
             <Input
              type="text"
              name="grade"
              value={course.grade ? `${course.grade} (${gradeOptions.find(g => g.value === course.grade)?.label.split(' ')[1].replace(/[()]/g, '') || ''})` : 'N/A'}
              readOnly
              className="w-full bg-transparent border-0"
              aria-label="Course grade"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
