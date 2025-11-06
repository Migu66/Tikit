import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'auth.register.errors.nameMin'),
  email: z.string().email('auth.register.errors.emailInvalid'),
  password: z.string().min(8, 'auth.register.errors.passwordMin'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'auth.register.errors.passwordMatch',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
