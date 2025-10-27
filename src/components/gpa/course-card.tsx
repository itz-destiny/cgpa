"use client";

import type { Course, Grade } from "@/lib/types";
import { gradeOptions } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { SelectSeparator } from "../ui/select";

interface CourseCardProps {
  course: Course;
  onUpdate: (course: Course) => void;
  onRemove: () => void;
}

export default function CourseCard({
  course,
  onUpdate,
  onRemove,
}: CourseCardProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    if (name === "units") {
        processedValue = value === '' ? 0 : Math.max(0, parseInt(value, 10));
        if (isNaN(processedValue as number)) {
            processedValue = 0;
        }
    }
    onUpdate({ ...course, [name]: processedValue });
  };

  const handleGradeChange = (value: string) => {
    onUpdate({ ...course, grade: value as Grade });
  };

  return (
    <Card className="bg-accent/30 transition-all duration-300">
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div className="md:col-span-6">
            <Input
              type="text"
              name="name"
              placeholder="Course Name (e.g. Intro to AI)"
              value={course.name}
              onChange={handleInputChange}
              className="w-full"
              aria-label="Course name"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              type="number"
              name="units"
              placeholder="Units"
              value={course.units === 0 ? '' : course.units}
              onChange={handleInputChange}
              min="0"
              className="w-full"
              aria-label="Course units"
            />
          </div>
          <div className="md:col-span-3">
            <Select onValueChange={handleGradeChange} value={course.grade}>
              <SelectTrigger aria-label="Course grade">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map(option => (
                     <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 flex justify-end">
            <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove course">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
