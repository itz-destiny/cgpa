
"use client"

import { GraduationCap, LogOut, PanelLeft, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuth, useUser } from "@/firebase";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { GraduationCapIcon } from "lucide-react";

function AdminHeaderActions() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden mr-4"
      onClick={toggleSidebar}
    >
      <PanelLeft className="h-6 w-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}


export default function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const isAdminSection = pathname.startsWith('/admin');

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "?";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8">
     {isAdminSection && <AdminHeaderActions />}
      <div className="flex items-center gap-2">
        <GraduationCapIcon className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          GradeRight
        </h1>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
