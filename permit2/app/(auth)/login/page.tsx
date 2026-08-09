'use client';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  // Auto-focus email on mount
  useEffect(() => { setFocus('email'); }, [setFocus]);

  async function onSubmit(data: LoginFormData) {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.auth.login(data.email, data.password);
      if (res.error) {
        // Generic error — never reveal which field is wrong
        setAuthError('Invalid email or password.');
        setValue('password', '');
        setFocus('password');
        return;
      }
      // Redirect to ?redirect param or /dashboard
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      // Validate redirect is a relative path (security: prevent open redirect)
      const safe = redirect.startsWith('/') ? redirect : '/dashboard';
      router.push(safe);
    } catch {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-indigo-600" aria-hidden="true" />
          <span className="text-indigo-600 font-bold text-xl">Permit2</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to Permit2</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your permits in one place</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              placeholder="manager@company.com"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Auth error banner */}
          {authError && (
            <div
              role="alert"
              className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {authError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>
      </div>

      {/* Caption */}
      <p className="text-center text-xs text-gray-400 mt-4">Permit2 POC — Restricted Access</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-md p-10 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-8" />
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-56 mb-8" />
            <div className="h-10 bg-gray-200 rounded mb-5" />
            <div className="h-10 bg-gray-200 rounded mb-6" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
