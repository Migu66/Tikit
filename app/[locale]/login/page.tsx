'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Input } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import Link from 'next/link';
import { gsap } from 'gsap';

function LoginForm() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.login.errors');
  const router = useRouter();
  const locale = useLocale();
  const callbackUrl = `/${locale}/dashboard`;
  const { data: session, status } = useSession();

  // Si ya tiene sesión, redirige al dashboard
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string>('');

  // Animation refs
  const headerRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const googleButtonRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -30,
          duration: 0.6,
          ease: 'power3.out',
        });
      }

      if (cardRef.current) {
        gsap.from(cardRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.7,
          delay: 0.2,
          ease: 'power3.out',
        });
      }

      if (formRef.current) {
        const inputs = formRef.current.querySelectorAll('.input-container');
        gsap.from(inputs, {
          opacity: 0,
          x: -20,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.4,
          ease: 'power2.out',
        });
      }

      if (submitButtonRef.current) {
        gsap.set(submitButtonRef.current, { opacity: 0, y: 20 });
        gsap.to(submitButtonRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.6,
          ease: 'power2.out',
        });
      }

      if (googleButtonRef.current) {
        gsap.set(googleButtonRef.current, { opacity: 0, y: 20 });
        gsap.to(googleButtonRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.8,
          ease: 'power2.out',
        });
      }

      if (footerRef.current) {
        gsap.from(footerRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: 1,
          ease: 'power2.out',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    setIsLoading(true);

    try {
      // Validate form data
      const validatedData = loginSchema.parse({ email, password });

      // Attempt sign in with redirect
      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (!result?.ok || result?.error) {
        setServerError('invalidCredentials');
        setIsLoading(false);
        return;
      }

      // Success - wait a bit for session to be created, then redirect
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(callbackUrl);
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginInput] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setServerError('serverError');
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      setServerError('serverError');
      setIsLoading(false);
    }
  };

  // Mostrar loader mientras verifica sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-4 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-700">
            {t('subtitle')}
          </p>
        </div>

        {/* Form Card */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-300 transition-shadow duration-300 hover:shadow-2xl"
        >
          {/* Server Error */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {tErrors(serverError)}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="input-container">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="input-container">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              ref={submitButtonRef}
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('buttonLoading')}
                </span>
              ) : (
                t('button')
              )}
            </button>
          </form>

          {/* Google Sign In */}
          <div ref={googleButtonRef} className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('googleButton')}
            </button>
          </div>

          {/* Footer */}
          <div ref={footerRef} className="mt-6 text-center text-sm text-gray-600">
            <p>
              {t('noAccount')}{' '}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                {t('registerLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
