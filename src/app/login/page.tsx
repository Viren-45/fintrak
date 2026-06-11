"use client";

import { login } from "./actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen flex items-center justify-center bg-fintrak-bg">
      <div className="w-full max-w-sm px-4">
        {/* App name */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-fintrak-text-primary">
            Fintrak
          </h1>
          <p className="text-sm text-fintrak-text-secondary mt-1">
            Your personal finance tracker
          </p>
        </div>

        <Card className="border-fintrak-border shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-fintrak-text-secondary text-center">
              Sign in to continue
            </p>
          </CardHeader>

          <CardContent>
            <form action={login} className="space-y-4">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-fintrak-expense/30 rounded-md px-3 py-2">
                  <p className="text-sm text-fintrak-expense">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-fintrak-text-primary text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="border-fintrak-border focus-visible:ring-fintrak-accent"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-fintrak-text-primary text-sm font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="border-fintrak-border focus-visible:ring-fintrak-accent"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-fintrak-accent hover:bg-fintrak-accent/90 text-white font-medium mt-2"
              >
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// useSearchParams() requires Suspense boundary
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
