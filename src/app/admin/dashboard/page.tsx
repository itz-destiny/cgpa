
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { Shield } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import StudentManagement from '@/components/admin/student-management';

const ADMIN_EMAIL = 'admin@graderight.com';

export default function AdminDashboardPage() {
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
        // Simplified check, assuming email is sufficient for now.
        if(authUser.email === ADMIN_EMAIL) {
           setIsAdmin(true);
        } else {
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
                setIsAdmin(false);
                router.push('/login/admin');
            }
        }
    };
    checkAdminRole();
    
  }, [authUser, isUserLoading, router, firestore]);

  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
     return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <p>Access Denied.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
        <div className="flex items-center gap-4 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        
        <StudentManagement />
    </div>
  );
}
