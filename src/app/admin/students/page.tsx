
'use client';

import { Users } from "lucide-react";
import StudentManagement from '@/components/admin/student-management';

export default function StudentsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
        </div>
        <StudentManagement />
    </div>
  );
}
