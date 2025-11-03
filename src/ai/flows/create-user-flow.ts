
'use server';

import {initializeApp, getApp, getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { firebaseConfig } from '@/firebase/config';

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});

const CreateUserOutputSchema = z.object({
  uid: z.string().optional(),
  error: z.string().optional(),
});

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
    initializeApp({
        projectId: firebaseConfig.projectId,
    });
}

const db = getFirestore();
const auth = getAuth();

export const createUser = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input) => {
    try {
      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: input.email,
        password: input.password,
        displayName: `${input.firstName} ${input.lastName}`,
      });

      // Create user document in Firestore
      const userDocRef = db.collection('users').doc(userRecord.uid);
      await userDocRef.set({
        id: userRecord.uid,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.email.split('@')[0],
        role: 'student',
      });

      return { uid: userRecord.uid };
    } catch (error: any) {
      return { error: error.message };
    }
  }
);
