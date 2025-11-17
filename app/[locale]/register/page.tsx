'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import { Input, Divider } from '@/components/ui';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import Link from 'next/link';
import { gsap } from 'gsap';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tErrors = useTranslations('auth.register.errors');
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();

  // Si ya tiene sesión, redirige al dashboard
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push(`/${locale}/dashboard`);
    }
  }, [status, locale, router]);

  const [formData, setFormData] = React.useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string>('');

  // Referencias para las animaciones
  const headerRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const dividerRef = React.useRef<HTMLDivElement>(null);
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const googleButtonRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  // Animación de entrada
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del header
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -30,
          duration: 0.6,
          ease: 'power3.out',
        });
      }

      // Animación de la tarjeta
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.7,
          delay: 0.2,
          ease: 'power3.out',
        });
      }

      // Animación de los campos del formulario
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

      // Animación del divider
      if (dividerRef.current) {
        gsap.from(dividerRef.current, {
          opacity: 0,
          scaleX: 0,
          duration: 0.5,
          delay: 0.8,
          ease: 'power2.out',
        });
      }

      // Animación del botón de crear cuenta
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

      // Animación del botón de Google - usar to() en lugar de from()
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

      // Animación del footer
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: 1.2,
          ease: 'power2.out',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
      const validatedData = registerSchema.parse(formData);

      // Call register API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Handle server error
        setServerError(data.error || 'auth.register.errors.serverError');
        setIsLoading(false);
        return;
      }

      // Registration successful - redirect to login immediately
      console.log('Registration successful, redirecting to login');
      router.replace(`/${locale}/login?registered=true`);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.name === 'AbortError') {
        setServerError('auth.register.errors.timeout');
      } else if (error.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterInput] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setServerError('auth.register.errors.serverError');
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: `/${locale}/dashboard` });
    } catch (error) {
      setServerError('auth.register.errors.serverError');
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-sm text-red-600">
                {tErrors(serverError.replace('auth.register.errors.', ''))}
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="input-container">
              <Input
                label={t('name')}
                type="text"
                name="name"
                placeholder={t('namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                error={errors.name ? tErrors(errors.name.replace('auth.register.errors.', '')) : undefined}
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            <div className="input-container">
              <Input
                label={t('email')}
                type="email"
                name="email"
                placeholder={t('emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                error={errors.email ? tErrors(errors.email.replace('auth.register.errors.', '')) : undefined}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="input-container">
              <Input
                label={t('password')}
                type="password"
                name="password"
                placeholder={t('passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                error={errors.password ? tErrors(errors.password.replace('auth.register.errors.', '')) : undefined}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="input-container">
              <Input
                label={t('confirmPassword')}
                type="password"
                name="confirmPassword"
                placeholder={t('confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword ? tErrors(errors.confirmPassword.replace('auth.register.errors.', '')) : undefined}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

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

          {/* Divider */}
          <div ref={dividerRef}>
            <Divider text={t('or')} className="my-6" />
          </div>

          {/* Google Sign In */}
          <div
            ref={googleButtonRef}
            onClick={!isLoading ? handleGoogleSignIn : undefined}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 font-medium rounded-full hover:bg-gray-50 hover:border-blue-500 hover:shadow-md active:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (!isLoading) handleGoogleSignIn();
              }
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{t('googleButton')}</span>
          </div>

          {/* Terms and Login Link */}
          <div ref={footerRef} className="mt-6 space-y-4">
            <p className="text-xs text-center text-gray-600">
              {t('terms')}{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:underline transition-colors"
              >
                {t('termsLink')}
              </Link>{' '}
              {t('and')}{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline transition-colors"
              >
                {t('privacyLink')}
              </Link>
            </p>

            <p className="text-sm text-center text-gray-700">
              {t('hasAccount')}{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline transition-colors"
              >
                {t('loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
