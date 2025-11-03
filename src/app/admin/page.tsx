'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/login/admin');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
