"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight, Video, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        // Validate session with backend /auth/me route
        const res = await api.get("/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.data && res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          router.replace("/dashboard");
          return;
        }
      } catch (err) {
        // Clear invalid token/user state if authentication fails
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsVerifying(false);
      }
    };

    checkAuth();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }


  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Axios request with credentials (HTTP-only cookie will be set automatically by Express backend)
      const res = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        router.push("/dashboard");
      } else {
        setErrorMessage("Login failed. Unexpected server response.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      const serverMsg =
        err.response?.data?.error || "Invalid email or password. Please try again.";
      setErrorMessage(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 text-zinc-900 dark:text-zinc-100 overflow-hidden selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      {/* Ambient background glow elements */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 my-8">
        {/* Branding Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xl shadow-zinc-950/10 dark:shadow-white/5 ring-1 ring-zinc-800/10 dark:ring-white/20">
            <Video className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              MeetNotes AI
            </h1>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              AI-Powered Meeting Summaries & Central Action Tracker
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-zinc-950/5 text-zinc-900 dark:text-zinc-100 rounded-2xl">
          <CardHeader className="space-y-1.5 text-center pb-2 pt-6">
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Sign In to Your Account
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access meetings and action items
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-4">
              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl transition-all duration-200">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Email Address Input */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-10 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-0"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-medium text-red-500 pl-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Password
                  </Label>
                  <Link
                    href="#"
                    className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-10 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-0"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-medium text-red-500 pl-1">{errors.password.message}</p>
                )}
              </div>
            </CardContent>

            {/* Increased top padding (pt-6) to create more space above button */}
            <CardFooter className="flex flex-col space-y-4 pt-6 pb-6">
              <Button
                type="submit"
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold h-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.2]" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-zinc-900 dark:text-white hover:underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}