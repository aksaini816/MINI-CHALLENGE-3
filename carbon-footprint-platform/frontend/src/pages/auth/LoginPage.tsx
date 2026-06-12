import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Label, Alert, AlertDescription } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage(): React.JSX.Element {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
            <Leaf className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your CarbonTrack account
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            noValidate
            aria-label="Sign in form"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p id="login-email-error" className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="login-password-error" className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              aria-label={isLoading ? 'Signing in...' : 'Sign in'}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Demo Credentials</p>
          <p>User: demo@carbontrack.io / Demo@123456</p>
          <p>Admin: admin@carbontrack.io / Admin@123456</p>
        </div>
      </div>
    </div>
  );
}
