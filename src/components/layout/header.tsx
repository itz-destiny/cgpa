import { GraduationCap } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="ml-3 text-xl font-bold tracking-tight text-foreground">
            GradeRight
          </h1>
        </div>
      </div>
    </header>
  );
}
