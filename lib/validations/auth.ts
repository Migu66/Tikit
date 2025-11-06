import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('auth.login.errors.emailInvalid'),
  password: z.string().min(1, 'auth.login.errors.passwordRequired'),
});

export type LoginInput = z.infer<typeof loginSchema>;

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
