
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

function AdminHeaderActions() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden mr-2"
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
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center">
         {isAdminSection && <AdminHeaderActions />}
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="ml-3 text-xl font-bold tracking-tight text-foreground">
            GradeRight
          </h1>
          <div className="ml-auto flex items-center space-x-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
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
        </div>
      </div>
    </header>
  );
}
