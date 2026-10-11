import { z } from 'zod';
import { postcodeFormSchema } from './postcode.js';

export const locationFormSchema = z.object({ postcode: postcodeFormSchema });

export const descriptionFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Enter a description.')
    .max(1000, 'Description must be 1,000 characters or fewer.'),
});

export function formErrors(error: z.ZodError) {
  return error.issues.map((issue) => issue.message);
}
