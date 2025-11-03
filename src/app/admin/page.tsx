
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useUser, useFirestore } from '@/firebase';
import { Shield } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import StudentManagement from '@/components/admin/student-management';

const ADMIN_EMAIL = 'admin@graderight.com';

export default function AdminDashboard() {
  const { user: authUser, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (isUserLoading) return;

    if (!authUser) {
      router.push('/login/admin');
      return;
    }
    
    if (authUser.email !== ADMIN_EMAIL) {
        setIsAdmin(false);
        router.push('/login/admin');
        return;
    }

    const checkAdminRole = async () => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.role === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                router.push('/login/admin');
            }
        } else {
             // This might happen if the user doc isn't created yet
             // but they have the admin email. For this setup, we trust the email.
             if(authUser.email === ADMIN_EMAIL) {
                setIsAdmin(true);
             } else {
                setIsAdmin(false);
                router.push('/login/admin');
             }
        }
    };
    checkAdminRole();
    
  }, [authUser, isUserLoading, router, firestore]);

  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Access Denied.</p>
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
        
        <StudentManagement />

      </main>
    </div>
  );
}
