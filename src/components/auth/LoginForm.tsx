"use client";

import { useSearchParams } from "next/navigation";
import { login } from "@/app/login/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/assets/logo.png"
          alt="Fintrak"
          width={120}
          height={40}
          className="h-20 w-auto object-contain"
          priority
        />
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-fintrak-text-primary">
          Welcome back
        </h1>
        <p className="text-sm text-fintrak-text-secondary">
          Sign in to your account to continue
        </p>
      </div>

      {/* Google button */}
      <Button
        type="button"
        disabled
        variant="outline"
        className="w-full h-12 border-auth-google-border text-fintrak-text-primary gap-2 opacity-60 cursor-not-allowed"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-fintrak-border" />
        <span className="text-xs text-fintrak-text-secondary">or</span>
        <div className="flex-1 h-px bg-fintrak-border" />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-fintrak-expense/30 rounded-md px-3 py-2">
          <p className="text-sm text-fintrak-expense">{error}</p>
        </div>
      )}

      {/* Success message e.g. after signup */}
      {message && (
        <div className="bg-emerald-50 border border-fintrak-income/30 rounded-md px-3 py-2">
          <p className="text-sm text-fintrak-income">{message}</p>
        </div>
      )}

      {/* Form */}
      <form action={login} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-fintrak-text-primary text-sm font-medium">
            Email address
          </Label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="border-fintrak-border focus-visible:ring-auth-accent h-11"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Password
            </Label>
            <span className="text-xs text-fintrak-text-secondary opacity-50 cursor-not-allowed">
              Forgot password?
            </span>
          </div>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="border-fintrak-border focus-visible:ring-auth-accent h-11"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-auth-accent hover:bg-auth-accent-hover text-white font-medium h-11 mt-2"
        >
          Sign in
        </Button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-fintrak-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-auth-link font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
