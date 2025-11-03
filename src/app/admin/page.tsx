
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useUser } from '@/firebase';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ADMIN_EMAIL = 'admin@graderight.com';

export default function AdminDashboard() {
  const { user: authUser, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!authUser || authUser.email !== ADMIN_EMAIL) {
        router.push('/login/admin');
      }
    }
  }, [authUser, isUserLoading, router]);

  if (isUserLoading || !authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Admin!</CardTitle>
                <CardDescription>
                    This is your dashboard. Student management features will be added here soon.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border-2 border-dashed rounded-lg p-12 text-center flex flex-col justify-center">
                    <h2 className="text-xl font-semibold">Student Creation Coming Soon</h2>
                    <p className="text-muted-foreground mt-2">
                        The form to create student accounts will be available here shortly.
                    </p>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
