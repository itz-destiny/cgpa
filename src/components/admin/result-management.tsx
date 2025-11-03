
'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import type { User, Semester, Course, Grade } from '@/lib/types';
import { gradeOptions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Loader2, BookOpen, TestTube2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const courseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  units: z.coerce.number().min(0, 'Units must be a positive number'),
  grade: z.enum(['A', 'B', 'C', 'D', 'F', '', 'none']),
});

const semesterSchema = z.object({
  name: z.string().min(1, 'Semester name is required'),
  courses: z.array(courseSchema),
});

const resultFormSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  semesters: z.array(semesterSchema),
});

type ResultFormValues = z.infer<typeof resultFormSchema>;

const mockSemestersData: Omit<Semester, 'id'>[] = [
  {
    name: 'Year 1, Semester 1',
    courses: [
      { id: 'cs101', name: 'Introduction to Programming', units: 3, grade: 'A' },
      { id: 'ma101', name: 'Calculus I', units: 4, grade: 'B' },
      { id: 'ph101', name: 'Physics for Engineers', units: 4, grade: 'C' },
      { id: 'en101', name: 'Communication in English', units: 2, grade: 'A' },
      { id: 'ge101', name: 'Intro to Social Science', units: 3, grade: 'B' },
    ],
  },
  {
    name: 'Year 1, Semester 2',
    courses: [
      { id: 'cs102', name: 'Data Structures & Algorithms', units: 3, grade: 'B' },
      { id: 'ma102', name: 'Calculus II', units: 4, grade: 'C' },
      { id: 'ch101', name: 'General Chemistry', units: 4, grade: 'B' },
      { id: 'cs103', name: 'Discrete Mathematics', units: 3, grade: 'A' },
      { id: 'pe101', name: 'Physical Education I', units: 1, grade: 'A' },
    ],
  },
  {
    name: 'Year 2, Semester 1',
    courses: [
        { id: 'cs201', name: 'Object-Oriented Programming', units: 3, grade: 'A' },
        { id: 'ee201', name: 'Circuit Analysis', units: 4, grade: 'B' },
        { id: 'st201', name: 'Probability & Statistics', units: 3, grade: 'B' },
        { id: 'cs202', name: 'Computer Architecture', units: 3, grade: 'C' },
        { id: 'hu201', name: 'Humanities Elective', units: 3, grade: 'A' },
    ],
  },
  {
    name: 'Year 2, Semester 2',
    courses: [
        { id: 'cs203', name: 'Database Management Systems', units: 3, grade: 'A' },
        { id: 'cs204', name: 'Operating Systems', units: 3, grade: 'B' },
        { id: 'ma201', name: 'Linear Algebra', units: 3, grade: 'C' },
        { id: 'cs205', name: 'Software Engineering Principles', units: 3, grade: 'B' },
        { id: 'pe102', name: 'Physical Education II', units: 1, grade: 'A' },
    ],
  },
  {
      name: 'Year 3, Semester 1',
      courses: [
          { id: 'cs301', name: 'Analysis of Algorithms', units: 3, grade: 'B' },
          { id: 'cs302', name: 'Web Development', units: 3, grade: 'A' },
          { id: 'cs303', name: 'Computer Networks', units: 3, grade: 'B' },
          { id: 'ec301', name: 'Economics for Engineers', units: 3, grade: 'C' },
          { id: 'cs304', name: 'Theory of Computation', units: 3, grade: 'B' },
      ],
  },
  {
      name: 'Year 3, Semester 2',
      courses: [
          { id: 'cs305', name: 'Artificial Intelligence', units: 3, grade: 'A' },
          { id: 'cs306', name: 'Compiler Design', units: 3, grade: 'C' },
          { id: 'cs307', name: 'Project Management', units: 3, grade: 'B' },
          { id: 'si300', name: 'Industrial Training (Internship)', units: 6, grade: 'A' },
      ],
  },
  {
      name: 'Year 4, Semester 1',
      courses: [
          { id: 'cs401', name: 'Cryptography and Network Security', units: 3, grade: 'B' },
          { id: 'cs402', name: 'Mobile Computing', units: 3, grade: 'A' },
          { id: 'cs403', name: 'Senior Project I', units: 3, grade: 'A' },
          { id: 'cs411', name: 'Elective: Machine Learning', units: 3, grade: 'B' },
          { id: 'mg401', name: 'Professional Ethics', units: 2, grade: 'A' },
      ],
  },
  {
      name: 'Year 4, Semester 2',
      courses: [
          { id: 'cs404', name: 'Distributed Systems', units: 3, grade: 'C' },
          { id: 'cs405', name: 'Senior Project II', units: 3, grade: 'B' },
          { id: 'cs421', name: 'Elective: Cloud Computing', units: 3, grade: 'A' },
          { id: 'cs431', name: 'Elective: Data Mining', units: 3, grade: 'B' },
      ],
  },
];


export default function ResultManagement() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'student'));
  }, [firestore]);

  const { data: students, isLoading: isLoadingStudents } = useCollection<User>(studentsQuery);

  const studentSemestersQuery = useMemoFirebase(() => {
    if (!firestore || !selectedStudentId) return null;
    return collection(firestore, 'users', selectedStudentId, 'semesters');
  }, [firestore, selectedStudentId]);

  const { data: studentSemesters, isLoading: isLoadingSemesters } = useCollection<Semester>(studentSemestersQuery);

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      studentId: '',
      semesters: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'semesters',
  });

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    form.setValue('studentId', studentId);
    // When student changes, reset the form and load their existing semesters
    if (studentSemesters) {
        replace(studentSemesters as ResultFormValues['semesters']);
    } else {
        replace([]);
    }
  };

  const handleLoadMockData = () => {
    replace(mockSemestersData as ResultFormValues['semesters']);
    toast({
        title: 'Mock Data Loaded',
        description: 'Sample semester data has been loaded into the form. Click "Save All Results" to apply it to the student.',
    });
  };

  // Effect to load existing semesters into the form
  useMemo(() => {
    if (studentSemesters) {
      const semestersWithNoneGrade = studentSemesters.map(s => ({
        ...s,
        courses: s.courses.map(c => ({...c, grade: c.grade === '' ? 'none' : c.grade}))
      }))
      replace(semestersWithNoneGrade as ResultFormValues['semesters']);
    }
  }, [studentSemesters, replace]);

  const onSubmit = async (values: ResultFormValues) => {
    setIsSubmitting(true);
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database connection not found.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const batch = writeBatch(firestore);
      const studentDocRef = doc(firestore, 'users', values.studentId);
      
      values.semesters.forEach((semester) => {
        const semesterId = semester.name.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
        const semesterDocRef = doc(studentDocRef, 'semesters', semesterId);
        
        const semesterData = {
          id: semesterId,
          name: semester.name,
          courses: semester.courses.map(course => ({
            id: course.name.toLowerCase().replace(/\s+/g, '-'),
            name: course.name,
            units: course.units,
            grade: course.grade === 'none' ? '' : course.grade,
          })),
        };
        batch.set(semesterDocRef, semesterData, { merge: true });
      });

      await batch.commit();

      toast({
        title: 'Results Saved',
        description: `Successfully saved results for the selected student.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Could not save the results.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Result Management</CardTitle>
        <CardDescription>
          Select a student to view, add, or update their semester results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Student</FormLabel>
                  <Select onValueChange={handleStudentChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingStudents ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        students?.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {`${student.firstName} ${student.lastName} (${student.email})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoadingSemesters && selectedStudentId && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading results...</p>
              </div>
            )}
            
            {selectedStudentId && !isLoadingSemesters && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Semesters</h3>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLoadMockData}
                        >
                            <TestTube2 className="mr-2 h-4 w-4" />
                            Load Mock Data
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ name: `Semester ${fields.length + 1}`, courses: [] })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Semester
                        </Button>
                    </div>
                </div>

                 {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold text-foreground">No Semesters</h3>
                        <p className="text-muted-foreground mt-2">
                           Click &quot;Add Semester&quot; or &quot;Load Mock Data&quot; to start.
                        </p>
                    </div>
                ) : (
                <Accordion type="multiple" className="w-full" defaultValue={fields.map((f, i) => `item-${i}`)}>
                  {fields.map((field, semesterIndex) => (
                    <AccordionItem key={field.id} value={`item-${semesterIndex}`}>
                      <AccordionTrigger>
                        <div className="flex-1 text-left">
                            <FormField
                                control={form.control}
                                name={`semesters.${semesterIndex}.name`}
                                render={({ field }) => (
                                    <Input {...field} className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" onClick={(e) => e.stopPropagation()}/>
                                )}
                            />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                          <CourseArray semesterIndex={semesterIndex} control={form.control} />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(semesterIndex)}
                            className="mt-4"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Semester
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                )}
              </div>
            )}

            {selectedStudentId && (
              <Button type="submit" disabled={isSubmitting || isLoadingSemesters}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving Results...' : 'Save All Results'}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function CourseArray({ semesterIndex, control }: { semesterIndex: number; control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `semesters.${semesterIndex}.courses`,
  });

  return (
    <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-1">
            <div className="col-span-6">Course Name</div>
            <div className="col-span-2">Units</div>
            <div className="col-span-3">Grade</div>
            <div className="col-span-1"></div>
        </div>
      {fields.map((item, courseIndex) => (
        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
          <FormField
            control={control}
            name={`semesters.${semesterIndex}.courses.${courseIndex}.name`}
            render={({ field }) => (
              <FormItem className="col-span-6">
                <FormControl>
                  <Input placeholder="e.g. Introduction to AI" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`semesters.${semesterIndex}.courses.${courseIndex}.units`}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormControl>
                  <Input type="number" placeholder="Units" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`semesters.${semesterIndex}.courses.${courseIndex}.grade`}
            render={({ field }) => (
              <FormItem className="col-span-3">
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">-</SelectItem>
                    {gradeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => remove(courseIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ name: '', units: 0, grade: 'none' })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Course
      </Button>
    </div>
  );
}
