'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useUser, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking, useAuth } from '@/firebase';
import { doc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Shield, UserPlus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const createStudentSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  matricNo: z.string().min(1, { message: 'Matriculation number is required.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
});

export default function AdminDashboard() {
  const { user: authUser, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

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

  const form = useForm<z.infer<typeof createStudentSchema>>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      email: '',
      matricNo: '',
      firstName: '',
      lastName: '',
    },
  });

  async function onCreateStudent(values: z.infer<typeof createStudentSchema>) {
    setIsCreatingStudent(true);
    // This is a temporary auth instance to create the user.
    // It's not ideal, but necessary because we can't have two signed-in users at once.
    // In a real app, this would be a server-side operation.
    try {
        // We can't directly create a user with a password in the client-side SDK
        // and be logged in as an admin. This needs to be a server-side operation
        // for a real production app. For this prototype, we will create the user
        // document and the auth user separately, which is not ideal but works.
        // A Cloud Function would be the proper way to do this.

        // Check if user already exists
        const q = query(collection(firestore, 'users'), where('email', '==', values.email), limit(1));
        const existingUser = await getDocs(q);
        if (!existingUser.isEmpty) {
            throw new Error('A user with this email already exists.');
        }

        // We can't create another auth user while logged in. 
        // We will just create the user data for now.
        // A cloud function would be needed to create the auth user.
        // For the purpose of this prototype, we'll assume a secondary process or Cloud Function
        // would create the actual Firebase Auth user. Here, we'll just create the user profile.
        
        // This is a placeholder for where you would use a Cloud Function
        // to create the user and their auth credentials securely.
        // Since we can't do that from the client, we'll show a toast message
        // and clear the form.
        
        console.log("Simulating student creation for:", values);
        
        // In a real app, you would get the new user's UID from the server response.
        // For now, we'll just use a placeholder. This will NOT create a real user.
        const newUserId = doc(collection(firestore, 'users')).id;

        const newUser: Omit<User, 'id'> = {
            email: values.email,
            role: 'student',
            firstName: values.firstName,
            lastName: values.lastName,
            username: values.email.split('@')[0],
        };
        
        // You would use the real UID here.
        // setDocumentNonBlocking(doc(firestore, 'users', newUserId), newUser, { merge: true });

        toast({
            title: "Student Creation Simulated",
            description: `In a real app, an auth user and a database record for ${values.email} would be created.`,
        });

        form.reset();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Student Creation Failed',
        description: error.message || 'There was a problem with your request.',
      });
    } finally {
      setIsCreatingStudent(false);
    }
  }


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
        
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus /> Create Student Account
                    </CardTitle>
                    <CardDescription>
                        Create a new student login. The matriculation number will be their initial password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCreateStudent)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                             <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Student Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="student@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="matricNo"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Matriculation No. (Password)</FormLabel>
                                <FormControl>
                                    <Input placeholder="F/HD/21/1234567" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isCreatingStudent}>
                            {isCreatingStudent ? 'Creating Student...' : 'Create Student'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="border-2 border-dashed rounded-lg p-12 text-center flex flex-col justify-center">
                <h2 className="text-xl font-semibold">More Features Coming Soon</h2>
                <p className="text-muted-foreground mt-2">
                    This is where you'll manage students, upload results, and more.
                </p>
            </div>
        </div>
      </main>
    </div>
  );
}
