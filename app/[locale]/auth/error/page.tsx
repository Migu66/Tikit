'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('auth');
  
  const error = searchParams.get('error');
  
  const errorMessages: Record<string, string> = {
    'OAuthSignin': t('errors.oauthSigninError', { defaultValue: 'Error connecting to OAuth provider' }),
    'OAuthCallback': t('errors.oauthCallbackError', { defaultValue: 'Error with OAuth callback' }),
    'EmailSigninEmail': t('errors.emailSigninError', { defaultValue: 'Check your email address' }),
    'Callback': t('errors.callbackError', { defaultValue: 'There was an error with the callback' }),
    'EmailSignInError': t('errors.emailSigninError', { defaultValue: 'Could not send sign in email' }),
    'SessionCallback': t('errors.sessionCallbackError', { defaultValue: 'Error in session callback' }),
    'Default': t('errors.genericError', { defaultValue: 'An authentication error occurred' }),
  };

  const errorMessage = errorMessages[error || 'Default'] || errorMessages['Default'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-300">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('errors.title', { defaultValue: 'Authentication Error' })}
            </h1>
            <p className="text-gray-600">
              {errorMessage}
            </p>
            {error && (
              <p className="text-sm text-gray-500 mt-2">
                ({error})
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/register')}
              className="w-full px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {t('errors.tryAgain', { defaultValue: 'Try Again' })}
            </button>
            
            <Link
              href="/login"
              className="w-full px-4 py-2 rounded-full bg-gray-200 text-gray-900 font-medium hover:bg-gray-300 transition-colors block text-center"
            >
              {t('errors.goToLogin', { defaultValue: 'Go to Login' })}
            </Link>

            <Link
              href="/"
              className="w-full px-4 py-2 rounded-full border-2 border-gray-300 text-gray-900 font-medium hover:border-gray-400 transition-colors block text-center"
            >
              {t('errors.backHome', { defaultValue: 'Back to Home' })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
