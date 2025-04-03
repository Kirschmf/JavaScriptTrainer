import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a postgres client
const queryClient = postgres(process.env.DATABASE_URL!);

// Create a drizzle instance using the client and schema
export const db = drizzle(queryClient, { schema });