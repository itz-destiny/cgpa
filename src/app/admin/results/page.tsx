
'use client';

import { FileUp } from "lucide-react";

export default function ResultsPage() {
  return (
    <div>
        <div className="flex items-center gap-4 mb-8">
            <FileUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Manage Results</h1>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
                This is where administrators will manage and upload student results.
            </p>
        </div>
    </div>
  );
}
