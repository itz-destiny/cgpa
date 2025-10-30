'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Shield } from 'lucide-react';

export default function AdminDashboard() {
  const { user: authUser, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => 
    (authUser && firestore) ? doc(firestore, 'users', authUser.uid) : null,
    [authUser, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !isProfileLoading) {
      if (!authUser || userProfile?.role !== 'admin') {
        router.push('/login/admin');
      }
    }
  }, [authUser, userProfile, isUserLoading, isProfileLoading, router]);

  if (isUserLoading || isProfileLoading || !userProfile) {
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
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold">Welcome, Administrator!</h2>
            <p className="text-muted-foreground mt-2">
                This is where you'll manage students, upload results, and more.
            </p>
            <p className="text-muted-foreground mt-2">
                More features coming soon.
            </p>
        </div>
      </main>
    </div>
  );
}
