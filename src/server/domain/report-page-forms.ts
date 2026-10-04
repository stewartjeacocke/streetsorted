import { z } from 'zod';

const coordinate = (name: 'latitude' | 'longitude', min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter a ${name}.`)
    .transform((value) => Number(value))
    .refine(Number.isFinite, `Enter a valid ${name}.`)
    .refine((value) => value >= min && value <= max, `Enter a ${name} between ${min} and ${max}.`);

export const locationFormSchema = z.object({
  latitude: coordinate('latitude', -90, 90),
  longitude: coordinate('longitude', -180, 180),
});

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
