
'use client';

import { FileUp } from "lucide-react";
import ResultManagement from '@/components/admin/result-management';

export default function ResultsPage() {
  return (
    <div>
        <div className="flex items-center gap-4 mb-8">
            <FileUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Manage Results</h1>
        </div>
        <ResultManagement />
    </div>
  );
}
